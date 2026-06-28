'use client'

import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import TeacherSidebar from '@/components/layout/TeacherSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const MOCK_VIDEOS = [
  { id: '1', title: 'Intro to Real Numbers', course: 'Algebra I', lesson: 'Unit 1 — Lesson 1', duration: '18:42', status: 'published', type: 'upload', date: 'Jun 20' },
  { id: '2', title: 'Properties of Operations', course: 'Algebra I', lesson: 'Unit 1 — Lesson 2', duration: '22:10', status: 'processing', type: 'upload', date: 'Jun 18' },
  { id: '3', title: 'Quadratic Introduction', course: 'Algebra I', lesson: null, duration: '31:05', status: 'draft', type: 'recorded', date: 'Jun 15' },
]

type Status = 'all' | 'published' | 'processing' | 'draft'

function statusStyle(s: string) {
  if (s === 'published') return { color: '#1d6a3a', bg: '#d1fae5' }
  if (s === 'processing') return { color: '#b45309', bg: '#fef3c7' }
  return { color: '#555', bg: '#e8e0d0' }
}

export default function LectureLibraryPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<Status>('all')
  const fileInputRef = useRef<HTMLInputElement>(null)
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

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )

  const isTA = user.role === 'teaching_assistant'
  const filtered = MOCK_VIDEOS.filter(v =>
    v.title.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'all' || v.status === filter)
  )

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <TeacherSidebar displayName={user.display_name} isTA={isTA} activePage="/teacher/library" badges={{ training: 1, calendar: 2, announcements: 1, messages: 3 }} />
        <div className="flex-1 p-8 overflow-y-auto">

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <h1 className="text-2xl font-bold" style={{ color: '#2E6B4A' }}>Lecture Library</h1>
            <div style={{ display: 'flex', gap: '10px' }}>
              <input ref={fileInputRef} type="file" accept="video/*" style={{ display: 'none' }} />
              <button
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '8px 18px', background: 'white', color: '#2E6B4A', border: '2px solid #2E6B4A', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}
              >
                📁 Upload Video
              </button>
              <button
                onClick={() => router.push('/teacher/library/record')}
                style={{ padding: '8px 18px', background: '#b91c1c', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'white', display: 'inline-block' }} />
                Record New
              </button>
            </div>
          </div>

          <p style={{ fontSize: '12px', color: '#888', marginBottom: '20px' }}>
            All lecture videos are permanently accessible to students and parents once published. Videos tagged to a lesson show the lesson name below.
          </p>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search videos..."
              style={{ padding: '7px 12px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', width: '220px' }}
            />
            {(['all', 'published', 'processing', 'draft'] as Status[]).map(s => (
              <button key={s} onClick={() => setFilter(s)} style={{ padding: '6px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600', cursor: 'pointer', border: filter === s ? '2px solid #2E6B4A' : '1px solid #c8bea0', background: filter === s ? '#2E6B4A' : 'white', color: filter === s ? 'white' : '#555', textTransform: 'capitalize' }}>
                {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <span style={{ fontSize: '12px', color: '#aaa', marginLeft: 'auto' }}>{filtered.length} video{filtered.length !== 1 ? 's' : ''}</span>
          </div>

          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: '#aaa' }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎬</div>
              <div style={{ fontSize: '14px', fontWeight: '600' }}>No videos found</div>
              <div style={{ fontSize: '12px', marginTop: '4px' }}>Upload or record a video to get started</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {filtered.map(video => {
                const ss = statusStyle(video.status)
                return (
                  <div key={video.id} className="bg-white rounded-lg border overflow-hidden" style={{ borderColor: '#d0c4a0' }}>
                    <div style={{ aspectRatio: '16/9', background: '#1a1a2e', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                      <div style={{ fontSize: '32px', opacity: 0.3 }}>🎬</div>
                      <div style={{ position: 'absolute', bottom: '8px', right: '8px', background: 'rgba(0,0,0,0.7)', color: 'white', fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px' }}>
                        {video.duration}
                      </div>
                      {video.type === 'recorded' && (
                        <div style={{ position: 'absolute', top: '8px', left: '8px', background: '#b91c1c', color: 'white', fontSize: '9px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px' }}>
                          ⏺ RECORDED
                        </div>
                      )}
                    </div>
                    <div style={{ padding: '12px 14px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: '#333', marginBottom: '4px' }}>{video.title}</div>
                      <div style={{ fontSize: '11px', color: '#C47A2C', marginBottom: '6px' }}>{video.course}</div>
                      {video.lesson ? (
                        <div style={{ fontSize: '10px', color: '#2E6B4A', background: '#e8f5ee', padding: '3px 8px', borderRadius: '10px', display: 'inline-block', marginBottom: '8px', fontWeight: '600' }}>
                          📌 {video.lesson}
                        </div>
                      ) : (
                        <div style={{ fontSize: '10px', color: '#aaa', marginBottom: '8px', fontStyle: 'italic' }}>Not assigned to a lesson</div>
                      )}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{ fontSize: '10px', fontWeight: '700', padding: '2px 8px', borderRadius: '10px', background: ss.bg, color: ss.color }}>{video.status}</span>
                          <span style={{ fontSize: '10px', color: '#aaa' }}>{video.date}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button style={{ padding: '4px 10px', fontSize: '11px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white', color: '#2E6B4A', fontWeight: '600' }}>✏️ Edit</button>
                          <button style={{ padding: '4px 8px', fontSize: '11px', border: '1px solid #e8a0a0', borderRadius: '4px', cursor: 'pointer', background: 'white', color: '#b91c1c' }}>🗑</button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}