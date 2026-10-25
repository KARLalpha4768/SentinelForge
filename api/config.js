// Vercel Serverless Function — Public Configuration Provider
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

  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'GET only' });
  }

  return res.status(200).json({
    cesiumIonToken: process.env.CESIUM_ION_TOKEN || ''
  });
}
