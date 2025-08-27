import { google } from 'googleapis'

export async function getGoogleCalendarEvents(accessToken: string) {
  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: accessToken })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  try {
    const response = await calendar.events.list({
      calendarId: 'primary',
      timeMin: new Date().toISOString(),
      maxResults: 50,
      singleEvents: true,
      orderBy: 'startTime',
    })

    return response.data.items || []
  } catch (error) {
    console.error('Error fetching Google Calendar events:', error)
    return []
  }
}

export async function createGoogleCalendarEvent(
  accessToken: string, 
  event: {
    title: string
    description?: string
    start: string
    end: string
    location?: string
  }
) {
  const oauth2Client = new google.auth.OAuth2()
  oauth2Client.setCredentials({ access_token: accessToken })

  const calendar = google.calendar({ version: 'v3', auth: oauth2Client })

  try {
    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: {
        summary: event.title,
        description: event.description,
        location: event.location,
        start: {
          dateTime: event.start,
          timeZone: 'America/New_York', // Adjust to your timezone
        },
        end: {
          dateTime: event.end,
          timeZone: 'America/New_York', // Adjust to your timezone
        },
      },
    })

    return response.data
  } catch (error) {
    console.error('Error creating Google Calendar event:', error)
    throw error
  }
}