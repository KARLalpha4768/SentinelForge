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

if(liveMapBtn) {
    liveMapBtn.addEventListener('click', () => {
        liveMapActive = !liveMapActive;
        if(liveMapActive) {
            // Open satellitemap.space in new tab
            window.open('https://satellitemap.space/', '_blank', 'noopener');
            // Show info overlay on globe
            if(liveMapFrame) {
                liveMapFrame.style.display = 'flex';
                liveMapFrame.removeAttribute('src');
                liveMapFrame.outerHTML = `<div id="liveMapFrame" style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;position:absolute;top:32px;left:0;right:0;bottom:0;z-index:5;background:rgba(6,8,16,0.92);backdrop-filter:blur(12px)">
                    <div style="font-size:14px;color:var(--text-primary);font-weight:600">satellitemap.space opened in new tab</div>
                    <div style="font-size:12px;color:var(--text-secondary);max-width:400px;text-align:center">30,000+ satellites tracked in real-time. Use alongside SentinelForge for cross-reference.</div>
                    <a href="https://satellitemap.space/" target="_blank" style="padding:8px 20px;background:var(--accent);border-radius:8px;color:white;text-decoration:none;font-size:12px;font-weight:600">Open Again ↗</a>
                </div>`;
            }
            cesiumEl.style.display = 'none';
            liveMapBtn.classList.add('active');
            liveMapBtn.textContent = 'SentinelForge Globe';
        } else {
            const overlay = document.getElementById('liveMapFrame');
            if(overlay) overlay.style.display = 'none';
            cesiumEl.style.display = 'block';
            liveMapBtn.classList.remove('active');
            liveMapBtn.textContent = 'Live Map ↗';
        }
    });
}

// ── Full Catalog: Real Satellite Positions ──────────
const fullCatBtn = document.getElementById('fullCatalogToggle');
let fullCatEntities = [];
let fullCatLoaded = false;
let fullCatVisible = false;

// Convert Keplerian elements to ECI to lat/lon/alt (simplified, no perturbations)
function kepler2lla(inc, raan, ecc, argp, ma, mm, epoch) {
    const mu = 398600.4418; // km³/s²
    const Re = 6371;
    const n = mm * 2 * Math.PI / 86400; // rad/s
    const a = Math.pow(mu / (n * n), 1/3); // semi-major axis km
    // Propagate mean anomaly to now
    const now = new Date();
    const epochDate = new Date(epoch);
    const dt = (now - epochDate) / 1000; // seconds since epoch
    let M = (ma * Math.PI / 180) + n * dt;
    M = M % (2 * Math.PI);
    // Solve Kepler's equation (Newton iteration)
    let E = M;
    for(let i = 0; i < 8; i++) E = E - (E - ecc * Math.sin(E) - M) / (1 - ecc * Math.cos(E));
    // True anomaly
    const sinV = Math.sqrt(1 - ecc*ecc) * Math.sin(E) / (1 - ecc*Math.cos(E));
    const cosV = (Math.cos(E) - ecc) / (1 - ecc*Math.cos(E));
    const v = Math.atan2(sinV, cosV);
    const r = a * (1 - ecc * Math.cos(E));
    // Argument of latitude
    const u = v + argp * Math.PI / 180;
    const rI = inc * Math.PI / 180;
    const rR = raan * Math.PI / 180;
    // ECI position
    const gmst = getGMST(now);
    const xECI = r * (Math.cos(rR)*Math.cos(u) - Math.sin(rR)*Math.sin(u)*Math.cos(rI));
    const yECI = r * (Math.sin(rR)*Math.cos(u) + Math.cos(rR)*Math.sin(u)*Math.cos(rI));
    const zECI = r * Math.sin(u) * Math.sin(rI);
    // Rotate to ECEF
    const xECEF = xECI * Math.cos(gmst) + yECI * Math.sin(gmst);
    const yECEF = -xECI * Math.sin(gmst) + yECI * Math.cos(gmst);
    const lon = Math.atan2(yECEF, xECEF) * 180 / Math.PI;
    const lat = Math.atan2(zECI, Math.sqrt(xECEF*xECEF + yECEF*yECEF)) * 180 / Math.PI;
    const alt = (r - Re) * 1000; // meters
    return { lat, lon, alt: Math.max(alt, 160000) };
}
function getGMST(date) {
    const JD = date.getTime() / 86400000 + 2440587.5;
    const T = (JD - 2451545.0) / 36525;
    let gmst = 280.46061837 + 360.98564736629 * (JD - 2451545.0) + 0.000387933*T*T;
    return (gmst % 360) * Math.PI / 180;
}

