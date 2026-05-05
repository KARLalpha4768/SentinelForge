// SentinelForge - Slingshot Technology Catalog Logic

const STATIONS = [
    { id: "SLING-NUM-CO1", name: "Fort Collins, CO", lat: 40.59, lon: -105.08, status: "active", region: "Americas", gpu: 67, queue: 0, seeing: 0.6, type: "Numerica 0.5m", ops: "Primary testbed and calibration site. Headquarters location." },
    { id: "SLING-NUM-CO2", name: "Colorado Springs, CO", lat: 38.83, lon: -104.82, status: "active", region: "Americas", gpu: 44, queue: 0, seeing: 2.2, type: "Numerica 0.5m", ops: "Close proximity to USSF commands for rapid demonstration." },
    { id: "SLING-NUM-NM", name: "Socorro, NM", lat: 34.07, lon: -106.91, status: "degraded", region: "Americas", gpu: 45, queue: 10, seeing: 1.5, type: "Numerica 0.5m", ops: "High-altitude desert site offering excellent seeing conditions." },
    { id: "SLING-NUM-AZ", name: "Tucson, AZ", lat: 32.23, lon: -110.95, status: "active", region: "Americas", gpu: 76, queue: 9, seeing: 1.4, type: "Numerica 0.5m", ops: "Located near major academic astronomy centers." },
    { id: "SLING-NUM-TX", name: "Fort Davis, TX", lat: 30.67, lon: -103.95, status: "active", region: "Americas", gpu: 81, queue: 3, seeing: 0.7, type: "Numerica 0.5m", ops: "Remote dark-sky location for deep-space tracking." },
    { id: "SLING-NUM-HI", name: "Haleakala, HI", lat: 20.71, lon: -156.26, status: "active", region: "Oceania", gpu: 52, queue: 6, seeing: 1.4, type: "Numerica 0.5m", ops: "Critical Pacific mid-point coverage at high altitude." },
    { id: "SLING-NUM-AU1", name: "Siding Spring, AU", lat: -31.27, lon: 149.07, status: "active", region: "Oceania", gpu: 73, queue: 10, seeing: 0.7, type: "Numerica 0.5m", ops: "Premier Southern Hemisphere astronomical site." },
    { id: "SLING-NUM-AU2", name: "Learmonth, AU", lat: -22.24, lon: 114.09, status: "active", region: "Oceania", gpu: 51, queue: 3, seeing: 0.9, type: "Numerica 0.5m", ops: "Western Australia coverage for early warning." },
    { id: "SLING-NUM-CL", name: "Cerro Tololo, Chile", lat: -30.17, lon: -70.81, status: "active", region: "Americas", gpu: 38, queue: 2, seeing: 1.1, type: "Numerica 0.5m", ops: "World-class seeing conditions in the Atacama." },
    { id: "SLING-NUM-NA", name: "Gamsberg, Namibia", lat: -23.34, lon: 16.23, status: "active", region: "Africa", gpu: 34, queue: 12, seeing: 2.2, type: "Numerica 0.5m", ops: "Strategic African continent coverage." },
    { id: "SLING-NUM-SA", name: "Sutherland, RSA", lat: -32.38, lon: 20.81, status: "active", region: "Africa", gpu: 33, queue: 8, seeing: 2.2, type: "Numerica 0.5m", ops: "South African astronomical hub." },
    { id: "SLING-NUM-SP", name: "Tenerife, Spain", lat: 28.3, lon: -16.51, status: "active", region: "Europe", gpu: 78, queue: 2, seeing: 1.3, type: "Numerica 0.5m", ops: "Canary Islands altitude provides clear Atlantic views." },
    { id: "SLING-NUM-IT", name: "Asiago, Italy", lat: 45.87, lon: 11.53, status: "active", region: "Europe", gpu: 85, queue: 0, seeing: 0.8, type: "Numerica 0.5m", ops: "European mainland tracking facility." },
    { id: "SLING-NUM-JP", name: "Okayama, Japan", lat: 34.57, lon: 133.59, status: "offline", region: "Asia", gpu: 54, queue: 12, seeing: 2.1, type: "Numerica 0.5m", ops: "East Asia coverage (currently under maintenance)." },
    { id: "SLING-NUM-IN", name: "Mt Abu, India", lat: 24.65, lon: 72.78, status: "active", region: "Asia", gpu: 74, queue: 12, seeing: 1.6, type: "Numerica 0.5m", ops: "Indian subcontinent coverage gap-filler." },
    { id: "SLING-NUM-AR", name: "El Leoncito, Argentina", lat: -31.8, lon: -69.3, status: "active", region: "Americas", gpu: 39, queue: 4, seeing: 0.9, type: "Numerica 0.5m", ops: "Secondary South American site." },
    { id: "SLING-NUM-KR", name: "Bohyunsan, S. Korea", lat: 36.16, lon: 128.98, status: "degraded", region: "Asia", gpu: 77, queue: 0, seeing: 2.0, type: "Numerica 0.5m", ops: "Korean peninsula tracking capability." },
    { id: "SLING-NUM-TW", name: "Lulin, Taiwan", lat: 23.47, lon: 120.87, status: "degraded", region: "Asia", gpu: 67, queue: 8, seeing: 2.3, type: "Numerica 0.5m", ops: "High-altitude Asian site." },
    { id: "SLING-NUM-MX", name: "San Pedro Martir, Mexico", lat: 31.03, lon: -115.46, status: "active", region: "Americas", gpu: 33, queue: 1, seeing: 2.2, type: "Numerica 0.5m", ops: "Baja California dark sky preserve." },
    { id: "SLING-NUM-PH", name: "Clark, Philippines", lat: 15.19, lon: 120.59, status: "degraded", region: "Asia", gpu: 34, queue: 3, seeing: 1.3, type: "Numerica 0.5m", ops: "Equatorial Pacific coverage." }
];

const NETWORK_TECH_SPECS = {
    optics: "Multiple 14-inch (0.35m) to 20-inch (0.5m) commercial-off-the-shelf (COTS) optical tubes (e.g., Celestron RASA or PlaneWave CDK) operating in tandem arrays. This achieves wide-field survey capabilities at a fraction of the cost of monolithic DoD sensors.",
    mounts: "High-slew-rate direct-drive equatorial mounts capable of keeping up with fast LEO objects (>5 degrees/second) without gear backlash, enabling precision tracking across all orbital regimes.",
    detectors: "Back-illuminated, low-read-noise sCMOS (Scientific CMOS) sensors running at high frame rates. This is essential for the short integration times required to freeze LEO objects and perform daylight tracking.",
    daylight: "Slingshot's patented daylight tracking technology uses specialized narrow-band filters (often in the SWIR/NIR bands) combined with high-dynamic-range imaging to track sunlit satellites against the bright daytime sky.",
    enclosures: "Baader Planetarium AllSky autonomous domes. These protect the delicate optics while providing weather sensing (rain, wind, cloud cover) to automatically shutter the system, enabling 24/7 uncrewed operations.",
    edgeCompute: "NVIDIA Jetson AGX Orin units at the edge perform the Streak Detection Pipeline locally. Raw image frames (gigabytes per minute) are reduced to Tracking Data Messages (TDMs) in milliseconds, saving massive network bandwidth."
};

