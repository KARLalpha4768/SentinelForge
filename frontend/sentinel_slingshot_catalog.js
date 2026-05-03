// SentinelForge — Slingshot Technology Catalog Logic

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

// Rich detailed technology and operations data for the Slingshot network
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

// DOM Elements
const grid = document.getElementById('stationGrid');
const searchInput = document.getElementById('searchInput');
const detailOverlay = document.getElementById('detailOverlay');
const detailPanel = document.getElementById('detailPanel');
const detailContent = document.getElementById('detailContent');
const heroStats = document.getElementById('heroStats');

// State
let activeRegion = 'ALL';
let activeStatus = 'ALL';
let searchQuery = '';

// Init
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

    heroStats.innerHTML = \`
        <div class="hero-stat"><div class="num">\${STATIONS.length}</div><div class="lbl">Global Sites</div></div>
        <div class="hero-stat"><div class="num">\${activeCount}</div><div class="lbl">Active Tracking</div></div>
        <div class="hero-stat"><div class="num">\${totalGPU}%</div><div class="lbl">Avg Edge GPU Load</div></div>
        <div class="hero-stat"><div class="num">\${avgSeeing}"</div><div class="lbl">Avg Seeing</div></div>
        <div class="hero-stat"><div class="num">24/7</div><div class="lbl">Operations</div></div>
    \`;
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
        card.className = \`station-card \${s.status}\`;
        card.innerHTML = \`
            <div class="card-header">
                <div class="card-status \${statusCls}"></div>
                <div class="card-id">\${s.id}</div>
                <div class="card-name">\${s.name}</div>
                <div class="card-region \${regionCls}">\${s.region}</div>
            </div>
            <div class="card-body">
                <div class="card-metrics">
                    <div class="metric"><div class="val">\${s.lat.toFixed(1)}°</div><div class="key">LAT</div></div>
                    <div class="metric"><div class="val">\${s.lon.toFixed(1)}°</div><div class="key">LON</div></div>
                    <div class="metric"><div class="val">\${s.gpu}%</div><div class="key">EDGE GPU</div></div>
                    <div class="metric"><div class="val">\${s.seeing}"</div><div class="key">SEEING</div></div>
                </div>
                <div class="card-tech">
                    <span class="tech-tag tech-optical">MULTI-APERTURE</span>
                    <span class="tech-tag tech-gpu">JETSON ORIN</span>
                    <span class="tech-tag tech-dome">AUTONOMOUS</span>
                    <span class="tech-tag tech-day">DAYLIGHT TRACKING</span>
                </div>
                <div class="card-ops"><strong>Role:</strong> \${s.ops}</div>
            </div>
        \`;
        
        card.addEventListener('click', () => openDetail(s));
        grid.appendChild(card);
    });
}

function openDetail(s) {
    const statusCls = s.status === 'active' ? '#00e676' : s.status === 'degraded' ? '#ffab00' : '#ff1744';
    
    detailContent.innerHTML = \`
        <h2>\${s.name} Ground Station</h2>
        <div class="detail-id">\${s.id} · <span style="color:\${statusCls};text-transform:uppercase">\${s.status}</span></div>
        
        <div class="map-container" style="height:180px; margin-bottom:20px; background:url('img/sat_earth_obs.png') center/cover; position:relative; border-radius:8px; border:1px solid rgba(255,255,255,0.1);">
            <div style="position:absolute; bottom:10px; left:10px; background:rgba(0,0,0,0.8); padding:4px 8px; border-radius:4px; font-size:10px; font-family:'JetBrains Mono',monospace; color:#00e5ff;">
                COORD: \${s.lat.toFixed(4)}°, \${s.lon.toFixed(4)}°
            </div>
        </div>

        <div class="detail-section">
            <h3><span class="icon">💻</span> Site Metrics & Connectivity</h3>
            <div class="tech-spec-grid">
                <div class="tech-spec-item">
                    <div class="ts-label">Edge GPU Load</div>
                    <div class="ts-value" style="color:#00e5ff">\${s.gpu}%</div>
                </div>
                <div class="tech-spec-item">
                    <div class="ts-label">Current Seeing</div>
                    <div class="ts-value">\${s.seeing} arcsec</div>
                </div>
                <div class="tech-spec-item">
                    <div class="ts-label">Task Queue</div>
                    <div class="ts-value">\${s.queue} pending</div>
                </div>
                <div class="tech-spec-item">
                    <div class="ts-label">Network Uplink</div>
                    <div class="ts-value" style="color:#00e676">Secure WAN (IPsec)</div>
                </div>
            </div>
        </div>

        <div class="detail-section">
            <h3><span class="icon">🔭</span> Hardware & Technology Profile</h3>
            <table class="detail-table">
                <tbody>
                    <tr><td>Sensor Array</td><td>\${NETWORK_TECH_SPECS.optics}</td></tr>
                    <tr><td>Tracking Mounts</td><td>\${NETWORK_TECH_SPECS.mounts}</td></tr>
                    <tr><td>Detectors</td><td>\${NETWORK_TECH_SPECS.detectors}</td></tr>
                    <tr><td>Daylight Tracking</td><td>\${NETWORK_TECH_SPECS.daylight}</td></tr>
                    <tr><td>Enclosure</td><td>\${NETWORK_TECH_SPECS.enclosures}</td></tr>
                    <tr><td>Edge Compute</td><td>\${NETWORK_TECH_SPECS.edgeCompute}</td></tr>
                </tbody>
            </table>
        </div>

        <div class="detail-section">
            <h3><span class="icon">⚙️</span> Standard Operating Procedures</h3>
            <ul class="ops-checklist">
                \${OPS_PROCEDURES.map(op => \`<li><strong>\${op.step}:</strong> \${op.desc}</li>\`).join('')}
            </ul>
        </div>
        
        <div style="margin-top:24px; padding:12px; background:rgba(124,77,255,0.05); border:1px solid rgba(124,77,255,0.15); border-radius:6px; font-size:10px; color:#b0bec5; line-height:1.6;">
            <strong style="color:#7c4dff">MISSION IMPACT:</strong> \${s.name} is a critical node in the Slingshot Global Sensor Network. Its edge-computed observations feed directly into the SentinelForge orbit determination pipeline, enabling high-fidelity covariance realism and actionable conjunction assessments for DoD and commercial clients.
        </div>
    \`;
    
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

// Boot
window.addEventListener('DOMContentLoaded', init);