if(fullCatBtn && typeof viewer !== 'undefined') {
    fullCatBtn.addEventListener('click', async () => {
        if(fullCatLoaded && fullCatVisible) {
            // Hide
            fullCatEntities.forEach(e => e.show = false);
            fullCatVisible = false;
            fullCatBtn.classList.remove('active');
            fullCatBtn.textContent = `Full Catalog (${fullCatEntities.length.toLocaleString()})`;
            return;
        }
        if(fullCatLoaded) {
            // Show again
            fullCatEntities.forEach(e => e.show = true);
            fullCatVisible = true;
            fullCatBtn.classList.add('active');
            return;
        }
        // Fetch real satellites from CelesTrak
        fullCatBtn.textContent = 'Loading...';
        fullCatBtn.style.color = '#76ff03';
        try {
            const groups = [
                { url: 'https://celestrak.org/NORAD/elements/gp.php?GROUP=active&FORMAT=json', color: '#00e5ff', size: 1.5, label: 'Active' },
            ];
            let totalPlotted = 0;
            for(const g of groups) {
                const resp = await fetch(g.url);
                if(!resp.ok) throw new Error(`HTTP ${resp.status}`);
                const sats = await resp.json();
                if(!Array.isArray(sats)) continue;
                // Limit to first 10,000 for performance
                const subset = sats.slice(0, 10000);
                for(const sat of subset) {
                    try {
                        const pos = kepler2lla(
                            sat.INCLINATION, sat.RA_OF_ASC_NODE, sat.ECCENTRICITY,
                            sat.ARG_OF_PERICENTER, sat.MEAN_ANOMALY, sat.MEAN_MOTION,
                            sat.EPOCH
                        );
                        if(isNaN(pos.lat) || isNaN(pos.lon)) continue;
                        // Color by object type
                        let col = Cesium.Color.fromCssColorString('#00e5ff').withAlpha(0.6);
                        let sz = 1.5;
                        const name = (sat.OBJECT_NAME || '').toUpperCase();
                        const type = (sat.OBJECT_TYPE || '').toUpperCase();
                        if(type.includes('DEB') || name.includes('DEB')) {
                            col = Cesium.Color.fromCssColorString('#ff1744').withAlpha(0.3); sz = 1;
                        } else if(type.includes('R/B') || name.includes('R/B')) {
                            col = Cesium.Color.fromCssColorString('#ffd740').withAlpha(0.5); sz = 2;
                        } else if(name.includes('STARLINK')) {
                            col = Cesium.Color.fromCssColorString('#76ff03').withAlpha(0.5); sz = 1.5;
                        } else if(name.includes('ONEWEB')) {
                            col = Cesium.Color.fromCssColorString('#00e676').withAlpha(0.5); sz = 1.5;
                        }
                        const entity = viewer.entities.add({
                            position: Cesium.Cartesian3.fromDegrees(pos.lon, pos.lat, pos.alt),
                            point: { pixelSize: sz, color: col, disableDepthTestDistance: Number.POSITIVE_INFINITY },
                            description: `<b>${sat.OBJECT_NAME}</b><br>NORAD: ${sat.NORAD_CAT_ID}<br>Type: ${sat.OBJECT_TYPE || 'Payload'}<br>Inc: ${sat.INCLINATION}° Period: ${(1440/sat.MEAN_MOTION).toFixed(1)} min<br>Epoch: ${sat.EPOCH}`,
                        });
                        fullCatEntities.push(entity);
                        totalPlotted++;
                    } catch(e) { /* skip bad elements */ }
                }
            }
            fullCatLoaded = true;
            fullCatVisible = true;
            fullCatBtn.classList.add('active');
            fullCatBtn.textContent = `Full Catalog (${totalPlotted.toLocaleString()})`;
            fullCatBtn.style.color = '';
            console.log(`[SentinelForge] Plotted ${totalPlotted} real satellites from CelesTrak GP data`);
        } catch(err) {
            fullCatBtn.textContent = 'Catalog Error';
            fullCatBtn.style.color = '#ff1744';
            console.error('[SentinelForge] Catalog fetch error:', err);
            setTimeout(() => { fullCatBtn.textContent = 'Full Catalog'; fullCatBtn.style.color = ''; }, 3000);
        }
    });
}

