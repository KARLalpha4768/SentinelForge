/**
 * SentinelForge — Centralized System State
 * @module sentinel_state
 * @description All simulated operational data: catalog, conjunctions,
 * sites, telemetry feeds, gauges, escalation tiers, launches, debris,
 * reentry predictions, ownership registry, and historical trends.
 * Loaded before sentinel_core.js — provides the global STATE object.
 * @author Karl David / Kham Enterprises LLC
 */

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
        { id:'SPACETRACK', name:'Space-Track.org', type:'external', protocol:'REST API (OMM/JSON)', freq:'Every 8h', latency:'12ms', throughput:'~46K OMM records/cycle', status:'active', desc:'18th SDS GP catalog (OMM/TLE), CDMs, decay/TIP messages, SATCAT, Boxscore, analyst objects' },
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
