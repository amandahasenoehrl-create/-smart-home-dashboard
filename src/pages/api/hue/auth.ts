import type { NextApiRequest, NextApiResponse } from 'next';
import { getHueAuthUrl } from '@/lib/philips-hue';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const authUrl = await getHueAuthUrl();
    res.status(200).json({ authUrl });
  } catch (error) {
    console.error('Error getting Hue auth URL:', error);
    res.status(500).json({ message: 'Error getting auth URL' });
  }
}