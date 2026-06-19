'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'school'|'grading'|'accounts'>('school')
  const [schoolName, setSchoolName] = useState('Rex Christus Academy')
  const [motto, setMotto] = useState('No King But Christ')
  const [minGPA, setMinGPA] = useState('2.0')
  const [saved, setSaved] = useState(false)
  const router = useRouter()

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      const { data: profile } = await supabase.from('users').select('role, display_name').eq('id', user.id).single()
      if (!profile || profile.role !== 'admin') { router.push('/login'); return }
      setUser(profile)
      setLoading(false)
    }
    load()
  }, [])

  function save() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
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
        <AdminSidebar displayName={user.display_name} activePage="/admin/settings" badges={{ training: 2, calendar: 3, announcements: 1, forms: 7, prayer: 1, messages: 5 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <h1 className="text-2xl font-bold mb-6" style={{ color: '#C47A2C' }}>Settings</h1>

          <div style={{ display: 'flex', gap: '0', marginBottom: '20px', borderBottom: '2px solid #d0c4a0' }}>
            {[['school','School'],['grading','Grading'],['accounts','User Accounts']].map(([key, label]) => (
              <button key={key} onClick={() => setTab(key as any)} style={{ padding: '8px 20px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', border: 'none', borderBottom: tab === key ? '2px solid #C47A2C' : '2px solid transparent', marginBottom: '-2px', background: 'transparent', color: tab === key ? '#C47A2C' : '#888' }}>
                {label}
              </button>
            ))}
          </div>

          {tab === 'school' && (
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#d0c4a0' }}>
              <h2 className="font-bold text-purple-900 mb-4">School Information</h2>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>School Name</label>
                  <input value={schoolName} onChange={(e) => setSchoolName(e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>School Motto</label>
                  <input value={motto} onChange={(e) => setMotto(e.target.value)} style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Contact Email</label>
                  <input placeholder="admin@school.com" style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Timezone</label>
                  <select style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}>
                    <option>America/New_York</option>
                    <option>America/Chicago</option>
                    <option>America/Denver</option>
                    <option>America/Los_Angeles</option>
                  </select>
                </div>
              </div>
              <button onClick={save} style={{ padding: '7px 20px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          )}

          {tab === 'grading' && (
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#d0c4a0' }}>
              <h2 className="font-bold text-purple-900 mb-4">Grading Settings</h2>
              <div style={{ marginBottom: '20px', padding: '12px', background: '#f9f6ee', borderRadius: '6px', border: '1px solid #e8e0d0' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#5B2C83', marginBottom: '8px' }}>10-Point Grading Scale</div>
                {[['A','90-100'],['B','80-89'],['C','70-79'],['D','60-69'],['F','0-59']].map(([g,r]) => (
                  <div key={g} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '4px', fontSize: '12px' }}>
                    <span style={{ fontWeight: '700', minWidth: '20px' }}>{g}</span>
                    <span style={{ color: '#888' }}>{r}%</span>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#5B2C83', marginBottom: '8px' }}>GPA Weighting</div>
                {[['Standard','4.0 max'],['Honors','5.0 max'],['AP / College Level','6.0 max']].map(([t,s]) => (
                  <div key={t} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 10px', border: '1px solid #e8e0d0', borderRadius: '4px', marginBottom: '4px', fontSize: '12px' }}>
                    <span>{t}</span><span style={{ fontWeight: '600', color: '#C47A2C' }}>{s}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Athletics Minimum GPA (this year)</label>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <select value={minGPA} onChange={(e) => setMinGPA(e.target.value)} style={{ padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}>
                    <option>1.5</option>
                    <option>2.0</option>
                    <option>2.5</option>
                    <option>3.0</option>
                  </select>
                  <span style={{ fontSize: '11px', color: '#888' }}>Hard rule: no failing class grades (cannot be changed)</span>
                </div>
              </div>
              <button onClick={save} style={{ padding: '7px 20px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                {saved ? 'Saved!' : 'Save Changes'}
              </button>
            </div>
          )}

          {tab === 'accounts' && (
            <div className="bg-white rounded-lg border p-6" style={{ borderColor: '#d0c4a0' }}>
              <h2 className="font-bold text-purple-900 mb-4">User Account Settings</h2>
              <div style={{ marginBottom: '16px', padding: '12px', background: '#f9f6ee', borderRadius: '6px', border: '1px solid #e8e0d0' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#5B2C83', marginBottom: '8px' }}>Session Timeouts</div>
                {[['Student','4 hours (extended by active video)'],['Parent','2 hours'],['Teacher','1 hour'],['Admin','30 minutes']].map(([r,t]) => (
                  <div key={r} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px', borderBottom: '1px solid #ede8dc' }}>
                    <span>{r}</span><span style={{ color: '#888' }}>{t}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginBottom: '16px' }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: '#5B2C83', marginBottom: '8px' }}>Two-Factor Authentication</div>
                {[['Admin','Mandatory'],['Teacher','Mandatory'],['Parent','Optional'],['Student','Optional']].map(([r,req]) => (
                  <div key={r} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '12px', borderBottom: '1px solid #ede8dc' }}>
                    <span>{r}</span>
                    <span style={{ fontWeight: '600', color: req === 'Mandatory' ? '#C47A2C' : '#888' }}>{req}</span>
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px 14px', background: '#fdebd0', borderRadius: '6px', fontSize: '11px', color: '#7a3c00', borderLeft: '3px solid #C47A2C' }}>
                To manage individual user accounts, go to the Students or Staff pages.
              </div>
            </div>
          )}
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}