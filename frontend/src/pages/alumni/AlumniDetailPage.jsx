import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ShieldCheck,
  Building,
  GraduationCap,
  MapPin,
  Calendar,
  Clock,
  MessageSquare,
  Globe,
  ArrowLeft,
  CheckCircle2,
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export const AlumniDetailPage = () => {
  const { id } = useParams()
  const { role } = useAuth()
  const [alumnus, setAlumnus] = useState(null)
  const [availableSlots, setAvailableSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [bookingSlot, setBookingSlot] = useState(null)
  const [goalNotes, setGoalNotes] = useState('')
  const [submittingBooking, setSubmittingBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState('')

  const fetchAlumnusData = async () => {
    setLoading(true)
    try {
      const [alumniRes, mentorRes] = await Promise.allSettled([
        api.get(`/alumni/${id}`),
        api.get(`/mentorship/mentors/${id}`),
      ])

      if (alumniRes.status === 'fulfilled' && alumniRes.value.success) {
        setAlumnus(alumniRes.value.data.alumnus)
      }
      if (mentorRes.status === 'fulfilled' && mentorRes.value.success) {
        setAvailableSlots(mentorRes.value.data.mentor?.available_slots || [])
      }
    } catch (err) {
      console.error('Error loading alumni details:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlumnusData()
  }, [id])

  const handleBookSession = async (e) => {
    e.preventDefault()
    if (!bookingSlot) return

    setSubmittingBooking(true)
    try {
      const res = await api.post('/mentorship/book', {
        mentor_id: parseInt(id),
        slot_id: bookingSlot.id,
        goal_notes: goalNotes,
      })

      if (res.success) {
        setBookingSuccess('Mentorship session requested successfully! Awaiting mentor confirmation.')
        setBookingSlot(null)
        setGoalNotes('')
        fetchAlumnusData()
      }
    } catch (err) {
      alert(`Booking conflict: ${err.message}`)
    } finally {
      setSubmittingBooking(false)
    }
  }

  if (loading) {
    return <div className="py-16 text-center text-slate-500 text-sm">Loading alumni profile...</div>
  }

  if (!alumnus) {
    return (
      <div className="max-w-3xl mx-auto py-16 text-center space-y-4">
        <h2 className="text-xl font-bold text-slate-900">Alumni Profile Not Found</h2>
        <Link to="/alumni" className="text-sm font-semibold text-indigo-600">Back to directory</Link>
      </div>
    )
  }

  const p = alumnus.profile || {}
  const ad = alumnus.alumni_detail || {}
  const isVerified = ad.verification_status === 'VERIFIED'

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <Link to="/alumni" className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" />
        <span>Back to alumni directory</span>
      </Link>

      {/* Main Profile Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-20 h-20 rounded-2xl bg-indigo-600 text-white font-bold flex items-center justify-center text-3xl shadow-md shrink-0">
              {p.avatar_url ? (
                <img src={p.avatar_url} alt="" className="w-full h-full rounded-2xl object-cover" />
              ) : (
                p.first_name?.[0] || 'A'
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">{p.first_name} {p.last_name}</h1>
                {isVerified && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Verified Alumni
                  </span>
                )}
              </div>
              <p className="text-sm font-medium text-slate-700">{ad.current_position} at {ad.current_company}</p>
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1.5"><GraduationCap className="w-4 h-4 text-slate-400" /> Class of {ad.graduation_year} ({ad.department})</span>
                {p.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-slate-400" /> {p.location}</span>}
              </div>
            </div>
          </div>

          <div className="flex sm:flex-col gap-2 shrink-0">
            <Link
              to={`/messages/${alumnus.id}`}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition shadow-sm"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Send Message</span>
            </Link>
          </div>
        </div>

        {/* Bio */}
        <div className="pt-4 border-t border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">About & Background</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            {p.bio || p.headline || "No professional biography provided yet."}
          </p>
        </div>

        {/* Skills */}
        <div className="pt-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Professional Skills</h3>
          <div className="flex flex-wrap gap-2">
            {(Array.isArray(p.skills)
              ? p.skills
              : typeof p.skills === 'string'
                ? p.skills.split(',').map((s) => s.trim())
                : []
            ).map((skill, idx) => (
              <span key={idx} className="px-3 py-1 bg-slate-100 text-slate-800 rounded-lg text-xs font-semibold">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Available Mentorship Slots */}
      <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <span>Book a 1-on-1 Mentorship Call</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Choose an open date & time slot. Bookings are confirmed with zero double-booking transactional locking.
          </p>
        </div>

        {bookingSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{bookingSuccess}</span>
          </div>
        )}

        {role !== 'STUDENT' ? (
          <div className="p-4 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
            Sign in with a Student account to book 1-on-1 mentorship sessions with this alumnus.
          </div>
        ) : availableSlots.length === 0 ? (
          <div className="p-6 bg-slate-50 rounded-xl text-center text-xs text-slate-500">
            This mentor does not have open calendar availability slots right now. You can send them a direct message to request time!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableSlots.map((slot) => (
              <div
                key={slot.id}
                className="p-4 rounded-2xl border border-slate-200 hover:border-indigo-300 bg-slate-50/50 flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="font-bold text-sm text-slate-900">
                    📅 {slot.slot_date}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{slot.start_time} - {slot.end_time}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setBookingSlot(slot)
                    setBookingSuccess('')
                  }}
                  className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  Select Slot
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Booking Confirmation Modal */}
      {bookingSlot && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Confirm Mentorship Session</h3>
            <p className="text-xs text-slate-600">
              Booking with <span className="font-bold">{p.first_name} {p.last_name}</span> on{' '}
              <span className="font-bold">{bookingSlot.slot_date}</span> at{' '}
              <span className="font-bold">{bookingSlot.start_time} - {bookingSlot.end_time}</span>.
            </p>

            <form onSubmit={handleBookSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  What would you like to achieve in this session?
                </label>
                <textarea
                  required
                  rows={3}
                  value={goalNotes}
                  onChange={(e) => setGoalNotes(e.target.value)}
                  placeholder="e.g. System design interview guidance, resume critique for cloud roles, transition tips..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setBookingSlot(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingBooking}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow transition"
                >
                  {submittingBooking ? 'Reserving...' : 'Confirm Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