const OPS_PROCEDURES = [
    { step: "Autonomous Tasking", desc: "The SentinelForge central scheduler (via Slingshot Beacon integration) pushes prioritized target lists to the site. The edge node calculates optimal pass geometries and schedules telescope slews." },
    { step: "Weather & Safety Check", desc: "Local meteorological sensors (AllSky cameras, rain detectors) continuously poll. If conditions degrade, the system autonomously parks the mount and closes the dome." },
    { step: "Acquisition & Tracking", desc: "The mount slews to intercept. For LEO, it performs 'rate tracking' along the expected trajectory. For GEO, it performs 'sidereal tracking' (stars are fixed, satellites appear as streaks)." },
    { step: "Edge Processing", desc: "The Jetson AGX Orin executes the CUDA-accelerated streak detection and photometry extraction pipelines immediately upon frame readout." },
    { step: "Data Exfiltration", desc: "Only extracted measurements (Astrometry/Photometry in JSON/TDM format) are sent over the secure WAN back to the SentinelForge cloud, ensuring low-latency ingest." },
    { step: "Day/Night Transition", desc: "The system dynamically swaps filter wheels and adjusts exposure times to seamlessly transition between nighttime broadband and daytime narrow-band observation modes." }
];

const grid = document.getElementById('stationGrid');
const searchInput = document.getElementById('searchInput');
const detailOverlay = document.getElementById('detailOverlay');
const detailPanel = document.getElementById('detailPanel');
const detailContent = document.getElementById('detailContent');
const heroStats = document.getElementById('heroStats');

let activeRegion = 'ALL';
let activeStatus = 'ALL';
let searchQuery = '';

function init() {
    updateHeroStats();
    renderGrid();
    setupFilters();
    
    document.getElementById('detailClose').addEventListener('click', closeDetail);
    detailOverlay.addEventListener('click', closeDetail);
    document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeDetail(); });
}

function updateHeroStats() {
    const activeCount = STATIONS.filter(s => s.status === 'active').length;
    document.getElementById('stationCount').textContent = STATIONS.length;
    document.getElementById('activeCount').textContent = activeCount;

    const totalGPU = Math.round(STATIONS.reduce((acc, s) => acc + s.gpu, 0) / STATIONS.length);
    const avgSeeing = (STATIONS.reduce((acc, s) => acc + s.seeing, 0) / STATIONS.length).toFixed(1);

    heroStats.innerHTML = `
        <div class="hero-stat"><div class="num">${STATIONS.length}</div><div class="lbl">Global Sites</div></div>
        <div class="hero-stat"><div class="num">${activeCount}</div><div class="lbl">Active Tracking</div></div>
        <div class="hero-stat"><div class="num">${totalGPU}%</div><div class="lbl">Avg Edge GPU Load</div></div>
        <div class="hero-stat"><div class="num">${avgSeeing}&quot;</div><div class="lbl">Avg Seeing</div></div>
        <div class="hero-stat"><div class="num">24/7</div><div class="lbl">Operations</div></div>
    `;
}

function renderGrid() {
    grid.innerHTML = '';
    
    const filtered = STATIONS.filter(s => {
        const matchesRegion = activeRegion === 'ALL' || s.region === activeRegion;
        const matchesStatus = activeStatus === 'ALL' || s.status === activeStatus;
        const matchesSearch = s.name.toLowerCase().includes(searchQuery) || 
                              s.id.toLowerCase().includes(searchQuery) ||
                              s.region.toLowerCase().includes(searchQuery);
        return matchesRegion && matchesStatus && matchesSearch;
    });

    if(filtered.length === 0) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#546e7a;">No stations match the selected filters.</div>';
        return;
    }

    filtered.forEach(s => {
        const statusCls = s.status === 'active' ? 'active' : s.status === 'degraded' ? 'degraded' : 'offline';
        const regionCls = 'region-' + s.region.toLowerCase();
        
        const card = document.createElement('div');
        card.className = `station-card ${s.status}`;
        card.innerHTML = `
            <div class="card-header">
                <div class="card-status ${statusCls}"></div>
                <div class="card-id">${s.id}</div>
                <div class="card-name">${s.name}</div>
                <div class="card-region ${regionCls}">${s.region}</div>
            </div>
            <div class="card-body">
                <div class="card-metrics">
                    <div class="metric"><div class="val">${s.lat.toFixed(1)}&deg;</div><div class="key">LAT</div></div>
                    <div class="metric"><div class="val">${s.lon.toFixed(1)}&deg;</div><div class="key">LON</div></div>
                    <div class="metric"><div class="val">${s.gpu}%</div><div class="key">EDGE GPU</div></div>
                    <div class="metric"><div class="val">${s.seeing}&quot;</div><div class="key">SEEING</div></div>
                </div>
                <div class="card-tech">
                    <span class="tech-tag tech-optical">MULTI-APERTURE</span>
                    <span class="tech-tag tech-gpu">JETSON ORIN</span>
                    <span class="tech-tag tech-dome">AUTONOMOUS</span>
                    <span class="tech-tag tech-day">DAYLIGHT TRACKING</span>
                </div>
                <div class="card-ops"><strong>Role:</strong> ${s.ops}</div>
            </div>
        `;
        
        card.addEventListener('click', () => openDetail(s));
        grid.appendChild(card);
    });
}

