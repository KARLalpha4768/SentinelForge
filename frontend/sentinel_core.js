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
        { id:'EVT-2041', pri:25544, priName:'ISS (ZARYA)', sec:44832, secName:'COSMOS 1408 DEB',
          tca:'2026-05-02T14:22Z', miss:0.42, pc:3.2e-3, vel:14.1, tier:'RED',
          priOrbit:{regime:'LEO',alt:420,inc:51.6,ecc:0.0001,period:'92.8 min',owner:'NASA/Roscosmos',purpose:'Crewed station — 7 crew aboard',mass:420000,maneuverCapable:true,fuelKg:890},
          secOrbit:{regime:'LEO',alt:470,inc:74.5,ecc:0.003,period:'93.6 min',owner:'(defunct debris)',purpose:'N/A — debris fragment'},
          debris:{origin:'Cosmos 1408 ASAT Test',originDate:'2021-11-15',nation:'Russia',parentNorad:39634,totalFragments:1632,trackedFragments:587,fragSize:'~8cm characteristic length',threatType:'ASAT Debris',dangerLevel:'HIGH — hypervelocity impact would be catastrophic to crewed station',estimatedMass:'0.2-0.8 kg',
            materialType:'Aluminum alloy hull fragment',relVel:'14.1 km/s',approachGeometry:'Head-on (nearly anti-parallel orbits)',impactEnergy:'~46 MJ (equivalent to 11 kg TNT)',kineticLethalityThreshold:'EXCEEDS — any impact is mission-ending',
            secondaryDebrisRisk:'Catastrophic — would generate 1000+ new fragments in ISS altitude band'},
          protocol:{actions:['Request emergency OD update from 18th SDS','Task all available sensors for priority tracking','Convene Conjunction Assessment emergency call','Prepare ISS DAM (Debris Avoidance Maneuver)','Notify NASA CARA + Roscosmos Flight Control','Decision gate: TCA-6h — GO/NO-GO for maneuver','If NO-GO: shelter crew in Soyuz/Dragon lifeboats'],
            decisionGate:'TCA - 6h (08:22Z today)',maneuverWindow:'TCA-8h to TCA-4h',
            riskIfNoAction:'3.2e-3 probability of catastrophic collision with crewed station. UNACCEPTABLE per NASA CARA threshold (1e-4).'}
        },
        { id:'EVT-2042', pri:48274, priName:'STARLINK-3391', sec:99201, secName:'CZ-3B R/B DEB',
          tca:'2026-05-03T08:55Z', miss:1.8, pc:8.1e-5, tier:'YELLOW',
          priOrbit:{regime:'LEO',alt:550,inc:53.0,ecc:0.0001,period:'95.6 min',owner:'SpaceX',purpose:'Broadband constellation',mass:260,maneuverCapable:true,fuelKg:0.8},
          secOrbit:{regime:'LEO',alt:580,inc:55.0,ecc:0.012,period:'96.1 min',owner:'(defunct debris)',purpose:'N/A — rocket body fragment'},
          debris:{origin:'CZ-3B breakup event',originDate:'2022-03-18',nation:'China',parentNorad:28056,totalFragments:42,trackedFragments:38,fragSize:'~45cm characteristic length',threatType:'Rocket Body Fragment',dangerLevel:'MODERATE — would destroy Starlink satellite, no crew risk',estimatedMass:'12-35 kg',
            materialType:'Aluminum/steel booster stage fragment',relVel:'11.8 km/s',approachGeometry:'Crossing (oblique intersection)',impactEnergy:'~830 MJ',kineticLethalityThreshold:'EXCEEDS',
            secondaryDebrisRisk:'Moderate — would generate ~50-100 new fragments at 550km (Starlink shell altitude, high-risk zone)'},
          protocol:{actions:['Monitor — below SpaceX autonomous maneuver threshold (1e-4)','Request updated ephemeris from Space-Track','Notify SpaceX via automated CDM push','SpaceX autonomous collision avoidance may trigger at TCA-8h','No SentinelForge action required unless Pc rises above 1e-4'],
            decisionGate:'TCA - 8h (SpaceX autonomous)',maneuverWindow:'TCA-10h to TCA-2h (SpaceX handles internally)',
            riskIfNoAction:'8.1e-5 — below action threshold but monitoring. SpaceX satellites maneuver autonomously.'}
        },
        { id:'EVT-2043', pri:43013, priName:'NOAA-20 (JPSS-1)', sec:27386, secName:'FENGYUN 1C DEB',
          tca:'2026-05-02T22:10Z', miss:0.18, pc:0.041, vel:13.8, tier:'EMERGENCY',
          priOrbit:{regime:'LEO',alt:824,inc:98.7,ecc:0.0001,period:'101.4 min',owner:'NOAA/NASA',purpose:'Critical weather satellite — primary US polar weather imagery',mass:2294,maneuverCapable:true,fuelKg:42.1},
          secOrbit:{regime:'LEO',alt:840,inc:99.0,ecc:0.005,period:'101.6 min',owner:'(defunct debris)',purpose:'N/A — debris fragment'},
          debris:{origin:'Fengyun 1C ASAT Test',originDate:'2007-01-11',nation:'China',parentNorad:25730,totalFragments:3528,trackedFragments:2764,fragSize:'~12cm characteristic length',threatType:'ASAT Debris',dangerLevel:'CRITICAL — loss of NOAA-20 would degrade US weather forecasting by 30-40% until JPSS-2 achieves operational status',estimatedMass:'0.5-2.0 kg',
            materialType:'Aluminum hull + solar panel fragment',relVel:'13.8 km/s',approachGeometry:'Near head-on (retrograde orbits)',impactEnergy:'~190 MJ (equivalent to 45 kg TNT)',kineticLethalityThreshold:'EXCEEDS — any impact is mission-ending',
            secondaryDebrisRisk:'Severe — 824km is above natural decay altitude. Fragments would persist for 50-200 years, contaminating the critical SSO weather satellite corridor.'},
          protocol:{actions:['FLASH notification to NOAA OSPO + NASA Goddard Flight Dynamics','Request emergency special perturbations from 18th SDS','Task USSF-SSN priority radar tracking (Eglin/Cavalier)','Task all SentinelForge optical sites for secondary obs','Convene multi-agency conjunction assessment call (NOAA + NASA CARA + USSF)','Compute maneuver options: in-track ΔV to achieve miss >10km','Decision gate: TCA-6h — GO/NO-GO for maneuver','Post-maneuver: verify no secondary conjunctions from new orbit','Brief NWS/NOAA leadership on weather forecast impact if loss occurs'],
            decisionGate:'TCA - 6h (16:10Z today)',maneuverWindow:'TCA-6h to TCA-3h',
            riskIfNoAction:'4.1e-2 probability of losing primary US polar weather satellite. 40× above NASA CARA emergency threshold. THIS IS A NATIONAL EMERGENCY.'}
        },
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
        { key:'detection', label:'Detection Rate', value:87.2, unit:'%', min:0, max:100, green:90, yellow:80,
          scope:'FLEET', desc:'Fraction of predicted passes where the fleet detected the object', detail:'Fleet-wide — all 172 sites combined. Target: >90% to maintain catalog custody.' },
        { key:'freshness', label:'Catalog Freshness', value:6.4, unit:'hrs', min:0, max:48, green:8, yellow:24, invert:true,
          scope:'CATALOG', desc:'Median age of the most recent observation per cataloged object', detail:'Catalog-wide median TLE age across 46K objects. <8h = healthy, >24h = stale.' },
        { key:'nees', label:'NEES (Covariance)', value:3.02, unit:'', min:0, max:10, green:4, yellow:6,
          scope:'FILTER', desc:'Normalized Estimation Error Squared — is the filter\'s covariance realistic?', detail:'Values near dim(state)=3 are ideal. >6 = overconfident filter, all Pc values untrustworthy.' },
        { key:'throughput', label:'Edge Throughput', value:12.4, unit:'fps', min:0, max:30, green:10, yellow:5, invert:true,
          scope:'FLEET', desc:'Mean frames/sec processed across all Jetson Orin edge nodes', detail:'Fleet average across 3 edge nodes (CHL/AUS/NAM). Per-site fps shown in Ground Network.' },
        { key:'conjActive', label:'Active Conjunctions', value:3, unit:'', min:0, max:50, green:5, yellow:15,
          scope:'OPS', desc:'Events within screening volume (miss <5km, TCA <72h) requiring monitoring', detail:'Cross-catalog conjunction count. Each event may involve objects from different sites.' },
        { key:'gpu', label:'GPU Utilization', value:62, unit:'%', min:0, max:100, green:80, yellow:95,
          scope:'CLOUD', desc:'Mean GPU load across the Kubernetes inference cluster (not edge nodes)', detail:'Cloud-side GPU cluster running PINN, FNO, and DA engines. Edge GPU is per-site.' },
        { key:'kafkaLag', label:'Kafka Lag', value:4, unit:'msgs', min:0, max:1000, green:10, yellow:100, invert:true,
          scope:'CLOUD', desc:'Unconsumed messages in the edge→cloud Kafka pipeline', detail:'Messages awaiting ingestion from ALL edge nodes. >100 = cloud pipeline falling behind.' },
        { key:'densityErr', label:'Density Model Error', value:18, unit:'%', min:0, max:100, green:25, yellow:50, invert:true,
          scope:'SCIENCE', desc:'RMS density prediction error from the ML-corrected NRLMSISE-00 model', detail:'Global atmospheric density accuracy (Module G). Affects drag and reentry predictions.' },
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
    // ── Reacquisition Queue (Stale/Lost Objects) ────────
    reacquisition: [
        { norad:39271, name:'COSMOS 2499', regime:'LEO', state:'LOST', daysSince:14, priority:'CRITICAL', owner:'Russia/VKS', type:'Payload', rcs:1.2, reason:'Suspected maneuver — orbital elements diverged', taskingSite:'CHL-01', taskingStatus:'QUEUED', lastObs:'2026-04-17T08:22Z', custodyWindow:'3 days' },
        { norad:40258, name:'COSMOS 1408 DEB #247', regime:'LEO', state:'STALE', daysSince:8, priority:'HIGH', owner:'Debris', type:'Debris', rcs:0.04, reason:'Small fragment, low SNR — requires dark sky + good seeing', taskingSite:'AUS-01', taskingStatus:'SCHEDULED', lastObs:'2026-04-23T14:10Z', custodyWindow:'5 days' },
        { norad:46114, name:'USA-310 (GSSAP-5)', regime:'GEO', state:'STALE', daysSince:6, priority:'CRITICAL', owner:'USSF', type:'Payload', rcs:0.3, reason:'GEO inspector satellite — national security asset, erratic station-keeping', taskingSite:'ExoAnalytic', taskingStatus:'IN PROGRESS', lastObs:'2026-04-25T02:45Z', custodyWindow:'7 days' },
        { norad:99903, name:'UCT-2025-1847', regime:'HEO', state:'LOST', daysSince:22, priority:'HIGH', owner:'UCT', type:'Unknown', rcs:0.08, reason:'Molniya-type orbit, only visible at apogee — short window', taskingSite:'EUR-02', taskingStatus:'QUEUED', lastObs:'2026-04-09T19:33Z', custodyWindow:'14 days' },
        { norad:44832, name:'COSMOS 2251 DEB #19', regime:'LEO', state:'STALE', daysSince:5, priority:'MEDIUM', owner:'Debris', type:'Debris', rcs:0.02, reason:'Size below detection threshold in poor seeing', taskingSite:'NAM-01', taskingStatus:'BLOCKED (seeing)', lastObs:'2026-04-26T11:20Z', custodyWindow:'5 days' },
        { norad:43602, name:'BEIDOU-3 M13', regime:'MEO', state:'STALE', daysSince:9, priority:'MEDIUM', owner:'PRC/BDS', type:'Payload', rcs:2.5, reason:'MEO tracking gap — insufficient sensor coverage at 20,200 km', taskingSite:'ISON', taskingStatus:'QUEUED', lastObs:'2026-04-22T06:55Z', custodyWindow:'10 days' },
        { norad:37348, name:'CZ-5B R/B (2021-035B)', regime:'LEO', state:'STALE', daysSince:4, priority:'HIGH', owner:'PRC/CASC', type:'Rocket Body', rcs:8.0, reason:'Rapidly decaying orbit — altitude dropping, reentry predicted', taskingSite:'LeoLabs', taskingStatus:'SCHEDULED', lastObs:'2026-04-27T15:40Z', custodyWindow:'2 days' },
        { norad:28868, name:'GALAXY 15', regime:'GEO', state:'STALE', daysSince:11, priority:'MEDIUM', owner:'Intelsat', type:'Payload', rcs:5.0, reason:'Zombie satellite — unresponsive since 2010, drifting in GEO belt', taskingSite:'Slingshot', taskingStatus:'QUEUED', lastObs:'2026-04-20T23:15Z', custodyWindow:'14 days' },
        { norad:25730, name:'Iridium 16 (defunct)', regime:'LEO', state:'LOST', daysSince:18, priority:'LOW', owner:'USA', type:'Payload', rcs:3.0, reason:'Defunct constellation sat, low priority but collision risk persists', taskingSite:'USSF-SSN', taskingStatus:'DEFERRED', lastObs:'2026-04-13T07:12Z', custodyWindow:'7 days' },
        { norad:41862, name:'MUOS-5', regime:'GEO', state:'STALE', daysSince:7, priority:'CRITICAL', owner:'USN', type:'Payload', rcs:6.0, reason:'US military comms satellite — high-value asset, anomalous drift detected', taskingSite:'GEODSS', taskingStatus:'IN PROGRESS', lastObs:'2026-04-24T18:30Z', custodyWindow:'7 days' },
        { norad:49445, name:'STARLINK-3271', regime:'LEO', state:'STALE', daysSince:3, priority:'LOW', owner:'SpaceX', type:'Payload', rcs:0.5, reason:'Routine — autonomous deorbit in progress, verifying disposal', taskingSite:'LeoLabs', taskingStatus:'SCHEDULED', lastObs:'2026-04-28T22:05Z', custodyWindow:'5 days' },
        { norad:99904, name:'UCT-2026-0512', regime:'LEO', state:'LOST', daysSince:30, priority:'HIGH', owner:'UCT', type:'Unknown', rcs:0.01, reason:'Sub-10cm fragment, detected once by Space Fence — never reacquired', taskingSite:'Space Fence', taskingStatus:'PRIORITY TASKED', lastObs:'2026-04-01T04:18Z', custodyWindow:'N/A' },
        { norad:27386, name:'FENGYUN 1C DEB #891', regime:'LEO', state:'STALE', daysSince:6, priority:'MEDIUM', owner:'Debris', type:'Debris', rcs:0.03, reason:'ASAT debris — high collision risk corridor, needs updated TLE', taskingSite:'CHL-01', taskingStatus:'QUEUED', lastObs:'2026-04-25T09:44Z', custodyWindow:'5 days' },
        { norad:39084, name:'YAOGAN-17A', regime:'LEO', state:'STALE', daysSince:10, priority:'HIGH', owner:'PRC/PLA', type:'Payload', rcs:4.0, reason:'Chinese ELINT triplet — suspected formation change, elements stale', taskingSite:'ExoAnalytic', taskingStatus:'IN PROGRESS', lastObs:'2026-04-21T13:28Z', custodyWindow:'5 days' },
        { norad:41335, name:'GAOFEN-4', regime:'GEO', state:'STALE', daysSince:8, priority:'MEDIUM', owner:'CNSA', type:'Payload', rcs:7.0, reason:'Chinese GEO imager — station-keeping maneuver detected, TLE invalid', taskingSite:'GEODSS', taskingStatus:'QUEUED', lastObs:'2026-04-23T01:55Z', custodyWindow:'7 days' },
        { norad:99905, name:'UCT-2026-0601', regime:'GEO', state:'LOST', daysSince:16, priority:'CRITICAL', owner:'UCT', type:'Unknown', rcs:0.2, reason:'Possible clandestine GEO deployment — 3 detections, no catalog match', taskingSite:'Slingshot', taskingStatus:'PRIORITY TASKED', lastObs:'2026-04-15T20:10Z', custodyWindow:'N/A' },
        { norad:43235, name:'COSMOS 2535', regime:'LEO', state:'STALE', daysSince:5, priority:'HIGH', owner:'Russia/VKS', type:'Payload', rcs:1.0, reason:'Russian inspector satellite — proximity ops suspected near USA-245', taskingSite:'USSF-SSN', taskingStatus:'IN PROGRESS', lastObs:'2026-04-26T16:02Z', custodyWindow:'3 days' },
        { norad:26038, name:'FENGYUN 1C DEB #1204', regime:'LEO', state:'LOST', daysSince:25, priority:'LOW', owner:'Debris', type:'Debris', rcs:0.005, reason:'Sub-5cm fragment — below tracking threshold for most sensors', taskingSite:'Space Fence', taskingStatus:'DEFERRED', lastObs:'2026-04-06T12:30Z', custodyWindow:'N/A' },
    ],
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
    const scopeColors = { FLEET:'#00e5ff', CATALOG:'#76ff03', FILTER:'#e040fb', CLOUD:'#ffd740', OPS:'#ff9100', SCIENCE:'#448aff' };
    panel.innerHTML = '<div class="card-header">System Gauges <span style="font-size:8px;font-weight:400;color:#546e7a;letter-spacing:0">&mdash; Global Pipeline Health</span></div>' + STATE.gauges.map(g => {
        const svg = createGaugeSVG(g);
        let color;
        if(g.invert) { color = g.value <= g.green ? '#00e676' : g.value <= g.yellow ? '#ffab00' : '#ff1744'; }
        else { color = g.value >= g.green ? '#00e676' : g.value >= g.yellow ? '#ffab00' : '#ff1744'; }
        const scopeCol = scopeColors[g.scope] || '#78909c';
        return `<div class="gauge-card" title="${g.detail || ''}">
            ${svg}
            <div class="gauge-info">
                <div class="gauge-label">${g.label} <span style="font-size:7px;font-weight:700;color:${scopeCol};background:${scopeCol}18;padding:1px 4px;border-radius:3px;margin-left:4px;vertical-align:middle">${g.scope}</span></div>
                <div class="gauge-value" style="color:${color}">${g.value}${g.unit ? ' '+g.unit : ''}</div>
                <div class="gauge-trend"><span class="up">▲ nominal</span></div>
                ${g.desc ? `<div style="font-size:7px;color:#546e7a;line-height:1.3;margin-top:1px;max-width:180px">${g.desc}</div>` : ''}
            </div>
        </div>`;
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

function renderMap(now) {
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
        // Allied/individual networks
        'ESA':'#42a5f5','FR-DGA':'#26c6da','FR-CNES':'#29b6f6','FR-CNRS':'#4dd0e1',
        'FR-OCA':'#80deea','DE-FHR':'#ffcc80','DE-DLR':'#ffab91','DE-MPIfR':'#bcaaa4',
        'UK-RAL':'#ef5350','CH-AIUB':'#ce93d8','NO-EISCAT':'#80cbc4',
        'IT-Sapienza':'#a5d6a7','JP-JAXA':'#fff176','RU-ISON':'#ef9a9a',
        'AU-RAAF':'#ffab40','AU-DST':'#ffd54f',
    };

    // Hex to rgba helper
    function hexToRgba(hex, alpha) {
        const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
        return `rgba(${r},${g},${b},${alpha})`;
    }

    // Sort: offline first (drawn behind), then active on top; radar before optical
    const sortedSites = [...STATE.sites].sort((a,b) => {
        if(a.status === 'offline' && b.status !== 'offline') return -1;
        if(a.status !== 'offline' && b.status === 'offline') return 1;
        return 0;
    });

    sortedSites.forEach(s => {
        const p = toXY(s.lat, s.lon);
        const col = netColors[s.network] || '#b0bec5';
        // Bigger dots: radar=6, optical=4 (was 4/2.5 — too small)
        const r = s.type === 'radar' ? 6 : 4;
        if(s.status !== 'offline') {
            // Glow halo — fixed gradient
            const grad = ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r*3.5);
            grad.addColorStop(0, hexToRgba(col, 0.35));
            grad.addColorStop(0.5, hexToRgba(col, 0.10));
            grad.addColorStop(1, hexToRgba(col, 0));
            ctx.beginPath(); ctx.arc(p.x,p.y,r*3.5,0,Math.PI*2);
            ctx.fillStyle = grad; ctx.fill();
        }
        // Dot with outline
        ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2);
        ctx.fillStyle = s.status==='offline' ? '#333' : col;
        ctx.globalAlpha = s.status==='offline' ? 0.25 : 0.95;
        ctx.fill();
        // White outline for active sites
        if(s.status !== 'offline') {
            ctx.strokeStyle = 'rgba(255,255,255,0.15)';
            ctx.lineWidth = 0.5;
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
        // Degraded sites get a yellow ring
        if(s.status === 'degraded') {
            ctx.beginPath(); ctx.arc(p.x,p.y,r+2,0,Math.PI*2);
            ctx.strokeStyle = '#ffab00'; ctx.lineWidth = 1.5; ctx.setLineDash([2,2]); ctx.stroke(); ctx.setLineDash([]);
        }
    });

    // Site count badge
    ctx.font = 'bold 10px Inter';
    ctx.fillStyle = 'rgba(10,14,26,0.75)'; ctx.fillRect(W-110, 4, 106, 20); ctx.strokeStyle='rgba(255,255,255,0.1)'; ctx.lineWidth=1; ctx.strokeRect(W-110,4,106,20);
    ctx.fillStyle = '#b0bec5'; ctx.textAlign = 'right'; ctx.fillText(`${STATE.sites.length} STATIONS`, W-8, 18); ctx.textAlign = 'left';

    // Legend — all major networks
    ctx.font = '9px Inter'; let lx = 10, ly = H - 6;
    const legendNets = ['USSF-SSN','LeoLabs','Slingshot','ExoAnalytic','ESA-SST','Contributing'];
    legendNets.forEach(name => {
        const col = netColors[name];
        ctx.fillStyle = col; ctx.fillRect(lx, ly-6, 8, 8);
        ctx.fillStyle = '#b0bec5'; ctx.fillText(name, lx+11, ly+1);
        lx += ctx.measureText(name).width + 22;
    });
    // Allied networks legend (second row)
    ctx.font = '8px Inter'; lx = 10; ly = H - 18;
    const alliedNets = ['ESA','FR-DGA','DE-FHR','UK-RAL','JP-JAXA','NO-EISCAT','AU-RAAF','CH-AIUB'];
    alliedNets.forEach(name => {
        const col = netColors[name] || '#b0bec5';
        ctx.fillStyle = col; ctx.fillRect(lx, ly-5, 6, 6);
        ctx.fillStyle = '#78909c'; ctx.fillText(name, lx+8, ly+1);
        lx += ctx.measureText(name).width + 14;
    });

    // Draw conjunction tracking blink effects
    if(now && typeof drawBlinkEffects === 'function') {
        drawBlinkEffects(ctx, W, H, now);
    }
}

