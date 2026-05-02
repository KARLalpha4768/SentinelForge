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

console.log('[DRILLDOWN] Row + network drill-down system loaded.');
})();
