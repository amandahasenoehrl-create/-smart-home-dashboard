import type { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const clientId = 'your_client_id_here'; // You'll need to create a Spotify app for this
  const redirectUri = encodeURIComponent('https://example.com/callback');
  const scopes = encodeURIComponent('user-read-playback-state user-modify-playback-state user-read-currently-playing streaming');
  
  const authUrl = `https://accounts.spotify.com/authorize?` +
    `response_type=code&` +
    `client_id=${clientId}&` +
    `scope=${scopes}&` +
    `redirect_uri=${redirectUri}&` +
    `state=123456`;

  res.redirect(authUrl);
}