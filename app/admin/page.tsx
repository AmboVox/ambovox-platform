'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

export default function AdminPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase
        .from('users')
        .select('role, display_name, school_id')
        .eq('id', user.id)
        .single()
      if (!profile || profile.role !== 'admin') { router.push('/login'); return }
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
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar displayName={user.display_name} activePage="/admin" />
        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-6" style={{ color: '#C47A2C' }}>Admin Dashboard</h1>
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: 'Students', value: '0', sub: 'enrolled' },
              { label: 'Staff', value: '0', sub: 'active' },
              { label: 'Courses', value: '0', sub: 'this semester' },
              { label: 'Attendance', value: '0%', sub: 'today' },
              { label: 'Forms Pending', value: '0', sub: 'need attention' },
              { label: 'Training', value: '0', sub: 'overdue items' },
            ].map((card) => (
              <div key={card.label} className="bg-white rounded-lg p-5 border" style={{ borderColor: '#d0c4a0' }}>
                <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">{card.label}</div>
                <div className="text-3xl font-bold" style={{ color: '#C47A2C' }}>{card.value}</div>
                <div className="text-xs text-gray-400 mt-1">{card.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}