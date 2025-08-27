// AI Dot smart lights integration
// Using community-reverse-engineered API methods

export interface AiDotDevice {
  id: string;
  name: string;
  ip: string;
  model: string;
  type: 'bulb' | 'strip' | 'panel';
  online: boolean;
  state: {
    on: boolean;
    brightness: number; // 0-100
    color?: {
      r: number;
      g: number;
      b: number;
    };
    temperature?: number; // Color temperature in Kelvin
  };
}

// Local network device discovery
export async function discoverAiDotDevices(): Promise<AiDotDevice[]> {
  try {
    // This would typically scan the local network for AI Dot devices
    // For now, we'll return mock data and let users manually add devices
    console.log('Scanning for AI Dot devices on local network...');
    
    // In a real implementation, this would:
    // 1. Scan network range (192.168.x.x)
    // 2. Check for AI Dot device signatures
    // 3. Query device info from each found device
    
    return [];
  } catch (error) {
    console.error('Error discovering AI Dot devices:', error);
    return [];
  }
}

// Control AI Dot device via local network API
export async function controlAiDotDevice(
  deviceIp: string,
  command: 'power' | 'brightness' | 'color' | 'temperature',
  value: any
): Promise<boolean> {
  try {
    let endpoint = '';
    let payload = {};

    switch (command) {
      case 'power':
        endpoint = '/api/power';
        payload = { on: value };
        break;
      case 'brightness':
        endpoint = '/api/brightness';
        payload = { brightness: Math.max(0, Math.min(100, value)) };
        break;
      case 'color':
        endpoint = '/api/color';
        payload = { 
          r: value.r || 255, 
          g: value.g || 255, 
          b: value.b || 255 
        };
        break;
      case 'temperature':
        endpoint = '/api/temperature';
        payload = { temperature: value };
        break;
      default:
        throw new Error(`Unknown command: ${command}`);
    }

    console.log(`Controlling AI Dot device at ${deviceIp}${endpoint}`, payload);

    // Make the API call to the device
    const response = await fetch(`http://${deviceIp}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      timeout: 5000, // 5 second timeout
    });

    if (response.ok) {
      console.log(`Successfully controlled AI Dot device: ${command} = ${JSON.stringify(value)}`);
      return true;
    } else {
      console.error(`Failed to control AI Dot device: ${response.status} ${response.statusText}`);
      return false;
    }
  } catch (error) {
    console.error('Error controlling AI Dot device:', error);
    return false;
  }
}

// Get device state
export async function getAiDotDeviceState(deviceIp: string): Promise<AiDotDevice | null> {
  try {
    const response = await fetch(`http://${deviceIp}/api/status`, {
      method: 'GET',
      timeout: 5000,
    });

    if (response.ok) {
      const data = await response.json();
      return {
        id: data.id || deviceIp.replace(/\./g, '_'),
        name: data.name || `AI Dot Light (${deviceIp})`,
        ip: deviceIp,
        model: data.model || 'Unknown',
        type: data.type || 'bulb',
        online: true,
        state: {
          on: data.state?.on || false,
          brightness: data.state?.brightness || 50,
          color: data.state?.color,
          temperature: data.state?.temperature,
        },
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting AI Dot device state:', error);
    return null;
  }
}

// Manual device configuration (since we can't auto-discover easily)
export interface AiDotDeviceConfig {
  name: string;
  ip: string;
  type: 'bulb' | 'strip' | 'panel';
}

// Common AI Dot device presets
export const AIDOT_PRESETS = {
  scenes: {
    energize: { r: 255, g: 255, b: 255, brightness: 100 }, // Bright white
    relax: { r: 255, g: 180, b: 120, brightness: 30 }, // Warm dim
    focus: { r: 255, g: 255, b: 255, brightness: 80, temperature: 6500 }, // Cool white
    sunset: { r: 255, g: 100, b: 50, brightness: 60 }, // Warm orange
    ocean: { r: 0, g: 150, b: 255, brightness: 70 }, // Ocean blue
    forest: { r: 50, g: 255, b: 100, brightness: 65 }, // Forest green
  },
  temperatures: {
    warm: 2700, // Warm white
    neutral: 4000, // Neutral white  
    cool: 6500, // Cool white
  }
};