import type { NextApiRequest, NextApiResponse } from 'next';
import { getSpotifyPlaybackState, mockSpotifyState } from '@/lib/spotify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Check for manual Spotify token in environment (for testing)
    const manualSpotifyToken = process.env.SPOTIFY_ACCESS_TOKEN;
    
    if (manualSpotifyToken) {
      // Use real Spotify API with manual token
      const playbackState = await getSpotifyPlaybackState(manualSpotifyToken);
      res.status(200).json({ playbackState, source: 'manual_token' });
    } else {
      // Return mock data for demonstration
      console.log('No Spotify access token configured, returning mock data');
      res.status(200).json({ 
        playbackState: mockSpotifyState,
        mock: true 
      });
    }
  } catch (error) {
    console.error('Error fetching Spotify playback state:', error);
    res.status(500).json({ message: 'Error fetching Spotify playback state' });
  }
}