const GOVEE_API_KEY = process.env.GOVEE_API_KEY;
const GOVEE_API_BASE = 'https://developer-api.govee.com/v1';

export interface GoveeDevice {
  device: string;
  model: string;
  deviceName: string;
  controllable: boolean;
  retrievable: boolean;
  supportCmds: string[];
  properties: any;
}

export async function getGoveeDevices(): Promise<GoveeDevice[]> {
  try {
    const response = await fetch(`${GOVEE_API_BASE}/devices`, {
      headers: {
        'Govee-API-Key': GOVEE_API_KEY!,
      },
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Govee API error:', response.status, errorText);
      return [];
    }

    const data = await response.json();
    console.log('Full Govee API response:', JSON.stringify(data, null, 2));
    return data.data?.devices || [];
  } catch (error) {
    console.error('Error fetching Govee devices:', error);
    return [];
  }
}

export async function controlGoveeDevice(
  device: string,
  model: string,
  command: 'turn' | 'brightness' | 'color' | 'colorTem',
  value: any
) {
  try {
    const body = {
      device,
      model,
      cmd: {
        name: command,
        value: value
      }
    };

    const response = await fetch(`${GOVEE_API_BASE}/devices/control`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Govee-API-Key': GOVEE_API_KEY!,
      },
      body: JSON.stringify(body),
    });

    return await response.json();
  } catch (error) {
    console.error('Error controlling Govee device:', error);
    throw error;
  }
}

export async function getGoveeDeviceState(device: string, model: string) {
  try {
    const response = await fetch(
      `${GOVEE_API_BASE}/devices/state?device=${device}&model=${model}`,
      {
        headers: {
          'Govee-API-Key': GOVEE_API_KEY!,
        },
      }
    );

    return await response.json();
  } catch (error) {
    console.error('Error getting Govee device state:', error);
    return null;
  }
}