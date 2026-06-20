'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface TeacherSidebarProps {
  displayName: string
  isTA?: boolean
  activePage?: string
  badges?: {
    training?: number
    calendar?: number
    announcements?: number
    messages?: number
    issues?: number
  }
}

export default function TeacherSidebar({ displayName, isTA, activePage, badges = {} }: TeacherSidebarProps) {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    courses: true,
    students: true,
    assessment: true,
    tools: true,
    communication: true,
    training: true,
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
        background: active ? 'rgba(91,44,131,0.35)' : 'transparent',
        borderLeft: active ? '3px solid #5B2C83' : '3px solid transparent',
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
    <div style={{ width: '230px', minWidth: '230px', background: '#2E6B4A', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid rgba(244,239,227,0.2)' }}>
        <div style={{ color: 'white', fontWeight: '700', fontSize: '12px' }}>Rex Christus Academy</div>
        <div style={{ color: '#F4EFE3', fontSize: '10px', marginTop: '4px' }}>{isTA ? 'Teaching Assistant' : 'Teacher'} Portal</div>
        <div style={{ color: 'rgba(244,239,227,0.6)', fontSize: '9px', marginTop: '2px', fontStyle: 'italic' }}>No King But Christ</div>
      </div>

      <nav style={{ flex: 1, padding: '8px', overflowY: 'auto' }}>
        <SectionHeader id="courses" label="Courses" />
        {openSections.courses && (
          <div style={{ marginBottom: '6px' }}>
            <NavLink href="/teacher" label="My Courses" />
            <NavLink href="/teacher/builder" label="Course Builder" />
            <NavLink href="/teacher/library" label="Lecture Library" />
          </div>
        )}

        <SectionHeader id="students" label="Students" />
        {openSections.students && (
          <div style={{ marginBottom: '6px' }}>
            <NavLink href="/teacher/gradebook" label="Gradebook" />
            <NavLink href="/teacher/attendance" label="Attendance" />
            <NavLink href="/teacher/assignments" label="Assignments" />
          </div>
        )}

        <SectionHeader id="assessment" label="Assessment" />
        {openSections.assessment && (
          <div style={{ marginBottom: '6px' }}>
            <NavLink href="/teacher/assessments" label="Assessment Builder" />
            <NavLink href="/teacher/results" label="Test Results" />
          </div>
        )}

        <SectionHeader id="tools" label="Tools" />
        {openSections.tools && (
          <div style={{ marginBottom: '6px' }}>
            <NavLink href="/teacher/lesson-plans" label="Lesson Plans" />
            <NavLink href="/teacher/office-hours" label="Office Hours" />
            <NavLink href="/teacher/schedule" label="Schedule" />
          </div>
        )}

        <SectionHeader id="communication" label="Communication" />
        {openSections.communication && (
          <div style={{ marginBottom: '6px' }}>
            <NavLink href="/teacher/calendar" label="Calendar" badge={badges.calendar} />
            <NavLink href="/teacher/announcements" label="Announcements" badge={badges.announcements} />
            <NavLink href="/teacher/messages" label="Messages" badge={badges.messages} />
            <NavLink href="/teacher/prayer" label="Prayer Board" />
            <NavLink href="/teacher/issues" label="Report an Issue" badge={badges.issues} />
          </div>
        )}

        <SectionHeader id="training" label="Training" />
        {openSections.training && (
          <div style={{ marginBottom: '6px' }}>
            <NavLink href="/teacher/training" label="Complete This Training" badge={badges.training} />
            <NavLink href="/teacher/training/drafts" label="Draft Documents" />
            <NavLink href="/teacher/training/completed" label="Completed Training" />
            <NavLink href="/teacher/training/effective" label="Effective Protocols" />
          </div>
        )}
      </nav>

      <div style={{ padding: '12px', borderTop: '1px solid rgba(244,239,227,0.2)' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#F4EFE3' }}>{displayName}</div>
        <div style={{ fontSize: '10px', color: '#F4EFE3' }}>{isTA ? 'Teaching Assistant' : 'Teacher'}</div>
        <button onClick={handleSignOut} style={{ marginTop: '8px', fontSize: '11px', color: 'rgba(244,239,227,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}>
          Sign out
        </button>
      </div>
    </div>
  )
}