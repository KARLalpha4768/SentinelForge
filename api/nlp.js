// Vercel Serverless Function — Gemini NLU for SentinelForge Terminal
import { timingSafeEqual } from 'node:crypto';

// Best-effort in-memory per-IP rate limit (20 req/min)
const ipHits = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxReqs = 20;
  const hits = (ipHits.get(ip) || []).filter(t => now - t < windowMs);

  if (hits.length >= maxReqs) {
    return false;
  }
  hits.push(now);
  ipHits.set(ip, hits);

  if (ipHits.size > 2000) {
    for (const [k, v] of ipHits.entries()) {
      if (v.length === 0 || now - v[v.length - 1] > windowMs) {
        ipHits.delete(k);
      }
    }
  }
  return true;
}

function validApiKey(provided, expected) {
  if (typeof provided !== 'string' || typeof expected !== 'string') {
    return false;
  }
  const providedBytes = Buffer.from(provided, 'utf8');
  const expectedBytes = Buffer.from(expected, 'utf8');
  return providedBytes.length === expectedBytes.length
    && timingSafeEqual(providedBytes, expectedBytes);
}

const ALLOWED_COMMANDS = new Set([
  'ls', 'cat', 'cd', 'pwd', 'tree', 'find', 'head', 'grep', 'wc',
  'python', 'pytest', 'git', 'make', 'nano', 'ssh', 'slingshot-pipeline',
  'jetson_health', 'df', 'uptime', 'whoami', 'uname', 'date', 'echo',
  'clear', 'help', '_reply'
]);

export default async function handler(req, res) {
  const origin = req.headers.origin;
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'https://sentinelforge.vercel.app')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (origin) {
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    } else {
      return res.status(403).json({ error: 'Origin not allowed' });
    }
  }

  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-API-Key');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST only' });
  }

  // Authentication is mandatory and fail-closed when the server is not configured.
  const expectedApiKey = process.env.NLP_API_KEY;
  if (!expectedApiKey) {
    return res.status(503).json({ error: 'Service authentication is not configured' });
  }
  if (!validApiKey(req.headers['x-api-key'], expectedApiKey)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // Best-effort per-IP rate limiting. Serverless instances do not share memory,
  // so this bounds bursts per warm instance rather than providing a global quota.
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket?.remoteAddress || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many requests. Please wait a minute.' });
  }

  // Strict input validation
  let input = req.body?.input;
  if (!input || typeof input !== 'string') {
    return res.status(400).json({ error: 'Invalid input' });
  }
  // Strip control characters (retain printable characters and whitespace)
  input = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').trim();
  if (input.length < 1 || input.length > 500) {
    return res.status(400).json({ error: 'Invalid input length' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured' });
  }

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

  // Strict fixed model allow-list (cannot be used as an open proxy)
  const models = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.0-flash-lite'];
  const reqBody = JSON.stringify({
    contents: [{ parts: [{ text: `${systemPrompt}\n\nUser input: ${JSON.stringify(input)}` }] }],
    generationConfig: {
      temperature: 0.1,
      maxOutputTokens: 256,
      responseMimeType: 'application/json'
    }
  });

  for (const model of models) {
    try {
      // Pass API key via header, NEVER in URL query params
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: reqBody
        }
      );

      if (response.status === 503 || response.status === 429) {
        continue; // Try next model
      }

      if (!response.ok) {
        // Do not leak upstream error body to client
        continue;
      }

      const data = await response.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) continue;

      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        continue;
      }

      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
        return res.status(200).json({ cmd: '_reply', text: 'Command not recognized.' });
      }

      // Validate command is from allowed set
      if (typeof parsed.cmd !== 'string' || !ALLOWED_COMMANDS.has(parsed.cmd)) {
        return res.status(200).json({ cmd: '_reply', text: 'Command not recognized.' });
      }

      return res.status(200).json(parsed);
    } catch {
      continue;
    }
  }

  // Generic failure response without leaking internal errors
  return res.status(502).json({ error: 'All models unavailable. Try again in a moment.' });
}
