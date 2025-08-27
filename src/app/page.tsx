export default function Home() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Smart Home Dashboard
        </h1>
        <p className="text-gray-600 mb-8">
          Successfully deployed on Render!
        </p>
        <div className="w-16 h-16 bg-green-500 rounded-full mx-auto flex items-center justify-center">
          <span className="text-white text-2xl">✓</span>
        </div>
      </div>
    </div>
  );
}