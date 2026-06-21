'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const TRAINING_ITEMS = [
  { id: 1, type: 'document', tier: 'Read & Sign', title: 'Flipped Classroom Policy Update — Spring 2026', deadline: 'May 30, 2026', overdue: true, completed: false },
  { id: 2, type: 'quiz', tier: 'Quiz Required', title: 'Assessment Integrity & Parent Verification Protocol', deadline: 'Jun 5, 2026', overdue: false, completed: false },
]

export default function CompleteTrainingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [openId, setOpenId] = useState<number|null>(null)
  const [signUser, setSignUser] = useState('')
  const [signPass, setSignPass] = useState('')
  const [items, setItems] = useState(TRAINING_ITEMS)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('users').select('role, display_name').eq('id', user.id).single()
      if (!profile || (profile.role !== 'teacher' && profile.role !== 'teaching_assistant')) { router.push('/login'); return }
      setUser(profile)
      setLoading(false)
    }
    load()
  }, [])

  function signOff(id: number) {
    if (!signUser || !signPass) return
    setItems(items.map(i => i.id === id ? { ...i, completed: true, overdue: false } : i))
    setOpenId(null)
    setSignUser('')
    setSignPass('')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )

  const isTA = user.role === 'teaching_assistant'
  const pending = items.filter(i => !i.completed)
  const overdue = pending.filter(i => i.overdue)

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <TeacherSidebar displayName={user.display_name} isTA={isTA} activePage="/teacher/training" badges={{ training: pending.length, calendar: 2, announcements: 1, messages: 3 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-2" style={{ color: '#2E6B4A' }}>Complete This Training</h1>
          <p style={{ fontSize: '12px', color: '#888', marginBottom: '16px' }}>Items assigned to you requiring sign-off, with or without a quiz.</p>

          {overdue.length > 0 && (
            <div style={{ background: '#8C1D2C', color: 'white', padding: '10px 16px', borderRadius: '6px', fontSize: '12px', marginBottom: '16px' }}>
              ⚠ You have {overdue.length} overdue item{overdue.length > 1 ? 's' : ''}. Please complete as soon as possible.
            </div>
          )}

          <div className="flex flex-col gap-3">
            {items.map(item => (
              <div key={item.id} className="bg-white rounded-lg border p-4" style={{ borderColor: '#d0c4a0', opacity: item.completed ? 0.6 : 1 }}>
                <div className="flex items-start justify-between gap-4 mb-2">
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '2px' }}>
                      <span>{item.type === 'quiz' ? '📝' : '📄'}</span>
                      <span style={{ fontWeight: '700', fontSize: '13px', color: '#5B2C83' }}>{item.title}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: '#888' }}>{item.tier} · Due {item.deadline}</div>
                  </div>
                  {item.overdue && !item.completed && (
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '700', background: '#8C1D2C', color: 'white' }}>Overdue</span>
                  )}
                  {item.completed && (
                    <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '700', background: '#d4edda', color: '#155724' }}>✓ Complete</span>
                  )}
                </div>

                {!item.completed && openId !== item.id && (
                  <button onClick={() => setOpenId(item.id)} style={{ padding: '6px 16px', background: '#2E6B4A', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Open →</button>
                )}

                {openId === item.id && (
                  <div style={{ border: '1.5px solid #C9A33A', borderRadius: '8px', padding: '14px', background: '#f9f6ee', marginTop: '8px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', marginBottom: '6px' }}>🛡 Acknowledgment & Sign-off</div>
                    <p style={{ fontSize: '11px', color: '#888', marginBottom: '10px' }}>Enter your credentials to confirm you have read and understood this document.</p>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <input placeholder="Username" value={signUser} onChange={(e) => setSignUser(e.target.value)} onPaste={(e) => e.preventDefault()} style={{ padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
                      <input placeholder="Password" type="password" value={signPass} onChange={(e) => setSignPass(e.target.value)} onPaste={(e) => e.preventDefault()} style={{ padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
                    </div>
                    <button onClick={() => signOff(item.id)} style={{ padding: '7px 16px', background: '#C9A33A', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Sign & Complete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}