import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  
  if (!clientId) {
    return res.status(500).json({ error: 'Spotify Client ID not configured' });
  }

  // Generate a simple HTML page that will do the token extraction automatically
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Spotify Token Generator</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 800px; margin: 50px auto; padding: 20px; }
        .token-box { background: #f0f0f0; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .auth-btn { background: #1DB954; color: white; padding: 15px 30px; border: none; border-radius: 25px; font-size: 16px; cursor: pointer; }
        .auth-btn:hover { background: #1ed760; }
        .step { margin: 15px 0; padding: 10px; background: #f9f9f9; border-left: 4px solid #1DB954; }
    </style>
</head>
<body>
    <h1>🎵 Get Your Spotify Token</h1>
    
    <div class="step">
        <h3>Step 1: Click the button below</h3>
        <button class="auth-btn" onclick="authorizeSpotify()">
            🚀 Authorize Spotify Access
        </button>
    </div>
    
    <div class="step">
        <h3>Step 2: After authorization, your token will appear here:</h3>
        <div class="token-box" id="token-display">
            <p><em>Click the button above first...</em></p>
        </div>
    </div>
    
    <div class="step">
        <h3>Step 3: Copy the token to your .env.local file</h3>
        <p>Add this line to your <code>.env.local</code> file:</p>
        <div class="token-box">
            <code>SPOTIFY_ACCESS_TOKEN=your_token_will_appear_above</code>
        </div>
    </div>

    <script>
        function authorizeSpotify() {
            const clientId = '${clientId}';
            const scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing streaming user-read-email user-read-private';
            
            const authUrl = 'https://accounts.spotify.com/authorize?' +
                'response_type=token&' +
                'client_id=' + clientId + '&' +
                'scope=' + encodeURIComponent(scopes) + '&' +
                'redirect_uri=' + encodeURIComponent(window.location.href);
                
            window.location.href = authUrl;
        }
        
        // Check if we have a token in the URL (after redirect)
        function checkForToken() {
            const hash = window.location.hash;
            if (hash) {
                const params = new URLSearchParams(hash.substring(1));
                const accessToken = params.get('access_token');
                
                if (accessToken) {
                    document.getElementById('token-display').innerHTML = 
                        '<h4>✅ Success! Your Spotify Access Token:</h4>' +
                        '<div style="background: white; padding: 10px; border: 1px solid #ccc; border-radius: 3px; font-family: monospace; word-break: break-all;">' +
                        accessToken +
                        '</div>' +
                        '<p><strong>Copy this entire token and paste it in your .env.local file as:</strong></p>' +
                        '<code>SPOTIFY_ACCESS_TOKEN=' + accessToken + '</code>';
                    
                    // Clean up URL
                    history.replaceState(null, null, window.location.pathname);
                }
            }
        }
        
        // Check for token when page loads
        checkForToken();
    </script>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}