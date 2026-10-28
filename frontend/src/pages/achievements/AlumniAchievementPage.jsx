import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Award,
  Trophy,
  Heart,
  Plus,
  Filter,
  ExternalLink,
  ShieldCheck,
  TrendingUp,
  FileCheck2,
  Sparkles,
  X,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function AlumniAchievementPage() {
  const { user, role } = useAuth()
  const [achievements, setAchievements] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('ALL')
  const [cheeringId, setCheeringId] = useState(null)

  // Share Milestone Modal State
  const [showShareModal, setShowShareModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'PROMOTION',
    proof_url: '',
    year_achieved: new Date().getFullYear(),
  })

  const fetchAchievements = async () => {
    try {
      setLoading(true)
      setError('')
      const params = {}
      if (selectedCategory !== 'ALL') params.category = selectedCategory

      const res = await api.get('/achievements', { params })
      if (res?.success && res.data) {
        setAchievements(res.data.achievements || [])
      }
    } catch (err) {
      setError(err.message || 'Failed to load achievements.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAchievements()
  }, [selectedCategory])

  const handleCheer = async (achievementId) => {
    try {
      setCheeringId(achievementId)
      const res = await api.post(`/achievements/${achievementId}/cheer`)
      if (res?.success && res.data) {
        setAchievements((prev) =>
          prev.map((item) =>
            item.id === achievementId ? { ...item, cheers_count: res.data.cheers_count } : item
          )
        )
      }
    } catch (err) {
      alert(`Could not cheer: ${err.message}`)
    } finally {
      setCheeringId(null)
    }
  }

  const handleShareMilestone = async (e) => {
    e.preventDefault()
    try {
      setSubmitting(true)
      const res = await api.post('/achievements', form)
      if (res?.success) {
        setShowShareModal(false)
        setForm({
          title: '',
          description: '',
          category: 'PROMOTION',
          proof_url: '',
          year_achieved: new Date().getFullYear(),
        })
        fetchAchievements()
      }
    } catch (err) {
      alert(`Submission error: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleModerate = async (achievementId, status) => {
    try {
      const res = await api.put(`/achievements/${achievementId}/moderate`, { status })
      if (res?.success) {
        fetchAchievements()
      }
    } catch (err) {
      alert(`Moderation failed: ${err.message}`)
    }
  }

  const categories = [
    { id: 'ALL', label: 'All Milestones' },
    { id: 'PROMOTION', label: 'Promotions & Leadership' },
    { id: 'FUNDING', label: 'Startups & Funding' },
    { id: 'PATENT', label: 'Patents & Inventions' },
    { id: 'PUBLICATION', label: 'Research Publications' },
    { id: 'AWARD', label: 'Industry Honors' },
  ]

  const getCategoryBadge = (cat) => {
    switch (cat) {
      case 'FUNDING':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200'
      case 'PROMOTION':
        return 'bg-blue-50 text-blue-800 border-blue-200'
      case 'PATENT':
        return 'bg-amber-50 text-amber-800 border-amber-200'
      case 'PUBLICATION':
        return 'bg-purple-50 text-purple-800 border-purple-200'
      case 'AWARD':
        return 'bg-[#C4A878]/30 text-[#244B3A] border-[#C4A878]'
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#D8D2C4] gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#244B3A]/10 text-[#244B3A] text-xs font-semibold border border-[#244B3A]/20 mb-2">
            <Trophy className="w-3.5 h-3.5 text-[#C4A878]" />
            <span>Campus Wall of Honor</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#333333] tracking-tight">
            Alumni Achievement Wall
          </h1>
          <p className="mt-1 text-sm text-[#333333]/70">
            Celebrating career milestones, Series A/B funding, patents granted, and prestigious international honors from our alumni community.
          </p>
        </div>

        {(role === 'ALUMNI' || role === 'ADMIN') && (
          <button
            onClick={() => setShowShareModal(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#244B3A] hover:bg-[#3A5F50] text-white font-bold rounded-xl text-xs shadow-md transition"
          >
            <Plus className="w-4 h-4 text-[#C4A878]" />
            <span>Share Your Milestone</span>
          </button>
        )}
      </div>

      {/* Categories Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map((c) => (
          <button
            key={c.id}
            onClick={() => setSelectedCategory(c.id)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap ${
              selectedCategory === c.id
                ? 'bg-[#244B3A] text-white shadow-xs'
                : 'bg-white text-[#333333] hover:bg-[#F5F1E8] border border-[#D8D2C4]'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Achievement Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-[#244B3A] text-xs font-semibold">
          Loading alumni milestones...
        </div>
      ) : error ? (
        <div className="p-6 text-center text-rose-600 text-xs font-semibold">{error}</div>
      ) : achievements.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-[#D8D2C4] space-y-3">
          <Award className="w-12 h-12 text-[#C4A878] mx-auto" />
          <h3 className="text-base font-bold text-[#333333]">No Milestones in This Category</h3>
          <p className="text-xs text-[#333333]/70 max-w-sm mx-auto">
            Be the first alumnus to record a promotion, patent, or startup milestone!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {achievements.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl border border-[#D8D2C4] p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div className="space-y-4">
                {/* Header Pill & Year */}
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getCategoryBadge(
                      item.category
                    )}`}
                  >
                    {item.category}
                  </span>
                  <span className="text-xs font-bold text-slate-400">
                    {item.year_achieved}
                  </span>
                </div>

                {/* Title & Body */}
                <div>
                  <h3 className="text-base font-extrabold text-[#333333] leading-snug">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs text-[#333333]/80 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Alumnus Identity */}
                <div className="pt-3 border-t border-[#D8D2C4]/50 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-[#244B3A] text-[#F5F1E8] font-black text-xs flex items-center justify-center border border-[#C4A878]">
                    {item.user_name?.[0] || 'A'}
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-xs font-extrabold text-[#333333] truncate">
                      {item.user_name}
                    </p>
                    <p className="text-[10px] text-[#333333]/70 truncate">
                      {item.current_position || 'Alumnus'} {item.current_company ? `@ ${item.current_company}` : ''}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Actions: Cheers & Links */}
              <div className="mt-5 pt-3 border-t border-[#D8D2C4]/60 flex items-center justify-between">
                <button
                  onClick={() => handleCheer(item.id)}
                  disabled={cheeringId === item.id}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F1E8] hover:bg-[#D8D2C4] text-[#244B3A] rounded-xl text-xs font-bold transition group"
                >
                  <Heart
                    className={`w-3.5 h-3.5 text-rose-500 transition-transform ${
                      cheeringId === item.id ? 'scale-125' : 'group-hover:scale-110'
                    }`}
                  />
                  <span>Campus Cheers</span>
                  <span className="ml-1 px-1.5 py-0.2 rounded-full bg-[#244B3A]/10 text-[10px] font-black">
                    {item.cheers_count || 0}
                  </span>
                </button>

                <div className="flex items-center gap-2">
                  {item.proof_url && (
                    <a
                      href={item.proof_url}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-slate-400 hover:text-[#244B3A] transition"
                      title="View Press Release / Proof"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}

                  {role === 'ADMIN' && (
                    <button
                      onClick={() =>
                        handleModerate(
                          item.id,
                          item.status === 'APPROVED' ? 'FLAGGED' : 'APPROVED'
                        )
                      }
                      className="text-[10px] font-bold text-slate-500 hover:text-slate-800 underline"
                    >
                      {item.status === 'APPROVED' ? 'Flag' : 'Approve'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Share Milestone Modal */}
      {showShareModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#D8D2C4] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8D2C4]">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-[#C4A878]" />
                <h3 className="text-base font-extrabold text-[#333333]">Share Career Milestone</h3>
              </div>
              <button
                onClick={() => setShowShareModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleShareMilestone} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#333333] mb-1">Milestone Category *</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                >
                  <option value="PROMOTION">Promotion / Executive Role</option>
                  <option value="FUNDING">Startup Founded / Venture Funding</option>
                  <option value="PATENT">Patent Granted / Technical Innovation</option>
                  <option value="PUBLICATION">Research Paper / Journal Publication</option>
                  <option value="AWARD">National / Industry Honor</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#333333] mb-1">Headline Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Promoted to Senior Staff ML Engineer at Google"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#333333] mb-1">Description & Impact *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Briefly describe what this achievement entails and how your campus foundation inspired you..."
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#333333] mb-1">Year *</label>
                  <input
                    type="number"
                    required
                    value={form.year_achieved}
                    onChange={(e) =>
                      setForm({ ...form, year_achieved: parseInt(e.target.value) || 2026 })
                    }
                    className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                  />
                </div>
                <div>
                  <label className="block font-bold text-[#333333] mb-1">External Link</label>
                  <input
                    type="url"
                    placeholder="https://news.ycombinator.com/..."
                    value={form.proof_url}
                    onChange={(e) => setForm({ ...form, proof_url: e.target.value })}
                    className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowShareModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-[#333333] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#244B3A] hover:bg-[#3A5F50] text-white font-bold rounded-xl shadow-xs transition"
                >
                  {submitting ? 'Submitting...' : 'Post Milestone'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
