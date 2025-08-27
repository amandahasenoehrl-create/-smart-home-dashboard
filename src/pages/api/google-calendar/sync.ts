import type { NextApiRequest, NextApiResponse } from 'next'
import { getServerSession } from 'next-auth/next'
import { getGoogleCalendarEvents } from '@/lib/google-calendar'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const session = await getServerSession(req, res, {
      providers: [],
      secret: process.env.NEXTAUTH_SECRET,
    })

    if (!session?.accessToken) {
      return res.status(401).json({ message: 'Not authenticated' })
    }

    const events = await getGoogleCalendarEvents(session.accessToken as string)
    
    // Transform Google Calendar events to our format
    const transformedEvents = events.map(event => ({
      id: event.id,
      title: event.summary || 'Untitled Event',
      start: event.start?.dateTime || event.start?.date,
      end: event.end?.dateTime || event.end?.date,
      description: event.description,
      location: event.location,
      source: 'google'
    }))

    res.status(200).json({ events: transformedEvents })
  } catch (error) {
    console.error('Error syncing Google Calendar:', error)
    res.status(500).json({ message: 'Error syncing calendar' })
  }
}