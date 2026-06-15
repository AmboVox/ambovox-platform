'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const GRADES = [0,1,2,3,4,5,6,7,8,9,10,11,12]
const GRADE_LABELS: Record<number, string> = {0:'K',1:'1',2:'2',3:'3',4:'4',5:'5',6:'6',7:'7',8:'8',9:'9',10:'10',11:'11',12:'12'}
const ROLES = ['students','parents','teachers','staff']
const LEVELS = [{label:'Elementary (K-5)', grades:[0,1,2,3,4,5]},{label:'Middle School (6-8)', grades:[6,7,8]},{label:'High School (9-12)', grades:[9,10,11,12]}]

export default function AnnouncementsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [priority, setPriority] = useState('normal')
  const [selectedRoles, setSelectedRoles] = useState<string[]>([])
  const [selectedGrades, setSelectedGrades] = useState<number[]>([])
  const [sending, setSending] = useState(false)
  const [announcements, setAnnouncements] = useState<any[]>([])
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('users').select('role, display_name, school_id').eq('id', user.id).single()
      if (!profile || profile.role !== 'admin') { router.push('/login'); return }
      setUser(profile)
      setLoading(false)
    }
    load()
  }, [])

  function toggleRole(role: string) {
    setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role])
  }

  function toggleGrade(grade: number) {
    setSelectedGrades(prev => prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade])
  }

  function toggleLevel(grades: number[]) {
    const allSelected = grades.every(g => selectedGrades.includes(g))
    if (allSelected) {
      setSelectedGrades(prev => prev.filter(g => !grades.includes(g)))
    } else {
      setSelectedGrades(prev => [...new Set([...prev, ...grades])])
    }
  }

  function selectEveryone() {
    setSelectedRoles(['students','parents','teachers','staff'])
    setSelectedGrades([0,1,2,3,4,5,6,7,8,9,10,11,12])
  }

  function clearAll() {
    setSelectedRoles([])
    setSelectedGrades([])
  }

  const hasSelection = selectedRoles.length > 0 || selectedGrades.length > 0
  const canSend = title && message && hasSelection

  async function sendAnnouncement() {
    if (!canSend) return
    setSending(true)
    const newAnnouncement = {
      id: Date.now(),
      title,
      content: message,
      priority,
      roles: selectedRoles,
      grades: selectedGrades,
      sent_by: user.display_name,
      sent_at: new Date().toLocaleString(),
    }
    setAnnouncements([newAnnouncement, ...announcements])
    setTitle('')
    setMessage('')
    setSelectedRoles([])
    setSelectedGrades([])
    setSending(false)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )

  return (
    <div className="min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex h-screen">
      <AdminSidebar displayName={user.display_name} activePage="/admin/announcements" />

        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-6" style={{ color: '#C47A2C' }}>Announcements</h1>

          <div className="bg-white rounded-lg border p-6 mb-6" style={{ borderColor: '#d0c4a0' }}>
            <h2 className="font-bold text-purple-900 mb-4">New Announcement</h2>

            <div className="mb-3">
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Title</label>
              <input className="w-full border border-gray-300 rounded px-3 py-2 text-sm" placeholder="Announcement title..." value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Message</label>
              <textarea className="w-full border border-gray-300 rounded px-3 py-2 text-sm h-24" placeholder="Write your announcement..." value={message} onChange={(e) => setMessage(e.target.value)} />
            </div>

            <div className="mb-3">
              <label className="block text-xs font-semibold uppercase tracking-wide mb-1">Priority</label>
              <div className="flex gap-4">
                {['normal','important','urgent'].map(p => (
                  <label key={p} className="flex items-center gap-2 cursor-pointer text-sm capitalize">
                    <input type="radio" name="priority" value={p} checked={priority === p} onChange={() => setPriority(p)} />
                    {p}
                  </label>
                ))}
              </div>
            </div>

            <div className="mb-4 border rounded-lg p-4" style={{ borderColor: '#d0c4a0' }}>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-semibold uppercase tracking-wide">Send To</label>
                <div className="flex gap-3">
                  <button onClick={selectEveryone} className="text-xs underline" style={{ color: '#C47A2C' }}>Select All</button>
                  <button onClick={clearAll} className="text-xs underline text-gray-400">Clear</button>
                </div>
              </div>

              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">By Role</div>
                <div className="flex flex-wrap gap-3">
                  {ROLES.map(role => (
                    <label key={role} className="flex items-center gap-2 cursor-pointer text-sm capitalize">
                      <input type="checkbox" checked={selectedRoles.includes(role)} onChange={() => toggleRole(role)} />
                      {role}
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">By School Level</div>
                <div className="flex flex-wrap gap-3">
                  {LEVELS.map(level => (
                    <label key={level.label} className="flex items-center gap-2 cursor-pointer text-sm">
                      <input type="checkbox" checked={level.grades.every(g => selectedGrades.includes(g))} onChange={() => toggleLevel(level.grades)} />
                      {level.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">By Grade</div>
                <div className="flex flex-wrap gap-2">
                  {GRADES.map(grade => (
                    <label key={grade} className="flex items-center gap-1 cursor-pointer text-sm">
                      <input type="checkbox" checked={selectedGrades.includes(grade)} onChange={() => toggleGrade(grade)} />
                      {GRADE_LABELS[grade]}
                    </label>
                  ))}
                </div>
              </div>

              {hasSelection && (
                <div className="mt-3 text-xs text-gray-500">
                  Sending to: {selectedRoles.length > 0 ? selectedRoles.join(', ') : 'all roles'}{selectedGrades.length > 0 ? ` in grades ${selectedGrades.map(g => GRADE_LABELS[g]).join(', ')}` : ''}
                </div>
              )}
            </div>

            <button onClick={sendAnnouncement} disabled={sending || !canSend} className="px-6 py-2 rounded font-semibold text-sm text-white disabled:opacity-50" style={{ background: '#C47A2C' }}>
              {sending ? 'Sending...' : 'Send Announcement'}
            </button>
          </div>

          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            <div className="p-4 border-b font-bold text-purple-900" style={{ borderColor: '#d0c4a0' }}>Recent Announcements</div>
            {announcements.length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-sm">No announcements yet.</div>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="p-4 border-b last:border-b-0" style={{ borderColor: '#ede8dc' }}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="font-semibold text-purple-900">{a.title}</div>
                    <span className={`text-xs px-2 py-1 rounded-full font-semibold ${a.priority === 'urgent' ? 'bg-red-100 text-red-700' : a.priority === 'important' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                      {a.priority}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-1">{a.content}</div>
                  <div className="text-xs text-gray-400">
                    Roles: {a.roles.length > 0 ? a.roles.join(', ') : 'all'} · 
                    Grades: {a.grades.length > 0 ? a.grades.map((g: number) => GRADE_LABELS[g]).join(', ') : 'all'} · 
                    By: {a.sent_by} · {a.sent_at}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}