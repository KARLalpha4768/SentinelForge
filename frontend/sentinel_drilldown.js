/* SentinelForge — Row Drilldown System
 * Makes every table row clickable to show detailed sub-information.
 */
(function(){
'use strict';

// Deep detail data keyed by feed/item ID
const FEED_DETAILS = {
    SPACETRACK: {
        fullName: 'Space-Track.org — 18th Space Defense Squadron',
        operator: 'US Space Force / Combined Space Operations Center (CSpOC)',
        url: 'https://www.space-track.org',
        dataProducts: [
            {name:'GP (General Perturbations) Catalog', format:'JSON/XML/CSV', records:'~46,000 objects', refresh:'Every 8h'},
            {name:'Conjunction Data Messages (CDMs)', format:'CCSDS 508.0-B-1 XML', records:'~12,800/week', refresh:'On event'},
            {name:'Decay/Reentry Predictions', format:'JSON', records:'~50 active', refresh:'Daily'},
            {name:'Launch Conjunction Assessments', format:'CDM', records:'Per launch', refresh:'On event'},
            {name:'Historical TLE Archive', format:'3LE text', records:'Since 1957', refresh:'Append-only'},
        ],
        auth: 'Username/password + API key (free registration)',
        rateLimit: '200 requests/hour, 30 simultaneous',
        integration: 'SentinelForge ingests via scheduled cron (every 8h) + event-driven CDM webhook. Differential sync compares epoch timestamps to avoid re-processing unchanged TLEs.',
        notes: 'Primary authoritative source for unclassified space catalog. Data lag vs operational catalog: ~4-12h. Owner/Operator portal provides direct CDM push notifications.',
        reliability: '99.7% uptime (2025). Planned maintenance windows: Tuesday 0200-0400 UTC.',
    },
    CELESTRAK: {
        fullName: 'CelesTrak — Dr. T.S. Kelso',
        operator: 'CelesTrak.org (independent, formerly AGI/Analytical Graphics)',
        url: 'https://celestrak.org',
        dataProducts: [
            {name:'Supplemental TLEs (Starlink, OneWeb)', format:'3LE/JSON/CSV', records:'~6,200 Starlink', refresh:'Every 4h'},
            {name:'SATCAT (Satellite Catalog)', format:'CSV', records:'~58,000 entries', refresh:'Daily'},
            {name:'GP Element Sets', format:'OMM JSON/XML', records:'~26,000 active', refresh:'Every 4h'},
            {name:'Analyst Satellite TLEs', format:'3LE', records:'~300 classified-proxy', refresh:'Weekly'},
            {name:'Space Weather (via NOAA)', format:'JSON', records:'F10.7, Ap, Kp', refresh:'Hourly'},
        ],
        auth: 'API key (free, rate-limited)',
        rateLimit: '20 requests/minute',
        integration: 'SentinelForge celestrak_ingest.py polls every 4h. Starlink/OneWeb groups ingested separately for mega-constellation tracking. GP data used as fallback when Space-Track is delayed.',
        notes: 'Faster refresh than Space-Track for mega-constellations. Dr. Kelso\'s analyst sats provide proxy TLEs for objects not in public catalog.',
        reliability: '99.9% uptime. Hosted on Cloudflare CDN.',
    },
    SWPC: {
        fullName: 'NOAA Space Weather Prediction Center',
        operator: 'National Oceanic and Atmospheric Administration',
        url: 'https://www.swpc.noaa.gov',
        dataProducts: [
            {name:'F10.7 Solar Radio Flux', format:'JSON', records:'Current + 27-day forecast', refresh:'Every 1min'},
            {name:'Planetary Kp Index', format:'JSON', records:'3-hour windows', refresh:'Every 3h'},
            {name:'Dst (Disturbance Storm Time)', format:'JSON', records:'Hourly', refresh:'Hourly'},
            {name:'Solar Wind (ACE/DSCOVR)', format:'JSON', records:'Real-time', refresh:'1min'},
            {name:'CME/Flare Alerts', format:'JSON/email', records:'Event-driven', refresh:'On event'},
            {name:'Ap Index (daily)', format:'JSON', records:'Daily', refresh:'Daily'},
        ],
        auth: 'Public API — no authentication required',
        rateLimit: 'None (reasonable use policy)',
        integration: 'SentinelForge polls every 60s for F10.7/Kp/Dst. These indices feed directly into the PINN thermospheric density corrector (Module G) for drag estimation. CME alerts trigger automatic conjunction re-screening.',
        notes: 'Critical for LEO drag prediction accuracy. F10.7 spike of +50 sfu can increase drag by 20-40% at ISS altitude, causing significant TLE prediction errors within 24h.',
        reliability: '99.5% uptime. Backup: GFZ Potsdam (Germany) for Kp.',
    },
    'USGS-EOP': {
        fullName: 'IERS Earth Orientation Parameters',
        operator: 'International Earth Rotation and Reference Systems Service',
        url: 'https://www.iers.org',
        dataProducts: [
            {name:'Bulletin A (rapid)', format:'CSV/text', records:'xp, yp, UT1-UTC', refresh:'Weekly'},
            {name:'Bulletin B (final)', format:'CSV/text', records:'Definitive EOP', refresh:'Monthly'},
            {name:'Finals2000A', format:'CSV', records:'1973-present', refresh:'Daily'},
        ],
        auth: 'Public FTP — no authentication',
        integration: 'SentinelForge eop_loader.py fetches daily. Polar motion (xp, yp) corrections applied to ITRF→GCRF frame transformation. UT1-UTC correction critical for sidereal time computation. Without EOP: ~4.5m position error at ISS altitude.',
        notes: 'Built-in fallback data covers 2024-2026 if IERS FTP is unreachable. Binary-search interpolation for sub-arcsecond accuracy.',
    },
    'GNSS-TIME': {
        fullName: 'GPS/GNSS Precision Timing',
        operator: 'US Space Force (GPS) + EU (Galileo) + Russia (GLONASS)',
        dataProducts: [
            {name:'1 PPS (Pulse Per Second)', format:'Electrical signal', records:'Continuous', refresh:'1 Hz'},
            {name:'NMEA Time Messages', format:'ASCII serial', records:'Date/time/position', refresh:'1 Hz'},
            {name:'NTP Stratum-1', format:'NTP protocol', records:'UTC sync', refresh:'Continuous'},
        ],
        integration: 'Each edge node has a GPS-disciplined oscillator (u-blox ZED-F9T). Time-tags all observations to <100ns accuracy. Critical for IOD (Initial Orbit Determination) — 1μs timing error = ~7m along-track at LEO speeds.',
        notes: 'Dual-frequency (L1/L5) receivers for ionospheric correction. Anti-jamming: CRPA antenna + inertial holdover (Rb oscillator backup).',
    },
    ILRS: {
        fullName: 'International Laser Ranging Service',
        operator: 'NASA GSFC / CDDIS',
        dataProducts: [
            {name:'SLR Normal Points', format:'CRD (Consolidated Ranging Data)', records:'~200 passes/day', refresh:'Daily'},
            {name:'Station Coordinates', format:'SINEX', records:'~40 stations', refresh:'Annual'},
        ],
        integration: 'SLR provides sub-cm accuracy positions for calibration satellites (LAGEOS, Starlette). Used to validate SentinelForge orbit determination accuracy — comparison reveals systematic biases in the optical pipeline.',
        notes: 'SLR is the "ground truth" for orbit determination. LAGEOS residuals < 2cm = healthy OD pipeline.',
    },
    EXOANALYTIC: {
        fullName: 'ExoAnalytic Solutions — Electro-Optical Global Telescope Network',
        operator: 'ExoAnalytic Solutions (Los Angeles, CA)',
        dataProducts: [
            {name:'GEO/Deep-Space Astrometry', format:'REST API (JSON)', records:'~12K obs/night', refresh:'Near real-time'},
            {name:'Photometry / Light Curves', format:'JSON', records:'Magnitude + color', refresh:'Per pass'},
            {name:'Maneuver Detection Alerts', format:'Webhook', records:'Event-driven', refresh:'On detection'},
            {name:'Space Object Characterization', format:'PDF/JSON', records:'On request', refresh:'On demand'},
        ],
        auth: 'Commercial API key + contract',
        integration: 'SentinelForge fuses ExoAnalytic obs with USSF catalog for improved GEO state estimation. Light curve data feeds Module A (streak/object classification). Maneuver alerts trigger immediate re-screening.',
        notes: '350+ telescopes across 6 continents. Specializes in GEO characterization — can determine satellite attitude, spin state, and anomalous behavior from photometric signatures.',
    },
    LEOLABS: {
        fullName: 'LeoLabs Phased-Array Radar Network',
        operator: 'LeoLabs Inc. (Menlo Park, CA)',
        dataProducts: [
            {name:'LEO Tracking Data', format:'REST API (JSON)', records:'~8K tracks/day', refresh:'Near real-time'},
            {name:'Conjunction Screening', format:'JSON', records:'Pc + miss distance', refresh:'Continuous'},
            {name:'Debris Tracking (>2cm)', format:'JSON', records:'~15K objects', refresh:'Continuous'},
            {name:'Fragmentation Alerts', format:'Webhook', records:'Event-driven', refresh:'On detection'},
        ],
        auth: 'Commercial API key + contract',
        integration: 'LeoLabs radar data provides rain-or-shine, day-or-night LEO coverage — complementing SentinelForge optical pipeline. Radar tracks used for objects below optical detection threshold (< 10cm).',
        notes: '11 phased-array radars: Midland TX, Kiwi NZ, Costa Rica, Alaska, Western Australia + 6 more. Can track objects down to 2cm in LEO.',
    },
    SLINGSHOT: {
        fullName: 'Slingshot Aerospace / Numerica Corp',
        operator: 'Slingshot Aerospace (Austin, TX)',
        dataProducts: [
            {name:'Optical Observations', format:'REST API (JSON)', records:'~6K obs/night', refresh:'Near real-time'},
            {name:'Daylight Tracking', format:'JSON', records:'Specialized', refresh:'Near real-time'},
            {name:'Seradata SpaceTrak Integration', format:'JSON', records:'Launch/deorbit data', refresh:'Daily'},
        ],
        auth: 'Commercial API key + contract',
        integration: 'SentinelForge is designed for direct integration with the Slingshot sensor network. The 19 active Slingshot stations provide observations that feed into the multi-sensor fusion pipeline.',
        notes: '130+ optical sensors with daylight tracking capability using narrow-band filters. Numerica provides the orbit determination engine.',
    },
    KAFKA: {
        fullName: 'Apache Kafka Message Bus (SentinelForge Internal)',
        operator: 'SentinelForge Ops — Kubernetes Cluster',
        dataProducts: [
            {name:'sf.observations', format:'Avro', records:'Raw obs from edge nodes', refresh:'Continuous'},
            {name:'sf.alerts.conjunction', format:'Avro', records:'CDM-equivalent alerts', refresh:'On event'},
            {name:'sf.alerts.emergency', format:'Avro', records:'EMERGENCY tier alerts', refresh:'On event'},
            {name:'sf.health.edge', format:'Avro', records:'Edge node telemetry', refresh:'Every 5s'},
            {name:'sf.catalog.updates', format:'Avro', records:'State vector updates', refresh:'Continuous'},
            {name:'sf.tasking.schedule', format:'Avro', records:'Telescope schedules', refresh:'On change'},
        ],
        auth: 'mTLS + SASL/SCRAM-SHA-512',
        integration: '3-broker cluster with 12 partitions per topic. Retention: 7 days for obs, 90 days for alerts. Consumer groups: OD-engine, conjunction-screener, dashboard-feeder, archive-writer.',
        notes: 'Exactly-once semantics via idempotent producers + transactional consumers. Compression: Zstandard. Throughput: 25K msgs/min sustained.',
    },
    POSTGIS: {
        fullName: 'PostGIS Spatial Catalog Database',
        operator: 'SentinelForge Ops — PostgreSQL 16 + PostGIS 3.4',
        dataProducts: [
            {name:'catalog.objects', format:'Table', records:'46,238 tracked objects', refresh:'Continuous'},
            {name:'catalog.observations', format:'Table (partitioned by date)', records:'~2M/week', refresh:'Continuous'},
            {name:'catalog.conjunctions', format:'Table', records:'Active + historical', refresh:'On event'},
            {name:'catalog.covariance', format:'Table', records:'6×6 matrices per object', refresh:'Per OD solution'},
        ],
        integration: 'GIST spatial indexes for fast conjunction screening queries. Materialized views for dashboard aggregations. Logical replication to read replicas for analytics.',
        notes: 'Primary persistence layer. pg_partman manages monthly observation partitions. Vacuum tuned for high-write workload.',
    },
    WEBSOCKET: {
        fullName: 'WebSocket Real-Time Dashboard Feed',
        operator: 'FastAPI + uvicorn (SentinelForge Backend)',
        dataProducts: [
            {name:'Panel Updates', format:'JSON', records:'All dashboard gauges', refresh:'Every 5s'},
            {name:'Alert Push', format:'JSON', records:'Toast notifications', refresh:'On event'},
            {name:'Conjunction Updates', format:'JSON', records:'Pc/miss changes', refresh:'On change'},
        ],
        integration: 'FastAPI WebSocket endpoint pushes state diffs to browser. Reconnection with exponential backoff. Heartbeat every 10s.',
    },
    REDIS: {
        fullName: 'Redis In-Memory Cache',
        operator: 'SentinelForge Ops — Redis 7.2 (Cluster mode)',
        dataProducts: [
            {name:'Propagated States', format:'Binary (MessagePack)', records:'46K objects × 6 time steps', refresh:'Every propagation cycle'},
            {name:'Conjunction Screening Results', format:'JSON', records:'Active pairs', refresh:'On screening'},
            {name:'Session Cache', format:'JSON', records:'Dashboard state', refresh:'On interaction'},
        ],
        integration: '3-node cluster with AOF persistence. TTL-based eviction for propagated states (1h). Used by conjunction screener for O(1) state lookups instead of DB queries.',
    },
    'S3-ARCHIVE': {
        fullName: 'S3 Long-Term Archive',
        operator: 'AWS S3 (us-west-2) + Glacier Deep Archive',
        dataProducts: [
            {name:'Observation Archive', format:'Parquet (partitioned)', records:'All historical obs', refresh:'Hourly batch'},
            {name:'Light Curve Library', format:'HDF5', records:'~12K objects with curves', refresh:'Nightly'},
            {name:'TLE History', format:'Parquet', records:'All TLEs since ingest start', refresh:'Daily'},
            {name:'Model Artifacts', format:'.pt / .onnx', records:'Trained ML models', refresh:'On training'},
        ],
        integration: 'Lifecycle policy: S3 Standard (30d) → S3-IA (90d) → Glacier (1yr+). Athena queries for ad-hoc historical analysis.',
    },
};

// Subsystem deep details
const SUBSYSTEM_DETAILS = {
    'Sensor Network': {
        description: 'Global optical + radar sensor network providing 24/7 observation coverage across all orbital regimes.',
        components: ['172 ground stations', '8 sensor networks (USSF, ExoAnalytic, LeoLabs, Slingshot, ESA-SST, ISON, Contributing, LeoLabs)', 'Radar: 29 sites, Optical: 143 sites'],
        metrics: ['Coverage gap: <15 min for LEO objects above 400km', 'Revisit rate: 4.2 passes/day/object (LEO)', 'Detection limit: ~10cm LEO (radar), ~20cm GEO (optical)'],
        technology: 'Mix of RASA 14" astrographs (optical), phased-array S-band radar (LeoLabs), GRAVES bistatic radar (ESA)',
    },
    'Streak Detection Pipeline': {
        description: 'GPU-accelerated streak detection running on NVIDIA Jetson AGX Orin edge nodes at each site.',
        components: ['streak_detect.cu (CUDA C++)', 'TensorRT PINN inference', 'Hough transform + morphological filtering', 'PSF-fitted photometry'],
        metrics: ['Throughput: 12.3 fps average', 'Latency: <80ms frame-to-detection', 'False positive rate: 0.23%', 'GPU utilization: 62% average'],
        technology: 'NVIDIA Jetson AGX Orin 64GB, TensorRT 8.6, CUDA 12.2',
    },
    'Orbit Determination': {
        description: 'Bayesian Initial Orbit Determination (IOD) using Gauss/Herrick-Gibbs methods with extended Kalman filtering.',
        components: ['Gauss IOD (3-observation)', 'Herrick-Gibbs (close observations)', 'Extended Kalman Filter with J2-J6 gravity', 'PINN-accelerated propagation'],
        metrics: ['IOD convergence: 42ms', 'Position accuracy: <500m (LEO, 24h predict)', 'Velocity accuracy: <0.5 m/s', 'Covariance realism: NEES ≈ 3.0'],
        technology: 'Python + C++ (Eigen library), EGM2008 10×10 gravity field, IERS EOP corrections',
    },
};

/* ────── Open Drilldown Modal ────── */
window.openDrilldown = function(itemId, itemName, category) {
    const detail = FEED_DETAILS[itemId] || SUBSYSTEM_DETAILS[itemName];
    if (!detail) {
        // Generic drilldown for items without specific data
        openGenericDrilldown(itemId, itemName, category);
        return;
    }

    const modal = document.getElementById('siteModal');
    const title = document.getElementById('siteModalTitle');
    const body = document.getElementById('siteModalBody');

    title.textContent = detail.fullName || itemName;

    let html = '';

    if (detail.operator) {
        html += `<h3>📋 Operator</h3><p>${detail.operator}</p>`;
    }
    if (detail.url) {
        html += `<p style="font-size:10px;color:#448aff">${detail.url}</p>`;
    }
    if (detail.description) {
        html += `<h3>📖 Description</h3><p>${detail.description}</p>`;
    }

    if (detail.dataProducts) {
        html += `<h3>📦 Data Products (${detail.dataProducts.length})</h3>
        <table><thead><tr><th>Product</th><th>Format</th><th>Volume</th><th>Refresh</th></tr></thead><tbody>` +
        detail.dataProducts.map(p => `<tr>
            <td style="color:#e8eaf6;font-weight:600">${p.name}</td>
            <td><span style="background:rgba(124,77,255,0.15);padding:1px 6px;border-radius:3px;font-size:9px;color:#b388ff">${p.format}</span></td>
            <td>${p.records || ''}</td>
            <td style="color:#78909c">${p.refresh}</td>
        </tr>`).join('') + '</tbody></table>';
    }

    if (detail.components) {
        html += `<h3>🔧 Components</h3><ul style="padding-left:16px">` +
            detail.components.map(c => `<li style="margin:2px 0;font-size:10px">${c}</li>`).join('') + '</ul>';
    }
    if (detail.metrics) {
        html += `<h3>📊 Key Metrics</h3><ul style="padding-left:16px">` +
            detail.metrics.map(m => `<li style="margin:2px 0;font-size:10px;color:#00e5ff">${m}</li>`).join('') + '</ul>';
    }
    if (detail.technology) {
        html += `<h3>💻 Technology</h3><p style="font-size:10px">${detail.technology}</p>`;
    }

    if (detail.auth) {
        html += `<h3>🔐 Authentication</h3><p style="font-size:10px">${detail.auth}</p>`;
    }
    if (detail.rateLimit) {
        html += `<h3>⏱️ Rate Limit</h3><p style="font-size:10px">${detail.rateLimit}</p>`;
    }
    if (detail.integration) {
        html += `<h3>🔗 SentinelForge Integration</h3><p style="font-size:10px;line-height:1.6;color:#b0bec5">${detail.integration}</p>`;
    }
    if (detail.reliability) {
        html += `<h3>📡 Reliability</h3><p style="font-size:10px">${detail.reliability}</p>`;
    }
    if (detail.notes) {
        html += `<h3>📝 Notes</h3><p style="font-size:10px;line-height:1.6;color:#b0bec5">${detail.notes}</p>`;
    }

    body.innerHTML = html;
    modal.style.display = 'flex';
};

function openGenericDrilldown(id, name, category) {
    const modal = document.getElementById('siteModal');
    const title = document.getElementById('siteModalTitle');
    const body = document.getElementById('siteModalBody');
    title.textContent = name || id;

    // Find the item in STATE
    let item = null;
    if (category === 'feed') item = STATE.telemetry.find(t => t.id === id);
    if (category === 'uct') item = STATE.ucts.find(u => u.id === id);
    if (category === 'launch') item = STATE.launches.find(l => l.vehicle === name);
    if (category === 'reentry') item = STATE.reentries.find(r => r.name === name);
    if (category === 'debris') item = STATE.debrisEvents.find(d => d.name === name);

    let html = '';
    if (item) {
        html = '<table>' + Object.entries(item).map(([k,v]) => {
            if (typeof v === 'object') v = JSON.stringify(v, null, 2);
            return `<tr><td style="color:#78909c;font-weight:600;padding-right:16px;white-space:nowrap">${k}</td><td style="color:#e8eaf6">${v}</td></tr>`;
        }).join('') + '</table>';
    } else {
        html = `<p style="color:#78909c">Detailed information for <b>${name || id}</b>. Click sub-items for deeper drill-down.</p>`;
    }
    body.innerHTML = html;
    modal.style.display = 'flex';
}

/* ────── Patch renderInventory to add click handlers ────── */
const _patchInterval = setInterval(() => {
    if (typeof renderInventory !== 'function') return;
    clearInterval(_patchInterval);

    const _origRI = renderInventory;
    renderInventory = function(tab) {
        _origRI(tab);

        const el = document.getElementById('invContent');
        if (!el) return;

        // Make all feed rows clickable
        if (tab === 'feeds') {
            el.querySelectorAll('.inv-table tbody tr').forEach(row => {
                const name = row.querySelector('td')?.textContent?.trim();
                const feed = STATE.telemetry.find(t => t.name === name);
                if (!feed) return;
                row.style.cursor = 'pointer';
                row.title = feed.desc + ' — Click for deep dive';
                row.addEventListener('click', () => openDrilldown(feed.id, feed.name, 'feed'));
                // Hover effect
                row.addEventListener('mouseover', () => { row.style.background = 'rgba(124,77,255,0.08)'; });
                row.addEventListener('mouseout', () => { row.style.background = ''; });
            });
            // Add hint
            const hint = document.createElement('div');
            hint.style.cssText = 'font-size:9px;color:#546e7a;padding:4px 8px;margin-top:4px';
            hint.textContent = '💡 Click any feed row for detailed data products, authentication, rate limits, and integration notes';
            el.appendChild(hint);
        }

        // Make UCT rows clickable
        if (tab === 'uct') {
            el.querySelectorAll('.inv-table tbody tr').forEach(row => {
                const id = row.querySelector('td')?.textContent?.trim();
                row.style.cursor = 'pointer';
                row.addEventListener('click', () => openDrilldown(id, id, 'uct'));
                row.addEventListener('mouseover', () => { row.style.background = 'rgba(124,77,255,0.08)'; });
                row.addEventListener('mouseout', () => { row.style.background = ''; });
            });
        }

        // Make launch rows clickable
        if (tab === 'launches') {
            el.querySelectorAll('.inv-table tbody tr').forEach(row => {
                const cells = row.querySelectorAll('td');
                const vehicle = cells[1]?.textContent?.trim();
                row.style.cursor = 'pointer';
                row.addEventListener('click', () => openDrilldown(null, vehicle, 'launch'));
                row.addEventListener('mouseover', () => { row.style.background = 'rgba(124,77,255,0.08)'; });
                row.addEventListener('mouseout', () => { row.style.background = ''; });
            });
        }

        // Make reentry rows clickable
        if (tab === 'reentries') {
            el.querySelectorAll('.inv-table tbody tr').forEach(row => {
                const name = row.querySelector('td')?.textContent?.trim();
                row.style.cursor = 'pointer';
                row.addEventListener('click', () => openDrilldown(null, name, 'reentry'));
                row.addEventListener('mouseover', () => { row.style.background = 'rgba(124,77,255,0.08)'; });
                row.addEventListener('mouseout', () => { row.style.background = ''; });
            });
        }

        // Make debris rows clickable with rich drilldown
        if (tab === 'debris') {
            el.querySelectorAll('.inv-table tbody tr').forEach(row => {
                const name = row.querySelector('td')?.textContent?.trim();
                row.style.cursor = 'pointer';
                row.title = name + ' — Click for image, threat assessment, and impact analysis';
                row.addEventListener('click', () => openDebrisDrilldown(name));
                row.addEventListener('mouseover', () => { row.style.background = 'rgba(124,77,255,0.08)'; });
                row.addEventListener('mouseout', () => { row.style.background = ''; });
            });
            // Add hint
            const hint = document.createElement('div');
            hint.style.cssText = 'font-size:9px;color:#546e7a;padding:4px 8px;margin-top:4px';
            hint.textContent = '💡 Click any debris event for image, threat assessment, and impact on active space assets';
            el.appendChild(hint);
        }

        // Make launch rows clickable
        if (tab === 'launches') {
            el.querySelectorAll('.inv-table tbody tr').forEach((row, idx) => {
                row.style.cursor = 'pointer';
                row.title = 'Click for vehicle image, payload details, and SSA impact';
                row.addEventListener('click', () => openLaunchDrilldown(idx));
                row.addEventListener('mouseover', () => { row.style.background = 'rgba(124,77,255,0.08)'; });
                row.addEventListener('mouseout', () => { row.style.background = ''; });
            });
        }

        // Make reentry rows clickable
        if (tab === 'reentries') {
            el.querySelectorAll('.inv-table tbody tr').forEach((row, idx) => {
                row.style.cursor = 'pointer';
                row.title = 'Click for reentry details, risk assessment, and ground footprint';
                row.addEventListener('click', () => openReentryDrilldown(idx));
                row.addEventListener('mouseover', () => { row.style.background = 'rgba(124,77,255,0.08)'; });
                row.addEventListener('mouseout', () => { row.style.background = ''; });
            });
        }


        if (tab === 'diagnostics') {
            el.querySelectorAll('[style*="align-items:center;gap:8px;margin-bottom:6px"]').forEach(row => {
                const label = row.querySelector('[style*="color:#e8eaf6"]')?.textContent?.trim();
                row.style.cursor = 'pointer';
                row.addEventListener('click', () => openDrilldown(null, label, 'subsystem'));
                row.addEventListener('mouseover', () => { row.style.background = 'rgba(124,77,255,0.06)'; row.style.borderRadius = '6px'; });
                row.addEventListener('mouseout', () => { row.style.background = ''; });
            });
        }

        // Make escalation roster rows clickable
        if (tab === 'escalation') {
            el.querySelectorAll('.inv-table tbody tr').forEach(row => {
                const role = row.querySelector('td')?.textContent?.trim();
                row.style.cursor = 'pointer';
                row.addEventListener('mouseover', () => { row.style.background = 'rgba(124,77,255,0.08)'; });
                row.addEventListener('mouseout', () => { row.style.background = ''; });
            });
        }
    };

    // Re-render current tab to apply
    const activeTab = document.querySelector('.inv-tab.active');
    if (activeTab) renderInventory(activeTab.dataset.tab);
}, 200);

// ── Network Drill-Down Data ──
const NETWORK_DETAILS = {
    'ExoAnalytic': {
        img: 'img/exoanalytic.png',
        description: 'ExoAnalytic Solutions operates the world\'s largest commercial space surveillance telescope network with 350+ sensors across six continents. Specializing in geosynchronous orbit characterization, their Electro-Optical Global Telescope Network (EGTN) delivers near-real-time astrometry and photometry for deep-space objects. Each telescope runs automated acquisition sequences, capturing light curves that reveal satellite attitude, spin state, and anomalous behavior. Their AI-driven pipeline detects maneuvers within minutes of execution, enabling rapid conjunction re-screening. ExoAnalytic\'s unique value is persistent GEO stare coverage — maintaining custody of high-value assets that optical-only LEO networks cannot track during daylight hours.',
        hq: 'Los Angeles, California',
        founded: '2014',
        sensors: '350+ optical telescopes',
        coverage: 'GEO, MEO, deep space (>2,000 km)',
        keyCapability: 'Photometric characterization — determines satellite attitude, spin, and anomalies from light curves',
        integration: 'REST API → SentinelForge fusion pipeline. Obs fed to Module A (streak classifier) and Module D (conjunction screener).',
    },
    'USSF-SSN': {
        img: 'img/ussf_ssn.png',
        description: 'The US Space Force Space Surveillance Network is the backbone of global space domain awareness, operating 29 radar and optical sensors worldwide under the 18th Space Defense Squadron. Its crown jewel is the Space Fence on Kwajalein Atoll — an S-band phased-array radar capable of tracking objects as small as 5cm in LEO. The SSN maintains the authoritative space catalog of 46,000+ objects, generating General Perturbations (GP) element sets distributed via Space-Track.org. The network provides Conjunction Data Messages (CDMs) for all trackable objects, serving as the primary warning system for collision avoidance across all orbital regimes.',
        hq: 'Vandenberg SFB, California (18th SDS)',
        founded: '1957 (NORAD era)',
        sensors: '29 sites: phased-array radars (Space Fence, PAVE PAWS), mechanical trackers (GEODSS), ground-based electro-optical deep space surveillance',
        coverage: 'All orbital regimes — LEO through cislunar',
        keyCapability: 'Authoritative catalog maintenance — only entity providing full-catalog conjunction screening for all 46K objects',
        integration: 'Space-Track.org REST API (8h cycle) + CDM webhook push for conjunction events.',
    },
    'Slingshot': {
        img: 'img/slingshot.png',
        description: 'Slingshot Aerospace combines 130+ commercial optical sensors with the Numerica orbit determination engine to deliver high-accuracy space domain awareness. Their differentiator is daylight tracking — using narrow-band optical filters to observe satellites against the sunlit sky, eliminating the dawn/dusk gap that limits traditional optical networks. Slingshot\'s Beacon platform fuses observations from proprietary and third-party sensors with AI-driven analytics, providing satellite operators with actionable maneuver recommendations. Their Seradata SpaceTrak integration adds comprehensive launch and deorbit intelligence. Founded in Austin, TX, Slingshot serves both commercial operators and Department of Defense customers.',
        hq: 'Austin, Texas',
        founded: '2017',
        sensors: '130+ optical sensors with narrow-band daylight tracking filters',
        coverage: 'LEO, MEO, GEO — including daylight passes',
        keyCapability: 'Daylight satellite tracking — eliminates the traditional optical observation gap during daytime hours',
        integration: 'REST API → SentinelForge multi-sensor fusion. 19 active Slingshot stations contribute to the SentinelForge observation pipeline.',
    },
    'Contributing': {
        img: 'img/contributing.png',
        description: 'The Contributing Sensor Network aggregates observations from 20+ independent academic, amateur, and government observatories worldwide that share data under bilateral SSA agreements. Contributors range from university research telescopes to citizen-science programs like the ISON-affiliated observers. Each contributing site operates autonomously but feeds standardized TDM (Tracking Data Messages) to the SentinelForge cloud pipeline via secure uplink. While individual sites have limited aperture and coverage, collectively they fill critical geographic gaps — particularly in the Southern Hemisphere and equatorial regions where major networks have sparse presence. Data quality varies; SentinelForge applies automated outlier rejection and cross-validation.',
        hq: 'Distributed (no central HQ)',
        founded: 'Various (aggregated by SentinelForge)',
        sensors: '20+ independent observatories: university domes, robotic telescopes, amateur stations',
        coverage: 'Gap-filling — Southern Hemisphere, equatorial, polar regions',
        keyCapability: 'Geographic diversity — fills coverage holes left by major commercial and government networks',
        integration: 'CCSDS TDM format over secure HTTPS. Automated quality scoring and outlier rejection applied at ingest.',
    },
    'ESA-SST': {
        img: 'img/esa_sst.png',
        description: 'The European Space Agency\'s Space Surveillance and Tracking (SST) programme operates 12 sensors across EU member states, anchored by the GRAVES bistatic radar in France and the Optical Ground Station (OGS) on Tenerife, Canary Islands. ESA-SST provides independent European capability for tracking objects in all orbital regimes, reducing dependency on US Space Force data. Their Fly-Eye telescope — with its novel multi-aperture design — achieves wide-field survey coverage for NEO and debris detection simultaneously. ESA-SST data is exchanged via CCSDS Navigation Data Messages (NDM) and is shared with SentinelForge under the EU SST Consortium framework.',
        hq: 'ESA/ESOC, Darmstadt, Germany',
        founded: '2014 (EU SST Framework)',
        sensors: '12 sensors: GRAVES radar (France), OGS Tenerife (Spain), Fly-Eye (Italy), TIRA radar (Germany), plus optical sites across EU',
        coverage: 'LEO primary (GRAVES radar), GEO (OGS Tenerife), survey (Fly-Eye)',
        keyCapability: 'Independent European SSA — sovereign catalog capability not dependent on US data',
        integration: 'CCSDS NDM format, hourly batch exchange under EU SST Consortium data-sharing agreement.',
    },
    'LeoLabs': {
        img: 'img/leolabs.png',
        description: 'LeoLabs operates 11 phased-array radar installations purpose-built for tracking low-Earth orbit debris down to 2cm — far below the detection threshold of traditional optical sensors. Their radars in Midland TX, Kiwi NZ, Costa Rica, Alaska, and Western Australia provide persistent rain-or-shine coverage unaffected by weather, daylight, or atmospheric seeing. LeoLabs\' differentiator is small-debris detection: their S-band radars resolve fragments from breakup events that optical networks miss entirely. Their automated conjunction screening service provides Pc and miss-distance estimates within minutes of each radar pass, enabling rapid response to emerging collision threats.',
        hq: 'Menlo Park, California',
        founded: '2016',
        sensors: '11 phased-array S-band radars: Midland TX, Kiwi NZ, Costa Rica, Poker Flat AK, Western Australia + 6 more',
        coverage: 'LEO exclusively (200-2,000 km) — all inclinations',
        keyCapability: 'Small debris detection — tracks objects down to 2cm, far below optical detection limits',
        integration: 'REST API → SentinelForge fusion pipeline. Radar data used for sub-10cm objects invisible to optical sensors.',
    },
};

window.openNetworkDrilldown = function(networkName) {
    const detail = NETWORK_DETAILS[networkName];
    if (!detail) return;
    const modal = document.getElementById('siteModal');
    const title = document.getElementById('siteModalTitle');
    const body = document.getElementById('siteModalBody');
    title.textContent = networkName + ' Sensor Network';
    const sites = STATE.sites.filter(s => s.network === networkName);
    const active = sites.filter(s => s.status==='active').length;
    const deg = sites.filter(s => s.status==='degraded').length;
    const off = sites.filter(s => s.status==='offline').length;
    body.innerHTML = `
        <img src="${detail.img}" style="width:100%;border-radius:8px;margin-bottom:12px;max-height:220px;object-fit:cover" alt="${networkName}">
        <h3>📖 Overview</h3><p style="line-height:1.7">${detail.description}</p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:12px 0">
            <div style="background:rgba(0,229,255,0.08);border:1px solid rgba(0,229,255,0.15);border-radius:6px;padding:8px;text-align:center">
                <div style="font-size:20px;font-weight:700;color:#00e5ff">${sites.length}</div><div style="font-size:9px;color:#78909c">Total Sites</div>
            </div>
            <div style="background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.15);border-radius:6px;padding:8px;text-align:center">
                <div style="font-size:20px;font-weight:700;color:#00e676">${active}</div><div style="font-size:9px;color:#78909c">Active</div>
            </div>
        </div>
        <table><tbody>
            <tr><td style="color:#78909c;font-weight:600;padding-right:16px">Headquarters</td><td>${detail.hq}</td></tr>
            <tr><td style="color:#78909c;font-weight:600">Founded</td><td>${detail.founded}</td></tr>
            <tr><td style="color:#78909c;font-weight:600">Sensors</td><td>${detail.sensors}</td></tr>
            <tr><td style="color:#78909c;font-weight:600">Coverage</td><td>${detail.coverage}</td></tr>
            <tr><td style="color:#78909c;font-weight:600">Key Capability</td><td style="color:#00e5ff">${detail.keyCapability}</td></tr>
        </tbody></table>
        <h3>🔗 SentinelForge Integration</h3><p style="font-size:10px;line-height:1.6;color:#b0bec5">${detail.integration}</p>
        <h3>📡 Network Status</h3>
        <div style="font-size:10px;margin-top:4px">
            <span style="color:#00e676">🟢 ${active} Active</span> · 
            <span style="color:#ffab00">🟡 ${deg} Degraded</span> · 
            <span style="color:#ff1744">🔴 ${off} Offline</span>
        </div>
        <div style="margin-top:8px;max-height:200px;overflow-y:auto">
            <table><thead><tr><th>Site</th><th>Location</th><th>Type</th><th>Status</th></tr></thead><tbody>` +
            sites.map(s => {
                const badge = s.status==='active'?'badge-green':s.status==='degraded'?'badge-yellow':'badge-red';
                return `<tr style="cursor:pointer" onclick="openSiteDetail('${s.id}')">
                    <td style="color:#e8eaf6;font-weight:600">${s.id}</td>
                    <td style="font-size:9px">${s.lat.toFixed(1)}°N, ${s.lon.toFixed(1)}°E</td>
                    <td>${s.type}</td>
                    <td><span class="badge ${badge}">${s.status}</span></td></tr>`;
            }).join('') +
        `</tbody></table></div>`;
    modal.style.display = 'flex';
};

// Patch renderSites to make network NAME clickable (not entire card)
const _sitesPatchInterval = setInterval(() => {
    if (typeof renderSites !== 'function') return;
    clearInterval(_sitesPatchInterval);
    const _origRS = renderSites;
    renderSites = function() {
        _origRS();
        document.querySelectorAll('.site-card').forEach(card => {
            const nameEl = card.querySelector('.site-name');
            if (!nameEl) return;
            const net = nameEl.textContent.trim();
            if (!NETWORK_DETAILS[net]) return;
            // Style the name as a link
            nameEl.style.cursor = 'pointer';
            nameEl.style.textDecoration = 'underline';
            nameEl.style.textDecorationColor = 'rgba(124,77,255,0.4)';
            nameEl.style.textUnderlineOffset = '2px';
            nameEl.title = `Click for ${net} deep dive — 100-word overview, image, sites, integration`;
            nameEl.innerHTML = net + ' <span style="font-size:8px;color:#7c4dff;margin-left:2px">▸</span>';
            nameEl.addEventListener('click', (e) => {
                e.stopPropagation();
                openNetworkDrilldown(net);
            });
            nameEl.addEventListener('mouseover', () => { nameEl.style.color = '#b388ff'; });
            nameEl.addEventListener('mouseout', () => { nameEl.style.color = ''; });
        });
    };
    renderSites();
}, 200);

// ── Debris Event Drill-Down ──
const DEBRIS_DETAILS = {
    'FY-1C ASAT (2007)': {
        img: 'img/debris_asat.png',
        threat: 'China\'s kinetic-kill ASAT test created 3,528 fragments at 865 km — the single worst debris-generating event in history. Fragments will persist for decades in sun-synchronous orbit, threatening Earth observation satellites, weather platforms, and ISS resupply vehicles transiting through this altitude band.',
        date: 'January 11, 2007',
        nation: 'People\'s Republic of China',
        weapon: 'SC-19 kinetic kill vehicle (ground-launched)',
        target: 'Fengyun 1C — defunct weather satellite (958 kg)',
        impactSpeed: '~8 km/s (head-on)',
        assetsAtRisk: 'Sentinel-6, NOAA-20, Landsat 9, CryoSat-2, Terra, Aqua — all sun-synchronous LEO',
        longevity: '50-100+ years (high altitude, minimal drag)',
    },
    'Cosmos-Iridium (2009)': {
        img: 'img/debris_collision.png',
        threat: 'The first accidental hypervelocity collision between two intact satellites. Cosmos 2251 (defunct) struck Iridium 33 (active) at 11.7 km/s, producing 2,296 trackable fragments. This event proved the Kessler Syndrome is not theoretical — uncontrolled objects will eventually collide, creating cascading debris fields.',
        date: 'February 10, 2009',
        nation: 'Russia (Cosmos 2251) / USA (Iridium 33)',
        weapon: 'N/A — accidental collision',
        target: 'Cosmos 2251 (defunct, 950 kg) vs Iridium 33 (active, 560 kg)',
        impactSpeed: '11.7 km/s (nearly head-on, crossing orbits)',
        assetsAtRisk: 'Iridium constellation, ISS (required avoidance maneuver), Hubble Space Telescope',
        longevity: '30-80 years (fragments spread across 700-900 km band)',
    },
    'Cosmos 1408 ASAT (2021)': {
        img: 'img/debris_asat.png',
        threat: 'Russia\'s direct-ascent ASAT test destroyed Cosmos 1408 at 480 km, forcing ISS astronauts into emergency shelter. At this altitude, fragments cross the ISS orbit every 90 minutes. Lower altitude means faster decay, but the immediate threat to crewed spaceflight was the most severe of any debris event.',
        date: 'November 15, 2021',
        nation: 'Russian Federation',
        weapon: 'PL-19 Nudol direct-ascent ASAT (Plesetsk launch)',
        target: 'Cosmos 1408 — defunct ELINT satellite (2,200 kg)',
        impactSpeed: '~7 km/s',
        assetsAtRisk: 'ISS (crew sheltered), Chinese Space Station (Tiangong), Starlink, OneWeb — all LEO below 600 km',
        longevity: '5-15 years (lower altitude = faster drag decay)',
    },
    'USA-193 Shootdown (2008)': {
        img: 'img/debris_asat.png',
        threat: 'The US Navy intercepted a failing spy satellite carrying toxic hydrazine propellant before reentry. Unlike other ASAT tests, the low intercept altitude (247 km) ensured all 174 fragments decayed within weeks. This demonstrated responsible debris mitigation — but also confirmed US ASAT capability.',
        date: 'February 21, 2008',
        nation: 'United States of America',
        weapon: 'SM-3 Block IA (RIM-161) from USS Lake Erie (Aegis cruiser)',
        target: 'USA 193 — NRO reconnaissance satellite (failed, 2,300 kg)',
        impactSpeed: '~9.8 km/s',
        assetsAtRisk: 'Minimal — all debris decayed within 40 days due to low altitude intercept',
        longevity: '<40 days (all fragments decayed by April 2008)',
    },
    'India Shakti (2019)': {
        img: 'img/debris_asat.png',
        threat: 'India\'s Mission Shakti demonstrated ASAT capability against a purpose-launched target at 283 km. While the low altitude minimized long-term debris, the test created a brief but real hazard to ISS operations. NASA called it "terrible" — fragments briefly rose above 400 km into ISS altitude.',
        date: 'March 27, 2019',
        nation: 'Republic of India',
        weapon: 'PDV Mk-II kinetic kill vehicle (modified ABM interceptor)',
        target: 'Microsat-R — purpose-launched target (740 kg)',
        impactSpeed: '~10 km/s',
        assetsAtRisk: 'ISS (temporary increased risk), LEO constellations below 400 km',
        longevity: '<1 year (most fragments decayed within months)',
    },
    'Fengyun 4A Breakup (2025)': {
        img: 'img/debris_breakup.png',
        threat: 'An unexplained breakup of Fengyun 4A generated 412 fragments at 720 km — cause remains under investigation (battery failure, propellant leak, or possible micrometeoroid impact). This is SentinelForge\'s most active tracking event, with 389 fragments still being cataloged and correlated. The sun-synchronous altitude threatens critical Earth observation assets.',
        date: 'August 14, 2025',
        nation: 'People\'s Republic of China',
        weapon: 'N/A — cause under investigation',
        target: 'Fengyun 4A — active weather satellite (breakup origin unknown)',
        impactSpeed: 'N/A (spontaneous fragmentation)',
        assetsAtRisk: 'Sun-synchronous constellation: Sentinel-2, Landsat 9, WorldView, NOAA polar orbiters',
        longevity: '20-50 years (similar altitude to FY-1C, long-lived orbital band)',
    },
};

window.openDebrisDrilldown = function(eventName) {
    const detail = DEBRIS_DETAILS[eventName];
    const event = STATE.debrisEvents.find(d => d.name === eventName);
    if (!detail || !event) return;
    const modal = document.getElementById('siteModal');
    const title = document.getElementById('siteModalTitle');
    const body = document.getElementById('siteModalBody');
    title.textContent = eventName;
    const decayPct = Math.round(event.decayed / event.fragments * 100);
    const activePct = Math.round(event.tracked / event.fragments * 100);
    body.innerHTML = `
        <img src="${detail.img}" style="width:100%;border-radius:8px;margin-bottom:12px;max-height:220px;object-fit:cover" alt="${eventName}">
        <div style="font-size:11px;line-height:1.7;color:#e8eaf6;padding:0 4px 12px;border-bottom:1px solid rgba(255,255,255,0.06);margin-bottom:12px">
            <span style="color:${event.color};font-weight:700">⚠ THREAT ASSESSMENT:</span> ${detail.threat}
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">
            <div style="background:rgba(255,23,68,0.08);border:1px solid rgba(255,23,68,0.15);border-radius:6px;padding:8px;text-align:center">
                <div style="font-size:18px;font-weight:700;color:#ff1744">${event.fragments.toLocaleString()}</div>
                <div style="font-size:8px;color:#78909c">Total Fragments</div>
            </div>
            <div style="background:rgba(255,171,0,0.08);border:1px solid rgba(255,171,0,0.15);border-radius:6px;padding:8px;text-align:center">
                <div style="font-size:18px;font-weight:700;color:#ffab00">${event.tracked.toLocaleString()}</div>
                <div style="font-size:8px;color:#78909c">Still Tracked (${activePct}%)</div>
            </div>
            <div style="background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.15);border-radius:6px;padding:8px;text-align:center">
                <div style="font-size:18px;font-weight:700;color:#00e676">${event.decayed.toLocaleString()}</div>
                <div style="font-size:8px;color:#78909c">Decayed (${decayPct}%)</div>
            </div>
        </div>
        <table><tbody>
            <tr><td style="color:#78909c;font-weight:600;width:130px">Date</td><td>${detail.date}</td></tr>
            <tr><td style="color:#78909c;font-weight:600">Nation</td><td>${detail.nation}</td></tr>
            <tr><td style="color:#78909c;font-weight:600">Weapon/Cause</td><td>${detail.weapon}</td></tr>
            <tr><td style="color:#78909c;font-weight:600">Target</td><td>${detail.target}</td></tr>
            <tr><td style="color:#78909c;font-weight:600">Impact Speed</td><td style="color:#ff5252;font-weight:600">${detail.impactSpeed}</td></tr>
            <tr><td style="color:#78909c;font-weight:600">Altitude</td><td>${event.alt} km (${event.inc}° inclination)</td></tr>
            <tr><td style="color:#78909c;font-weight:600">Debris Longevity</td><td style="color:#ffab00">${detail.longevity}</td></tr>
        </tbody></table>
        <h3 style="margin-top:12px">🎯 Assets at Risk</h3>
        <p style="font-size:10px;line-height:1.6;color:#ff8a80">${detail.assetsAtRisk}</p>
        <div style="margin-top:8px;padding:8px;background:rgba(255,23,68,0.05);border:1px solid rgba(255,23,68,0.1);border-radius:6px">
            <div style="font-size:9px;color:#78909c;margin-bottom:4px">DEBRIS DECAY PROGRESS</div>
            <div style="height:14px;background:rgba(255,255,255,0.04);border-radius:4px;overflow:hidden;position:relative">
                <div style="height:100%;width:${decayPct}%;background:linear-gradient(90deg,#00e676,#76ff03);border-radius:4px;transition:width 0.5s"></div>
                <span style="position:absolute;right:6px;top:0;font-size:8px;color:#b0bec5;line-height:14px">${decayPct}% decayed</span>
            </div>
            </div>
        </div>`;
    modal.style.display = 'flex';
};

// ── Launch Vehicle Drill-Down ──
const LAUNCH_DETAILS = {
    'Falcon 9': {
        img: 'img/lv_falcon9.png',
        desc: 'SpaceX\'s workhorse medium-lift rocket — the most-flown orbital vehicle in history. Reusable first stage lands on drone ships, cutting launch costs to ~$2,700/kg. Merlin 1D engines burn RP-1/LOX. Each Starlink mission deploys 23 flat-packed satellites that autonomously raise orbit using krypton ion thrusters.',
        specs: { height:'70 m', diameter:'3.7 m', mass:'549,054 kg', thrust:'7,607 kN (sea level)', stages:'2', propellant:'RP-1 / LOX', reusability:'First stage — RTLS or ASDS', successRate:'99.3% (300+ flights)' },
    },
    'Soyuz-2.1b': {
        img: 'img/lv_soyuz.png',
        desc: 'Russia\'s modernized Soyuz — descendant of Korolev\'s R-7 ICBM, the rocket that launched Sputnik. Digital flight computer replaced analog systems. The four-booster "Korolev Cross" separation is iconic. Fregat upper stage enables complex multi-burn insertion to MEO for GLONASS navigation constellation.',
        specs: { height:'46.3 m', diameter:'2.95 m (core)', mass:'312,000 kg', thrust:'4,147 kN', stages:'3 + Fregat', propellant:'RP-1 / LOX', reusability:'Expendable', successRate:'97.8% (1,900+ R-7 family)' },
    },
    'CZ-5B': {
        img: 'img/lv_cz5b.png',
        desc: 'China\'s heavy-lift rocket for space station modules — the core stage reaches orbit and reenters uncontrolled. At 21 metric tons, it\'s the largest object to regularly make uncontrolled reentry. SSA must track the core stage post-launch for reentry prediction. Each flight generates a major reentry hazard event.',
        specs: { height:'53.7 m', diameter:'5.0 m', mass:'849,000 kg', thrust:'10,565 kN', stages:'1.5 (core + 4 boosters)', propellant:'LH2/LOX (core) + RP-1/LOX (boosters)', reusability:'Expendable — core reaches orbit', successRate:'85.7% (7 flights)' },
    },
    'H3-24L': {
        img: 'img/lv_h3.png',
        desc: 'Japan\'s next-generation launch vehicle replacing the H-IIA. LE-9 engine uses expander bleed cycle — no gas generator, improving reliability. The 24L configuration uses 2 SRBs and long fairing. Carries Japan\'s classified IGS reconnaissance satellites for the Cabinet Satellite Intelligence Center.',
        specs: { height:'63 m', diameter:'5.2 m (fairing)', mass:'574,000 kg', thrust:'8,686 kN (with SRBs)', stages:'2 + 2 SRBs', propellant:'LH2 / LOX', reusability:'Expendable', successRate:'66.7% (3 flights — early program)' },
    },
    'Ariane 6': {
        img: 'img/lv_ariane6.png',
        desc: 'Europe\'s newest launcher — replacing the Ariane 5 for independent European access to space. Vinci upper stage enables multi-burn GTO insertion and direct GEO placement. Launches from Kourou near the equator, maximizing GTO performance. Syracuse 4C is a French military communications satellite.',
        specs: { height:'56 m (A62) / 63 m (A64)', diameter:'5.4 m', mass:'530,000 kg (A62)', thrust:'8,000 kN (with 2 SRBs)', stages:'2 + 2 or 4 P120C SRBs', propellant:'LH2/LOX (core) + solid (SRBs)', reusability:'Expendable', successRate:'100% (2 flights — new program)' },
    },
    'PSLV-C62': {
        img: 'img/lv_pslv.png',
        desc: 'India\'s reliable polar satellite launch vehicle — ISRO\'s proven workhorse with 50+ missions. Four-stage alternating solid/liquid design. The PS4 upper stage can serve as an orbital platform after payload deployment. PSLV launched India\'s Mars Orbiter Mission and Chandrayaan-1 lunar mission.',
        specs: { height:'44 m', diameter:'2.8 m', mass:'320,000 kg', thrust:'4,860 kN (S139 first stage)', stages:'4 (solid-liquid-solid-liquid)', propellant:'HTPB solid + UDMH/N₂O₄ liquid', reusability:'Expendable', successRate:'94.6% (56 flights)' },
    },
};

window.openLaunchDrilldown = function(idx) {
    const l = STATE.launches[idx];
    if (!l) return;
    const detail = LAUNCH_DETAILS[l.vehicle];
    if (!detail) return;
    const modal = document.getElementById('siteModal');
    const title = document.getElementById('siteModalTitle');
    const body = document.getElementById('siteModalBody');
    const d = new Date(l.date);
    const hrs = Math.max(0, Math.round((d - new Date()) / 3600000));
    const statusCol = l.status === 'GO' ? '#00e676' : '#ffab00';

    // Deep-dive data for every clickable field
    const FIELD_DEEP = {
        'Falcon 9': 'First flew 2010. 300+ missions to date. Merlin 1D engines generate 845 kN each (×9 = 7,607 kN). First stage lands vertically on drone ships "Just Read the Instructions" and "Of Course I Still Love You." Fairing halves recovered by net-equipped boats. Holds record for fastest turnaround: 21 days between flights on a single booster. B1062 has flown 19 times.',
        'Soyuz-2.1b': 'Evolution of the R-7 ICBM that launched Sputnik (1957). The Soyuz family has over 1,900 flights — the most-launched rocket design in history. The 2.1b variant adds a digital flight computer and RD-0124 upper stage engine with 359s Isp. Fregat upper stage enables complex multi-burn profiles for MEO/HEO insertion.',
        'CZ-5B': 'China\'s heaviest operational rocket. Unlike CZ-5 (with a restartable upper stage), the CZ-5B has NO upper stage — the core itself reaches orbital velocity, then reenters uncontrolled. This design choice has drawn international criticism. The 5m-diameter core uses YF-77 LH2/LOX engines (vacuum Isp: 430s). Four 3.35m boosters use YF-100 kerolox engines.',
        'H3-24L': 'JAXA\'s next-gen launcher replacing H-IIA after 2001-2024 service. LE-9 engine uses an expander bleed cycle — coolant heated by the combustion chamber drives the turbopumps, eliminating the gas generator and reducing failure modes. First flight (2023) failed due to second-stage ignition issue. Configuration "24L" = 2 SRBs + 4m long fairing.',
        'Ariane 6': 'Developed by ArianeGroup (Airbus/Safran JV) to restore European launch independence. A62 variant (2 SRBs) for government missions; A64 (4 SRBs) for heavy GTO payloads. Vinci upper stage engine restarts up to 4 times in flight, enabling direct GEO insertion and complex multi-manifest missions. First flight July 2024.',
        'PSLV-C62': 'ISRO\'s most reliable vehicle — 53 of 56 missions successful. Unique 4-stage alternating design: S139 solid → Vikas liquid → S7 solid → L-2-5 liquid. PS4 (4th stage) can operate as an orbital platform for months after payload separation. PSLV set the record: 104 satellites deployed on a single mission (PSLV-C37, 2017).',
    };
    const PAYLOAD_DEEP = {
        'Starlink Group 12-8 (23 sats)': '23 Starlink v2-Mini satellites, each ~800 kg. Flat-pack deployed at 300 km, then autonomously raise orbit to 550 km using krypton Hall-effect thrusters over 3-4 weeks. Each sat provides ~20 Gbps throughput via Ka/Ku-band phased arrays. Laser inter-satellite links (ISL) enable mesh routing without ground relays. Constellation target: 12,000 operational satellites.',
        'GLONASS-K2 No.8': 'Next-generation Russian navigation satellite replacing aging GLONASS-M fleet. Unpressurized bus (vs pressurized GLONASS-M) extends design life to 10 years. Broadcasts L1, L2, L3 signals with CDMA modulation for improved accuracy (1.4m CEP). Mass: ~1,600 kg. Augments Russia\'s 24-satellite GLONASS constellation for global PNT capability.',
        'Wentian-2 Lab Module': 'Second laboratory module for China\'s Tiangong space station. ~23 metric tons, 17.9m length. Contains experiment racks for materials science, fluid physics, and biotechnology. External payload platform for space exposure experiments. Docks to Tianhe core module via a Chinese Docking Mechanism (CDM). Pressurized volume: ~118 m³.',
        'Transporter-14 (rideshare)': 'SpaceX\'s dedicated smallsat rideshare mission. ~40 payloads from commercial, government, and academic customers. Uses ESPA Grande and Exolaunch deployers. SSO orbit enables Earth observation missions. Typical manifest includes 6U-12U CubeSats, microsats up to 300 kg, and hosted payloads. Price: ~$5,500/kg to SSO.',
        'IGS Radar-8': 'Japan\'s classified Intelligence Gathering Satellite — synthetic aperture radar (SAR) reconnaissance. Operated by Cabinet Satellite Intelligence Center (CSICE), not JAXA. Resolution estimated at <1m. Provides all-weather, day/night imaging of North Korean missile sites and Chinese naval bases. Part of a 4+ satellite IGS constellation.',
        'Syracuse 4C (mil-sat)': 'French military SATCOM satellite for the Direction Générale de l\'Armement (DGA). Provides secure, jam-resistant X-band and Ka-band communications for French armed forces and NATO allies. Designed life: 15 years in GEO. Syracuse 4 system uses anti-jamming steerable spot beams and onboard processing for theater operations.',
        'EOS-08 (Earth obs)': 'ISRO Earth Observation Satellite with electro-optical and thermal infrared payloads. Targets disaster monitoring, agriculture assessment, and urban heat island mapping. Uses ISRO\'s new Microsat-IMS bus platform (~180 kg). SSO orbit provides consistent solar illumination for calibrated imagery. Designed life: 5 years.',
    };
    const SITE_DEEP = {
        'CCSFS LC-40': 'Cape Canaveral Space Force Station, Launch Complex 40. Located on the Florida Atlantic coast (28.56°N, 80.58°W). Originally built for Titan III/IV. Rebuilt by SpaceX after a 2016 AMOS-6 explosion destroyed the pad. SpaceX\'s primary East Coast pad. Azimuth range supports 28.5°-57° inclinations. Adjacent to LC-39A (NASA/SpaceX Crew Dragon pad).',
        'Plesetsk': 'Plesetsk Cosmodrome (62.93°N, 40.68°W), Russia\'s primary military launch site. 800 km north of Moscow in Arkhangelsk Oblast. High latitude supports polar and sun-synchronous orbits but penalizes GTO performance. Over 1,600 launches since 1966. Houses Soyuz, Angara, and Rokot launch pads. Surrounded by boreal forest.',
        'Wenchang': 'Wenchang Spacecraft Launch Site, Hainan Island (19.61°N, 110.95°E). China\'s newest and most southerly spaceport, opened 2016. Low latitude (19°N) maximizes payload to GTO/GEO. Two launch pads support CZ-5, CZ-7, and CZ-8. Coastal location enables sea transport of large rocket stages. Adjacent commercial spaceport under construction.',
        'Vandenberg SLC-4E': 'Vandenberg Space Force Base, Space Launch Complex 4E (34.63°N, 120.61°W). Located on the California coast, supporting polar and sun-synchronous orbits southward over the Pacific. SpaceX\'s West Coast pad for SSO and national security missions. Originally built for Titan IIID reconnaissance satellite launches.',
        'Tanegashima': 'Tanegashima Space Center, Kagoshima Prefecture (30.37°N, 131.00°E). JAXA\'s primary launch facility on a subtropical island. Known as "the most beautiful rocket launch site in the world." Yoshinobu Launch Complex hosts H3 and H-IIA. Due to local fishing agreements, launches were historically restricted to two annual windows.',
        'Kourou ELA-4': 'Guiana Space Centre, Ensemble de Lancement Ariane 4 (5.24°N, 52.77°W). Located in French Guiana near the equator — the lowest-latitude orbital launch site. Equatorial location provides maximum velocity boost (463 m/s) for GTO missions. ELA-4 is Ariane 6\'s dedicated pad, featuring a mobile gantry and cryogenic propellant systems.',
        'Sriharikota': 'Satish Dhawan Space Centre, Sriharikota (13.72°N, 80.23°E). ISRO\'s primary launch complex on a barrier island in the Bay of Bengal, Andhra Pradesh. Two launch pads (FLP and SLP) support PSLV, GSLV, and LVM3. Eastern azimuth launches over the Bay of Bengal. Range includes India\'s only solid propellant plant.',
    };
    const OPERATOR_DEEP = {
        'SpaceX': 'Space Exploration Technologies Corp. Founded 2002 by Elon Musk. Headquarters: Hawthorne, CA. First private company to send humans to ISS (Crew Dragon, 2020). Operates Falcon 9, Falcon Heavy, and developing Starship. Starlink constellation generates primary revenue. Valued at ~$180B (2025). Launch cadence: ~100 missions/year.',
        'Roscosmos': 'Russian Federal Space Agency. Successor to Soviet space program. Headquarters: Moscow. Operates Baikonur (Kazakhstan), Plesetsk, and Vostochny cosmodromes. Primary vehicles: Soyuz-2, Proton-M, Angara. Sole provider of ISS crew transport 2011-2020 (Soyuz). Sanctions since 2022 have reduced Western commercial launches to zero.',
        'CNSA': 'China National Space Administration. Government agency under SASTIND. Headquarters: Beijing. Operates Jiuquan, Taiyuan, Xichang, and Wenchang launch sites. Vehicles: CZ-2/3/4/5/6/7/8/11. Achieved: lunar sample return (Chang\'e 5), Mars rover (Zhurong), space station (Tiangong). Growing at ~50 launches/year.',
        'JAXA': 'Japan Aerospace Exploration Agency. Formed 2003 from merger of ISAS, NAL, and NASDA. Headquarters: Tsukuba. Vehicles: H3, Epsilon. Achievements: Hayabusa asteroid sample return, Kaguya lunar orbiter, SLIM precision lander. Budget: ~$1.5B/year. Developing HTV-X cargo vehicle for ISS and future lunar Gateway.',
        'ArianeGroup': 'Joint venture of Airbus Defence & Space (50%) and Safran (50%). Headquarters: Paris. Prime contractor for Ariane 6 and support for Ariane 5 legacy. Also develops M51 submarine-launched ballistic missile for French nuclear deterrent. Annual revenue: ~€3.3B. ~8,300 employees across France and Germany.',
        'ISRO': 'Indian Space Research Organisation. Government agency under Department of Space. Headquarters: Bengaluru. Vehicles: PSLV, GSLV Mk II, LVM3. Achievements: Mars Orbiter Mission (2014, first attempt), Chandrayaan-3 lunar landing (2023). Known for extreme cost efficiency: Mangalyaan cost $74M. ~16,000 employees.',
    };
    const ORBIT_DEEP = {
        'LEO 550km 53°': 'Low Earth Orbit at 550 km altitude, 53° inclination. This is the primary Starlink shell — optimized for coverage of populated latitudes (53°N to 53°S). Orbital period: ~95.6 minutes. Velocity: ~7.59 km/s. At this altitude, atmospheric drag is minimal, providing ~5 year orbit lifetime without station-keeping.',
        'MEO 19,100km 64.8°': 'Medium Earth Orbit at 19,100 km, 64.8° inclination. Standard GLONASS operational orbit — three orbital planes with 8 satellites each, ensuring 24/7 global navigation coverage. Orbital period: ~11.25 hours. Each satellite completes ~2.14 orbits per day. MEO provides optimal balance between coverage geometry and signal strength.',
        'LEO 390km 41.5°': 'Low Earth Orbit at 390 km, 41.5° inclination. Chinese Space Station (Tiangong) operational orbit. Low inclination optimizes payload capacity from Wenchang (19°N). Orbital period: ~92.3 minutes. ISS orbits at similar altitude (408 km) but higher inclination (51.6°) to accommodate Russian launch sites.',
        'SSO 525km 97.5°': 'Sun-Synchronous Orbit at 525 km, 97.5° inclination. The orbital plane precesses at exactly 1°/day to maintain constant sun angle — ideal for Earth observation and remote sensing payloads. The Transporter rideshare deploys dozens of small satellites into this highly popular orbit regime.',
        'SSO 500km': 'Sun-Synchronous Orbit at 500 km. Classified IGS reconnaissance orbit — exact inclination undisclosed but approximately 97.4°. Lower altitude than typical SSO provides higher ground resolution for SAR imaging. Orbital period: ~94.6 minutes, providing ~15 ground tracks per day over target areas.',
        'GTO→GEO': 'Geostationary Transfer Orbit to Geostationary Orbit. Initial injection: ~250 × 35,786 km. The satellite\'s own apogee motor circularizes at GEO (35,786 km). At GEO, the satellite orbits at exactly Earth\'s rotation rate, appearing stationary over one ground point. Ideal for communications, weather, and missile warning.',
        'LEO 475km 97.4°': 'Sun-Synchronous Orbit at 475 km, 97.4° inclination. Standard Earth observation altitude — balances resolution, coverage swath, and orbit lifetime. ISRO\'s EOS satellites typically operate in 10:30 AM descending node SSO, providing consistent morning illumination for optical imaging.',
    };
    const SPEC_DEEP = {
        'height': 'Total vehicle height from base of first stage to tip of payload fairing. Determines vertical clearance requirements at the launch pad and imposes structural stiffness constraints — taller rockets experience greater bending loads during max-Q (maximum aerodynamic pressure, typically 60-80 seconds after liftoff).',
        'diameter': 'Core stage outer diameter. Constrained by manufacturing capability and ground transportation limits (US: 3.7m road/rail; China: 5.0m sea transport). Larger diameter enables higher propellant volume and thrust — CZ-5B\'s 5m core was China\'s breakthrough to heavy-lift capability.',
        'mass': 'Gross liftoff mass including propellant, structure, and payload. Falcon 9 achieves ~22:1 mass ratio (propellant:dry mass). Every kg saved in structure enables ~1 kg more payload. Cryogenic propellants (LH2/LOX) boil off at ~0.1%/hour, requiring precise load-and-launch timing.',
        'thrust': 'Combined sea-level thrust of all first-stage engines. Must exceed vehicle weight by 20-40% (thrust-to-weight ratio 1.2-1.4) for safe liftoff. Too low = slow ascent, gravity losses; too high = excessive aerodynamic loads. Engines throttle back at max-Q, then throttle up for landing (Falcon 9).',
        'stages': 'Number of propulsive stages. Each stage separation event is a critical failure point. Two-stage vehicles (Falcon 9, Ariane 6) are simpler but require high-performance upper stages. PSLV\'s four stages alternate solid/liquid for optimal mass fraction at each altitude.',
        'propellant': 'Fuel and oxidizer combination. RP-1/LOX (kerosene) is dense and storable but lower Isp (~311s). LH2/LOX is highest Isp (~450s) but very low density, requiring large tanks. Solid propellants (HTPB) are simplest but cannot be throttled or shut down. Hypergolics (UDMH/N₂O₄) ignite on contact — ideal for upper stages.',
        'reusability': 'Whether stages are recovered for reflight. SpaceX pioneered propulsive landing (2015). Booster recovery saves ~$30M per flight. Fairings save ~$6M each. Recovery imposes ~30% payload penalty (fuel reserved for landing). No other operational vehicle currently recovers first stages, though multiple programs are in development.',
        'successRate': 'Historical mission success percentage. Mature vehicles (Soyuz: 97.8%, PSLV: 94.6%) have extensive flight heritage. New vehicles (H3, Ariane 6) have limited data. Success rate below 90% is generally unacceptable for commercial insurance. Military/government payloads may accept higher risk for strategic capability.',
    };

    const clickRow = (label, value, deepKey, deepData) => {
        const deep = deepData[deepKey] || deepData[value] || '';
        if (!deep) return `<tr><td style="color:#78909c;font-weight:600;width:130px">${label}</td><td>${value}</td></tr>`;
        return `<tr class="lv-drill" style="cursor:pointer" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'table-row':'none'" title="Click for details">
            <td style="color:#78909c;font-weight:600;width:130px">${label} <span style="color:#7c4dff;font-size:8px">▶</span></td>
            <td style="color:#00e5ff;text-decoration:underline;text-decoration-color:rgba(0,229,255,0.3)">${value}</td>
        </tr>
        <tr style="display:none"><td colspan="2" style="padding:8px 12px;background:rgba(124,77,255,0.06);border-left:2px solid #7c4dff;font-size:10px;line-height:1.7;color:#b0bec5">${deep}</td></tr>`;
    };

    title.textContent = `${l.vehicle} — ${l.payload}`;
    body.innerHTML = `
        <img src="${detail.img}" style="width:100%;border-radius:8px;margin-bottom:12px;max-height:220px;object-fit:cover" alt="${l.vehicle}">
        <div style="font-size:11px;line-height:1.7;color:#e8eaf6;padding:0 4px 12px;border-bottom:1px solid rgba(255,255,255,0.06);margin-bottom:12px">${detail.desc}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">
            <div style="background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.15);border-radius:6px;padding:8px;text-align:center">
                <div style="font-size:14px;font-weight:700;color:${statusCol}">${l.status}</div>
                <div style="font-size:8px;color:#78909c">Launch Status</div>
            </div>
            <div style="background:rgba(0,229,255,0.08);border:1px solid rgba(0,229,255,0.15);border-radius:6px;padding:8px;text-align:center">
                <div style="font-size:14px;font-weight:700;color:#00e5ff">T-${hrs}h</div>
                <div style="font-size:8px;color:#78909c">Countdown</div>
            </div>
            <div style="background:rgba(255,215,64,0.08);border:1px solid rgba(255,215,64,0.15);border-radius:6px;padding:8px;text-align:center">
                <div style="font-size:12px;font-weight:700;color:#ffd740">${l.orbit.split(' ')[0]}</div>
                <div style="font-size:8px;color:#78909c">Target Orbit</div>
            </div>
        </div>
        <h3>🚀 Mission Details <span style="font-size:9px;color:#546e7a;font-weight:400">— click any row for deep dive</span></h3>
        <table><tbody>
            ${clickRow('Vehicle', l.vehicle, l.vehicle, FIELD_DEEP)}
            ${clickRow('Payload', l.payload, l.payload, PAYLOAD_DEEP)}
            ${clickRow('Launch Site', l.site, l.site, SITE_DEEP)}
            ${clickRow('Operator', l.owner, l.owner, OPERATOR_DEEP)}
            ${clickRow('Target Orbit', l.orbit, l.orbit, ORBIT_DEEP)}
            <tr><td style="color:#78909c;font-weight:600;width:130px">Window (UTC)</td><td style="font-family:JetBrains Mono,mono">${l.date}</td></tr>
        </tbody></table>
        <h3>📐 Vehicle Specifications <span style="font-size:9px;color:#546e7a;font-weight:400">— click any row for deep dive</span></h3>
        <table><tbody>
            ${Object.entries(detail.specs).map(([k,v]) => clickRow(k.replace(/([A-Z])/g, ' $1'), v, k, SPEC_DEEP)).join('')}
        </tbody></table>
        <h3>🛰️ SSA Impact</h3>
        <div style="font-size:10px;line-height:1.6;color:#b0bec5;padding:8px;background:rgba(0,229,255,0.04);border:1px solid rgba(0,229,255,0.08);border-radius:6px">
            <b style="color:#00e5ff">New catalog objects:</b> This launch will inject ${l.payload.includes('23 sats') ? '23 satellites + 1 upper stage' : l.payload.includes('rideshare') ? '~40 payloads + deployment hardware' : l.payload.includes('Lab Module') ? '1 module + CZ-5B core stage (uncontrolled reentry object)' : '1 payload + upper stage'} into ${l.orbit}. SentinelForge will auto-detect and catalog new objects within 24 hours via Space Fence and ground network correlation.
        </div>`;
    modal.style.display = 'flex';
};

// ── Reentry Drill-Down ──
window.openReentryDrilldown = function(idx) {
    const r = STATE.reentries[idx];
    if (!r) return;
    const modal = document.getElementById('siteModal');
    const title = document.getElementById('siteModalTitle');
    const body = document.getElementById('siteModalBody');
    const riskCol = r.risk === 'HIGH' ? '#ff1744' : r.risk === 'MEDIUM' ? '#ffab00' : '#00e676';
    const imgMap = { 'Rocket Body': 'img/sat_rocket_body.png', 'Debris': 'img/debris_asat.png', 'Payload': 'img/sat_iridium.png' };
    const descMap = {
        'CZ-5B R/B (2026-028B)': 'Spent core stage of a Chinese Long March 5B — 22.5 metric tons of aluminum and steel reentering uncontrolled. Up to 40% of mass may survive to ground impact. Reentry footprint spans the entire tropics. This is the single highest-risk uncontrolled reentry in the current prediction window.',
        'COSMOS 2551 DEB': 'Small debris fragment from a Russian military satellite. At 120 kg, complete atmospheric burnup is expected. Poses negligible ground risk but must be tracked to confirm destruction and remove from the active catalog.',
        'Starlink-2841': 'SpaceX Starlink satellite performing controlled deorbit via krypton ion thruster. The satellite will lower its perigee to ~150 km, ensuring rapid atmospheric entry and complete burnup. This is a textbook example of responsible end-of-life disposal.',
        'Iridium 47 (defunct)': 'Defunct first-generation Iridium satellite. At 689 kg with a titanium frame, significant fragments will survive reentry. Near-polar orbit means the ground track covers almost the entire globe. Reentry prediction uncertainty is ±48 hours — the largest window in the current queue.',
    };
    title.textContent = `⚠ Reentry — ${r.name}`;
    body.innerHTML = `
        <img src="${imgMap[r.type] || 'img/sat_rocket_body.png'}" style="width:100%;border-radius:8px;margin-bottom:12px;max-height:200px;object-fit:cover" alt="${r.name}">
        <div style="font-size:11px;line-height:1.7;color:#e8eaf6;padding:0 4px 12px;border-bottom:1px solid rgba(255,255,255,0.06);margin-bottom:12px">${descMap[r.name] || r.note}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-bottom:12px">
            <div style="background:${riskCol}12;border:1px solid ${riskCol}30;border-radius:6px;padding:8px;text-align:center">
                <div style="font-size:16px;font-weight:700;color:${riskCol}">${r.risk}</div>
                <div style="font-size:8px;color:#78909c">Ground Risk</div>
            </div>
            <div style="background:rgba(255,171,0,0.08);border:1px solid rgba(255,171,0,0.15);border-radius:6px;padding:8px;text-align:center">
                <div style="font-size:14px;font-weight:700;color:#ffab00">${(r.mass/1000).toFixed(1)} t</div>
                <div style="font-size:8px;color:#78909c">Dry Mass</div>
            </div>
            <div style="background:rgba(0,229,255,0.08);border:1px solid rgba(0,229,255,0.15);border-radius:6px;padding:8px;text-align:center">
                <div style="font-size:14px;font-weight:700;color:#00e5ff">${r.uncertainty}</div>
                <div style="font-size:8px;color:#78909c">Window</div>
            </div>
        </div>
        <table><tbody>
            <tr><td style="color:#78909c;font-weight:600;width:140px">NORAD ID</td><td style="font-family:JetBrains Mono,mono">${r.norad}</td></tr>
            <tr><td style="color:#78909c;font-weight:600">Object Type</td><td>${r.type}</td></tr>
            <tr><td style="color:#78909c;font-weight:600">Predicted Date</td><td style="font-weight:700;color:#e8eaf6">${r.predictedDate}</td></tr>
            <tr><td style="color:#78909c;font-weight:600">Uncertainty</td><td style="color:#ffab00">${r.uncertainty}</td></tr>
            <tr><td style="color:#78909c;font-weight:600">Ground Footprint</td><td style="color:#ff8a80">${r.footprint}</td></tr>
            <tr><td style="color:#78909c;font-weight:600">Survival Estimate</td><td>${r.mass > 5000 ? '<span style="color:#ff1744;font-weight:700">30-40% mass survives — ground impact likely</span>' : r.mass > 500 ? '<span style="color:#ffab00">Partial survival — titanium/steel components</span>' : '<span style="color:#00e676">Full burnup expected</span>'}</td></tr>
        </tbody></table>
        <div style="margin-top:10px;padding:8px;background:rgba(255,23,68,0.05);border:1px solid rgba(255,23,68,0.1);border-radius:6px;font-size:10px;color:#b0bec5">
            <b style="color:#ff8a80">📡 Tracking:</b> ${r.note}. SentinelForge is monitoring this object via LeoLabs and USSF-SSN radar. Reentry predictions update every orbit pass (~90 min).
        </div>`;
    modal.style.display = 'flex';
};

console.log('[DRILLDOWN] Row + network + debris + launch + reentry drill-down system loaded.');
})();
