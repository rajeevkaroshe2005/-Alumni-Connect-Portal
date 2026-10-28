import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, Video, Clock, CheckCircle, 
  ArrowLeft, Share2, AlertCircle, ExternalLink, QrCode,
  Star, ShieldCheck, CheckCircle2, MessageSquare, Send
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  // Digital Check-in Desk State (Organizer / Admin)
  const [checkinTokenInput, setCheckinTokenInput] = useState('');
  const [checkinStatusMsg, setCheckinStatusMsg] = useState('');
  const [checkingIn, setCheckingIn] = useState(false);

  // Event Feedback State
  const [feedbacks, setFeedbacks] = useState([]);
  const [feedbackRating, setFeedbackRating] = useState(5);
  const [feedbackText, setFeedbackText] = useState('');
  const [submittingFeedback, setSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState('');

  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError('');
      const [resEvent, resAttendees, resFeedbacks] = await Promise.allSettled([
        api.get(`/events/${id}`),
        api.get(`/events/${id}/attendees`),
        api.get(`/events/${id}/feedback`)
      ]);

      if (resEvent.status === 'fulfilled' && resEvent.value?.success) {
        setEvent(resEvent.value.data?.event);
      }
      if (resAttendees.status === 'fulfilled' && resAttendees.value?.success) {
        setAttendees(resAttendees.value.data?.attendees || []);
      }
      if (resFeedbacks.status === 'fulfilled' && resFeedbacks.value?.success) {
        setFeedbacks(resFeedbacks.value.data?.feedback || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to retrieve event details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventData();
  }, [id]);

  const handleToggleRSVP = async () => {
    try {
      setActionLoading(true);
      const res = await api.post(`/events/${id}/rsvp`);
      if (res?.success) {
        fetchEventData();
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle RSVP.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleVerifyCheckin = async (e) => {
    e.preventDefault();
    if (!checkinTokenInput.trim()) return;
    try {
      setCheckingIn(true);
      setCheckinStatusMsg('');
      const res = await api.post(`/events/${id}/checkin`, {
        token: checkinTokenInput.trim()
      });
      if (res?.success) {
        setCheckinStatusMsg(`Success: ${res.data?.attendee_name || 'Attendee'} successfully checked in!`);
        setCheckinTokenInput('');
        fetchEventData();
      }
    } catch (err) {
      setCheckinStatusMsg(`Check-in failed: ${err.message}`);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    try {
      setSubmittingFeedback(true);
      setFeedbackSuccess('');
      const res = await api.post(`/events/${id}/feedback`, {
        rating: feedbackRating,
        feedback_text: feedbackText
      });
      if (res?.success) {
        setFeedbackSuccess('Thank you for rating this session!');
        setFeedbackText('');
        fetchEventData();
      }
    } catch (err) {
      alert(`Feedback error: ${err.message}`);
    } finally {
      setSubmittingFeedback(false);
    }
  };

  const formatDateTime = (isoStr) => {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-8 bg-slate-200 w-1/3 rounded-xl" />
        <div className="h-64 bg-slate-200 rounded-3xl" />
        <div className="h-32 bg-slate-200 rounded-3xl" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="p-6 bg-red-50 border border-red-200 rounded-2xl text-red-700 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Event Not Found</h3>
            <p className="text-sm mt-1">{error || 'The requested event could not be found.'}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/events')}
          className="mt-4 inline-flex items-center text-sm font-bold text-[#244B3A] hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to all events
        </button>
      </div>
    );
  }

  const isOrganizerOrAdmin = role === 'ADMIN' || (event.organizer_id && event.organizer_id === user?.id);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/events')}
        className="inline-flex items-center text-xs font-bold text-[#333333]/70 hover:text-[#244B3A] mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1 text-[#244B3A]" /> Back to Events Schedule
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Event Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D8D2C4] shadow-xs space-y-5">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#244B3A]/10 text-[#244B3A] border border-[#244B3A]/20">
                {event.event_type}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                <Users className="w-3.5 h-3.5" />
                {event.attendee_count || 0} / {event.capacity} registered
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#333333] leading-tight">
              {event.title}
            </h1>

            {/* Organizer Banner */}
            {event.organizer && (
              <div className="flex items-center gap-3 pb-4 border-b border-[#D8D2C4]/60">
                <div className="w-10 h-10 rounded-full bg-[#244B3A] text-white flex items-center justify-center font-bold text-sm border border-[#C4A878]">
                  {event.organizer.name?.[0] || 'O'}
                </div>
                <div>
                  <p className="text-sm font-bold text-[#333333]">
                    Organized by {event.organizer.name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {event.organizer.headline || 'Campus Event Host'}
                  </p>
                </div>
              </div>
            )}

            <div className="prose max-w-none text-[#333333]/85 text-xs sm:text-sm leading-relaxed">
              <h3 className="text-sm font-bold text-[#333333] mb-2">Session Overview</h3>
              <p className="whitespace-pre-line">{event.description}</p>
            </div>

            {/* Virtual Meeting Link */}
            {event.is_registered && event.meeting_url && (
              <div className="p-4 rounded-2xl bg-[#F5F1E8] border border-[#D8D2C4] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-[#244B3A] flex-shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-[#244B3A]">
                      Virtual Access Confirmed
                    </p>
                    <p className="text-xs text-[#333333]/70">
                      You are an approved participant. Join the video session directly:
                    </p>
                  </div>
                </div>
                <a
                  href={event.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-[#244B3A] hover:bg-[#3A5F50] text-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition shadow-xs"
                >
                  Join Meeting <ExternalLink className="w-3.5 h-3.5 text-[#C4A878]" />
                </a>
              </div>
            )}
          </div>

          {/* Digital Attendance Check-in Pass (If Registered) */}
          {event.is_registered && (
            <div className="bg-gradient-to-r from-[#244B3A] to-[#1C3B2E] text-white rounded-3xl p-6 border border-[#244B3A]/30 shadow-md relative overflow-hidden">
              <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-[#C4A878] text-[10px] font-bold border border-[#C4A878]/30">
                    <QrCode className="w-3.5 h-3.5" />
                    <span>Digital Event Pass & Check-In</span>
                  </div>
                  <h3 className="text-lg font-black tracking-tight">Your Verified Attendance Pass</h3>
                  <p className="text-xs text-[#F5F1E8]/80 max-w-sm">
                    Show this pass or token at the campus venue desk or provide it to the session host to record your official attendance.
                  </p>

                  <div className="pt-2 flex items-center gap-3">
                    <div className="px-3 py-1.5 bg-white/15 rounded-xl border border-white/20 font-mono text-sm font-black tracking-wider text-[#C4A878]">
                      {event.checkin_token || 'TOKEN-VERIFIED'}
                    </div>
                    {event.checked_in_at ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-400">
                        <CheckCircle2 className="w-4 h-4" /> Checked In
                      </span>
                    ) : (
                      <span className="text-xs text-amber-300 font-semibold">
                        Awaiting Door Check-in
                      </span>
                    )}
                  </div>
                </div>

                {/* QR Code graphic placeholder */}
                <div className="w-24 h-24 bg-white rounded-2xl p-2.5 flex flex-col items-center justify-center text-slate-800 shadow-md border-2 border-[#C4A878] flex-shrink-0 self-center">
                  <QrCode className="w-14 h-14 text-[#244B3A]" />
                  <span className="text-[8px] font-bold tracking-tight text-slate-500 uppercase mt-0.5">Scan to Verify</span>
                </div>
              </div>
            </div>
          )}

          {/* Organizer / Admin Check-In Desk */}
          {isOrganizerOrAdmin && (
            <div className="bg-white rounded-3xl p-6 border border-[#D8D2C4] shadow-xs space-y-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#244B3A]" />
                <h3 className="text-sm font-extrabold text-[#333333]">
                  Host Event Check-In Desk
                </h3>
              </div>
              <p className="text-xs text-slate-500">
                Verify arriving attendees by entering their 10-character Digital Pass token.
              </p>

              <form onSubmit={handleVerifyCheckin} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter check-in token (e.g. 5A92F13B)..."
                  value={checkinTokenInput}
                  onChange={(e) => setCheckinTokenInput(e.target.value)}
                  className="flex-1 p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs uppercase font-mono font-bold text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                />
                <button
                  type="submit"
                  disabled={checkingIn}
                  className="px-4 py-2.5 bg-[#244B3A] hover:bg-[#3A5F50] text-white font-bold rounded-xl text-xs shadow-xs transition"
                >
                  {checkingIn ? 'Verifying...' : 'Check In'}
                </button>
              </form>

              {checkinStatusMsg && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${
                  checkinStatusMsg.startsWith('Success')
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}>
                  {checkinStatusMsg}
                </div>
              )}
            </div>
          )}

          {/* Post-Event Feedback & Rating Section */}
          <div className="bg-white rounded-3xl p-6 border border-[#D8D2C4] shadow-xs space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8D2C4]/60">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-[#C4A878] fill-current" />
                <h3 className="text-base font-extrabold text-[#333333]">
                  Participant Feedback & Reviews ({feedbacks.length})
                </h3>
              </div>
            </div>

            {/* Leave Feedback Form for Registered Attendees */}
            {event.is_registered && (
              <form onSubmit={handleSubmitFeedback} className="p-4 bg-[#F5F1E8]/50 rounded-2xl border border-[#D8D2C4] space-y-3">
                <h4 className="text-xs font-bold text-[#333333]">Leave Your Review</h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-slate-600">Your Rating:</span>
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setFeedbackRating(s)}
                        className={`p-1 text-xs ${
                          feedbackRating >= s ? 'text-amber-500 fill-amber-500' : 'text-slate-300'
                        }`}
                      >
                        <Star className="w-5 h-5 fill-current" />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={2}
                  required
                  placeholder="What was the most useful takeaway or recommendation for future sessions?"
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  className="w-full p-2.5 bg-white border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                />

                <div className="flex items-center justify-between pt-1">
                  {feedbackSuccess && (
                    <span className="text-xs text-emerald-700 font-bold">{feedbackSuccess}</span>
                  )}
                  <button
                    type="submit"
                    disabled={submittingFeedback}
                    className="ml-auto px-4 py-2 bg-[#244B3A] hover:bg-[#3A5F50] text-white font-bold rounded-xl text-xs transition shadow-xs"
                  >
                    {submittingFeedback ? 'Submitting...' : 'Post Review'}
                  </button>
                </div>
              </form>
            )}

            {/* Feedback List */}
            {feedbacks.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No attendee reviews submitted yet.</p>
            ) : (
              <div className="divide-y divide-[#D8D2C4]/50">
                {feedbacks.map((f) => (
                  <div key={f.id} className="py-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-[#333333]">{f.user_name}</span>
                      <div className="flex items-center text-amber-500">
                        {[...Array(f.rating || 5)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>
                    {f.feedback_text && (
                      <p className="text-xs text-[#333333]/80 italic">"{f.feedback_text}"</p>
                    )}
                    <p className="text-[10px] text-slate-400">
                      {new Date(f.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Registered Attendees Section */}
          <div className="bg-white rounded-3xl p-6 border border-[#D8D2C4] shadow-xs">
            <h3 className="text-base font-extrabold text-[#333333] mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#244B3A]" />
              Confirmed Attendees ({attendees.length})
            </h3>

            {attendees.length === 0 ? (
              <p className="text-xs text-slate-400 italic">
                Be the first to register for this session!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attendees.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-3 p-3 rounded-2xl bg-[#F5F1E8]/50 border border-[#D8D2C4]/60"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#244B3A] text-white flex items-center justify-center text-xs font-bold border border-[#C4A878]">
                      {att.user_name?.[0] || 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-bold text-[#333333] truncate">
                        {att.user_name}
                      </p>
                      <p className="text-[10px] text-slate-500 truncate">
                        {att.user_role} • {new Date(att.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Event Card */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-[#D8D2C4] shadow-xs space-y-6">
            <h3 className="font-extrabold text-[#333333] text-base">Date & Venue</h3>

            <div className="space-y-4 text-xs">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-[#244B3A] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#333333]">Starts</p>
                  <p className="text-slate-600 mt-0.5">{formatDateTime(event.start_time)}</p>
                  <p className="font-bold text-[#333333] mt-2">Ends</p>
                  <p className="text-slate-600 mt-0.5">{formatDateTime(event.end_time)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#3A5F50] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-[#333333]">Location</p>
                  <p className="text-slate-600 mt-0.5">{event.venue || 'Virtual Online Platform'}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#D8D2C4]/60">
              <button
                onClick={handleToggleRSVP}
                disabled={actionLoading}
                className={`w-full py-3 px-4 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                  event.is_registered
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border border-emerald-300'
                    : 'bg-[#244B3A] hover:bg-[#3A5F50] text-white shadow-xs'
                }`}
              >
                {event.is_registered ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-emerald-600" /> Attending (Cancel RSVP)
                  </>
                ) : (
                  'Confirm RSVP Registration'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
