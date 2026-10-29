import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  FolderGit2,
  Plus,
  Users,
  Search,
  Filter,
  ExternalLink,
  Code2,
  CheckCircle2,
  Clock,
  Send,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  UserCheck,
  AlertCircle,
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function ProjectCollaborationPage() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [domainFilter, setDomainFilter] = useState('ALL')
  const [searchQuery, setSearchQuery] = useState('')

  // Create Project Modal State
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    domain: 'AI / Machine Learning',
    required_skills: '',
    open_roles: '',
    repo_url: '',
  })

  // Apply to Project Modal State
  const [selectedProjectForApply, setSelectedProjectForApply] = useState(null)
  const [applying, setApplying] = useState(false)
  const [applyForm, setApplyForm] = useState({
    role_applied: '',
    pitch_statement: '',
  })

  // View Applicants Modal for Project Creator
  const [managingProject, setManagingProject] = useState(null)
  const [loadingApplicants, setLoadingApplicants] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState(null)

  const fetchProjects = async () => {
    try {
      setLoading(true)
      setError('')
      const params = {}
      if (domainFilter !== 'ALL') params.domain = domainFilter
      if (searchQuery.trim()) params.q = searchQuery.trim()

      const res = await api.get('/projects', { params })
      if (res?.success && res.data) {
        setProjects(res.data.projects || [])
      }
    } catch (err) {
      setError(err.message || 'Failed to load collaboration projects.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProjects()
  }, [domainFilter])

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    fetchProjects()
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    try {
      setCreating(true)
      const res = await api.post('/projects', createForm)
      if (res?.success) {
        setShowCreateModal(false)
        setCreateForm({
          title: '',
          description: '',
          domain: 'AI / Machine Learning',
          required_skills: '',
          open_roles: '',
          repo_url: '',
        })
        fetchProjects()
      }
    } catch (err) {
      alert(`Project submission failed: ${err.message}`)
    } finally {
      setCreating(false)
    }
  }

  const handleApplySubmit = async (e) => {
    e.preventDefault()
    if (!selectedProjectForApply) return
    try {
      setApplying(true)
      const res = await api.post(`/projects/${selectedProjectForApply.id}/apply`, applyForm)
      if (res?.success) {
        alert('Application submitted successfully! The project lead has been notified.')
        setSelectedProjectForApply(null)
        setApplyForm({ role_applied: '', pitch_statement: '' })
        fetchProjects()
      }
    } catch (err) {
      alert(`Application error: ${err.message}`)
    } finally {
      setApplying(false)
    }
  }

  const openManageModal = async (project) => {
    setManagingProject(project)
    setLoadingApplicants(true)
    try {
      const res = await api.get(`/projects/${project.id}`)
      if (res?.success && res.data?.project) {
        setManagingProject(res.data.project)
      }
    } catch (err) {
      alert(`Failed to load applications: ${err.message}`)
    } finally {
      setLoadingApplicants(false)
    }
  }

  const handleApplicationDecision = async (appId, status) => {
    try {
      setActionLoadingId(appId)
      const res = await api.put(`/projects/applications/${appId}`, { status })
      if (res?.success) {
        // update local list
        setManagingProject((prev) => ({
          ...prev,
          applications: prev.applications?.map((a) =>
            a.id === appId ? { ...a, status } : a
          ),
        }))
      }
    } catch (err) {
      alert(`Decision error: ${err.message}`)
    } finally {
      setActionLoadingId(null)
    }
  }

  const domains = [
    'ALL',
    'AI / Machine Learning',
    'Cloud & Distributed Systems',
    'Full-Stack & Mobile',
    'IoT & Embedded Systems',
    'FinTech & Blockchain',
    'Healthcare & BioTech',
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#D8D2C4] gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#244B3A]/10 text-[#244B3A] text-xs font-semibold border border-[#244B3A]/20 mb-2">
            <FolderGit2 className="w-3.5 h-3.5 text-[#244B3A]" />
            <span>Campus & Alumni Open Source Incubator</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#333333] tracking-tight">
            Project Collaboration Board
          </h1>
          <p className="mt-1 text-sm text-[#333333]/70">
            Form cross-functional teams around capstone ventures, hackathons, research prototypes, and alumni-led startups.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#244B3A] hover:bg-[#3A5F50] text-white font-bold rounded-xl text-xs shadow-md transition"
        >
          <Plus className="w-4 h-4 text-[#C4A878]" />
          <span>Pitch a Project</span>
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#D8D2C4] shadow-xs">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects by skills, title, or roles..."
            className="w-full pl-9 pr-4 py-2 bg-[#F5F1E8]/60 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#244B3A]"
          />
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {domains.map((d) => (
            <button
              key={d}
              onClick={() => setDomainFilter(d)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                domainFilter === d
                  ? 'bg-[#244B3A] text-white shadow-xs'
                  : 'bg-[#F5F1E8] text-[#333333] hover:bg-[#D8D2C4]'
              }`}
            >
              {d === 'ALL' ? 'All Domains' : d}
            </button>
          ))}
        </div>
      </div>

      {/* Project Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-[#244B3A] text-xs font-semibold">
          Loading collaboration board...
        </div>
      ) : error ? (
        <div className="p-6 text-center text-rose-600 text-xs font-semibold">{error}</div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#D8D2C4] space-y-3">
          <Layers className="w-10 h-10 text-slate-300 mx-auto" />
          <h3 className="text-base font-bold text-[#333333]">No Projects Found</h3>
          <p className="text-xs text-[#333333]/70 max-w-md mx-auto">
            Be the first to propose a technical venture or open-source idea for students and alumni to collaborate on!
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="mt-2 inline-flex items-center gap-2 px-4 py-2 bg-[#244B3A] text-white rounded-xl text-xs font-bold"
          >
            <Plus className="w-3.5 h-3.5 text-[#C4A878]" />
            <span>Create First Project</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((proj) => {
            const isCreator = proj.creator_id === user?.id
            const rawSkills = proj.skills_needed || proj.required_skills
            const skillsList = Array.isArray(rawSkills)
              ? rawSkills
              : rawSkills
              ? String(rawSkills).split(',').map((s) => s.trim()).filter(Boolean)
              : []

            const rawRoles = proj.roles_needed || proj.open_roles
            const rolesList = Array.isArray(rawRoles)
              ? rawRoles
              : rawRoles
              ? String(rawRoles).split(',').map((r) => r.trim()).filter(Boolean)
              : []

            return (
              <div
                key={proj.id}
                className="bg-white rounded-3xl border border-[#D8D2C4] p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Domain & Status Badge */}
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#244B3A]/10 text-[#244B3A] border border-[#244B3A]/20">
                      {proj.domain || 'Tech'}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        proj.status === 'OPEN'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : proj.status === 'IN_PROGRESS'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-extrabold text-[#333333] leading-snug">
                      {proj.title}
                    </h3>
                    <p className="mt-1 text-xs text-[#333333]/70 line-clamp-3 leading-relaxed">
                      {proj.description}
                    </p>
                  </div>

                  {/* Open Roles Required */}
                  {rolesList.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#333333]/60 flex items-center gap-1">
                        <Users className="w-3 h-3 text-[#244B3A]" /> Open Roles:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {rolesList.map((r, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-[#F5F1E8] text-[#244B3A] border border-[#C4A878]/40"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Skills Tech Stack */}
                  {skillsList.length > 0 && (
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#333333]/60 flex items-center gap-1">
                        <Code2 className="w-3 h-3 text-[#3A5F50]" /> Tech Stack:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {skillsList.map((s, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-50 text-slate-700 border border-slate-200"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Creator Info */}
                  <div className="pt-2 border-t border-[#D8D2C4]/50 flex items-center justify-between text-xs text-[#333333]/70">
                    <span className="truncate">
                      By <span className="font-bold text-[#333333]">{proj.creator_name}</span> ({proj.creator_role})
                    </span>
                    {proj.repo_url && (
                      <a
                        href={proj.repo_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#244B3A] hover:underline inline-flex items-center gap-0.5"
                      >
                        <span>Repo</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* Bottom CTA Button */}
                <div className="mt-5 pt-3 border-t border-[#D8D2C4]/60">
                  {isCreator ? (
                    <button
                      onClick={() => openManageModal(proj)}
                      className="w-full py-2 bg-[#244B3A]/10 hover:bg-[#244B3A]/20 text-[#244B3A] font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition"
                    >
                      <UserCheck className="w-3.5 h-3.5" />
                      <span>Review Applicants ({proj.applications_count || 0})</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedProjectForApply(proj)
                        setApplyForm({
                          role_applied: rolesList[0] || 'Contributor',
                          pitch_statement: '',
                        })
                      }}
                      className="w-full py-2 bg-[#244B3A] hover:bg-[#3A5F50] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                    >
                      <Send className="w-3.5 h-3.5 text-[#C4A878]" />
                      <span>Apply to Join Team</span>
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pitch a Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#D8D2C4] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8D2C4]">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-[#244B3A]" />
                <h3 className="text-base font-extrabold text-[#333333]">Pitch a New Project</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#333333] mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Autonomous Campus Delivery Robot"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#333333] mb-1">Domain / Field *</label>
                <select
                  value={createForm.domain}
                  onChange={(e) => setCreateForm({ ...createForm, domain: e.target.value })}
                  className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                >
                  {domains.filter((d) => d !== 'ALL').map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#333333] mb-1">Project Description *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Detail the technical vision, problem statement, milestones, and expected commitment..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#333333] mb-1">Open Roles (comma separated)</label>
                <input
                  type="text"
                  placeholder="Frontend Developer, PyTorch Specialist, Cloud Architect"
                  value={createForm.open_roles}
                  onChange={(e) => setCreateForm({ ...createForm, open_roles: e.target.value })}
                  className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#333333] mb-1">Required Tech Stack (comma separated)</label>
                <input
                  type="text"
                  placeholder="React, ROS2, Python, Docker"
                  value={createForm.required_skills}
                  onChange={(e) => setCreateForm({ ...createForm, required_skills: e.target.value })}
                  className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#333333] mb-1">Repository / Spec URL (Optional)</label>
                <input
                  type="url"
                  placeholder="https://github.com/organization/repo"
                  value={createForm.repo_url}
                  onChange={(e) => setCreateForm({ ...createForm, repo_url: e.target.value })}
                  className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-[#333333] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-[#244B3A] hover:bg-[#3A5F50] text-white font-bold rounded-xl shadow-xs transition"
                >
                  {creating ? 'Publishing...' : 'Publish Project'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Apply to Project Modal */}
      {selectedProjectForApply && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#D8D2C4] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8D2C4]">
              <div>
                <h3 className="text-base font-extrabold text-[#333333]">Apply to Join Project</h3>
                <p className="text-[11px] text-[#333333]/70">{selectedProjectForApply.title}</p>
              </div>
              <button
                onClick={() => setSelectedProjectForApply(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApplySubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#333333] mb-1">Target Role *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Backend Engineer or ML Research Assistant"
                  value={applyForm.role_applied}
                  onChange={(e) => setApplyForm({ ...applyForm, role_applied: e.target.value })}
                  className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#333333] mb-1">Pitch & Statement of Interest *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Share relevant coursework, prior projects, GitHub repos, and why you want to contribute..."
                  value={applyForm.pitch_statement}
                  onChange={(e) => setApplyForm({ ...applyForm, pitch_statement: e.target.value })}
                  className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedProjectForApply(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-[#333333] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={applying}
                  className="px-5 py-2 bg-[#244B3A] hover:bg-[#3A5F50] text-white font-bold rounded-xl shadow-xs transition"
                >
                  {applying ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Applicants Modal for Project Lead */}
      {managingProject && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-[#D8D2C4] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8D2C4]">
              <div>
                <h3 className="text-base font-extrabold text-[#333333]">Applicant Review Desk</h3>
                <p className="text-xs text-[#333333]/70">{managingProject.title}</p>
              </div>
              <button
                onClick={() => setManagingProject(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingApplicants ? (
              <div className="py-8 text-center text-xs text-[#244B3A]">Loading candidates...</div>
            ) : !managingProject.applications || managingProject.applications.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No students or alumni have applied to this project yet.
              </div>
            ) : (
              <div className="divide-y divide-[#D8D2C4]/60">
                {managingProject.applications.map((app) => (
                  <div key={app.id} className="py-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-[#333333] text-sm">{app.applicant_name}</h4>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#F5F1E8] text-[#244B3A]">
                            Role: {app.role_applied}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400">
                          {app.applicant_headline || 'Candidate'} • Applied on {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          app.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : app.status === 'REJECTED'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {app.status}
                      </span>
                    </div>

                    <div className="p-3 bg-[#F5F1E8]/60 rounded-xl text-xs text-[#333333]/90 border border-[#D8D2C4]/50">
                      <span className="font-semibold text-[#244B3A]">Pitch: </span>
                      {app.pitch_statement}
                    </div>

                    {app.status === 'PENDING' && (
                      <div className="flex justify-end gap-2 pt-1">
                        <button
                          disabled={actionLoadingId === app.id}
                          onClick={() => handleApplicationDecision(app.id, 'REJECTED')}
                          className="px-3 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                        >
                          Decline
                        </button>
                        <button
                          disabled={actionLoadingId === app.id}
                          onClick={() => handleApplicationDecision(app.id, 'ACCEPTED')}
                          className="px-3 py-1 text-xs font-bold text-white bg-[#244B3A] hover:bg-[#3A5F50] rounded-lg shadow-xs transition"
                        >
                          Accept to Team
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
