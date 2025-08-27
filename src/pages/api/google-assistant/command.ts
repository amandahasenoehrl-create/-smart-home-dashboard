import type { NextApiRequest, NextApiResponse } from 'next';
import { executeVoiceCommand } from '@/lib/google-assistant';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { command, device, action, value } = req.body;

    if (!command) {
      return res.status(400).json({ message: 'Voice command required' });
    }

    // Execute the voice command (simulated for now)
    const result = await executeVoiceCommand(command);
    
    res.status(200).json({
      success: result.success,
      message: result.message,
      command: command,
      instructions: `Say to your Google Home/Assistant: "${command}"`
    });
  } catch (error) {
    console.error('Error processing voice command:', error);
    res.status(500).json({ message: 'Error processing voice command' });
  }
}