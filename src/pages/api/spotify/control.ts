import type { NextApiRequest, NextApiResponse } from 'next';
import { controlSpotifyPlayback } from '@/lib/spotify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { action, deviceId, value } = req.body;
    const spotifyAccessToken = process.env.SPOTIFY_ACCESS_TOKEN;

    if (!action) {
      return res.status(400).json({ message: 'Action is required' });
    }

    console.log(`Spotify control: ${action} = ${value || 'N/A'}`);

    if (!spotifyAccessToken) {
      // Mock response for demonstration
      console.log(`Mock Spotify control: ${action} executed`);
      res.status(200).json({ 
        success: true, 
        message: `Mock Spotify ${action} command executed`,
        mock: true 
      });
      return;
    }

    const success = await controlSpotifyPlayback(spotifyAccessToken, action, deviceId, value);

    if (success) {
      res.status(200).json({ 
        success: true, 
        message: `Successfully executed ${action}` 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: `Failed to execute ${action}` 
      });
    }
  } catch (error) {
    console.error('Error controlling Spotify:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error controlling Spotify playback',
      error: error.message 
    });
  }
}