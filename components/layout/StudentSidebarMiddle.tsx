'use client'

import { createClient } from '@/lib/supabase/client'

interface StudentSidebarMiddleProps {
  displayName: string
  activePage?: string
  badges?: {
    messages?: number
    announcements?: number
    assignments?: number
  }
}

export default function StudentSidebarMiddle({ displayName, activePage, badges = {} }: StudentSidebarMiddleProps) {

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

  function NavLink({ href, label, badge, emoji }: { href: string; label: string; badge?: number; emoji: string }) {
    const active = activePage === href
    return (
      <a href={href} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '9px 12px', borderRadius: '6px', fontSize: '13px', marginBottom: '4px', color: active ? '#F4EFE3' : 'rgba(244,239,227,0.8)', background: active ? 'rgba(196,122,44,0.25)' : 'transparent', borderLeft: active ? '3px solid #C47A2C' : '3px solid transparent', textDecoration: 'none' }}>
        <span style={{ fontSize: '16px' }}>{emoji}</span>
        <span style={{ flex: 1 }}>{label}</span>
        <Badge count={badge} />
      </a>
    )
  }

  return (
    <div style={{ width: '220px', minWidth: '220px', background: '#3D5A80', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid rgba(201,163,58,0.3)' }}>
        <div style={{ color: 'white', fontWeight: '700', fontSize: '12px' }}>Rex Christus Academy</div>
        <div style={{ color: '#C47A2C', fontSize: '10px', marginTop: '4px' }}>Student Portal</div>
        <div style={{ color: 'rgba(201,163,58,0.6)', fontSize: '9px', marginTop: '2px', fontStyle: 'italic' }}>No King But Christ</div>
      </div>

      <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
        <NavLink href="/student/middle" label="Home" emoji="🏠" />
        <NavLink href="/student/middle/courses" label="My Courses" emoji="📚" />
        <NavLink href="/student/middle/assignments" label="Assignments" emoji="📋" badge={badges.assignments} />
        <NavLink href="/student/middle/grades" label="My Grades" emoji="📊" />
        <NavLink href="/student/middle/announcements" label="Announcements" emoji="📢" badge={badges.announcements} />
        <NavLink href="/student/middle/messages" label="Messages" emoji="💬" badge={badges.messages} />
        <NavLink href="/student/middle/prayer" label="Prayer Board" emoji="✝️" />
      </nav>

      <div style={{ padding: '12px', borderTop: '1px solid rgba(201,163,58,0.3)' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#F4EFE3' }}>{displayName}</div>
        <div style={{ fontSize: '10px', color: '#C47A2C' }}>Middle School</div>
        <button onClick={handleSignOut} style={{ marginTop: '8px', fontSize: '11px', color: 'rgba(244,239,227,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}>
          Sign out
        </button>
      </div>
    </div>
  )
}