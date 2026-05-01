/* SentinelForge Ops Center — Core Engine */

// ── Simulated System State ──────────────────────────
const STATE = {
    catalog: { total: 46238, leo: 32104, meo: 3218, geo: 6412, heo: 3890, cislunar: 614 },
    ucts: [
        { id:'UCT-0091', state:'tentative', passes:4, sma:6878, inc:51.6, material:'Aluminum', rcs:0.8, first:'2026-05-01T03:22Z' },
        { id:'UCT-0092', state:'uct', passes:1, sma:7200, inc:98.1, material:'Unknown', rcs:0.1, first:'2026-05-01T18:44Z' },
        { id:'UCT-0093', state:'tentative', passes:5, sma:42164, inc:0.1, material:'Solar Panel', rcs:4.2, first:'2026-04-30T12:10Z' },
        { id:'UCT-0094', state:'uct', passes:2, sma:6950, inc:72.0, material:'MLI', rcs:0.3, first:'2026-05-01T16:55Z' },
    ],
    conjunctions: [
        { id:'EVT-2041', pri:25544, priName:'ISS', sec:44832, secName:'COSMOS DEB', tca:'2026-05-02T14:22Z', miss:0.42, pc:3.2e-3, vel:14.1, tier:'RED' },
        { id:'EVT-2042', pri:48274, priName:'STARLINK-3391', sec:99201, secName:'CZ-3B DEB', tca:'2026-05-03T08:55Z', miss:1.8, pc:8.1e-5, tier:'YELLOW' },
        { id:'EVT-2043', pri:43013, priName:'NOAA-20', sec:27386, secName:'FENGYUN DEB', tca:'2026-05-02T22:10Z', miss:0.18, pc:0.041, vel:13.8, tier:'EMERGENCY' },
    ],
    sites: [], // Loaded from site_registry.json
    siteNetworks: {},
    telemetry: [
        // External Data Feeds
        { id:'SPACETRACK', name:'Space-Track.org', type:'external', protocol:'REST API', freq:'Every 8h', latency:'12ms', throughput:'~4,200 TLEs/cycle', status:'active', desc:'18th SDS GP catalog, CDMs, decay predictions' },
        { id:'CELESTRAK', name:'CelesTrak', type:'external', protocol:'REST/CSV', freq:'Every 4h', throughput:'~46K TLEs/cycle', latency:'8ms', status:'active', desc:'Supplemental TLEs, Starlink/OneWeb groups, analyst sats' },
        { id:'SWPC', name:'NOAA SWPC', type:'external', protocol:'JSON API', freq:'Every 1min', latency:'45ms', throughput:'12 indices/min', status:'active', desc:'F10.7, Kp, Dst, Ap, solar wind, CME alerts' },
        { id:'USGS-EOP', name:'USGS/IERS EOP', type:'external', protocol:'FTP', freq:'Daily', latency:'200ms', throughput:'1 bulletin/day', status:'active', desc:'Earth Orientation Parameters (polar motion, UT1-UTC, LOD)' },
        { id:'GNSS-TIME', name:'GPS/GNSS Timing', type:'external', protocol:'NTP/PPS', freq:'1 PPS', latency:'<1μs', throughput:'Continuous', status:'active', desc:'Precision timing for all edge nodes via GPS disciplined oscillator' },
        { id:'ILRS', name:'ILRS SLR Data', type:'external', protocol:'FTP/CDDIS', freq:'Daily', latency:'6h', throughput:'~200 passes/day', status:'active', desc:'Satellite Laser Ranging normal points for orbit cal/val' },
        // Commercial Sensor Feeds
        { id:'EXOANALYTIC', name:'ExoAnalytic EGTN', type:'commercial', protocol:'REST API', freq:'Near real-time', latency:'30ms', throughput:'~12K obs/night', status:'active', desc:'350+ telescope network, GEO/deep-space astrometry + photometry' },
        { id:'LEOLABS', name:'LeoLabs Radar', type:'commercial', protocol:'REST API', freq:'Near real-time', latency:'15ms', throughput:'~8K tracks/day', status:'active', desc:'11 phased-array radars, LEO tracking down to 2cm' },
        { id:'SLINGSHOT', name:'Slingshot/Numerica', type:'commercial', protocol:'REST API', freq:'Near real-time', latency:'22ms', throughput:'~6K obs/night', status:'active', desc:'130+ optical sensors, daylight tracking capability' },
        { id:'ESA-SST', name:'ESA SST Network', type:'allied', protocol:'CCSDS NDM', freq:'Hourly', latency:'120ms', throughput:'~2K obs/cycle', status:'active', desc:'12 EU sensors, OGS Tenerife, Fly-Eye, GRAVES radar' },
        { id:'ISON', name:'ISON Network', type:'allied', protocol:'MPC Format', freq:'Nightly', latency:'2h', throughput:'~1K obs/night', status:'active', desc:'International Scientific Optical Network, 40+ sites' },
        { id:'COMSPOC', name:'COMSPOC Analytics', type:'commercial', protocol:'REST API', freq:'On-demand', latency:'50ms', throughput:'CDMs/ephemeris', status:'active', desc:'High-definition ephemeris, Pc topology, maneuver detection' },
        // Internal Pipeline
        { id:'KAFKA', name:'Kafka Message Bus', type:'internal', protocol:'SSL/Avro', freq:'Continuous', latency:'3ms', throughput:'~25K msgs/min', status:'active', desc:'Edge→Cloud streaming: observations, alerts, health, schedules' },
        { id:'POSTGIS', name:'PostGIS Catalog DB', type:'internal', protocol:'PostgreSQL', freq:'Continuous', latency:'1ms', throughput:'~500 upserts/sec', status:'active', desc:'Spatial catalog store with GIST indexes, 46K objects' },
        { id:'WEBSOCKET', name:'WebSocket Twin', type:'internal', protocol:'WS/JSON', freq:'5 sec push', latency:'2ms', throughput:'All panels', status:'active', desc:'Real-time dashboard feed via FastAPI → browser' },
        { id:'REDIS', name:'Redis Cache', type:'internal', protocol:'Redis Protocol', freq:'Continuous', latency:'<1ms', throughput:'~10K ops/sec', status:'active', desc:'Hot cache for propagated states, conjunction screening results' },
        { id:'S3-ARCHIVE', name:'S3 Archive', type:'internal', protocol:'S3 API', freq:'Hourly batch', latency:'15ms', throughput:'~2GB/day', status:'active', desc:'Long-term observation archive, light curve library, TLE history' },
        // Edge Compute
        { id:'EDGE-CHL', name:'Edge: CHL-01 Orin', type:'edge', protocol:'gRPC', freq:'Continuous', latency:'85ms', throughput:'12.4 fps', status:'active', desc:'Jetson AGX Orin, streak_detect.cu + TensorRT PINN inference' },
        { id:'EDGE-AUS', name:'Edge: AUS-01 Orin', type:'edge', protocol:'gRPC', freq:'Continuous', latency:'140ms', throughput:'11.8 fps', status:'active', desc:'Jetson AGX Orin, matched filter bank + real-time IOD' },
        { id:'EDGE-NAM', name:'Edge: NAM-01 Orin', type:'edge', protocol:'gRPC', freq:'Continuous', latency:'110ms', throughput:'8.2 fps', status:'degraded', desc:'Jetson AGX Orin, reduced throughput due to seeing conditions' },
    ],
    gauges: [
        { key:'detection', label:'Detection Rate', value:87.2, unit:'%', min:0, max:100, green:90, yellow:80 },
        { key:'freshness', label:'Catalog Freshness', value:6.4, unit:'hrs', min:0, max:48, green:8, yellow:24, invert:true },
        { key:'nees', label:'NEES (Covariance)', value:3.02, unit:'', min:0, max:10, green:4, yellow:6 },
        { key:'throughput', label:'Edge Throughput', value:12.4, unit:'fps', min:0, max:30, green:10, yellow:5, invert:true },
        { key:'conjActive', label:'Active Conjunctions', value:3, unit:'', min:0, max:50, green:5, yellow:15 },
        { key:'gpu', label:'GPU Utilization', value:62, unit:'%', min:0, max:100, green:80, yellow:95 },
        { key:'kafkaLag', label:'Kafka Lag', value:4, unit:'msgs', min:0, max:1000, green:10, yellow:100, invert:true },
        { key:'densityErr', label:'Density Model Error', value:18, unit:'%', min:0, max:100, green:25, yellow:50, invert:true },
    ],
    weather: { f107:148, kp:3, dst:-22 },
};

