export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center"
      style={{ background: '#F4EFE3' }}>
      <div className="bg-white border border-yellow-600 rounded-lg p-8 w-96 shadow-lg">
        <div className="text-center mb-6">
          <img
            src="/ambovox-logo.png"
            alt="Ambovox"
            className="mx-auto mb-3"
            style={{ width: '220px', height: 'auto' }}
          />
          <p className="text-sm text-yellow-700 mt-1 uppercase tracking-widest">
            School Platform
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
            Username
          </label>
          <input
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-700"
            placeholder="Enter your username"
          />
        </div>
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wide mb-1">
            Password
          </label>
          <input
            type="password"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-700"
            placeholder="Enter your password"
          />
        </div>
        <button className="w-full bg-yellow-700 text-white py-2 rounded font-semibold text-sm hover:opacity-90">
          Sign In
        </button>
      </div>
    </div>
  )
}