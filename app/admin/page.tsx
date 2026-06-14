'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('users')
        .select('role, display_name, school_id')
        .eq('id', user.id)
        .single()

      if (!profile || profile.role !== 'admin') {
        router.push('/login')
        return
      }

      setUser(profile)
      setLoading(false)
    }

    loadUser()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#F4EFE3' }}>
      <div style={{ height: '6px', background: 'linear-gradient(90deg, #275FA8 0% 25%, #8C1D2C 25% 50%, #2E6B4A 50% 75%, #C47A2C 75% 100%)' }} />
      <div className="flex h-screen">
        <div style={{ width: '220px', background: '#5B2C83' }} className="flex flex-col">
          <div className="p-4 text-center border-b border-yellow-600 border-opacity-30">
            <div className="text-white font-bold text-sm">Rex Christus Academy</div>
            <div className="text-xs mt-1" style={{ color: '#C47A2C' }}>Administration</div>
            <div className="text-xs mt-1 italic" style={{ color: 'rgba(201,163,58,0.6)' }}>No King But Christ</div>
          </div>
          <nav className="flex-1 p-3">
            <a href="/admin" className="flex items-center px-3 py-2 rounded text-sm mb-1" style={{ color: 'rgba(244,239,227,0.75)' }}>Dashboard</a>
            <a href="/admin/students" className="flex items-center px-3 py-2 rounded text-sm mb-1" style={{ color: 'rgba(244,239,227,0.75)' }}>Students</a>
            <a href="/admin/staff" className="flex items-center px-3 py-2 rounded text-sm mb-1" style={{ color: 'rgba(244,239,227,0.75)' }}>Staff</a>
            <a href="/admin/curriculum" className="flex items-center px-3 py-2 rounded text-sm mb-1" style={{ color: 'rgba(244,239,227,0.75)' }}>Curriculum</a>
            <a href="/admin/calendar" className="flex items-center px-3 py-2 rounded text-sm mb-1" style={{ color: 'rgba(244,239,227,0.75)' }}>Calendar</a>
            <a href="/admin/announcements" className="flex items-center px-3 py-2 rounded text-sm mb-1" style={{ color: 'rgba(244,239,227,0.75)' }}>Announcements</a>
            <a href="/admin/forms" className="flex items-center px-3 py-2 rounded text-sm mb-1" style={{ color: 'rgba(244,239,227,0.75)' }}>Forms and Payments</a>
            <a href="/admin/prayer" className="flex items-center px-3 py-2 rounded text-sm mb-1" style={{ color: 'rgba(244,239,227,0.75)' }}>Prayer Board</a>
            <a href="/admin/messages" className="flex items-center px-3 py-2 rounded text-sm mb-1" style={{ color: 'rgba(244,239,227,0.75)' }}>Messages</a>
            <a href="/admin/training" className="flex items-center px-3 py-2 rounded text-sm mb-1" style={{ color: 'rgba(244,239,227,0.75)' }}>Training</a>
            <a href="/admin/settings" className="flex items-center px-3 py-2 rounded text-sm mb-1" style={{ color: 'rgba(244,239,227,0.75)' }}>Settings</a>
          </nav>
         <div className="p-3 border-t border-yellow-600 border-opacity-30">
            <div className="text-xs font-semibold" style={{ color: '#F4EFE3' }}>{user.display_name}</div>
            <div className="text-xs" style={{ color: '#C47A2C' }}>Administrator</div>
            <button
              onClick={async () => {
                const supabase = createClient()
                await supabase.auth.signOut()
                window.location.href = '/login'
              }}
              className="mt-2 text-xs w-full text-left"
              style={{ color: 'rgba(244,239,227,0.5)' }}
            >
              Sign out
            </button>
          </div>
        </div>
        <div className="flex-1 p-8">
          <h1 className="text-2xl font-bold mb-6" style={{ color: '#C47A2C' }}>Admin Dashboard</h1>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-5 border" style={{ borderColor: '#d0c4a0' }}>
              <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Students</div>
              <div className="text-3xl font-bold" style={{ color: '#C47A2C' }}>0</div>
              <div className="text-xs text-gray-400 mt-1">enrolled</div>
            </div>
            <div className="bg-white rounded-lg p-5 border" style={{ borderColor: '#d0c4a0' }}>
              <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Staff</div>
              <div className="text-3xl font-bold" style={{ color: '#C47A2C' }}>0</div>
              <div className="text-xs text-gray-400 mt-1">active</div>
            </div>
            <div className="bg-white rounded-lg p-5 border" style={{ borderColor: '#d0c4a0' }}>
              <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">Courses</div>
              <div className="text-3xl font-bold" style={{ color: '#C47A2C' }}>0</div>
              <div className="text-xs text-gray-400 mt-1">this semester</div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ height: '6px', background: 'linear-gradient(90deg, #275FA8 0% 25%, #8C1D2C 25% 50%, #2E6B4A 50% 75%, #C47A2C 75% 100%)' }} />
    </div>
  )
}
