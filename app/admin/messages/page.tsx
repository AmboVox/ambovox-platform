'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const DEMO_THREADS = [
  { id: 1, name: 'Ms. Elena Hart', role: 'Teacher', preview: 'Re: Devon Ellis concern', time: '10m', active: true },
  { id: 2, name: 'Mia Kim', role: 'Parent', preview: 'Tuition question', time: '1h', active: false },
  { id: 3, name: 'Robert Ellis', role: 'Parent', preview: 'Devon — please call', time: '2h', active: false },
  { id: 4, name: 'Mr. Raj Patel', role: 'Teacher', preview: 'End of year grades', time: 'Yesterday', active: false },
]

const DEMO_MESSAGES = [
  { id: 1, sender: 'Ms. Hart', mine: false, text: 'Dr. Osei — I am concerned about Devon Ellis. He has 8 missing assignments and has not been in class regularly. His parent has not responded to my messages. Can admin reach out directly?' },
  { id: 2, sender: 'You', mine: true, text: 'Thank you for flagging this, Ms. Hart. I will contact the Ellis family today. I can also see from the attendance log that Devon has missed 12 days this semester. I will escalate this to our counseling team.' },
]

export default function MessagesPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeThread, setActiveThread] = useState(DEMO_THREADS[0])
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState(DEMO_MESSAGES)
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

  function sendMessage() {
    if (!newMessage.trim()) return
    setMessages([...messages, { id: Date.now(), sender: 'You', mine: true, text: newMessage }])
    setNewMessage('')
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar displayName={user.display_name} activePage="/admin/messages" badges={{ training: 2, calendar: 3, announcements: 1, forms: 7, prayer: 1, messages: 5 }} />
        <div className="flex-1 flex overflow-hidden">
          <div style={{ width: '200px', minWidth: '200px', borderRight: '1px solid #d0c4a0', background: 'white', display: 'flex', flexDirection: 'column' }}>
            <div style={{ padding: '10px 12px', borderBottom: '1px solid #ede8dc', fontWeight: '700', fontSize: '13px', color: '#C47A2C' }}>Inbox</div>
            {DEMO_THREADS.map(thread => (
              <div key={thread.id} onClick={() => setActiveThread(thread)} style={{ padding: '10px 12px', borderBottom: '1px solid #ede8dc', cursor: 'pointer', background: activeThread.id === thread.id ? '#fdebd0' : 'white' }}>
                <div style={{ fontWeight: '600', fontSize: '12px', color: '#C47A2C' }}>{thread.name} <span style={{ fontWeight: '400', color: '#aaa', fontSize: '10px' }}>{thread.role}</span></div>
                <div style={{ fontSize: '11px', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{thread.preview}</div>
                <div style={{ fontSize: '10px', color: '#bbb' }}>{thread.time}</div>
              </div>
            ))}
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#F4EFE3' }}>
            <div style={{ padding: '10px 14px', borderBottom: '1px solid #d0c4a0', fontWeight: '700', fontSize: '13px', color: '#C47A2C', background: 'white' }}>
              {activeThread.name} — {activeThread.role}
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {messages.map(msg => (
                <div key={msg.id} style={{ alignSelf: msg.mine ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                  <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '2px', textAlign: msg.mine ? 'right' : 'left' }}>{msg.sender}</div>
                  <div style={{ padding: '8px 12px', borderRadius: '6px', fontSize: '12px', lineHeight: '1.55', background: msg.mine ? '#C47A2C' : 'white', color: msg.mine ? 'white' : '#121212', border: msg.mine ? 'none' : '1px solid #d0c4a0' }}>
                    {msg.text}
                  </div>
                </div>
              ))}
            </div>
            <div style={{ padding: '10px 14px', borderTop: '1px solid #d0c4a0', display: 'flex', gap: '8px', background: 'white' }}>
              <input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                style={{ flex: 1, padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}
              />
              <button onClick={sendMessage} style={{ padding: '7px 16px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}