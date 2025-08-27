'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useSession, signIn, signOut } from 'next-auth/react'

interface CalendarEvent {
  id: string
  title: string
  date: string
  type: 'meal' | 'task' | 'reminder'
  details: any
  priority?: string
  person?: string
}

interface DayEvents {
  [key: string]: CalendarEvent[]
}

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const [events, setEvents] = useState<DayEvents>({})
  const [showEventForm, setShowEventForm] = useState(false)
  const [goveeDevices, setGoveeDevices] = useState<any[]>([])
  const [aiDotDevices, setAiDotDevices] = useState<any[]>([])
  const [sharkRobots, setSharkRobots] = useState<any[]>([])
  const [spotifyPlayback, setSpotifyPlayback] = useState<any>(null)
  const [spotifyDevices, setSpotifyDevices] = useState<any[]>([])
  const [hueDevices, setHueDevices] = useState<any[]>([])
  const [hueAccessToken, setHueAccessToken] = useState<string | null>(null)
  const [showSmartHome, setShowSmartHome] = useState(false)
  const [isKioskMode, setIsKioskMode] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [lastVoiceCommand, setLastVoiceCommand] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    type: 'reminder' as 'meal' | 'task' | 'reminder',
    description: '',
    priority: 'medium',
    person: 'both'
  })

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

  const familyMembers = [
    { name: 'both', color: 'bg-blue-500', label: 'Both' },
    { name: 'you', color: 'bg-green-500', label: 'You' },
    { name: 'girlfriend', color: 'bg-pink-500', label: 'Girlfriend' }
  ]

  const { data: session, status } = useSession()

  useEffect(() => {
    fetchAllEvents()
    fetchGoveeDevices()
    fetchAiDotDevices()
    fetchSharkRobots()
    fetchSpotifyPlayback()
    fetchSpotifyDevices()
    
    // Check for Hue token in URL params (from OAuth callback)
    const urlParams = new URLSearchParams(window.location.search)
    const hueToken = urlParams.get('hue_token')
    
    if (hueToken) {
      localStorage.setItem('hue_access_token', hueToken)
      setHueAccessToken(hueToken)
      fetchHueDevices(hueToken)
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname)
    } else {
      // Load saved Hue access token from localStorage
      const savedToken = localStorage.getItem('hue_access_token')
      if (savedToken) {
        setHueAccessToken(savedToken)
        fetchHueDevices(savedToken)
      }
    }
  }, [currentDate])

  const fetchGoveeDevices = async () => {
    try {
      console.log('Fetching Govee devices...')
      const response = await fetch('/api/govee/devices')
      console.log('Response status:', response.status)
      const data = await response.json()
      console.log('Response data:', data)
      setGoveeDevices(data.devices || [])
    } catch (error) {
      console.error('Error fetching Govee devices:', error)
    }
  }

  const fetchAiDotDevices = async () => {
    try {
      const response = await fetch('/api/aidot/devices')
      const data = await response.json()
      setAiDotDevices(data.devices || [])
    } catch (error) {
      console.error('Error fetching AI Dot devices:', error)
    }
  }

  const fetchSharkRobots = async () => {
    try {
      const response = await fetch('/api/shark/devices')
      const data = await response.json()
      setSharkRobots(data.devices || [])
    } catch (error) {
      console.error('Error fetching Shark robots:', error)
    }
  }

  const fetchSpotifyPlayback = async () => {
    try {
      const response = await fetch('/api/spotify/playback')
      const data = await response.json()
      setSpotifyPlayback(data.playbackState)
    } catch (error) {
      console.error('Error fetching Spotify playback:', error)
    }
  }

  const fetchSpotifyDevices = async () => {
    try {
      const response = await fetch('/api/spotify/devices')
      const data = await response.json()
      setSpotifyDevices(data.devices || [])
    } catch (error) {
      console.error('Error fetching Spotify devices:', error)
    }
  }

  const fetchHueDevices = async (accessToken: string) => {
    try {
      const response = await fetch(`/api/hue/devices?accessToken=${accessToken}`)
      const data = await response.json()
      setHueDevices(data.devices || [])
    } catch (error) {
      console.error('Error fetching Hue devices:', error)
    }
  }

  const connectToHue = async () => {
    try {
      const response = await fetch('/api/hue/auth')
      const data = await response.json()
      window.open(data.authUrl, '_blank')
    } catch (error) {
      console.error('Error getting Hue auth URL:', error)
    }
  }

  const controlGoveeLight = async (device: string, model: string, command: string, value: any) => {
    try {
      await fetch('/api/govee/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device, model, command, value })
      })
      // Refresh devices to get updated state
      fetchGoveeDevices()
    } catch (error) {
      console.error('Error controlling light:', error)
    }
  }

  const controlAiDotLight = async (deviceIp: string, command: string, value: any) => {
    try {
      await fetch('/api/aidot/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceIp, command, value })
      })
      // Refresh devices to get updated state
      fetchAiDotDevices()
    } catch (error) {
      console.error('Error controlling AI Dot light:', error)
    }
  }

  const controlSharkRobot = async (robotId: string, command: string, value?: any, roomId?: string) => {
    try {
      await fetch('/api/shark/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ robotId, command, value, roomId })
      })
      // Refresh devices to get updated state
      fetchSharkRobots()
    } catch (error) {
      console.error('Error controlling Shark robot:', error)
    }
  }

  const controlSpotify = async (action: string, deviceId?: string, value?: any) => {
    try {
      await fetch('/api/spotify/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, deviceId, value })
      })
      // Refresh playback state
      setTimeout(() => fetchSpotifyPlayback(), 500) // Small delay for Spotify API
    } catch (error) {
      console.error('Error controlling Spotify:', error)
    }
  }

  const controlHueLight = async (deviceId: string, command: string, value: any) => {
    if (!hueAccessToken) return
    try {
      await fetch('/api/hue/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessToken: hueAccessToken, deviceId, command, value })
      })
      // Refresh devices to get updated state
      fetchHueDevices(hueAccessToken)
    } catch (error) {
      console.error('Error controlling Hue light:', error)
    }
  }

  const sendVoiceCommand = async (command: string) => {
    try {
      const response = await fetch('/api/google-assistant/command', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command })
      })
      const data = await response.json()
      setLastVoiceCommand(data.instructions || command)
      
      // Show the command for 5 seconds
      setTimeout(() => setLastVoiceCommand(''), 5000)
    } catch (error) {
      console.error('Error sending voice command:', error)
    }
  }

  const startVoiceListening = () => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Voice recognition not supported in this browser')
      return
    }

    const recognition = new (window as any).webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
    }

    recognition.onresult = (event: any) => {
      const command = event.results[0][0].transcript
      console.log('Voice command received:', command)
      sendVoiceCommand(command)
    }

    recognition.onerror = (event: any) => {
      console.error('Voice recognition error:', event.error)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsListening(false)
    }

    recognition.start()
  }

  const syncGoogleCalendar = async () => {
    if (!session?.accessToken) return

    try {
      const response = await fetch('/api/google-calendar/sync')
      const data = await response.json()
      
      if (data.events) {
        // Add Google Calendar events to our display
        const googleEvents: DayEvents = {}
        data.events.forEach((event: any) => {
          const eventDate = new Date(event.start).toISOString().split('T')[0]
          if (!googleEvents[eventDate]) googleEvents[eventDate] = []
          googleEvents[eventDate].push({
            id: `google-${event.id}`,
            title: event.title,
            date: eventDate,
            type: 'reminder',
            details: event,
            person: 'both' // You can modify this logic
          })
        })
        
        // Merge with existing events
        setEvents(prev => {
          const merged = { ...prev }
          Object.keys(googleEvents).forEach(date => {
            if (!merged[date]) merged[date] = []
            merged[date] = [...merged[date], ...googleEvents[date]]
          })
          return merged
        })
      }
    } catch (error) {
      console.error('Error syncing Google Calendar:', error)
    }
  }

  const fetchAllEvents = async () => {
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    
    // Fetch meals
    const { data: meals } = await supabase
      .from('meals')
      .select('*')
      .gte('meal_date', startOfMonth.toISOString().split('T')[0])
      .lte('meal_date', endOfMonth.toISOString().split('T')[0])

    // Fetch tasks with due dates
    const { data: tasks } = await supabase
      .from('renovation_tasks')
      .select('*')
      .not('due_date', 'is', null)
      .gte('due_date', startOfMonth.toISOString().split('T')[0])
      .lte('due_date', endOfMonth.toISOString().split('T')[0])

    // Combine events
    const allEvents: DayEvents = {}

    meals?.forEach(meal => {
      const dateKey = meal.meal_date
      if (!allEvents[dateKey]) allEvents[dateKey] = []
      allEvents[dateKey].push({
        id: meal.id,
        title: `${meal.meal_type}: ${meal.title}`,
        date: meal.meal_date,
        type: 'meal',
        details: meal
      })
    })

    tasks?.forEach(task => {
      const dateKey = task.due_date
      if (!allEvents[dateKey]) allEvents[dateKey] = []
      allEvents[dateKey].push({
        id: task.id,
        title: task.task_name,
        date: task.due_date,
        type: 'task',
        details: task,
        priority: task.priority
      })
    })

    setEvents(allEvents)
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days = []
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate)
      day.setDate(startDate.getDate() + i)
      days.push(day)
    }
    return days
  }

  const formatDateKey = (date: Date) => {
    return date.toISOString().split('T')[0]
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
    setSelectedDay(null)
  }

  const handleDayClick = (date: Date) => {
    const dateKey = formatDateKey(date)
    setSelectedDay(dateKey)
  }

  const addEvent = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (formData.type === 'meal') {
      await supabase.from('meals').insert([{
        title: formData.title,
        description: formData.description,
        meal_date: formData.date,
        meal_type: 'dinner',
        user_id: '00000000-0000-0000-0000-000000000000'
      }])
    } else if (formData.type === 'task') {
      await supabase.from('renovation_tasks').insert([{
        task_name: formData.title,
        description: formData.description,
        due_date: formData.date,
        priority: formData.priority,
        status: 'pending',
        room: 'other',
        user_id: '00000000-0000-0000-0000-000000000000'
      }])
    }

    setFormData({ title: '', date: '', type: 'reminder', description: '', priority: 'medium', person: 'both' })
    setShowEventForm(false)
    fetchAllEvents()
  }

  const getEventColor = (event: CalendarEvent) => {
    // Family member colors take priority
    if (event.person === 'you') return 'bg-green-500'
    if (event.person === 'girlfriend') return 'bg-pink-500'
    if (event.person === 'both') return 'bg-blue-500'
    
    // Default colors by type
    if (event.type === 'meal') return 'bg-blue-500'
    if (event.type === 'task') {
      switch (event.priority) {
        case 'urgent': return 'bg-red-500'
        case 'high': return 'bg-orange-500'
        case 'medium': return 'bg-yellow-500'
        default: return 'bg-purple-500'
      }
    }
    return 'bg-gray-500'
  }

  const enterKioskMode = () => {
    setIsKioskMode(true)
    // Request fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen()
    }
  }

  const exitKioskMode = () => {
    setIsKioskMode(false)
    // Exit fullscreen
    if (document.exitFullscreen) {
      document.exitFullscreen()
    }
  }

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsKioskMode(false)
      }
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  const days = getDaysInMonth()
  const selectedDayEvents = selectedDay ? events[selectedDay] || [] : []

  return (
    <div className="min-h-screen bg-white">
      <style jsx>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #06b6d4);
          cursor: pointer;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: linear-gradient(45deg, #8b5cf6, #06b6d4);
          cursor: pointer;
          border: none;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
        }
      `}</style>
      {/* Clean Header - Skylight Style */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateMonth('prev')}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-lg"
              >
                ←
              </button>
              <h1 className="text-3xl font-bold text-gray-900">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h1>
              <button
                onClick={() => navigateMonth('next')}
                className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 text-lg"
              >
                →
              </button>
            </div>
            <div className="flex items-center space-x-4">
              {!isKioskMode && (
                <>
                  {status === 'loading' ? (
                    <div className="text-gray-600">Loading...</div>
                  ) : session ? (
                    <>
                      <button
                        onClick={syncGoogleCalendar}
                        className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 font-medium text-sm"
                      >
                        🔄 Sync Google
                      </button>
                      <div className="text-sm text-gray-600">
                        Signed in as {session.user?.name}
                      </div>
                      <button
                        onClick={() => signOut()}
                        className="text-gray-600 hover:text-gray-800 text-sm"
                      >
                        Sign out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => signIn('google')}
                        className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 font-medium text-sm"
                      >
                        📱 Connect Google Calendar
                      </button>
                      <button
                        onClick={() => window.open('/api/spotify/final-auth', '_blank')}
                        className="bg-green-500 text-white px-4 py-2 rounded-full hover:bg-green-600 font-medium text-sm"
                      >
                        🎵 Get Spotify Token
                      </button>
                    </>
                  )}
                  
                  <button
                    onClick={() => setShowEventForm(true)}
                    className="bg-blue-500 text-white px-6 py-3 rounded-full hover:bg-blue-600 font-medium"
                  >
                    + Add Event
                  </button>
                  <a
                    href="/dashboard"
                    className="bg-gray-500 text-white px-6 py-3 rounded-full hover:bg-gray-600 font-medium"
                  >
                    Dashboard
                  </a>
                </>
              )}
              
              <button
                onClick={() => setShowSmartHome(!showSmartHome)}
                className="bg-purple-500 text-white px-6 py-3 rounded-full hover:bg-purple-600 font-medium"
              >
                🏠 Smart Home
              </button>

              {isKioskMode ? (
                <button
                  onClick={exitKioskMode}
                  className="bg-red-500 text-white px-6 py-3 rounded-full hover:bg-red-600 font-medium"
                >
                  Exit Kiosk
                </button>
              ) : (
                <button
                  onClick={enterKioskMode}
                  className="bg-orange-500 text-white px-6 py-3 rounded-full hover:bg-orange-600 font-medium"
                >
                  📺 Kiosk Mode
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Family Member Legend */}
        <div className="flex justify-center space-x-6 mb-8">
          {familyMembers.map(member => (
            <div key={member.name} className="flex items-center space-x-2">
              <div className={`w-4 h-4 rounded-full ${member.color}`}></div>
              <span className="text-gray-700 font-medium">{member.label}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid - Full Width Skylight Style */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          {/* Day Headers */}
          <div className="grid grid-cols-7 border-b border-gray-200">
            {dayNames.map(day => (
              <div key={day} className="text-center text-gray-600 font-semibold py-6 text-lg border-r border-gray-200 last:border-r-0">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7">
            {days.map((day, index) => {
              const dateKey = formatDateKey(day)
              const dayEvents = events[dateKey] || []
              const isSelected = selectedDay === dateKey
              const isToday_ = isToday(day)
              const isCurrentMonth_ = isCurrentMonth(day)
              
              return (
                <div
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={`
                    relative min-h-[140px] p-4 cursor-pointer transition-all border-r border-b border-gray-200 last:border-r-0
                    ${isCurrentMonth_ 
                      ? 'bg-white hover:bg-gray-50' 
                      : 'bg-gray-50 text-gray-400'
                    }
                    ${isToday_ ? 'bg-blue-50 border-blue-200' : ''}
                    ${isSelected ? 'bg-blue-100 border-blue-300' : ''}
                  `}
                >
                  {/* Date Number */}
                  <div className={`text-xl font-semibold mb-2 ${
                    isToday_ ? 'bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center' : 
                    isCurrentMonth_ ? 'text-gray-900' : 'text-gray-400'
                  }`}>
                    {day.getDate()}
                  </div>
                  
                  {/* Events */}
                  <div className="space-y-1">
                    {dayEvents.slice(0, 4).map(event => (
                      <div
                        key={event.id}
                        className={`text-sm px-2 py-1 rounded-md text-white font-medium truncate ${getEventColor(event)}`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 4 && (
                      <div className="text-xs text-gray-500 px-2">
                        +{dayEvents.length - 4} more
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {showSmartHome && (
          <div className="mt-8 bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl shadow-2xl border border-gray-700 overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-bold text-white mb-1">Smart Home</h3>
                  <p className="text-purple-100 text-sm">Control your connected devices</p>
                </div>
                <button
                  onClick={() => setShowSmartHome(false)}
                  className="text-white hover:text-purple-200 text-2xl bg-white/10 rounded-full w-10 h-10 flex items-center justify-center backdrop-blur-sm"
                >
                  ✕
                </button>
              </div>
            </div>

            <div className="p-6 space-y-8">
              <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 border border-gray-600">
                <div className="text-center">
                  <div className="text-4xl mb-3">⏳</div>
                  <p className="text-gray-300">Smart home controls will appear here when devices are connected.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Selected Day Details - Bottom Panel */}
        {selectedDay && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">
              {new Date(selectedDay).toLocaleDateString('en-US', { 
                weekday: 'long', 
                month: 'long', 
                day: 'numeric' 
              })}
            </h3>
            
            {selectedDayEvents.length === 0 ? (
              <p className="text-gray-500 text-lg">No events scheduled for this day</p>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedDayEvents.map(event => (
                  <div key={event.id} className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                    <div className="flex items-start space-x-3">
                      <div className={`w-4 h-4 rounded-full mt-1 ${getEventColor(event)}`}></div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 mb-1">{event.title}</h4>
                        <span className="text-sm text-gray-500 capitalize">{event.type}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Event Modal - Clean Skylight Style */}
      {showEventForm && !isKioskMode && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 p-8 w-full max-w-lg mx-4">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Add New Event</h3>
            <form onSubmit={addEvent} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Event Title</label>
                <input
                  type="text"
                  placeholder="What's happening?"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="meal">🍽️ Meal</option>
                    <option value="task">✅ Task</option>
                    <option value="reminder">📅 Reminder</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">For Who</label>
                  <select
                    value={formData.person}
                    onChange={(e) => setFormData({...formData, person: e.target.value})}
                    className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="both">👫 Both</option>
                    <option value="you">🙋‍♂️ You</option>
                    <option value="girlfriend">🙋‍♀️ Girlfriend</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description (Optional)</label>
                <textarea
                  placeholder="Add more details..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                />
              </div>

              <div className="flex space-x-4 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEventForm(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-full hover:bg-gray-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-full hover:bg-blue-600 font-medium"
                >
                  Add Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}