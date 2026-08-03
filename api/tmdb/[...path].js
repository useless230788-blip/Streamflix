// /api/tmdb/[...path].js
// Proxies requests to TMDB through your own domain (streamflix123.vercel.app/api/tmdb/...)
// This fixes two things:
// 1. Brave / ad-block shields no longer block the request, since it's same-origin
//    instead of a direct call to api.themoviedb.org
// 2. Your TMDB API key stays on the server and is never exposed in browser dev tools

export default async function handler(req, res) {
  const { path, ...query } = req.query;

  const tmdbPath = Array.isArray(path) ? path.join('/') : (path || '');

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, value);
  }
  params.set('api_key', process.env.TMDB_API_KEY);

  const url = `https://api.themoviedb.org/3/${tmdbPath}?${params.toString()}`;

  try {
    const tmdbRes = await fetch(url);
    const data = await tmdbRes.json();

    // Cache successful responses at the edge for a bit to reduce repeat calls
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=600');
    res.status(tmdbRes.status).json(data);
  } catch (err) {
    res.status(502).json({ error: 'Failed to reach TMDB', details: err.message });
  }
}

