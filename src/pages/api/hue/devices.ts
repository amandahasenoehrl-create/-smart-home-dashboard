import type { NextApiRequest, NextApiResponse } from 'next';
import { getHueDevices } from '@/lib/philips-hue';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { accessToken } = req.query;
    
    if (!accessToken || typeof accessToken !== 'string') {
      return res.status(400).json({ message: 'Access token required' });
    }

    const devices = await getHueDevices(accessToken);
    res.status(200).json({ devices });
  } catch (error) {
    console.error('Error fetching Hue devices:', error);
    res.status(500).json({ message: 'Error fetching Hue devices' });
  }
}