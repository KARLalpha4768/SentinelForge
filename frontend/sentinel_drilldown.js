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

        // Make debris rows clickable
        if (tab === 'debris') {
            el.querySelectorAll('.inv-table tbody tr').forEach(row => {
                const name = row.querySelector('td')?.textContent?.trim();
                row.style.cursor = 'pointer';
                row.addEventListener('click', () => openDrilldown(null, name, 'debris'));
                row.addEventListener('mouseover', () => { row.style.background = 'rgba(124,77,255,0.08)'; });
                row.addEventListener('mouseout', () => { row.style.background = ''; });
            });
        }

        // Make diagnostics subsystem rows clickable
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

console.log('[DRILLDOWN] Row drill-down system loaded. Click any table row for details.');
})();
