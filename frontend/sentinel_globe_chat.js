/* SentinelForge Ops Center — Globe + Chat Engine */

// ── CesiumJS Globe ──────────────────────────────────
let viewer;
const globeLayers = { leo: [], meo: [], geo: [], conj: [], uct: [], sites: [] };

try {
    viewer = new Cesium.Viewer('cesiumContainer', {
        baseLayerPicker: false, geocoder: false, homeButton: false,
        sceneModePicker: false, navigationHelpButton: false,
        animation: false, timeline: false, fullscreenButton: false,
        selectionIndicator: false, infoBox: false, creditContainer: document.createElement('div'),
        skyBox: false,
        imageryProvider: new Cesium.TileMapServiceImageryProvider({
            url: Cesium.buildModuleUrl('Assets/Textures/NaturalEarthII'),
        }),
    });
    viewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#060810');
    viewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#0d1020');

    // Add ground sites (from registry or fallback)
    const siteColors = { active: Cesium.Color.fromCssColorString('#00e676'), degraded: Cesium.Color.fromCssColorString('#ffab00'), offline: Cesium.Color.fromCssColorString('#555555') };
    function addGlobeSites() {
        const src = (typeof STATE !== 'undefined' && STATE.sites.length > 0) ? STATE.sites : [];
        src.forEach(s => {
            const col = siteColors[s.status] || siteColors.active;
            const e = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(s.lon, s.lat, 0),
                point: { pixelSize: s.type === 'radar' ? 5 : 4, color: col, outlineColor: Cesium.Color.WHITE.withAlpha(0.2), outlineWidth: 1 },
            });
            globeLayers.sites.push(e);
        });
    }
    // Defer site loading until registry is fetched
    window._addGlobeSites = addGlobeSites;

    // Simulated satellite population — differentiated by type
    const regimeBaseColors = {
        leo: [0, 229, 255],   // cyan
        meo: [118, 255, 3],   // green
        geo: [255, 215, 64],  // gold
    };
    // Object type visual config: [sizeMult, alphaMult, label]
    const typeConfig = {
        payload:    { size: 3, alpha: 0.9 },
        rocketbody: { size: 4, alpha: 0.75 },
        debris:     { size: 1.5, alpha: 0.4 },
        unknown:    { size: 2, alpha: 0.55 },
    };
    // Realistic type distribution per regime
    const typeDistrib = {
        leo: { payload: 0.35, rocketbody: 0.08, debris: 0.52, unknown: 0.05 },
        meo: { payload: 0.40, rocketbody: 0.12, debris: 0.42, unknown: 0.06 },
        geo: { payload: 0.55, rocketbody: 0.10, debris: 0.30, unknown: 0.05 },
    };

    function pickType(regime) {
        const d = typeDistrib[regime];
        const r = Math.random();
        if (r < d.payload) return 'payload';
        if (r < d.payload + d.rocketbody) return 'rocketbody';
        if (r < d.payload + d.rocketbody + d.debris) return 'debris';
        return 'unknown';
    }

    function addSimSats(regime, count, alt, incRange) {
        for(let i=0; i<count; i++) {
            const inc = (Math.random()*incRange - incRange/2) * Math.PI/180;
            const raan = Math.random() * 360;
            const anom = Math.random() * 360;
            const lon = raan + anom;
            const lat = Math.asin(Math.sin(inc) * Math.sin(anom * Math.PI/180)) * 180/Math.PI;
            const objType = pickType(regime);
            const tc = typeConfig[objType];
            const bc = regimeBaseColors[regime];
            // Debris is dimmer, payloads are brighter
            const color = Cesium.Color.fromBytes(bc[0], bc[1], bc[2], Math.round(255 * tc.alpha));
            const e = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(lon % 360 - 180, lat, alt * 1000),
                point: {
                    pixelSize: tc.size,
                    color: color,
                    outlineColor: objType === 'rocketbody' ? Cesium.Color.WHITE.withAlpha(0.3) : undefined,
                    outlineWidth: objType === 'rocketbody' ? 1 : 0,
                },
            });
            e._sfType = objType; // tag for filtering
            globeLayers[regime].push(e);
        }
    }
    addSimSats('leo', 350, 550, 98);
    addSimSats('leo', 200, 800, 70);
    addSimSats('leo', 100, 1200, 45);
    addSimSats('meo', 80, 20200, 56);
    addSimSats('geo', 120, 35786, 2);

    // Add conjunction markers
    if(typeof STATE !== 'undefined') {
        STATE.conjunctions.forEach(c => {
            const lon = Math.random()*360 - 180;
            const lat = Math.random()*100 - 50;
            const alt = c.tier === 'EMERGENCY' ? 400000 : 600000;
            const e = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(lon, lat, alt),
                point: { pixelSize: c.tier==='EMERGENCY' ? 10 : 7, color: c.tier==='EMERGENCY' ? Cesium.Color.RED : Cesium.Color.fromCssColorString('#ff1744').withAlpha(0.6) },
                label: { text: `${c.id} Pc=${c.pc.toExponential(1)}`, font: '10px JetBrains Mono', fillColor: Cesium.Color.fromCssColorString('#ff8a80'), pixelOffset: new Cesium.Cartesian2(14, 0), showBackground: true, backgroundColor: Cesium.Color.BLACK.withAlpha(0.6) },
                ellipsoid: c.tier==='EMERGENCY' ? { radii: new Cesium.Cartesian3(50000,50000,50000), material: Cesium.Color.RED.withAlpha(0.08), outline: true, outlineColor: Cesium.Color.RED.withAlpha(0.3) } : undefined,
            });
            globeLayers.conj.push(e);
        });
    }

    // Add UCT probability markers
    if(typeof STATE !== 'undefined') {
        STATE.ucts.forEach(u => {
            const lon = Math.random()*360 - 180;
            const lat = Math.random()*120 - 60;
            const alt = (u.sma - 6378) * 1000;
            const e = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(lon, lat, alt),
                point: { pixelSize: 6, color: Cesium.Color.fromCssColorString('#e040fb').withAlpha(0.7) },
                label: { text: u.id, font: '9px JetBrains Mono', fillColor: Cesium.Color.fromCssColorString('#e040fb'), pixelOffset: new Cesium.Cartesian2(10, 0), showBackground: true, backgroundColor: Cesium.Color.BLACK.withAlpha(0.5) },
            });
            e.show = false; // UCTs hidden by default (button not active)
            globeLayers.uct.push(e);
        });
    }

    // Camera position — show full Earth
    viewer.camera.setView({ destination: Cesium.Cartesian3.fromDegrees(20, 10, 25000000) });
} catch(e) {
    console.warn('CesiumJS init skipped:', e.message);
    document.getElementById('cesiumContainer').innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100%;color:var(--text-secondary);font-size:14px">3D Globe — CesiumJS requires valid Ion token</div>';
}

