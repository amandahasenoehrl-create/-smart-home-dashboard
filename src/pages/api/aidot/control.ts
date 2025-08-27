import type { NextApiRequest, NextApiResponse } from 'next';
import { controlAiDotDevice } from '@/lib/aidot';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { deviceIp, command, value } = req.body;

    if (!deviceIp || !command) {
      return res.status(400).json({ message: 'Device IP and command are required' });
    }

    console.log(`AI Dot control request: ${deviceIp} - ${command} = ${JSON.stringify(value)}`);

    const success = await controlAiDotDevice(deviceIp, command, value);

    if (success) {
      res.status(200).json({ 
        success: true, 
        message: `Successfully controlled AI Dot device: ${command}` 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: `Failed to control AI Dot device: ${command}` 
      });
    }
  } catch (error) {
    console.error('Error controlling AI Dot device:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error controlling AI Dot device',
      error: error.message 
    });
  }
}