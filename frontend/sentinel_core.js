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
    // ── Escalation & Notification Roster ────────────
    escalation: {
        tiers: [
            {
                level: 'EMERGENCY',
                criteria: 'Pc > 1e-2 OR miss < 0.5 km OR national security asset at risk',
                responseTime: '< 15 min',
                color: '#ff1744',
                notify: [
                    { role: 'Mission Director', name: 'Col. R. Hayes (USAF)', channel: 'Secure Voice + SIPRNet', priority: 'FLASH', duty: '24/7 on-call' },
                    { role: 'Conjunction Assessment Lead', name: 'Dr. S. Patel', channel: 'SIPRNet + Ops Floor', priority: 'FLASH', duty: '24/7 rotation' },
                    { role: 'Owner/Operator (if applicable)', name: 'Per SATCAT owner registry', channel: 'Space-Track O/O Portal', priority: 'IMMEDIATE', duty: 'On notification' },
                    { role: 'USSPACECOM 18th SDS', name: 'CSpOC Watch Floor', channel: 'DSN / Classified Net', priority: 'FLASH', duty: '24/7' },
                    { role: 'NASA CARA (if NASA asset)', name: 'CARA Watch', channel: 'Secure Email + Voice', priority: 'FLASH', duty: '24/7' },
                    { role: 'Flight Dynamics (maneuver authority)', name: 'FDO Team Lead', channel: 'Ops Console + Voice Loop', priority: 'FLASH', duty: '24/7 rotation' },
                    { role: 'SentinelForge CTO', name: 'K. David', channel: 'PagerDuty P1 + SMS', priority: 'FLASH', duty: '24/7 on-call' },
                    { role: 'Edge Compute Lead', name: 'Systems Engineering', channel: 'Slack #ops-critical', priority: 'IMMEDIATE', duty: 'On-call rotation' },
                ]
            },
            {
                level: 'RED',
                criteria: 'Pc > 1e-3 OR miss < 2 km OR high-value asset',
                responseTime: '< 1 hour',
                color: '#ff5252',
                notify: [
                    { role: 'Conjunction Assessment Lead', name: 'Dr. S. Patel', channel: 'SIPRNet + Ops Floor', priority: 'PRIORITY', duty: '24/7 rotation' },
                    { role: 'Owner/Operator', name: 'Per SATCAT owner registry', channel: 'Space-Track O/O Portal', priority: 'PRIORITY', duty: 'On notification' },
                    { role: 'Orbit Determination Analyst', name: 'OD Team', channel: 'Ops Console', priority: 'PRIORITY', duty: 'Shift rotation' },
                    { role: 'Flight Dynamics', name: 'FDO Team', channel: 'Ops Console', priority: 'PRIORITY', duty: 'Shift rotation' },
                    { role: 'SentinelForge Ops Manager', name: 'Ops Lead', channel: 'PagerDuty P2 + Slack', priority: 'PRIORITY', duty: 'On-call' },
                    { role: 'Sensor Tasking Coordinator', name: 'Tasking Lead', channel: 'Ops Console', priority: 'ROUTINE', duty: 'Shift rotation' },
                ]
            },
            {
                level: 'YELLOW',
                criteria: 'Pc > 1e-5 OR miss < 10 km OR UCT in critical regime',
                responseTime: '< 4 hours',
                color: '#ffab00',
                notify: [
                    { role: 'Conjunction Assessment Analyst', name: 'CA Team', channel: 'Ops Console + Email', priority: 'ROUTINE', duty: 'Day shift' },
                    { role: 'Owner/Operator (optional)', name: 'Per screening threshold', channel: 'Space-Track automated CDM', priority: 'ROUTINE', duty: 'Automated' },
                    { role: 'Catalog Maintenance', name: 'CatMaint Team', channel: 'Ops Console', priority: 'ROUTINE', duty: 'Day shift' },
                    { role: 'SentinelForge Analytics', name: 'ML/Analytics Lead', channel: 'Slack #ops-watch', priority: 'ROUTINE', duty: 'Business hours' },
                ]
            },
            {
                level: 'INFO',
                criteria: 'UCT promoted, site degraded, new launch, reentry predicted',
                responseTime: '< 24 hours',
                color: '#448aff',
                notify: [
                    { role: 'Catalog Maintenance', name: 'CatMaint Team', channel: 'Email digest', priority: 'DEFERRED', duty: 'Next business day' },
                    { role: 'Sensor Network Ops', name: 'NetOps', channel: 'Automated ticket', priority: 'DEFERRED', duty: 'Business hours' },
                    { role: 'SentinelForge Engineering', name: 'Eng Team', channel: 'Slack #ops-info', priority: 'DEFERRED', duty: 'Business hours' },
                ]
            },
        ],
        channels: [
            { name: 'PagerDuty', type: 'alerting', endpoint: 'api.pagerduty.com/v2/enqueue', protocol: 'REST/HTTPS', coverage: '24/7' },
            { name: 'Slack Ops', type: 'messaging', endpoint: '#ops-critical / #ops-watch / #ops-info', protocol: 'Webhook', coverage: '24/7 bot' },
            { name: 'Space-Track O/O Portal', type: 'external', endpoint: 'space-track.org/expandedspacedata', protocol: 'CDM Push', coverage: 'Automated' },
            { name: 'SIPRNet Terminal', type: 'classified', endpoint: 'CSpOC classified net', protocol: 'Secure Voice/Data', coverage: '24/7' },
            { name: 'Email Distribution', type: 'notification', endpoint: 'ops@sentinelforge.io', protocol: 'SMTP/S-MIME', coverage: 'Automated + business hours' },
            { name: 'SMS/Voice Escalation', type: 'backup', endpoint: 'Twilio failover', protocol: 'Voice/SMS', coverage: 'P1 only' },
        ],
        procedures: [
            { trigger: 'EMERGENCY conjunction (Pc > 1e-2)', steps: '1. Auto-page Mission Director + FDO → 2. Immediate sensor tasking (priority override) → 3. Refine OD with fresh obs → 4. Maneuver decision gate (TCA - 6h) → 5. Execute burn or accept risk' },
            { trigger: 'New UCT detected', steps: '1. Auto-assign to CatMaint → 2. Priority sensor tasking → 3. IOD with min 3 passes → 4. Cross-reference launch manifest → 5. Promote or discard' },
            { trigger: 'Site goes offline', steps: '1. Auto-ticket to NetOps → 2. Redistribute tasking to backup sites → 3. If >2 sites down: page Ops Lead → 4. Assess impact on conjunction screening coverage' },
            { trigger: 'Space weather storm (Kp > 7)', steps: '1. Auto-alert all ops staff → 2. Increase drag model uncertainty → 3. Suspend low-confidence conjunction assessments → 4. Increase observation cadence for LEO assets' },
            { trigger: 'Edge node failure', steps: '1. Auto-failover to backup pipeline → 2. Page Edge Compute Lead → 3. If throughput < 5 fps: escalate to P1 → 4. Activate cloud-side burst processing' },
        ],
    },
    // ── Pc Timeline (conjunction probability evolution) ──
    pcTimeline: {
        'EVT-2041': { priName:'ISS', secName:'COSMOS DEB', tca:'2026-05-02T14:22Z', series: [
            {t:-72,pc:1.2e-6},{t:-60,pc:4.8e-6},{t:-48,pc:2.1e-5},{t:-36,pc:8.4e-4},{t:-24,pc:1.8e-3},{t:-18,pc:2.5e-3},{t:-12,pc:3.0e-3},{t:-6,pc:3.2e-3},{t:-3,pc:3.1e-3},{t:0,pc:3.2e-3}
        ]},
        'EVT-2042': { priName:'STARLINK-3391', secName:'CZ-3B DEB', tca:'2026-05-03T08:55Z', series: [
            {t:-72,pc:2.0e-7},{t:-60,pc:5.1e-7},{t:-48,pc:1.8e-6},{t:-36,pc:9.2e-6},{t:-24,pc:3.8e-5},{t:-12,pc:6.4e-5},{t:-6,pc:7.9e-5},{t:0,pc:8.1e-5}
        ]},
        'EVT-2043': { priName:'NOAA-20', secName:'FENGYUN DEB', tca:'2026-05-02T22:10Z', series: [
            {t:-48,pc:5.0e-5},{t:-36,pc:3.2e-4},{t:-24,pc:2.8e-3},{t:-18,pc:8.1e-3},{t:-12,pc:1.9e-2},{t:-6,pc:3.5e-2},{t:-3,pc:4.0e-2},{t:0,pc:4.1e-2}
        ]},
    },
    // ── Maneuver Decision Data ──────────────────────────
    maneuvers: [
        { conjId:'EVT-2043', asset:'NOAA-20', fuelKg:42.1, fuelPct:68, dv_options: [
            { name:'In-track +1m/s', dv:1.0, fuelCost:0.8, newPc:1.2e-6, newMiss:12.4, window:'TCA-6h to TCA-3h', risk:'LOW' },
            { name:'In-track +0.5m/s', dv:0.5, fuelCost:0.4, newPc:3.8e-4, newMiss:4.1, window:'TCA-4h to TCA-2h', risk:'MEDIUM' },
            { name:'Accept risk (no burn)', dv:0, fuelCost:0, newPc:4.1e-2, newMiss:0.18, window:'N/A', risk:'HIGH' },
        ]},
        { conjId:'EVT-2041', asset:'ISS', fuelKg:890, fuelPct:72, dv_options: [
            { name:'Debris Avoidance +0.3m/s', dv:0.3, fuelCost:12.5, newPc:8.0e-8, newMiss:28.0, window:'TCA-8h to TCA-4h', risk:'LOW' },
            { name:'Accept risk', dv:0, fuelCost:0, newPc:3.2e-3, newMiss:0.42, window:'N/A', risk:'HIGH' },
        ]},
    ],
    // ── Launch Timeline ─────────────────────────────────
    launches: [
        { date:'2026-05-02T09:15Z', vehicle:'Falcon 9', payload:'Starlink Group 12-8 (23 sats)', site:'CCSFS LC-40', orbit:'LEO 550km 53°', owner:'SpaceX', status:'GO' },
        { date:'2026-05-02T18:30Z', vehicle:'Soyuz-2.1b', payload:'GLONASS-K2 No.8', site:'Plesetsk', orbit:'MEO 19,100km 64.8°', owner:'Roscosmos', status:'GO' },
        { date:'2026-05-03T03:00Z', vehicle:'CZ-5B', payload:'Wentian-2 Lab Module', site:'Wenchang', orbit:'LEO 390km 41.5°', owner:'CNSA', status:'GO' },
        { date:'2026-05-04T14:45Z', vehicle:'Falcon 9', payload:'Transporter-14 (rideshare)', site:'Vandenberg SLC-4E', orbit:'SSO 525km 97.5°', owner:'SpaceX', status:'GO' },
        { date:'2026-05-05T22:00Z', vehicle:'H3-24L', payload:'IGS Radar-8', site:'Tanegashima', orbit:'SSO 500km', owner:'JAXA', status:'TBD' },
        { date:'2026-05-07T11:30Z', vehicle:'Ariane 6', payload:'Syracuse 4C (mil-sat)', site:'Kourou ELA-4', orbit:'GTO→GEO', owner:'ArianeGroup', status:'GO' },
        { date:'2026-05-09T06:00Z', vehicle:'PSLV-C62', payload:'EOS-08 (Earth obs)', site:'Sriharikota', orbit:'LEO 475km 97.4°', owner:'ISRO', status:'GO' },
    ],
    // ── Reentry Predictions ─────────────────────────────
    reentries: [
        { norad:54321, name:'CZ-5B R/B (2026-028B)', mass:22500, type:'Rocket Body', predictedDate:'2026-05-03', uncertainty:'±18h', risk:'HIGH', footprint:'28.5°N-28.5°S', note:'Uncontrolled reentry of heavy core stage' },
        { norad:51234, name:'COSMOS 2551 DEB', mass:120, type:'Debris', predictedDate:'2026-05-04', uncertainty:'±6h', risk:'LOW', footprint:'52°N-52°S', note:'Small fragment, full burnup expected' },
        { norad:48901, name:'Starlink-2841', mass:260, type:'Payload', predictedDate:'2026-05-06', uncertainty:'±12h', risk:'LOW', footprint:'53°N-53°S', note:'Controlled deorbit via ion thruster' },
        { norad:39012, name:'Iridium 47 (defunct)', mass:689, type:'Payload', predictedDate:'2026-05-10', uncertainty:'±48h', risk:'MEDIUM', footprint:'86°N-86°S', note:'Polar orbit, near-global ground track' },
    ],
    // ── Debris Cloud Events ─────────────────────────────
    debrisEvents: [
        { name:'FY-1C ASAT (2007)', date:'2007-01-11', type:'ASAT Test', nation:'China', alt:865, inc:98.8, fragments:3528, tracked:2764, decayed:764, color:'#ff1744', parent:'FENGYUN 1C' },
        { name:'Cosmos-Iridium (2009)', date:'2009-02-10', type:'Collision', nation:'Russia/USA', alt:790, inc:74, fragments:2296, tracked:1668, decayed:628, color:'#ff9100', parent:'COSMOS 2251 / IRIDIUM 33' },
        { name:'Cosmos 1408 ASAT (2021)', date:'2021-11-15', type:'ASAT Test', nation:'Russia', alt:480, inc:82.6, fragments:1500, tracked:623, decayed:877, color:'#e040fb', parent:'COSMOS 1408' },
        { name:'USA-193 Shootdown (2008)', date:'2008-02-21', type:'ASAT Intercept', nation:'USA', alt:247, inc:58.5, fragments:174, tracked:0, decayed:174, color:'#448aff', parent:'USA 193' },
        { name:'India Shakti (2019)', date:'2019-03-27', type:'ASAT Test', nation:'India', alt:283, inc:96.6, fragments:84, tracked:12, decayed:72, color:'#76ff03', parent:'MICROSAT-R' },
        { name:'Fengyun 4A Breakup (2025)', date:'2025-08-14', type:'Unknown Breakup', nation:'China', alt:720, inc:98.2, fragments:412, tracked:389, decayed:23, color:'#ffd740', parent:'FENGYUN 4A' },
    ],
    // ── Owner/Operator Registry ─────────────────────────
    owners: {
        25544: { name:'ISS', owner:'NASA/Roscosmos/JAXA/ESA/CSA', country:'International', purpose:'Human spaceflight', launched:'1998-11-20', mass:420000 },
        43013: { name:'NOAA-20', owner:'NOAA/NASA', country:'USA', purpose:'Weather imaging (JPSS-1)', launched:'2017-11-18', mass:2300 },
        48274: { name:'Starlink-3391', owner:'SpaceX', country:'USA', purpose:'Broadband internet constellation', launched:'2023-03-24', mass:295 },
        44832: { name:'COSMOS 2251 DEB', owner:'Russian Federation (defunct)', country:'Russia', purpose:'Communications (destroyed in collision)', launched:'1993-06-16', mass:'N/A (debris)' },
        27386: { name:'FENGYUN 1C DEB', owner:'PRC/CMA', country:'China', purpose:'Weather (destroyed in ASAT test)', launched:'1999-05-10', mass:'N/A (debris)' },
    },
    // ── Historical Trends ───────────────────────────────
    trends: {
        catalogGrowth: [
            {date:'2020-01',count:22300},{date:'2020-07',count:23100},{date:'2021-01',count:25400},{date:'2021-07',count:27800},
            {date:'2022-01',count:30500},{date:'2022-07',count:33200},{date:'2023-01',count:35800},{date:'2023-07',count:38100},
            {date:'2024-01',count:40200},{date:'2024-07',count:42100},{date:'2025-01',count:43800},{date:'2025-07',count:45100},{date:'2026-01',count:46238},
        ],
        conjFrequency: [
            {date:'2025-W44',red:2,yellow:18,info:142},{date:'2025-W45',red:3,yellow:22,info:156},{date:'2025-W46',red:1,yellow:15,info:131},
            {date:'2025-W47',red:4,yellow:28,info:189},{date:'2025-W48',red:2,yellow:19,info:148},{date:'2026-W01',red:3,yellow:25,info:167},
            {date:'2026-W02',red:5,yellow:31,info:201},{date:'2026-W03',red:2,yellow:17,info:139},{date:'2026-W04',red:3,yellow:24,info:178},
        ],
        detectionRate: [
            {date:'2026-04-25',rate:89.1},{date:'2026-04-26',rate:87.8},{date:'2026-04-27',rate:91.2},{date:'2026-04-28',rate:88.4},
            {date:'2026-04-29',rate:86.9},{date:'2026-04-30',rate:87.2},{date:'2026-05-01',rate:87.2},
        ],
    },
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
// Preload world map image
const _worldMapImg = new Image();
_worldMapImg.src = 'world_map.png';
let _worldMapLoaded = false;
_worldMapImg.onload = () => { _worldMapLoaded = true; renderMap(); };

