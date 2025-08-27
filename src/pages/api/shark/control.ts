import type { NextApiRequest, NextApiResponse } from 'next';
import { controlSharkRobot, cleanRoom } from '@/lib/shark';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { robotId, command, value, roomId } = req.body;
    const accessToken = process.env.SHARK_ACCESS_TOKEN;

    if (!robotId || !command) {
      return res.status(400).json({ message: 'Robot ID and command are required' });
    }

    console.log(`Shark robot control: ${robotId} - ${command} = ${value}`);

    if (!accessToken) {
      // Mock response for demonstration
      console.log(`Mock Shark control: ${command} executed`);
      res.status(200).json({ 
        success: true, 
        message: `Mock Shark robot ${command} command executed`,
        mock: true 
      });
      return;
    }

    let success = false;

    if (command === 'clean_room' && roomId) {
      success = await cleanRoom(accessToken, robotId, roomId);
    } else {
      success = await controlSharkRobot(accessToken, robotId, command, value);
    }

    if (success) {
      res.status(200).json({ 
        success: true, 
        message: `Successfully executed ${command} command` 
      });
    } else {
      res.status(500).json({ 
        success: false, 
        message: `Failed to execute ${command} command` 
      });
    }
  } catch (error) {
    console.error('Error controlling Shark robot:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Error controlling Shark robot',
      error: error.message 
    });
  }
}