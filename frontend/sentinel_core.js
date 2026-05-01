/* SentinelForge Ops Center — Core Engine */

// ── Simulated System State ──────────────────────────
const STATE = {
    catalog: { total: 12847, leo: 8934, meo: 1205, geo: 2108, heo: 412, cislunar: 188 },
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
    sites: [
        { id:'CHL-01', name:'Cerro Pachón, Chile', lat:-30.2, lon:-70.7, status:'active', gpu:62, temp:12, seeing:0.8, queue:4, detections:187, sensor:'VARDA-7' },
        { id:'AUS-01', name:'Siding Spring, Australia', lat:-31.3, lon:149.1, status:'active', gpu:71, temp:18, seeing:1.1, queue:2, detections:143, sensor:'HORUS-4' },
        { id:'NAM-01', name:'Gamsberg, Namibia', lat:-23.3, lon:16.2, status:'degraded', gpu:45, temp:22, seeing:1.8, queue:7, detections:94, sensor:'VARDA-3' },
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
    el.innerHTML = '<div class="card-header">Sites</div>' + STATE.sites.map(s => `
        <div class="site-card">
            <div class="site-header">
                <div class="site-dot ${s.status}"></div>
                <span class="site-name">${s.id}</span>
                <span style="flex:1"></span>
                <span style="font-size:10px;color:var(--text-secondary)">${s.sensor}</span>
            </div>
            <div class="site-stats">
                GPU <span>${s.gpu}%</span> | Seeing <span>${s.seeing}"</span> | Temp <span>${s.temp}°C</span> | Queue <span>${s.queue}</span> | Det <span>${s.detections}</span>
            </div>
        </div>`).join('');
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
    // Plot sites
    const toXY = (lat,lon) => ({ x: 10+(lon+180)/360*(canvas.width-20), y: 10+(90-lat)/180*(canvas.height-20) });
    STATE.sites.forEach(s => {
        const p = toXY(s.lat, s.lon);
        const col = s.status==='active' ? '#00e676' : '#ffab00';
        // Pulse ring
        ctx.beginPath(); ctx.arc(p.x,p.y,8,0,Math.PI*2);
        ctx.strokeStyle = col; ctx.lineWidth = 1.5; ctx.stroke();
        // Center dot
        ctx.beginPath(); ctx.arc(p.x,p.y,3,0,Math.PI*2);
        ctx.fillStyle = col; ctx.fill();
        // Label
        ctx.fillStyle = '#b0bec5'; ctx.font = '10px Inter'; ctx.fillText(s.id, p.x+12, p.y+4);
        // Glow
        const grad = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,16);
        grad.addColorStop(0, col.replace(')',',0.15)').replace('rgb','rgba'));
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(p.x,p.y,16,0,Math.PI*2); ctx.fill();
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

// Globe layer toggles
document.querySelectorAll('.globe-btn').forEach(btn => {
    btn.addEventListener('click', () => btn.classList.toggle('active'));
});

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
renderGauges(); renderSites(); renderInventory('overview');
setTimeout(renderMap, 100);
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
