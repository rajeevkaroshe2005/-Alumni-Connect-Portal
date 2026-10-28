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
  FileText,
  ListTodo,
  Sparkles,
  X,
  Plus,
  BookOpen,
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

  // Mentorship Session Summary Modal State
  const [summaryBooking, setSummaryBooking] = useState(null)
  const [summaryData, setSummaryData] = useState(null)
  const [loadingSummary, setLoadingSummary] = useState(false)
  const [editingSummary, setEditingSummary] = useState(false)
  const [savingSummary, setSavingSummary] = useState(false)
  const [summaryForm, setSummaryForm] = useState({
    discussion_notes: '',
    key_takeaways: '',
    action_items_text: '',
    shared_resources: '',
    follow_up_date: '',
  })

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

  const openSummaryModal = async (booking) => {
    setSummaryBooking(booking)
    setLoadingSummary(true)
    setEditingSummary(false)
    try {
      const res = await api.get(`/mentorship/bookings/${booking.id}/summary`)
      if (res?.success && res.data?.summary) {
        setSummaryData(res.data.summary)
        const s = res.data.summary
        setSummaryForm({
          discussion_notes: s.discussion_notes || '',
          key_takeaways: Array.isArray(s.key_takeaways)
            ? s.key_takeaways.join('\n')
            : s.key_takeaways || '',
          action_items_text: Array.isArray(s.action_items)
            ? s.action_items.map((a) => (typeof a === 'string' ? a : a.task || '')).join('\n')
            : '',
          shared_resources: Array.isArray(s.shared_resources)
            ? s.shared_resources.join('\n')
            : s.shared_resources || '',
          follow_up_date: s.follow_up_date || '',
        })
      } else {
        setSummaryData(null)
        setEditingSummary(true)
        setSummaryForm({
          discussion_notes: '',
          key_takeaways: '',
          action_items_text: '',
          shared_resources: '',
          follow_up_date: '',
        })
      }
    } catch (err) {
      setSummaryData(null)
      setEditingSummary(true)
    } finally {
      setLoadingSummary(false)
    }
  }

  const handleSaveSummary = async (e) => {
    e.preventDefault()
    if (!summaryBooking) return
    try {
      setSavingSummary(true)
      const takeawaysList = summaryForm.key_takeaways
        .split('\n')
        .map((t) => t.trim())
        .filter(Boolean)
      const actionItemsList = summaryForm.action_items_text
        .split('\n')
        .map((a) => a.trim())
        .filter(Boolean)
        .map((task) => ({ task, completed: false, assignee: role === 'STUDENT' ? 'Student' : 'Mentee' }))
      const resourcesList = summaryForm.shared_resources
        .split('\n')
        .map((r) => r.trim())
        .filter(Boolean)

      const payload = {
        discussion_notes: summaryForm.discussion_notes,
        key_takeaways: takeawaysList,
        action_items: actionItemsList,
        shared_resources: resourcesList,
        follow_up_date: summaryForm.follow_up_date || null,
      }

      const res = await api.post(`/mentorship/bookings/${summaryBooking.id}/summary`, payload)
      if (res?.success && res.data?.summary) {
        setSummaryData(res.data.summary)
        setEditingSummary(false)
      }
    } catch (err) {
      alert(`Error saving session summary: ${err.message}`)
    } finally {
      setSavingSummary(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/mentorship" className="p-2 bg-white hover:bg-[#F5F1E8] rounded-xl border border-[#D8D2C4] text-[#244B3A]">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-[#333333] tracking-tight">Mentorship Sessions Schedule</h1>
          <p className="text-xs text-[#333333]/70">Track pending requests, confirmed calls, action item summaries, and session reviews</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-[#D8D2C4] shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-[#244B3A] text-xs font-semibold">Loading sessions...</div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No mentorship sessions scheduled yet.</div>
        ) : (
          <div className="divide-y divide-[#D8D2C4]/50">
            {bookings.map((b) => (
              <div key={b.id} className="p-6 space-y-3 hover:bg-[#F5F1E8]/30 transition">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-[#333333] text-sm">
                        {role === 'ALUMNI' ? `Session with ${b.student_name}` : `Mentorship with ${b.mentor_name}`}
                      </h3>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        b.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-800' :
                        b.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                        b.status === 'COMPLETED' ? 'bg-[#244B3A]/10 text-[#244B3A]' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {b.status}
                      </span>
                    </div>

                    <p className="text-xs text-[#333333]/70 mt-1 flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-[#244B3A]" />
                      <span>{b.session_date} at {b.start_time} - {b.end_time}</span>
                    </p>
                  </div>

                  {/* Actions according to Role */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Session Notes & Action Items Button */}
                    {(b.status === 'CONFIRMED' || b.status === 'COMPLETED') && (
                      <button
                        onClick={() => openSummaryModal(b)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F5F1E8] hover:bg-[#D8D2C4] text-[#244B3A] text-xs font-bold rounded-xl border border-[#D8D2C4] transition"
                      >
                        <FileText className="w-3.5 h-3.5 text-[#244B3A]" />
                        <span>Action Items & Notes</span>
                      </button>
                    )}

                    {role === 'ALUMNI' && b.status === 'PENDING' && (
                      <>
                        <button
                          onClick={() => handleDecision(b.id, 'REJECTED')}
                          className="px-3 py-1.5 text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleDecision(b.id, 'CONFIRMED')}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-[#244B3A] hover:bg-[#3A5F50] rounded-xl shadow-xs transition"
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#244B3A] hover:bg-[#3A5F50] text-white font-bold text-xs rounded-xl shadow-xs transition"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Join Call</span>
                      </a>
                    )}

                    {role === 'STUDENT' && b.status === 'CONFIRMED' && (
                      <button
                        onClick={() => setFeedbackBooking(b)}
                        className="px-3 py-1.5 bg-[#C4A878]/30 hover:bg-[#C4A878]/40 text-[#244B3A] text-xs font-bold rounded-xl border border-[#C4A878] transition"
                      >
                        Complete & Rate
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3 bg-[#F5F1E8]/50 rounded-xl text-xs text-[#333333] border border-[#D8D2C4]/60">
                  <span className="font-semibold text-[#244B3A]">Session Goal:</span> {b.goal_notes}
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

      {/* Session Notes & Action Items Modal */}
      {summaryBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#D8D2C4] space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8D2C4]">
              <div>
                <h3 className="text-base font-extrabold text-[#333333]">
                  Mentorship Session Notes & Action Items
                </h3>
                <p className="text-[11px] text-[#333333]/70">
                  {summaryBooking.student_name} & {summaryBooking.mentor_name} • {summaryBooking.session_date}
                </p>
              </div>
              <button
                onClick={() => setSummaryBooking(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingSummary ? (
              <div className="py-8 text-center text-xs text-[#244B3A]">Loading consensual session summary...</div>
            ) : !editingSummary && summaryData ? (
              <div className="space-y-4 text-xs">
                {/* Notes */}
                <div className="space-y-1">
                  <span className="font-bold text-[#244B3A] uppercase text-[10px] tracking-wider">
                    Discussion Summary
                  </span>
                  <div className="p-3 bg-[#F5F1E8]/50 rounded-xl text-[#333333] border border-[#D8D2C4]/60 whitespace-pre-line leading-relaxed">
                    {summaryData.discussion_notes || 'No discussion notes logged yet.'}
                  </div>
                </div>

                {/* Key Takeaways */}
                {summaryData.key_takeaways && (
                  <div className="space-y-1">
                    <span className="font-bold text-[#244B3A] uppercase text-[10px] tracking-wider">
                      Key Takeaways
                    </span>
                    <ul className="list-disc pl-4 space-y-1 text-[#333333]/80">
                      {(Array.isArray(summaryData.key_takeaways)
                        ? summaryData.key_takeaways
                        : [summaryData.key_takeaways]
                      ).map((item, i) => (
                        <li key={i}>{typeof item === 'string' ? item : JSON.stringify(item)}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Items List */}
                {summaryData.action_items && (
                  <div className="space-y-1.5 pt-2 border-t border-[#D8D2C4]/50">
                    <span className="font-bold text-[#244B3A] uppercase text-[10px] tracking-wider flex items-center gap-1">
                      <ListTodo className="w-3.5 h-3.5 text-[#C4A878]" /> Action Items & Next Steps
                    </span>
                    <div className="space-y-1">
                      {(Array.isArray(summaryData.action_items)
                        ? summaryData.action_items
                        : [summaryData.action_items]
                      ).map((item, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 p-2 bg-[#F5F1E8]/70 rounded-xl border border-[#D8D2C4]/40"
                        >
                          <CheckCircle2 className="w-4 h-4 text-[#244B3A] flex-shrink-0" />
                          <span className="text-[#333333] font-medium">
                            {typeof item === 'string' ? item : item.task || JSON.stringify(item)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shared Resources */}
                {summaryData.shared_resources && (
                  <div className="space-y-1 pt-2 border-t border-[#D8D2C4]/50">
                    <span className="font-bold text-[#244B3A] uppercase text-[10px] tracking-wider">
                      Shared Resources & Links
                    </span>
                    <div className="space-y-1 text-[#244B3A]">
                      {(Array.isArray(summaryData.shared_resources)
                        ? summaryData.shared_resources
                        : [summaryData.shared_resources]
                      ).map((resItem, i) => (
                        <div key={i} className="truncate">
                          • {resItem}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {summaryData.follow_up_date && (
                  <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-[11px] font-semibold">
                    Scheduled Follow-Up: {summaryData.follow_up_date}
                  </div>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    onClick={() => setEditingSummary(true)}
                    className="px-4 py-2 bg-[#244B3A] text-white font-bold rounded-xl text-xs"
                  >
                    Edit Summary & Action Items
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSaveSummary} className="space-y-4 text-xs">
                <div className="p-2.5 bg-[#F5F1E8]/70 rounded-xl border border-[#D8D2C4] text-[10px] text-[#333333]/80 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C4A878]" />
                  <span>Consensual action items ensure both mentor and mentee stay aligned on deliverables.</span>
                </div>

                <div>
                  <label className="block font-bold text-[#333333] mb-1">Session Discussion Notes *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Summary of topics discussed: resume feedback, interview prep, career path..."
                    value={summaryForm.discussion_notes}
                    onChange={(e) =>
                      setSummaryForm({ ...summaryForm, discussion_notes: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#333333] mb-1">Key Takeaways (one per line)</label>
                  <textarea
                    rows={2}
                    placeholder="Focus on distributed system design fundamentals&#10;Rewrite project bullet points with quantified metrics"
                    value={summaryForm.key_takeaways}
                    onChange={(e) =>
                      setSummaryForm({ ...summaryForm, key_takeaways: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#333333] mb-1">Action Items / Deliverables (one per line)</label>
                  <textarea
                    rows={2}
                    placeholder="Send revised PDF resume by Friday&#10;Complete 2 LeetCode graph problems"
                    value={summaryForm.action_items_text}
                    onChange={(e) =>
                      setSummaryForm({ ...summaryForm, action_items_text: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#333333] mb-1">Shared Resources & References (one per line)</label>
                  <textarea
                    rows={2}
                    placeholder="https://github.com/donnemartin/system-design-primer&#10;Google ML Guidebook"
                    value={summaryForm.shared_resources}
                    onChange={(e) =>
                      setSummaryForm({ ...summaryForm, shared_resources: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#333333] mb-1">Suggested Follow-Up Date (Optional)</label>
                  <input
                    type="date"
                    value={summaryForm.follow_up_date}
                    onChange={(e) =>
                      setSummaryForm({ ...summaryForm, follow_up_date: e.target.value })
                    }
                    className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  {summaryData && (
                    <button
                      type="button"
                      onClick={() => setEditingSummary(false)}
                      className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-[#333333] hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={savingSummary}
                    className="px-5 py-2 bg-[#244B3A] hover:bg-[#3A5F50] text-white font-bold rounded-xl shadow-xs transition"
                  >
                    {savingSummary ? 'Saving Summary...' : 'Save Notes & Action Items'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {feedbackBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#D8D2C4] space-y-4">
            <h3 className="text-base font-extrabold text-[#333333]">Review Mentorship Call</h3>
            <p className="text-xs text-[#333333]/70">
              How helpful was your session with <span className="font-bold text-[#333333]">{feedbackBooking.mentor_name}</span>?
            </p>

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1">Rating (1 to 5 Stars)</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`p-2 rounded-xl border ${
                        rating >= star ? 'bg-amber-50 border-amber-300 text-amber-600' : 'bg-slate-50 border-slate-200 text-slate-400'
                      }`}
                    >
                      <Star className="w-5 h-5 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1">Feedback Comments</label>
                <textarea
                  rows={3}
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="Share what advice was most impactful..."
                  className="w-full p-3 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFeedbackBooking(null)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingFeedback}
                  className="px-4 py-2 bg-[#244B3A] hover:bg-[#3A5F50] text-white text-xs font-bold rounded-xl shadow-xs transition"
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
