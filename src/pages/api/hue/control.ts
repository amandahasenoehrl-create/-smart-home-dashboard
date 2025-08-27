import type { NextApiRequest, NextApiResponse } from 'next';
import { controlHueDevice } from '@/lib/philips-hue';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { accessToken, deviceId, command, value } = req.body;

    if (!accessToken || !deviceId || !command) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const result = await controlHueDevice(accessToken, deviceId, command, value);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error controlling Hue device:', error);
    res.status(500).json({ message: 'Error controlling Hue device' });
  }
}