// ── Conjunction Detection Blink Animation ───────────
// Slingshot network sites pulse yellow to indicate active tracking
function getConjTrackingSites() {
    const assignments = [];
    STATE.sites.forEach(s => {
        if(s.network === 'Slingshot' && s.status !== 'offline') {
            assignments.push({ siteId: s.id, lat: s.lat, lon: s.lon, evtId: '', tier: 'SLINGSHOT', color: '#ffd740' });
        }
    });
    return assignments;
}

// Build a deduped site→assignment map (highest tier wins)
function buildTrackingMap(assignments) {
    const siteMap = {};
    assignments.forEach(a => {
        if(!siteMap[a.siteId]) siteMap[a.siteId] = a;
        else if(a.tier === 'EMERGENCY') siteMap[a.siteId] = a;
        else if(a.tier === 'RED' && siteMap[a.siteId].tier !== 'EMERGENCY') siteMap[a.siteId] = a;
    });
    return siteMap;
}

// Animation state
let _blinkTrackingMap = {};
let _blinkAnimId = null;
let _blinkStartTime = 0;

// Draw blink effects directly onto the map canvas
function drawBlinkEffects(ctx, W, H, now) {
    if(Object.keys(_blinkTrackingMap).length === 0) return;
    const toXY = (lat,lon) => ({ x: (lon+180)/360*W, y: (90-lat)/180*H });
    const elapsed = (now - _blinkStartTime) / 1000;

    Object.values(_blinkTrackingMap).forEach(a => {
        const p = toXY(a.lat, a.lon);
        // Yellow pulse — slow breathing (~8 seconds per cycle)
        const speed = 0.12;
        const phase = (elapsed * speed) % 1.0;
        const ringR = 8 + phase * 14;
        const ringA = (1 - phase) * 0.4;
        ctx.beginPath();
        ctx.arc(p.x, p.y, ringR, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255,215,64,${ringA})`;
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Soft amber glow
        const pulseA = 0.06 + Math.sin(elapsed * speed * Math.PI * 2) * 0.06;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 10);
        grad.addColorStop(0, `rgba(255,215,64,${pulseA + 0.08})`);
        grad.addColorStop(1, `rgba(255,215,64,0)`);
        ctx.beginPath();
        ctx.arc(p.x, p.y, 10, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
    });

    // Badge
    const trackCount = Object.keys(_blinkTrackingMap).length;
    ctx.font = 'bold 9px Inter';
    const badgeText = `⚡ ${trackCount} SLINGSHOT ACTIVE`;
    const tw = ctx.measureText(badgeText).width;
    ctx.fillStyle = 'rgba(255,215,64,0.08)';
    const bx = 4, by = 4, bw = tw + 16, bh = 18;
    ctx.fillRect(bx, by, bw, bh);
    ctx.strokeStyle = 'rgba(255,215,64,0.2)';
    ctx.lineWidth = 1;
    ctx.strokeRect(bx, by, bw, bh);
    ctx.fillStyle = '#ffd740';
    ctx.textAlign = 'left';
    ctx.fillText(badgeText, bx + 6, by + 13);
}

// Animation loop — re-renders the map with blink effects at ~30fps
function startBlinkAnimation() {
    if(_blinkAnimId) cancelAnimationFrame(_blinkAnimId);
    const assignments = getConjTrackingSites();
    _blinkTrackingMap = buildTrackingMap(assignments);
    _blinkStartTime = performance.now();
    let lastFrame = 0;

    function tick(now) {
        // Throttle to ~30fps (33ms)
        if(now - lastFrame > 33) {
            lastFrame = now;
            renderMap(now); // re-render base map + blink effects
        }
        _blinkAnimId = requestAnimationFrame(tick);
    }
    _blinkAnimId = requestAnimationFrame(tick);
}

// Start after sites are loaded
setTimeout(() => { if(STATE.sites.length > 0) startBlinkAnimation(); }, 3000);
window.addEventListener('resize', () => { setTimeout(() => { if(STATE.sites.length > 0) startBlinkAnimation(); }, 300); });
// Maps site types/networks to installed equipment
const TECH_CATALOG = {
    optical: [
        {name:'Primary Telescope',model:'RASA 14" f/2.2 Astrograph',role:'Wide-field survey',power:'120W',installed:'2024-Q3',status:'operational'},
        {name:'Focal Plane Array',model:'QHY600M CMOS (61MP)',role:'Streak detection',power:'25W',installed:'2024-Q3',status:'operational'},
        {name:'Mount',model:'ASA DDM160 Direct Drive',role:'Sidereal & rate tracking',power:'280W',installed:'2024-Q3',status:'operational'},
        {name:'Filter Wheel',model:'SBIG FW8G-STX (BVRI+Clear)',role:'Photometric classification',power:'15W',installed:'2025-Q1',status:'operational'},
        {name:'Autoguider',model:'ZWO ASI174MM Mini',role:'Sub-arcsec guiding',power:'5W',installed:'2024-Q3',status:'operational'},
        {name:'All-Sky Camera',model:'ZWO ASI120MC-S',role:'Cloud/weather monitor',power:'3W',installed:'2024-Q4',status:'operational'},
        {name:'GPS Timing Receiver',model:'u-blox ZED-F9T (ns-grade)',role:'UTC sync for TDM',power:'1.5W',installed:'2025-Q1',status:'operational'},
        {name:'Weather Station',model:'Davis Vantage Pro2',role:'Seeing/humidity monitor',power:'2W',installed:'2024-Q3',status:'operational'},
    ],
    radar: [
        {name:'Phased Array Radar',model:'S-band 2.8 GHz PA (1024 elements)',role:'Object detection & tracking',power:'45kW peak',installed:'2023-Q4',status:'operational'},
        {name:'Signal Processor',model:'FPGA-based RFSoC (Xilinx ZCU111)',role:'Pulse compression & Doppler',power:'150W',installed:'2024-Q1',status:'operational'},
        {name:'Timing Reference',model:'Rb Frequency Standard (SRS FS725)',role:'Coherent integration',power:'40W',installed:'2023-Q4',status:'operational'},
        {name:'Range Safety',model:'IFF Mode-S Transponder',role:'Aircraft deconfliction',power:'35W',installed:'2023-Q4',status:'operational'},
        {name:'Calibration Horn',model:'Standard Gain Horn (20 dBi)',role:'Radar cross-section cal',power:'0W',installed:'2023-Q4',status:'operational'},
        {name:'UPS',model:'APC Smart-UPS 5kVA',role:'Power continuity',power:'5kVA',installed:'2023-Q4',status:'operational'},
    ],
    edge: [
        {name:'Edge GPU',model:'NVIDIA Jetson Orin AGX 64GB',role:'PINN streak detection',power:'60W',installed:'2025-Q1',status:'operational'},
        {name:'Edge Storage',model:'Samsung 990 PRO NVMe 4TB',role:'24h raw frame buffer',power:'8W',installed:'2025-Q1',status:'operational'},
        {name:'Network Uplink',model:'Starlink Business (100 Mbps)',role:'TDM/obs upload to cloud',power:'50W',installed:'2025-Q2',status:'operational'},
        {name:'Environmental Enclosure',model:'IP67 Pelican Rack (climate-controlled)',role:'Hardware protection',power:'35W HVAC',installed:'2025-Q1',status:'operational'},
        {name:'Power Mgmt',model:'Victron MultiPlus 3kVA + LiFePO4',role:'Off-grid backup (8h)',power:'3kVA',installed:'2025-Q1',status:'operational'},
    ],
    software: [
        {name:'Streak Detector',model:'streak_detect.cu v3.2',role:'PINN J2-J6 matched filter',version:'3.2.1',status:'running'},
        {name:'Orbit Determination',model:'bayesian_iod.py v2.1',role:'Initial orbit from 3 obs',version:'2.1.0',status:'running'},
        {name:'Catalog Correlator',model:'catalog_lifecycle.py v1.4',role:'UCT → TENTATIVE → CATALOGED',version:'1.4.2',status:'running'},
        {name:'Telemetry Agent',model:'kafka_transport.py v1.0',role:'Kafka producer/consumer',version:'1.0.5',status:'running'},
        {name:'Site Monitor',model:'site_monitor.py v1.2',role:'Health, weather, queue mgmt',version:'1.2.0',status:'running'},
    ],
};

// ── Map Hover Tooltip ───────────────────────────────
const mapTooltip = document.getElementById('mapTooltip');
const mapCanvas = document.getElementById('mapCanvas');
let _sitePositions = []; // cached pixel positions

// Store site positions during render for hit-testing
const _origRenderMap = renderMap;
renderMap = function(now) {
    _origRenderMap(now);
    // Cache positions for hit testing
    const canvas = document.getElementById('mapCanvas');
    if(!canvas) return;
    const W = canvas.width, H = canvas.height;
    const toXY = (lat,lon) => ({ x: (lon+180)/360*W, y: (90-lat)/180*H });
    _sitePositions = STATE.sites.map(s => ({ ...s, px: toXY(s.lat,s.lon) }));
};

function findSiteAtPoint(mx, my) {
    const threshold = 12;
    for(let i = _sitePositions.length-1; i>=0; i--) {
        const s = _sitePositions[i];
        const dx = mx - s.px.x, dy = my - s.px.y;
        if(dx*dx + dy*dy < threshold*threshold) return s;
    }
    return null;
}
let _hoveredSite = null; // current hover target for tooltip links

// ── Per-Site Unique Equipment Registry ──────────────
// Maps sensor names / networks to unique, site-specific equipment and specs
const SENSOR_SPECS = {
    'AN/FPS-85':  {aperture:'Phased Array (planar, 72×72m face)',band:'UHF 442 MHz',range:'40,000 km',trackRate:'200 obj/min',power:'800 kW peak',generation:'Gen 2 (1969, upgraded 2003)',uniqueNote:'Only space surveillance radar purpose-built for tracking — the "backbone" of USSF deep-space surveillance'},
    'UEWR':       {aperture:'Solid-State Phased Array (25m face)',band:'UHF 420-450 MHz',range:'5,500 km',trackRate:'120 obj/min',power:'22 MW peak',generation:'Gen 3 (2000s Upgraded Early Warning)',uniqueNote:'Dual-mission: missile warning + space surveillance, AN/FPS-132 derivative'},
    'AN/FPS-108': {aperture:'Mechanically Steered Phased Array',band:'L-band 1.175-1.375 GHz',range:'4,000 km',trackRate:'90 obj/min',power:'3 MW peak',generation:'Gen 2 (Cobra Dane, 1977)',uniqueNote:'Largest single-face phased array in the world, primarily treaty monitoring + SSA'},
    'Space Fence': {aperture:'Distributed S-band (ground-based fence)',band:'S-band 2.8 GHz',range:'1,500 km LEO',trackRate:'1,500 obj/pass',power:'6 MW distributed',generation:'Gen 4 (2020 IOC)',uniqueNote:'Next-gen cataloging — detects objects as small as 5cm. First S-band space surveillance system'},
    'PARCS':      {aperture:'Single-face Phased Array (26m)',band:'UHF 430 MHz',range:'3,700 km',trackRate:'80 obj/min',power:'500 kW peak',generation:'Gen 1 (1975, Safeguard heritage)',uniqueNote:'Perimeter Acquisition Radar Characterization System — northward-facing for polar orbits'},
    'PAVE PAWS':  {aperture:'Dual-face Phased Array',band:'UHF 420-450 MHz',range:'5,500 km',trackRate:'100 obj/min',power:'600 kW peak',generation:'Gen 2 (1980)',uniqueNote:'SLBM early warning + space surveillance, two 72° coverage faces'},
    'GEODSS':     {aperture:'1.0m Cassegrain + 0.38m aux',band:'Visible (450-850nm)',range:'GEO (36,000 km)',trackRate:'10 obj/hr',power:'2.5 kW telescope',generation:'Gen 2 (1982, CMOS upgrade 2018)',uniqueNote:'Ground-based Electro-Optical Deep Space Surveillance — the deep-space "eyes" of the USSF'},
    'AMOS 3.6m':  {aperture:'3.67m Cassegrain (AEOS)',band:'Visible + Adaptive Optics',range:'GEO + HEO',trackRate:'5 obj/hr',power:'8 kW',generation:'Gen 3 (2002)',uniqueNote:'Advanced Electro-Optical System — highest-resolution ground-based space imaging in DoD. Can resolve satellite shape at GEO'},
    'SST 3.5m':   {aperture:'3.5m DARPA Space Surv Telescope',band:'Visible (wide-field)',range:'GEO 42,000 km',trackRate:'100+ obj/night (survey)',power:'5 kW',generation:'Gen 4 (transferred to AU 2022)',uniqueNote:'Widest field-of-view for GEO surveillance — now operated jointly with Royal Australian Air Force at Harold E. Holt NCS'},
    'MCAT 1.3m':  {aperture:'1.3m Ritchey-Chrétien',band:'Visible + NIR',range:'GEO',trackRate:'15 obj/hr',power:'3 kW',generation:'Gen 3 (2015)',uniqueNote:'Meter-Class Autonomous Telescope — dedicated GEO survey from southern hemisphere'},
    'HUSIR':      {aperture:'37m Cassegrain (Haystack UWB)',band:'W-band 96 GHz',range:'1,000 km LEO',trackRate:'20 obj/hr',power:'400 kW peak',generation:'Gen 3 (2014 upgrade)',uniqueNote:'Haystack Ultrawideband Satellite Imaging Radar — millimeter-wave imaging resolves 10cm features on LEO objects'},
    'Millstone L-band':{aperture:'26m Cassegrain',band:'L-band 1.295 GHz',range:'20,000 km',trackRate:'40 obj/hr',power:'3 MW peak',generation:'Gen 2 (1957, upgraded)',uniqueNote:'Lincoln Labs heritage radar — operational since Sputnik era, deep-space metric tracking'},
    'ARPA LR Track':{aperture:'Parabolic Reflector',band:'UHF/VHF',range:'40,000 km',trackRate:'30 obj/hr',power:'6 MW peak',generation:'Gen 2 (1970)',uniqueNote:'ALTAIR radar — longest-range deep-space tracking radar in the Pacific'},
    'ALCOR C-band':{aperture:'12m Dish',band:'C-band 5.6 GHz',range:'2,000 km',trackRate:'50 obj/hr',power:'2 MW peak',generation:'Gen 2 (1970)',uniqueNote:'Narrow-beam imaging radar — wideband RCS measurement for satellite characterization'},
    'AN/FPS-16':  {aperture:'3.6m Parabolic',band:'C-band 5.5 GHz',range:'500 km',trackRate:'1 obj (tracking)',power:'1 MW peak',generation:'Gen 1 (1960s)',uniqueNote:'Precision tracking radar — primarily range safety, repurposed for SSA support'},
    'AN/FPS-132': {aperture:'Solid-State Phased Array',band:'UHF 420-450 MHz',range:'5,500 km',trackRate:'120 obj/min',power:'22 MW peak',generation:'Gen 3 (BMEWS upgrade)',uniqueNote:'Upgraded BMEWS — solid-state transmit/receive modules replaced legacy klystrons'},
    'AN/FPS-133': {aperture:'Phased Array (two faces)',band:'UHF 420-450 MHz',range:'4,600 km',trackRate:'100 obj/min',power:'500 kW peak',generation:'Gen 2 (PAVE PAWS variant)',uniqueNote:'West Coast SLBM warning + SSA, 240° azimuth coverage from two faces'},
    'DARC':       {aperture:'S-band Phased Array (dual-face)',band:'S-band 3.3 GHz',range:'3,000 km',trackRate:'200 obj/min',power:'4 MW peak',generation:'Gen 4 (2023 IOC)',uniqueNote:'Deep-space Advanced Radar Capability — newest USSF radar, globally distributed for 24/7 GEO coverage'},
    'Starfire OD': {aperture:'3.5m (Starfire Optical Range)',band:'Vis + Adaptive Optics + Laser',range:'GEO',trackRate:'5 obj/hr',power:'6 kW + laser guide star',generation:'Gen 3 (2000s)',uniqueNote:'Air Force Research Lab — pioneered AO for space surveillance, 3.5m sodium-guide-star system'},
    'Raven-class': {aperture:'0.4m COTS Cassegrain',band:'Visible',range:'GEO',trackRate:'20 obj/night',power:'0.5 kW',generation:'Gen 3 (2005+)',uniqueNote:'Small-aperture, globally deployed GEO surveillance network — 12+ sites worldwide'},
    'Purdy 1.0m': {aperture:'1.0m Dall-Kirkham',band:'Visible + NIR',range:'GEO',trackRate:'10 obj/hr',power:'2 kW',generation:'Gen 3 (2018)',uniqueNote:'Automated metric tracking — supports GEODSS overflow and southern hemisphere coverage'},
    'Ground Cal':  {aperture:'Calibration Reference',band:'Multi-band',range:'Varies',trackRate:'N/A',power:'1 kW',generation:'Gen 3',uniqueNote:'Ground calibration facility for on-orbit sensor characterization'},
    'GRAVES Bistatic':{aperture:'Tx: 4×8 dipole array, Rx: 100m baseline',band:'VHF 143.05 MHz',range:'1,500 km LEO',trackRate:'100 obj/day',power:'10 kW CW',generation:'Gen 3 (2005)',uniqueNote:'Only European operational space surveillance radar — continuous-wave bistatic fence design'},
    'TIRA L/Ku':  {aperture:'34m Cassegrain',band:'L (1.33 GHz) + Ku (16.7 GHz)',range:'2,000 km',trackRate:'20 obj/hr',power:'1 MW L + 15 kW Ku',generation:'Gen 3 (1990s)',uniqueNote:'Tracking and Imaging Radar — highest-resolution radar imagery in Europe, resolves 10cm features'},
    'EISCAT UHF': {aperture:'32m Cassegrain',band:'UHF 931 MHz',range:'1,500 km',trackRate:'30 obj/hr',power:'2 MW peak',generation:'Gen 2 (1981)',uniqueNote:'Ionospheric research radar repurposed for space debris measurement campaigns'},
    'Phased Array S-band':{aperture:'Phased Array (256/512 elements)',band:'S-band 2.4 GHz',range:'1,200 km LEO',trackRate:'800 obj/pass',power:'200 kW peak',generation:'Gen 4 (LeoLabs proprietary)',uniqueNote:'Commercial SSA radar — optimized for LEO catalog completeness to 2cm'},
    'Numerica 0.5m':{aperture:'0.5m f/4 Newtonian',band:'Visible',range:'GEO 42,000 km',trackRate:'30 obj/night',power:'0.8 kW',generation:'Gen 3 (Numerica/Slingshot)',uniqueNote:'Commercial optical surveillance — Slingshot acquisition, automated scheduling, near-real-time reporting'},
    'SBIG FW8G-STX':{aperture:'Filter Wheel',band:'BVRI+Clear',range:'N/A',trackRate:'N/A',power:'15W',generation:'Gen 2',uniqueNote:'Standard photometric filter set'},
    'TAROT 25cm':  {aperture:'0.25m f/3.4 astrograph',band:'Visible (unfiltered)',range:'LEO + MEO',trackRate:'60 obj/night',power:'0.3 kW',generation:'Gen 2 (1999)',uniqueNote:'Télescope à Action Rapide — designed for GRB followup, repurposed for debris survey'},
    'AIUB 1m':     {aperture:'1.0m Ritchey-Chrétien (ZIMLAT)',band:'Visible + Laser ranging',range:'GEO + HEO',trackRate:'15 obj/night',power:'2 kW + laser',generation:'Gen 3 (2008)',uniqueNote:'Astronomical Institute of University of Bern — combined SLR + passive optical, precision orbit determination'},
    'OGS 1m':      {aperture:'1.0m Zeiss (ESA Optical Ground Station)',band:'Visible + Laser comms',range:'GEO',trackRate:'10 obj/night',power:'3 kW',generation:'Gen 2 (1995)',uniqueNote:'ESA dual-purpose: SSA survey + optical comms technology demonstration (quantum key distribution)'},
    'DLR 0.5m':    {aperture:'0.5m Cassegrain',band:'Visible',range:'GEO',trackRate:'20 obj/night',power:'0.8 kW',generation:'Gen 2 (2012)',uniqueNote:'German Aerospace Center survey telescope — automated scheduling for DLR/ESA SSA programme'},
};

// Per-site upgrade recommendation engine
function getUpgradePath(site) {
    const sensor = site.sensor || '';
    const gen = SENSOR_SPECS[sensor]?.generation || '';
    const genNum = parseInt(gen.match(/Gen (\d)/)?.[1]) || 2;
    const upgrades = [];
    // Hardware upgrades based on generation
    if(genNum <= 2) {
        upgrades.push({item:'Receiver → GaN T/R modules',priority:'HIGH',eta:'2026-Q4',cost:'$2.4M',reason:'Legacy klystron/vacuum-tube → solid-state, +40% sensitivity'});
        upgrades.push({item:'Signal processor → FPGA RFSoC',priority:'HIGH',eta:'2026-Q3',cost:'$180K',reason:'Replace 2010-era DSP boards with Xilinx ZCU216'});
    }
    if(genNum <= 3 && site.type === 'optical') {
        upgrades.push({item:'Detector → QHY600M CMOS',priority:'MEDIUM',eta:'2026-Q2',cost:'$28K',reason:'Replace CCD with CMOS — 3× faster readout, lower noise floor'});
        upgrades.push({item:'Mount firmware → v4.1 (predictive slew)',priority:'LOW',eta:'2026-Q1',cost:'$0',reason:'Software update — reduces target acquisition time by 15%'});
    }
    if(site.gpu < 50 && site.type === 'optical') {
        upgrades.push({item:'Edge GPU → Orin AGX 64GB',priority:'HIGH',eta:'2026-Q2',cost:'$2.2K',reason:'Current GPU below PINN inference threshold — streak detection running CPU-fallback'});
    }
    // Network upgrades
    const hasStarlink = site.network === 'SentinelForge' || site.network === 'ExoAnalytic';
    if(!hasStarlink && site.network !== 'USSF-SSN') {
        upgrades.push({item:'Uplink → Starlink Business',priority:'MEDIUM',eta:'2026-Q3',cost:'$500/mo',reason:'Replace DSL/cellular with 100+ Mbps LEO sat backhaul for real-time TDM delivery'});
    }
    if(upgrades.length === 0) {
        upgrades.push({item:'All systems at Gen 4+',priority:'NONE',eta:'—',cost:'—',reason:'No upgrades recommended — site meets SentinelForge v3.x baseline requirements'});
    }
    return upgrades;
}

// Per-site satellite data network hookup
function getSatDataNetwork(site) {
    const nets = {
        'USSF-SSN':  {uplink:'SATCOM (WGS/AEHF) + terrestrial fiber',bandwidth:'10 Gbps fiber / 250 Mbps SATCOM',protocol:'CCSDS TDM v2.0 + SP ephemeris',cloud:'CSpOC JMS (Joint Mission System)',classification:'SECRET/NOFORN',latency:'<200ms (fiber) / 400ms (SATCOM)',dataFormat:'CCSDS TDM + custom JMS schema',note:'Primary DoD SSA pipeline — all data classified and routed through CSpOC'},
        'LeoLabs':   {uplink:'Starlink Business + regional fiber',bandwidth:'100 Mbps (Starlink) / 1 Gbps (fiber)',protocol:'Proprietary LeoLabs API (REST/gRPC)',cloud:'LeoLabs Cloud (AWS GovCloud)',classification:'UNCLASSIFIED / CUI',latency:'<150ms',dataFormat:'JSON catalog + TDM export',note:'Commercial SSA — near-real-time catalog updates, API access for O/O customers'},
        'Slingshot': {uplink:'Starlink + terrestrial',bandwidth:'100 Mbps',protocol:'Slingshot Beacon API + CCSDS TDM',cloud:'Slingshot Cloud (Azure)',classification:'UNCLASSIFIED',latency:'<200ms',dataFormat:'Beacon format + TDM/OEM export',note:'Commercial SSA platform — Numerica-heritage orbit determination pipeline'},
        'ExoAnalytic':{uplink:'Starlink + VSAT Ku-band',bandwidth:'50 Mbps (VSAT) / 100 Mbps (Starlink)',protocol:'ExoAnalytic REST API v3',cloud:'ExoAnalytic Cloud (GCP)',classification:'UNCLASSIFIED',latency:'<300ms',dataFormat:'Proprietary + TDM/OEM export',note:'Commercial GEO surveillance — AI-driven object characterization + activity detection'},
        'ESA-SST':   {uplink:'ESTRACK DSN + terrestrial',bandwidth:'2 Gbps (ESTRACK fiber)',protocol:'CCSDS TDM + ESA SST data format',cloud:'ESA SSA Programme (ESOC Darmstadt)',classification:'EU RESTRICTED',latency:'<250ms',dataFormat:'CCSDS TDM + ESA DISCOSweb',note:'European SST programme — multi-national sensor network coordinated via EU SST Consortium'},
    };
    // Fallback for allied/contributing sites
    const fallback = {uplink:'Terrestrial broadband',bandwidth:'50-200 Mbps',protocol:'CCSDS TDM (Space-Track push)',cloud:'Space-Track.org + national SSA center',classification:'UNCLASSIFIED',latency:'<500ms',dataFormat:'CCSDS TDM / GP catalog',note:'Contributing sensor — data shared via bilateral SSA sharing agreement'};
    return nets[site.network] || fallback;
}

// Programming stack per site
function getProgrammingStack(site) {
    if(site.network === 'USSF-SSN') {
        return {os:'RHEL 8.x (STIG-hardened)',runtime:'C++17/CUDA 12.x',ml:'N/A (classified pipeline)',scheduler:'JMS Tasker v4.2',observability:'Splunk + Nagios',cicd:'Air-gapped GitLab CI'};
    }
    if(site.network === 'LeoLabs') {
        return {os:'Ubuntu 22.04 LTS',runtime:'Python 3.11 + Rust',ml:'PyTorch 2.3 + TensorRT',scheduler:'LeoLabs Scheduler v6',observability:'Datadog + Grafana',cicd:'GitHub Actions → AWS CodeDeploy'};
    }
    if(site.network === 'Slingshot' || site.network === 'ExoAnalytic') {
        return {os:'Ubuntu 22.04 LTS',runtime:'Python 3.11 + C++17',ml:'PyTorch 2.3 + ONNX Runtime',scheduler:'Slingshot Beacon Scheduler',observability:'Prometheus + Grafana',cicd:'Azure DevOps Pipelines'};
    }
    // Default (SentinelForge / Contributing)
    return {os:'Ubuntu 22.04 LTS (SentinelForge Edge Image)',runtime:'Python 3.11 + CUDA 12.4 + C++17',ml:'PyTorch 2.3 + TensorRT 10 + ONNX',scheduler:'sf_tasker v1.4 (Kafka-driven)',observability:'Prometheus + Grafana + PagerDuty',cicd:'GitHub Actions → Docker → Edge OTA'};
}

if(mapCanvas) {
    mapCanvas.addEventListener('mousemove', (e) => {
        const rect = mapCanvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (mapCanvas.width / rect.width);
        const my = (e.clientY - rect.top) * (mapCanvas.height / rect.height);
        const site = findSiteAtPoint(mx, my);
        if(site) {
            const statusColor = site.status==='active'?'#00e676':site.status==='degraded'?'#ffab00':'#ff1744';
            const statusIcon = site.status==='active'?'🟢':site.status==='degraded'?'🟡':'🔴';
            const netColor = {'USSF-SSN':'#ff1744','LeoLabs':'#00e5ff','Slingshot':'#ffd740','ExoAnalytic':'#76ff03','ESA-SST':'#448aff'}[site.network] || '#e040fb';
            const spec = SENSOR_SPECS[site.sensor] || {};
            const upgrades = getUpgradePath(site);
            const satNet = getSatDataNetwork(site);
            const progStack = getProgrammingStack(site);

            // Position tooltip — keep within map bounds
            let ttLeft = e.clientX - rect.left + 16;
            let ttTop = e.clientY - rect.top - 10;
            if(ttLeft + 430 > rect.width) ttLeft = e.clientX - rect.left - 440;
            if(ttTop + 300 > rect.height) ttTop = rect.height - 320;
            if(ttTop < 0) ttTop = 4;

            mapTooltip.style.display = 'block';
            mapTooltip.style.left = ttLeft + 'px';
            mapTooltip.style.top = ttTop + 'px';
            mapTooltip.innerHTML = `
                <div class="tt-name">${statusIcon} ${site.name} <span class="tt-badge" style="background:${netColor}22;color:${netColor};border:1px solid ${netColor}44;margin-left:6px">${site.network}</span></div>
                <div class="tt-loc">${site.id} · ${site.lat.toFixed(2)}°${site.lat>=0?'N':'S'}, ${Math.abs(site.lon).toFixed(2)}°${site.lon>=0?'E':'W'} · <span style="color:${statusColor};font-weight:700">${site.status.toUpperCase()}</span></div>
                <div class="tt-stat">
                    <span style="color:${statusColor};font-weight:600">${site.type.toUpperCase()}</span> · <b>${site.sensor}</b>
                    ${site.seeing ? ` · Seeing: <b>${site.seeing}"</b>` : ''}
                    · Det/24h: <b style="color:#e8eaf6">${site.detections_24h.toLocaleString()}</b>
                    · Queue: <b>${site.queue}</b>
                    ${site.gpu ? ` · GPU: <b>${site.gpu}%</b>` : ''}
                </div>

                <!-- UNIQUE EQUIPMENT -->
                ${spec.aperture ? `<div class="tt-section">
                    <div class="tt-label" style="color:#00e5ff">🔭 Sensor Equipment — ${spec.generation || 'Unknown Gen'}</div>
                    <div class="tt-grid">
                        <div>Aperture: <b>${spec.aperture}</b></div>
                        <div>Band: <b>${spec.band}</b></div>
                        <div>Range: <b>${spec.range}</b></div>
                        <div>Track Rate: <b>${spec.trackRate}</b></div>
                        <div>Power: <b>${spec.power}</b></div>
                    </div>
                    <div style="margin-top:3px;font-size:8px;color:#78909c;font-style:italic">${spec.uniqueNote || ''}</div>
                </div>` : ''}

                <!-- SAT DATA NETWORK -->
                <div class="tt-section">
                    <div class="tt-label" style="color:#7c4dff">📡 Sat-Data Network Hookup</div>
                    <div class="tt-grid">
                        <div>Uplink: <b>${satNet.uplink}</b></div>
                        <div>Bandwidth: <b>${satNet.bandwidth}</b></div>
                        <div>Protocol: <b>${satNet.protocol}</b></div>
                        <div>Latency: <b style="color:#76ff03">${satNet.latency}</b></div>
                        <div>Cloud: <b>${satNet.cloud}</b></div>
                        <div>Class: <span class="tt-badge" style="background:${satNet.classification.includes('SECRET')?'rgba(255,23,68,0.15)':'rgba(0,229,255,0.1)'};color:${satNet.classification.includes('SECRET')?'#ff1744':'#00e5ff'}">${satNet.classification}</span></div>
                    </div>
                </div>

                <!-- PROGRAMMING STACK -->
                <div class="tt-section">
                    <div class="tt-label" style="color:#76ff03">💻 Programming Stack</div>
                    <div class="tt-grid">
                        <div>OS: <b>${progStack.os}</b></div>
                        <div>Runtime: <b>${progStack.runtime}</b></div>
                        <div>ML/AI: <b>${progStack.ml}</b></div>
                        <div>Scheduler: <b>${progStack.scheduler}</b></div>
                        <div>Obs: <b>${progStack.observability}</b></div>
                        <div>CI/CD: <b>${progStack.cicd}</b></div>
                    </div>
                </div>

                <!-- UPGRADE PATH -->
                <div class="tt-section">
                    <div class="tt-label" style="color:#ffd740">⬆ Upgrade Path</div>
                    ${upgrades.map(u => {
                        const pCol = u.priority==='HIGH'?'#ff1744':u.priority==='MEDIUM'?'#ffab00':u.priority==='LOW'?'#76ff03':'#546e7a';
                        return `<div style="display:flex;align-items:flex-start;gap:6px;margin-bottom:2px;font-size:9px">
                            <span class="tt-badge" style="background:${pCol}22;color:${pCol};min-width:36px;text-align:center">${u.priority}</span>
                            <div><b>${u.item}</b><br><span style="color:#78909c;font-size:8px">${u.reason}</span></div>
                            <div style="margin-left:auto;text-align:right;white-space:nowrap;color:#546e7a;font-size:8px">${u.eta}<br>${u.cost}</div>
                        </div>`;
                    }).join('')}
                </div>

                <div style="margin-top:6px;display:flex;justify-content:space-between;align-items:center">
                    <a href="#" onclick="_hoveredSite&&openTechnicianSheet(_hoveredSite);return false" style="color:#ffd740;font-size:9px;font-weight:700;text-decoration:none;cursor:pointer;padding:3px 8px;border:1px solid rgba(255,215,64,0.3);border-radius:4px;background:rgba(255,215,64,0.08)">📋 TECHNICIAN UPGRADE SHEET →</a>
                    <span style="color:#546e7a;font-size:8px">Click dot for full catalog</span>
                </div>`;
            _hoveredSite = site; // store ref for technician sheet link
            mapCanvas.style.cursor = 'pointer';
        } else {
            mapTooltip.style.display = 'none';
            mapCanvas.style.cursor = 'crosshair';
        }
    });

    mapCanvas.addEventListener('mouseleave', () => { mapTooltip.style.display = 'none'; });

    mapCanvas.addEventListener('click', (e) => {
        const rect = mapCanvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (mapCanvas.width / rect.width);
        const my = (e.clientY - rect.top) * (mapCanvas.height / rect.height);
        const site = findSiteAtPoint(mx, my);
        if(site) openSiteModal(site);
    });
}

// ── Site Detail Modal ───────────────────────────────
const siteModal = document.getElementById('siteModal');
const siteModalClose = document.getElementById('siteModalClose');
if(siteModalClose) siteModalClose.addEventListener('click', () => { siteModal.style.display = 'none'; });
if(siteModal) siteModal.addEventListener('click', (e) => { if(e.target === siteModal) siteModal.style.display = 'none'; });

function openSiteModal(site) {
    _lastModalSite = site;
    const title = document.getElementById('siteModalTitle');
    const body = document.getElementById('siteModalBody');
    title.textContent = `${site.id} — ${site.name}`;
    const statusColor = site.status==='active'?'#00e676':site.status==='degraded'?'#ffab00':'#ff1744';
    const sensorEquip = TECH_CATALOG[site.type] || TECH_CATALOG.optical;
    const edgeEquip = TECH_CATALOG.edge;
    const swEquip = TECH_CATALOG.software;
    // Simulate per-site health variation
    const seed = site.id.charCodeAt(0) + site.id.charCodeAt(site.id.length-1);
    const jitter = (idx) => Math.min(100, Math.max(60, 85 + ((seed*7 + idx*13) % 30) - 15));

    body.innerHTML = `
        <h3>📍 Location & Status</h3>
        <table>
            <tr><td style="color:#78909c;width:130px">Coordinates</td><td><b>${site.lat.toFixed(2)}°${site.lat>=0?'N':'S'}, ${Math.abs(site.lon).toFixed(2)}°${site.lon>=0?'E':'W'}</b></td></tr>
            <tr><td style="color:#78909c">Network</td><td>${site.network}</td></tr>
            <tr><td style="color:#78909c">Type</td><td>${site.type.charAt(0).toUpperCase()+site.type.slice(1)}</td></tr>
            <tr><td style="color:#78909c">Sensor</td><td>${site.sensor}</td></tr>
            <tr><td style="color:#78909c">Status</td><td><span style="color:${statusColor};font-weight:700">${site.status.toUpperCase()}</span></td></tr>
            <tr><td style="color:#78909c">GPU Load</td><td>${site.gpu}%</td></tr>
            <tr><td style="color:#78909c">Detections (24h)</td><td><a href="#" onclick="showDetections('${site.id}',${site.detections_24h},${seed});return false" style="color:#00e5ff;text-decoration:underline;cursor:pointer;font-weight:700">${site.detections_24h} — View Inventory →</a></td></tr>
            <tr><td style="color:#78909c">Tasking Queue</td><td>${site.queue} pending</td></tr>
            ${site.seeing ? `<tr><td style="color:#78909c">Seeing</td><td>${site.seeing}"</td></tr>` : ''}
        </table>
        <h3>🔭 ${site.type === 'radar' ? 'Radar' : 'Optical'} Equipment Catalog</h3>
        <table><tr><th>Component</th><th>Model</th><th>Role</th><th>Power</th><th>Status</th></tr>
            ${sensorEquip.map((t,i) => `<tr><td style="color:#e8eaf6">${t.name}</td><td>${t.model}</td><td style="color:#78909c">${t.role}</td><td>${t.power}</td><td><span style="color:${jitter(i)>75?'#00e676':'#ffab00'}">${jitter(i)>75?'✓ OK':'⚠ Check'}</span></td></tr>`).join('')}
        </table>
        <h3>🖥️ Edge Compute Stack</h3>
        <table><tr><th>Component</th><th>Model</th><th>Role</th><th>Power</th><th>Health</th></tr>
            ${edgeEquip.map((t,i) => { const h=jitter(i+10); const col=h>80?'#00e676':h>60?'#ffab00':'#ff1744'; return `<tr><td style="color:#e8eaf6">${t.name}</td><td>${t.model}</td><td style="color:#78909c">${t.role}</td><td>${t.power}</td><td><div class="diag-bar"><div class="diag-fill" style="width:${h}%;background:${col}"></div></div> ${h}%</td></tr>`; }).join('')}
        </table>
        <h3>💻 Software Stack</h3>
        <table><tr><th>Module</th><th>Version</th><th>Role</th><th>Status</th></tr>
            ${swEquip.map(t => `<tr><td style="color:#e8eaf6">${t.name}</td><td style="font-family:JetBrains Mono,mono;color:#76ff03">${t.version}</td><td style="color:#78909c">${t.role}</td><td><span style="color:#00e676">● Running</span></td></tr>`).join('')}
        </table>
        <h3>📊 24h Performance</h3>
        <table>
            <tr><td style="color:#78909c;width:180px">False Positive Rate</td><td>${(0.15+(seed%10)*0.03).toFixed(2)}%</td></tr>
            <tr><td style="color:#78909c">Data Reduction</td><td>${(400+(seed%200))}:1</td></tr>
            <tr><td style="color:#78909c">Uplink</td><td>${(45+(seed%50)).toFixed(0)} Mbps</td></tr>
            <tr><td style="color:#78909c">Mean Track</td><td>${(12+(seed%20)).toFixed(1)}s</td></tr>
            <tr><td style="color:#78909c">Uptime (30d)</td><td>${(96+Math.random()*3.5).toFixed(1)}%</td></tr>
        </table>
        <div style="margin-top:12px;text-align:center;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06)">
            <a href="#" onclick="openTechnicianSheet(_lastModalSite);return false" style="color:#ffd740;font-size:10px;font-weight:700;text-decoration:none;padding:5px 14px;border:1px solid rgba(255,215,64,0.3);border-radius:4px;background:rgba(255,215,64,0.08)">📋 OPEN TECHNICIAN UPGRADE SHEET →</a>
        </div>
    `;
    siteModal.style.display = 'flex';
}

// ── Technician Upgrade Sheet ────────────────────────
function openTechnicianSheet(site) {
    const title = document.getElementById('siteModalTitle');
    const body = document.getElementById('siteModalBody');
    const siteModal = document.getElementById('siteModal');
    if(!title || !body || !siteModal) return;
    // Hide tooltip
    const tt = document.getElementById('mapTooltip'); if(tt) tt.style.display = 'none';

    title.textContent = `📋 TECHNICIAN UPGRADE SHEET — ${site.id}`;
    const statusColor = site.status==='active'?'#00e676':site.status==='degraded'?'#ffab00':'#ff1744';
    const spec = SENSOR_SPECS[site.sensor] || SENSOR_SPECS['Generic Telescope'] || {};
    const upgrades = getUpgradePath(site);
    const progStack = getProgrammingStack(site);
    const seed = site.id.charCodeAt(0) + site.id.charCodeAt(site.id.length-1);

    // Access & clearance requirements by network
    const access = site.network === 'USSF-SSN' ? {
        clearance: 'SECRET/SCI', escort: 'Required — USSF Site Security', badge: 'CAC + Visitor Badge',
        safety: 'OSHA PPE, ESD wrist strap, hearing protection (radar sites)', restricted: 'RF hazard zones — 50m exclusion during transmit',
        hours: 'Coordinated with site OIC, 48h advance notice', poc: 'Site Operations Officer (OIC)'
    } : site.network === 'LeoLabs' ? {
        clearance: 'UNCLASSIFIED', escort: 'Not required — badge access', badge: 'LeoLabs Employee Badge',
        safety: 'Standard PPE, ESD wrist strap', restricted: 'Antenna array — maintain 20m during operations',
        hours: 'Business hours preferred, 24h notice', poc: 'Site Ops Lead'
    } : site.network === 'Slingshot' ? {
        clearance: 'UNCLASSIFIED / CUI', escort: 'Buddy system recommended', badge: 'Slingshot Contractor Badge',
        safety: 'Standard PPE, laptop w/ VPN token', restricted: 'None — commercial site',
        hours: 'Flexible, 24h notice preferred', poc: 'Slingshot Regional Ops Manager'
    } : {
        clearance: 'UNCLASSIFIED', escort: 'Site-dependent', badge: 'Visitor Badge',
        safety: 'Standard PPE, ESD wrist strap', restricted: 'Check local site rules',
        hours: '24h advance notice', poc: 'Network Operations Center'
    };

    // Generate upgrade task cards with part numbers and tools
    const taskCards = upgrades.map((u, i) => {
        const partNo = `SF-${site.type === 'radar' ? 'R' : 'O'}${(seed*7+i*31)%9000+1000}`;
        const tools = u.item.includes('GPU') ? 'Phillips #2, ESD mat, thermal paste, PCIe riser cable'
            : u.item.includes('Receiver') || u.item.includes('T/R') ? 'Torx T10/T15, RF torque wrench (5 in-lb), spectrum analyzer'
            : u.item.includes('CMOS') || u.item.includes('Detector') ? 'Hex 2.5mm, clean room gloves, optical collimation laser'
            : u.item.includes('firmware') || u.item.includes('Firmware') ? 'Laptop w/ JTAG programmer, USB-serial adapter'
            : u.item.includes('Starlink') || u.item.includes('uplink') ? 'Starlink kit, PoE injector, Cat6 outdoor cable, cable tester'
            : 'Standard toolkit, multimeter, laptop';
        const estHours = u.priority === 'HIGH' ? '4-6h' : u.priority === 'MEDIUM' ? '2-4h' : '1-2h';
        const pCol = u.priority==='HIGH'?'#ff1744':u.priority==='MEDIUM'?'#ffab00':'#76ff03';
        return `<div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);border-radius:6px;padding:10px;margin-bottom:8px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <div style="display:flex;align-items:center;gap:6px">
                    <span style="background:${pCol}22;color:${pCol};padding:2px 8px;border-radius:3px;font-size:9px;font-weight:700">${u.priority}</span>
                    <b style="color:#e8eaf6;font-size:11px">${u.item}</b>
                </div>
                <span style="color:#546e7a;font-size:9px">Est: ${estHours}</span>
            </div>
            <div style="font-size:9px;color:#90a4ae;margin-bottom:6px">${u.reason}</div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:4px;font-size:9px">
                <div>Part #: <b style="color:#00e5ff;font-family:JetBrains Mono,mono">${partNo}</b></div>
                <div>Cost: <b>${u.cost}</b> · ETA: <b>${u.eta}</b></div>
            </div>
            <div style="margin-top:6px;font-size:9px;color:#78909c">🔧 Tools: ${tools}</div>
        </div>`;
    }).join('');

    // Pre-visit checklist
    const checklist = [
        `Verify ${access.clearance} clearance is current`,
        `Obtain ${access.badge} from ${access.poc}`,
        `Review RF/safety restrictions: ${access.restricted}`,
        `Pack required PPE: ${access.safety}`,
        `Confirm upgrade parts shipped to site (check tracking)`,
        `Download latest firmware images to offline USB`,
        `Coordinate maintenance window with ${access.poc}`,
        `Backup current site configuration via ${progStack.cicd}`,
    ];

    // Post-upgrade validation steps
    const validation = site.type === 'radar' ? [
        'Run built-in calibration sequence (15 min)',
        'Verify noise floor < -110 dBm across all channels',
        'Confirm track accuracy on known calibration target (ISS pass)',
        'Validate data pipeline: edge → cloud latency < 200ms',
        'Run 1-hour autonomous detection cycle, confirm ≥95% of expected tracks',
    ] : [
        'Run flat-field and dark calibration (20 min)',
        'Verify focus using star FWHM < 2.5 arcsec',
        'Confirm autoguider lock on guide star within 30s',
        'Validate plate solve accuracy < 0.5 arcsec RMS',
        'Run 30-min streak detection test, confirm pipeline end-to-end',
    ];

    body.innerHTML = `
        <div style="background:rgba(255,215,64,0.06);border:1px solid rgba(255,215,64,0.15);border-radius:6px;padding:10px;margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                    <div style="font-size:14px;font-weight:700;color:#ffd740">⚠ FIELD SERVICE ORDER</div>
                    <div style="font-size:10px;color:#b0bec5;margin-top:2px">${site.name} · ${site.lat.toFixed(2)}°${site.lat>=0?'N':'S'}, ${Math.abs(site.lon).toFixed(2)}°${site.lon>=0?'E':'W'}</div>
                </div>
                <div style="text-align:right">
                    <div style="font-size:9px;color:#78909c">Site Status</div>
                    <div style="color:${statusColor};font-weight:700;font-size:12px">${site.status.toUpperCase()}</div>
                </div>
            </div>
        </div>

        <h3>🔐 Site Access Requirements</h3>
        <table>
            <tr><td style="color:#78909c;width:140px">Clearance</td><td><b style="color:#ffd740">${access.clearance}</b></td></tr>
            <tr><td style="color:#78909c">Escort</td><td>${access.escort}</td></tr>
            <tr><td style="color:#78909c">Badge</td><td>${access.badge}</td></tr>
            <tr><td style="color:#78909c">Safety Gear</td><td>${access.safety}</td></tr>
            <tr><td style="color:#78909c">Restrictions</td><td style="color:#ffab00">${access.restricted}</td></tr>
            <tr><td style="color:#78909c">Scheduling</td><td>${access.hours}</td></tr>
            <tr><td style="color:#78909c">Site POC</td><td><b>${access.poc}</b></td></tr>
        </table>

        <h3>✅ Pre-Visit Checklist</h3>
        <div style="display:flex;flex-direction:column;gap:4px">
            ${checklist.map((item, i) => `<label style="display:flex;align-items:flex-start;gap:6px;font-size:10px;color:#b0bec5;cursor:pointer">
                <input type="checkbox" style="margin-top:2px;accent-color:#ffd740"> ${item}
            </label>`).join('')}
        </div>

        <h3>🔧 Upgrade Tasks (${upgrades.length} items)</h3>
        ${taskCards || '<div style="color:#546e7a;font-size:10px;padding:8px">No upgrades recommended — site is current.</div>'}

        <h3>📊 Post-Upgrade Validation</h3>
        <div style="display:flex;flex-direction:column;gap:3px">
            ${validation.map((step, i) => `<div style="font-size:10px;color:#b0bec5;display:flex;gap:6px">
                <span style="color:#546e7a;min-width:16px">${i+1}.</span> ${step}
            </div>`).join('')}
        </div>

        <h3>⏱ Estimated Downtime</h3>
        <table>
            <tr><td style="color:#78909c;width:180px">Total Maintenance Window</td><td><b style="color:#ffab00">${upgrades.length > 2 ? '8-12 hours' : upgrades.length > 0 ? '4-6 hours' : '0 hours'}</b></td></tr>
            <tr><td style="color:#78909c">Site Offline Period</td><td>${upgrades.some(u=>u.priority==='HIGH') ? '2-4 hours (sensor swap)' : '< 1 hour (hot-swap capable)'}</td></tr>
            <tr><td style="color:#78909c">Preferred Window</td><td>${site.type === 'optical' ? 'Daytime (non-observing hours)' : 'Low-traffic period (02:00-06:00 local)'}</td></tr>
            <tr><td style="color:#78909c">Rollback Plan</td><td>Restore from pre-upgrade config backup</td></tr>
        </table>

        <h3>✍ Technician Sign-Off</h3>
        <div style="background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:12px;display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:10px">
            <div><span style="color:#78909c">Technician:</span> <input type="text" placeholder="Name" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#e8eaf6;padding:3px 6px;border-radius:3px;font-size:10px;width:120px"></div>
            <div><span style="color:#78909c">Date:</span> <input type="text" value="${new Date().toISOString().slice(0,10)}" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#e8eaf6;padding:3px 6px;border-radius:3px;font-size:10px;width:100px"></div>
            <div><span style="color:#78909c">Badge #:</span> <input type="text" placeholder="ID" style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#e8eaf6;padding:3px 6px;border-radius:3px;font-size:10px;width:80px"></div>
            <div><span style="color:#78909c">Status:</span> <select style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.1);color:#e8eaf6;padding:3px 6px;border-radius:3px;font-size:10px"><option>Pending</option><option>In Progress</option><option>Complete</option><option>Deferred</option></select></div>
        </div>
        <div style="margin-top:10px;display:flex;justify-content:space-between;align-items:center">
            <a href="#" onclick="openSiteModal(_lastModalSite);return false" style="color:#00e5ff;font-size:9px;text-decoration:underline">← Back to Site Tech Catalog</a>
            <a href="#" onclick="openProgrammerSheet(_lastModalSite);return false" style="color:#b388ff;font-size:9px;font-weight:700;text-decoration:none;padding:3px 10px;border:1px solid rgba(179,136,255,0.3);border-radius:4px;background:rgba(179,136,255,0.08)">🖥 PROGRAMMER INTEGRATION SHEET →</a>
        </div>
    `;
    _lastModalSite = site;
    siteModal.style.display = 'flex';
}

// ── Programmer Integration Sheet ────────────────────
function openProgrammerSheet(site) {
    const title = document.getElementById('siteModalTitle');
    const body = document.getElementById('siteModalBody');
    const siteModal = document.getElementById('siteModal');
    if(!title || !body || !siteModal) return;

    title.textContent = `🖥 PROGRAMMER INTEGRATION SHEET — ${site.id}`;
    const progStack = getProgrammingStack(site);
    const upgrades = getUpgradePath(site);
    const seed = site.id.charCodeAt(0) + site.id.charCodeAt(site.id.length-1);

    // Role matrix — what the programmer does vs what the tech does
    const roleMatrix = [
        { phase: 'Pre-Deployment', programmer: 'Build & test firmware/config images in CI/CD pipeline', technician: 'Verify parts inventory, stage equipment at site' },
        { phase: 'Maintenance Window', programmer: 'Open remote SSH/VPN tunnel, monitor edge telemetry dashboard', technician: 'Power down subsystems, swap hardware per upgrade tasks' },
        { phase: 'Firmware Flash', programmer: 'Push OTA image or guide JTAG flash sequence via comms', technician: 'Connect programmer cable, confirm flash progress LEDs' },
        { phase: 'Config Deploy', programmer: 'Deploy site-specific config (sensor params, network, scheduler)', technician: 'Verify physical connections, antenna alignment, cable routing' },
        { phase: 'Pipeline Validation', programmer: 'Run end-to-end detection pipeline test, verify data flow to cloud', technician: 'Confirm sensor power/thermal readings, mechanical clearances' },
        { phase: 'Handoff', programmer: 'Clear maintenance flag, re-enable autonomous scheduling', technician: 'Sign off field service order, secure enclosure, depart' },
    ];

    // Software deployment workflow
    const deploySteps = [
        { step: 'Branch & Build', detail: `Create release branch in ${progStack.cicd}. Run full test suite against site-specific config.`, icon: '🔀' },
        { step: 'Image Generation', detail: `Build Docker container (edge runtime) or firmware binary. Tag with site ID + version.`, icon: '📦' },
        { step: 'Staging Test', detail: `Deploy to staging replica. Run synthetic detection pipeline with known calibration targets.`, icon: '🧪' },
        { step: 'Pre-flight Check', detail: `Verify edge node reachability via ${progStack.observability}. Confirm disk space, GPU health, network connectivity.`, icon: '✅' },
        { step: 'Coordinated Deploy', detail: `Schedule deploy during technician maintenance window. Push via ${progStack.cicd} or manual SCP.`, icon: '🚀' },
        { step: 'Smoke Test', detail: `Trigger calibration sequence. Verify first-light detection. Confirm cloud-side data ingestion within 60s.`, icon: '🔍' },
        { step: 'Rollback Gate', detail: `Monitor for 1 hour. If anomaly rate > threshold, execute automated rollback to previous config snapshot.`, icon: '🔄' },
    ];

    // Slingshot-aligned job responsibilities
    const slingshotAlign = [
        { duty: 'Edge Software Architecture', desc: 'Design and maintain the C++/Python detection pipeline running on edge GPU nodes at each ground station', relevance: 'HIGH' },
        { duty: 'Sensor Integration', desc: 'Write drivers and data adapters for optical/radar sensors, handling TDM/OEM message formats per CCSDS standards', relevance: 'HIGH' },
        { duty: 'Autonomous Scheduling', desc: `Configure and tune the ${progStack.scheduler} to optimize sensor tasking based on conjunction priority and weather`, relevance: 'HIGH' },
        { duty: 'Observability & Alerting', desc: `Maintain ${progStack.observability} dashboards. Define alert thresholds for GPU temp, disk, detection rate, uplink health`, relevance: 'MEDIUM' },
        { duty: 'CI/CD & OTA Updates', desc: `Manage ${progStack.cicd} pipelines. Build, test, and ship edge firmware updates to ${STATE.sites.length}+ sites globally`, relevance: 'HIGH' },
        { duty: 'ML Model Deployment', desc: `Package trained ${progStack.ml} models for edge inference. Optimize with TensorRT/ONNX for real-time streak detection`, relevance: 'HIGH' },
        { duty: 'Field Technician Support', desc: 'Provide real-time guidance during hardware upgrades via secure comms. Debug sensor integration issues remotely', relevance: 'MEDIUM' },
        { duty: 'Data Pipeline Ops', desc: 'Ensure edge-to-cloud data flow: raw frames → detections → orbit determination → catalog correlation', relevance: 'HIGH' },
    ];

    // Communication protocol
    const commProtocol = [
        { channel: 'Primary', tool: 'Slack #site-ops', use: 'Real-time coordination during maintenance windows' },
        { channel: 'Backup', tool: 'Satellite phone (Iridium)', use: 'Remote sites with no cellular (e.g., Gamsberg, Cerro Pachón)' },
        { channel: 'Documentation', tool: 'Confluence + Jira', use: 'Service orders, runbooks, post-mortem reports' },
        { channel: 'Remote Access', tool: `SSH/WireGuard VPN`, use: 'Edge node CLI access for diagnostics and config push' },
        { channel: 'Monitoring', tool: progStack.observability, use: 'Live GPU/sensor/pipeline dashboards during upgrade' },
    ];

    body.innerHTML = `
        <div style="background:rgba(179,136,255,0.06);border:1px solid rgba(179,136,255,0.15);border-radius:6px;padding:10px;margin-bottom:12px">
            <div style="display:flex;justify-content:space-between;align-items:center">
                <div>
                    <div style="font-size:14px;font-weight:700;color:#b388ff">🖥 SOFTWARE ENGINEER ↔ FIELD TECHNICIAN</div>
                    <div style="font-size:10px;color:#b0bec5;margin-top:2px">${site.name} · ${site.network} Network · ${progStack.os}</div>
                </div>
                <div style="text-align:right">
                    <div style="font-size:9px;color:#78909c">Runtime</div>
                    <div style="color:#76ff03;font-weight:700;font-size:10px;font-family:JetBrains Mono,mono">${progStack.runtime}</div>
                </div>
            </div>
        </div>

        <h3>🔄 Role Matrix — Who Does What</h3>
        <table>
            <tr><th style="width:120px">Phase</th><th style="color:#b388ff">🖥 Programmer (Remote)</th><th style="color:#ffd740">📋 Technician (On-Site)</th></tr>
            ${roleMatrix.map(r => `<tr>
                <td style="color:#78909c;font-weight:600;font-size:9px">${r.phase}</td>
                <td style="font-size:9px">${r.programmer}</td>
                <td style="font-size:9px">${r.technician}</td>
            </tr>`).join('')}
        </table>

        <h3>🚀 Software Deployment Workflow</h3>
        <div style="display:flex;flex-direction:column;gap:6px">
            ${deploySteps.map((s, i) => `<div style="display:flex;gap:8px;align-items:flex-start;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.04);border-radius:5px;padding:6px 8px">
                <span style="font-size:14px;min-width:20px">${s.icon}</span>
                <div>
                    <div style="font-size:10px;font-weight:700;color:#e8eaf6">${i+1}. ${s.step}</div>
                    <div style="font-size:9px;color:#90a4ae;margin-top:2px">${s.detail}</div>
                </div>
            </div>`).join('')}
        </div>

        <h3>🎯 Slingshot Aerospace — Role Alignment</h3>
        <table>
            <tr><th>Responsibility</th><th>Description</th><th>Relevance</th></tr>
            ${slingshotAlign.map(s => {
                const col = s.relevance === 'HIGH' ? '#76ff03' : '#ffd740';
                return `<tr>
                    <td style="color:#e8eaf6;font-weight:600;font-size:9px;white-space:nowrap">${s.duty}</td>
                    <td style="font-size:9px;color:#b0bec5">${s.desc}</td>
                    <td><span style="color:${col};font-size:8px;font-weight:700">${s.relevance}</span></td>
                </tr>`;
            }).join('')}
        </table>

        <h3>📡 Communication Protocol</h3>
        <table>
            <tr><th>Channel</th><th>Tool</th><th>Use Case</th></tr>
            ${commProtocol.map(c => `<tr>
                <td style="color:#78909c;font-size:9px">${c.channel}</td>
                <td style="color:#e8eaf6;font-size:9px;font-family:JetBrains Mono,mono">${c.tool}</td>
                <td style="font-size:9px;color:#b0bec5">${c.use}</td>
            </tr>`).join('')}
        </table>

        <h3>💻 Site Software Stack</h3>
        <table>
            <tr><td style="color:#78909c;width:140px">Operating System</td><td style="font-family:JetBrains Mono,mono;font-size:10px">${progStack.os}</td></tr>
            <tr><td style="color:#78909c">Runtime</td><td style="font-family:JetBrains Mono,mono;font-size:10px">${progStack.runtime}</td></tr>
            <tr><td style="color:#78909c">ML Framework</td><td style="font-family:JetBrains Mono,mono;font-size:10px">${progStack.ml}</td></tr>
            <tr><td style="color:#78909c">Scheduler</td><td style="font-family:JetBrains Mono,mono;font-size:10px">${progStack.scheduler}</td></tr>
            <tr><td style="color:#78909c">Observability</td><td style="font-family:JetBrains Mono,mono;font-size:10px">${progStack.observability}</td></tr>
            <tr><td style="color:#78909c">CI/CD</td><td style="font-family:JetBrains Mono,mono;font-size:10px">${progStack.cicd}</td></tr>
        </table>

        <h3>⚡ Remote Diagnostic Capabilities</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:9px">
            <div style="background:rgba(118,255,3,0.05);border:1px solid rgba(118,255,3,0.1);border-radius:4px;padding:6px">
                <div style="color:#76ff03;font-weight:700;margin-bottom:3px">✓ Can Do Remotely</div>
                <div style="color:#b0bec5;line-height:1.6">
                    • SSH into edge node<br>
                    • Deploy firmware/config OTA<br>
                    • Monitor GPU/CPU/disk/thermal<br>
                    • Run detection pipeline tests<br>
                    • View sensor telemetry stream<br>
                    • Restart services (systemd)<br>
                    • Pull diagnostic logs
                </div>
            </div>
            <div style="background:rgba(255,171,0,0.05);border:1px solid rgba(255,171,0,0.1);border-radius:4px;padding:6px">
                <div style="color:#ffab00;font-weight:700;margin-bottom:3px">✗ Requires On-Site Tech</div>
                <div style="color:#b0bec5;line-height:1.6">
                    • Swap GPU/SSD/NIC hardware<br>
                    • Replace sensor/detector/camera<br>
                    • Antenna alignment & cabling<br>
                    • Physical enclosure inspection<br>
                    • Power supply replacement<br>
                    • JTAG flash (if OTA fails)<br>
                    • Environmental seal verification
                </div>
            </div>
        </div>

        <h3>⚡ Site Resilience & Self-Healing</h3>
        ${(() => {
            const res = window.getSiteResilience ? getSiteResilience(site) : null;
            if (!res) return '<div style="color:#78909c;font-size:9px">Resilience engine loading...</div>';
            return `
            <div style="background:rgba(118,255,3,0.04);border:1px solid rgba(118,255,3,0.12);border-radius:6px;padding:8px;margin-bottom:8px">
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <div style="font-size:11px;font-weight:700;color:#76ff03">SITE UPTIME: ${res.uptimePct}%</div>
                    <div style="font-size:9px;color:#78909c">${res.autoRecoveries} auto-recoveries (90d) · 0 unplanned outages</div>
                </div>
                <div style="display:flex;gap:12px;margin-top:6px;font-size:9px;color:#b0bec5">
                    <span>Fleet MTTR: <b style="color:#76ff03">${res.fleetStats.mttr} min</b></span>
                    <span>Fleet MTBF: <b style="color:#76ff03">${res.fleetStats.mtbf} hrs</b></span>
                    <span>Fleet Uptime: <b style="color:#76ff03">${res.fleetStats.uptimePct}%</b></span>
                </div>
            </div>
            <table>
                <tr><th style="width:24px"></th><th>Subsystem</th><th>Trigger</th><th>Recovery</th><th>Status</th><th>90d Triggers</th></tr>
                ${res.subsystems.map(s => {
                    const statusColors = {armed:'#76ff03',active:'#76ff03',monitoring:'#00e5ff',closed:'#76ff03',scheduled:'#b0bec5',verified:'#76ff03',ready:'#b0bec5',watching:'#ffd740'};
                    return `<tr>
                        <td style="font-size:12px;text-align:center">${s.icon}</td>
                        <td style="font-size:9px;font-weight:600;color:#e8eaf6">${s.name}</td>
                        <td style="font-size:8px;color:#90a4ae">${s.triggerCondition}</td>
                        <td style="font-size:8px;color:#b0bec5;font-family:JetBrains Mono,mono">${s.recoveryTime}</td>
                        <td><span style="color:${statusColors[s.status]||'#78909c'};font-size:8px;font-weight:700;text-transform:uppercase">${s.status}</span></td>
                        <td style="font-size:9px;text-align:center;color:${s.triggerCount90d > 10 ? '#ffab00' : '#76ff03'}">${s.triggerCount90d}</td>
                    </tr>`;
                }).join('')}
            </table>

            <h3>🛡 Redundancy Architecture</h3>
            <table>
                <tr><th>Layer</th><th>Implementation</th><th>Metric</th></tr>
                ${res.redundancy.map(r => `<tr>
                    <td style="color:#e8eaf6;font-weight:600;font-size:9px;white-space:nowrap">${r.layer}</td>
                    <td style="font-size:9px;color:#b0bec5">${r.detail}</td>
                    <td style="font-size:8px;color:#76ff03;font-family:JetBrains Mono,mono">${r.metric}</td>
                </tr>`).join('')}
            </table>

            <h3>📊 Observability Stack</h3>
            <table>
                ${Object.entries(res.observability).map(([k,v]) => `<tr>
                    <td style="color:#78909c;width:100px;font-size:9px;text-transform:capitalize">${k}</td>
                    <td style="font-size:9px;color:#b0bec5;font-family:JetBrains Mono,mono">${v}</td>
                </tr>`).join('')}
            </table>
            `;
        })()}

        <div style="margin-top:14px;display:flex;justify-content:space-between;align-items:center">
            <a href="#" onclick="openTechnicianSheet(_lastModalSite);return false" style="color:#ffd740;font-size:9px;text-decoration:underline">← Back to Technician Sheet</a>
            <a href="#" onclick="openSiteModal(_lastModalSite);return false" style="color:#00e5ff;font-size:9px;text-decoration:underline">← Back to Site Tech Catalog</a>
        </div>
    `;
    _lastModalSite = site;
    siteModal.style.display = 'flex';
}

// ── Detection Inventory Generator ───────────────────
const DET_OBJECTS = [
    {norad:25544,name:'ISS (ZARYA)',orbit:'LEO',owner:'ISS Partners',rcs:'large'},
    {norad:48274,name:'STARLINK-2395',orbit:'LEO',owner:'SpaceX',rcs:'small'},
    {norad:43013,name:'USA-276 (NROL-47)',orbit:'LEO',owner:'NRO/USA',rcs:'medium'},
    {norad:25994,name:'TERRA',orbit:'LEO',owner:'NASA',rcs:'large'},
    {norad:27424,name:'XMM-NEWTON',orbit:'HEO',owner:'ESA',rcs:'large'},
    {norad:39084,name:'YAOGAN-17A',orbit:'LEO',owner:'PRC/PLA',rcs:'medium'},
    {norad:41335,name:'GAOFEN-4',orbit:'GEO',owner:'CNSA',rcs:'large'},
    {norad:43235,name:'COSMOS 2535',orbit:'LEO',owner:'Russia/VKS',rcs:'medium'},
    {norad:49445,name:'STARLINK-3271',orbit:'LEO',owner:'SpaceX',rcs:'small'},
    {norad:44238,name:'ONEWEB-0012',orbit:'LEO',owner:'OneWeb',rcs:'small'},
    {norad:28884,name:'USA-193 DEBRIS',orbit:'LEO',owner:'Debris',rcs:'tiny'},
    {norad:37348,name:'TIANGONG CZ-5B DEB',orbit:'LEO',owner:'Debris',rcs:'medium'},
    {norad:40258,name:'COSMOS 1408 DEB',orbit:'LEO',owner:'Debris',rcs:'tiny'},
    {norad:43602,name:'BEIDOU-3 M13',orbit:'MEO',owner:'PRC/BDS',rcs:'medium'},
    {norad:28868,name:'GALAXY 15',orbit:'GEO',owner:'Intelsat',rcs:'large'},
    {norad:44713,name:'STARLINK-1007',orbit:'LEO',owner:'SpaceX',rcs:'small'},
    {norad:26038,name:'FENGYUN 1C DEB',orbit:'LEO',owner:'Debris',rcs:'tiny'},
    {norad:43689,name:'LEMUR-2-ALEXANDER',orbit:'LEO',owner:'Spire',rcs:'tiny'},
    {norad:46114,name:'USA-310 (GSSAP-5)',orbit:'GEO',owner:'USSF',rcs:'small'},
    {norad:38755,name:'INTELSAT 22',orbit:'GEO',owner:'Intelsat',rcs:'large'},
    {norad:41862,name:'MUOS-5',orbit:'GEO',owner:'USN',rcs:'large'},
    {norad:28492,name:'ALOS (DAICHI)',orbit:'LEO',owner:'JAXA',rcs:'large'},
    {norad:99901,name:'UCT-2026-0471',orbit:'Unknown',owner:'UCT',rcs:'unknown'},
    {norad:99902,name:'UCT-2026-0472',orbit:'Unknown',owner:'UCT',rcs:'unknown'},
];
const DET_STATUS = ['CATALOGED','CATALOGED','CATALOGED','CATALOGED','TENTATIVE','CATALOGED','UCT','CATALOGED'];

function generateDetections(siteId, count, seed) {
    const dets = [];
    const now = Date.now();
    for(let i = 0; i < Math.min(count, 60); i++) {
        const hash = (seed*31 + i*17) % DET_OBJECTS.length;
        const obj = DET_OBJECTS[hash];
        const status = DET_STATUS[(seed+i)%DET_STATUS.length];
        const tOff = Math.floor(((seed*7+i*13)%1440)); // minutes ago
        const t = new Date(now - tOff*60000);
        const snr = (8 + ((seed+i*3)%25)).toFixed(1);
        const mag = obj.rcs==='large' ? (4+((seed+i)%4)).toFixed(1) : obj.rcs==='medium' ? (8+((seed+i)%5)).toFixed(1) : obj.rcs==='small' ? (12+((seed+i)%4)).toFixed(1) : (15+((seed+i)%3)).toFixed(1);
        const el = (15+((seed*3+i*7)%65)).toFixed(0);
        const az = ((seed*11+i*29)%360).toFixed(0);
        dets.push({...obj, status, time:t, snr, mag, el, az, passId:`${siteId}-P${String(i+1).padStart(3,'0')}`});
    }
    return dets.sort((a,b) => b.time - a.time);
}

function showDetections(siteId, count, seed) {
    const dets = generateDetections(siteId, count, seed);
    const body = document.getElementById('siteModalBody');
    const title = document.getElementById('siteModalTitle');
    title.textContent = `${siteId} — Detection Inventory (${count} objects, 24h)`;
    const cats = dets.filter(d=>d.status==='CATALOGED').length;
    const tent = dets.filter(d=>d.status==='TENTATIVE').length;
    const ucts = dets.filter(d=>d.status==='UCT').length;
    const debris = dets.filter(d=>d.owner==='Debris').length;
    body.innerHTML = `
        <div style="display:flex;gap:8px;margin-bottom:10px;flex-wrap:wrap">
            <div style="background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.15);border-radius:6px;padding:6px 14px;text-align:center">
                <div style="font-size:18px;font-weight:700;color:#00e676">${cats}</div><div style="font-size:8px;color:#78909c">Cataloged</div>
            </div>
            <div style="background:rgba(255,215,64,0.08);border:1px solid rgba(255,215,64,0.15);border-radius:6px;padding:6px 14px;text-align:center">
                <div style="font-size:18px;font-weight:700;color:#ffd740">${tent}</div><div style="font-size:8px;color:#78909c">Tentative</div>
            </div>
            <div style="background:rgba(255,23,68,0.08);border:1px solid rgba(255,23,68,0.15);border-radius:6px;padding:6px 14px;text-align:center">
                <div style="font-size:18px;font-weight:700;color:#ff1744">${ucts}</div><div style="font-size:8px;color:#78909c">UCT</div>
            </div>
            <div style="background:rgba(224,64,251,0.08);border:1px solid rgba(224,64,251,0.15);border-radius:6px;padding:6px 14px;text-align:center">
                <div style="font-size:18px;font-weight:700;color:#e040fb">${debris}</div><div style="font-size:8px;color:#78909c">Debris</div>
            </div>
            <div style="flex:1"></div>
            <div style="align-self:center;font-size:9px;color:#78909c">Showing top ${dets.length} of ${count} | <a href="#" onclick="openSiteModal(_lastModalSite);return false" style="color:#00e5ff">← Back to Site</a></div>
        </div>
        <table style="font-size:10px">
            <tr><th>Pass ID</th><th>NORAD</th><th>Object</th><th>Orbit</th><th>Owner</th><th>Time (UTC)</th><th>El°</th><th>Az°</th><th>Mag</th><th>SNR</th><th>Status</th></tr>
            ${dets.map(d => {
                const sc = d.status==='CATALOGED'?'#00e676':d.status==='TENTATIVE'?'#ffd740':'#ff1744';
                const oc = d.owner.includes('PRC')||d.owner.includes('Russia')?'#ff5252':d.owner.includes('USA')||d.owner==='USSF'||d.owner==='NRO/USA'||d.owner==='USN'?'#448aff':'#b0bec5';
                return `<tr>
                    <td style="font-family:JetBrains Mono,mono;color:#78909c">${d.passId}</td>
                    <td style="font-family:JetBrains Mono,mono">${d.norad}</td>
                    <td style="color:#e8eaf6;font-weight:600">${d.name}</td>
                    <td>${d.orbit}</td>
                    <td style="color:${oc}">${d.owner}</td>
                    <td style="font-family:JetBrains Mono,mono">${d.time.toISOString().slice(11,19)}</td>
                    <td>${d.el}°</td><td>${d.az}°</td>
                    <td>${d.mag}</td><td>${d.snr}</td>
                    <td><span style="color:${sc};font-weight:600">${d.status}</span></td>
                </tr>`;
            }).join('')}
        </table>`;
}
var _lastModalSite = null;

// ── Ops Tempo Detail Modals ─────────────────────────
const FUNNEL_DETAILS = [
    {title:'Close Approach Screening',desc:'18th SDS performs all-on-all conjunction screening of the full 46K+ catalog against itself using SP (Special Perturbations) propagation. Each object is propagated forward 7 days and checked against every other cataloged object. This produces ~1.5M close approach pairs per week that fall within a 5 km screening volume.',sources:'18th SDS (Vandenberg SFB), Space Fence (Kwajalein), GEODSS, Contributing Sensors'},
    {title:'CDM Generation (Pc > 1e-7)',desc:'Close approaches exceeding the minimum probability threshold generate a Conjunction Data Message (CDM) per CCSDS 508.0-B-1 standard. CDMs include state vectors, covariance matrices, TCA, miss distance, and probability of collision for both objects. Distributed via Space-Track.org to registered owner/operators.',sources:'Space-Track CDM distribution, CARA (NASA), ESA Space Debris Office'},
    {title:'YELLOW Screening Events',desc:'Events with Pc exceeding 1e-5 require analyst review and are added to the conjunction watch list. Sensor tasking priority is elevated to gather fresh observations for orbit refinement. Owner/operators receive automated CDM updates.',sources:'Conjunction watch list, Automated CDM push, Sensor tasking queue'},
    {title:'RED Events — Active Monitoring',desc:'Events with Pc > 1e-3 trigger the RED escalation protocol. Dedicated analysts monitor 24/7. Rapid orbit determination cycles (new obs every 2-4 hours). Owner/operator direct communication initiated. Maneuver planning begins if assets have propulsion capability.',sources:'24/7 watch floor, Direct O/O coordination, FDO maneuver planning tools'},
    {title:'EMERGENCY — Imminent Collision Risk',desc:'Pc > 1e-2 or miss < 0.5 km triggers EMERGENCY protocol. All hands on deck. Mission Director notified via FLASH message. Maneuver decision gate at TCA-6h. If national security asset: USSPACECOM commander briefed. Historical rate: ~18/week globally, most resolve as Pc drops with better observations.',sources:'FLASH notification chain, Mission Director, CSpOC, NASA CARA, Owner/Operator'},
    {title:'Executed Maneuvers',desc:'Only ~4 maneuvers per week are actually executed (excluding Starlink). Most events self-resolve as better observations refine the orbit estimate and Pc drops below thresholds. The decision to maneuver considers: fuel cost, mission impact, Pc trend, secondary debris risk, and whether the maneuver itself creates new conjunction risks.',sources:'Flight Dynamics teams, Propulsion budgets, Mission planning'},
];

function openFunnelDetail(idx) {
    const f = FUNNEL_DETAILS[idx];
    const title = document.getElementById('siteModalTitle');
    const body = document.getElementById('siteModalBody');
    title.textContent = `Screening Funnel — ${f.title}`;
    body.innerHTML = `
        <h3>📊 ${f.title}</h3>
        <div style="font-size:11px;color:#b0bec5;line-height:1.7;margin-bottom:12px">${f.desc}</div>
        <h3>📡 Data Sources</h3>
        <div style="font-size:11px;color:#e8eaf6">${f.sources}</div>
        <div style="margin-top:12px;padding:8px;background:rgba(100,160,255,0.06);border:1px solid rgba(100,160,255,0.12);border-radius:8px;font-size:10px;color:#78909c">
            <a href="#" onclick="renderInventory('opsTempo');document.getElementById('siteModal').style.display='none';return false" style="color:#00e5ff">← Back to Ops Tempo</a>
        </div>`;
    document.getElementById('siteModal').style.display = 'flex';
}

const OPERATOR_DETAILS = {
    'SpaceX (Starlink)': {fleet:'~6,200 active (V2 Mini), 12,000 approved',orbit:'LEO 550 km, 53°/70°/97.6° shells',propulsion:'Hall-effect krypton EP (Starlink V2), cold-gas (V1)',avoidance:'Fully autonomous AI-driven. Onboard GPS + TLE cross-check. ~25 maneuvers/week across constellation. No human in loop for routine avoidance. 18 SDS coordination for deconfliction.',fuel:'Krypton ion: ~5 year operational life with margin for disposal'},
    'ESA (Sentinel, Aeolus)': {fleet:'12+ active EO missions (Sentinel-1/2/3/5P/6, Aeolus-2, SWARM)',orbit:'LEO 693-814 km SSO',propulsion:'Hydrazine monoprop (most Sentinel), cold-gas (small sats)',avoidance:'Dedicated Collision Avoidance office at ESOC (Darmstadt). 48h decision cycle. Manual review of every RED event. ~1-2 maneuvers/week across fleet.',fuel:'Hydrazine: mission-dependent, typically 10-15% mass budget'},
    'NASA (ISS, HST, Terra)': {fleet:'ISS + HST + 25+ science missions (Terra, Aqua, Aura, PACE, etc.)',orbit:'LEO 408 km (ISS) to 705 km (Terra)',propulsion:'ISS: Russian Progress thrusters. HST: none (relies on avoidance only). Science fleet: hydrazine',avoidance:'CARA (Conjunction Assessment & Risk Analysis) at GSFC. Full committee review for ISS. ISS performs 2-3 avoidance maneuvers per year. Debris Avoidance Maneuver (DAM) criteria: Pc > 1e-5 within 72h.',fuel:'ISS reboosted by Progress/Cygnus. Science fleet: limited budgets'},
    'OneWeb': {fleet:'~634 active in LEO constellation',orbit:'LEO 1,200 km, 87.9° polar',propulsion:'Xenon ion thrusters',avoidance:'Semi-automated with ground team review. Coordinates with 18 SDS. ~3 maneuvers/week. Higher altitude = more debris exposure from historical events.',fuel:'Xenon ion: designed for 5+ year constellation life'},
    'ISRO': {fleet:'50+ active (Cartosat, RISAT, Oceansat, Chandrayaan relay, etc.)',orbit:'LEO to GEO',propulsion:'Bipropellant (NTO/MMH) for large sats, hydrazine for small',avoidance:'ISTRAC operations center (Bangalore). Manual decision process. Increased awareness post-2019 ASAT test debris exposure. ~0.5 maneuvers/week.',fuel:'Mission-dependent, typically conservative with reserves'},
    'Planet Labs': {fleet:'~200 Dove cubesats (SuperDove/Pelican)',orbit:'LEO 475-525 km, SSO',propulsion:'Most have no propulsion — passive drag disposal',avoidance:'Minimal active avoidance. LEO flock strategy: lose one, replace one. Orbital lifetime ~3-5 years with natural decay. ~1 propulsive maneuver/week across fleet for those with green propulsion.',fuel:'N/A for most — designed as disposable'},
    'DOD/NRO': {fleet:'Classified constellation size',orbit:'Classified (known LEO, MEO, GEO, HEO assets)',propulsion:'Classified (hydrazine, biprop, EP confirmed on some)',avoidance:'Classified decision process. Known to maneuver based on orbital element changes. Coordination with CSpOC. Some assets have autonomous avoidance capability.',fuel:'Classified'},
};

function openOperatorDetail(name) {
    const op = OPERATOR_DETAILS[name];
    if(!op) return;
    const title = document.getElementById('siteModalTitle');
    const body = document.getElementById('siteModalBody');
    title.textContent = `Operator Profile — ${name}`;
    body.innerHTML = `
        <h3>🛰️ Fleet</h3><div style="font-size:11px;color:#b0bec5;margin-bottom:8px">${op.fleet}</div>
        <h3>🌍 Orbit Regime</h3><div style="font-size:11px;color:#b0bec5;margin-bottom:8px">${op.orbit}</div>
        <h3>🔥 Propulsion</h3><div style="font-size:11px;color:#b0bec5;margin-bottom:8px">${op.propulsion}</div>
        <h3>🛡️ Collision Avoidance Process</h3><div style="font-size:11px;color:#b0bec5;line-height:1.7;margin-bottom:8px">${op.avoidance}</div>
        <h3>⛽ Fuel Budget</h3><div style="font-size:11px;color:#b0bec5;margin-bottom:8px">${op.fuel}</div>
        <div style="margin-top:12px;padding:8px;background:rgba(100,160,255,0.06);border:1px solid rgba(100,160,255,0.12);border-radius:8px;font-size:10px;color:#78909c">
            <a href="#" onclick="renderInventory('opsTempo');document.getElementById('siteModal').style.display='none';return false" style="color:#00e5ff">← Back to Ops Tempo</a>
        </div>`;
    document.getElementById('siteModal').style.display = 'flex';
}

// ── Inventory Tabs ──────────────────────────────────
function renderInventory(tab) {
    const el = document.getElementById('invContent');
    if(tab === 'overview') {
        const c = STATE.catalog;
        const rq = STATE.reacquisition;
        const rqCrit = rq.filter(r => r.priority==='CRITICAL').length;
        const rqHigh = rq.filter(r => r.priority==='HIGH').length;
        const rqLost = rq.filter(r => r.state==='LOST').length;
        const rqStale = rq.filter(r => r.state==='STALE').length;
        const rqInProg = rq.filter(r => r.taskingStatus.includes('PROGRESS')).length;
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
        </div>
        <!-- Reacquisition Queue -->
        <div style="margin-top:10px;border-top:1px solid rgba(255,255,255,0.05);padding-top:8px">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:0 4px;margin-bottom:6px">
                <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--status-critical)">
                    🔍 Priority Reacquisition Queue — ${rq.length} Objects
                </div>
                <div style="display:flex;gap:6px;font-size:9px">
                    <span style="color:#ff1744;font-weight:600">${rqCrit} CRITICAL</span>
                    <span style="color:#ff5252">${rqHigh} HIGH</span>
                    <span style="color:#ffab00">${rqLost} LOST</span>
                    <span style="color:#448aff">${rqStale} STALE</span>
                    <span style="color:#00e676">${rqInProg} IN PROGRESS</span>
                </div>
            </div>
            <table class="inv-table" style="font-size:9px">
                <thead><tr>
                    <th>NORAD</th><th>Object</th><th>Regime</th><th>State</th><th>Days</th><th>Priority</th><th>Reason</th><th>Tasking</th><th>Status</th>
                </tr></thead>
                <tbody>
                    ${rq.sort((a,b) => {
                        const pOrder = {CRITICAL:0,HIGH:1,MEDIUM:2,LOW:3};
                        return (pOrder[a.priority]||4) - (pOrder[b.priority]||4) || b.daysSince - a.daysSince;
                    }).map(r => {
                        const stateCol = r.state==='LOST'?'#ff1744':'#ffab00';
                        const stateIcon = r.state==='LOST'?'✗':'◐';
                        const priCol = r.priority==='CRITICAL'?'#ff1744':r.priority==='HIGH'?'#ff5252':r.priority==='MEDIUM'?'#ffab00':'#448aff';
                        const priBadge = r.priority==='CRITICAL'?'badge-red':r.priority==='HIGH'?'badge-red':r.priority==='MEDIUM'?'badge-yellow':'badge-blue';
                        const daysCol = r.daysSince > 14 ? '#ff1744' : r.daysSince > 7 ? '#ffab00' : '#b0bec5';
                        const ownerCol = r.owner.includes('PRC')||r.owner.includes('Russia')?'#ff5252':r.owner.includes('USA')||r.owner==='USSF'||r.owner==='USN'?'#448aff':r.owner==='UCT'?'#e040fb':'#b0bec5';
                        const taskCol = r.taskingStatus.includes('PROGRESS')?'#00e676':r.taskingStatus.includes('PRIORITY')?'#ffd740':r.taskingStatus.includes('BLOCKED')?'#ff1744':r.taskingStatus==='DEFERRED'?'#78909c':'#b0bec5';
                        return `<tr title="Owner: ${r.owner} | RCS: ${r.rcs} m² | Last: ${r.lastObs} | Window: ${r.custodyWindow}" style="cursor:pointer" onclick="openReacqDetail(${rq.indexOf(r)})">
                            <td style="font-family:JetBrains Mono,mono;color:#78909c">${r.norad}</td>
                            <td style="color:#e8eaf6;font-weight:600;max-width:120px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${r.name}</td>
                            <td style="color:${r.regime==='LEO'?'var(--color-leo)':r.regime==='GEO'?'var(--color-geo)':r.regime==='MEO'?'var(--color-meo)':'var(--color-heo)'}">${r.regime}</td>
                            <td><span style="color:${stateCol};font-weight:600">${stateIcon} ${r.state}</span></td>
                            <td style="font-family:JetBrains Mono,mono;color:${daysCol};font-weight:600">${r.daysSince}d</td>
                            <td><span class="badge ${priBadge}">${r.priority}</span></td>
                            <td style="max-width:160px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;color:#78909c;font-family:Inter,sans-serif" title="${r.reason}">${r.reason}</td>
                            <td style="font-size:8px;color:#b0bec5">${r.taskingSite}</td>
                            <td style="font-size:8px;color:${taskCol};font-weight:600">${r.taskingStatus}</td>
                        </tr>`;
                    }).join('')}
                </tbody>
            </table>
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
        STATE.conjunctions.map((c, idx) => {
            const badge = c.tier==='EMERGENCY'?'badge-red':c.tier==='RED'?'badge-red':c.tier==='YELLOW'?'badge-yellow':'badge-green';
            return `<tr style="cursor:pointer" onclick="if(typeof openConjunctionDetail==='function'){openConjunctionDetail(STATE.conjunctions[${idx}])}" onmouseover="this.style.background='rgba(124,77,255,0.08)'" onmouseout="this.style.background=''"><td style="color:var(--text-primary);font-weight:600">${c.id}</td><td>${c.priName}</td><td>${c.secName}</td><td>${c.tca.slice(5,16)}</td><td>${c.miss} km</td><td style="font-family:'JetBrains Mono';color:${c.tier==='EMERGENCY'?'#ff1744':c.tier==='RED'?'#ff5252':'#ffab00'}">${c.pc.toExponential(1)}</td><td><span class="badge ${badge}">${c.tier}</span></td></tr>`;
        }).join('') + `</tbody></table>
        <div style="font-size:9px;color:#546e7a;padding:4px 8px;margin-top:4px">💡 Click any row for full debris intelligence, response protocol, and notification roster</div>`;
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
    } else if(tab === 'diagnostics') {
        // ── Systems Diagnostic Panel ──────────────────
        const active = STATE.sites.filter(s => s.status==='active').length;
        const deg = STATE.sites.filter(s => s.status==='degraded').length;
        const off = STATE.sites.filter(s => s.status==='offline').length;
        const total = STATE.sites.length;
        const siteUpPct = Math.round(active/total*100);
        const edgeUpPct = Math.round((active+deg*0.7)/total*100);

        const subsystems = [
            {name:'Sensor Network',pct:siteUpPct,detail:`${active}/${total} sites active`,icon:'📡'},
            {name:'Edge GPU Fleet',pct:edgeUpPct,detail:`${total} Orin AGX nodes deployed`,icon:'🖥️'},
            {name:'Streak Detection Pipeline',pct:94,detail:'PINN J2-J6 v3.2.1 — 12.3 fps avg',icon:'⚡'},
            {name:'Orbit Determination',pct:98,detail:'Bayesian IOD v2.1 — 42ms latency',icon:'🛰️'},
            {name:'Kafka Telemetry Bus',pct:99,detail:`${STATE.telemetry.length} feeds, <5ms p99`,icon:'📊'},
            {name:'Catalog Correlator',pct:96,detail:'46K objects, 0.23% FPR',icon:'📋'},
            {name:'Conjunction Screening',pct:100,detail:`${STATE.conjunctions.length} active events monitored`,icon:'⚠️'},
            {name:'Starlink Uplinks',pct:87,detail:`${Math.round(total*0.85)} nodes connected`,icon:'📶'},
            {name:'Cloud PostGIS Ingest',pct:99,detail:'Ingest rate: 1,247 TDMs/min',icon:'☁️'},
            {name:'Covariance Engine',pct:97,detail:`NEES=${STATE.gauges.find(g=>g.key==='nees')?.value} (calibrated)`,icon:'📐'},
        ];

        el.innerHTML = `
            <div style="padding:4px 8px;font-size:11px;color:var(--text-secondary);margin-bottom:8px">
                <b style="color:var(--text-primary)">Systems Diagnostic</b> — Real-time health of installed technology
            </div>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:0 8px">
                <div style="background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.15);border-radius:6px;padding:8px;text-align:center">
                    <div style="font-size:20px;font-weight:700;color:#00e676">${siteUpPct}%</div>
                    <div style="font-size:9px;color:#78909c">Network Uptime</div>
                </div>
                <div style="background:rgba(0,229,255,0.08);border:1px solid rgba(0,229,255,0.15);border-radius:6px;padding:8px;text-align:center">
                    <div style="font-size:20px;font-weight:700;color:#00e5ff">${edgeUpPct}%</div>
                    <div style="font-size:9px;color:#78909c">Edge Fleet Health</div>
                </div>
            </div>
            <div style="padding:8px;margin-top:6px">
                ${subsystems.map(s => {
                    const col = s.pct >= 95 ? '#00e676' : s.pct >= 80 ? '#ffab00' : '#ff1744';
                    return `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px">
                        <span style="width:20px;text-align:center">${s.icon}</span>
                        <div style="flex:1">
                            <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:2px">
                                <span style="color:#e8eaf6">${s.name}</span>
                                <span style="color:${col};font-weight:600;font-family:JetBrains Mono,mono">${s.pct}%</span>
                            </div>
                            <div class="diag-bar"><div class="diag-fill" style="width:${s.pct}%;background:${col}"></div></div>
                            <div style="font-size:8px;color:#78909c;margin-top:1px">${s.detail}</div>
                        </div>
                    </div>`;
                }).join('')}
            </div>
            <div style="padding:4px 8px;font-size:10px;color:var(--text-secondary);border-top:1px solid rgba(255,255,255,0.05);margin-top:4px;padding-top:8px">
                <b style="color:var(--text-primary)">Recent Incidents</b><br>
                <div style="margin-top:4px">
                    <span style="color:#ffab00">⚠ 22:14 UTC</span> — NAM-01 Gamsberg seeing degraded to 1.8" (threshold: 1.5")<br>
                    <span style="color:#00e676">✓ 21:48 UTC</span> — AUS-03 Orin GPU temp normalized (was 82°C → now 61°C)<br>
                    <span style="color:#00e676">✓ 20:15 UTC</span> — Kafka consumer lag spike resolved (was 47 → now 1.89 msgs)<br>
                    <span style="color:#ff1744">✗ 19:30 UTC</span> — EUR-07 Starlink uplink packet loss 2.3% (investigating)<br>
                    <span style="color:#00e676">✓ 18:00 UTC</span> — Software deploy: streak_detect.cu v3.2.1 → 172 nodes (100% success)
                </div>
            </div>`;
    } else if(tab === 'opsTempo') {
        // ── Ops Tempo: Screening Funnel + Maneuver Stats ──
        const funnel = [
            {label:'Close Approaches Screened',count:'1,487,320',rate:'/week',color:'#78909c',pct:100},
            {label:'CDMs Generated (Pc > 1e-7)',count:'12,841',rate:'/week',color:'#448aff',pct:0.86},
            {label:'YELLOW Events (Pc > 1e-5)',count:'1,247',rate:'/week',color:'#ffd740',pct:0.084},
            {label:'RED Events (Pc > 1e-3)',count:'214',rate:'/week',color:'#ff5252',pct:0.014},
            {label:'EMERGENCY (Pc > 1e-2)',count:'18',rate:'/week',color:'#ff1744',pct:0.0012},
            {label:'Maneuvers Executed',count:'4.2',rate:'/week avg',color:'#00e676',pct:0.0003},
        ];
        const operators = [
            {name:'SpaceX (Starlink)',maneuvers:'~25/wk',method:'Autonomous AI',loop:'No human',note:'Hall-effect EP + cold-gas'},
            {name:'ESA (Sentinel, Aeolus)',maneuvers:'~1.5/wk',method:'Manual review',loop:'48h decision cycle',note:'Dedicated CA office'},
            {name:'NASA (ISS, HST, Terra)',maneuvers:'~0.3/wk',method:'CARA screening',loop:'Full committee review',note:'ISS: ~2-3 avoidance/yr'},
            {name:'OneWeb',maneuvers:'~3/wk',method:'Semi-auto',loop:'Ground team + algo',note:'Coordinated with 18 SDS'},
            {name:'ISRO',maneuvers:'~0.5/wk',method:'Manual',loop:'ISTRAC ops center',note:'Post-ASAT increased'},
            {name:'Planet Labs',maneuvers:'~1/wk',method:'Passive decay',loop:'Minimal — LEO flock',note:'Disposable sats'},
            {name:'DOD/NRO',maneuvers:'Classified',method:'Classified',loop:'Classified',note:'Known to maneuver'},
        ];
        el.innerHTML = `
            <div style="padding:4px 8px;font-size:11px;color:var(--text-secondary);margin-bottom:8px">
                <b style="color:var(--text-primary)">Operational Tempo</b> — Global conjunction screening funnel & maneuver rates
            </div>
            <div style="padding:0 8px">
                ${funnel.map((f,i) => {
                    const w = Math.max(4, Math.min(100, i===0?100:i===1?65:i===2?35:i===3?18:i===4?8:4));
                    return `<div style="margin-bottom:6px;cursor:pointer" onclick="openFunnelDetail(${i})">
                        <div style="display:flex;justify-content:space-between;font-size:10px;margin-bottom:2px">
                            <span style="color:#e8eaf6">${f.label}</span>
                            <span style="color:${f.color};font-weight:700;font-family:JetBrains Mono,mono">${f.count} <span style="color:#78909c;font-weight:400">${f.rate}</span></span>
                        </div>
                        <div style="height:16px;background:rgba(255,255,255,0.04);border-radius:4px;overflow:hidden;position:relative">
                            <div style="height:100%;width:${w}%;background:${f.color};border-radius:4px;opacity:0.7;transition:width 0.5s"></div>
                            ${i>0?`<span style="position:absolute;right:6px;top:1px;font-size:8px;color:#78909c">${f.pct}% of screened</span>`:''}
                        </div>
                    </div>`;
                }).join('')}
            </div>
            <h3 style="color:var(--text-primary);font-size:12px;margin:12px 8px 6px;border-bottom:1px solid rgba(100,160,255,0.08);padding-bottom:4px">🚀 Operator Maneuver Rates (Weekly Average)</h3>
            <table class="inv-table" style="font-size:10px">
                <thead><tr><th>Operator</th><th>Rate</th><th>Decision Method</th><th>Loop</th><th>Notes</th></tr></thead>
                <tbody>${operators.map(o => `<tr style="cursor:pointer" onclick="openOperatorDetail('${o.name}')">
                    <td style="color:var(--text-primary);font-weight:600">${o.name}</td>
                    <td style="font-family:JetBrains Mono,mono;color:#00e5ff">${o.maneuvers}</td>
                    <td>${o.method}</td>
                    <td style="font-size:9px;color:var(--text-secondary)">${o.loop}</td>
                    <td style="font-size:9px;color:var(--text-secondary)">${o.note}</td>
                </tr>`).join('')}</tbody>
            </table>
            <div style="padding:8px;margin-top:8px;border-top:1px solid rgba(255,255,255,0.05)">
                <div style="font-size:10px;color:var(--text-secondary);margin-bottom:4px"><b style="color:var(--text-primary)">Key Insight</b></div>
                <div style="font-size:10px;color:#b0bec5;line-height:1.6">
                    The funnel is <b style="color:#00e5ff">extreme</b>: ~1.5M screenings → ~12.8K CDMs → ~214 RED → <b style="color:#00e676">~4 actual burns/week</b> (excluding Starlink autonomous moves).
                    If counting Starlink, the global total is <b style="color:#ffd740">~30 maneuvers/week</b> across LEO. Better observations = fewer false alarms = fewer unnecessary maneuvers — this is why the <b style="color:#e040fb">sensor network</b> and <b style="color:#e040fb">rapid OD pipeline</b> matter.
                </div>
            </div>`;
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
function pushAlert(level, msg, meta) {
    const stack = document.getElementById('alertStack');
    const toast = document.createElement('div');
    toast.className = `alert-toast ${level}`;
    const icon = level==='critical' ? '🔴' : level==='warning' ? '🟡' : '🔵';
    toast.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
    toast.style.cursor = 'pointer';
    toast.title = 'Click for full alert detail & notification roster';
    toast.addEventListener('click', () => openAlertDetail(level, msg, meta || {}));
    stack.appendChild(toast);
    setTimeout(() => toast.remove(), 12000);
}

function openAlertDetail(level, msg, meta) {
    const tierMap = {critical:'EMERGENCY',warning:'RED',info:'INFO'};
    const tierName = meta.tier || tierMap[level] || 'YELLOW';
    const tier = STATE.escalation.tiers.find(t => t.level === tierName) || STATE.escalation.tiers[0];
    const title = document.getElementById('siteModalTitle');
    const body = document.getElementById('siteModalBody');
    title.innerHTML = `<span style="color:${tier.color}">⚠ ${tier.level} ALERT</span>`;
    const chans = STATE.escalation.channels;
    const procs = STATE.escalation.procedures;
    // Find matching procedure
    const matchProc = procs.find(p => {
        if(meta.type==='conjunction' && p.trigger.includes('conjunction')) return true;
        if(meta.type==='site' && p.trigger.includes('Site')) return true;
        if(meta.type==='uct' && p.trigger.includes('UCT')) return true;
        if(meta.type==='weather' && p.trigger.includes('weather')) return true;
        if(meta.type==='edge' && p.trigger.includes('Edge')) return true;
        return false;
    }) || procs[0];

    body.innerHTML = `
        <h3 style="color:${tier.color}">📋 Alert Detail</h3>
        <div style="background:rgba(${tier.color==='#ff1744'?'255,23,68':tier.color==='#ff5252'?'255,82,82':tier.color==='#ffab00'?'255,171,0':'68,138,255'},0.08);border:1px solid ${tier.color}30;border-radius:8px;padding:12px;margin-bottom:12px">
            <div style="font-size:12px;color:#e8eaf6;margin-bottom:6px">${msg}</div>
            ${meta.detail ? `<div style="font-size:10px;color:#b0bec5;margin-top:6px">${meta.detail}</div>` : ''}
        </div>
        <table>
            <tr><td style="color:#78909c;width:140px">Tier</td><td style="color:${tier.color};font-weight:700">${tier.level}</td></tr>
            <tr><td style="color:#78909c">Criteria</td><td>${tier.criteria}</td></tr>
            <tr><td style="color:#78909c">Required Response</td><td style="color:#e8eaf6;font-weight:600">${tier.responseTime}</td></tr>
            ${meta.tca ? `<tr><td style="color:#78909c">Time to TCA</td><td style="color:#ff5252;font-weight:700">${meta.tca}</td></tr>` : ''}
            ${meta.pc ? `<tr><td style="color:#78909c">Collision Prob (Pc)</td><td style="font-family:JetBrains Mono,mono;color:#ff1744">${meta.pc}</td></tr>` : ''}
            ${meta.miss ? `<tr><td style="color:#78909c">Miss Distance</td><td style="font-family:JetBrains Mono,mono;color:#ffab00">${meta.miss}</td></tr>` : ''}
            <tr><td style="color:#78909c">Timestamp</td><td style="font-family:JetBrains Mono,mono">${new Date().toISOString().slice(0,19)}Z</td></tr>
        </table>

        <h3>📞 Notification Roster — ${tier.notify.length} Recipients</h3>
        <table>
            <tr><th>Role</th><th>Name</th><th>Channel</th><th>Priority</th><th>Duty</th><th>Status</th></tr>
            ${tier.notify.map((n,i) => {
                const pCol = n.priority==='FLASH'?'#ff1744':n.priority==='IMMEDIATE'?'#ff5252':n.priority==='PRIORITY'?'#ffab00':'#448aff';
                const sent = i < tier.notify.length - 1 ? '✓ Sent' : '⏳ Queued';
                const sentCol = sent.includes('Sent') ? '#00e676' : '#ffd740';
                return `<tr>
                    <td style="color:#e8eaf6;font-weight:600">${n.role}</td>
                    <td>${n.name}</td>
                    <td style="font-size:10px">${n.channel}</td>
                    <td style="color:${pCol};font-weight:600">${n.priority}</td>
                    <td style="font-size:10px;color:#78909c">${n.duty}</td>
                    <td style="color:${sentCol};font-size:10px">${sent}</td>
                </tr>`;
            }).join('')}
        </table>

        <h3>📡 Communication Channels</h3>
        <table>
            <tr><th>Channel</th><th>Type</th><th>Endpoint</th><th>Protocol</th><th>Coverage</th></tr>
            ${chans.map(c => `<tr>
                <td style="color:#e8eaf6;font-weight:600">${c.name}</td>
                <td>${c.type}</td>
                <td style="font-size:10px;font-family:JetBrains Mono,mono;color:#76ff03">${c.endpoint}</td>
                <td>${c.protocol}</td>
                <td style="color:#78909c">${c.coverage}</td>
            </tr>`).join('')}
        </table>

        <h3>📖 Response Procedure</h3>
        <div style="background:rgba(100,160,255,0.06);border:1px solid rgba(100,160,255,0.12);border-radius:8px;padding:12px">
            <div style="color:#e8eaf6;font-weight:600;margin-bottom:6px">${matchProc.trigger}</div>
            <div style="font-size:11px;color:#b0bec5">${matchProc.steps.split(' → ').map((s,i) => `<div style="margin:4px 0;padding-left:8px;border-left:2px solid ${i===0?'#ff1744':i<3?'#ffab00':'#00e676'}">${s}</div>`).join('')}</div>
        </div>

        <h3>📊 All Escalation Tiers</h3>
        ${STATE.escalation.tiers.map(t => `
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;padding:6px 8px;border-radius:6px;background:${t.level===tier.level?'rgba(100,160,255,0.08)':'transparent'};border:1px solid ${t.level===tier.level?'rgba(100,160,255,0.15)':'transparent'}">
                <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${t.color}"></span>
                <span style="color:${t.color};font-weight:700;width:100px">${t.level}</span>
                <span style="flex:1;font-size:10px;color:#78909c">${t.criteria}</span>
                <span style="font-size:10px;color:#e8eaf6;font-weight:600">${t.responseTime}</span>
                <span style="font-size:10px;color:#78909c">${t.notify.length} contacts</span>
            </div>`).join('')}
    `;
    document.getElementById('siteModal').style.display = 'flex';
}

// ── Reacquisition Detail Modal ──────────────────────
function openReacqDetail(idx) {
    const r = STATE.reacquisition[idx];
    if(!r) return;
    const title = document.getElementById('siteModalTitle');
    const body = document.getElementById('siteModalBody');
    const stateCol = r.state==='LOST'?'#ff1744':'#ffab00';
    const priCol = r.priority==='CRITICAL'?'#ff1744':r.priority==='HIGH'?'#ff5252':r.priority==='MEDIUM'?'#ffab00':'#448aff';
    const ownerCol = r.owner.includes('PRC')||r.owner.includes('Russia')?'#ff5252':r.owner.includes('USA')||r.owner==='USSF'||r.owner==='USN'?'#448aff':r.owner==='UCT'?'#e040fb':'#b0bec5';
    const taskCol = r.taskingStatus.includes('PROGRESS')?'#00e676':r.taskingStatus.includes('PRIORITY')?'#ffd740':r.taskingStatus.includes('BLOCKED')?'#ff1744':r.taskingStatus==='DEFERRED'?'#78909c':'#b0bec5';

    // Simulate observation history (3-6 recent obs)
    const nObs = 3 + (r.norad % 4);
    const obsHistory = [];
    for(let i = 0; i < nObs; i++) {
        const daysAgo = r.daysSince + i * (2 + (r.norad % 3));
        const d = new Date(Date.now() - daysAgo * 86400000);
        const site = ['CHL-01','AUS-01','NAM-01','GEODSS','ExoAnalytic','LeoLabs','ISON','Space Fence'][r.norad % 8];
        const snr = (6 + ((r.norad+i*7)%20)).toFixed(1);
        const residual = (0.1 + ((r.norad+i*3)%15)*0.1).toFixed(2);
        obsHistory.push({date:d.toISOString().slice(0,16)+'Z', site, snr, residual, status: i===0?'Latest':'Historical'});
    }

    // Custody analysis
    const custodyPct = r.state==='LOST' ? 0 : Math.max(5, Math.round(100 - r.daysSince * 10));
    const custodyBar = custodyPct > 60 ? '#00e676' : custodyPct > 30 ? '#ffab00' : '#ff1744';
    const tleAge = r.daysSince;
    const crossTrackErr = (0.5 * tleAge * tleAge * 0.01).toFixed(1); // Approximate growth
    const inTrackErr = (2.0 * tleAge * tleAge * 0.1).toFixed(1);

    title.innerHTML = `<span style="color:${priCol}">🔍 ${r.priority}</span> — ${r.name} (NORAD ${r.norad})`;
    body.innerHTML = `
        <h3>📋 Object Identity</h3>
        <table>
            <tr><td style="color:#78909c;width:160px">NORAD ID</td><td style="font-family:JetBrains Mono,mono">${r.norad}</td></tr>
            <tr><td style="color:#78909c">Name</td><td style="color:#e8eaf6;font-weight:700">${r.name}</td></tr>
            <tr><td style="color:#78909c">Owner / Operator</td><td style="color:${ownerCol}">${r.owner}</td></tr>
            <tr><td style="color:#78909c">Type</td><td>${r.type}</td></tr>
            <tr><td style="color:#78909c">Orbit Regime</td><td style="color:${r.regime==='LEO'?'#00e5ff':r.regime==='GEO'?'#ffd740':r.regime==='MEO'?'#76ff03':'#ff9100'};font-weight:600">${r.regime}</td></tr>
            <tr><td style="color:#78909c">RCS</td><td style="font-family:JetBrains Mono,mono">${r.rcs} m²</td></tr>
            <tr><td style="color:#78909c">Catalog State</td><td><span style="color:${stateCol};font-weight:700">${r.state}</span> — ${r.daysSince} days since last observation</td></tr>
            <tr><td style="color:#78909c">Custody Window</td><td>${r.custodyWindow}</td></tr>
        </table>

        <h3 style="color:${priCol}">⚠ Reacquisition Reason</h3>
        <div style="background:${priCol}15;border:1px solid ${priCol}30;border-radius:8px;padding:12px;font-size:11px;color:#e8eaf6;line-height:1.6">${r.reason}</div>

        <h3>📐 Custody & Accuracy Degradation</h3>
        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:6px;margin-bottom:8px">
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:8px;text-align:center">
                <div style="font-size:20px;font-weight:700;color:${custodyBar}">${custodyPct}%</div>
                <div style="font-size:8px;color:#78909c">Custody Confidence</div>
                <div class="diag-bar" style="margin-top:4px"><div class="diag-fill" style="width:${custodyPct}%;background:${custodyBar}"></div></div>
            </div>
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:8px;text-align:center">
                <div style="font-size:20px;font-weight:700;color:#ff5252">${inTrackErr} km</div>
                <div style="font-size:8px;color:#78909c">In-Track Error (est.)</div>
            </div>
            <div style="background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:6px;padding:8px;text-align:center">
                <div style="font-size:20px;font-weight:700;color:#ffab00">${crossTrackErr} km</div>
                <div style="font-size:8px;color:#78909c">Cross-Track Error (est.)</div>
            </div>
        </div>
        <div style="font-size:10px;color:#78909c;padding:4px">
            TLE age: <b style="color:${r.daysSince>7?'#ff1744':'#ffab00'}">${tleAge} days</b> — 
            Position uncertainty grows as O(t²) without observations. ${r.daysSince > 14 ? '<span style="color:#ff1744;font-weight:600">SEARCH MODE REQUIRED — predicted position unreliable.</span>' : r.daysSince > 7 ? '<span style="color:#ffab00">Pointed reacquisition may need expanded search box.</span>' : 'Standard pointed reacquisition should succeed.'}
        </div>

        <h3>📡 Sensor Tasking</h3>
        <table>
            <tr><td style="color:#78909c;width:160px">Assigned Site</td><td style="color:#e8eaf6;font-weight:600">${r.taskingSite}</td></tr>
            <tr><td style="color:#78909c">Tasking Status</td><td style="color:${taskCol};font-weight:700">${r.taskingStatus}</td></tr>
            <tr><td style="color:#78909c">Last Observation</td><td style="font-family:JetBrains Mono,mono">${r.lastObs}</td></tr>
            <tr><td style="color:#78909c">Search Strategy</td><td>${r.daysSince > 14 ? 'Area search (±2° × ±10 min in-track)' : r.daysSince > 7 ? 'Expanded pointed (±0.5° × ±2 min)' : 'Standard pointed reacquisition'}</td></tr>
            <tr><td style="color:#78909c">Estimated Obs Window</td><td>${r.regime==='GEO' ? 'Any clear night (GEO belt visible)' : r.regime==='HEO' ? 'Next apogee pass (~12h intervals)' : 'Next overhead pass (~90 min intervals)'}</td></tr>
        </table>

        <h3>📊 Recent Observation History</h3>
        <table>
            <tr><th>Date (UTC)</th><th>Site</th><th>SNR</th><th>Residual (″)</th><th>Note</th></tr>
            ${obsHistory.map(o => `<tr>
                <td style="font-family:JetBrains Mono,mono">${o.date}</td>
                <td>${o.site}</td>
                <td>${o.snr}</td>
                <td>${o.residual}</td>
                <td style="color:${o.status==='Latest'?'#00e5ff':'#78909c'}">${o.status}</td>
            </tr>`).join('')}
        </table>

        <div style="margin-top:12px;padding:8px;background:rgba(100,160,255,0.06);border:1px solid rgba(100,160,255,0.12);border-radius:8px;font-size:10px;color:#78909c">
            <a href="#" onclick="renderInventory('overview');document.getElementById('siteModal').style.display='none';return false" style="color:#00e5ff">← Back to Reacquisition Queue</a>
        </div>
    `;
    document.getElementById('siteModal').style.display = 'flex';
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
    pushAlert('critical', '<b>EMERGENCY Conjunction:</b> NOAA-20 vs FENGYUN DEB — Pc=4.1e-2, miss=0.18 km, TCA in 27h', {
        tier:'EMERGENCY', type:'conjunction', pc:'4.1e-2', miss:'0.18 km', tca:'T-27h 14m',
        detail:'Primary: NOAA-20 (JPSS-1, NORAD 43013) — Sun-synchronous LEO, critical weather satellite. Secondary: FENGYUN 1C debris fragment (NORAD 29755) from 2007 ASAT test. Covariance source: 18 SDS special perturbations. Last OD update: 12 min ago. Maneuver decision gate: TCA - 6h.'
    });
}, 2000);
setTimeout(() => {
    pushAlert('warning', '<b>Site Degraded:</b> NAM-01 Gamsberg — Seeing 1.8", above threshold. Scheduling paused.', {
        tier:'YELLOW', type:'site',
        detail:'Site NAM-01 (Gamsberg, Namibia) seeing has exceeded the 1.5" operational threshold for 45 minutes. Atmospheric turbulence driven by elevated ground-layer winds (18 kt). Tasking queue frozen at 7 pending. Backup coverage redistributed to CHL-01 (Cerro Pachón) and AUS-01 (Siding Spring).'
    });
}, 4500);
setTimeout(() => {
    pushAlert('info', '<b>UCT Promoted:</b> UCT-0093 → TENTATIVE (5 passes, GEO belt, possible new GEO payload)', {
        tier:'INFO', type:'uct',
        detail:'Uncorrelated track UCT-0093 has been promoted to TENTATIVE after 5 consistent passes across 3 sites (ExoAnalytic network). Orbital elements suggest GEO belt insertion (a=42,164 km, e=0.0002, i=0.05°). Does not match any known launch manifest entry. Possible clandestine GEO deployment. Flagged for priority follow-up observation and cross-reference with NRO database.'
    });
}, 7000);

// ═══════════════════════════════════════════════════════════
// LIVE TELEMETRY SIMULATION ENGINE
// Realistically drifts gauges, command bar metrics, and
// space weather every 3 seconds to create operational feel.
// ═══════════════════════════════════════════════════════════

(function initLiveTelemetry() {
    // Smooth random walk with mean-reversion
    function drift(current, target, noise, min, max) {
        const pull = (target - current) * 0.08;
        const jitter = (Math.random() - 0.5) * noise;
        return Math.max(min, Math.min(max, current + pull + jitter));
    }

    // Gauge target values (oscillate around these)
    const gTargets = { detection:88, freshness:6.4, nees:3.0, throughput:12.4, conjActive:3, gpu:62, kafkaLag:4, densityErr:18 };

    setInterval(() => {
        // ── Drift gauge values ──
        STATE.gauges.forEach(g => {
            const t = gTargets[g.key] ?? g.value;
            g.value = parseFloat(drift(g.value, t, g.max*0.02, g.min, g.max).toFixed(g.unit==='%'||g.unit===''?1:1));
            if(g.key==='conjActive') g.value = Math.round(g.value);
            if(g.key==='kafkaLag') g.value = Math.max(0, Math.round(g.value));
        });
        renderGauges();

        // ── Drift command bar metrics ──
        const obs24 = document.getElementById('obs24h');
        if(obs24) {
            let v = parseInt(obs24.textContent.replace(/,/g,''));
            v = Math.round(drift(v, 11847, 40, 11000, 13000));
            obs24.textContent = v.toLocaleString();
        }
        const catEl = document.getElementById('catalogCount');
        if(catEl && !(window.CELESTRAK && window.CELESTRAK.fetched)) {
            let v = parseInt(catEl.textContent.replace(/,/g,''));
            v = Math.round(drift(v, 46238, 3, 46200, 46300));
            catEl.textContent = v.toLocaleString();
        }

        // ── Drift space weather ──
        const wNums = document.querySelectorAll('.cmd-weather-num');
        if(wNums.length >= 3) {
            STATE.weather.f107 = drift(STATE.weather.f107, 148, 3, 70, 300);
            STATE.weather.kp = drift(STATE.weather.kp, 2.5, 0.4, 0, 9);
            STATE.weather.dst = drift(STATE.weather.dst, -22, 5, -200, 50);
            wNums[0].textContent = STATE.weather.f107.toFixed(0);
            wNums[1].textContent = STATE.weather.kp.toFixed(2);
            wNums[2].textContent = STATE.weather.dst.toFixed(0);
            // Color Kp by storm level
            wNums[1].style.color = STATE.weather.kp >= 7 ? '#ff1744' : STATE.weather.kp >= 5 ? '#ffab00' : '#e8eaf6';
        }

        // ── Drift site GPU/detection values ──
        STATE.sites.forEach(s => {
            if(s.status !== 'offline') {
                s.gpu = Math.round(drift(s.gpu, 65, 5, 20, 99));
                s.detections_24h = Math.round(drift(s.detections_24h, s.detections_24h, 3, Math.max(10, s.detections_24h-50), s.detections_24h+50));
            }
        });

        // ── Pulse system health indicator ──
        const healthEl = document.getElementById('sysHealth');
        if(healthEl) {
            const deg = STATE.sites.filter(s => s.status==='degraded').length;
            const off = STATE.sites.filter(s => s.status==='offline').length;
            healthEl.style.background = off > 0 ? '#ff1744' : deg > 0 ? '#ffab00' : '#00e676';
            healthEl.style.boxShadow = `0 0 ${8 + Math.sin(Date.now()/500)*4}px ${off > 0 ? '#ff1744' : deg > 0 ? '#ffab00' : '#00e676'}`;
        }
    }, 3000);

    // ── Periodic dynamic alerts ──
    const dynamicAlerts = [
        { level:'info', msg:'<b>Catalog Update:</b> Space-Track bulk GP refresh — 4,218 TLEs ingested', meta:{tier:'INFO',type:'site'} },
        { level:'info', msg:'<b>Edge Deploy:</b> streak_detect.cu v3.2.2 hotfix pushed to 8 Pacific-rim nodes', meta:{tier:'INFO',type:'edge'} },
        { level:'warning', msg:'<b>Covariance Alert:</b> NEES exceeded 5.0 for STARLINK-3391 track — filter reset triggered', meta:{tier:'YELLOW',type:'conjunction',detail:'NEES=5.42 exceeded threshold of 5.0. Covariance inflated by 3x and filter re-initialized with last 6 observations. Root cause: maneuver detected but not yet incorporated.'} },
        { level:'info', msg:'<b>Thermospheric Update:</b> F10.7 spike to 155 sfu — density model corrected +8.2%', meta:{tier:'INFO',type:'weather'} },
        { level:'warning', msg:'<b>Edge Throughput:</b> AUS-01 dropped to 8.1 fps — cloud cover 62%', meta:{tier:'YELLOW',type:'edge',detail:'Siding Spring observatory experiencing intermittent cloud cover. All-sky camera confirms 62% coverage. Streak detection SNR degraded. Queue growing.'} },
        { level:'info', msg:'<b>PINN Inference:</b> Orbit refinement batch complete — 847 objects updated in 12.4s', meta:{tier:'INFO',type:'site'} },
        { level:'info', msg:'<b>Cislunar Track:</b> ARTEMIS-III relay satellite updated via DSN pass — Δa=0.02 km', meta:{tier:'INFO',type:'site'} },
        { level:'warning', msg:'<b>Kafka Lag:</b> Consumer group sf-fusion lag spiked to 127 msgs — auto-scaling triggered', meta:{tier:'YELLOW',type:'edge',detail:'Kafka consumer group sf-fusion experienced a transient lag spike. HPA auto-scaler provisioning 2 additional fusion pods. Expected recovery: 30s.'} },
    ];
    let alertIdx = 0;
    setInterval(() => {
        const a = dynamicAlerts[alertIdx % dynamicAlerts.length];
        pushAlert(a.level, a.msg, a.meta);
        alertIdx++;
    }, 25000);
})();

// ═══════════════════════════════════════════════════════════
// SOTA MODULE STATUS PANEL
// Shows all 18 SOTA 2026 science modules with live health
// indicators. Injected into the Diagnostics tab.
// ═══════════════════════════════════════════════════════════

const SOTA_MODULES = [
    { id:'A', name:'Light-Curve Fingerprinting', file:'light_curve_analyzer.py', tier:'Science', status:'running', latency:'18ms', desc:'Self-supervised Transformer encoder mapping photometric light curves to 128-dim embedding space' },
    { id:'B', name:'Optimal Transport Associator', file:'graph_associator.py', tier:'Science', status:'running', latency:'42ms', desc:'GNN cost matrix + Sinkhorn OT for multi-frame track association' },
    { id:'C', name:'Physics-Informed Neural OD', file:'pinn_orbit.py', tier:'Science', status:'running', latency:'6ms', desc:'PyTorch PINN embedding J2-J6 zonal harmonics in loss gradient' },
    { id:'D', name:'Non-Gaussian Pc Screener', file:'non_gaussian_pc.py', tier:'Science', status:'running', latency:'34ms', desc:'3rd-order skewness tensor via Differential Algebra moment propagation' },
    { id:'E', name:'Digital Space Twin', file:'twin_ws.py', tier:'Platform', status:'running', latency:'5ms', desc:'CesiumJS 3D globe + FastAPI WebSocket for live orbital viz' },
    { id:'F', name:'Data Assimilation Engine', file:'data_assimilation_engine.py', tier:'Science', status:'running', latency:'220ms', desc:'Continuous GPU simulation of full catalog with learned density scalar' },
    { id:'G', name:'Thermospheric Density Model', file:'thermospheric_model.py', tier:'Science', status:'running', latency:'8ms', desc:'Neural residual correction over NRLMSISE-00 with real-time solar wind' },
    { id:'H', name:'Bayesian IOD', file:'bayesian_iod.py', tier:'Science', status:'running', latency:'85ms', desc:'Admissible Region + MCMC sampling for single short-arc orbit distribution' },
    { id:'I', name:'SRP & A/M Estimator', file:'srp_estimator.py', tier:'Science', status:'running', latency:'12ms', desc:'Solar radiation pressure + joint area-to-mass estimation for GEO debris' },
    { id:'J', name:'Koopman Propagator', file:'koopman_propagator.py', tier:'Science', status:'running', latency:'0.8ms', desc:'Extended DMD lifting nonlinear dynamics to linear operator space' },
    { id:'K', name:'Cislunar Dynamics (CR3BP)', file:'cislunar_dynamics.py', tier:'Science', status:'running', latency:'45ms', desc:'Earth-Moon CR3BP with Lagrange points and invariant manifold generation' },
    { id:'L', name:'Fourier Neural Operator', file:'fourier_neural_operator.py', tier:'Science', status:'running', latency:'1.2ms', desc:'FNO learning solution operator in Fourier space for catalog-scale propagation' },
    { id:'M', name:'Multi-Spectral Characterizer', file:'spectral_characterizer.py', tier:'Science', status:'running', latency:'15ms', desc:'BVRI photometry + polarimetry mapping to aerospace material database' },
    { id:'N', name:'Radar Cross Section Fusion', file:'rcs_fusion.py', tier:'Science', status:'running', latency:'9ms', desc:'NASA SEM joint optical/radar estimation constraining albedo + physical size' },
    { id:'O', name:'Neuromorphic Event Stream', file:'event_stream.py', tier:'Data', status:'running', latency:'0.2ms', desc:'AER format parser with spatio-temporal voxel grid for microsecond resolution' },
    { id:'P', name:'Catalog Lifecycle FSM', file:'catalog_lifecycle.py', tier:'Ops', status:'running', latency:'2ms', desc:'UCT→Tentative→Cataloged→Stale→Lost→Decayed state machine with merge/split' },
    { id:'Q', name:'Conjunction Decision Support', file:'conjunction_decision.py', tier:'Ops', status:'running', latency:'55ms', desc:'GREEN/YELLOW/RED/EMERGENCY tiers + avoidance maneuver planning' },
    { id:'R', name:'Covariance Realism Testing', file:'covariance_realism.py', tier:'Ops', status:'running', latency:'28ms', desc:'NEES + CCR validation ensuring predicted covariances match observed errors' },
];

// Drift module latencies for liveness
setInterval(() => {
    SOTA_MODULES.forEach(m => {
        const base = parseFloat(m.latency);
        const jitter = base * 0.15 * (Math.random() - 0.5);
        m._currentLatency = Math.max(0.1, base + jitter).toFixed(base < 1 ? 2 : base < 10 ? 1 : 0);
        // Occasional degraded state
        m._status = Math.random() < 0.02 ? 'degraded' : 'running';
    });
}, 4000);

// Override the diagnostics tab to include SOTA panel
const _origRenderInventory = renderInventory;
renderInventory = function(tab) {
    if(tab === 'diagnostics') {
        _origRenderInventory(tab);
        const el = document.getElementById('invContent');
        // Append SOTA panel after existing diagnostics content
        const sotaHtml = `
            <div style="padding:4px 8px;margin-top:12px;border-top:1px solid rgba(255,255,255,0.05)">
                <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:var(--text-secondary);margin-bottom:6px">
                    🧬 SOTA 2026 Science Modules — ${SOTA_MODULES.length} Active
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:4px;margin-bottom:8px">
                    <div style="background:rgba(0,230,118,0.08);border:1px solid rgba(0,230,118,0.15);border-radius:6px;padding:6px;text-align:center">
                        <div style="font-size:16px;font-weight:700;color:#00e676">${SOTA_MODULES.filter(m=>m._status!=='degraded').length || SOTA_MODULES.length}</div>
                        <div style="font-size:8px;color:#78909c">Running</div>
                    </div>
                    <div style="background:rgba(255,171,0,0.08);border:1px solid rgba(255,171,0,0.15);border-radius:6px;padding:6px;text-align:center">
                        <div style="font-size:16px;font-weight:700;color:#ffab00">${SOTA_MODULES.filter(m=>m._status==='degraded').length || 0}</div>
                        <div style="font-size:8px;color:#78909c">Degraded</div>
                    </div>
                    <div style="background:rgba(124,77,255,0.08);border:1px solid rgba(124,77,255,0.15);border-radius:6px;padding:6px;text-align:center">
                        <div style="font-size:16px;font-weight:700;color:#7c4dff">${SOTA_MODULES.length}</div>
                        <div style="font-size:8px;color:#78909c">Total Modules</div>
                    </div>
                </div>
                <table class="inv-table" style="font-size:9px">
                    <thead><tr><th style="width:20px">#</th><th>Module</th><th>File</th><th>Tier</th><th>Latency</th><th>Status</th></tr></thead>
                    <tbody>
                        ${SOTA_MODULES.map(m => {
                            const lat = m._currentLatency || m.latency.replace('ms','');
                            const st = m._status || 'running';
                            const stCol = st==='running'?'#00e676':'#ffab00';
                            const stIcon = st==='running'?'●':'◐';
                            const tierCol = m.tier==='Science'?'#7c4dff':m.tier==='Ops'?'#00e5ff':m.tier==='Data'?'#76ff03':'#ffd740';
                            return `<tr title="${m.desc}">
                                <td style="color:#78909c;font-weight:600">${m.id}</td>
                                <td style="color:#e8eaf6;font-weight:600">${m.name}</td>
                                <td style="font-family:JetBrains Mono,mono;color:#76ff03;font-size:8px">${m.file}</td>
                                <td><span style="color:${tierCol};font-size:8px;font-weight:600">${m.tier}</span></td>
                                <td style="font-family:JetBrains Mono,mono;color:#00e5ff">${lat}ms</td>
                                <td><span style="color:${stCol}">${stIcon} ${st}</span></td>
                            </tr>`;
                        }).join('')}
                    </tbody>
                </table>
            </div>`;
        el.innerHTML += sotaHtml;
    } else {
        _origRenderInventory(tab);
    }
};

// ── Auto-refresh active Pc chart if visible ──
setInterval(() => {
    const activeTab = document.querySelector('.inv-tab.active');
    if(activeTab && activeTab.dataset.tab === 'pcTimeline') {
        // Slightly evolve Pc values for liveness
        Object.values(STATE.pcTimeline).forEach(evt => {
            const last = evt.series[evt.series.length - 1];
            last.pc *= (1 + (Math.random() - 0.48) * 0.04);
        });
        renderInventory('pcTimeline');
    }
}, 8000);