// ── UTC Clock ───────────────────────────────────────
function updateClock() {
    const el = document.getElementById('utcClock');
    if(el) el.textContent = new Date().toISOString().slice(11,19);
}
setInterval(updateClock, 1000); updateClock();

// ── Gauge Rendering (SVG arc gauges) ────────────────
function createGaugeSVG(g) {
    const pct = Math.min((g.value - g.min) / (g.max - g.min), 1);
    const sweep = 240, startA = 150;
    const endA = startA + sweep * pct;
    const r = 22, cx = 28, cy = 28;
    const toRad = a => (a - 90) * Math.PI / 180;
    const arcPath = (sa, ea) => {
        const s = { x: cx + r*Math.cos(toRad(sa)), y: cy + r*Math.sin(toRad(sa)) };
        const e = { x: cx + r*Math.cos(toRad(ea)), y: cy + r*Math.sin(toRad(ea)) };
        const large = (ea-sa) > 180 ? 1 : 0;
        return `M${s.x},${s.y} A${r},${r} 0 ${large} 1 ${e.x},${e.y}`;
    };
    let color;
    if(g.invert) { color = g.value <= g.green ? '#00e676' : g.value <= g.yellow ? '#ffab00' : '#ff1744'; }
    else { color = g.value >= g.green ? '#00e676' : g.value >= g.yellow ? '#ffab00' : '#ff1744'; }
    return `<svg viewBox="0 0 56 56" class="gauge-svg">
        <path d="${arcPath(startA, startA+sweep)}" fill="none" stroke="rgba(255,255,255,0.07)" stroke-width="4" stroke-linecap="round"/>
        <path d="${arcPath(startA, endA)}" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" style="filter:drop-shadow(0 0 4px ${color})"/>
    </svg>`;
}

