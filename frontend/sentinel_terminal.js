// SentinelForge Antigravity IDE Terminal Emulator
(function(){
document.addEventListener('DOMContentLoaded', function(){
const termOutput = document.getElementById('termOutput');
const termInput = document.getElementById('termInput');
const termBody = document.getElementById('termBody');
const promptPathEl = document.getElementById('termPromptPath');
if(!termOutput||!termInput||!termBody){ console.error('Terminal: DOM elements not found'); return; }

const FS={
'~':{type:'dir',children:{'sentinelforge':{type:'dir',children:{
'README.md':{type:'file',size:'22KB'},
'main.py':{type:'file',size:'4KB',content:'#!/usr/bin/env python3\n"""SentinelForge — Autonomous Space Surveillance System\n20-agent architecture for orbital domain awareness.\n"""\nimport sys\nfrom output.builds.src.science import orbit_propagator\nfrom output.builds.src.science import conjunction_screener\n\ndef main():\n    print("SentinelForge v3.2.1 — 20 agents online")\n    print(f"Python {sys.version}")\n    return 0\n\nif __name__ == "__main__":\n    sys.exit(main())'},
'process_real_frame.py':{type:'file',size:'12KB',content:'#!/usr/bin/env python3\n"""Real astronomical frame processing pipeline.\nCalibration → Extraction → Streak Detection → Astrometry → Photometry\n"""\nimport numpy as np\n\nFITS_URL = "https://fits.gsfc.nasa.gov/samples/WFPC2u5780205r_c0fx.fits"\n\ndef calibrate(frame, bias=100, dark_rate=3.0):\n    """Subtract bias + dark current, divide by flat field."""\n    return (frame - bias - dark_rate) / np.ones_like(frame)\n\ndef extract_sources(frame, sigma=3.5):\n    """Sigma-clipped source detection."""\n    threshold = np.median(frame) + sigma * np.std(frame)\n    return np.argwhere(frame > threshold)'},
'requirements.txt':{type:'file',size:'180B',content:'numpy>=1.24\nscipy>=1.10\nmatplotlib>=3.7\nastropy>=5.3\nkafka-python>=2.0\nprotobuf>=4.0\npytest>=7.0\npytest-cov>=4.0'},
'.gitignore':{type:'file',size:'120B'},
'vercel.json':{type:'file',size:'85B'},
'frontend':{type:'dir',children:{
'sentinel_ops.html':{type:'file',size:'18KB'},
'sentinel_core.js':{type:'file',size:'253KB'},
'sentinel_celestrak.js':{type:'file',size:'8KB'},
'sentinel_slingshot_catalog.html':{type:'file',size:'12KB'},
'sentinel_slingshot_catalog.js':{type:'file',size:'26KB'},
'sentinel_slingshot_programmer.html':{type:'file',size:'47KB'},
'sentinel_slingshot_technician.html':{type:'file',size:'21KB'},
'sentinel_terminal.js':{type:'file',size:'14KB'},
'img':{type:'dir',children:{
'technician_schematic.png':{type:'file',size:'680KB'},
'programmer_schematic.png':{type:'file',size:'720KB'}
}}}},
'output':{type:'dir',children:{'builds':{type:'dir',children:{'src':{type:'dir',children:{
'science':{type:'dir',children:{
'orbit_propagator.py':{type:'file',size:'18KB',content:'"""Kepler solver + J2-J6 secular perturbation propagator.\nImplements Newton-Raphson Kepler equation solving and\nsecular perturbation hierarchy for LEO-GEO objects.\n"""\nimport numpy as np\nfrom scipy.optimize import brentq\n\nMU_EARTH = 3.986004418e14  # m^3/s^2\nJ2 = 1.08263e-3\nR_EARTH = 6378137.0  # m\n\ndef solve_kepler(M, e, tol=1e-12):\n    E = M\n    for _ in range(50):\n        dE = (E - e * np.sin(E) - M) / (1 - e * np.cos(E))\n        E -= dE\n        if abs(dE) < tol: break\n    return E'},
'conjunction_screener.py':{type:'file',size:'14KB',content:'"""Foster-Estes 2D collision probability computation.\nProjects covariance into B-plane and integrates Pc.\n"""\nimport numpy as np\n\ndef collision_probability(r1, v1, cov1, r2, v2, cov2, hbr=10.0):\n    """Compute Pc using Foster-Estes method."""\n    dr = r1 - r2\n    dv = v1 - v2\n    miss = np.linalg.norm(dr)\n    combined_cov = cov1 + cov2\n    # Project to B-plane\n    return min(1.0, np.exp(-miss**2 / (2 * np.trace(combined_cov[:2,:2]))))'},
'multi_sensor_fusion.py':{type:'file',size:'16KB'},
'light_curve_analyzer.py':{type:'file',size:'22KB'},
'graph_associator.py':{type:'file',size:'15KB'},
'bayesian_iod.py':{type:'file',size:'20KB'},
'koopman_propagator.py':{type:'file',size:'12KB'},
'cislunar_dynamics.py':{type:'file',size:'18KB'},
'data_assimilation_engine.py':{type:'file',size:'14KB'},
'pinn_orbit.py':{type:'file',size:'10KB'},
'coordinate_frames.py':{type:'file',size:'8KB'}
}},
'hardware':{type:'dir',children:{
'ascom_hal.py':{type:'file',size:'24KB',content:'"""ASCOM Hardware Abstraction Layer\nProduction-grade observatory control for PlaneWave L-500\nclass mounts with ZWO ASI6200MM Pro cameras.\n"""\nclass ObservatoryHAL:\n    def __init__(self, sim=True):\n        self.sim = sim\n        self.mount_connected = False\n        self.camera_connected = False\n\n    def connect(self):\n        self.mount_connected = True\n        self.camera_connected = True\n        return True\n\n    def slew(self, ra, dec):\n        """Slew to RA/Dec in hours/degrees."""'},
'streak_detect.cu':{type:'file',size:'8KB'},
'calibration.cu':{type:'file',size:'6KB'},
'plate_solver.cpp':{type:'file',size:'12KB'},
'photometry.cpp':{type:'file',size:'9KB'}
}},
'edge':{type:'dir',children:{
'kafka_transport.py':{type:'file',size:'11KB'},
'site_monitor.py':{type:'file',size:'7KB'},
'scheduler.py':{type:'file',size:'9KB'}
}}
}}}}}},
'tests':{type:'dir',children:{
'test_science_modules.py':{type:'file',size:'15KB'}
}},
'benchmarks':{type:'dir',children:{
'benchmark_science.py':{type:'file',size:'8KB'}
}},
'data':{type:'dir',children:{}}
}}}}  // sentinelforge.children, sentinelforge, ~.children, ~
};  // FS

let cwd='~/sentinelforge';
let history=[];
let histIdx=-1;

function resolve(path){
  let parts;
  if(path.startsWith('~')||path.startsWith('/')) parts=path.replace(/^\//,'~\/').split('/');
  else parts=(cwd+'/'+path).split('/');
  const resolved=[];
  for(const p of parts){if(p==='..'&&resolved.length>1)resolved.pop();else if(p&&p!=='.')resolved.push(p);}
  return resolved.join('/');
}

function getNode(path){
  const parts=path.split('/');
  let node=FS;
  for(const p of parts){
    if(!node||!node[p]) return null;
    node=node[p];
    if(node.type==='dir'&&node.children) node=node.children;
    else if(node.type==='dir') return node;
    else return node;
  }
  return node;
}

function getDirNode(path){
  const parts=path.split('/');
  let node=FS;
  for(const p of parts){
    if(!node[p]) return null;
    const n=node[p];
    if(n.type==='dir') node=n.children||{};
    else return null;
  }
  return node;
}

const out=termOutput;
const inp=termInput;
const body=termBody;
const promptPath=promptPathEl;

function addLine(text,cls='out'){
  const d=document.createElement('div');
  d.className='line '+cls;
  d.textContent=text;
  out.appendChild(d);
}
function addHTML(html,cls='out'){
  const d=document.createElement('div');
  d.className='line '+cls;
  d.innerHTML=html;
  out.appendChild(d);
}
function scroll(){body.scrollTop=body.scrollHeight;}

const CMDS={
help(){
  addLine('Antigravity IDE Terminal — SentinelForge v3.2.1','info');
  addLine('');
  addLine('  ls [path]           List directory contents','out');
  addLine('  cat <file>          Display file contents','out');
  addLine('  cd <dir>            Change directory','out');
  addLine('  pwd                 Print working directory','out');
  addLine('  tree [path]         Directory tree','out');
  addLine('  find <pattern>      Search for files','out');
  addLine('  wc <file>           Line/word/byte count','out');
  addLine('  head <file>         Show first 10 lines','out');
  addLine('  grep <pat> <file>   Search in file','out');
  addLine('  python <file>       Run Python script','out');
  addLine('  pytest              Run test suite','out');
  addLine('  git <cmd>           Git operations','out');
  addLine('  make [target]       Build pipeline','out');
  addLine('  nano <file>         Open file editor (simulated)','out');
  addLine('  ssh <host>          SSH to edge node','out');
  addLine('  slingshot-pipeline  Pipeline status','out');
  addLine('  jetson_health       GPU diagnostics','out');
  addLine('  clear               Clear terminal','out');
  addLine('  whoami / uname      System info','out');
},
ls(args){
  const target=args[0]?resolve(args[0]):cwd;
  const node=getDirNode(target);
  if(!node){addLine(`ls: cannot access '${args[0]}': No such file or directory`,'err');return;}
  const entries=Object.entries(node).sort((a,b)=>(a[1].type==='dir'?0:1)-(b[1].type==='dir'?0:1)||a[0].localeCompare(b[0]));
  for(const[name,info] of entries){
    if(info.type==='dir') addLine(`drwxr-xr-x  ${name}/`,'dir');
    else addLine(`-rw-r--r--  ${(info.size||'0B').padStart(6)}  ${name}`,'file');
  }
},
cd(args){
  if(!args[0]||args[0]==='~'){cwd='~/sentinelforge';promptPath.textContent='~/sentinelforge';return;}
  const target=resolve(args[0]);
  if(getDirNode(target)){cwd=target;promptPath.textContent=cwd;}
  else addLine(`cd: no such directory: ${args[0]}`,'err');
},
pwd(){addLine(cwd);},
cat(args){
  if(!args[0]){addLine('cat: missing operand','err');return;}
  const p=resolve(args[0]);
  const node=getNode(p);
  if(!node){addLine(`cat: ${args[0]}: No such file or directory`,'err');return;}
  if(node.type==='dir'){addLine(`cat: ${args[0]}: Is a directory`,'err');return;}
  if(node.content) node.content.split('\n').forEach(l=>addLine(l));
  else addLine(`[binary file — ${node.size}]`,'warn');
},
head(args){
  if(!args[0]){addLine('head: missing operand','err');return;}
  const p=resolve(args[0]);const node=getNode(p);
  if(!node||node.type==='dir'){addLine(`head: ${args[0]}: not found`,'err');return;}
  if(node.content) node.content.split('\n').slice(0,10).forEach(l=>addLine(l));
  else addLine(`[binary — ${node.size}]`,'warn');
},
wc(args){
  if(!args[0])return;const p=resolve(args[0]);const node=getNode(p);
  if(!node||!node.content){addLine(`wc: ${args[0]}: not available`,'err');return;}
  const lines=node.content.split('\n').length;
  const words=node.content.split(/\s+/).length;
  addLine(`  ${lines}  ${words}  ${node.size}  ${args[0]}`);
},
grep(args){
  if(args.length<2){addLine('Usage: grep <pattern> <file>','err');return;}
  const pat=args[0].toLowerCase();const p=resolve(args[1]);const node=getNode(p);
  if(!node||!node.content){addLine(`grep: ${args[1]}: not available`,'err');return;}
  let n=0;
  node.content.split('\n').forEach((l,i)=>{
    if(l.toLowerCase().includes(pat)){addLine(`${i+1}: ${l}`,'info');n++;}
  });
  if(!n) addLine('(no matches)','warn');
},
find(args){
  if(!args[0]){addLine('Usage: find <pattern>','err');return;}
  const pat=args[0].toLowerCase();
  function walk(node,path){
    for(const[name,info] of Object.entries(node)){
      const fp=path+'/'+name;
      if(name.toLowerCase().includes(pat)) addLine(fp,info.type==='dir'?'dir':'file');
      if(info.type==='dir'&&info.children) walk(info.children,fp);
    }
  }
  walk(getDirNode(cwd)||{},cwd);
},
tree(args){
  const target=args[0]?resolve(args[0]):cwd;
  const node=getDirNode(target);
  if(!node){addLine('tree: not found','err');return;}
  addLine(target.split('/').pop()+'/','dir');
  function walk(n,prefix){
    const entries=Object.entries(n);
    entries.forEach(([name,info],i)=>{
      const last=i===entries.length-1;
      const connector=last?'└── ':'├── ';
      addLine(prefix+connector+name+(info.type==='dir'?'/':''),info.type==='dir'?'dir':'file');
      if(info.type==='dir'&&info.children) walk(info.children,prefix+(last?'    ':'│   '));
    });
  }
  walk(node,'');
},
python(args){
  if(!args[0]){addLine('Python 3.13.2 (Jetson AGX Orin)','info');addLine('Type exit() to quit','out');return;}
  const p=resolve(args[0]);const node=getNode(p);
  if(!node){addLine(`python: can't open file '${args[0]}'`,'err');return;}
  addLine(`[Running ${args[0]}...]`,'info');
  if(args[0].includes('main.py')){
    addLine('SentinelForge v3.2.1 — 20 agents online','success');
    addLine('Python 3.13.2');
  } else if(args[0].includes('test_science')){
    CMDS.pytest([]);
  } else if(args[0].includes('process_real')){
    addLine('======================================================================','info');
    addLine('  SentinelForge — Real Frame Processing Pipeline','info');
    addLine('======================================================================','info');
    addLine('[FITS] Downloading real HST/WFPC2 frame from NASA GSFC...','out');
    addLine('[LOAD] Synthetic: 2048x2048, range=[53, 49972]','out');
    addLine('[CAL] Bias=100.0 Dark=3.0 Sky=-3.0 | 190.3ms','out');
    addLine('[SRC] 499 sources detected (σ>3.5) | 6257.9ms','success');
    addLine('[PHO] Calibrated 50 sources (ZP=25.0 mag) | 0.1ms','out');
    addLine('  ✓ Pipeline complete — 499 sources, 50 plate-solved','success');
  } else if(args[0].includes('benchmark')){
    addLine('Kepler Solver (1K):     23.4ms ± 1.8ms  ✅','success');
    addLine('J2 Perturbation (1K):    8.6ms ± 0.6ms  ✅','success');
    addLine('Covariance Prop (100):   1.8ms ± 0.1ms  ✅','success');
    addLine('EKF Update (500):       22.2ms ± 1.5ms  ✅','success');
    addLine('All 8 benchmarks PASSED (<100ms)','success');
  } else {
    addLine(`Executed ${args[0]} — OK`,'success');
  }
},
pytest(){
  addLine('============================= test session starts =============================','info');
  addLine('platform linux -- Python 3.13.2, pytest-7.4.0','out');
  addLine('collected 25 items','out');
  addLine('');
  const tests=['kepler_convergence','j2_hierarchy','orbital_energy','collision_bounds',
    'kalman_convergence','miss_distance','schedule_priority','visibility_window',
    'admissible_bounds','eccentricity_range','dmd_eigenvalues','lagrange_points',
    'jacobi_constant','wgs84_params','rotation_orthogonal','frame_calibration',
    'source_extraction','magnitude_ordering','pinn_loss','bayesian_posterior',
    'koopman_modes','graph_association','light_curve_fft','data_assimilation','fusion_consistency'];
  tests.forEach(t=>addLine(`  tests/test_science_modules.py::test_${t} PASSED`,'success'));
  addLine('');
  addLine('============================= 25 passed in 3.42s ==============================','success');
},
git(args){
  const sub=args[0]||'status';
  if(sub==='status'){
    addLine('On branch main','info');
    addLine('Your branch is up to date with \'origin/main\'.','out');
    addLine('nothing to commit, working tree clean','success');
  } else if(sub==='log'){
    addLine('d817a2f (HEAD -> main) feat: drill-downs for programmer page','info');
    addLine('3f620aa fix: standalone programmer page, fix nav links','out');
    addLine('8bd9b05 feat: observatory + data flow schematics','out');
    addLine('9a55e50 feat: tests, benchmarks, real frame processing, ASCOM HAL','out');
  } else if(sub==='branch'){
    addLine('* main','success');
    addLine('  dev/edge-pipeline','out');
    addLine('  feat/cislunar-dynamics','out');
  } else if(sub==='remote'){
    addLine('origin  https://github.com/KARLalpha4768/SentinelForge.git (fetch)','out');
    addLine('origin  https://github.com/KARLalpha4768/SentinelForge.git (push)','out');
  } else if(sub==='diff'){
    addLine('No changes detected.','warn');
  } else {
    addLine(`git ${sub}: executed`,'out');
  }
},
make(args){
  const target=args[0]||'all';
  addLine(`[CMAKE] Building target: ${target}`,'info');
  addLine('[  25%] Compiling streak_detect.cu → streak_detect.o (sm_87)','out');
  addLine('[  50%] Compiling calibration.cu → calibration.o (sm_87)','out');
  addLine('[  75%] Compiling plate_solver.cpp → plate_solver.o','out');
  addLine('[ 100%] Linking slingshot-pipeline','out');
  addLine('Build complete: slingshot-edge_3.2.1_arm64','success');
},
nano(args){
  if(!args[0]){addLine('Usage: nano <file>','err');return;}
  const p=resolve(args[0]);const node=getNode(p);
  if(!node){addLine(`Creating new file: ${args[0]}`,'warn');}
  else if(node.content){
    addLine(`  GNU nano 7.2 — ${args[0]}`,'info');
    addLine('─'.repeat(60),'out');
    node.content.split('\n').slice(0,15).forEach(l=>addLine(l));
    if(node.content.split('\n').length>15) addLine(`  ... (${node.content.split('\n').length-15} more lines)`,'warn');
    addLine('─'.repeat(60),'out');
    addLine('^X Exit  ^O Write  ^W Search  ^K Cut  ^G Help','warn');
  } else addLine(`[binary file — ${node.size}]`,'warn');
},
ssh(args){
  const host=args[0]||'co1';
  addLine(`Connecting to edge@${host}.slingshot.internal:2222...`,'info');
  addLine('Authenticated via SSH key (ed25519).','success');
  addLine(`Welcome to ${host.toUpperCase()} edge node — JetPack 6.0 / CUDA 12.2`,'info');
  addLine('Last login: '+new Date().toUTCString(),'out');
  addLine(`GPU: 42°C | Mem: 18.2/64.0 GB | Pipeline: RUNNING`,'success');
},
'slingshot-pipeline'(){
  addLine('● slingshot-pipeline.service - SentinelForge Edge Pipeline','success');
  addLine('     Loaded: loaded (/etc/systemd/system/slingshot-pipeline.service)','out');
  addLine('     Active: active (running) since '+new Date().toUTCString(),'success');
  addLine('   Main PID: 4287 (slingshot-pipe)','out');
  addLine('      Tasks: 12 (limit: 32768)','out');
  addLine('     Memory: 2.4G','out');
  addLine('        GPU: streak_detect.cu [RUNNING] 67% util','info');
  addLine('      Queue: 3 pending observations','out');
  addLine('  Last Det.: 2.3s ago | SNR=14.2 | mag=12.7','info');
},
jetson_health(){
  addLine('╔══════════════════════════════════════════════╗','info');
  addLine('║  NVIDIA Jetson AGX Orin 64GB — Diagnostics  ║','info');
  addLine('╚══════════════════════════════════════════════╝','info');
  addLine(`  GPU Temp:      42°C (limit: 97°C)`,'success');
  addLine(`  GPU Util:      67%`,'out');
  addLine(`  GPU Freq:      1.3 GHz`,'out');
  addLine(`  CUDA Cores:    2048 active`,'out');
  addLine(`  Memory:        18.2 / 64.0 GB (28%)`,'out');
  addLine(`  Power:         38W / 60W budget`,'out');
  addLine(`  NVMe Health:   98% (Samsung 990 Pro)`,'success');
  addLine(`  Uptime:        14d 6h 23m`,'out');
  addLine(`  JetPack:       6.0 | CUDA 12.2 | TRT 8.6.1`,'info');
},
clear(){out.innerHTML='';},
whoami(){addLine('edge (uid=1000) — Slingshot Ground Segment Operations','info');},
uname(args){
  if(args[0]==='-a') addLine('Linux sentinelforge-co1 5.15.136-tegra #1 SMP PREEMPT aarch64 GNU/Linux','out');
  else addLine('Linux','out');
},
echo(args){addLine(args.join(' '));},
date(){addLine(new Date().toUTCString(),'info');},
uptime(){addLine(' '+new Date().toTimeString().split(' ')[0]+' up 14 days, 6:23, 1 user, load average: 0.42, 0.38, 0.35');},
df(){
  addLine('Filesystem      Size  Used  Avail Use% Mounted','out');
  addLine('/dev/nvme0n1p1   1.8T  420G  1.3T  24% /','out');
  addLine('/dev/nvme1n1     1.8T  890G  860G  51% /opt/slingshot/data','out');
},
};

// ── Natural Language Processing Layer ──
function nlp(input){
  const s=input.toLowerCase().trim();
  // Direct command passthrough — if first word is a known command, skip NLP
  const first=s.split(/\s+/)[0];
  if(CMDS[first]||first==='exit') return null;

  // File extraction helper
  const fileMatch=input.match(/[\w\-\/]+\.(?:py|cu|cpp|html|js|txt|json|yaml|md)/i);
  const fileName=fileMatch?fileMatch[0]:null;

  // ── Intent patterns (ordered by specificity) ──

  // Show/view/open/read/display file
  if(/(?:show|view|open|read|display|print|what(?:'s| is| does)? (?:in|inside))\b/.test(s)&&fileName)
    return {cmd:'cat',args:[fileName],narr:`Reading ${fileName}...`};
  if(/(?:show|view|open|read|display|what(?:'s| is))\s+(?:the\s+)?(?:source|code|contents?)\s+(?:of|for|in)\b/.test(s)&&fileName)
    return {cmd:'cat',args:[fileName],narr:`Opening ${fileName}...`};

  // Edit/modify/change file
  if(/(?:edit|modify|change|update|fix|write|open.*editor)\b/.test(s)&&fileName)
    return {cmd:'nano',args:[fileName],narr:`Opening ${fileName} in editor...`};
  if(/(?:edit|modify|change|update)\s+(?:the\s+)?(?:code|file|source)/i.test(s)&&fileName)
    return {cmd:'nano',args:[fileName],narr:`Opening ${fileName} for editing...`};

  // Run/execute scripts
  if(/(?:run|execute|start|launch)\s+(?:the\s+)?(?:test|tests|test suite|unit tests)/i.test(s))
    return {cmd:'pytest',args:[],narr:'Running test suite...'};
  if(/(?:run|execute|start|launch)\s+(?:the\s+)?(?:benchmark|benchmarks|perf)/i.test(s))
    return {cmd:'python',args:['benchmarks/benchmark_science.py'],narr:'Running benchmarks...'};
  if(/(?:run|execute|start|launch)\s+(?:the\s+)?pipeline/i.test(s))
    return {cmd:'python',args:['process_real_frame.py'],narr:'Running frame processing pipeline...'};
  if(/(?:run|execute|start|launch)\s+(?:the\s+)?(?:main|app|program|system)/i.test(s))
    return {cmd:'python',args:['main.py'],narr:'Running main.py...'};
  if(/(?:run|execute|start|launch)\b/.test(s)&&fileName)
    return {cmd:'python',args:[fileName],narr:`Running ${fileName}...`};

  // List/show files and directories
  if(/(?:list|show|what(?:'s| are))\s+(?:the\s+)?(?:files|contents?|directory|dir|folder|what(?:'s)? (?:here|in here))/i.test(s))
    return {cmd:'ls',args:[],narr:'Listing directory...'};
  if(/(?:show|list|what(?:'s| are))\s+(?:the\s+)?(?:project|file)?\s*(?:structure|tree|layout|hierarchy)/i.test(s))
    return {cmd:'tree',args:[],narr:'Showing project structure...'};
  if(/(?:where am i|current dir|pwd|what dir|which dir|what folder)/i.test(s))
    return {cmd:'pwd',args:[],narr:null};

  // Navigation
  if(/(?:go|navigate|move|switch|cd)\s+(?:to|into)\s+(.+)/i.test(s)){
    const m=s.match(/(?:go|navigate|move|switch|cd)\s+(?:to|into)\s+(.+)/i);
    return {cmd:'cd',args:[m[1].trim()],narr:`Navigating to ${m[1].trim()}...`};
  }
  if(/(?:go\s+)?(?:back|up|parent)/i.test(s))
    return {cmd:'cd',args:['..'],narr:'Going up one directory...'};
  if(/(?:go\s+)?home/i.test(s))
    return {cmd:'cd',args:['~'],narr:'Going home...'};

  // Search/find
  if(/(?:search|find|look for|locate|where(?:'s| is))\s+(.+)/i.test(s)){
    const m=s.match(/(?:search|find|look for|locate|where(?:'s| is))\s+(.+)/i);
    const q=m[1].replace(/^(?:the|a|file|files)\s+/i,'').trim();
    return {cmd:'find',args:[q],narr:`Searching for "${q}"...`};
  }

  // Git operations
  if(/(?:git\s+)?(?:status|what(?:'s| has) changed|any changes|uncommitted)/i.test(s))
    return {cmd:'git',args:['status'],narr:'Checking git status...'};
  if(/(?:git\s+)?(?:log|history|commits|recent changes|what(?:'s| was) committed)/i.test(s))
    return {cmd:'git',args:['log'],narr:'Showing commit history...'};
  if(/(?:git\s+)?(?:branch|branches|which branch)/i.test(s))
    return {cmd:'git',args:['branch'],narr:'Listing branches...'};
  if(/(?:git\s+)?(?:remote|repo|repository|origin)/i.test(s))
    return {cmd:'git',args:['remote'],narr:'Showing remotes...'};
  if(/(?:git\s+)?diff/i.test(s))
    return {cmd:'git',args:['diff'],narr:'Checking diff...'};

  // Build
  if(/(?:build|compile|make|cmake)\b/i.test(s))
    return {cmd:'make',args:[],narr:'Building pipeline...'};

  // Deploy
  if(/(?:deploy|ship|push to prod|release)/i.test(s)){
    return {cmd:'_narr',args:[],narr:null,custom:()=>{
      addLine('Deployment workflow:','info');
      addLine('  1. make            → Build CUDA/C++ modules','out');
      addLine('  2. pytest          → Verify all tests pass','out');
      addLine('  3. git push        → Push to origin/main','out');
      addLine('  4. vercel --prod   → Deploy to production','out');
      addLine('Run "make" to start the build step.','info');
    }};
  }

  // SSH/connect
  if(/(?:connect|ssh|log\s*in)\s+(?:to\s+)?(\w+)/i.test(s)){
    const m=s.match(/(?:connect|ssh|log\s*in)\s+(?:to\s+)?(\w+)/i);
    return {cmd:'ssh',args:[m[1]],narr:null};
  }

  // System health
  if(/(?:gpu|graphics|cuda|temperature|thermal|temp)\b/i.test(s))
    return {cmd:'jetson_health',args:[],narr:'Running GPU diagnostics...'};
  if(/(?:pipeline|service|daemon)\s*(?:status|health|running|check)/i.test(s))
    return {cmd:'slingshot-pipeline',args:[],narr:'Checking pipeline status...'};
  if(/(?:how(?:'s| is)|check|status of)\s+(?:the\s+)?(?:pipeline|system|service)/i.test(s))
    return {cmd:'slingshot-pipeline',args:[],narr:'Checking pipeline status...'};
  if(/(?:disk|storage|space|capacity)/i.test(s))
    return {cmd:'df',args:[],narr:'Checking disk usage...'};
  if(/(?:uptime|how long|been running)/i.test(s))
    return {cmd:'uptime',args:[],narr:null};
  if(/(?:who am i|whoami|current user|what user)/i.test(s))
    return {cmd:'whoami',args:[],narr:null};
  if(/(?:what time|date|current time)/i.test(s))
    return {cmd:'date',args:[],narr:null};
  if(/(?:system|os|kernel|uname|what system)/i.test(s))
    return {cmd:'uname',args:['-a'],narr:null};

  // Help
  if(/(?:help|what can|commands|how do i|what do|options|usage|manual)/i.test(s))
    return {cmd:'help',args:[],narr:null};

  // Clear
  if(/(?:clear|clean|reset|wipe)\s*(?:the\s+)?(?:screen|terminal|console)?/i.test(s))
    return {cmd:'clear',args:[],narr:null};

  // Greeting / conversational
  if(/^(?:hi|hello|hey|sup|yo|greetings)\b/i.test(s))
    return {cmd:'_narr',args:[],narr:null,custom:()=>{
      addLine('Hello! I\'m the SentinelForge edge terminal.','info');
      addLine('You can use natural language or standard Unix commands.','out');
      addLine('Try: "show me the project files" or "run the tests"','out');
    }};
  if(/(?:thanks|thank you|thx|cheers)/i.test(s))
    return {cmd:'_narr',args:[],narr:null,custom:()=>{
      addLine('You\'re welcome. Ready for the next command.','info');
    }};
  if(/(?:what (?:is|are) you|who are you|about)/i.test(s))
    return {cmd:'_narr',args:[],narr:null,custom:()=>{
      addLine('SentinelForge Antigravity IDE Terminal v1.15.8','info');
      addLine('Embedded command-line for the Slingshot Ground Sensor Network.','out');
      addLine('I understand both Unix commands and natural language.','out');
      addLine('Backed by a simulated 20-node edge processing network.','out');
    }};

  // Catch-all question about specific files
  if(fileName)
    return {cmd:'cat',args:[fileName],narr:`Showing ${fileName}...`};

  return null; // No NLP match — fall through to raw command parser
}

// Boot message
addLine('Antigravity IDE v1.15.8 — Integrated Terminal','info');
addLine('SentinelForge workspace loaded. Accepts commands and natural language.','out');
addLine('');

inp.addEventListener('keydown',e=>{
  if(e.key==='Enter'){
    const raw=inp.value.trim();
    inp.value='';
    if(!raw)return;
    history.push(raw);histIdx=history.length;
    addLine(`${document.querySelector('.prompt').textContent}${raw}`,'cmd');

    // Try NLP first
    const intent=nlp(raw);
    if(intent){
      if(intent.narr) addLine(intent.narr,'info');
      if(intent.custom) intent.custom();
      else if(CMDS[intent.cmd]) CMDS[intent.cmd](intent.args);
    } else {
      // Fall back to raw command parsing
      const parts=raw.split(/\s+/);
      const cmd=parts[0];const args=parts.slice(1);
      if(CMDS[cmd]) CMDS[cmd](args);
      else if(cmd==='exit') addLine('Use Ctrl+D or close the browser tab.','warn');
      else addLine(`I didn't understand that. Try natural language ("show me the files") or a command ("ls").`,'warn');
    }
    scroll();
  } else if(e.key==='ArrowUp'){
    e.preventDefault();
    if(histIdx>0){histIdx--;inp.value=history[histIdx];}
  } else if(e.key==='ArrowDown'){
    e.preventDefault();
    if(histIdx<history.length-1){histIdx++;inp.value=history[histIdx];}
    else{histIdx=history.length;inp.value='';}
  } else if(e.key==='Tab'){
    e.preventDefault();
    const val=inp.value;const parts=val.split(/\s+/);
    const last=parts[parts.length-1];
    if(!last)return;
    const dir=last.includes('/')?resolve(last.substring(0,last.lastIndexOf('/'))):cwd;
    const prefix=last.includes('/')?last.substring(last.lastIndexOf('/')+1):last;
    const node=getDirNode(dir);
    if(!node)return;
    const matches=Object.keys(node).filter(k=>k.startsWith(prefix));
    if(matches.length===1){
      parts[parts.length-1]=(last.includes('/')?last.substring(0,last.lastIndexOf('/')+1):'')+matches[0];
      inp.value=parts.join(' ');
    } else if(matches.length>1){
      addLine(`${document.querySelector('.prompt').textContent}${val}`,'cmd');
      addLine(matches.join('  '),'out');
      scroll();
    }
  } else if(e.key==='l'&&e.ctrlKey){
    e.preventDefault();CMDS.clear();
  }
});

document.getElementById('termClear').addEventListener('click',()=>CMDS.clear());
document.getElementById('termMax').addEventListener('click',()=>{
  document.getElementById('terminal').classList.toggle('maximized');
  inp.focus();
});
document.getElementById('terminal').addEventListener('click',()=>inp.focus());
scroll();
}); // DOMContentLoaded
})();
