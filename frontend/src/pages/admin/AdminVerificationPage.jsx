import React, { useState, useEffect } from 'react'
import { ShieldCheck, CheckCircle2, XCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export const AdminVerificationPage = () => {
  const [alumniList, setAlumniList] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionNotes, setActionNotes] = useState({})
  const [processingId, setProcessingId] = useState(null)

  const fetchPendingAlumni = async () => {
    setLoading(true)
    try {
      const res = await api.get('/admin/alumni-verification?status=PENDING')
      if (res.success && res.data) {
        setAlumniList(res.data.alumni || [])
      }
    } catch (err) {
      console.error('Failed to fetch verification queue:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPendingAlumni()
  }, [])

  const handleDecision = async (userId, status) => {
    setProcessingId(userId)
    const notes = actionNotes[userId] || ''
    try {
      const res = await api.put(`/admin/alumni-verification/${userId}`, {
        status,
        notes: notes || `Verification decision ${status} by administrator.`,
      })
      if (res.success) {
        fetchPendingAlumni()
      }
    } catch (err) {
      alert(`Decision failed: ${err.message}`)
    } finally {
      setProcessingId(null)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Alumni Verification Queue</h1>
          <p className="text-xs text-slate-500">Authenticate degree and graduation credentials of self-registered alumni</p>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-slate-500 text-sm">Loading pending verifications...</div>
      ) : alumniList.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">Queue is Clear!</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            All alumni registration records are up to date. New alumni registrations requiring verification will appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {alumniList.map((alumnus) => {
            const ad = alumnus.alumni_detail || {}
            const p = alumnus.profile || {}
            return (
              <div key={alumnus.id} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-lg">
                      {p.first_name?.[0] || 'A'}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        {p.first_name} {p.last_name}
                      </h3>
                      <p className="text-xs text-slate-500">{alumnus.email}</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded-full text-xs font-bold shrink-0">
                    Pending Review
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Department</span>
                    <div className="font-bold text-slate-800 mt-0.5">{ad.department}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Degree</span>
                    <div className="font-bold text-slate-800 mt-0.5">{ad.degree}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Batch</span>
                    <div className="font-bold text-slate-800 mt-0.5">Class of {ad.graduation_year}</div>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-semibold uppercase">Current Role</span>
                    <div className="font-bold text-slate-800 mt-0.5">
                      {ad.current_position || 'Not specified'} at {ad.current_company || 'Independent'}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                  <input
                    type="text"
                    placeholder="Optional administrative review notes..."
                    value={actionNotes[alumnus.id] || ''}
                    onChange={(e) => setActionNotes({ ...actionNotes, [alumnus.id]: e.target.value })}
                    className="w-full sm:w-80 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={processingId === alumnus.id}
                      onClick={() => handleDecision(alumnus.id, 'REJECTED')}
                      className="px-4 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
                    >
                      Reject
                    </button>
                    <button
                      disabled={processingId === alumnus.id}
                      onClick={() => handleDecision(alumnus.id, 'VERIFIED')}
                      className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Approve & Verify</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