function renderGauges() {
    const panel = document.getElementById('gaugePanel');
    panel.innerHTML = '<div class="card-header">System Gauges</div>' + STATE.gauges.map(g => {
        const svg = createGaugeSVG(g);
        let color;
        if(g.invert) { color = g.value <= g.green ? '#00e676' : g.value <= g.yellow ? '#ffab00' : '#ff1744'; }
        else { color = g.value >= g.green ? '#00e676' : g.value >= g.yellow ? '#ffab00' : '#ff1744'; }
        return `<div class="gauge-card">${svg}<div class="gauge-info">
            <div class="gauge-label">${g.label}</div>
            <div class="gauge-value" style="color:${color}">${g.value}${g.unit ? ' '+g.unit : ''}</div>
            <div class="gauge-trend"><span class="up">▲ nominal</span></div>
        </div></div>`;
    }).join('');
}

// ── Ground Sites ────────────────────────────────────
function renderSites() {
    const el = document.getElementById('groundSites');
    // Group by network
    const nets = {};
    STATE.sites.forEach(s => { if(!nets[s.network]) nets[s.network]=[]; nets[s.network].push(s); });
    const sorted = Object.entries(nets).sort((a,b) => b[1].length - a[1].length);
    el.innerHTML = '<div class="card-header">Networks · ' + STATE.sites.length + ' Sites</div>' +
    sorted.map(([net, sites]) => {
        const active = sites.filter(s => s.status==='active').length;
        const deg = sites.filter(s => s.status==='degraded').length;
        const off = sites.filter(s => s.status==='offline').length;
        const radar = sites.filter(s => s.type==='radar').length;
        const optical = sites.length - radar;
        const dotCls = off > 0 ? 'degraded' : deg > 0 ? 'degraded' : 'active';
        return `<div class="site-card">
            <div class="site-header">
                <div class="site-dot ${dotCls}"></div>
                <span class="site-name">${net}</span>
                <span style="flex:1"></span>
                <span style="font-size:10px;color:var(--text-secondary)">${sites.length}</span>
            </div>
            <div class="site-stats">
                🟢<span>${active}</span> 🟡<span>${deg}</span> 🔴<span>${off}</span> | Radar <span>${radar}</span> Optical <span>${optical}</span>
            </div>
        </div>`;
    }).join('');
}

