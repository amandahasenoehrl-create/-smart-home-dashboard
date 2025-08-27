import type { NextApiRequest, NextApiResponse } from 'next';
import { getSharkRobots, mockSharkRobot } from '@/lib/shark';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // For now, we'll return mock data since we don't have Shark credentials configured
    // In a real setup, this would use stored credentials to authenticate and fetch real devices
    const accessToken = process.env.SHARK_ACCESS_TOKEN;
    
    if (accessToken) {
      // Use real API with stored access token
      const robots = await getSharkRobots(accessToken);
      res.status(200).json({ devices: robots });
    } else {
      // Return mock data for demonstration
      console.log('No Shark credentials configured, returning mock data');
      res.status(200).json({ 
        devices: [mockSharkRobot],
        mock: true 
      });
    }
  } catch (error) {
    console.error('Error fetching Shark robots:', error);
    res.status(500).json({ message: 'Error fetching Shark robots' });
  }
}