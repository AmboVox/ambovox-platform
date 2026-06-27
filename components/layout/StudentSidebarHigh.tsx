'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface StudentSidebarHighProps {
  displayName: string
  activePage?: string
  badges?: {
    messages?: number
    announcements?: number
    assignments?: number
  }
}

export default function StudentSidebarHigh({ displayName, activePage, badges = {} }: StudentSidebarHighProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    academic: true,
    communication: true,
  })

  function toggleSection(key: string) {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }))
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  function Badge({ count }: { count?: number }) {
    if (!count || count === 0) return null
    return (
      <span style={{ background: '#8C1D2C', color: 'white', fontSize: '9px', fontWeight: '700', padding: '1px 6px', borderRadius: '10px', marginLeft: 'auto' }}>
        {count}
      </span>
    )
  }

  function NavLink({ href, label, badge }: { href: string; label: string; badge?: number }) {
    const active = activePage === href
    return (
      <a href={href} style={{ display: 'flex', alignItems: 'center', padding: '7px 12px', borderRadius: '4px', fontSize: '12px', marginBottom: '3px', color: active ? '#F4EFE3' : 'rgba(244,239,227,0.75)', background: active ? 'rgba(196,122,44,0.25)' : 'transparent', borderLeft: active ? '3px solid #C47A2C' : '3px solid transparent', textDecoration: 'none' }}>
        <span style={{ flex: 1 }}>{label}</span>
        <Badge count={badge} />
      </a>
    )
  }

  function SectionHeader({ id, label }: { id: string; label: string }) {
    const open = openSections[id]
    return (
      <div onClick={() => toggleSection(id)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px 4px', cursor: 'pointer', fontSize: '9px', fontWeight: '700', color: 'rgba(201,163,58,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
        <span>{label}</span>
        <span>{open ? '▾' : '▸'}</span>
      </div>
    )
  }

  return (
    <div style={{ width: '230px', minWidth: '230px', background: '#4A2040', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid rgba(201,163,58,0.3)' }}>
        <div style={{ color: 'white', fontWeight: '700', fontSize: '12px' }}>Rex Christus Academy</div>
        <div style={{ color: '#C47A2C', fontSize: '10px', marginTop: '4px' }}>Student Portal</div>
        <div style={{ color: 'rgba(201,163,58,0.6)', fontSize: '9px', marginTop: '2px', fontStyle: 'italic' }}>No King But Christ</div>
      </div>

      <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
        <NavLink href="/student/high" label="🏠 Dashboard" />

        <SectionHeader id="academic" label="Academic" />
        {openSections.academic && (
          <div style={{ marginBottom: '6px' }}>
            <NavLink href="/student/high/courses" label="My Courses" />
            <NavLink href="/student/high/assignments" label="Assignments" badge={badges.assignments} />
            <NavLink href="/student/high/grades" label="Grades & GPA" />
            <NavLink href="/student/high/schedule" label="Schedule" />
            <NavLink href="/student/high/office-hours" label="Office Hours" />
          </div>
        )}

        <SectionHeader id="communication" label="Communication" />
        {openSections.communication && (
          <div style={{ marginBottom: '6px' }}>
            <NavLink href="/student/high/announcements" label="Announcements" badge={badges.announcements} />
            <NavLink href="/student/high/messages" label="Messages" badge={badges.messages} />
            <NavLink href="/student/high/prayer" label="✝️ Prayer Board" />
          </div>
        )}
      </nav>

      <div style={{ padding: '12px', borderTop: '1px solid rgba(201,163,58,0.3)' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#F4EFE3' }}>{displayName}</div>
        <div style={{ fontSize: '10px', color: '#C47A2C' }}>High School</div>
        <button onClick={handleSignOut} style={{ marginTop: '8px', fontSize: '11px', color: 'rgba(244,239,227,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}>
          Sign out
        </button>
      </div>
    </div>
  )
}