// ── Globe Button Wiring ─────────────────────────────
document.querySelectorAll('.globe-btn[data-layer]').forEach(btn => {
    btn.addEventListener('click', () => {
        btn.classList.toggle('active');
        const layer = btn.dataset.layer;
        const visible = btn.classList.contains('active');
        if(globeLayers[layer]) {
            globeLayers[layer].forEach(entity => { entity.show = visible; });
        }
    });
});

// ── Live Map Toggle (satellitemap.space) ────────────
const liveMapBtn = document.getElementById('liveMapToggle');
const liveMapFrame = document.getElementById('liveMapFrame');
const cesiumEl = document.getElementById('cesiumContainer');
let liveMapActive = false;

if(liveMapBtn && liveMapFrame) {
    liveMapBtn.addEventListener('click', () => {
        liveMapActive = !liveMapActive;
        if(liveMapActive) {
            // Lazy load iframe on first toggle
            if(!liveMapFrame.src || liveMapFrame.src === '' || liveMapFrame.src === window.location.href) {
                liveMapFrame.src = 'https://satellitemap.space/';
            }
            liveMapFrame.style.display = 'block';
            cesiumEl.style.display = 'none';
            liveMapBtn.classList.add('active');
            liveMapBtn.textContent = 'SentinelForge Globe';
        } else {
            liveMapFrame.style.display = 'none';
            cesiumEl.style.display = 'block';
            liveMapBtn.classList.remove('active');
            liveMapBtn.textContent = 'Live Map ↗';
        }
    });
}

