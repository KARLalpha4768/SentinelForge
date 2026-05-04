// Vercel Serverless Function — Gemini NLU for SentinelForge Terminal
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const { input } = req.body || {};
  if (!input || typeof input !== 'string' || input.length > 500)
    return res.status(400).json({ error: 'Invalid input' });

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const systemPrompt = `You are a command interpreter for the SentinelForge space surveillance terminal.
The user types natural language. You must respond with ONLY a JSON object — no markdown, no explanation.

Available commands and their arguments:
  ls [path]                    — list directory
  cat <file>                   — show file contents
  cd <dir>                     — change directory (paths: frontend, output/builds/src/science, output/builds/src/hardware, output/builds/src/edge, tests, benchmarks, data, ..)
  pwd                          — print working directory
  tree [path]                  — show directory tree
  find <pattern>               — search for files matching pattern
  head <file>                  — first 10 lines of file
  grep <pattern> <file>        — search within file
  wc <file>                    — word count
  python <file>                — run a python file
  pytest                       — run test suite (25 tests)
  git status|log|branch|remote|diff — git operations
  make [target]                — build CUDA/C++ pipeline
  nano <file>                  — open file in editor
  ssh <site_code>              — SSH to edge node (codes: co1, tx1, au1, hi1, etc.)
  slingshot-pipeline           — show pipeline service status
  jetson_health                — GPU/Jetson diagnostics
  df                           — disk usage
  uptime                       — system uptime
  whoami                       — current user
  uname -a                     — system info
  date                         — current date/time
  echo <text>                  — echo text
  clear                        — clear screen
  help                         — show help

Available files in the project:
  main.py, process_real_frame.py, requirements.txt
  frontend/sentinel_ops.html, frontend/sentinel_core.js, frontend/sentinel_slingshot_*.html
  output/builds/src/science/orbit_propagator.py, conjunction_screener.py, multi_sensor_fusion.py,
    light_curve_analyzer.py, graph_associator.py, bayesian_iod.py, koopman_propagator.py,
    cislunar_dynamics.py, data_assimilation_engine.py, pinn_orbit.py, coordinate_frames.py
  output/builds/src/hardware/ascom_hal.py, streak_detect.cu, calibration.cu, plate_solver.cpp, photometry.cpp
  output/builds/src/edge/kafka_transport.py, site_monitor.py, scheduler.py
  tests/test_science_modules.py, benchmarks/benchmark_science.py

Respond with JSON: {"cmd":"<command>","args":["<arg1>","<arg2>"],"narr":"<brief explanation of what you're doing>"}
For conversational responses (greetings, questions about the system, etc.), use:
{"cmd":"_reply","text":"<your response>"}

Examples:
  "what files do we have?" → {"cmd":"ls","args":[],"narr":"Listing project files..."}
  "can you show me the orbit code?" → {"cmd":"cat","args":["output/builds/src/science/orbit_propagator.py"],"narr":"Opening orbit propagator source..."}
  "do we need to modify anything?" → {"cmd":"_reply","text":"The codebase is deployment-ready. To inspect specific modules, try 'cat <file>' or ask me to show any module. Key areas:\\n• Science: output/builds/src/science/\\n• Hardware: output/builds/src/hardware/\\n• Edge: output/builds/src/edge/"}
  "how's the gpu?" → {"cmd":"jetson_health","args":[],"narr":"Running GPU diagnostics..."}
  "hello" → {"cmd":"_reply","text":"Hello! I'm the SentinelForge terminal. Ask me anything about the codebase, or tell me what to run."}`;

  const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash-lite'];
  const reqBody = JSON.stringify({
    contents: [{ parts: [{ text: `${systemPrompt}\n\nUser input: "${input}"` }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 256,
      responseMimeType: 'application/json'
    }
  });

  for (const model of models) {
    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: reqBody }
      );

      if (response.status === 503 || response.status === 429) {
        console.log(`${model}: ${response.status}, trying next model...`);
        continue; // Try next model
      }

      if (!response.ok) {
        const errText = await response.text();
        console.error(`${model} error:`, errText);
        continue;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) continue;

      const parsed = JSON.parse(text);
      return res.status(200).json(parsed);
    } catch (err) {
      console.error(`${model} failed:`, err.message);
      continue;
    }
  }

  return res.status(502).json({ error: 'All models unavailable. Try again in a moment.' });
}
