export default async function handler(req, res) {
    // Enable CORS for your frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    const { tmdb_id, type } = req.query;

    if (!tmdb_id || !type) {
        return res.status(400).json({ error: 'Missing tmdb_id or type' });
    }

    const apiKey = process.env.KINO_API_KEY; // Read from Vercel Environment Variables
    if (!apiKey) {
        return res.status(500).json({ error: 'Kinocheck API key is not configured on the server.' });
    }

    // type will be 'movies' or 'shows'
    const url = `https://api.kinocheck.com/${type}?tmdb_id=${tmdb_id}`;

    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Api-Key': apiKey,
                'X-Api-Host': 'api.kinocheck.com'
            }
        });

        if (!response.ok) {
            return res.status(response.status).json({ error: `Kinocheck API Error: ${response.statusText}` });
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch from Kinocheck', details: error.message });
    }
}
