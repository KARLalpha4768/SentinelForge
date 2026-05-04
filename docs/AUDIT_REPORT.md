# SentinelForge — Codebase Audit
**Date:** 2026-05-04 · **Version:** `7660699` (main) · **Live:** https://sentinelforge.vercel.app

---

## 📊 Codebase Metrics

| Metric | Value |
|--------|-------|
| Total LOC (JS + HTML + CSS) | **~8,200** |
| Total file count (tracked) | **194 files** |
| Total frontend size | **~580 KB** code + **401 KB** images |
| Git commits | **90+** |
| JavaScript files | **12** (~5,800 LOC) |
| HTML pages | **7** (1,071 LOC) |
| CSS files | **1** (1,279 LOC) |
| Python science modules | **22** |
| C++/CUDA source files | **6** |
| JSON data files | **2** (site_registry + telemetry) |
| Serverless API functions | **1** (`/api/nlp.js`) |

---

## 📁 File Inventory & LOC Breakdown

### JavaScript (sorted by size)
| File | LOC | KB | Role |
|------|-----|-----|------|
| `sentinel_core.js` | 2,643 | 226 | Main engine: STATE data, gauges, sites, inventory, modals, drill-down |
| `sentinel_globe_chat.js` | 1,025 | 67 | CesiumJS globe, clickable satellites, conjunction modals, NL chat (11 domains) |
| `sentinel_drilldown.js` | 871 | 77 | Network modal drill-down, site detail rendering |
| `sentinel_terminal.js` | 645 | 32 | Terminal emulator + 3-layer NLP (direct/regex/Gemini) |
| `sentinel_layout.js` | 456 | 23 | Responsive layout, drag/resize, panel management |
| `sentinel_slingshot_catalog.js` | 294 | 25 | Slingshot 20-station grid, detail slide-over |
| `sentinel_state.js` | 240 | 34 | Central STATE object: sites, conjunctions, escalation |
| `sentinel_resilience.js` | 224 | 11 | Self-healing engine (10 subsystems, fleet resilience) |
| `sentinel_redteam.js` | 199 | 10 | ASAT debris cascade scenario simulation |
| `sentinel_catalog.js` | 186 | 16 | Object catalog search and display |
| `sentinel_portal.js` | 183 | 14 | Engineering portal chapter navigation |
| `sentinel_celestrak.js` | 164 | 7 | CelesTrak GP data integration (live satellite catalog) |

### HTML Pages
| Page | LOC | Purpose |
|------|-----|---------|
| `sentinel_ops.html` | 134 | **Primary dashboard** — ops center entry point |
| `sentinel_slingshot_catalog.html` | 174 | Slingshot 20-station technology catalog |
| `sentinel_slingshot_programmer.html` | 277 | Programmer's integration reference + terminal |
| `sentinel_slingshot_technician.html` | 249 | Onsite technician field guide |
| `sentinel_catalog.html` | 132 | Satellite object catalog search |
| `sentinel_portal.html` | 101 | Engineering reference portal |
| `digital_twin.html` | 167 | CesiumJS digital twin visualization |

---

## 🏗️ Architecture

```
sentinel_ops.html (PRIMARY)
├── sentinel_core.js .......... Main engine, STATE, gauges, inventory
├── sentinel_globe_chat.js .... CesiumJS globe + NL chat + clickable entities
├── sentinel_layout.js ........ Responsive panels, drag/resize
├── sentinel_state.js ......... Central data store
├── sentinel_drilldown.js ..... Network drill-down modals
├── sentinel_resilience.js .... Self-healing engine
├── sentinel_redteam.js ....... ASAT scenario simulation
├── sentinel_celestrak.js ..... Live CelesTrak GP data
├── sentinel_custody.js ....... Observation chain tracking
└── sentinel_ops.css .......... Design system

api/nlp.js (SERVERLESS)
└── Gemini 2.5 Flash → 2.5 Flash-Lite → 2.0 Flash-Lite
    └── 3-model fallback chain for NLU resilience
```

---

## 🖥️ UI Pages & Features