function openDetail(s) {
    const statusCls = s.status === 'active' ? '#00e676' : s.status === 'degraded' ? '#ffab00' : '#ff1744';
    
    let checklistHtml = '';
    OPS_PROCEDURES.forEach(op => {
        checklistHtml += `<li><strong>${op.step}:</strong> ${op.desc}</li>`;
    });

    detailContent.innerHTML = `
        <h2>${s.name} Ground Station</h2>
        <div class="detail-id">${s.id} &middot; <span style="color:${statusCls};text-transform:uppercase">${s.status}</span></div>
        
        <div class="map-container" style="height:180px; margin-bottom:20px; background:linear-gradient(rgba(10,12,20,0.8), rgba(10,12,20,0.9)), url('img/sat_earth_obs.png') center/cover; position:relative; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
            <div style="position:absolute; bottom:10px; left:10px; background:rgba(0,0,0,0.8); padding:4px 8px; border-radius:4px; font-size:10px; font-family:'JetBrains Mono',monospace; color:#00e5ff;">
                COORD: ${s.lat.toFixed(4)}&deg;, ${s.lon.toFixed(4)}&deg;
            </div>
        </div>

        <div class="detail-section">
            <h3><span class="icon">[SYS]</span> Site Metrics & Connectivity</h3>
            <div class="tech-spec-grid">
                <div class="tech-spec-item">
                    <div class="ts-label">Edge GPU Load</div>
                    <div class="ts-value" style="color:#00e5ff">${s.gpu}%</div>
                </div>
                <div class="tech-spec-item">
                    <div class="ts-label">Current Seeing</div>
                    <div class="ts-value">${s.seeing} arcsec</div>
                </div>
                <div class="tech-spec-item">
                    <div class="ts-label">Task Queue</div>
                    <div class="ts-value">${s.queue} pending</div>
                </div>
                <div class="tech-spec-item">
                    <div class="ts-label">Network Uplink</div>
                    <div class="ts-value" style="color:#00e676">Secure WAN (IPsec)</div>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3><span class="icon">[HW]</span> Hardware & Technology Profile</h3>
            <table class="detail-table">
                <tbody>
                    <tr><td>Sensor Array</td><td>${NETWORK_TECH_SPECS.optics}</td></tr>
                    <tr><td>Tracking Mounts</td><td>${NETWORK_TECH_SPECS.mounts}</td></tr>
                    <tr><td>Detectors</td><td>${NETWORK_TECH_SPECS.detectors}</td></tr>
                    <tr><td>Daylight Tracking</td><td>${NETWORK_TECH_SPECS.daylight}</td></tr>
                    <tr><td>Enclosure</td><td>${NETWORK_TECH_SPECS.enclosures}</td></tr>
                    <tr><td>Edge Compute</td><td>${NETWORK_TECH_SPECS.edgeCompute}</td></tr>
                </tbody>
            </table>
        </div>

        <div class="detail-section">
            <h3><span class="icon">[OPS]</span> Standard Operating Procedures</h3>
            <ul class="ops-checklist">
                ${checklistHtml}
            </ul>
        </div>

        <div class="detail-section">
            <h3><span class="icon">[SCH]</span> Observatory Hardware Schematic <span style="font-size:9px;color:#00e5ff;font-weight:400;margin-left:8px">— Click any component for deep specs</span></h3>
            <div id="schematicContainer" style="position:relative;background:rgba(10,12,20,0.9);border:1px solid rgba(0,229,255,0.12);border-radius:8px;padding:12px;text-align:center;overflow:hidden">
                <img src="img/technician_schematic.png" alt="Observatory Hardware Schematic — ${s.name}" style="width:100%;max-width:720px;border-radius:6px;opacity:0.95;display:block;margin:0 auto" id="schematicImg" />
                <!-- Clickable hotspot overlay (positioned relative to image) -->
                <div id="schematicHotspots" style="position:absolute;top:12px;left:0;right:0;bottom:12px;display:flex;justify-content:center">
                    <div style="position:relative;width:100%;max-width:720px">
                        <!-- Dome: top arc area -->
                        <div class="sch-hotspot" onclick="openComponentDetail('dome')" title="Baader AllSky Dome" style="top:2%;left:45%;width:45%;height:12%"></div>
                        <!-- Weather Sensors: top-left -->
                        <div class="sch-hotspot" onclick="openComponentDetail('weather')" title="Weather Sensors" style="top:1%;left:2%;width:28%;height:12%"></div>
                        <!-- OTA: center-upper -->
                        <div class="sch-hotspot" onclick="openComponentDetail('ota')" title="Optical Telescope Assembly" style="top:15%;left:55%;width:35%;height:15%"></div>
                        <!-- Focal Telescope -->
                        <div class="sch-hotspot" onclick="openComponentDetail('telescope')" title="Focal Telescope 0.5m" style="top:14%;left:17%;width:35%;height:12%"></div>
                        <!-- Filter Wheel -->
                        <div class="sch-hotspot" onclick="openComponentDetail('filterwheel')" title="Filter Wheel (BVRI+Clear)" style="top:26%;left:8%;width:28%;height:8%"></div>
                        <!-- CCD Camera -->
                        <div class="sch-hotspot" onclick="openComponentDetail('camera')" title="CCD/sCMOS Camera" style="top:33%;left:5%;width:22%;height:9%"></div>
                        <!-- Mount: center -->
                        <div class="sch-hotspot" onclick="openComponentDetail('mount')" title="Direct-Drive Equatorial Mount" style="top:29%;left:33%;width:35%;height:14%"></div>
                        <!-- Focuser -->
                        <div class="sch-hotspot" onclick="openComponentDetail('focuser')" title="Motorized Focuser" style="top:40%;left:15%;width:22%;height:8%"></div>
                        <!-- Starlink dish: far right -->
                        <div class="sch-hotspot" onclick="openComponentDetail('starlink')" title="Starlink Uplink" style="top:30%;left:77%;width:20%;height:18%"></div>
                        <!-- Jetson: lower-left -->
                        <div class="sch-hotspot" onclick="openComponentDetail('jetson')" title="NVIDIA Jetson AGX Orin" style="top:60%;left:5%;width:28%;height:14%"></div>
                        <!-- UPS: bottom-left -->
                        <div class="sch-hotspot" onclick="openComponentDetail('ups')" title="UPS Battery Backup" style="top:74%;left:5%;width:25%;height:13%"></div>
                        <!-- USB 3.0 bus -->
                        <div class="sch-hotspot" onclick="openComponentDetail('usb')" title="USB 3.0 Data Bus" style="top:44%;left:10%;width:15%;height:6%"></div>
                        <!-- RS-232 / Ethernet / Power: lower-right connections -->
                        <div class="sch-hotspot" onclick="openComponentDetail('networking')" title="RS-232 / Ethernet / Power" style="top:60%;left:38%;width:35%;height:20%"></div>
                        <!-- AC/DC Power: bottom-right -->
                        <div class="sch-hotspot" onclick="openComponentDetail('power')" title="AC/DC Power System" style="top:85%;left:55%;width:25%;height:12%"></div>
                    </div>
                </div>
                <div style="margin-top:8px;font-size:9px;color:#546e7a;font-family:'JetBrains Mono',monospace">
                    FIG 1 — ${s.id} HARDWARE LAYOUT · Click any label for component deep-dive
                </div>
            </div>
            <!-- Component Detail Panel (hidden by default) -->
            <div id="componentDetailPanel" style="display:none;margin-top:10px;background:rgba(10,12,20,0.95);border:1px solid rgba(0,229,255,0.2);border-radius:8px;padding:14px;animation:fadeIn 0.3s ease"></div>
        </div>
        
        <div style="margin-top:24px; padding:12px; background:rgba(124,77,255,0.05); border:1px solid rgba(124,77,255,0.15); border-radius:6px; font-size:10px; color:#b0bec5; line-height:1.6;">
            <strong style="color:#7c4dff">MISSION IMPACT:</strong> ${s.name} is a critical node in the Slingshot Global Sensor Network. Its edge-computed observations feed directly into the SentinelForge orbit determination pipeline, enabling high-fidelity covariance realism and actionable conjunction assessments for DoD and commercial clients.
        </div>

        <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            <span style="color:#546e7a;font-size:9px;text-transform:uppercase;letter-spacing:.5px">Navigate:</span>
            <a href="sentinel_slingshot_programmer.html" style="color:#00e5ff;font-size:10px;text-decoration:none;padding:4px 12px;border:1px solid rgba(0,229,255,0.2);border-radius:4px;background:rgba(0,229,255,0.04);font-weight:600;transition:all .2s" onmouseover="this.style.background='rgba(0,229,255,0.12)';this.style.borderColor='rgba(0,229,255,0.4)'" onmouseout="this.style.background='rgba(0,229,255,0.04)';this.style.borderColor='rgba(0,229,255,0.2)'">\ud83d\udcbb Programmer's Reference</a>
            <a href="sentinel_slingshot_technician.html" style="color:#ffd740;font-size:10px;text-decoration:none;padding:4px 12px;border:1px solid rgba(255,215,64,0.2);border-radius:4px;background:rgba(255,215,64,0.04);font-weight:600;transition:all .2s" onmouseover="this.style.background='rgba(255,215,64,0.12)'" onmouseout="this.style.background='rgba(255,215,64,0.04)'">\ud83d\udd27 Onsite Technician</a>
        </div>
    `;
    
    detailOverlay.classList.add('open');
    detailPanel.classList.add('open');
}

