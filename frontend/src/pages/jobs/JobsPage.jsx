import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase,
  Search,
  MapPin,
  Clock,
  Bookmark,
  Building,
  CheckCircle2,
  PlusCircle,
  ArrowRight,
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export const JobsPage = () => {
  const { role } = useAuth()
  const [jobs, setJobs] = useState([])
  const [search, setSearch] = useState('')
  const [jobType, setJobType] = useState('')
  const [expLevel, setExpLevel] = useState('')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})

  // Apply modal state
  const [applyingJob, setApplyingJob] = useState(null)
  const [coverNote, setCoverNote] = useState('')
  const [applyingSubmitting, setApplyingSubmitting] = useState(false)
  const [applicationSuccess, setApplicationSuccess] = useState('')

  const fetchJobs = async () => {
    setLoading(true)
    try {
      let url = `/jobs?page=${page}&per_page=10`
      if (search) url += `&q=${encodeURIComponent(search)}`
      if (jobType) url += `&job_type=${jobType}`
      if (expLevel) url += `&experience_level=${expLevel}`

      const res = await api.get(url)
      if (res.success && res.data) {
        setJobs(res.data.jobs || [])
        setPagination(res.data.pagination || {})
      }
    } catch (err) {
      console.error('Failed to load jobs:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchJobs()
  }, [page, jobType, expLevel])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchJobs()
  }

  const handleToggleSave = async (jobId) => {
    try {
      const res = await api.post(`/jobs/${jobId}/save`)
      if (res.success) {
        setJobs(jobs.map((j) => (j.id === jobId ? { ...j, is_saved: res.data.is_saved } : j)))
      }
    } catch (err) {
      alert(`Save failed: ${err.message}`)
    }
  }

  const handleApplySubmit = async (e) => {
    e.preventDefault()
    if (!applyingJob) return
    setApplyingSubmitting(true)
    try {
      const res = await api.post(`/jobs/${applyingJob.id}/apply`, {
        cover_note: coverNote,
      })
      if (res.success) {
        setApplicationSuccess(`Application submitted successfully for ${applyingJob.title}!`)
        setJobs(jobs.map((j) => (j.id === applyingJob.id ? { ...j, has_applied: true } : j)))
        setApplyingJob(null)
        setCoverNote('')
      }
    } catch (err) {
      alert(`Application error: ${err.message}`)
    } finally {
      setApplyingSubmitting(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Careers & Internships Hub
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Exclusive opportunities published directly by alumni leaders and university partners
          </p>
        </div>

        {(role === 'ALUMNI' || role === 'ADMIN') && (
          <Link
            to="/jobs/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-sm transition shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Opportunity</span>
          </Link>
        )}
      </div>

      {applicationSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{applicationSuccess}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Search by job title, company name, or skills (e.g. Full Stack, Amazon, Python)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm shadow-sm transition"
          >
            Search
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <select
            value={jobType}
            onChange={(e) => {
              setJobType(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="">All Opportunity Types</option>
            <option value="FULL_TIME">Full-Time Role</option>
            <option value="INTERNSHIP">Internship</option>
            <option value="REMOTE">Remote Role</option>
            <option value="PART_TIME">Part-Time</option>
          </select>

          <select
            value={expLevel}
            onChange={(e) => {
              setExpLevel(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700"
          >
            <option value="">All Experience Levels</option>
            <option value="ENTRY">Entry Level (Fresh Graduates)</option>
            <option value="MID">Mid Level (1-4 Years)</option>
            <option value="SENIOR">Senior Level (5+ Years)</option>
          </select>
        </div>
      </div>

      {/* Jobs Grid */}
      {loading ? (
        <div className="py-16 text-center text-slate-500 text-sm">Loading opportunities...</div>
      ) : jobs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-3">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <Briefcase className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">No Jobs Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            No opportunities matched your search criteria. Check back soon or try broader terms!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 p-6 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900">{job.title}</h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {job.job_type.replace('_', ' ')}
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {job.experience_level}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                  <span className="flex items-center gap-1.5 text-slate-800 font-semibold">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    {job.company}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {job.location}
                  </span>
                  {job.salary_range && (
                    <span className="text-emerald-700 font-semibold">{job.salary_range}</span>
                  )}
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">{job.description}</p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {job.skills_required?.slice(0, 5).map((skill, idx) => (
                    <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
                <button
                  onClick={() => handleToggleSave(job.id)}
                  className={`p-2.5 rounded-xl border transition ${
                    job.is_saved
                      ? 'bg-amber-50 border-amber-300 text-amber-600'
                      : 'border-slate-200 text-slate-400 hover:text-slate-700'
                  }`}
                  title={job.is_saved ? 'Bookmarked' : 'Save opportunity'}
                >
                  <Bookmark className="w-4 h-4 fill-current" />
                </button>

                <Link
                  to={`/jobs/${job.id}`}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition"
                >
                  Details
                </Link>

                {role === 'STUDENT' && (
                  <button
                    disabled={job.has_applied}
                    onClick={() => {
                      setApplyingJob(job)
                      setApplicationSuccess('')
                    }}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                      job.has_applied
                        ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {job.has_applied ? '✓ Applied' : 'Apply Now'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Apply Modal */}
      {applyingJob && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">
              Apply for {applyingJob.title} at {applyingJob.company}
            </h3>
            <p className="text-xs text-slate-500">
              Your profile skills and credentials will be sent directly to the alumni job poster.
            </p>

            <form onSubmit={handleApplySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cover Note / Pitch (Optional)
                </label>
                <textarea
                  rows={4}
                  value={coverNote}
                  onChange={(e) => setCoverNote(e.target.value)}
                  placeholder="Share a brief overview of why you are interested and your relevant projects..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setApplyingJob(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applyingSubmitting}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow transition"
                >
                  {applyingSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
