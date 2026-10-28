import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Briefcase,
  Building,
  MapPin,
  Clock,
  ArrowLeft,
  CheckCircle2,
  Bookmark,
  Share2,
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export const JobDetailPage = () => {
  const { id } = useParams()
  const { role } = useAuth()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [coverNote, setCoverNote] = useState('')
  const [submittingApp, setSubmittingApp] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const fetchJob = async () => {
    setLoading(true)
    try {
      const res = await api.get(`/jobs/${id}`)
      if (res.success && res.data) {
        setJob(res.data.job)
      }
    } catch (err) {
      console.error('Failed to load job details:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJob()
  }, [id])

  const handleApply = async (e) => {
    e.preventDefault()
    setSubmittingApp(true)
    try {
      const res = await api.post(`/jobs/${id}/apply`, { cover_note: coverNote })
      if (res.success) {
        setSuccessMsg('Your application has been submitted successfully!')
        setApplying(false)
        fetchJob()
      }
    } catch (err) {
      alert(`Application failed: ${err.message}`)
    } finally {
      setSubmittingApp(false)
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-slate-500 text-sm">Loading job opportunity...</div>
  }

  if (!job) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Job Not Found</h2>
        <Link to="/jobs" className="text-sm font-semibold text-indigo-600">Back to jobs board</Link>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to all opportunities</span>
      </Link>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Main Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {job.job_type.replace('_', ' ')}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {job.experience_level}
              </span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">{job.title}</h1>
            <p className="text-sm font-medium text-slate-600 mt-1">{job.company} • {job.location}</p>
            {job.salary_range && (
              <p className="text-sm font-bold text-emerald-700 mt-1">{job.salary_range}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            {role === 'STUDENT' && (
              <button
                disabled={job.has_applied}
                onClick={() => setApplying(true)}
                className={`px-6 py-2.5 rounded-xl text-xs font-bold transition shadow-sm ${
                  job.has_applied
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                }`}
              >
                {job.has_applied ? '✓ Applied' : 'Apply for Role'}
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Opportunity Overview</h3>
          <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{job.description}</p>
        </div>

        {/* Requirements */}
        {job.requirements && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate Requirements</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">{job.requirements}</p>
          </div>
        )}

        {/* Required Skills */}
        <div className="space-y-3 pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Required Skills & Technologies</h3>
          <div className="flex flex-wrap gap-2">
            {job.skills_required?.map((s, idx) => (
              <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold">
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {applying && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Submit Application</h3>
            <form onSubmit={handleApply} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cover Note / Pitch (Optional)
                </label>
                <textarea
                  rows={4}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Introduce yourself and outline your top relevant achievements..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApplying(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingApp}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow transition"
                >
                  {submittingApp ? 'Submitting...' : 'Send Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