function closeDetail() {
    detailOverlay.classList.remove('open');
    detailPanel.classList.remove('open');
}

function setupFilters() {
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value.toLowerCase();
        renderGrid();
    });

    document.querySelectorAll('#regionFilters .pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            document.querySelectorAll('#regionFilters .pill').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            activeRegion = e.target.dataset.filter;
            renderGrid();
        });
    });

    document.querySelectorAll('#statusFilters .pill').forEach(pill => {
        pill.addEventListener('click', (e) => {
            document.querySelectorAll('#statusFilters .pill').forEach(p => p.classList.remove('active'));
            e.target.classList.add('active');
            activeStatus = e.target.dataset.status;
            renderGrid();
        });
    });
}

function openProgrammerPanel(stationId) {
    const s = STATIONS.find(st => st.id === stationId);
    if (!s) return;
    const slug = stationId.replace('SLING-NUM-', '').toLowerCase();
    const sc = s.status === 'active' ? '#00e676' : s.status === 'degraded' ? '#ffab00' : '#ff1744';
    const gpuCol = s.gpu > 70 ? '#ff9100' : s.gpu > 50 ? '#ffd740' : '#00e676';

    detailContent.innerHTML = `
        <h2>${s.name} — Programmer's Reference</h2>
        <div class="detail-id">${s.id} · <span style="color:${sc};text-transform:uppercase">${s.status}</span></div>

        <div class="detail-section">
            <h3><span class="icon">🔌</span> REST API Endpoints</h3>
            <table class="detail-table"><tbody>
                <tr><td>Health Check</td><td><code style="color:#76ff03;background:rgba(118,255,3,0.08);padding:1px 6px;border-radius:3px;font-size:10px">GET /api/v2/sites/${slug}/health</code></td></tr>
                <tr><td>Telemetry Stream</td><td><code style="color:#76ff03;background:rgba(118,255,3,0.08);padding:1px 6px;border-radius:3px;font-size:10px">GET /api/v2/sites/${slug}/telemetry?interval=5s</code></td></tr>
                <tr><td>Submit TDM</td><td><code style="color:#ffd740;background:rgba(255,215,64,0.08);padding:1px 6px;border-radius:3px;font-size:10px">POST /api/v2/sites/${slug}/tdm</code></td></tr>
                <tr><td>Queue Status</td><td><code style="color:#76ff03;background:rgba(118,255,3,0.08);padding:1px 6px;border-radius:3px;font-size:10px">GET /api/v2/sites/${slug}/queue</code></td></tr>
                <tr><td>Task Schedule</td><td><code style="color:#ffd740;background:rgba(255,215,64,0.08);padding:1px 6px;border-radius:3px;font-size:10px">PUT /api/v2/sites/${slug}/schedule</code></td></tr>
                <tr><td>Calibration Data</td><td><code style="color:#76ff03;background:rgba(118,255,3,0.08);padding:1px 6px;border-radius:3px;font-size:10px">GET /api/v2/sites/${slug}/calibration</code></td></tr>
                <tr><td>Edge Logs</td><td><code style="color:#76ff03;background:rgba(118,255,3,0.08);padding:1px 6px;border-radius:3px;font-size:10px">GET /api/v2/sites/${slug}/logs?tail=500</code></td></tr>
            </tbody></table>
        </div>

        <div class="detail-section">
            <h3><span class="icon">⚙️</span> Edge Pipeline Configuration</h3>
            <div style="background:rgba(10,12,20,0.9);border:1px solid rgba(100,160,255,0.08);border-radius:8px;padding:12px;font-family:'JetBrains Mono',monospace;font-size:10px;color:#b0bec5;line-height:1.8;overflow-x:auto;white-space:pre"><span style="color:#546e7a"># /opt/slingshot/config/site.yaml</span>
<span style="color:#7c4dff">site:</span>
  <span style="color:#00e5ff">id:</span> <span style="color:#ffd740">${s.id}</span>
  <span style="color:#00e5ff">name:</span> <span style="color:#ffd740">${s.name}</span>
  <span style="color:#00e5ff">lat:</span> ${s.lat}
  <span style="color:#00e5ff">lon:</span> ${s.lon}

<span style="color:#7c4dff">edge_compute:</span>
  <span style="color:#00e5ff">platform:</span> <span style="color:#ffd740">jetson_agx_orin_64gb</span>
  <span style="color:#00e5ff">cuda_version:</span> <span style="color:#ffd740">12.2</span>
  <span style="color:#00e5ff">tensorrt:</span> <span style="color:#ffd740">8.6.1</span>
  <span style="color:#00e5ff">gpu_budget_pct:</span> <span style="color:${gpuCol}">${s.gpu}</span>

<span style="color:#7c4dff">pipeline:</span>
  <span style="color:#00e5ff">streak_detect:</span>
    <span style="color:#00e5ff">model:</span> <span style="color:#ffd740">pinn_streak_v3.2.engine</span>
    <span style="color:#00e5ff">filter_bank:</span> <span style="color:#ffd740">J2-J6_matched</span>
    <span style="color:#00e5ff">min_snr:</span> 3.5

<span style="color:#7c4dff">transport:</span>
  <span style="color:#00e5ff">kafka:</span>
    <span style="color:#00e5ff">brokers:</span> <span style="color:#ffd740">[beacon-ingest-01.slingshot.cloud:9092]</span>
    <span style="color:#00e5ff">topic:</span> <span style="color:#ffd740">site.${slug}.tdm</span>
    <span style="color:#00e5ff">compression:</span> <span style="color:#ffd740">zstd</span></div>
        </div>

        <div class="detail-section">
            <h3><span class="icon">📦</span> Key Python Modules</h3>
            <table class="detail-table"><tbody>
                <tr><td><code style="color:#b388ff;font-size:10px">streak_detect.cu</code></td><td>PINN-accelerated matched-filter streak detection. CUDA kernel uses J2-J6 perturbation bank for LEO rate-matching.</td></tr>
                <tr><td><code style="color:#b388ff;font-size:10px">bayesian_iod.py</code></td><td>Initial Orbit Determination from 3+ tracklets. Gauss method + UKF refinement. Outputs state vector in TEME frame.</td></tr>
                <tr><td><code style="color:#b388ff;font-size:10px">catalog_lifecycle.py</code></td><td>UCT → TENTATIVE → CATALOGED state machine. Mahalanobis distance correlation.</td></tr>
                <tr><td><code style="color:#b388ff;font-size:10px">kafka_transport.py</code></td><td>Edge→Cloud Kafka producer. Protobuf TDMs with zstd compression. Offline queueing.</td></tr>
                <tr><td><code style="color:#b388ff;font-size:10px">site_monitor.py</code></td><td>Health daemon: GPU temp/util, dome, weather, queue. JSON telemetry every 5s.</td></tr>
                <tr><td><code style="color:#b388ff;font-size:10px">scheduler.py</code></td><td>Priority-weighted observation scheduler. Beacon targets + horizon mask + weather forecast.</td></tr>
            </tbody></table>
        </div>

        <div class="detail-section">
            <h3><span class="icon">🛠️</span> SSH & Debug Commands</h3>
            <table class="detail-table"><tbody>
                <tr><td>SSH Access</td><td><code style="color:#ffd740;background:rgba(255,215,64,0.08);padding:1px 6px;border-radius:3px;font-size:10px">ssh edge@${slug}.slingshot.internal -p 2222</code></td></tr>
                <tr><td>GPU Status</td><td><code style="color:#76ff03;background:rgba(118,255,3,0.08);padding:1px 6px;border-radius:3px;font-size:10px">jetson_health --diag --json</code></td></tr>
                <tr><td>Pipeline Status</td><td><code style="color:#76ff03;background:rgba(118,255,3,0.08);padding:1px 6px;border-radius:3px;font-size:10px">systemctl status slingshot-pipeline</code></td></tr>
                <tr><td>Restart Pipeline</td><td><code style="color:#ff8a80;background:rgba(255,23,68,0.08);padding:1px 6px;border-radius:3px;font-size:10px">sudo systemctl restart slingshot-pipeline</code></td></tr>
                <tr><td>Tail Detections</td><td><code style="color:#76ff03;background:rgba(118,255,3,0.08);padding:1px 6px;border-radius:3px;font-size:10px">journalctl -u slingshot-pipeline -f --output=json</code></td></tr>
                <tr><td>Kafka Lag</td><td><code style="color:#76ff03;background:rgba(118,255,3,0.08);padding:1px 6px;border-radius:3px;font-size:10px">kafka-consumer-groups --describe --group site-${slug}</code></td></tr>
            </tbody></table>
        </div>

        <div class="detail-section">
            <h3><span class="icon">📐</span> Edge-to-Cloud Data Flow Schematic</h3>
            <div style="background:rgba(10,12,20,0.9);border:1px solid rgba(0,229,255,0.12);border-radius:8px;padding:12px;text-align:center">
                <img src="img/programmer_schematic.png" alt="Edge-to-Cloud Pipeline Schematic — ${s.name}" style="width:100%;max-width:720px;border-radius:6px;opacity:0.95" />
                <div style="margin-top:8px;font-size:9px;color:#546e7a;font-family:'JetBrains Mono',monospace">
                    FIG 2 — ${s.id} DATA FLOW · CCD Frame (32MB) → CUDA Pipeline → TDM (10KB) → Kafka → Cloud Catalog
                </div>
            </div>
        </div>

        <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            <span style="color:#546e7a;font-size:9px;text-transform:uppercase;letter-spacing:.5px">Navigate:</span>
            <button onclick="openDetail(STATIONS.find(st=>st.id==='${s.id}'))" style="color:#b388ff;font-size:10px;padding:4px 12px;border:1px solid rgba(179,136,255,0.2);border-radius:4px;background:rgba(179,136,255,0.04);cursor:pointer;font-family:inherit;font-weight:600;transition:all .2s" onmouseover="this.style.background='rgba(179,136,255,0.12)'" onmouseout="this.style.background='rgba(179,136,255,0.04)'">← Station Detail</button>
            <a href="sentinel_slingshot_technician.html" style="color:#ffd740;font-size:10px;text-decoration:none;padding:4px 12px;border:1px solid rgba(255,215,64,0.2);border-radius:4px;background:rgba(255,215,64,0.04);font-weight:600;transition:all .2s" onmouseover="this.style.background='rgba(255,215,64,0.12)'" onmouseout="this.style.background='rgba(255,215,64,0.04)'">🔧 Onsite Technician</a>
        </div>
    `;
    detailOverlay.classList.add('open');
    detailPanel.classList.add('open');
    detailPanel.scrollTop = 0;
}

