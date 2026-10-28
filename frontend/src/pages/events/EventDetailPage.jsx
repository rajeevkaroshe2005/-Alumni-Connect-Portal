import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, Video, Clock, CheckCircle, 
  ArrowLeft, Share2, AlertCircle, ExternalLink 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function EventDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [attendees, setAttendees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const fetchEventData = async () => {
    try {
      setLoading(true);
      setError('');
      const [resEvent, resAttendees] = await Promise.all([
        api.get(`/events/${id}`),
        api.get(`/events/${id}/attendees`)
      ]);

      if (resEvent?.success) {
        setEvent(resEvent.data?.event);
      }
      if (resAttendees?.success) {
        setAttendees(resAttendees.data?.attendees || []);
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
        const isRegistered = res.data?.is_registered;
        setEvent((prev) => ({
          ...prev,
          is_registered: isRegistered,
          attendee_count: isRegistered
            ? (prev.attendee_count || 0) + 1
            : Math.max((prev.attendee_count || 1) - 1, 0)
        }));
        // Refetch attendees to reflect current status
        const attRes = await api.get(`/events/${id}/attendees`);
        if (attRes?.success) {
          setAttendees(attRes.data?.attendees || []);
        }
      }
    } catch (err) {
      alert(err.message || 'Failed to toggle RSVP.');
    } finally {
      setActionLoading(false);
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
        <div className="h-8 bg-gray-200 dark:bg-gray-700 w-1/3 rounded" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="p-6 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-xl text-red-700 dark:text-red-300 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <div>
            <h3 className="font-semibold">Event Not Found</h3>
            <p className="text-sm mt-1">{error || 'The requested event could not be found.'}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/events')}
          className="mt-4 inline-flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to all events
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate('/events')}
        className="inline-flex items-center text-sm text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white mb-6 transition"
      >
        <ArrowLeft className="w-4 h-4 mr-1" /> Back to Events
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Event Content */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 sm:p-8 border border-gray-200 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                {event.event_type}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                {event.attendee_count || 0} / {event.capacity} registered
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {event.title}
            </h1>

            {/* Organizer Banner */}
            {event.organizer && (
              <div className="mt-4 flex items-center gap-3 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center font-bold text-blue-600 dark:text-blue-400">
                  {event.organizer.name?.[0] || 'O'}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    Organized by {event.organizer.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {event.organizer.headline || 'Alumni Contributor'}
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">About this Session</h3>
              <p className="whitespace-pre-line">{event.description}</p>
            </div>

            {/* Meeting Link for registered users */}
            {event.is_registered && event.meeting_url && (
              <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs font-semibold text-blue-900 dark:text-blue-200">
                      Virtual Room Access Available
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      You are confirmed. Join the session directly using the link:
                    </p>
                  </div>
                </div>
                <a
                  href={event.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition"
                >
                  Join Meeting <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>

          {/* Registered Attendees Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
            <h3 className="text-base font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              Registered Attendees ({attendees.length})
            </h3>

            {attendees.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 italic">
                Be the first to register for this event!
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {attendees.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700"
                  >
                    <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 flex items-center justify-center text-xs font-bold">
                      {att.user_name?.[0] || 'U'}
                    </div>
                    <div className="overflow-hidden">
                      <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">
                        {att.user_name}
                      </p>
                      <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate">
                        {att.user_role} • Registered on {new Date(att.created_at).toLocaleDateString()}
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
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
            <h3 className="font-bold text-gray-900 dark:text-white text-base">Date & Venue</h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Starts</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{formatDateTime(event.start_time)}</p>
                  <p className="font-medium text-gray-900 dark:text-white mt-2">Ends</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{formatDateTime(event.end_time)}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Location</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{event.venue || 'Virtual Online Platform'}</p>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={handleToggleRSVP}
                disabled={actionLoading}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2 ${
                  event.is_registered
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {event.is_registered ? (
                  <>
                    <CheckCircle className="w-4 h-4" /> You're Attending (Cancel RSVP)
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
