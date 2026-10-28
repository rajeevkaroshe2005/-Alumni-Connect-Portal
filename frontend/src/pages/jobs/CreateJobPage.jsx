import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Briefcase, ArrowLeft, PlusCircle } from 'lucide-react'
import api from '../../services/api'

export const CreateJobPage = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    job_type: 'FULL_TIME',
    experience_level: 'ENTRY',
    description: '',
    requirements: '',
    skills_required: '',
    salary_range: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const res = await api.post('/jobs', formData)
      if (res.success) {
        navigate('/jobs')
      }
    } catch (err) {
      setError(err.message || 'Failed to post opportunity.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <Link to="/jobs" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to jobs</span>
      </Link>

      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Publish Career Opportunity</h1>
            <p className="text-xs text-slate-500">Post a job or internship opportunity for students and fellow alumni</p>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title *</label>
              <input
                type="text"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Software Engineer, ML Intern"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization *</label>
              <input
                type="text"
                name="company"
                required
                value={formData.company}
                onChange={handleChange}
                placeholder="e.g. Google, Microsoft, Startup"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Location *</label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Bengaluru, Remote, Hybrid"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Opportunity Type</label>
              <select
                name="job_type"
                value={formData.job_type}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                <option value="FULL_TIME">Full-Time</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="REMOTE">Remote</option>
                <option value="PART_TIME">Part-Time</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Experience Level</label>
              <select
                name="experience_level"
                value={formData.experience_level}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              >
                <option value="ENTRY">Entry Level (Freshers)</option>
                <option value="MID">Mid Level (1-4 Yrs)</option>
                <option value="SENIOR">Senior Level (5+ Yrs)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Required Skills (Comma separated) *</label>
            <input
              type="text"
              name="skills_required"
              required
              value={formData.skills_required}
              onChange={handleChange}
              placeholder="Python, React, MySQL, Docker, Kubernetes"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Salary Range / Stipend (Optional)</label>
            <input
              type="text"
              name="salary_range"
              value={formData.salary_range}
              onChange={handleChange}
              placeholder="e.g. ₹18,00,000 - ₹24,00,000 / year or ₹60,000 / month"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Opportunity Description *</label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe the role, day-to-day responsibilities, and team mission..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Requirements & Qualifications</label>
            <textarea
              name="requirements"
              rows={3}
              value={formData.requirements}
              onChange={handleChange}
              placeholder="Degree requirements, specific coursework, algorithms or tools proficiency..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>

          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <Link
              to="/jobs"
              className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-semibold rounded-xl text-xs shadow-sm transition"
            >
              {submitting ? 'Publishing...' : 'Publish Opportunity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