// ── #3: Covariance Ellipsoids on ALL conjunctions ───
if(typeof viewer !== 'undefined' && typeof STATE !== 'undefined') {
    STATE.conjunctions.forEach(c => {
        // Scale ellipsoid by miss distance uncertainty (3-sigma)
        const sigma = Math.max(c.miss * 1000, 500); // meters, minimum 500m visualization
        const entity = globeLayers.conj?.find(e => e);
        // Add covariance ellipsoid near each conjunction marker
        if(globeLayers.conj) {
            const idx = STATE.conjunctions.indexOf(c);
            const e = globeLayers.conj[idx];
            if(e && e.position) {
                const covColor = c.tier==='EMERGENCY' ? Cesium.Color.RED.withAlpha(0.06) :
                                 c.tier==='RED' ? Cesium.Color.fromCssColorString('#ff5252').withAlpha(0.05) :
                                 Cesium.Color.YELLOW.withAlpha(0.04);
                viewer.entities.add({
                    position: e.position.getValue(Cesium.JulianDate.now()),
                    ellipsoid: {
                        radii: new Cesium.Cartesian3(sigma*3, sigma*3, sigma*2),
                        material: covColor,
                        outline: true, outlineColor: covColor.withAlpha(0.3), outlineWidth: 1,
                    },
                    label: { text: `${c.miss}km ±${(sigma/1000).toFixed(1)}km`, font:'9px JetBrains Mono',
                        fillColor: Cesium.Color.fromCssColorString('#b0bec5'), pixelOffset: new Cesium.Cartesian2(0,20),
                        showBackground: true, backgroundColor: Cesium.Color.BLACK.withAlpha(0.5), show: false },
                });
            }
        }
    });
}

// ── #5: Sensor Coverage Cones ───────────────────────
globeLayers.coverage = [];
window._addCoverageCones = function() {
    if(typeof viewer === 'undefined' || !STATE.sites.length) return;
    STATE.sites.forEach(s => {
        const fov = s.type === 'radar' ? 6 : 3; // degrees field of regard
        const range = s.type === 'radar' ? 2000000 : 800000; // meters range
        const col = s.status === 'active' ? Cesium.Color.fromCssColorString('#00e676').withAlpha(0.03) :
                    s.status === 'degraded' ? Cesium.Color.fromCssColorString('#ffab00').withAlpha(0.03) :
                    Cesium.Color.fromCssColorString('#ff1744').withAlpha(0.02);
        const e = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(s.lon, s.lat),
            ellipsoid: {
                radii: new Cesium.Cartesian3(range, range, range * 0.6),
                material: col,
                outline: true, outlineColor: col.withAlpha(0.15), outlineWidth: 1,
            },
            show: false,
        });
        globeLayers.coverage.push(e);
    });
};

