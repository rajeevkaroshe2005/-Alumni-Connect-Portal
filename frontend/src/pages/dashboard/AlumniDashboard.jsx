import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  AlertTriangle,
  Briefcase,
  Users,
  Calendar,
  Clock,
  ArrowRight,
  PlusCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export const AlumniDashboard = () => {
  const { user } = useAuth()
  const [myJobs, setMyJobs] = useState([])
  const [myBookings, setMyBookings] = useState([])
  const [loading, setLoading] = useState(true)

  const isVerified = user?.alumni_detail?.verification_status === 'VERIFIED'

  useEffect(() => {
    const fetchAlumniData = async () => {
      setLoading(true)
      try {
        const [jobsRes, bookingsRes] = await Promise.allSettled([
          api.get('/jobs/my-postings'),
          api.get('/mentorship/my-bookings'),
        ])
        if (jobsRes.status === 'fulfilled' && jobsRes.value.success) {
          setMyJobs(jobsRes.value.data.jobs || [])
        }
        if (bookingsRes.status === 'fulfilled' && bookingsRes.value.success) {
          setMyBookings(bookingsRes.value.data.bookings || [])
        }
      } catch (err) {
        console.error('Failed to load alumni dashboard:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAlumniData()
  }, [])

  const handleBookingDecision = async (bookingId, decision) => {
    try {
      await api.put(`/mentorship/bookings/${bookingId}/decision`, {
        decision,
        meeting_link: decision === 'CONFIRMED' ? 'https://meet.google.com/xyz-alumni-call' : '',
      })
      // Refresh bookings
      const res = await api.get('/mentorship/my-bookings')
      if (res.success) setMyBookings(res.data.bookings || [])
    } catch (err) {
      alert(`Error updating booking: ${err.message}`)
    }
  }

  const pendingBookings = myBookings.filter((b) => b.status === 'PENDING')
  const confirmedBookings = myBookings.filter((b) => b.status === 'CONFIRMED')

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Verification Status Banner */}
      {isVerified ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-emerald-900">Verified Alumni Profile</h4>
              <p className="text-xs text-emerald-700">
                Your degree and graduation credentials are authenticated by university administrators.
              </p>
            </div>
          </div>
          <span className="hidden sm:inline-block text-xs font-bold text-emerald-800 bg-emerald-200/60 px-3 py-1 rounded-full">
            Active Community Mentor
          </span>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">Verification Pending</h4>
              <p className="text-xs text-amber-700">
                Your profile is currently queued for university admin verification. You can still set availability and post opportunities.
              </p>
            </div>
          </div>
          <Link
            to="/profile"
            className="text-xs font-bold text-amber-900 hover:text-amber-800 underline shrink-0"
          >
            Update Details
          </Link>
        </div>
      )}

      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Posted Opportunities</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{myJobs.length}</div>
          <p className="text-xs text-slate-500 mt-1">Jobs and internships actively listed</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending Requests</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{pendingBookings.length}</div>
          <p className="text-xs text-slate-500 mt-1">Mentees awaiting your confirmation</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confirmed Sessions</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{confirmedBookings.length}</div>
          <p className="text-xs text-slate-500 mt-1">Upcoming 1-on-1 career guidance calls</p>
        </div>
      </div>

      {/* Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pending Mentorship Bookings Queue */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-600" />
              <span>Mentorship Booking Requests</span>
            </h3>
            <Link to="/mentorship/availability" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              Manage Availability Slots →
            </Link>
          </div>

          {pendingBookings.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
              No pending mentorship booking requests.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingBookings.map((b) => (
                <div key={b.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-sm">{b.student_name}</span>
                    <span className="text-[11px] text-slate-500">
                      📅 {b.session_date} ({b.start_time} - {b.end_time})
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                    <span className="font-semibold text-slate-800">Student's Goal:</span> {b.goal_notes}
                  </p>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleBookingDecision(b.id, 'REJECTED')}
                      className="px-3 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                    >
                      Decline
                    </button>
                    <button
                      onClick={() => handleBookingDecision(b.id, 'CONFIRMED')}
                      className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
                    >
                      Confirm Session
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* My Jobs & Applicant Pipeline */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>My Job Postings</span>
            </h3>
            <Link
              to="/jobs/create"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Post New Job</span>
            </Link>
          </div>

          {myJobs.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
              You haven't published any job opportunities yet. Share openings from your company with juniors!
            </div>
          ) : (
            <div className="space-y-3">
              {myJobs.map((job) => (
                <div key={job.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{job.title}</h4>
                    <p className="text-xs text-slate-500">
                      {job.company} • {job.location} • <span className="font-semibold text-indigo-700">{job.applications_count} candidate(s)</span>
                    </p>
                  </div>
                  <Link
                    to={`/jobs/${job.id}/applications`}
                    className="px-3 py-1.5 bg-white hover:bg-slate-100 border border-slate-200 text-slate-800 rounded-lg text-xs font-bold transition shadow-sm shrink-0"
                  >
                    View Applicants ({job.applications_count})
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
