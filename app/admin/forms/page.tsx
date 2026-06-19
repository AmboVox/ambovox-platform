'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import AdminSidebar from '@/components/layout/AdminSidebar'
import StainedGlassBar from '@/components/layout/StainedGlassBar'

const PENDING_DOCS = [
  { id: 1, doc: 'Field Trip Permission Slip', family: 'Kim Family', from: 'Ms. Hart', action: 'Upload + Sign', status: 'Pending' },
  { id: 2, doc: 'Tuition Invoice — Fall 2026', family: 'Kim Family', from: 'Admin', action: 'Acknowledge + Sign', status: 'Pending' },
  { id: 3, doc: 'Lab Safety Agreement', family: 'Ellis Family', from: 'Admin', action: 'Acknowledge + Sign', status: 'Overdue' },
  { id: 4, doc: 'Enrollment Re-registration', family: 'All Families', from: 'Admin', action: 'Upload + Sign', status: 'In Progress' },
]

const INVOICES = [
  { id: 1, family: 'Kim Family', amount: '$4,200', due: 'Jul 1', status: 'Pending' },
  { id: 2, family: 'Ellis Family', amount: '$4,200', due: 'Jun 1', status: 'Overdue' },
  { id: 3, family: 'Dumont Family', amount: '$850', due: 'Jun 15', status: 'Partial' },
  { id: 4, family: 'Anand Family', amount: '$4,200', due: 'Jul 1', status: 'Paid' },
]

export default function FormsPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [showAssign, setShowAssign] = useState(false)
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

  const statusColor = (s: string) => s === 'Paid' ? { bg: '#d4edda', color: '#155724' } : s === 'Overdue' ? { bg: '#f8d7da', color: '#721c24' } : s === 'Partial' ? { bg: '#fdebd0', color: '#7a3c00' } : { bg: '#fff3cd', color: '#856404' }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: '#F4EFE3' }}>
      <p className="text-purple-900 font-semibold">Loading...</p>
    </div>
  )

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#F4EFE3' }}>
      <StainedGlassBar />
      <div className="flex flex-1 overflow-hidden">
        <AdminSidebar displayName={user.display_name} activePage="/admin/forms" badges={{ training: 2, calendar: 3, announcements: 1, forms: 7, prayer: 1, messages: 5 }} />
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold" style={{ color: '#C47A2C' }}>Forms & Payments</h1>
            <button onClick={() => setShowAssign(!showAssign)} style={{ padding: '7px 16px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
              Assign Document
            </button>
          </div>

          <div className="grid grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total Outstanding', value: '$48,200' },
              { label: 'Paid This Month', value: '$12,400' },
              { label: 'Pending Signatures', value: '14' },
              { label: 'Overdue Invoices', value: '3' },
            ].map(card => (
              <div key={card.label} className="bg-white rounded-lg p-4 border" style={{ borderColor: '#d0c4a0' }}>
                <div style={{ fontSize: '10px', color: '#888', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '4px' }}>{card.label}</div>
                <div style={{ fontSize: '20px', fontWeight: '700', color: '#C47A2C' }}>{card.value}</div>
              </div>
            ))}
          </div>

          {showAssign && (
            <div className="bg-white rounded-lg border p-6 mb-6" style={{ borderColor: '#d0c4a0' }}>
              <h2 className="font-bold text-purple-900 mb-4">Assign Document to Family</h2>
              <div className="grid grid-cols-2 gap-3 mb-3">
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Document Type</label>
                  <select style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}>
                    <option>Tuition Invoice</option>
                    <option>Enrollment Form</option>
                    <option>Permission Slip</option>
                    <option>Policy Acknowledgment</option>
                    <option>Receipt</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Assign To</label>
                  <select style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}>
                    <option>Select family...</option>
                    <option>Kim Family</option>
                    <option>Ellis Family</option>
                    <option>Dumont Family</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Action Required</label>
                  <select style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }}>
                    <option>Upload + E-Signature</option>
                    <option>Acknowledge + E-Signature</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Due Date</label>
                  <input type="date" style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
                </div>
              </div>
              <div className="mb-3">
                <label style={{ fontSize: '10px', fontWeight: '600', textTransform: 'uppercase', display: 'block', marginBottom: '4px' }}>Notes / Amount</label>
                <input placeholder="e.g. Fall 2026 Tuition — $4,200" style={{ width: '100%', padding: '7px 10px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px' }} />
              </div>
              <div className="flex gap-2">
                <button style={{ padding: '7px 16px', background: '#C47A2C', color: 'white', border: 'none', borderRadius: '4px', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Assign Document</button>
                <button onClick={() => setShowAssign(false)} style={{ padding: '7px 16px', border: '1px solid #c8bea0', borderRadius: '4px', fontSize: '12px', cursor: 'pointer', background: 'white' }}>Cancel</button>
              </div>
            </div>
          )}

          <div className="bg-white rounded-lg border mb-6" style={{ borderColor: '#d0c4a0' }}>
            <div className="p-4 border-b font-bold text-purple-900" style={{ borderColor: '#d0c4a0' }}>Document Signature Tracker</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9f6ee' }}>
                  {['Document','Family','Assigned By','Action Required','Status',''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#C47A2C', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PENDING_DOCS.map(d => {
                  const sc = statusColor(d.status)
                  return (
                    <tr key={d.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                      <td style={{ padding: '8px 14px', fontWeight: '600' }}>{d.doc}</td>
                      <td style={{ padding: '8px 14px' }}>{d.family}</td>
                      <td style={{ padding: '8px 14px', color: '#888' }}>{d.from}</td>
                      <td style={{ padding: '8px 14px' }}>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', background: '#cce5ff', color: '#004085', fontWeight: '600' }}>{d.action}</span>
                      </td>
                      <td style={{ padding: '8px 14px' }}>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: sc.bg, color: sc.color }}>{d.status}</span>
                      </td>
                      <td style={{ padding: '8px 14px' }}>
                        <button style={{ fontSize: '11px', padding: '3px 10px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>View</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="bg-white rounded-lg border" style={{ borderColor: '#d0c4a0' }}>
            <div className="p-4 border-b font-bold text-purple-900" style={{ borderColor: '#d0c4a0' }}>Outstanding Invoices</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ background: '#f9f6ee' }}>
                  {['Family','Amount','Due Date','Status',''].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '8px 14px', fontSize: '10px', fontWeight: '600', color: '#C47A2C', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: '1px solid #e8e0d0' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {INVOICES.map(inv => {
                  const sc = statusColor(inv.status)
                  return (
                    <tr key={inv.id} style={{ borderBottom: '1px solid #ede8dc' }}>
                      <td style={{ padding: '8px 14px', fontWeight: '600' }}>{inv.family}</td>
                      <td style={{ padding: '8px 14px' }}>{inv.amount}</td>
                      <td style={{ padding: '8px 14px', color: '#888' }}>{inv.due}</td>
                      <td style={{ padding: '8px 14px' }}>
                        <span style={{ fontSize: '10px', padding: '2px 8px', borderRadius: '10px', fontWeight: '600', background: sc.bg, color: sc.color }}>{inv.status}</span>
                      </td>
                      <td style={{ padding: '8px 14px' }}>
                        <button style={{ fontSize: '11px', padding: '3px 10px', border: '1px solid #c8bea0', borderRadius: '4px', cursor: 'pointer', background: 'white' }}>View</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <StainedGlassBar />
    </div>
  )
}