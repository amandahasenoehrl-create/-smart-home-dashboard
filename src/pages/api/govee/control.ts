import type { NextApiRequest, NextApiResponse } from 'next';
import { controlGoveeDevice } from '@/lib/govee';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { device, model, command, value } = req.body;

    if (!device || !model || !command) {
      return res.status(400).json({ message: 'Missing required parameters' });
    }

    const result = await controlGoveeDevice(device, model, command, value);
    res.status(200).json(result);
  } catch (error) {
    console.error('Error controlling device:', error);
    res.status(500).json({ message: 'Error controlling device' });
  }
}