// ── Ground Map (Canvas) ─────────────────────────────
function renderMap() {
    const canvas = document.getElementById('mapCanvas');
    if(!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width; canvas.height = rect.height - 33;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#0a0c14'; ctx.fillRect(0,0,canvas.width,canvas.height);
    // Simple world outline
    ctx.strokeStyle = 'rgba(255,255,255,0.08)'; ctx.lineWidth = 1;
    ctx.strokeRect(10,10,canvas.width-20,canvas.height-20);
    // Grid lines
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    for(let i=1;i<6;i++) { const y=10+(canvas.height-20)*i/6; ctx.beginPath(); ctx.moveTo(10,y); ctx.lineTo(canvas.width-10,y); ctx.stroke(); }
    for(let i=1;i<12;i++) { const x=10+(canvas.width-20)*i/12; ctx.beginPath(); ctx.moveTo(x,10); ctx.lineTo(x,canvas.height-20); ctx.stroke(); }
    // Equator
    ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.setLineDash([4,4]);
    const eqY = 10+(canvas.height-20)*0.5; ctx.beginPath(); ctx.moveTo(10,eqY); ctx.lineTo(canvas.width-10,eqY); ctx.stroke();
    ctx.setLineDash([]);
    // Plot all sites color-coded by network
    const netColors = {
        'USSF-SSN':'#ff1744','LeoLabs':'#00e5ff','Slingshot':'#ffd740',
        'ExoAnalytic':'#76ff03','ESA-SST':'#448aff','Contributing':'#e040fb',
    };
    const toXY = (lat,lon) => ({ x: 10+(lon+180)/360*(canvas.width-20), y: 10+(90-lat)/180*(canvas.height-20) });
    STATE.sites.forEach(s => {
        const p = toXY(s.lat, s.lon);
        const col = netColors[s.network] || (s.status==='active' ? '#00e676' : s.status==='degraded' ? '#ffab00' : '#ff1744');
        const r = s.type === 'radar' ? 3 : 2;
        ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2);
        ctx.fillStyle = s.status==='offline' ? '#555' : col;
        ctx.globalAlpha = s.status==='offline' ? 0.3 : 0.8;
        ctx.fill(); ctx.globalAlpha = 1;
    });
    // Legend
    ctx.font = '9px Inter'; let lx = 14, ly = canvas.height - 8;
    Object.entries(netColors).forEach(([name, col]) => {
        ctx.fillStyle = col; ctx.fillRect(lx, ly-6, 8, 8);
        ctx.fillStyle = '#b0bec5'; ctx.fillText(name, lx+11, ly+1);
        lx += ctx.measureText(name).width + 22;
    });
}

