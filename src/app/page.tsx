export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center px-6">
        <div className="bg-white rounded-3xl shadow-2xl p-12 border border-gray-200">
          <div className="mb-8">
            <div className="text-6xl mb-4">🏠</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Smart Home Dashboard
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Your connected home, calendar, and entertainment hub
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-8">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <div className="text-3xl mb-2">📅</div>
              <h3 className="font-bold text-lg mb-2">Calendar</h3>
              <p className="text-blue-100 text-sm">Schedule and events</p>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="text-3xl mb-2">💡</div>
              <h3 className="font-bold text-lg mb-2">Smart Lights</h3>
              <p className="text-purple-100 text-sm">Control your lighting</p>
            </div>
            
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <div className="text-3xl mb-2">🎵</div>
              <h3 className="font-bold text-lg mb-2">Music</h3>
              <p className="text-green-100 text-sm">Spotify integration</p>
            </div>
          </div>

          <div className="space-y-4">
            <a
              href="/dashboard"
              className="inline-block w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-8 rounded-full font-bold text-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Open Dashboard
            </a>
            
            <p className="text-gray-500 text-sm">
              🚀 Deployed successfully on Render!
            </p>
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span>Online</span>
              </div>
              <div>
                <span>Built with Next.js & Supabase</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}