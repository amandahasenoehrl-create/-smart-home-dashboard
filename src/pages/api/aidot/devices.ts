import type { NextApiRequest, NextApiResponse } from 'next';
import { discoverAiDotDevices, getAiDotDeviceState } from '@/lib/aidot';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Manually configured AI Dot device IPs found from network scan
    const manualDevices = [
      '192.168.4.41',  // Potential AI Dot device 1
      '192.168.4.52',  // Potential AI Dot device 2
    ];

    const devices = [];

    // Try to get state from each manually configured device
    for (const deviceIp of manualDevices) {
      try {
        const deviceState = await getAiDotDeviceState(deviceIp);
        if (deviceState) {
          devices.push(deviceState);
        }
      } catch (error) {
        console.log(`Device at ${deviceIp} not reachable`);
      }
    }

    // Also try auto-discovery (will be empty for now)
    const discoveredDevices = await discoverAiDotDevices();
    devices.push(...discoveredDevices);

    res.status(200).json({ devices });
  } catch (error) {
    console.error('Error fetching AI Dot devices:', error);
    res.status(500).json({ message: 'Error fetching AI Dot devices' });
  }
}