function renderMap() {
    const canvas = document.getElementById('mapCanvas');
    if(!canvas) return;
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width; canvas.height = rect.height - 33;
    const ctx = canvas.getContext('2d');
    const W = canvas.width, H = canvas.height;
    ctx.fillStyle = '#070a12'; ctx.fillRect(0,0,W,H);
    // Draw world map background image
    if(_worldMapLoaded) {
        ctx.globalAlpha = 0.7;
        ctx.drawImage(_worldMapImg, 0, 0, W, H);
        ctx.globalAlpha = 1;
    }
    const toXY = (lat,lon) => ({ x: (lon+180)/360*W, y: (90-lat)/180*H });
    // Subtle grid overlay
    ctx.strokeStyle = 'rgba(60,120,180,0.06)'; ctx.lineWidth = 0.5;
    for(let lat=-60;lat<=60;lat+=30) { const p=toXY(lat,-180),p2=toXY(lat,180); ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p2.x,p2.y); ctx.stroke(); }
    for(let lon=-150;lon<=150;lon+=30) { const p=toXY(90,lon),p2=toXY(-90,lon); ctx.beginPath(); ctx.moveTo(p.x,p.y); ctx.lineTo(p2.x,p2.y); ctx.stroke(); }
    // Plot sites with glow
    const netColors = {
        'USSF-SSN':'#ff1744','LeoLabs':'#00e5ff','Slingshot':'#ffd740',
        'ExoAnalytic':'#76ff03','ESA-SST':'#448aff','Contributing':'#e040fb',
    };
    STATE.sites.forEach(s => {
        const p = toXY(s.lat, s.lon);
        const col = netColors[s.network] || '#00e676';
        const r = s.type === 'radar' ? 4 : 2.5;
        if(s.status !== 'offline') {
            // Glow halo
            const grad = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r*3);
            grad.addColorStop(0, col.replace(')',',0.3)').replace('#','rgba(').replace(/([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i, (m,r,g,b)=>`${parseInt(r,16)},${parseInt(g,16)},${parseInt(b,16)},0.25)`));
            ctx.beginPath(); ctx.arc(p.x,p.y,r*3,0,Math.PI*2);
            ctx.fillStyle = `${col}15`; ctx.fill();
        }
        // Dot
        ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2);
        ctx.fillStyle = s.status==='offline' ? '#444' : col;
        ctx.globalAlpha = s.status==='offline' ? 0.3 : 0.95;
        ctx.fill(); ctx.globalAlpha = 1;
    });
    // Legend
    ctx.font = '9px Inter'; let lx = 10, ly = H - 6;
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
    } else if(tab === 'escalation') {
        const esc = STATE.escalation;
        el.innerHTML = esc.tiers.map(tier => {
            return `<div style="margin-bottom:10px">
                <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;padding:4px 8px;background:${tier.color}22;border-left:3px solid ${tier.color};border-radius:0 4px 4px 0;margin-bottom:4px;color:${tier.color}">
                    ${tier.level} <span style="color:var(--text-secondary);font-weight:400;margin-left:8px">${tier.criteria}</span>
                    <span style="float:right;color:var(--text-secondary)">Response: ${tier.responseTime}</span>
                </div>
                <table class="inv-table"><thead><tr><th>Role</th><th>Contact</th><th>Channel</th><th>Priority</th><th>Duty</th></tr></thead><tbody>` +
                tier.notify.map(n => {
                    const pBadge = n.priority==='FLASH'?'badge-red':n.priority==='IMMEDIATE'?'badge-red':n.priority==='PRIORITY'?'badge-yellow':'badge-blue';
                    return `<tr><td style="color:var(--text-primary)">${n.role}</td><td>${n.name}</td><td style="font-size:9px">${n.channel}</td><td><span class="badge ${pBadge}">${n.priority}</span></td><td style="font-size:9px">${n.duty}</td></tr>`;
                }).join('') +
                `</tbody></table></div>`;
        }).join('') +
        `<div style="margin-top:6px;padding:4px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--text-secondary);background:var(--bg-glass);border-radius:4px;margin-bottom:3px">Notification Channels (${esc.channels.length})</div>
        <table class="inv-table"><thead><tr><th>Channel</th><th>Type</th><th>Protocol</th><th>Coverage</th></tr></thead><tbody>` +
        esc.channels.map(ch => `<tr><td style="color:var(--text-primary)">${ch.name}</td><td>${ch.type}</td><td>${ch.protocol}</td><td>${ch.coverage}</td></tr>`).join('') +
        `</tbody></table>
        <div style="margin-top:6px;padding:4px 8px;font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:.8px;color:var(--text-secondary);background:var(--bg-glass);border-radius:4px;margin-bottom:3px">Response Procedures (${esc.procedures.length})</div>` +
        esc.procedures.map(p => `<div style="padding:4px 8px;margin-bottom:4px;font-size:10px;border-left:2px solid var(--text-secondary);background:rgba(255,255,255,0.02);border-radius:0 4px 4px 0">
            <div style="color:var(--text-primary);font-weight:600;margin-bottom:2px">${p.trigger}</div>
            <div style="color:var(--text-secondary)">${p.steps}</div>
        </div>`).join('');
    } else if(tab === 'pcTimeline') {
        // ── #1: Pc Timeline Chart ──────────────────────
        el.innerHTML = `<div style="padding:4px 8px;font-size:11px;color:var(--text-secondary);margin-bottom:4px">Probability of Collision evolution vs hours-to-TCA</div><canvas id="pcChart" style="width:100%;height:180px"></canvas>` +
        Object.entries(STATE.pcTimeline).map(([id,evt]) => {
            const conj = STATE.conjunctions.find(c=>c.id===id);
            const tier = conj?.tier||'YELLOW';
            const badge = tier==='EMERGENCY'?'badge-red':tier==='RED'?'badge-red':'badge-yellow';
            const owner = STATE.owners[conj?.pri];
            return `<div style="padding:4px 8px;margin:4px 0;background:var(--bg-glass);border-radius:4px;border-left:3px solid ${tier==='EMERGENCY'?'#ff1744':'#ffab00'}">
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <span style="color:var(--text-primary);font-weight:600;font-size:11px">${id}: ${evt.priName} vs ${evt.secName}</span>
                    <span class="badge ${badge}">${tier}</span>
                </div>
                <div style="font-size:10px;color:var(--text-secondary);margin-top:2px">TCA: ${evt.tca} | Current Pc: ${evt.series[evt.series.length-1].pc.toExponential(1)} | Trend: ${evt.series[evt.series.length-1].pc > evt.series[evt.series.length-2]?.pc ? '↑ RISING' : '→ STABLE'}</div>
                ${owner ? `<div style="font-size:9px;color:var(--text-secondary);margin-top:1px">Owner: ${owner.owner} (${owner.country}) — ${owner.purpose}</div>` : ''}
            </div>`;
        }).join('');
        // Draw Pc chart
        setTimeout(() => {
            const canvas = document.getElementById('pcChart');
            if(!canvas) return;
            canvas.width = canvas.parentElement.clientWidth - 16;
            canvas.height = 180;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#0a0c14'; ctx.fillRect(0,0,canvas.width,canvas.height);
            // Grid
            ctx.strokeStyle = 'rgba(255,255,255,0.06)'; ctx.lineWidth = 0.5;
            for(let i=0;i<5;i++){const y=15+i*35;ctx.beginPath();ctx.moveTo(40,y);ctx.lineTo(canvas.width-10,y);ctx.stroke();}
            // Y-axis labels (log scale)
            ctx.fillStyle = '#78909c'; ctx.font = '9px JetBrains Mono';
            ['1e-1','1e-2','1e-3','1e-4','1e-5'].forEach((l,i)=>ctx.fillText(l,2,20+i*35));
            // Threshold lines
            ctx.strokeStyle = 'rgba(255,23,68,0.4)'; ctx.setLineDash([4,4]); ctx.beginPath();
            const y1e2 = 15+35; ctx.moveTo(40,y1e2); ctx.lineTo(canvas.width-10,y1e2); ctx.stroke();
            ctx.strokeStyle = 'rgba(255,171,0,0.3)'; ctx.beginPath();
            const y1e3 = 15+70; ctx.moveTo(40,y1e3); ctx.lineTo(canvas.width-10,y1e3); ctx.stroke();
            ctx.setLineDash([]);
            ctx.fillStyle = 'rgba(255,23,68,0.6)'; ctx.font='8px Inter'; ctx.fillText('EMERGENCY',canvas.width-65,y1e2-3);
            ctx.fillStyle = 'rgba(255,171,0,0.5)'; ctx.fillText('RED',canvas.width-25,y1e3-3);
            // Plot each conjunction series
            const colors = {'EVT-2041':'#ff5252','EVT-2042':'#ffd740','EVT-2043':'#ff1744'};
            const xScale = (canvas.width-50)/72;
            const yLog = (pc) => { const lp = -Math.log10(Math.max(pc,1e-8)); return 15+(lp-1)*35; };
            Object.entries(STATE.pcTimeline).forEach(([id,evt])=>{
                ctx.strokeStyle = colors[id]||'#00e5ff'; ctx.lineWidth = 2; ctx.beginPath();
                evt.series.forEach((pt,i)=>{
                    const x = 40+(pt.t+72)*xScale;
                    const y = Math.min(Math.max(yLog(pt.pc),10),175);
                    i===0?ctx.moveTo(x,y):ctx.lineTo(x,y);
                });
                ctx.stroke();
                // Label
                const last = evt.series[evt.series.length-1];
                ctx.fillStyle = colors[id]||'#00e5ff'; ctx.font='9px Inter';
                ctx.fillText(id.slice(-4),40+(last.t+72)*xScale+3,yLog(last.pc)-5);
            });
            // X-axis
            ctx.fillStyle = '#78909c'; ctx.font = '9px JetBrains Mono';
            [-72,-48,-24,-12,0].forEach(h=>{const x=40+(h+72)*xScale;ctx.fillText(`T${h}h`,x-12,canvas.height-3);});
        }, 50);
    } else if(tab === 'maneuver') {
        // ── #4: Maneuver Decision Panel ────────────────
        el.innerHTML = STATE.maneuvers.map(m => {
            const conj = STATE.conjunctions.find(c=>c.id===m.conjId);
            return `<div style="margin-bottom:10px">
                <div style="font-size:10px;font-weight:700;text-transform:uppercase;padding:4px 8px;background:rgba(255,23,68,0.1);border-left:3px solid #ff1744;border-radius:0 4px 4px 0;margin-bottom:4px;color:#ff8a80">
                    ${m.conjId} — ${m.asset} | Fuel: ${m.fuelKg} kg (${m.fuelPct}%)
                </div>
                <table class="inv-table"><thead><tr><th>Option</th><th>ΔV</th><th>Fuel</th><th>New Pc</th><th>New Miss</th><th>Window</th><th>Risk</th></tr></thead><tbody>` +
                m.dv_options.map(o => {
                    const badge = o.risk==='LOW'?'badge-green':o.risk==='MEDIUM'?'badge-yellow':'badge-red';
                    return `<tr><td style="color:var(--text-primary)">${o.name}</td><td>${o.dv} m/s</td><td>${o.fuelCost} kg</td>
                        <td style="color:${o.newPc<1e-4?'#00e676':o.newPc<1e-2?'#ffab00':'#ff1744'}">${o.newPc.toExponential(1)}</td>
                        <td>${o.newMiss} km</td><td style="font-size:9px">${o.window}</td><td><span class="badge ${badge}">${o.risk}</span></td></tr>`;
                }).join('') +
                `</tbody></table></div>`;
        }).join('');
    } else if(tab === 'launches') {
        // ── #7: Launch Timeline ────────────────────────
        el.innerHTML = `<div style="padding:4px 8px;font-size:11px;color:var(--text-secondary);margin-bottom:4px">${STATE.launches.length} launches in next 7 days — each creates new trackable objects</div>
        <table class="inv-table"><thead><tr><th>Date</th><th>Vehicle</th><th>Payload</th><th>Orbit</th><th>Status</th></tr></thead><tbody>` +
        STATE.launches.map(l => {
            const d = new Date(l.date); const hrs = Math.max(0,Math.round((d-new Date())/3600000));
            const badge = l.status==='GO'?'badge-green':'badge-yellow';
            return `<tr title="${l.site} — ${l.owner}">
                <td style="color:var(--text-primary)">${l.date.slice(5,16)}</td>
                <td>${l.vehicle}</td><td style="font-size:10px">${l.payload}</td><td style="font-size:10px">${l.orbit}</td>
                <td><span class="badge ${badge}">${l.status}</span> <span style="font-size:9px;color:var(--text-secondary)">${hrs}h</span></td>
            </tr>`;
        }).join('') + `</tbody></table>`;
    } else if(tab === 'reentries') {
        // ── #8: Reentry Predictions ────────────────────
        el.innerHTML = `<div style="padding:4px 8px;font-size:11px;color:var(--text-secondary);margin-bottom:4px">${STATE.reentries.length} predicted reentries — monitoring uncontrolled objects</div>
        <table class="inv-table"><thead><tr><th>Object</th><th>Mass</th><th>Date</th><th>Uncert.</th><th>Risk</th></tr></thead><tbody>` +
        STATE.reentries.map(r => {
            const badge = r.risk==='HIGH'?'badge-red':r.risk==='MEDIUM'?'badge-yellow':'badge-green';
            return `<tr title="${r.note} — Footprint: ${r.footprint}">
                <td style="color:var(--text-primary);font-size:10px">${r.name}</td><td>${(r.mass/1000).toFixed(1)}t</td>
                <td>${r.predictedDate.slice(5)}</td><td>${r.uncertainty}</td>
                <td><span class="badge ${badge}">${r.risk}</span></td></tr>`;
        }).join('') + `</tbody></table>`;
    } else if(tab === 'debris') {
        // ── #6: Debris Cloud Events ───────────────────
        el.innerHTML = `<div style="padding:4px 8px;font-size:11px;color:var(--text-secondary);margin-bottom:4px">Major debris-generating events — primary conjunction threat sources</div>
        <table class="inv-table"><thead><tr><th>Event</th><th>Type</th><th>Alt</th><th>Fragments</th><th>Tracked</th><th>Decayed</th></tr></thead><tbody>` +
        STATE.debrisEvents.map(d => {
            return `<tr><td style="color:${d.color};font-weight:600;font-size:10px">${d.name}</td><td style="font-size:10px">${d.type}</td>
                <td>${d.alt} km</td><td style="color:var(--text-primary)">${d.fragments.toLocaleString()}</td>
                <td>${d.tracked.toLocaleString()}</td><td style="color:var(--text-secondary)">${d.decayed.toLocaleString()}</td></tr>`;
        }).join('') + `</tbody></table>
        <div style="margin-top:6px;padding:4px 8px;font-size:10px;color:var(--text-secondary)">
            Total tracked debris from major events: <span style="color:var(--text-primary);font-weight:600">${STATE.debrisEvents.reduce((s,d)=>s+d.tracked,0).toLocaleString()}</span> of
            <span style="color:var(--text-primary)">${STATE.debrisEvents.reduce((s,d)=>s+d.fragments,0).toLocaleString()}</span> generated
        </div>`;
    } else if(tab === 'trending') {
        // ── #11: Historical Trending ──────────────────
        el.innerHTML = `<div style="padding:4px 8px;font-size:11px;color:var(--text-secondary);margin-bottom:4px">Catalog growth & conjunction frequency trends</div>
        <canvas id="trendChart" style="width:100%;height:160px"></canvas>
        <div style="padding:4px 8px;margin-top:4px;font-size:10px;color:var(--text-secondary)">
            <span style="display:inline-block;width:10px;height:10px;background:#00e5ff;border-radius:2px;margin-right:4px"></span> Catalog size
            <span style="display:inline-block;width:10px;height:10px;background:#ff5252;border-radius:2px;margin-left:12px;margin-right:4px"></span> RED conjunctions/week
            <span style="display:inline-block;width:10px;height:10px;background:#ffd740;border-radius:2px;margin-left:12px;margin-right:4px"></span> YELLOW/week
        </div>
        <div style="padding:4px 8px;margin-top:6px;font-size:11px;font-weight:600;color:var(--text-primary)">Detection Rate (7 day)</div>
        <canvas id="detRateChart" style="width:100%;height:80px"></canvas>`;
        setTimeout(() => {
            // Catalog growth chart
            const c1 = document.getElementById('trendChart');
            if(!c1) return;
            c1.width = c1.parentElement.clientWidth - 16; c1.height = 160;
            const x1 = c1.getContext('2d');
            x1.fillStyle = '#0a0c14'; x1.fillRect(0,0,c1.width,c1.height);
            const cg = STATE.trends.catalogGrowth;
            const xS = (c1.width-50)/(cg.length-1);
            const yS = (c1.height-30)/50000;
            // Grid
            x1.strokeStyle='rgba(255,255,255,0.05)';x1.lineWidth=0.5;
            [20000,30000,40000].forEach(v=>{const y=c1.height-15-v*yS;x1.beginPath();x1.moveTo(40,y);x1.lineTo(c1.width-5,y);x1.stroke();
                x1.fillStyle='#78909c';x1.font='8px JetBrains Mono';x1.fillText((v/1000)+'K',5,y+3);});
            // Line
            x1.strokeStyle='#00e5ff';x1.lineWidth=2;x1.beginPath();
            cg.forEach((pt,i)=>{const px=40+i*xS;const py=c1.height-15-pt.count*yS;i===0?x1.moveTo(px,py):x1.lineTo(px,py);});
            x1.stroke();
            // Fill
            x1.lineTo(40+(cg.length-1)*xS,c1.height-15);x1.lineTo(40,c1.height-15);x1.closePath();
            x1.fillStyle='rgba(0,229,255,0.08)';x1.fill();
            // X labels
            x1.fillStyle='#78909c';x1.font='8px JetBrains Mono';
            cg.forEach((pt,i)=>{if(i%2===0)x1.fillText(pt.date,40+i*xS-10,c1.height-2);});
            // Detection rate chart
            const c2 = document.getElementById('detRateChart');
            if(!c2) return;
            c2.width = c2.parentElement.clientWidth - 16; c2.height = 80;
            const x2 = c2.getContext('2d');
            x2.fillStyle = '#0a0c14'; x2.fillRect(0,0,c2.width,c2.height);
            const dr = STATE.trends.detectionRate;
            const xS2 = (c2.width-50)/(dr.length-1);
            x2.strokeStyle = 'rgba(0,230,118,0.3)'; x2.lineWidth = 0.5;
            [85,90].forEach(v=>{const y=(95-v)/15*60+5;x2.beginPath();x2.moveTo(40,y);x2.lineTo(c2.width-5,y);x2.stroke();
                x2.fillStyle='#78909c';x2.font='8px JetBrains Mono';x2.fillText(v+'%',8,y+3);});
            x2.strokeStyle='#00e676';x2.lineWidth=2;x2.beginPath();
            dr.forEach((pt,i)=>{const px=40+i*xS2;const py=(95-pt.rate)/15*60+5;i===0?x2.moveTo(px,py):x2.lineTo(px,py);});
            x2.stroke();
            dr.forEach((pt,i)=>{const px=40+i*xS2;const py=(95-pt.rate)/15*60+5;
                x2.beginPath();x2.arc(px,py,3,0,Math.PI*2);x2.fillStyle='#00e676';x2.fill();});
            x2.fillStyle='#78909c';x2.font='8px JetBrains Mono';
            dr.forEach((pt,i)=>x2.fillText(pt.date.slice(5),40+i*xS2-12,c2.height-2));
        }, 50);
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

// Load live telemetry data from external APIs (fetched by fetch_telemetry.py)
fetch('live_telemetry.json').then(r => r.json()).then(live => {
    STATE.liveData = live;
    const s = live.sources || {};
    // Update SWPC space weather in command bar
    if(s.swpc && s.swpc.status === 'ok') {
        const f107El = document.querySelector('.cmd-weather-num');
        const weatherNums = document.querySelectorAll('.cmd-weather-num');
        if(weatherNums[0]) weatherNums[0].textContent = s.swpc.f107_flux;
        if(weatherNums[1]) weatherNums[1].textContent = parseFloat(s.swpc.kp_latest).toFixed(1);
        if(weatherNums[2]) weatherNums[2].textContent = s.swpc.dst_latest;
        STATE.weather = { f107: parseFloat(s.swpc.f107_flux), kp: parseFloat(s.swpc.kp_latest), dst: parseFloat(s.swpc.dst_latest) };
        // Update telemetry feed status
        const swpcFeed = STATE.telemetry.find(t => t.id === 'SWPC');
        if(swpcFeed) swpcFeed.throughput = `F10.7=${s.swpc.f107_flux} Kp=${s.swpc.kp_latest}`;
    }
    // Update CelesTrak stats
    if(s.celestrak && s.celestrak.status === 'ok') {
        const ctFeed = STATE.telemetry.find(t => t.id === 'CELESTRAK');
        if(ctFeed) ctFeed.throughput = `${s.celestrak.active_satellites.toLocaleString()} active sats`;
    }
    // Update IERS EOP
    if(s.iers_eop && s.iers_eop.status === 'ok') {
        const eopFeed = STATE.telemetry.find(t => t.id === 'USGS-EOP');
        if(eopFeed) eopFeed.throughput = `MJD ${s.iers_eop.latest_mjd} | ${s.iers_eop.total_records.toLocaleString()} records`;
    }
    // Update GPS timing
    if(s.gps_timing && s.gps_timing.status === 'ok') {
        const gpsFeed = STATE.telemetry.find(t => t.id === 'GNSS-TIME');
        if(gpsFeed) gpsFeed.throughput = `TAI-UTC=${s.gps_timing.tai_utc_seconds}s GPS-UTC=${s.gps_timing.gps_utc_seconds}s`;
    }
    // Update ILRS
    if(s.ilrs_slr && s.ilrs_slr.status === 'ok') {
        const ilrsFeed = STATE.telemetry.find(t => t.id === 'ILRS');
        if(ilrsFeed) ilrsFeed.throughput = `${s.ilrs_slr.active_stations} stations, ${s.ilrs_slr.tracked_targets.length} targets`;
    }
    console.log(`[SentinelForge] Live telemetry loaded: ${Object.keys(s).length} sources, fetched ${live.fetched_at}`);
}).catch(e => console.log('[SentinelForge] No live_telemetry.json available — using defaults'));

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