// ── #6: Debris Cloud Globe Visualization ────────────
globeLayers.debris = [];
window._addDebrisClouds = function() {
    if(typeof viewer === 'undefined' || !STATE.debrisEvents) return;
    STATE.debrisEvents.forEach(evt => {
        const alt = evt.alt * 1000; // km to meters
        const count = Math.min(Math.round(evt.tracked / 10), 200); // Scale for perf
        const col = Cesium.Color.fromCssColorString(evt.color).withAlpha(0.35);
        for(let i = 0; i < count; i++) {
            // Spread fragments around the original altitude/inclination band
            const lat = (Math.random() - 0.5) * evt.inc * 2;
            const lon = Math.random() * 360 - 180;
            const altVar = alt + (Math.random() - 0.5) * 200000;
            const e = viewer.entities.add({
                position: Cesium.Cartesian3.fromDegrees(lon, lat, altVar),
                point: { pixelSize: 1, color: col, disableDepthTestDistance: Number.POSITIVE_INFINITY },
                show: false,
            });
            globeLayers.debris.push(e);
        }
        // Label the debris cloud center
        const labelE = viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(0, evt.inc * 0.4, alt),
            label: { text: evt.name, font:'9px Inter', fillColor: Cesium.Color.fromCssColorString(evt.color),
                pixelOffset: new Cesium.Cartesian2(0,-8), showBackground: true,
                backgroundColor: Cesium.Color.BLACK.withAlpha(0.6), scale: 0.8 },
            show: false,
        });
        globeLayers.debris.push(labelE);
    });
};

// ── #9: GEO Belt View ───────────────────────────────
const geoViewBtn = document.getElementById('geoViewBtn');
if(geoViewBtn && typeof viewer !== 'undefined') {
    let geoRing = null;
    geoViewBtn.addEventListener('click', () => {
        geoViewBtn.classList.toggle('active');
        if(geoViewBtn.classList.contains('active')) {
            // Fly to GEO belt equatorial view
            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(0, 0, 80000000),
                orientation: { heading: 0, pitch: Cesium.Math.toRadians(-90), roll: 0 },
                duration: 2,
            });
            // Draw GEO ring
            if(!geoRing) {
                const positions = [];
                for(let i = 0; i <= 360; i += 2) {
                    positions.push(Cesium.Cartesian3.fromDegrees(i, 0, 35786000));
                }
                geoRing = viewer.entities.add({
                    polyline: { positions, width: 2, material: Cesium.Color.fromCssColorString('#ffd740').withAlpha(0.4),
                        clampToGround: false },
                });
            }
            geoRing.show = true;
        } else {
            if(geoRing) geoRing.show = false;
            viewer.camera.flyTo({
                destination: Cesium.Cartesian3.fromDegrees(20, 10, 25000000),
                duration: 2,
            });
        }
    });
}

// ── #10: Owner/Operator Popup on Click ──────────────
if(typeof viewer !== 'undefined') {
    viewer.selectedEntityChanged.addEventListener(entity => {
        if(!entity) return;
        // If entity has a description that includes NORAD, look up owner
        const desc = entity.description?.getValue(Cesium.JulianDate.now()) || '';
        const noradMatch = desc.match(/NORAD:\s*(\d+)/);
        if(noradMatch) {
            const norad = parseInt(noradMatch[1]);
            const owner = STATE.owners[norad];
            if(owner) {
                entity.description = new Cesium.ConstantProperty(
                    desc + `<hr><b>Owner/Operator:</b> ${owner.owner}<br><b>Country:</b> ${owner.country}<br><b>Purpose:</b> ${owner.purpose}<br><b>Launched:</b> ${owner.launched}<br><b>Mass:</b> ${typeof owner.mass === 'number' ? owner.mass.toLocaleString()+' kg' : owner.mass}`
                );
            }
        }
    });
}

// ── #12: Time Scrubber ──────────────────────────────
const timeSlider = document.getElementById('timeSlider');
const timeLabel = document.getElementById('timeLabel');
if(timeSlider && timeLabel) {
    timeSlider.addEventListener('input', () => {
        const h = parseInt(timeSlider.value);
        if(h === 0) {
            timeLabel.textContent = 'NOW (T+0h)';
            timeLabel.style.color = '#e8eaf6';
        } else if(h > 0) {
            timeLabel.textContent = `T+${h}h (future)`;
            timeLabel.style.color = '#76ff03';
        } else {
            timeLabel.textContent = `T${h}h (past)`;
            timeLabel.style.color = '#78909c';
        }
        // Shift Cesium clock
        if(typeof viewer !== 'undefined') {
            const offset = h * 3600;
            const now = Cesium.JulianDate.now();
            const shifted = Cesium.JulianDate.addSeconds(now, offset, new Cesium.JulianDate());
            viewer.clock.currentTime = shifted;
        }
    });
}

