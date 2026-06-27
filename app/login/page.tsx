'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')

    const supabase = createClient()

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      setError('Invalid email or password. Please try again.')
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (!profile) {
      setError('Account setup incomplete. Please contact your administrator.')
      setLoading(false)
      return
    }

    if (profile.role === 'admin') {
      window.location.href = '/admin'
    } else if (profile.role === 'teacher' || profile.role === 'teaching_assistant') {
      window.location.href = '/teacher'
    } else if (profile.role === 'parent') {
      window.location.href = '/parent'
    } else if (profile.role === 'student') {
      const { data: studentProfile } = await supabase
        .from('student_profiles')
        .select('ui_tier')
        .eq('user_id', authData.user.id)
        .single()
      const tier = studentProfile?.ui_tier || 'high'
      window.location.href = `/student/${tier}`
    } else {
      window.location.href = '/admin'
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <div className="bg-white border border-yellow-600 rounded-lg p-8 w-96 shadow-lg">
        <div className="text-center mb-6">
          <img src="/ambovox-logo.png" alt="Ambovox" className="mx-auto mb-3" style={{ width: '220px', height: 'auto' }} />
          <p className="text-sm text-yellow-700 mt-1 uppercase tracking-widest">School Platform</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2 mb-4">{error}</div>
        )}

        <div className="mb-4">
          <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wide mb-1">Email</label>
          <input
            id="email"
            type="email"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-700"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wide mb-1">Password</label>
          <input
            id="password"
            type="password"
            className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-purple-700"
            placeholder="Enter your password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-yellow-700 text-white py-2 rounded font-semibold text-sm hover:opacity-90 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </div>
    </div>
  )
}