# 🛰 SentinelForge — Interview Demo Script
**Role:** Senior Space Surveillance Engineer, Sensor Development & Image Processing  
**Company:** Slingshot Aerospace  
**Demo URL:** [sentinelforge.vercel.app](https://sentinelforge.vercel.app)  
**GitHub:** [github.com/KARLalpha4768/SentinelForge](https://github.com/KARLalpha4768/SentinelForge)  
**Duration:** 12–15 minutes

---

## Opening (30 seconds)

> *"I built SentinelForge as a complete edge-to-cloud space surveillance pipeline — 20 ground stations, CUDA-accelerated image processing on Jetson AGX Orin edge nodes, and a full operations center. Let me walk you through it live."*

Open: **sentinelforge.vercel.app**

---

## Stop 1: Operations Center — The Big Picture (2 min)

**What to show:** The globe, ground station map, live telemetry gauges

**Click:** Hover over ground station dots on the 2D map

> *"This is the ops center. 172 ground stations rendered — 20 are our Slingshot network nodes. Each dot is interactive — hover shows live sensor specs, GPU load, detection rate. The gauges drift in real-time using mean-reverting telemetry simulation."*

**Job description hit:** *"Design and develop algorithms for space object detection, tracking, and identification"*

> *"Every station runs a CUDA pipeline on a Jetson Orin — calibration, streak detection, plate solving, photometry — reducing 32MB raw frames to 10KB Tracking Data Messages. That's a 3,200:1 compression ratio before anything hits the WAN."*

---

## Stop 2: Conjunction Screening (2 min)

**Click:** Conjunctions tab in the inventory panel

> *"These are live conjunction events. Each one has a Pc computed using Foster-Estes 2D screening, but we go further — we also implemented non-Gaussian Pc using differential algebra to eliminate the false alarms that Gaussian assumptions create."*

**Click:** Click on one conjunction event to expand the drill-down

> *"Notice the escalation tiers map to the real operational chain — 18th SDS, NASA CARA, owner/operators. The EMERGENCY protocol includes maneuver decision gates at TCA minus 6 hours, exactly how it works at CSpOC."*

**Job description hit:** *"Develop and maintain sensor data processing pipelines"*

---

## Stop 3: Red Team Scenario (1 min — mention, don't run)

> *"There's a built-in Red Team scenario — a kinetic ASAT debris cascade. 312 fragments tracked, ISS conjunction at Pc > 1e-2, FLASH notifications cascade to the Mission Director, CARA, and 18th SDS. It runs the full escalation protocol through maneuver execution. You can trigger it from the console with `runRedTeamScenario()`."*

**Job description hit:** *"Collaborate with cross-functional teams including operations, data science, and engineering"*

---

## Stop 4: Ground Station Catalog (1 min)

**Click:** Navigate to Ground Station Catalog

> *"Each of the 20 Slingshot sites has a full technology card — sensor specs, mount type, edge compute hardware, network uplink, detection inventory. This is the data an onsite technician or remote programmer would reference."*

**Job description hit:** *"Support sensor deployment, calibration, and commissioning activities"*

---

## Stop 5: Technician Guide (1 min)

**Click:** Navigate to Technician Guide

> *"This is the field reference for onsite techs. Observatory cross-section schematic, troubleshooting matrix — dome lockouts, GPU thermal throttling, seeing conditions, GPS timing, Kafka queue backups. Plus a standardized spares kit and escalation contacts."*

> *"I built this because I know from my Air Force experience that the gap between engineering and field operations is where missions fail."*

**Job description hit:** *"Support field testing and integration of sensors"*

---

## Stop 6: Programmer's Reference — The Crown Jewel (3 min)

**Click:** Navigate to Programmer's Reference

> *"This is the integration reference for remote software engineers. Every section drill-downs — click any cyan arrow."*

**Click:** Expand a few drill-downs (REST API, CUDA module, edge pipeline)

> *"REST API endpoints per site, CUDA kernel documentation, edge pipeline configuration, debug commands — everything a programmer needs to integrate with or troubleshoot a ground station remotely."*

### The Terminal (the closer)

**Scroll to bottom.** Click into the terminal.

> *"And this is my favorite part — an embedded IDE terminal with full natural language understanding, powered by Gemini 2.5 Flash."*

**Type:** `show me the orbit propagation code`  
**Wait for response.**

**Type:** `do we need to modify any code?`  
**Wait for Gemini response.**

**Type:** `run the tests`  
**Watch pytest simulate 25/25 passing.**

> *"The terminal understands both Unix commands and conversational English. It has a 3-layer intelligence architecture — direct command matching, local regex NLP for instant responses, and Gemini LLM as the fallback for anything conversational. The API key is server-side in a Vercel serverless function — never exposed to the browser."*

**Job description hit:** *"Design and implement image processing algorithms... prototype, test, and optimize"*

---

## Stop 7: The Backend — GitHub (2 min)

**Open:** github.com/KARLalpha4768/SentinelForge

> *"The backend has 65+ source files across science, hardware, and edge modules. Let me highlight what maps directly to your role:"*

| Their Requirement | My Module |
|---|---|
| Streak detection algorithms | `streak_detect.cu` — CUDA matched-filter, 900 orientations, <3ms/frame |
| Calibration pipelines | `calibration.cu` — bias, dark current, flat field on GPU |
| Plate solving / astrometry | `plate_solver.cpp` — Gaia DR3 triangle matching, SIP distortion |
| Photometry | `photometry.cpp` — aperture + PSF with Gaussian deblending |
| Orbit determination | `orbit_propagator.py` — J2-J6 + atmospheric drag |
| Sensor fusion | `multi_sensor_fusion.py` — Extended Kalman Filter |
| ML models | 5 trained models with model cards, ONNX exports, TensorRT compilation |

> *"And the end-to-end test runs 6 modules — orbit propagation, conjunction screening, multi-sensor fusion, observation scheduling, and IOD. All 6 pass."*

---

## Closing (30 seconds)

> *"SentinelForge demonstrates the full stack you need for this role — from CUDA kernels on embedded hardware to cloud-side catalog management to operational decision support. I built it end-to-end, solo, in production on Vercel. Happy to deep-dive into any module."*

---

## Anticipated Questions & Answers

### "Is this real data?"
> *"The telemetry is simulated with realistic drift models, but the CelesTrak integration pulls real GP data — 10,000+ active satellites classified by orbit regime. The conjunction scenarios use realistic Pc values and miss distances from published CARA case studies."*

### "Why Jetson AGX Orin?"
> *"It's the only edge GPU with 275 TOPS INT8 that runs under 60W — critical for remote observatories on solar/battery. It supports TensorRT for compiled PINN inference and has the CUDA cores for real-time calibration and streak detection at 1 Hz frame rates."*

### "Have you worked with real telescope hardware?"
> *"The ASCOM HAL module implements the Alpaca/COM interface standard used by every commercial observatory — mount, camera, dome, focuser, filter wheel. It includes a simulation mode for development and switches to hardware control for deployment. The architecture mirrors how INDI/ASCOM drivers work in production observatories."*

### "What would you improve?"
> *"Three things: (1) Replace the simulated telemetry with a WebSocket bridge to actual Jetson hardware — I have the Kafka transport layer ready. (2) Add real TLE propagation using SGP4 in the browser for the 3D globe. (3) Implement the neuromorphic event camera pipeline — that's the sensor advancement that would give Slingshot daytime optical tracking capability, which is the next competitive frontier."*

### "How does this compare to what we do at Slingshot?"
> *"I modeled this on your public architecture — ground-based optical sensors feeding edge compute nodes that reduce data before cloud transport. The key differences would be your proprietary ML models and your operational relationships with 18th SDS and commercial operators. But the pipeline pattern — CCD frame → calibration → detection → extraction → astrometry → TDM → cloud ingest — that's the same fundamental architecture."*
