import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { code } = req.query;
  
  if (!code) {
    return res.status(400).json({ 
      error: 'No code provided', 
      usage: 'Visit /api/spotify/exchange?code=YOUR_AUTHORIZATION_CODE' 
    });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId) {
    return res.status(500).json({ error: 'Spotify Client ID not configured' });
  }

  try {
    // Exchange authorization code for access token
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret || ''}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code as string,
        redirect_uri: 'https://developer.spotify.com/callback'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(400).json({ 
        error: 'Failed to exchange code for token', 
        details: data,
        note: 'Make sure you have SPOTIFY_CLIENT_SECRET in your .env.local file'
      });
    }

    const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Spotify Token Success!</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; background: #191414; color: white; }
        .container { background: #1db954; color: #191414; padding: 30px; border-radius: 8px; }
        .token-box { background: #000; color: #1db954; padding: 20px; border-radius: 5px; font-family: monospace; margin: 20px 0; word-break: break-all; font-size: 14px; }
        .copy-btn { background: #1ed760; color: #191414; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; }
        .copy-btn:hover { background: #1db954; }
        .instruction { background: #282828; color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎉 Success! Your Spotify Access Token:</h1>
        <div class="token-box" id="token">
            ${data.access_token}
        </div>
        <button class="copy-btn" onclick="copyToken()">📋 Copy Token</button>
        
        <div class="instruction">
            <h3>What to do now:</h3>
            <ol>
                <li>Copy the token above</li>
                <li>Open your <code>.env.local</code> file</li>
                <li>Replace <code>paste_your_token_here</code> with your token:</li>
                <li><code>SPOTIFY_ACCESS_TOKEN=${data.access_token}</code></li>
                <li>Restart your development server</li>
                <li>Start playing music on Spotify and refresh your app!</li>
            </ol>
        </div>
    </div>

    <script>
        function copyToken() {
            const token = document.getElementById('token').textContent;
            navigator.clipboard.writeText(token).then(() => {
                alert('Token copied to clipboard!');
            });
        }
    </script>
</body>
</html>`;

    res.setHeader('Content-Type', 'text/html');
    res.status(200).send(html);

  } catch (error) {
    console.error('Token exchange error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
}