// ── Interactive Schematic Component Drill-Down ──
const COMPONENT_SPECS = {
    dome: { title:'Baader AllSky Dome', icon:'🏛️', color:'#ffd740', subsystem:'Enclosure',
        specs:[
            ['Manufacturer','Baader Planetarium GmbH (Mammendorf, Germany)'],
            ['Model','AllSky Dome Pro 3.5m'],
            ['Material','UV-stabilized fiberglass shell, powder-coated aluminum base ring'],
            ['Aperture','3.5m diameter, motorized roll-off roof with 280° slit rotation'],
            ['Drive','24V DC gear motor, 45 sec full open/close cycle'],
            ['Weather Seal','EPDM rubber gasket, IP54 rated when closed'],
            ['Automation','RS-232 serial control via ASCOM-compatible driver'],
            ['Safety','Auto-close on: rain detected, wind >45 km/h, humidity >90%, power loss (spring-loaded fail-safe)'],
            ['Weight','~180 kg (shell only), 320 kg total installed'],
            ['Maintenance','Annual: gasket inspection, motor lubrication, rail cleaning. 5-year: full re-coat'],
        ],
        failures:['Motor stall (most common) — replace brushes or full motor unit','Encoder drift — recalibrate home position via limit switch','Gasket degradation — UV damage after 3-5 years in desert sites'],
        partNumbers:['BAA-ASD-350-PRO (dome shell)','BAA-MOT-24V-G (drive motor)','BAA-CTL-RS232 (controller board)','BAA-GSK-EPDM-350 (gasket kit)'],
    },
    weather: { title:'Weather Sensor Package', icon:'🌤️', color:'#76ff03', subsystem:'Environmental',
        specs:[
            ['Primary Station','Davis Vantage Pro2 Plus (6163)'],
            ['Rain Sensor','Davis AeroCone rain collector, 0.2mm resolution, heated tipping bucket'],
            ['Wind','Davis anemometer: speed 1-322 km/h ±5%, direction 0-360° ±3°'],
            ['Humidity','Sensirion SHT31-D, ±2% RH (0-100%), -40 to +125°C'],
            ['Cloud Sensor','Boltwood Cloud Sensor III — IR sky temperature differential'],
            ['All-Sky Camera','ZWO ASI120MM Mini — continuous sky quality monitoring (SQM)'],
            ['Sampling Rate','1 Hz (wind), 10s (temperature/humidity), 60s (cloud cover)'],
            ['Interface','Serial RS-232 + WeatherLink Live (Wi-Fi bridge to edge node)'],
            ['Dome Gate Logic','IF rain OR wind>45 OR humidity>90 OR cloud>80% → CLOSE dome, PARK mount'],
        ],
        failures:['Rain sensor clog (dust/insects) — monthly cleaning required','Anemometer bearing wear — annual replacement at high-wind sites','Cloud sensor IR window fogging — weekly cleaning with IPA'],
        partNumbers:['DAV-6163 (Vantage Pro2)','DAV-6332 (rain collector)','BWD-CS3 (cloud sensor)','ZWO-120MM (sky cam)'],
    },
    telescope: { title:'Focal Telescope 0.5m', icon:'🔭', color:'#b388ff', subsystem:'Primary Optics',
        specs:[
            ['Design','Corrected Dall-Kirkham (CDK) or RASA, f/4 focal ratio'],
            ['Aperture','500mm (20") primary mirror, fused silica substrate'],
            ['Focal Length','2000mm (CDK) or 1120mm (RASA f/2.2 wide-field mode)'],
            ['Coating','Enhanced aluminum + SiO₂ protective overcoat, >95% reflectivity 400-900nm'],
            ['Field of View','0.7° × 0.7° (CDK) or 2.3° diameter (RASA) — optimized for survey'],
            ['Image Scale','0.45 arcsec/pixel (CDK) or 0.81 arcsec/pixel (RASA) with 9μm sensor'],
            ['Tube','Carbon fiber truss, thermally stable to ±0.5°C focus shift'],
            ['Collimation','3-point adjustable secondary with laser collimation reference'],
            ['Limit Magnitude','V~18.5 (60s exposure, dark site, CDK mode)'],
        ],
        failures:['Dew on corrector plate — activate dew heater ring','Collimation drift from thermal cycling — re-collimate at dusk','Primary coating degradation — re-coat every 3-5 years'],
        partNumbers:['PW-CDK20 (PlaneWave CDK20)','CEL-RASA-14 (Celestron RASA 14)','OPT-COAT-AL-SIO2 (re-coating service)'],
    },
    camera: { title:'CCD/sCMOS Detector', icon:'📷', color:'#00e5ff', subsystem:'Imaging',
        specs:[
            ['Type','Back-illuminated sCMOS (Scientific CMOS)'],
            ['Model','Andor Marana 4.2B-11 or ZWO ASI6200MM Pro'],
            ['Sensor','Sony IMX455 (full-frame) — 62 Mpx, 3.76μm pixels'],
            ['QE','Peak 95% @ 550nm, >80% from 400-700nm'],
            ['Read Noise','1.2 e⁻ RMS @ 1 MHz readout, 0.7 e⁻ @ slow scan'],
            ['Dark Current','0.002 e⁻/px/s @ -25°C (TEC cooled, ΔT = -40°C)'],
            ['Frame Rate','2.4 fps full-frame (16-bit), 26 fps ROI crop'],
            ['Dynamic Range','89 dB (16-bit ADC), 15.2 stops'],
            ['Cooling','4-stage TEC, regulated to ±0.1°C setpoint'],
            ['Interface','USB 3.0 Gen 1 (5 Gbps), 120 MB/frame @ 16-bit'],
            ['Data Rate','~288 MB/s sustained (full frame at 2.4 fps)'],
        ],
        failures:['TEC power draw spikes in hot climates — verify thermal paste contact','Amp glow at >60s exposures — apply dark frame subtraction','USB disconnect under vibration — use locking USB-B connector'],
        partNumbers:['AND-MAR-42B11 (Marana)','ZWO-ASI6200 (ASI6200MM Pro)','SEN-IMX455 (replacement sensor)'],
    },
    mount: { title:'Direct-Drive Equatorial Mount', icon:'⚙️', color:'#e040fb', subsystem:'Tracking',
        specs:[
            ['Type','Direct-drive torque motor, German equatorial (GEM)'],
            ['Model','PlaneWave L-600 or ASA DDM160'],
            ['Payload Capacity','100 kg (instrument + counterweight)'],
            ['Slew Rate','>5°/sec both axes — critical for LEO intercept'],
            ['Tracking Accuracy','<0.5 arcsec RMS (unguided), <0.15 arcsec RMS (autoguided)'],
            ['Pointing Accuracy','<10 arcsec RMS after T-Point model (200+ star calibration)'],
            ['Encoder','Absolute on-axis encoders, 0.035 arcsec resolution'],
            ['Control','ASCOM + INDI compatible, direct TCP/IP command interface'],
            ['Modes','Sidereal (GEO), Rate-Track (LEO 0.1-2°/s), Scan Survey'],
            ['Polar Alignment','PoleMaster + iterative drift alignment, <5 arcsec residual'],
        ],
        failures:['Encoder contamination (dust ingress) — purge with dry nitrogen','RA bearing preload shift — factory recalibration required','Cable wrap limit — monitor wrap counter, auto-meridian flip'],
        partNumbers:['PW-L600 (PlaneWave L-600)','ASA-DDM160 (ASA DDM160)','PW-ENC-ABS (encoder module)'],
    },
    filterwheel: { title:'Filter Wheel (BVRI+Clear)', icon:'🎨', color:'#ff9100', subsystem:'Photometry',
        specs:[
            ['Model','Finger Lakes Instrumentation CFW3-10 (10-position)'],
            ['Filters Installed','Johnson-Cousins B, V, R, I + Clear (Luminance) + SWIR 850nm + NIR 950nm'],
            ['Filter Size','50mm × 50mm square unmounted, 2mm Schott glass'],
            ['Change Time','<500ms between adjacent positions, <2s worst-case'],
            ['Repeatability','±5μm positional repeatability'],
            ['Interface','USB 2.0, ASCOM driver'],
            ['Daylight Config','Positions 6-7 loaded with narrow-band SWIR/NIR for daytime satellite tracking'],
            ['Calibration','Nightly flat-field sequence per filter, master flats updated weekly'],
        ],
        failures:['Filter wheel motor skip — clean drive belt, check tension','Filter coating degradation (NIR) — replace after 10,000 hours UV exposure','Position sensor misalignment — recalibrate home position'],
        partNumbers:['FLI-CFW3-10 (wheel)','SCH-BG39-50 (B filter)','SCH-OG570-50 (V filter)','SCH-RG610-50 (R filter)'],
    },
    focuser: { title:'Motorized Focuser', icon:'🔩', color:'#78909c', subsystem:'Focus Control',
        specs:[
            ['Model','MoonLite NiteCrawler WR35 or Pegasus FocusCube 3'],
            ['Travel','35mm total, 0.1μm step resolution'],
            ['Motor','Stepper motor with 1:64 gear reduction, zero-backlash'],
            ['Temperature Compensation','Auto-focus slope calibrated per filter (μm/°C), updates every 5 min'],
            ['Autofocus Method','V-curve (HFD minimization) using 9-point sampling'],
            ['Interface','USB 2.0, ASCOM-compatible'],
            ['Response Time','Full travel in <10s, typical refocus <2s'],
        ],
        failures:['Stepper motor stall at extreme cold (<-20°C) — apply low-temp grease','Backlash creep — always approach focus from same direction','USB timeout during long exposures — increase watchdog timer'],
        partNumbers:['ML-WR35 (NiteCrawler)','PEG-FC3 (FocusCube 3)','ML-STEP-M (replacement motor)'],
    },
    jetson: { title:'NVIDIA Jetson AGX Orin 64GB', icon:'🖥️', color:'#76ff03', subsystem:'Edge Compute',
        specs:[
            ['Platform','NVIDIA Jetson AGX Orin Developer Kit'],
            ['GPU','2048 CUDA cores + 64 Tensor Cores (Ampere), 275 TOPS AI'],
            ['CPU','12-core Arm Cortex-A78AE @ 2.2 GHz'],
            ['Memory','64GB LPDDR5, 204.8 GB/s bandwidth'],
            ['Storage','512GB NVMe SSD (pipeline) + 2TB SATA SSD (buffer/archive)'],
            ['TDP','15-60W configurable (typically 40W for SSA pipeline)'],
            ['OS','JetPack 6.0 (Ubuntu 22.04 + CUDA 12.2 + TensorRT 8.6.1)'],
            ['Pipeline','streak_detect.cu (PINN v3.2) → bayesian_iod.py → catalog_lifecycle.py → kafka_transport.py'],
            ['Throughput','12.4 fps sustained (1920×1280 ROI), 8.2 fps full-frame'],
            ['Thermal','Active fan + heatsink, thermal throttle at 97°C junction'],
        ],
        failures:['GPU thermal throttle in hot enclosures — add auxiliary fan or ducting','NVMe wear (TBW) — monitor S.M.A.R.T., replace annually','Power brownout corruption — ensure clean UPS switchover'],
        partNumbers:['NV-ORIN-64 (Orin 64GB)','SAM-980PRO-512 (NVMe)','NF-A4x20 (auxiliary fan)'],
    },
    ups: { title:'UPS Battery Backup', icon:'🔋', color:'#ffd740', subsystem:'Power',
        specs:[
            ['Type','LiFePO4 battery pack with integrated MPPT charge controller'],
            ['Capacity','2.4 kWh (48V, 50Ah) — 8 hours runtime at 300W load'],
            ['Chemistry','Lithium Iron Phosphate (LiFePO4) — 3000+ cycle life'],
            ['Switchover','<10ms transfer time (uninterruptible)'],
            ['Charging','AC mains primary + solar panel auxiliary (where available)'],
            ['Monitoring','BMS with cell-level voltage/temp monitoring, JSON telemetry via RS-485'],
            ['Operating Temp','-20°C to +55°C (derated above 45°C)'],
            ['Safety','Overcharge, over-discharge, short-circuit, and thermal runaway protection'],
        ],
        failures:['Cell imbalance after 1000+ cycles — run full balance charge quarterly','BMS communication loss — check RS-485 termination resistor','Capacity fade in extreme cold — pre-heat battery before charging'],
        partNumbers:['BAT-LFP-48V50 (battery pack)','BMS-48V-100A (management system)','MPPT-60A (charge controller)'],
    },
    starlink: { title:'Starlink Uplink Terminal', icon:'📡', color:'#448aff', subsystem:'Communications',
        specs:[
            ['Model','SpaceX Starlink Business Kit (rectangular phased-array)'],
            ['Downlink','100-300 Mbps typical, 500 Mbps peak'],
            ['Uplink','20-40 Mbps typical'],
            ['Latency','25-60 ms (LEO constellation)'],
            ['Role','Primary or backup WAN uplink depending on site fiber availability'],
            ['Mounting','Roof-mount or pole-mount with clear sky view (no obstructions >25° elevation)'],
            ['Power','75-100W typical, PoE injector from UPS circuit'],
            ['Failover','Automatic WAN failover via dual-WAN router (fiber primary, Starlink secondary)'],
        ],
        failures:['Snow/ice accumulation on dish — enable built-in dish heater','Firmware update causing reboot — schedule maintenance window','Obstruction from tree growth — quarterly sky view audit'],
        partNumbers:['SL-BIZ-KIT (Starlink Business)','SL-POLE-MT (pole mount adapter)','UBI-ER-8 (dual-WAN router)'],
    },
    ota: { title:'Optical Telescope Assembly', icon:'🔭', color:'#b388ff', subsystem:'Optical Train',
        specs:[
            ['Configuration','OTA = Primary Mirror + Secondary/Corrector + Baffle + Tube Assembly'],
            ['Baffle','Internal knife-edge baffles — reject stray moonlight and city glow'],
            ['Spider Vanes','4-vane thin-profile (0.5mm) — minimizes diffraction spikes on point sources'],
            ['Dew Prevention','Dew heater ring on corrector plate, 12V/25W, thermostat-regulated'],
            ['Tube Currents','Forced-air tube ventilation fans (2×80mm) to equalize mirror-to-ambient temp'],
            ['Shroud','Removable light shroud for stray light rejection in moonlit conditions'],
        ],
        failures:['Dew heater failure — streaked images, replace heater strip','Tube current fans failed — elongated stars, check 12V rail','Baffle loosened by vibration — retighten set screws during maintenance visit'],
        partNumbers:['OTA-BAFFLE-500 (baffle set)','DEW-HEAT-25W (heater ring)','FAN-80MM-12V (tube ventilation fan)'],
    },
    usb: { title:'USB 3.0 Data Bus', icon:'🔌', color:'#00e5ff', subsystem:'Data Transport',
        specs:[
            ['Standard','USB 3.0 Gen 1 (5 Gbps raw, ~400 MB/s sustained)'],
            ['Cable','Active optical USB 3.0 cable, 10m max run (camera → Jetson)'],
            ['Hub','Powered 7-port USB 3.0 hub (filter wheel, focuser, GPS, weather station)'],
            ['Data Volume','~288 MB/s peak (full-frame camera), ~50 MB/s average with ROI'],
            ['Latency','<1ms frame transfer latency'],
            ['Protection','Surge-protected USB ports, ferrite chokes on all cables'],
        ],
        failures:['USB disconnect under vibration — use locking connectors + strain relief','Bandwidth saturation with multiple devices — isolate camera on dedicated port','EMI interference from mount motors — add ferrite cores'],
        partNumbers:['USB3-AOC-10M (active optical cable)','USB3-HUB-7P (powered hub)','FER-USB-CLIP (ferrite choke)'],
    },
    networking: { title:'RS-232 / Ethernet / Power Bus', icon:'🔗', color:'#78909c', subsystem:'Site Infrastructure',
        specs:[
            ['RS-232','Serial control bus for dome motor, mount, and legacy peripherals'],
            ['RS-232 Adapter','FTDI USB-to-Serial (4-port) — reliable ASCOM/INDI compatibility'],
            ['Ethernet','Gigabit Ethernet (Cat6A) — Jetson to dual-WAN router'],
            ['Network Switch','Ubiquiti USW-Flex-Mini — 5-port managed PoE switch'],
            ['VPN','WireGuard tunnel to Slingshot Cloud (Azure West US 2)'],
            ['Firewall','UFW + fail2ban, SSH key-only auth, no inbound except VPN'],
            ['Power Distribution','DIN-rail 48V→12V/5V DC converters for instrument bus'],
        ],
        failures:['RS-232 cable ground loop — isolate with optocoupler','Ethernet cable weather damage (outdoor run) — use gel-filled Cat6A','Switch PoE budget exceeded — verify total draw < 46W'],
        partNumbers:['FTDI-USB4-SER (4-port serial adapter)','UBI-USW-FLEX (network switch)','DIN-48-12V (DC converter)'],
    },
    power: { title:'AC/DC Power System', icon:'⚡', color:'#ff5252', subsystem:'Power Infrastructure',
        specs:[
            ['Input','Single-phase AC mains (110-240V, 50/60Hz auto-sensing)'],
            ['UPS Transfer','<10ms switchover, pure sine wave output'],
            ['Total Draw','~300W nominal (all systems active), 450W peak (dome + slew + camera)'],
            ['DC Rails','48V (UPS/battery), 24V (dome motor), 12V (instruments), 5V (USB/logic)'],
            ['Grounding','Dedicated earth ground rod + equipment bonding per NEC/IEC standards'],
            ['Surge Protection','Type 2 SPD on AC mains, TVS diodes on all DC rails'],
            ['Solar (where equipped)','2× 400W panels, MPPT controller, supplements battery charge'],
            ['Generator (where equipped)','Diesel auto-start on AC loss + battery <30%, 5kW rated'],
        ],
        failures:['AC mains fluctuation — SPD absorbs, UPS compensates, log event','Ground fault — GFCI trips, isolate fault before reset','Generator start failure — weekly no-load test, annual fuel filter change'],
        partNumbers:['SPD-T2-40KA (surge protector)','GEN-5KW-DSL (diesel generator)','SOL-400W-MONO (solar panel)'],
    },
};

