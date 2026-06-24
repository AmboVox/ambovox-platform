'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Child {
  id: string
  name: string
  grade: number
}

interface ParentSidebarProps {
  displayName: string
  children: Child[]
  activeChildId: string
  onChildChange: (id: string) => void
  activePage?: string
  badges?: {
    messages?: number
    announcements?: number
    forms?: number
    prayer?: number
  }
}

export default function ParentSidebar({
  displayName,
  children,
  activeChildId,
  onChildChange,
  activePage,
  badges = {},
}: ParentSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    child: true,
    communication: true,
    school: true,
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
      <span style={{
        background: '#8C1D2C',
        color: 'white',
        fontSize: '9px',
        fontWeight: '700',
        padding: '1px 6px',
        borderRadius: '10px',
        marginLeft: 'auto',
      }}>
        {count}
      </span>
    )
  }

  function NavLink({ href, label, badge }: { href: string; label: string; badge?: number }) {
    const active = activePage === href
    return (
      <a href={href} style={{
        display: 'flex',
        alignItems: 'center',
        padding: '7px 12px',
        borderRadius: '4px',
        fontSize: '12px',
        marginBottom: '3px',
        color: active ? '#F4EFE3' : 'rgba(244,239,227,0.75)',
        background: active ? 'rgba(196,122,44,0.25)' : 'transparent',
        borderLeft: active ? '3px solid #C47A2C' : '3px solid transparent',
        textDecoration: 'none',
      }}>
        <span>{label}</span>
        <Badge count={badge} />
      </a>
    )
  }

  function SectionHeader({ id, label }: { id: string; label: string }) {
    const open = openSections[id]
    return (
      <div
        onClick={() => toggleSection(id)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 12px 4px',
          cursor: 'pointer',
          fontSize: '9px',
          fontWeight: '700',
          color: 'rgba(201,163,58,0.7)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
        }}
      >
        <span>{label}</span>
        <span>{open ? '▾' : '▸'}</span>
      </div>
    )
  }

  return (
    <div style={{ width: '230px', minWidth: '230px', background: '#1A3A5C', display: 'flex', flexDirection: 'column', height: '100%' }}>

      <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid rgba(201,163,58,0.3)' }}>
        <div style={{ color: 'white', fontWeight: '700', fontSize: '12px' }}>Rex Christus Academy</div>
        <div style={{ color: '#C47A2C', fontSize: '10px', marginTop: '4px' }}>Parent Portal</div>
        <div style={{ color: 'rgba(201,163,58,0.6)', fontSize: '9px', marginTop: '2px', fontStyle: 'italic' }}>No King But Christ</div>
      </div>

      <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(201,163,58,0.2)', background: 'rgba(0,0,0,0.15)' }}>
        <div style={{ fontSize: '9px', fontWeight: '700', color: 'rgba(201,163,58,0.7)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '6px' }}>
          Viewing
        </div>
        {children.length === 0 ? (
          <div style={{ fontSize: '11px', color: 'rgba(244,239,227,0.5)', fontStyle: 'italic' }}>No children linked</div>
        ) : children.length === 1 ? (
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#F4EFE3' }}>
            {children[0].name}
            <div style={{ fontSize: '10px', fontWeight: '400', color: 'rgba(244,239,227,0.6)', marginTop: '1px' }}>
              Grade {children[0].grade}
            </div>
          </div>
        ) : (
          <select
            value={activeChildId}
            onChange={e => onChildChange(e.target.value)}
            style={{
              width: '100%',
              padding: '6px 8px',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(201,163,58,0.4)',
              borderRadius: '4px',
              color: '#F4EFE3',
              fontSize: '12px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {children.map(child => (
              <option key={child.id} value={child.id} style={{ background: '#1A3A5C', color: 'white' }}>
                {child.name} — Grade {child.grade}
              </option>
            ))}
          </select>
        )}
      </div>

      <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
        <NavLink href="/parent" label="🏠 Dashboard" />

        <SectionHeader id="child" label="My Child" />
        {openSections.child && (
          <div style={{ marginBottom: '6px' }}>
            <NavLink href="/parent/grades" label="Grades & Report Card" />
            <NavLink href="/parent/attendance" label="Attendance" />
            <NavLink href="/parent/assignments" label="Assignments" />
          </div>
        )}

        <SectionHeader id="communication" label="Communication" />
        {openSections.communication && (
          <div style={{ marginBottom: '6px' }}>
            <NavLink href="/parent/announcements" label="Announcements" badge={badges.announcements} />
            <NavLink href="/parent/messages" label="Messages" badge={badges.messages} />
            <NavLink href="/parent/conferences" label="Conferences" />
            <NavLink href="/parent/prayer" label="✝️ Prayer Board" badge={badges.prayer} />
          </div>
        )}

        <SectionHeader id="school" label="School" />
        {openSections.school && (
          <div style={{ marginBottom: '6px' }}>
            <NavLink href="/parent/calendar" label="Calendar" />
            <NavLink href="/parent/forms" label="Forms & Payments" badge={badges.forms} />
          </div>
        )}
      </nav>

      <div style={{ padding: '12px', borderTop: '1px solid rgba(201,163,58,0.3)' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#F4EFE3' }}>{displayName}</div>
        <div style={{ fontSize: '10px', color: '#C47A2C' }}>Parent / Guardian</div>
        <button onClick={handleSignOut} style={{ marginTop: '8px', fontSize: '11px', color: 'rgba(244,239,227,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}>
          Sign out
        </button>
      </div>
    </div>
  )
}