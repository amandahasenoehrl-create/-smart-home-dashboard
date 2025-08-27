// Spotify Web API integration for smart home music control

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: Array<{ name: string; id: string }>;
  album: {
    name: string;
    images: Array<{ url: string; height: number; width: number }>;
  };
  duration_ms: number;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyDevice {
  id: string;
  is_active: boolean;
  is_private_session: boolean;
  is_restricted: boolean;
  name: string;
  type: string; // Computer, Smartphone, Speaker, etc.
  volume_percent: number;
  supports_volume: boolean;
}

export interface SpotifyPlaybackState {
  device: SpotifyDevice;
  repeat_state: 'off' | 'context' | 'track';
  shuffle_state: boolean;
  context: {
    type: string;
    uri: string;
  } | null;
  timestamp: number;
  progress_ms: number;
  is_playing: boolean;
  item: SpotifyTrack | null;
}

// Spotify API endpoints
const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

// Get current playback state
export async function getSpotifyPlaybackState(accessToken: string): Promise<SpotifyPlaybackState | null> {
  try {
    const response = await fetch(`${SPOTIFY_API_BASE}/me/player`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 204) {
      // No active device
      return null;
    }

    if (response.ok) {
      return await response.json();
    }

    console.error('Error getting Spotify playback state:', response.status);
    return null;
  } catch (error) {
    console.error('Error fetching Spotify playback state:', error);
    return null;
  }
}

// Get available Spotify devices
export async function getSpotifyDevices(accessToken: string): Promise<SpotifyDevice[]> {
  try {
    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/devices`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.devices || [];
    }

    console.error('Error getting Spotify devices:', response.status);
    return [];
  } catch (error) {
    console.error('Error fetching Spotify devices:', error);
    return [];
  }
}

// Control Spotify playback
export async function controlSpotifyPlayback(
  accessToken: string,
  action: 'play' | 'pause' | 'next' | 'previous' | 'volume' | 'transfer',
  deviceId?: string,
  value?: any
): Promise<boolean> {
  try {
    let url = '';
    let method = 'PUT';
    let body: any = null;

    const deviceParam = deviceId ? `?device_id=${deviceId}` : '';

    switch (action) {
      case 'play':
        url = `${SPOTIFY_API_BASE}/me/player/play${deviceParam}`;
        method = 'PUT';
        break;
      case 'pause':
        url = `${SPOTIFY_API_BASE}/me/player/pause${deviceParam}`;
        method = 'PUT';
        break;
      case 'next':
        url = `${SPOTIFY_API_BASE}/me/player/next${deviceParam}`;
        method = 'POST';
        break;
      case 'previous':
        url = `${SPOTIFY_API_BASE}/me/player/previous${deviceParam}`;
        method = 'POST';
        break;
      case 'volume':
        url = `${SPOTIFY_API_BASE}/me/player/volume?volume_percent=${value}${deviceId ? `&device_id=${deviceId}` : ''}`;
        method = 'PUT';
        break;
      case 'transfer':
        url = `${SPOTIFY_API_BASE}/me/player`;
        method = 'PUT';
        body = {
          device_ids: [deviceId],
          play: value || false,
        };
        break;
      default:
        throw new Error(`Unknown action: ${action}`);
    }

    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : null,
    });

    if (response.ok || response.status === 204) {
      console.log(`Successfully executed Spotify ${action}`);
      return true;
    } else {
      console.error(`Failed to execute Spotify ${action}:`, response.status);
      return false;
    }
  } catch (error) {
    console.error(`Error controlling Spotify ${action}:`, error);
    return false;
  }
}

// Get user's top tracks for quick access
export async function getSpotifyTopTracks(accessToken: string, limit = 10): Promise<SpotifyTrack[]> {
  try {
    const response = await fetch(`${SPOTIFY_API_BASE}/me/top/tracks?limit=${limit}&time_range=short_term`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data.items || [];
    }

    return [];
  } catch (error) {
    console.error('Error fetching top tracks:', error);
    return [];
  }
}

// Play specific track
export async function playSpotifyTrack(
  accessToken: string,
  trackUri: string,
  deviceId?: string
): Promise<boolean> {
  try {
    const deviceParam = deviceId ? `?device_id=${deviceId}` : '';
    
    const response = await fetch(`${SPOTIFY_API_BASE}/me/player/play${deviceParam}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        uris: [trackUri],
      }),
    });

    return response.ok || response.status === 204;
  } catch (error) {
    console.error('Error playing Spotify track:', error);
    return false;
  }
}

// Format duration from milliseconds to MM:SS
export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

// Get progress percentage
export function getProgressPercentage(progressMs: number, durationMs: number): number {
  if (!durationMs) return 0;
  return Math.min(100, (progressMs / durationMs) * 100);
}

// Mock data for testing when no Spotify access
export const mockSpotifyState: SpotifyPlaybackState = {
  device: {
    id: 'mock-device',
    is_active: true,
    is_private_session: false,
    is_restricted: false,
    name: 'Kitchen Display',
    type: 'Computer',
    volume_percent: 65,
    supports_volume: true,
  },
  repeat_state: 'off',
  shuffle_state: false,
  context: null,
  timestamp: Date.now(),
  progress_ms: 45000, // 45 seconds
  is_playing: true,
  item: {
    id: 'mock-track',
    name: 'Blinding Lights',
    artists: [{ name: 'The Weeknd', id: 'mock-artist' }],
    album: {
      name: 'After Hours',
      images: [
        {
          url: 'https://i.scdn.co/image/ab67616d0000b273ef6f8c9bf9b7e0c9d5f6f8b1',
          height: 640,
          width: 640,
        },
      ],
    },
    duration_ms: 200040, // 3:20
    external_urls: {
      spotify: 'https://open.spotify.com/track/mock',
    },
  },
};