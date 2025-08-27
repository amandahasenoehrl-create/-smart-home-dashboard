import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Spotify Token - Final Solution</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 900px; margin: 30px auto; padding: 20px; background: #191414; color: white; }
        .container { background: #282828; padding: 30px; border-radius: 8px; }
        .step { margin: 20px 0; padding: 20px; background: #1db954; border-radius: 8px; color: #191414; }
        .step h3 { margin-top: 0; }
        .auth-link { background: #1ed760; color: #191414; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block; margin: 10px 0; }
        .auth-link:hover { background: #1db954; }
        .code-box { background: #000; color: #1db954; padding: 15px; border-radius: 5px; font-family: monospace; margin: 10px 0; word-break: break-all; }
        .warning { background: #ff6b6b; color: white; padding: 15px; border-radius: 5px; margin: 15px 0; }
        .success { background: #51cf66; color: #191414; padding: 15px; border-radius: 5px; margin: 15px 0; }
    </style>
</head>
<body>
    <div class="container">
        <h1>🎵 Spotify Token Generator</h1>
        <p>Since localhost redirects don't work with Spotify, here's the manual but reliable method:</p>
        
        <div class="step">
            <h3>Step 1: Click this authorization link</h3>
            <a href="https://accounts.spotify.com/authorize?response_type=code&client_id=${clientId}&scope=user-read-playback-state%20user-modify-playback-state%20user-read-currently-playing%20streaming&redirect_uri=https%3A%2F%2Fdeveloper.spotify.com%2Fcallback&state=123" 
               class="auth-link" target="_blank">
               🚀 Authorize with Spotify
            </a>
        </div>

        <div class="step">
            <h3>Step 2: After clicking "Agree"</h3>
            <p>You'll see an error page, but <strong>DON'T PANIC!</strong> Look at the URL in your browser's address bar.</p>
            <p>It will look something like this:</p>
            <div class="code-box">
                https://developer.spotify.com/callback?code=<strong>AQBw7g8h2j...</strong>&state=123
            </div>
            <p><strong>Copy the entire code</strong> (the long string after "code=" and before "&state")</p>
        </div>

        <div class="step">
            <h3>Step 3: Exchange the code for a token</h3>
            <p>Go to this URL in a new tab:</p>
            <div class="code-box">
                http://localhost:3004/api/spotify/exchange?code=PASTE_YOUR_CODE_HERE
            </div>
            <p>Replace "PASTE_YOUR_CODE_HERE" with the code you copied from Step 2</p>
        </div>

        <div class="success">
            <p><strong>That's it!</strong> The exchange endpoint will give you your access token that you can copy to your .env.local file.</p>
        </div>
    </div>
</body>
</html>`;

  res.setHeader('Content-Type', 'text/html');
  res.status(200).send(html);
}