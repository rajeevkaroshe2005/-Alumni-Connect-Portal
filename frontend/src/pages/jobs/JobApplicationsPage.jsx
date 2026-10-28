import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Users, Mail, CheckCircle2, Clock, XCircle } from 'lucide-react'
import api from '../../services/api'

export const JobApplicationsPage = () => {
  const { jobId } = useParams()
  const [applications, setApplications] = useState([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState(null)

  const fetchApplications = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/jobs/${jobId}/applications`)
      if (res.success && res.data) {
        setApplications(res.data.applications || [])
      }
    } catch (err) {
      console.error('Failed to load job applications:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchApplications()
  }, [jobId])

  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingId(appId)
    try {
      const res = await api.put(`/jobs/applications/${appId}/status`, { status: newStatus })
      if (res.success) {
        setApplications(applications.map((a) => (a.id === appId ? { ...a, status: newStatus } : a)))
      }
    } catch (err) {
      alert(`Status update failed: ${err.message}`)
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/jobs" className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Candidate Applications Pipeline</h1>
          <p className="text-xs text-slate-500">Review applicants, candidate cover notes, and manage interview pipelines</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading applicants...</div>
        ) : applications.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No candidates have applied for this listing yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {applications.map((app) => (
              <div key={app.id} className="p-6 space-y-3 hover:bg-slate-50/50 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{app.applicant_name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                      {app.applicant_email} • Applied on {new Date(app.created_at).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-semibold">Status:</span>
                    <select
                      disabled={updatingId === app.id}
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-800"
                    >
                      <option value="APPLIED">Applied</option>
                      <option value="REVIEWING">Reviewing</option>
                      <option value="SHORTLISTED">Shortlisted</option>
                      <option value="ACCEPTED">Accepted / Offer</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                </div>

                {app.cover_note && (
                  <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-600 border border-slate-200/60">
                    <span className="font-semibold text-slate-800">Cover Note:</span> {app.cover_note}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
