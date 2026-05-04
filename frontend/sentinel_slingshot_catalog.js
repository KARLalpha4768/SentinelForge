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
        
        <div style="margin-top:24px; padding:12px; background:rgba(124,77,255,0.05); border:1px solid rgba(124,77,255,0.15); border-radius:6px; font-size:10px; color:#b0bec5; line-height:1.6;">
            <strong style="color:#7c4dff">MISSION IMPACT:</strong> ${s.name} is a critical node in the Slingshot Global Sensor Network. Its edge-computed observations feed directly into the SentinelForge orbit determination pipeline, enabling high-fidelity covariance realism and actionable conjunction assessments for DoD and commercial clients.
        </div>

        <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            <span style="color:#546e7a;font-size:9px;text-transform:uppercase;letter-spacing:.5px">Navigate:</span>
            <button onclick="openProgrammerPanel('${s.id}')" style="color:#00e5ff;font-size:10px;padding:4px 12px;border:1px solid rgba(0,229,255,0.2);border-radius:4px;background:rgba(0,229,255,0.04);cursor:pointer;font-family:inherit;font-weight:600;transition:all .2s" onmouseover="this.style.background='rgba(0,229,255,0.12)';this.style.borderColor='rgba(0,229,255,0.4)'" onmouseout="this.style.background='rgba(0,229,255,0.04)';this.style.borderColor='rgba(0,229,255,0.2)'">\ud83d\udcbb Programmer's Sheet</button>
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

        <div style="margin-top:14px;display:flex;gap:8px;flex-wrap:wrap;align-items:center">
            <span style="color:#546e7a;font-size:9px;text-transform:uppercase;letter-spacing:.5px">Navigate:</span>
            <button onclick="openDetail(STATIONS.find(st=>st.id==='${s.id}'))" style="color:#b388ff;font-size:10px;padding:4px 12px;border:1px solid rgba(179,136,255,0.2);border-radius:4px;background:rgba(179,136,255,0.04);cursor:pointer;font-family:inherit;font-weight:600;transition:all .2s" onmouseover="this.style.background='rgba(179,136,255,0.12)'" onmouseout="this.style.background='rgba(179,136,255,0.04)'">← Station Detail</button>
            <a href="sentinel_slingshot_technician.html" style="color:#ffd740;font-size:10px;text-decoration:none;padding:4px 12px;border:1px solid rgba(255,215,64,0.2);border-radius:4px;background:rgba(255,215,64,0.04);font-weight:600;transition:all .2s" onmouseover="this.style.background='rgba(255,215,64,0.12)'" onmouseout="this.style.background='rgba(255,215,64,0.04)'">🔧 Onsite Technician</a>
        </div>
    `;
    detailPanel.scrollTop = 0;
}

window.addEventListener('DOMContentLoaded', init);
