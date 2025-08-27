import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // This creates a manual authorization URL that users can visit
  const clientId = process.env.SPOTIFY_CLIENT_ID || 'your_client_id_here';
  const scopes = 'user-read-playback-state user-modify-playback-state user-read-currently-playing streaming user-read-email user-read-private';
  
  const authUrl = `https://accounts.spotify.com/authorize?` +
    `response_type=token&` +
    `client_id=${clientId}&` +
    `scope=${encodeURIComponent(scopes)}&` +
    `redirect_uri=${encodeURIComponent('https://developer.spotify.com/callback')}&` +
    `show_dialog=true`;

  res.status(200).json({
    instructions: [
      "1. Click the URL below to authorize Spotify",
      "2. After clicking 'Agree', you'll be redirected to a page with an error",
      "3. Look at the URL bar - it will contain your access token",
      "4. Copy everything after 'access_token=' and before '&token_type'",
      "5. Add that token to your .env.local file as SPOTIFY_ACCESS_TOKEN=your_token",
      "6. Restart your development server"
    ],
    authUrl: authUrl,
    example: "The URL will look like: https://developer.spotify.com/callback#access_token=BQA123abc...&token_type=Bearer",
    note: "The token will be valid for 1 hour"
  });
}