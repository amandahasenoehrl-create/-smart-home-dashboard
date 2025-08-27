// Shark robot vacuum integration
// Using reverse-engineered Ayla Networks API (similar to sharkiqpy Python library)

export interface SharkRobot {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  online: boolean;
  status: {
    cleaning: boolean;
    docked: boolean;
    charging: boolean;
    batteryLevel: number; // 0-100
    cleaningMode: 'eco' | 'normal' | 'max';
    error?: string;
  };
  capabilities: {
    roomCleaning: boolean;
    selfEmpty: boolean;
    mapping: boolean;
  };
}

export interface SharkCredentials {
  username: string;
  password: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: number;
}

// Ayla Networks API endpoints used by Shark
const AYLA_API_BASE = 'https://sharkninja.aylanetworks.com/apiv1';

// Authentication with Ayla Networks (Shark's cloud service)
export async function authenticateShark(credentials: SharkCredentials): Promise<string | null> {
  try {
    const response = await fetch(`${AYLA_API_BASE}/users/sign_in`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        user: {
          email: credentials.username,
          password: credentials.password,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      return data.access_token;
    } else {
      console.error('Shark authentication failed:', response.status);
      return null;
    }
  } catch (error) {
    console.error('Error authenticating with Shark:', error);
    return null;
  }
}

// Get Shark robot devices
export async function getSharkRobots(accessToken: string): Promise<SharkRobot[]> {
  try {
    const response = await fetch(`${AYLA_API_BASE}/devices.json`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      const robots: SharkRobot[] = [];

      // Filter for Shark robot devices and parse their properties
      data.forEach((device: any) => {
        if (device.oem_model && device.oem_model.includes('shark')) {
          const robot: SharkRobot = {
            id: device.dsn,
            name: device.product_name || `Shark Robot ${device.dsn.slice(-4)}`,
            model: device.oem_model,
            serialNumber: device.dsn,
            online: device.connection_status === 'Online',
            status: {
              cleaning: false, // Will be populated from device properties
              docked: true,
              charging: false,
              batteryLevel: 50,
              cleaningMode: 'normal',
            },
            capabilities: {
              roomCleaning: true,
              selfEmpty: device.oem_model.includes('IQ') || device.oem_model.includes('Matrix'),
              mapping: true,
            },
          };

          // Parse device properties for status (this would need actual property mapping)
          if (device.properties) {
            device.properties.forEach((prop: any) => {
              switch (prop.name) {
                case 'operating_mode':
                  robot.status.cleaning = prop.value !== 0;
                  break;
                case 'dock_status':
                  robot.status.docked = prop.value === 1;
                  break;
                case 'battery_level':
                  robot.status.batteryLevel = prop.value || 50;
                  break;
              }
            });
          }

          robots.push(robot);
        }
      });

      return robots;
    }

    return [];
  } catch (error) {
    console.error('Error fetching Shark robots:', error);
    return [];
  }
}

// Control Shark robot
export async function controlSharkRobot(
  accessToken: string,
  robotId: string,
  command: 'start' | 'stop' | 'dock' | 'find' | 'mode',
  value?: any
): Promise<boolean> {
  try {
    let propertyName = '';
    let propertyValue: any = '';

    switch (command) {
      case 'start':
        propertyName = 'operating_mode';
        propertyValue = 1; // Start cleaning
        break;
      case 'stop':
        propertyName = 'operating_mode';
        propertyValue = 0; // Stop cleaning
        break;
      case 'dock':
        propertyName = 'operating_mode';
        propertyValue = 3; // Return to dock
        break;
      case 'find':
        propertyName = 'find_device';
        propertyValue = 1; // Make robot chirp
        break;
      case 'mode':
        propertyName = 'power_mode';
        propertyValue = value === 'eco' ? 0 : value === 'max' ? 2 : 1;
        break;
      default:
        throw new Error(`Unknown command: ${command}`);
    }

    const response = await fetch(`${AYLA_API_BASE}/dsns/${robotId}/properties/${propertyName}/datapoints.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        datapoint: {
          value: propertyValue,
        },
      }),
    });

    if (response.ok) {
      console.log(`Successfully controlled Shark robot: ${command}`);
      return true;
    } else {
      console.error(`Failed to control Shark robot: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.error('Error controlling Shark robot:', error);
    return false;
  }
}

// Room-specific cleaning (if supported)
export async function cleanRoom(
  accessToken: string,
  robotId: string,
  roomId: string
): Promise<boolean> {
  try {
    const response = await fetch(`${AYLA_API_BASE}/dsns/${robotId}/properties/room_list/datapoints.json`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        datapoint: {
          value: roomId,
        },
      }),
    });

    return response.ok;
  } catch (error) {
    console.error('Error starting room cleaning:', error);
    return false;
  }
}

// Mock data for testing (when no real credentials are provided)
export const mockSharkRobot: SharkRobot = {
  id: 'SHARK123456',
  name: 'Kitchen Shark Robot',
  model: 'Shark AI Ultra',
  serialNumber: 'SHARK123456',
  online: true,
  status: {
    cleaning: false,
    docked: true,
    charging: true,
    batteryLevel: 85,
    cleaningMode: 'normal',
  },
  capabilities: {
    roomCleaning: true,
    selfEmpty: true,
    mapping: true,
  },
};