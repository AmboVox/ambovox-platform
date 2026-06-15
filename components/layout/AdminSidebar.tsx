"use client"
import { createClient } from "@/lib/supabase/client"
interface AdminSidebarProps { displayName: string; activePage?: string }
export default function AdminSidebar({ displayName, activePage }: AdminSidebarProps) {
const navItems = [
{ label: 'Dashboard', href: '/admin' },
{ label: 'Students', href: '/admin/students' },
{ label: 'Staff', href: '/admin/staff' },
{ label: 'Curriculum', href: '/admin/curriculum' },
{ label: 'Calendar', href: '/admin/calendar' },
{ label: 'Announcements', href: '/admin/announcements' },
{ label: 'Forms and Payments', href: '/admin/forms' },
{ label: 'Prayer Board', href: '/admin/prayer' },
{ label: 'Messages', href: '/admin/messages' },
{ label: 'Training', href: '/admin/training' },
{ label: 'Settings', href: '/admin/settings' },
]
async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }
return (
    <div style={{ width: '220px', minWidth: '220px', background: '#5B2C83', display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid rgba(201,163,58,0.3)' }}>
        <div style={{ color: 'white', fontWeight: '700', fontSize: '12px' }}>Rex Christus Academy</div>
        <div style={{ color: '#C47A2C', fontSize: '10px', marginTop: '4px' }}>Administration</div>
        <div style={{ color: 'rgba(201,163,58,0.6)', fontSize: '9px', marginTop: '2px', fontStyle: 'italic' }}>No King But Christ</div>
      </div>
      <nav style={{ flex: 1, padding: '12px', overflowY: 'auto' }}>
{navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '7px 12px',
              borderRadius: '4px',
              fontSize: '12px',
              marginBottom: '4px',
              color: activePage === item.href ? '#F4EFE3' : 'rgba(244,239,227,0.75)',
              background: activePage === item.href ? 'rgba(196,122,44,0.25)' : 'transparent',
              borderLeft: activePage === item.href ? '3px solid #C47A2C' : '3px solid transparent',
              fontFamily: 'sans-serif',
              textDecoration: 'none',
            }}
          >
            {item.label}
          </a>
        ))}
</nav>
      <div style={{ padding: '12px', borderTop: '1px solid rgba(201,163,58,0.3)' }}>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#F4EFE3' }}>{displayName}</div>
        <div style={{ fontSize: '10px', color: '#C47A2C' }}>Administrator</div>
        <button onClick={handleSignOut} style={{ marginTop: '8px', fontSize: '11px', color: 'rgba(244,239,227,0.5)', background: 'none', border: 'none', cursor: 'pointer', padding: '0' }}>Sign out</button>
      </div>
    </div>
  )
}