// ── Inventory Tabs ──────────────────────────────────
function renderInventory(tab) {
    const el = document.getElementById('invContent');
    if(tab === 'overview') {
        const c = STATE.catalog;
        el.innerHTML = `<div class="inv-summary">
            <div class="inv-stat"><div class="inv-stat-value" style="color:var(--color-leo)">${c.leo.toLocaleString()}</div><div class="inv-stat-label">LEO</div></div>
            <div class="inv-stat"><div class="inv-stat-value" style="color:var(--color-meo)">${c.meo.toLocaleString()}</div><div class="inv-stat-label">MEO</div></div>
            <div class="inv-stat"><div class="inv-stat-value" style="color:var(--color-geo)">${c.geo.toLocaleString()}</div><div class="inv-stat-label">GEO</div></div>
            <div class="inv-stat"><div class="inv-stat-value" style="color:var(--color-heo)">${c.heo+c.cislunar}</div><div class="inv-stat-label">HEO+Cislunar</div></div>
        </div>
        <div style="padding:0 4px;font-size:11px;color:var(--text-secondary)">
            <div style="margin-bottom:6px">Catalog State Breakdown</div>
            <div style="display:flex;gap:4px;height:18px;border-radius:4px;overflow:hidden">
                <div style="flex:${c.leo};background:var(--color-leo);opacity:.7" title="LEO"></div>
                <div style="flex:${c.meo};background:var(--color-meo);opacity:.7" title="MEO"></div>
                <div style="flex:${c.geo};background:var(--color-geo);opacity:.7" title="GEO"></div>
                <div style="flex:${c.heo};background:var(--color-heo);opacity:.7" title="HEO"></div>
                <div style="flex:${c.cislunar};background:var(--color-cislunar);opacity:.7" title="Cislunar"></div>
            </div>
        </div>`;
    } else if(tab === 'feeds') {
        const groups = { external: [], commercial: [], allied: [], internal: [], edge: [] };
        STATE.telemetry.forEach(t => { if(groups[t.type]) groups[t.type].push(t); });
        const groupLabels = { external:'Government / Public', commercial:'Commercial Sensors', allied:'Allied Networks', internal:'Internal Pipeline', edge:'Edge Compute' };
        const groupIcons = { external:'🏛️', commercial:'🛰️', allied:'🤝', internal:'⚙️', edge:'📡' };
        const activeCount = STATE.telemetry.filter(t => t.status==='active').length;
        el.innerHTML = `<div style="padding:4px 8px;font-size:11px;color:var(--text-secondary);margin-bottom:6px">
            <span style="color:var(--text-primary);font-weight:600">${STATE.telemetry.length}</span> feeds · 
            <span style="color:var(--status-nominal)">${activeCount} active</span> · 
            <span style="color:var(--status-warning)">${STATE.telemetry.length - activeCount} degraded</span>
        </div>` +
        Object.entries(groups).map(([type, feeds]) => {
            if(!feeds.length) return '';
            return `<div style="margin-bottom:8px">
                <div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--text-secondary);padding:4px 8px;background:var(--bg-glass);border-radius:4px;margin-bottom:3px">
                    ${groupIcons[type]} ${groupLabels[type]} (${feeds.length})
                </div>
                <table class="inv-table"><thead><tr><th>Feed</th><th>Protocol</th><th>Freq</th><th>Latency</th><th>Status</th></tr></thead><tbody>` +
                feeds.map(f => {
                    const badge = f.status==='active' ? 'badge-green' : 'badge-yellow';
                    return `<tr title="${f.desc}"><td style="color:var(--text-primary)">${f.name}</td><td>${f.protocol}</td><td>${f.freq}</td><td>${f.latency}</td><td><span class="badge ${badge}">${f.status}</span></td></tr>`;
                }).join('') +
                `</tbody></table></div>`;
        }).join('');
    } else if(tab === 'uct') {
        el.innerHTML = `<table class="inv-table"><thead><tr><th>ID</th><th>State</th><th>Passes</th><th>SMA</th><th>Inc</th><th>Material</th><th>RCS</th></tr></thead><tbody>` +
        STATE.ucts.map(u => `<tr><td>${u.id}</td><td><span class="badge ${u.state==='tentative'?'badge-yellow':'badge-blue'}">${u.state}</span></td><td>${u.passes}</td><td>${u.sma} km</td><td>${u.inc}°</td><td>${u.material}</td><td>${u.rcs} m²</td></tr>`).join('') +
        `</tbody></table>`;
    } else if(tab === 'conj') {
        el.innerHTML = `<table class="inv-table"><thead><tr><th>ID</th><th>Primary</th><th>Secondary</th><th>TCA</th><th>Miss</th><th>Pc</th><th>Tier</th></tr></thead><tbody>` +
        STATE.conjunctions.map(c => {
            const badge = c.tier==='EMERGENCY'?'badge-red':c.tier==='RED'?'badge-red':c.tier==='YELLOW'?'badge-yellow':'badge-green';
            return `<tr><td>${c.id}</td><td>${c.priName}</td><td>${c.secName}</td><td>${c.tca.slice(5,16)}</td><td>${c.miss} km</td><td>${c.pc.toExponential(1)}</td><td><span class="badge ${badge}">${c.tier}</span></td></tr>`;
        }).join('') + `</tbody></table>`;
    }
}