function openComponentDetail(componentId) {
    const c = COMPONENT_SPECS[componentId];
    if (!c) return;
    const panel = document.getElementById('componentDetailPanel');
    if (!panel) return;

    const specsHtml = c.specs.map(s =>
        '<tr><td style="color:#78909c;width:160px;vertical-align:top;white-space:nowrap">' + s[0] + '</td>'
        + '<td style="color:#e8eaf6">' + s[1] + '</td></tr>'
    ).join('');

    const failHtml = c.failures.map(f =>
        '<li style="margin-bottom:4px;color:#ffab00">' + f + '</li>'
    ).join('');

    const partHtml = c.partNumbers.map(p =>
        '<code style="display:inline-block;margin:2px 4px 2px 0;padding:2px 8px;background:rgba(0,229,255,0.06);border:1px solid rgba(0,229,255,0.15);border-radius:3px;color:#00e5ff;font-size:9px">' + p + '</code>'
    ).join('');

    panel.style.display = 'block';
    panel.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px">'
        + '<div style="display:flex;align-items:center;gap:8px">'
        + '<span style="font-size:18px">' + c.icon + '</span>'
        + '<span style="font-size:14px;font-weight:800;color:' + c.color + '">' + c.title + '</span>'
        + '<span style="font-size:9px;padding:2px 8px;border-radius:10px;background:rgba(255,255,255,0.05);color:#78909c;border:1px solid rgba(255,255,255,0.1)">' + c.subsystem + '</span>'
        + '</div>'
        + '<button onclick="document.getElementById(\'componentDetailPanel\').style.display=\'none\'" style="background:none;border:1px solid rgba(255,255,255,0.1);color:#78909c;cursor:pointer;padding:2px 8px;border-radius:4px;font-family:inherit;font-size:10px">✕ Close</button>'
        + '</div>'
        + '<table class="detail-table" style="margin-bottom:12px"><tbody>' + specsHtml + '</tbody></table>'
        + '<div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">'
        + '<div style="background:rgba(255,171,0,0.04);border:1px solid rgba(255,171,0,0.12);border-radius:6px;padding:8px">'
        + '<div style="font-size:9px;color:#ffab00;font-weight:700;margin-bottom:4px;text-transform:uppercase;letter-spacing:.5px">⚠️ Known Failure Modes</div>'
        + '<ul style="margin:0;padding-left:14px;font-size:10px;line-height:1.6">' + failHtml + '</ul></div>'
        + '<div style="background:rgba(0,229,255,0.04);border:1px solid rgba(0,229,255,0.12);border-radius:6px;padding:8px">'
        + '<div style="font-size:9px;color:#00e5ff;font-weight:700;margin-bottom:6px;text-transform:uppercase;letter-spacing:.5px">📦 Part Numbers / Procurement</div>'
        + '<div>' + partHtml + '</div></div></div>';

    panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

window.addEventListener('DOMContentLoaded', init);
