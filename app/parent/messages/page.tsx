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

const MOCK_THREADS = [
  { id: 1, from: 'Ms. Elena Hart', role: 'Teacher — Algebra I', date: 'Jun 23', unread: true, preview: 'I wanted to reach out about Emma\'s recent test scores...', messages: [
    { sender: 'Ms. Elena Hart', time: 'Jun 23, 2:14 PM', text: 'I wanted to reach out about Emma\'s recent test scores. She has been improving steadily and I think with a little extra practice over the summer she will be well prepared for Algebra II.' },
    { sender: 'You', time: 'Jun 23, 4:30 PM', text: 'Thank you so much for letting us know! We will look into some summer resources.' },
  ]},
  { id: 2, from: 'Mr. Thomas Wells', role: 'Teacher — History', date: 'Jun 21', unread: true, preview: 'Emma\'s timeline project was excellent. She clearly put in...', messages: [
    { sender: 'Mr. Thomas Wells', time: 'Jun 21, 10:05 AM', text: 'Emma\'s timeline project was excellent. She clearly put in a great deal of effort and her attention to detail really showed. Well done.' },
  ]},
  { id: 3, from: 'Administration', role: 'Rex Christus Academy', date: 'Jun 20', unread: false, preview: 'A reminder that the end-of-year ceremony begins at 9:00 AM...', messages: [
    { sender: 'Administration', time: 'Jun 20, 8:00 AM', text: 'A reminder that the end-of-year ceremony begins at 9:00 AM on June 27th in the main hall. Please arrive by 8:45 AM. Seating is first come, first served.' },
  ]},
  { id: 4, from: 'Mrs. Sarah Alcott', role: 'Teacher — Literature', date: 'Jun 15', unread: false, preview: 'Please remind Emma that her essay is due on June 27th...', messages: [
    { sender: 'Mrs. Sarah Alcott', time: 'Jun 15, 3:22 PM', text: 'Please remind Emma that her essay on The Odyssey is due on June 27th. She can submit it digitally or hand in a printed copy.' },
    { sender: 'You', time: 'Jun 15, 5:00 PM', text: 'Will do, thank you for the reminder!' },
  ]},
]

export default function ParentMessagesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeChildId, setActiveChildId] = useState(MOCK_CHILDREN[0].id)
  const [activeThread, setActiveThread] = useState<number | null>(1)
  const [newMessage, setNewMessage] = useState('')
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

  const thread = MOCK_THREADS.find(t => t.id === activeThread)
  const unreadCount = MOCK_THREADS.filter(t => t.unread).length

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <ParentSidebar
          displayName={user.display_name}
          children={MOCK_CHILDREN}
          activeChildId={activeChildId}
          onChildChange={setActiveChildId}
          activePage="/parent/messages"
          badges={{ announcements: 1, messages: unreadCount, forms: 2 }}
        />
        <div className="flex-1 overflow-hidden" style={{ display: 'flex', flexDirection: 'column' }}>

          {MOCK_CHILDREN.length > 1 && (
            <div style={{ display: 'flex', gap: '0', borderBottom: '2px solid #d0c4a0', padding: '0 32px', background: '#F4EFE3' }}>
              {MOCK_CHILDREN.map(child => (
                <button key={child.id} onClick={() => setActiveChildId(child.id)} style={{ padding: '8px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none', borderBottom: activeChildId === child.id ? '2px solid #1A3A5C' : '2px solid transparent', marginBottom: '-2px', background: 'transparent', color: activeChildId === child.id ? '#1A3A5C' : '#888' }}>
                  {child.name}
                </button>
              ))}
            </div>
          )}

          <div style={{ padding: '24px 32px 12px', background: '#F4EFE3' }}>
            <h1 className="text-2xl font-bold" style={{ color: '#1A3A5C' }}>Messages</h1>
          </div>

          <div style={{ flex: 1, display: 'flex', overflow: 'hidden', padding: '0 32px 24px', gap: '16px' }}>

            <div style={{ width: '300px', flexShrink: 0, background: 'white', borderRadius: '8px', border: '1px solid #d0c4a0', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
              <div style={{ padding: '12px 14px', borderBottom: '1px solid #e8e0d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '700', color: '#5B2C83' }}>Inbox</span>
                <button style={{ fontSize: '11px', padding: '4px 10px', background: '#1A3A5C', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: '600' }}>+ New</button>
              </div>
              <div style={{ overflowY: 'auto', flex: 1 }}>
                {MOCK_THREADS.map(t => (
                  <div key={t.id} onClick={() => setActiveThread(t.id)} style={{ padding: '12px 14px', borderBottom: '1px solid #ede8dc', cursor: 'pointer', background: activeThread === t.id ? '#ede8f5' : t.unread ? '#f9f6ee' : 'white', borderLeft: activeThread === t.id ? '3px solid #1A3A5C' : '3px solid transparent' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ fontSize: '12px', fontWeight: t.unread ? '700' : '600', color: '#333' }}>{t.from}</span>
                      <span style={{ fontSize: '10px', color: '#aaa' }}>{t.date}</span>
                    </div>
                    <div style={{ fontSize: '10px', color: '#C47A2C', marginBottom: '4px' }}>{t.role}</div>
                    <div style={{ fontSize: '11px', color: '#777', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{t.preview}</div>
                    {t.unread && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#1A3A5C', marginTop: '4px' }} />}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ flex: 1, background: 'white', borderRadius: '8px', border: '1px solid #d0c4a0', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
              {thread ? (
                <>
                  <div style={{ padding: '14px 18px', borderBottom: '1px solid #e8e0d0' }}>
                    <div style={{ fontWeight: '700', fontSize: '14px', color: '#333' }}>{thread.from}</div>
                    <div style={{ fontSize: '11px', color: '#C47A2C' }}>{thread.role}</div>
                  </div>
                  <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {thread.messages.map((m, i) => {
                      const isMe = m.sender === 'You'
                      return (
                        <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                          <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '4px' }}>{m.sender} · {m.time}</div>
                          <div style={{ maxWidth: '75%', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', lineHeight: '1.5', background: isMe ? '#1A3A5C' : '#f9f6ee', color: isMe ? 'white' : '#333' }}>
                            {m.text}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div style={{ padding: '12px 18px', borderTop: '1px solid #e8e0d0', display: 'flex', gap: '8px' }}>
                    <input
                      value={newMessage}
                      onChange={e => setNewMessage(e.target.value)}
                      placeholder="Type a reply..."
                      style={{ flex: 1, padding: '8px 12px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}
                    />
                    <button onClick={() => setNewMessage('')} style={{ padding: '8px 16px', background: '#1A3A5C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Send</button>
                  </div>
                </>
              ) : (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#aaa', fontSize: '13px' }}>Select a message to read</div>
              )}
            </div>

          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}