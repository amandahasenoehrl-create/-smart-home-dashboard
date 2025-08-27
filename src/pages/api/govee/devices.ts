import type { NextApiRequest, NextApiResponse } from 'next';
import { getGoveeDevices } from '@/lib/govee';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('API Key loaded:', process.env.GOVEE_API_KEY?.substring(0, 8) + '...');
    const devices = await getGoveeDevices();
    console.log('Devices returned:', devices.length);
    res.status(200).json({ devices });
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ message: 'Error fetching devices', error: error.message });
  }
}