### 1. Operations Center (`sentinel_ops.html`) — PRIMARY
- ✅ 3D CesiumJS globe with **clickable** LEO/MEO/GEO satellites (850+ entities with NORAD ID, orbit params)
- ✅ **Clickable** ground stations (172 sites with network, sensor type, GPU load, coords)
- ✅ 8 system health gauges with clickable detail popups
- ✅ Catalog inventory (10 tabs: overview, conjunctions, maneuvers, debris, launches, reentries, Pc timeline, escalation, feeds, trending)
- ✅ Space weather bar (F10.7, Kp, Dst)
- ✅ Real-time alert toast system
- ✅ Natural language chat with 11 knowledge domains
- ✅ Conjunction detail modal (debris intel, response protocol, notification roster)
- ✅ Time scrubber (T-24h to T+24h)
- ✅ Full satellite catalog overlay (CelesTrak live data, 10K+ objects)

### 2. Ground Station Catalog (`sentinel_slingshot_catalog.html`)
- ✅ 20-station card grid with search, region/status filters
- ✅ Detail slide-over (metrics, hardware profile, SOPs, mission impact)
- ✅ In-panel Programmer's Sheet (site-specific API, YAML, SSH, Python modules)

### 3. Programmer's Reference (`sentinel_slingshot_programmer.html`)
- ✅ 70+ expandable drill-down sections
- ✅ Full terminal emulator with 3-layer NLU
- ✅ Gemini 2.5 Flash conversational AI

### 4. Technician Guide (`sentinel_slingshot_technician.html`)
- ✅ Observatory cross-section schematic
- ✅ 8-entry troubleshooting matrix
- ✅ Standardized spares kit
- ✅ 3-tier escalation contacts

### 5. Engineering Portal (`sentinel_portal.html`)
- ✅ Multi-chapter SDA doctrine documentation
- ✅ Sidebar navigation with chapter links

---

## 🔍 Interactive Features Audit

| Feature | Status | Notes |
|---------|--------|-------|
| Satellite click → info card | ✅ | NORAD ID, type, altitude, inclination, period |
| Ground station click → info card | ✅ | Network, sensor, coords, GPU load, ops mode |
| Conjunction click → detail modal | ✅ | Full Pc, miss distance, escalation protocol |
| Gauge click → detail popup | ✅ | All 8 gauges, threshold guide |
| Globe layer toggles | ✅ | LEO/MEO/GEO/Conj/UCTs/Coverage |
| NL chat engine | ✅ | 11 domains + action commands |
| Terminal commands | ✅ | 20+ commands, tab completion, history |
| Alert toasts | ✅ | Auto-generated cycle |
| Time scrubber | ✅ | Shifts Cesium clock ±24h |

---

## 🗺️ Navigation Map

```
sentinel_ops.html (PRIMARY)
├── [Globe] LEO/MEO/GEO satellites (clickable) + Ground stations (clickable)
├── [Chat] Ask SentinelForge (11 domains)
├── [Gauges] Click any → detail popup
├── [Ground Network]
│   └── ▶ Slingshot Sites (20)
│       └── Click station → Modal
│           ├── 💻 Programmer's Sheet (in-modal)
│           ├── 🔧 Onsite Technician → sentinel_slingshot_technician.html
│           └── ← Ground Station Catalog → sentinel_slingshot_catalog.html
├── [Catalog Inventory] 10 tabs
├── [Top Nav]
│   ├── 📊 Catalog → sentinel_catalog.html
│   ├── 📡 Slingshot Sites → sentinel_slingshot_catalog.html
│   └── 📖 Engineering Portal → sentinel_portal.html
└── [Programmer's Reference] → sentinel_slingshot_programmer.html
    └── 💻 Embedded Terminal (Gemini NLU)
```

---

## ✅ Code Quality Summary

### Strengths
- **Zero framework dependency** — pure vanilla JS, no build step, instant load
- **Rich data model** — STATE object contains 46K catalog, 172 sites, conjunctions, UCTs, debris events, escalation tiers
- **Professional SDA knowledge** — correct orbital mechanics, NEES, J2-J6, covariance realism terminology
- **Consistent design system** — dark theme, glassmorphism, color-coded status indicators
- **CelesTrak integration** — live GP data with proper Keplerian → LLA conversion
- **Serverless API security** — Gemini API key never exposed to browser
- **Performance benchmarked** — 9 benchmarks documented in README
- **End-to-end tested** — 6/6 science module tests passing
