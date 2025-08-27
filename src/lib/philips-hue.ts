const HUE_CLIENT_ID = process.env.HUE_CLIENT_ID;
const HUE_CLIENT_SECRET = process.env.HUE_CLIENT_SECRET;
const HUE_API_BASE = 'https://api.meethue.com';

export interface HueDevice {
  id: string;
  id_v1?: string;
  metadata: {
    name: string;
    archetype: string;
  };
  on?: {
    on: boolean;
  };
  dimming?: {
    brightness: number;
  };
  color?: {
    xy: { x: number; y: number };
  };
  type: string;
}

export async function getHueAuthUrl(): Promise<string> {
  const params = new URLSearchParams({
    client_id: HUE_CLIENT_ID!,
    response_type: 'code',
    scope: 'read write',
    redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/hue`,
  });
  
  return `${HUE_API_BASE}/v2/oauth2/authorize?${params.toString()}`;
}

export async function getHueAccessToken(code: string): Promise<string | null> {
  try {
    const response = await fetch(`${HUE_API_BASE}/v2/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        client_id: HUE_CLIENT_ID!,
        client_secret: HUE_CLIENT_SECRET!,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/auth/callback/hue`,
      }),
    });

    const data = await response.json();
    return data.access_token || null;
  } catch (error) {
    console.error('Error getting Hue access token:', error);
    return null;
  }
}

export async function getHueDevices(accessToken: string): Promise<HueDevice[]> {
  try {
    const response = await fetch(`${HUE_API_BASE}/route/api/0/lights`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'hue-application-key': accessToken,
      },
    });

    const data = await response.json();
    return Object.entries(data || {}).map(([id, device]: [string, any]) => ({
      id,
      metadata: {
        name: device.name || `Light ${id}`,
        archetype: device.type || 'light',
      },
      on: {
        on: device.state?.on || false,
      },
      dimming: {
        brightness: Math.round((device.state?.bri || 0) / 254 * 100),
      },
      type: 'light',
    }));
  } catch (error) {
    console.error('Error fetching Hue devices:', error);
    return [];
  }
}

export async function controlHueDevice(
  accessToken: string,
  deviceId: string,
  command: 'on' | 'brightness' | 'color',
  value: any
) {
  try {
    let body: any = {};
    
    if (command === 'on') {
      body = { on: value };
    } else if (command === 'brightness') {
      body = { bri: Math.round(value * 254 / 100) };
    } else if (command === 'color') {
      // Convert RGB to XY color space (simplified)
      const { r, g, b } = value;
      const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / (r + g + b);
      const y = (0.2126 * r + 0.7152 * g + 0.0722 * b) / (r + g + b);
      body = { xy: [x, y] };
    }

    const response = await fetch(`${HUE_API_BASE}/route/api/0/lights/${deviceId}/state`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'hue-application-key': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    return await response.json();
  } catch (error) {
    console.error('Error controlling Hue device:', error);
    throw error;
  }
}