import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const token = process.env.SPOTIFY_ACCESS_TOKEN;
  
  if (!token) {
    return res.status(500).json({ error: 'No token found' });
  }

  try {
    // Test multiple endpoints to see what works
    const tests = [
      { name: 'Current User', url: 'https://api.spotify.com/v1/me' },
      { name: 'Current Playback', url: 'https://api.spotify.com/v1/me/player' },
      { name: 'Available Devices', url: 'https://api.spotify.com/v1/me/player/devices' },
      { name: 'Recently Played', url: 'https://api.spotify.com/v1/me/player/recently-played?limit=1' }
    ];

    const results = {};

    for (const test of tests) {
      try {
        const response = await fetch(test.url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        
        const text = await response.text();
        let data;
        try {
          data = text ? JSON.parse(text) : null;
        } catch (e) {
          data = text; // Return raw text if not JSON
        }
        
        results[test.name] = {
          status: response.status,
          raw_response: text.substring(0, 200), // First 200 chars
          data: data
        };
      } catch (error) {
        results[test.name] = {
          error: error.message
        };
      }
    }

    res.status(200).json({
      token_preview: token.substring(0, 20) + '...',
      results
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}