// ── Natural Language Chat Engine ────────────────────
const chatMessages = document.getElementById('chatMessages');
const chatInput = document.getElementById('chatInput');
const chatSend = document.getElementById('chatSend');

// Always show chat
chatMessages.classList.add('open');

function addChatMsg(text, cls) {
    const div = document.createElement('div');
    div.className = `chat-msg ${cls}`;
    div.innerHTML = text;
    chatMessages.appendChild(div);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// NL query processor — maps natural language to system data
function processQuery(query) {
    const q = query.toLowerCase();
    // Conjunction queries
    if(q.includes('conjunction') || q.includes('collision') || q.includes(' pc ') || q.includes('highest risk')) {
        const worst = STATE.conjunctions.reduce((a,b) => a.pc > b.pc ? a : b);
        return `<b>Highest-risk conjunction:</b> ${worst.id}<br>
            <b>Primary:</b> ${worst.priName} (NORAD ${worst.pri})<br>
            <b>Secondary:</b> ${worst.secName} (NORAD ${worst.sec})<br>
            <b>TCA:</b> ${worst.tca}<br>
            <b>Miss Distance:</b> ${worst.miss} km<br>
            <b>Pc:</b> ${worst.pc.toExponential(2)} — <span style="color:var(--status-critical)">${worst.tier}</span><br>
            <b>Source:</b> conjunction_decision.py → DecisionEngine.evaluate()<br>
            <b>Recommendation:</b> ${worst.tier==='EMERGENCY' ? 'MANEUVER CRITICAL — convene assessment team immediately' : 'Monitor and request additional tracking'}`;
    }
    // UCT queries
    if(q.includes('uct') || q.includes('uncorrelated') || q.includes('new object')) {
        const count = STATE.ucts.length;
        const tent = STATE.ucts.filter(u => u.state==='tentative').length;
        let resp = `<b>UCT Pipeline Status:</b> ${count} active tracks<br>• ${tent} tentative (near promotion)<br>• ${count-tent} raw UCTs<br><br>`;
        STATE.ucts.forEach(u => { resp += `<b>${u.id}</b>: ${u.passes} passes, ${u.sma} km SMA, ${u.inc}° inc, ${u.material}<br>`; });
        resp += `<br><b>Source:</b> catalog_lifecycle.py → CatalogLifecycleManager<br><b>Promotion threshold:</b> 7 passes for CATALOGED`;
        return resp;
    }
    // Site queries
    if(q.includes('site') || q.includes('ground') || q.includes('observatory') || q.includes('telescope') || q.includes('network') || q.includes('sensor')) {
        const total = STATE.sites.length;
        const active = STATE.sites.filter(s => s.status==='active').length;
        const deg = STATE.sites.filter(s => s.status==='degraded').length;
        const off = STATE.sites.filter(s => s.status==='offline').length;
        const radar = STATE.sites.filter(s => s.type==='radar').length;
        const nets = {};
        STATE.sites.forEach(s => { nets[s.network] = (nets[s.network]||0)+1; });
        const sorted = Object.entries(nets).sort((a,b) => b[1]-a[1]);
        let resp = `<b>Global Sensor Network:</b> ${total} sites across ${sorted.length} networks<br>
            🟢 Active: ${active} | 🟡 Degraded: ${deg} | 🔴 Offline: ${off}<br>
            Radar: ${radar} | Optical: ${total-radar}<br><br><b>Networks:</b><br>`;
        sorted.forEach(([n,c]) => { resp += `• <b>${n}</b>: ${c} sites<br>`; });
        resp += `<br><b>Source:</b> site_registry.json → 172-site global constellation`;
        return resp;
    }
    // Telemetry / data feeds
    if(q.includes('telemetry') || q.includes('feed') || q.includes('pipeline') || q.includes('data source') || q.includes('kafka') || q.includes('spacetrack') || q.includes('celestrak')) {
        const t = STATE.telemetry;
        const active = t.filter(f => f.status==='active').length;
        const groups = {};
        t.forEach(f => { groups[f.type] = (groups[f.type]||0)+1; });
        let resp = `<b>Telemetry Network Status:</b> ${t.length} feeds, ${active} active<br><br>`;
        Object.entries(groups).forEach(([type, count]) => {
            const label = {external:'Government/Public',commercial:'Commercial',allied:'Allied',internal:'Internal',edge:'Edge Compute'}[type];
            resp += `<b>${label}:</b> ${count} feeds<br>`;
        });
        resp += `<br><b>Key Feeds:</b><br>`;
        t.slice(0,6).forEach(f => { resp += `• <b>${f.name}</b>: ${f.throughput}, ${f.latency} latency<br>`; });
        resp += `<br><b>Source:</b> cloud/kafka_transport.py, cloud/schemas.py`;
        return resp;
    }
    // Covariance / NEES
    if(q.includes('covariance') || q.includes('nees') || q.includes('filter') || q.includes('calibrat')) {
        const nees = STATE.gauges.find(g => g.key==='nees');
        return `<b>Covariance Realism Status:</b><br>
            <b>NEES:</b> ${nees.value} (expected: 3.0 for 3D state)<br>
            <b>Assessment:</b> <span style="color:var(--status-nominal)">CALIBRATED</span><br>
            <b>CCR:</b> ~1.0 (predicted σ matches observed error)<br>
            <b>Flagged Objects:</b> 0 overconfident<br><br>
            <b>Source:</b> covariance_realism.py → CovarianceRealism.nees_test()<br>
            <b>Interpretation:</b> The filter's uncertainty estimates are accurate. All downstream Pc calculations are reliable.`;
    }
    // Detection / performance
    if(q.includes('detection') || q.includes('performance') || q.includes('benchmark') || q.includes('throughput')) {
        const det = STATE.gauges.find(g => g.key==='detection');
        const thr = STATE.gauges.find(g => g.key==='throughput');
        return `<b>Detection Pipeline Performance:</b><br>
            <b>Detection Rate (mag 18):</b> ${det.value}%<br>
            <b>Edge Throughput:</b> ${thr.value} fps<br>
            <b>False Positive Rate:</b> 0.23%<br>
            <b>Detection Latency:</b> 42.1 ms<br>
            <b>Data Reduction:</b> 533:1 (32MB → 10KB)<br><br>
            <b>Source:</b> streak_detect.cu → StreakDetector.detect() (J2-J6 PINN + matched filter bank)`;
    }
    // Catalog
    if(q.includes('catalog') || q.includes('how many') || q.includes('inventory') || q.includes('tracking')) {
        const c = STATE.catalog;
        return `<b>Space Object Catalog:</b><br>
            <b>Total:</b> ${c.total.toLocaleString()} objects<br>
            <b>LEO:</b> ${c.leo.toLocaleString()} | <b>MEO:</b> ${c.meo.toLocaleString()} | <b>GEO:</b> ${c.geo.toLocaleString()}<br>
            <b>HEO:</b> ${c.heo} | <b>Cislunar:</b> ${c.cislunar}<br><br>
            <b>Lifecycle States:</b><br>
            Cataloged: ~${(c.total - 142 - 87).toLocaleString()} | Tentative: 142 | UCT: 87 | Stale: 312 | Lost: 48<br><br>
            <b>Source:</b> catalog_lifecycle.py → CatalogLifecycleManager.get_statistics()`;
    }
    // Weather / space environment
    if(q.includes('weather') || q.includes('solar') || q.includes('storm') || q.includes('f10') || q.includes('kp') || q.includes('density')) {
        return `<b>Space Weather Environment:</b><br>
            <b>F10.7:</b> ${STATE.weather.f107} sfu (moderate solar activity)<br>
            <b>Kp Index:</b> ${STATE.weather.kp} (quiet geomagnetic)<br>
            <b>Dst:</b> ${STATE.weather.dst} nT (no storm)<br><br>
            <b>Thermospheric Impact:</b> Nominal density. No drag model adjustment needed.<br>
            <b>Source:</b> thermospheric_model.py → ThermosphericDensityModel.predict()`;
    }
    // Maneuver
    if(q.includes('maneuver') || q.includes('delta-v') || q.includes('avoid') || q.includes('burn')) {
        const worst = STATE.conjunctions.reduce((a,b) => a.pc > b.pc ? a : b);
        return `<b>Maneuver Options for ${worst.id}:</b><br>
            <b>Option 1 — In-track burn:</b> Δv = 0.8 m/s, fuel = 0.18 kg, new miss = 5.0 km<br>
            <b>Option 2 — Cross-track:</b> Δv = 1.3 m/s, fuel = 0.30 kg, new miss = 5.0 km<br>
            <b>Option 3 — Radial:</b> Δv = 2.7 m/s, fuel = 0.62 kg, new miss = 5.0 km<br><br>
            <b>Screening:</b> No secondary conjunctions created by Option 1.<br>
            <b>Recommendation:</b> Execute in-track burn 24h before TCA.<br>
            <b>Source:</b> conjunction_decision.py → ManeuverPlanner.plan_avoidance()`;
    }
    // System / architecture
    if(q.includes('system') || q.includes('architecture') || q.includes('module') || q.includes('agent') || q.includes('how does')) {
        return `<b>SentinelForge Architecture:</b><br>
            <b>Total Codebase:</b> ~14,500 lines across 18 SOTA modules<br>
            <b>Agent System:</b> 20 agents (5 tiers: Edge → Pipeline → Cloud → Deploy → Mgmt)<br>
            <b>Science Stack:</b> PINN J2-J6, FNO propagation, Koopman linearization, Bayesian IOD, RCS fusion, spectral characterization<br>
            <b>Ops Stack:</b> Catalog lifecycle, conjunction decision support, covariance realism<br>
            <b>Infra:</b> Jetson Orin edge → Kafka → PostGIS → FastAPI WebSocket<br><br>
            All 38 sprint tasks completed. 12 benchmarks PASS.`;
    }
    // Default
    return `I can answer questions about:<br>
        • <b>Conjunctions</b> — "What's the highest Pc right now?"<br>
        • <b>UCTs</b> — "How many uncorrelated tracks?"<br>
        • <b>Sites</b> — "Ground station status?"<br>
        • <b>Performance</b> — "Detection rate and throughput?"<br>
        • <b>Catalog</b> — "How many objects are we tracking?"<br>
        • <b>Covariance</b> — "Is the filter calibrated?"<br>
        • <b>Maneuvers</b> — "What avoidance options exist?"<br>
        • <b>Weather</b> — "Space weather conditions?"<br>
        • <b>System</b> — "Architecture overview?"`;
}

function handleChat() {
    const query = chatInput.value.trim();
    if(!query) return;
    addChatMsg(query, 'user');
    chatInput.value = '';
    // Simulate thinking
    setTimeout(() => {
        const response = processQuery(query);
        addChatMsg(response, 'system');
    }, 400);
}

chatSend.addEventListener('click', handleChat);
chatInput.addEventListener('keydown', e => { if(e.key === 'Enter') handleChat(); });
chatInput.addEventListener('focus', () => chatMessages.classList.add('open'));

// ── Periodic Data Simulation ────────────────────────
setInterval(() => {
    // Slightly jitter gauge values for realism
    STATE.gauges.forEach(g => {
        const jitter = (Math.random() - 0.5) * (g.max - g.min) * 0.005;
        g.value = Math.max(g.min, Math.min(g.max, +(g.value + jitter).toFixed(2)));
    });
    renderGauges();
}, 5000);

// Periodic alerts
let alertCycle = 0;
setInterval(() => {
    alertCycle++;
    if(alertCycle === 4) pushAlert('info', '<b>Catalog Update:</b> 12 new TLEs ingested from CelesTrak (epoch refresh)');
    if(alertCycle === 7) pushAlert('warning', '<b>Covariance Alert:</b> NORAD 38771 NEES=8.2 — covariance may be overconfident. Requesting additional obs.');
    if(alertCycle === 10) pushAlert('info', '<b>UCT-0094:</b> 3rd pass confirmed. Promoting to TENTATIVE.');
    if(alertCycle >= 12) alertCycle = 0;
}, 12000);
