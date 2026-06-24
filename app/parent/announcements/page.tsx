'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ParentSidebar from '@/components/layout/ParentSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const MOCK_CHILDREN = [
  { id: 'child-1', name: 'Emma Smith', grade: 7 },
  { id: 'child-2', name: 'James Smith', grade: 4 },
]

const MOCK_ANNOUNCEMENTS = [
  { id: 1, title: 'End-of-Year Ceremony — June 27th', date: 'Jun 22', category: 'Event', urgent: false, body: 'The end-of-year ceremony will be held on Friday, June 27th beginning at 9:00 AM in the main hall. All families are invited to attend. Please arrive by 8:45 AM as seating is first come, first served. Light refreshments will be served following the ceremony.' },
  { id: 2, title: 'Uniform Policy Reminder', date: 'Jun 22', category: 'Policy', urgent: true, body: 'As a reminder, the full uniform policy remains in effect through the last day of school. This includes proper footwear, tucked shirts, and no non-school-issued outerwear. Students who arrive out of uniform will be asked to call home for a change of clothes.' },
  { id: 3, title: 'Summer Reading List Now Available', date: 'Jun 20', category: 'Academic', urgent: false, body: 'The summer reading list for all grade levels is now available. Students are encouraged to complete at least two books from their grade-level list before the first day of the new school year. Lists can be picked up at the front office or downloaded from the school website.' },
  { id: 4, title: 'Tuition Statements for 2026-2027', date: 'Jun 18', category: 'Finance', urgent: false, body: 'Tuition statements for the upcoming school year have been sent to the email address on file. Please review your statement carefully and submit payment or arrange a payment plan by July 15th. Contact the office with any questions.' },
  { id: 5, title: 'No School — June 30th', date: 'Jun 15', category: 'Schedule', urgent: false, body: 'Please note there will be no school on Monday, June 30th for staff professional development. The last day of school for students is Friday, June 27th.' },
]

const CATEGORIES = ['All', 'Event', 'Policy', 'Academic', 'Finance', 'Schedule']

function categoryColor(c: string) {
  if (c === 'Event') return { color: '#1d6a3a', bg: '#d1fae5' }
  if (c === 'Policy') return { color: '#b91c1c', bg: '#fee2e2' }
  if (c === 'Academic') return { color: '#1A3A5C', bg: '#dbeafe' }
  if (c === 'Finance') return { color: '#b45309', bg: '#fef3c7' }
  return { color: '#5B2C83', bg: '#ede8f5' }
}

export default function ParentAnnouncementsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeChildId, setActiveChildId] = useState(MOCK_CHILDREN[0].id)
  const [filter, setFilter] = useState('All')
  const [expanded, setExpanded] = useState<number | null>(1)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('users').select('role, display_name').eq('id', user.id).single()
      if (!profile || profile.role !== 'parent') { router.push('/login'); return }
      setUser(profile)
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )

  const filtered = filter === 'All' ? MOCK_ANNOUNCEMENTS : MOCK_ANNOUNCEMENTS.filter(a => a.category === filter)

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <ParentSidebar
          displayName={user.display_name}
          children={MOCK_CHILDREN}
          activeChildId={activeChildId}
          onChildChange={setActiveChildId}
          activePage="/parent/announcements"
          badges={{ announcements: 1, messages: 3, forms: 2 }}
        />
        <div className="flex-1 p-8 overflow-y-auto">

          {MOCK_CHILDREN.length > 1 && (
            <div style={{ display: 'flex', gap: '0', marginBottom: '24px', borderBottom: '2px solid #d0c4a0' }}>
              {MOCK_CHILDREN.map(child => (
                <button key={child.id} onClick={() => setActiveChildId(child.id)} style={{ padding: '8px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none', borderBottom: activeChildId === child.id ? '2px solid #1A3A5C' : '2px solid transparent', marginBottom: '-2px', background: 'transparent', color: activeChildId === child.id ? '#1A3A5C' : '#888' }}>
                  {child.name}
                  <span style={{ fontSize: '10px', marginLeft: '6px', color: activeChildId === child.id ? '#C47A2C' : '#bbb' }}>Grade {child.grade}</span>
                </button>
              ))}
            </div>
          )}

          <h1 className="text-2xl font-bold mb-6" style={{ color: '#1A3A5C' }}>Announcements</h1>

          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {CATEGORIES.map(c => (
              <button key={c} onClick={() => setFilter(c)} style={{ padding: '6px 16px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: filter === c ? '2px solid #1A3A5C' : '1px solid #c8bea0', background: filter === c ? '#1A3A5C' : 'white', color: filter === c ? 'white' : '#555' }}>
                {c}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {filtered.map(ann => {
              const cc = categoryColor(ann.category)
              const isOpen = expanded === ann.id
              return (
                <div key={ann.id} className="bg-white rounded-lg border" style={{ borderColor: ann.urgent ? '#b91c1c' : '#d0c4a0', borderLeft: ann.urgent ? '4px solid #b91c1c' : '4px solid transparent' }}>
                  <div onClick={() => setExpanded(isOpen ? null : ann.id)} style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ padding: '2px 10px', borderRadius: '10px', fontSize: '10px', fontWeight: '700', background: cc.bg, color: cc.color }}>{ann.category}</span>
                      <span style={{ fontSize: '13px', fontWeight: ann.urgent ? '700' : '600', color: '#333' }}>{ann.urgent && '⚠️ '}{ann.title}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '11px', color: '#aaa' }}>{ann.date}</span>
                      <span style={{ color: '#888', fontSize: '12px' }}>{isOpen ? '▲' : '▼'}</span>
                    </div>
                  </div>
                  {isOpen && (
                    <div style={{ padding: '0 18px 16px', fontSize: '12px', lineHeight: '1.7', color: '#444', borderTop: '1px solid #ede8dc' }}>
                      <div style={{ paddingTop: '12px' }}>{ann.body}</div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}