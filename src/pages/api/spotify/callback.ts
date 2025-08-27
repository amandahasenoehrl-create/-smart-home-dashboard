import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code, error } = req.query;

  if (error) {
    return res.status(400).json({ error: 'Authorization failed', details: error });
  }

  if (!code) {
    return res.status(400).json({ error: 'No authorization code received' });
  }

  try {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    const redirectUri = 'https://example.com/callback'; // We'll use a workaround

    if (!clientId || !clientSecret) {
      return res.status(500).json({ error: 'Spotify credentials not configured' });
    }

    // Exchange code for access token
    const tokenResponse = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      return res.status(400).json({ error: 'Failed to get access token', details: tokenData });
    }

    // Return the access token in a user-friendly way
    res.status(200).json({
      success: true,
      access_token: tokenData.access_token,
      message: 'Copy this access token to your .env.local file as SPOTIFY_ACCESS_TOKEN',
      instructions: `Add this line to your .env.local file:\nSPOTIFY_ACCESS_TOKEN=${tokenData.access_token}`
    });

  } catch (error) {
    console.error('Spotify callback error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}