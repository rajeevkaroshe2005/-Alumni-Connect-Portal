import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Users,
  Briefcase,
  Calendar,
  ArrowRight,
  ShieldCheck,
  Clock,
  MapPin,
  CheckCircle2,
  Bookmark,
  ExternalLink,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export const StudentDashboard = () => {
  const { user } = useAuth()
  const [recommendedMentors, setRecommendedMentors] = useState([])
  const [recommendedJobs, setRecommendedJobs] = useState([])
  const [upcomingEvents, setUpcomingEvents] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true)
      try {
        const [mentorsRes, jobsRes, eventsRes, bookingsRes] = await Promise.allSettled([
          api.get('/ai/recommended-mentors?limit=3'),
          api.get('/ai/recommended-jobs?limit=3'),
          api.get('/events?per_page=3'),
          api.get('/mentorship/my-bookings'),
        ])

        if (mentorsRes.status === 'fulfilled' && mentorsRes.value.success) {
          setRecommendedMentors(mentorsRes.value.data.recommendations || [])
        }
        if (jobsRes.status === 'fulfilled' && jobsRes.value.success) {
          setRecommendedJobs(jobsRes.value.data.recommendations || [])
        }
        if (eventsRes.status === 'fulfilled' && eventsRes.value.success) {
          setUpcomingEvents(eventsRes.value.data.events || [])
        }
        if (bookingsRes.status === 'fulfilled' && bookingsRes.value.success) {
          setMyBookings(bookingsRes.value.data.bookings || [])
        }
      } catch (err) {
        console.error('Error fetching dashboard items:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-[#244B3A] via-[#2D5845] to-[#1C3B2E] rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-[#244B3A]/20">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#C4A878] text-xs font-semibold border border-[#C4A878]/30">
            <Sparkles className="w-3.5 h-3.5 text-[#C4A878]" />
            <span>AI-Driven Student Workspace</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.profile?.first_name || 'Student'}!
          </h1>
          <p className="text-sm text-[#F5F1E8]/90 leading-relaxed">
            {user?.student_detail?.degree || 'Undergraduate'} in {user?.student_detail?.department || 'Engineering'} • Class of {user?.student_detail?.expected_graduation_year || 2027}.
            Here are your personalized alumni recommendations and active career milestones.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              to="/resume-scanner"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#C4A878] hover:bg-[#B39767] text-[#244B3A] font-bold rounded-xl text-xs shadow transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#244B3A]" />
              <span>Resume & Skill Gap Analysis</span>
            </Link>
            <Link
              to="/ai"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs border border-white/20 transition"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C4A878]" />
              <span>AI Recommendations</span>
            </Link>
            <Link
              to="/mentorship"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs border border-white/20 transition"
            >
              <Users className="w-3.5 h-3.5" />
              <span>Find a Mentor</span>
            </Link>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl text-xs border border-white/20 transition"
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Explore Opportunities</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Column Recommendations, Right Column Sessions & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: AI Recommendations */}
        <div className="lg:col-span-2 space-y-8">
          {/* AI Recommended Mentors */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Recommended Mentors for You</h2>
                  <p className="text-xs text-slate-500">Ranked by TF-IDF profile & skill vector similarity</p>
                </div>
              </div>
              <Link to="/mentorship" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">Computing mentor similarity vectors...</div>
            ) : recommendedMentors.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 bg-slate-50 rounded-xl">
                No mentor recommendations computed yet. Add skills to your profile to get matches!
              </div>
            ) : (
              <div className="space-y-3">
                {recommendedMentors.map((mentor) => (
                  <div
                    key={mentor.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 hover:bg-indigo-50/20 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-sm shrink-0">
                        {mentor.avatar_url ? (
                          <img src={mentor.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          mentor.mentor_name?.[0] || 'M'
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm text-slate-900">{mentor.mentor_name}</h3>
                          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-violet-100 text-violet-800 border border-violet-200">
                            {mentor.match_percentage}% Match
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">{mentor.headline || mentor.company || 'Alumni Mentor'}</p>
                        {mentor.reasons?.[0] && (
                          <p className="text-[11px] text-emerald-700 mt-1 flex items-center gap-1 font-medium">
                            <CheckCircle2 className="w-3 h-3 shrink-0" />
                            <span>{mentor.reasons[0]}</span>
                          </p>
                        )}
                      </div>
                    </div>

                    <Link
                      to={`/alumni/${mentor.user_id}`}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shrink-0 text-center shadow-sm"
                    >
                      Book Session
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* AI Recommended Jobs */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Recommended Jobs & Internships</h2>
                  <p className="text-xs text-slate-500">Opportunities tailored to your degree track and skill profile</p>
                </div>
              </div>
              <Link to="/jobs" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1">
                <span>Browse board</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">Loading recommended jobs...</div>
            ) : recommendedJobs.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-500 bg-slate-50 rounded-xl">
                No active job recommendations matching your profile right now.
              </div>
            ) : (
              <div className="space-y-3">
                {recommendedJobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl border border-slate-200 hover:border-indigo-300 bg-white hover:bg-slate-50/50 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">{job.title}</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                          {job.job_type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">
                        <span className="font-semibold text-slate-800">{job.company}</span> • {job.location}
                      </p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {job.skills_required?.slice(0, 4).map((s, idx) => (
                          <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Link
                        to={`/jobs/${job.id}`}
                        className="px-3.5 py-2 bg-slate-900 hover:bg-indigo-600 text-white rounded-xl text-xs font-semibold transition shadow-sm"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Upcoming Sessions & Campus Events */}
        <div className="space-y-8">
          {/* Active Mentorship Bookings */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>My Mentorship Sessions</span>
              </h3>
              <Link to="/mentorship/bookings" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                All Bookings
              </Link>
            </div>

            {myBookings.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                You have no scheduled mentorship sessions. Book a session with an alumni mentor today!
              </div>
            ) : (
              <div className="space-y-3">
                {myBookings.slice(0, 3).map((b) => (
                  <div key={b.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between font-bold text-slate-900">
                      <span>{b.mentor_name}</span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'PENDING' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <p className="text-slate-600 text-[11px]">
                      📅 {b.session_date} at {b.start_time} - {b.end_time}
                    </p>
                    {b.meeting_link && (
                      <a
                        href={b.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-indigo-600 font-semibold hover:underline text-[11px]"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Join Meeting Call
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Campus Events */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-600" />
                <span>Upcoming Events</span>
              </h3>
              <Link to="/events" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
                Calendar
              </Link>
            </div>

            {upcomingEvents.length === 0 ? (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
                No upcoming events scheduled.
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((evt) => (
                  <div key={evt.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-violet-100 text-violet-800">
                      {evt.event_type}
                    </span>
                    <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{evt.title}</h4>
                    <p className="text-slate-500 text-[11px] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(evt.start_time).toLocaleDateString()} at {new Date(evt.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <Link
                      to={`/events/${evt.id}`}
                      className="text-indigo-600 hover:text-indigo-700 font-semibold text-[11px] block mt-1"
                    >
                      {evt.is_registered ? '✓ Registered' : 'Register Now →'}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
