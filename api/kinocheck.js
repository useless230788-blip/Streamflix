// /api/kinocheck.js
export default async function handler(req, res) {
    const { id, type } = req.query;
    
    if (!id) {
        return res.status(400).json({ error: 'TMDB ID is required' });
    }

    const apiKey = process.env.KINOCHECK_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'Kinocheck API key is not configured on the server.' });
    }

    // Use /shows for TV types and /movies for movie types
    const endpointPath = type === 'tv' ? 'shows' : 'movies';
    const url = `https://api.kinocheck.com/${endpointPath}?tmdb_id=${id}&language=en`;

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
            return res.status(response.status).json({ error: `Kinocheck API error: ${response.statusText}` });
        }

        const data = await response.json();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
