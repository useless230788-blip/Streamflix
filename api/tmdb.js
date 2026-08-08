// api/tmdb.js

export default async function handler(req, res) {
  const { endpoint } = req.query;

  // 1. Security: Validate the endpoint
  if (!endpoint || typeof endpoint !== 'string') {
    return res.status(400).json({ error: 'Missing endpoint parameter' });
  }

  // Prevent open proxy abuse
  if (
    !endpoint.startsWith('/') ||
    endpoint.includes('://') ||
    endpoint.includes('../') ||
    endpoint.includes('\n')
  ) {
    return res.status(400).json({ error: 'Invalid endpoint format' });
  }

  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_API_KEY) {
    return res.status(500).json({ error: 'TMDB_API_KEY environment variable is not set.' });
  }

  // 2. Construct the secure TMDB URL
  const separator = endpoint.includes('?') ? '&' : '?';
  const tmdbUrl = `https://api.themoviedb.org/3${endpoint}${separator}api_key=${TMDB_API_KEY}`;

  try {
    // 3. Server-side fetch with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(tmdbUrl, {
      signal: controller.signal,
      headers: { 'Accept': 'application/json' }
    });

    clearTimeout(timeoutId);

    // 4. Set Vercel CDN Cache Headers
    res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate=60');

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json(data);
    }

    return res.status(200).json(data);
  } catch (error) {
    console.error('TMDB Proxy Error:', error.message);
    if (error.name === 'AbortError') {
      return res.status(504).json({ error: 'Gateway Timeout: TMDB took too long to respond.' });
    }
    return res.status(502).json({ error: 'Bad Gateway: Failed to fetch from TMDB.' });
  }
}
