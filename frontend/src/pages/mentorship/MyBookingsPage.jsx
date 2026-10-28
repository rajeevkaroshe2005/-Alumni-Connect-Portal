import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Calendar,
  Clock,
  ArrowLeft,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Star,
  MessageSquare,
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export const MyBookingsPage = () => {
  const { user, role } = useAuth()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)

  // Feedback modal state
  const [feedbackBooking, setFeedbackBooking] = useState(null)
  const [rating, setRating] = useState(5)
  const [feedbackText, setFeedbackText] = useState('')
  const [submittingFeedback, setSubmittingFeedback] = useState(false)

  const fetchBookings = async () => {
    setLoading(true)
    try {
      const res = await api.get('/mentorship/my-bookings')
      if (res.success && res.data) {
        setBookings(res.data.bookings || [])
      }
    } catch (err) {
      console.error('Failed to load bookings:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const handleDecision = async (bookingId, decision) => {
    try {
      const res = await api.put(`/mentorship/bookings/${bookingId}/decision`, {
        decision,
        meeting_link: decision === 'CONFIRMED' ? 'https://meet.google.com/xyz-mentor-session' : '',
      })
      if (res.success) {
        fetchBookings()
      }
    } catch (err) {
      alert(`Decision error: ${err.message}`)
    }
  }

  const handleSubmitFeedback = async (e) => {
    e.preventDefault()
    if (!feedbackBooking) return
    setSubmittingFeedback(true)
    try {
      const res = await api.post(`/mentorship/bookings/${feedbackBooking.id}/feedback`, {
        rating,
        feedback: feedbackText,
      })
      if (res.success) {
        setFeedbackBooking(null)
        setFeedbackText('')
        fetchBookings()
      }
    } catch (err) {
      alert(`Feedback submission failed: ${err.message}`)
    } finally {
      setSubmittingFeedback(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/mentorship" className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mentorship Sessions Schedule</h1>
          <p className="text-xs text-slate-500">Track pending requests, confirmed calls, and session reviews</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading sessions...</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No mentorship sessions scheduled yet.</div>
        ) : (
          <div className="divide-y divide-slate-100">
            {bookings.map((b) => (
              <div key={b.id} className="p-6 space-y-3 hover:bg-slate-50/50 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-slate-900 text-sm">
                        {role === 'ALUMNI' ? `Session with ${b.student_name}` : `Mentorship with ${b.mentor_name}`}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        b.status === 'COMPLETED' ? 'bg-indigo-100 text-indigo-800' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>{b.session_date} at {b.start_time} - {b.end_time}</span>
                    </p>
                  </div>

                  {/* Actions according to Role */}
                  <div className="flex items-center gap-2">
                    {role === 'ALUMNI' && b.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleDecision(b.id, 'REJECTED')}
                          className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-lg transition"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleDecision(b.id, 'CONFIRMED')}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition"
                        >
                          Accept
                        </button>
                      </>
                    )}

                    {b.meeting_link && b.status === 'CONFIRMED' && (
                      <a
                        href={b.meeting_link}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow-sm transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Join Call</span>
                      </a>
                    )}

                    {role === 'STUDENT' && b.status === 'CONFIRMED' && (
                      <button
                        onClick={() => setFeedbackBooking(b)}
                        className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg border border-indigo-200 transition"
                      >
                        Complete & Rate
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-700 border border-slate-200/60">
                  <span className="font-semibold text-slate-900">Session Goal:</span> {b.goal_notes}
                </div>

                {b.student_rating && (
                  <div className="flex items-center gap-2 text-xs text-amber-600 font-bold pt-1">
                    <Star className="w-4 h-4 fill-current" />
                    <span>Rating: {b.student_rating} / 5</span>
                    {b.student_feedback && <span className="text-slate-500 font-normal">"{b.student_feedback}"</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {feedbackBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <h3 className="text-base font-bold text-slate-900">Review Mentorship Call</h3>
            <p className="text-xs text-slate-600">
              How helpful was your session with <span className="font-bold">{feedbackBooking.mentor_name}</span>?
            </p>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Rating (1 to 5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-lg border ${
                        rating >= star ? 'bg-amber-50 border-amber-300 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback Comments</label>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share what advice was most impactful..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackBooking(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow transition"
                >
                  {submittingFeedback ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
