import type { NextApiRequest, NextApiResponse } from 'next';
import { getSpotifyDevices } from '@/lib/spotify';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const spotifyAccessToken = process.env.SPOTIFY_ACCESS_TOKEN;
    
    if (spotifyAccessToken) {
      // Use real Spotify API
      const devices = await getSpotifyDevices(spotifyAccessToken);
      res.status(200).json({ devices });
    } else {
      // Return mock devices for demonstration
      const mockDevices = [
        {
          id: 'mock-kitchen-display',
          is_active: true,
          is_private_session: false,
          is_restricted: false,
          name: 'Kitchen Surface Pro',
          type: 'Computer',
          volume_percent: 65,
          supports_volume: true,
        },
        {
          id: 'mock-phone',
          is_active: false,
          is_private_session: false,
          is_restricted: false,
          name: 'Amanda\'s Phone',
          type: 'Smartphone',
          volume_percent: 80,
          supports_volume: true,
        },
        {
          id: 'mock-speaker',
          is_active: false,
          is_private_session: false,
          is_restricted: false,
          name: 'Living Room Speaker',
          type: 'Speaker',
          volume_percent: 45,
          supports_volume: true,
        },
      ];
      
      res.status(200).json({ 
        devices: mockDevices,
        mock: true 
      });
    }
  } catch (error) {
    console.error('Error fetching Spotify devices:', error);
    res.status(500).json({ message: 'Error fetching Spotify devices' });
  }
}