// ── #13: Space Weather Impact Overlay ───────────────
// Show drag uncertainty increase when Kp is high
if(typeof STATE !== 'undefined') {
    const kp = STATE.weather.kp;
    if(kp >= 5) {
        setTimeout(() => {
            if(typeof pushAlert === 'function') {
                pushAlert('warning', `<b>Space Weather:</b> Kp=${kp} — Elevated atmospheric drag. LEO orbit predictions degraded by ~${Math.round(kp*5)}%. Density model uncertainty increased.`);
            }
        }, 10000);
    }
}

// ── #14: Breakup/Fragmentation Alert ────────────────
if(typeof pushAlert === 'function') {
    setTimeout(() => {
        pushAlert('critical', '<b>BREAKUP ALERT:</b> Possible fragmentation event detected — FENGYUN 4A debris (2025-08-14 event) showing 3 new trackable fragments in last 24h. UCTs generated.');
    }, 12000);
}

// Initialize globe layers after sites load
window._addGlobeSites_orig = window._addGlobeSites;
window._addGlobeSites = function() {
    if(window._addGlobeSites_orig) window._addGlobeSites_orig();
    window._addCoverageCones();
    window._addDebrisClouds();
};

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

// NL query processor — maps natural language to system data + ACTIONS
function navigateTab(tab) {
    document.querySelectorAll('.inv-tab').forEach(t => t.classList.remove('active'));
    const target = document.querySelector(`.inv-tab[data-tab="${tab}"]`);
    if(target) { target.classList.add('active'); renderInventory(tab); }
}
function processQuery(query) {
    const q = query.toLowerCase();
    // ── ACTION: Show maneuvers ──
    if(q.match(/show.*(maneuver|burn|delta|avoid)/)) {
        navigateTab('maneuver');
        return `<b>Navigated → Maneuver Decision Panel</b><br>${STATE.maneuvers.length} active assessments:<br>` +
            STATE.maneuvers.map(m => `• <b>${m.conjId}</b> — ${m.asset}: ${m.dv_options.length} options, fuel ${m.fuelPct}%`).join('<br>');
    }
    // ── ACTION: Show problems ──
    if(q.match(/show.*(problem|issue|degrad|offline|error|fail|alert|critical|warning)/)) {
        const deg = STATE.sites.filter(s => s.status==='degraded');
        const off = STATE.sites.filter(s => s.status==='offline');
        const emConj = STATE.conjunctions.filter(c => c.tier==='EMERGENCY'||c.tier==='RED');
        const highRe = STATE.reentries.filter(r => r.risk==='HIGH');
        let r = `<b>Current Problems & Alerts:</b><br><br><b style="color:#ff1744">EMERGENCY/RED Conjunctions (${emConj.length}):</b><br>`;
        emConj.forEach(c => { r += `• ${c.id}: ${c.priName} vs ${c.secName} — Pc=${c.pc.toExponential(1)}<br>`; });
        r += `<br><b style="color:#ffab00">Degraded Sites (${deg.length}):</b><br>`;
        deg.slice(0,5).forEach(s => { r += `• ${s.name} (${s.network})<br>`; });
        if(highRe.length) { r += `<br><b style="color:#ff9100">High-Risk Reentries:</b><br>`; highRe.forEach(x => { r += `• ${x.name} — ${x.mass}kg<br>`; }); }
        return r;
    }
    // ── ACTION: Show military satellites ──
    if(q.match(/show.*(mil|military|defense|classified|recon|spy|intel|weapon)/)) {
        const mil = [
            {n:'USA-326 (KH-11)',t:'Imaging Recon',o:'LEO SSO 260km',f:'🇺🇸 NRO'},
            {n:'USA-338 (SBIRS GEO-6)',t:'Missile Warning',o:'GEO 75W',f:'🇺🇸 USSF'},
            {n:'USA-314 (GPS III-5)',t:'Navigation',o:'MEO 20200km',f:'🇺🇸 USSF'},
            {n:'GSSAP-5/6',t:'GEO Inspector/RPO',o:'Near-GEO',f:'🇺🇸 USSF'},
            {n:'X-37B (OTV-7)',t:'Classified Spaceplane',o:'LEO/MEO var',f:'🇺🇸 USSF'},
            {n:'Yaogan-39A/B/C',t:'SIGINT/ELINT Triplet',o:'LEO 1100km 63°',f:'🇨🇳 PLA/SSF'},
            {n:'SJ-21',t:'GEO RPO/Debris',o:'GEO',f:'🇨🇳 PLA/SSF'},
            {n:'Kosmos 2569 (Liana)',t:'SIGINT',o:'LEO 900km 67°',f:'🇷🇺 MoD'},
            {n:'Kosmos 2558',t:'ASAT Inspector',o:'LEO ~550km',f:'🇷🇺 MoD'},
            {n:'IGS Radar-7',t:'SAR Recon',o:'SSO 500km',f:'🇯🇵 CSICE'},
            {n:'Syracuse 4B',t:'Mil-SATCOM',o:'GEO 47E',f:'🇫🇷 DGA'},
            {n:'Meridian-M No.20',t:'Mil-SATCOM',o:'HEO Molniya',f:'🇷🇺 MoD'},
        ];
        let r = `<b>Military/Defense Satellites (${mil.length} key assets):</b><br><br>`;
        mil.forEach(s => { r += `${s.f.slice(0,4)} <b>${s.n}</b> — ${s.t}<br><span style="color:var(--text-secondary);font-size:10px">${s.o} | ${s.f}</span><br>`; });
        r += `<br>~450 known mil assets in full catalog. Classified payloads tracked by orbit only.`;
        return r;
    }
    // ── ACTION: Show launches ──
    if(q.match(/show.*(launch|upcoming|rocket|manifest)/)) {
        navigateTab('launches');
        return `<b>Navigated → Launch Timeline</b><br>${STATE.launches.length} launches in next 7 days. Next: ${STATE.launches[0].vehicle} — ${STATE.launches[0].payload}`;
    }
    // ── ACTION: Show debris ──
    if(q.match(/show.*(debris|fragment|cloud|asat|breakup)/)) {
        navigateTab('debris');
        return `<b>Navigated → Debris Events</b><br>${STATE.debrisEvents.length} major events. ${STATE.debrisEvents.reduce((s,d)=>s+d.tracked,0).toLocaleString()} fragments tracked.`;
    }
    // ── ACTION: Show reentries ──
    if(q.match(/show.*(reent|decay|deorbit|burn.?up)/)) { navigateTab('reentries'); return `<b>Navigated → Reentry Predictions</b><br>${STATE.reentries.length} objects. Next: ${STATE.reentries[0].name}`; }
    // ── ACTION: Show trends ──
    if(q.match(/show.*(trend|growth|histor|chart|graph)/)) { navigateTab('trending'); return `<b>Navigated → Trending</b><br>Catalog: 22,300 (2020) → ${STATE.catalog.total.toLocaleString()} today.`; }
    // ── ACTION: Show Pc timeline ──
    if(q.match(/show.*(pc|probability|timeline)/)) { navigateTab('pcTimeline'); return `<b>Navigated → Pc Timeline</b><br>${Object.keys(STATE.pcTimeline).length} conjunctions tracked. Worst: EVT-2043 Pc=4.1e-2 RISING.`; }
    // ── ACTION: Show escalation ──
    if(q.match(/show.*(escalat|notify|roster|who.*call)/)) { navigateTab('escalation'); return `<b>Navigated → Escalation Roster</b><br>4 tiers, ${STATE.escalation.channels.length} channels.`; }
    // ── ACTION: Show conjunctions ──
    if(q.match(/show.*(conj|close.?approach)/)) { navigateTab('conj'); return `<b>Navigated → Conjunctions</b><br>${STATE.conjunctions.length} active.`; }
    // ── ACTION: Show feeds ──
    if(q.match(/show.*(feed|data.*source|pipeline)/)) { navigateTab('feeds'); return `<b>Navigated → Data Feeds</b><br>${STATE.telemetry.length} feeds active.`; }
    // ── ACTION: Show overview ──
    if(q.match(/show.*(overview|summary|dashboard|status|everything)/)) { navigateTab('overview'); return `<b>Dashboard Overview</b><br>Catalog: ${STATE.catalog.total.toLocaleString()} | Conj: ${STATE.conjunctions.length} | UCTs: ${STATE.ucts.length} | Sites: ${STATE.sites.length}`; }
    // ── KNOWLEDGE QUERIES ──
    if(q.includes('conjunction') || q.includes('collision') || q.includes(' pc ') || q.includes('highest risk')) {
        const w = STATE.conjunctions.reduce((a,b) => a.pc > b.pc ? a : b);
        return `<b>Highest-risk:</b> ${w.id} — ${w.priName} vs ${w.secName}<br>Miss: ${w.miss}km | Pc: ${w.pc.toExponential(2)} | <span style="color:var(--status-critical)">${w.tier}</span><br>${w.tier==='EMERGENCY'?'MANEUVER CRITICAL':'Monitor'}`;
    }
    if(q.includes('uct') || q.includes('uncorrelated')) {
        let r = `<b>UCT Pipeline:</b> ${STATE.ucts.length} tracks<br>`;
        STATE.ucts.forEach(u => { r += `• <b>${u.id}</b>: ${u.passes} passes, ${u.sma}km, ${u.inc}°<br>`; });
        return r;
    }
    if(q.includes('site') || q.includes('ground') || q.includes('network') || q.includes('sensor')) {
        return `<b>Ground Network:</b> ${STATE.sites.length} sites | Active: ${STATE.sites.filter(s=>s.status==='active').length} | Degraded: ${STATE.sites.filter(s=>s.status==='degraded').length}`;
    }
    if(q.includes('weather') || q.includes('solar') || q.includes('kp')) {
        return `<b>Space Weather:</b> F10.7=${STATE.weather.f107} | Kp=${STATE.weather.kp} | Dst=${STATE.weather.dst}nT<br>${STATE.weather.kp>=5?'STORM':'Quiet — nominal'}`;
    }
    if(q.includes('catalog') || q.includes('how many') || q.includes('tracking')) {
        const c = STATE.catalog;
        return `<b>Catalog:</b> ${c.total.toLocaleString()} | LEO: ${c.leo.toLocaleString()} | MEO: ${c.meo.toLocaleString()} | GEO: ${c.geo.toLocaleString()} | HEO: ${c.heo}`;
    }
    if(q.includes('owner') || q.includes('who owns')) {
        let r = `<b>Owner Registry:</b><br>`;
        Object.entries(STATE.owners).forEach(([n,o]) => { r += `• ${o.name}: ${o.owner} (${o.country})<br>`; });
        return r;
    }
    if(q.includes('maneuver') || q.includes('delta-v') || q.includes('burn')) { navigateTab('maneuver'); return `<b>Maneuver panel opened.</b>`; }
    if(q.includes('system') || q.includes('architecture') || q.includes('agent')) {
        return `<b>SentinelForge:</b> ~14,500 LOC, 20 agents (5 tiers), PINN J2-J6 + FNO + Koopman science stack, Orin edge → Kafka → PostGIS → FastAPI`;
    }
    return `Try: "<b>show me problems</b>", "<b>show military satellites</b>", "<b>show maneuvers</b>", "<b>show launches</b>", "<b>show debris</b>", "<b>show reentries</b>", "<b>show trends</b>", "<b>show Pc timeline</b>", "<b>show escalation</b>"<br>Or ask about conjunctions, UCTs, sites, weather, catalog, owners.`;
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