// Tab click handlers
document.querySelectorAll('.inv-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.inv-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderInventory(tab.dataset.tab);
    });
});

// Globe layer toggles — wired in sentinel_globe_chat.js

// ── Push Alerts ─────────────────────────────────────
function pushAlert(level, msg) {
    const stack = document.getElementById('alertStack');
    const toast = document.createElement('div');
    toast.className = `alert-toast ${level}`;
    const icon = level==='critical' ? '🔴' : level==='warning' ? '🟡' : '🔵';
    toast.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
    stack.appendChild(toast);
    setTimeout(() => toast.remove(), 9000);
}

// ── Initial Render ──────────────────────────────────
renderGauges(); renderInventory('overview');

// Load full site registry
fetch('site_registry.json').then(r => r.json()).then(data => {
    STATE.sites = data;
    renderSites(); setTimeout(renderMap, 100);
    // Add sites to 3D globe
    if(window._addGlobeSites) window._addGlobeSites();
    // Update command bar site count
    const el = document.getElementById('catalogCount');
    if(el) el.title = STATE.sites.length + ' ground sensors';
}).catch(() => {
    // Fallback to 3 demo sites
    STATE.sites = [
        {id:'CHL-01',name:'Cerro Pachón',lat:-30.2,lon:-70.7,status:'active',type:'optical',sensor:'VARDA',network:'SentinelForge',gpu:62,detections_24h:187,queue:4,seeing:0.8},
        {id:'AUS-01',name:'Siding Spring',lat:-31.3,lon:149.1,status:'active',type:'optical',sensor:'HORUS',network:'SentinelForge',gpu:71,detections_24h:143,queue:2,seeing:1.1},
        {id:'NAM-01',name:'Gamsberg',lat:-23.3,lon:16.2,status:'degraded',type:'optical',sensor:'VARDA',network:'SentinelForge',gpu:45,detections_24h:94,queue:7,seeing:1.8},
    ];
    renderSites(); setTimeout(renderMap, 100);
});
window.addEventListener('resize', renderMap);

// Push initial alerts after 2 seconds
setTimeout(() => {
    pushAlert('critical', '<b>EMERGENCY Conjunction:</b> NOAA-20 vs FENGYUN DEB — Pc=4.1e-2, miss=0.18 km, TCA in 27h');
}, 2000);
setTimeout(() => {
    pushAlert('warning', '<b>Site Degraded:</b> NAM-01 Gamsberg — Seeing 1.8", above threshold. Scheduling paused.');
}, 4500);
setTimeout(() => {
    pushAlert('info', '<b>UCT Promoted:</b> UCT-0093 → TENTATIVE (5 passes, GEO belt, possible new GEO payload)');
}, 7000);
