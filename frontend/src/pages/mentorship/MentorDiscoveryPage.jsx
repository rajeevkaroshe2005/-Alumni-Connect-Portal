import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Search,
  Sparkles,
  ShieldCheck,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export const MentorDiscoveryPage = () => {
  const { role } = useAuth()
  const [mentors, setMentors] = useState([])
  const [aiRecommendations, setAiRecommendations] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMentorsData = async () => {
      setLoading(true)
      try {
        const [mentorsRes, aiRes] = await Promise.allSettled([
          api.get('/mentorship/mentors'),
          role === 'STUDENT' ? api.get('/ai/recommended-mentors') : Promise.resolve({ success: false }),
        ])

        if (mentorsRes.status === 'fulfilled' && mentorsRes.value.success) {
          setMentors(mentorsRes.value.data.mentors || [])
        }
        if (aiRes.status === 'fulfilled' && aiRes.value.success) {
          setAiRecommendations(aiRes.value.data.recommendations || [])
        }
      } catch (err) {
        console.error('Failed to load mentors:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMentorsData()
  }, [role])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Alumni Mentorship Network
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Book 1-on-1 career guidance, system design reviews, and mock interviews with verified alumni
          </p>
        </div>

        <Link
          to="/mentorship/my-bookings"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-xl text-xs transition shrink-0"
        >
          <Calendar className="w-4 h-4 text-indigo-600" />
          <span>My Scheduled Sessions</span>
        </Link>
      </div>

      {/* AI Recommendations Highlight (for students) */}
      {role === 'STUDENT' && aiRecommendations.length > 0 && (
        <div className="bg-gradient-to-r from-violet-50 to-indigo-50 border border-violet-200/80 rounded-3xl p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600 text-white flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">AI Top Match Recommendations</h2>
              <p className="text-xs text-slate-500">TF-IDF vector alignment with your degree, skills, and career goals</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {aiRecommendations.map((mentor) => (
              <div
                key={mentor.id}
                className="bg-white rounded-2xl p-5 border border-violet-200/60 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="font-bold text-slate-900 text-sm">{mentor.mentor_name}</div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 shrink-0">
                      {mentor.match_percentage}% Match
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{mentor.company || mentor.headline || 'Senior Alumni'}</p>
                  {mentor.reasons?.[0] && (
                    <p className="text-[11px] text-emerald-700 mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{mentor.reasons[0]}</span>
                    </p>
                  )}
                </div>

                <Link
                  to={`/alumni/${mentor.user_id}`}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl text-center shadow-sm transition"
                >
                  Book Session
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Full Mentor Directory */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-slate-900">All Available Mentors</h2>
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading mentors...</div>
        ) : mentors.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
            No mentors currently available.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((m) => (
              <div
                key={m.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center gap-3.5">
                    <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-lg shrink-0">
                      {m.avatar_url ? (
                        <img src={m.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        m.mentor_name?.[0] || 'M'
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{m.mentor_name}</h3>
                      <p className="text-xs text-slate-500">{m.company || m.headline || 'Industry Mentor'}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{m.years_of_experience} yrs experience</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{m.bio}</p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(Array.isArray(m.expertise_areas)
                      ? m.expertise_areas
                      : typeof m.expertise_areas === 'string'
                        ? m.expertise_areas.split(',').map((s) => s.trim())
                        : []
                    ).slice(0, 4).map((exp, idx) => (
                      <span key={idx} className="text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded font-medium">
                        {exp}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 font-medium">
                    ⏱ {m.session_duration_minutes} min calls
                  </span>
                  <Link
                    to={`/alumni/${m.user_id}`}
                    className="px-4 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                  >
                    View Availability
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
