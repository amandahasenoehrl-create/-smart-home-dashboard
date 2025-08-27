import type { NextApiRequest, NextApiResponse } from 'next';
import { getHueAccessToken } from '@/lib/philips-hue';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { code } = req.query;
    
    if (!code || typeof code !== 'string') {
      return res.status(400).json({ message: 'Authorization code required' });
    }

    const accessToken = await getHueAccessToken(code);
    
    if (accessToken) {
      // Redirect back to the main page with the access token
      res.redirect(`/?hue_token=${accessToken}`);
    } else {
      res.redirect('/?error=hue_auth_failed');
    }
  } catch (error) {
    console.error('Error in Hue callback:', error);
    res.redirect('/?error=hue_auth_error');
  }
}