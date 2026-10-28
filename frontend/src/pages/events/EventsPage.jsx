import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, Plus, Search, Filter, Video, 
  Clock, CheckCircle, AlertCircle, X, ExternalLink
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [actionLoading, setActionLoading] = useState(null);

  // Modal State for Event Creation
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    event_type: 'WEBINAR',
    venue: 'Online / Zoom',
    meeting_url: '',
    start_time: '',
    end_time: '',
    capacity: 100
  });
  const [createError, setCreateError] = useState('');
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (selectedType !== 'ALL') params.event_type = selectedType;
      if (searchQuery.trim()) params.q = searchQuery.trim();

      const res = await api.get('/events', { params });
      if (res?.success) {
        setEvents(res.data?.events || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load campus events.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [selectedType]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchEvents();
  };

  const handleToggleRSVP = async (eventId) => {
    try {
      setActionLoading(eventId);
      const res = await api.post(`/events/${eventId}/rsvp`);
      if (res?.success) {
        const isRegistered = res.data?.is_registered;
        setEvents((prev) =>
          prev.map((evt) =>
            evt.id === eventId
              ? {
                  ...evt,
                  is_registered: isRegistered,
                  attendee_count: isRegistered
                    ? (evt.attendee_count || 0) + 1
                    : Math.max((evt.attendee_count || 1) - 1, 0)
                }
              : evt
          )
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update RSVP status.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setCreateError('');
    setCreateSubmitting(true);

    try {
      const res = await api.post('/events', createForm);
      if (res?.success) {
        setShowCreateModal(false);
        setCreateForm({
          title: '',
          description: '',
          event_type: 'WEBINAR',
          venue: 'Online / Zoom',
          meeting_url: '',
          start_time: '',
          end_time: '',
          capacity: 100
        });
        fetchEvents();
      }
    } catch (err) {
      setCreateError(err.message || 'Failed to schedule event.');
    } finally {
      setCreateSubmitting(false);
    }
  };

  const formatDateTime = (isoStr) => {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const eventTypeColors = {
    WEBINAR: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
    WORKSHOP: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    REUNION: 'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-300',
    NETWORKING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Calendar className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            Campus & Alumni Events
          </h1>
          <p className="mt-1 text-gray-600 dark:text-gray-400">
            Connect through technical webinars, masterclasses, reunions, and professional networking meetups.
          </p>
        </div>

        {(user?.role === 'ALUMNI' || user?.role === 'ADMIN') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Event
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="mt-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by topic, speaker, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-medium transition"
          >
            Search
          </button>
        </form>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-gray-400 hidden sm:block" />
          {['ALL', 'WEBINAR', 'WORKSHOP', 'REUNION', 'NETWORKING'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedType === type
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="animate-pulse bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-64" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-8 p-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-red-700 dark:text-red-300 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : events.length === 0 ? (
        <div className="mt-12 text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
          <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">No events scheduled</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1 max-w-sm mx-auto">
            No events match your current filter criteria. Try adjusting your search query or check back soon.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                      eventTypeColors[evt.event_type] || 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {evt.event_type}
                  </span>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {evt.attendee_count || 0} / {evt.capacity} registered
                    </span>
                  </div>
                </div>

                <Link
                  to={`/events/${evt.id}`}
                  className="block text-xl font-bold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition mb-2"
                >
                  {evt.title}
                </Link>

                <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4">
                  {evt.description}
                </p>

                <div className="space-y-2 text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span>{formatDateTime(evt.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span className="truncate">{evt.venue || 'Virtual Online Platform'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800/80 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between gap-3">
                <Link
                  to={`/events/${evt.id}`}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                >
                  Details <ExternalLink className="w-3 h-3" />
                </Link>

                <button
                  onClick={() => handleToggleRSVP(evt.id)}
                  disabled={actionLoading === evt.id}
                  className={`px-4 py-1.5 rounded-lg text-xs font-medium transition flex items-center gap-1.5 ${
                    evt.is_registered
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {evt.is_registered ? (
                    <>
                      <CheckCircle className="w-3.5 h-3.5" /> Registered
                    </>
                  ) : (
                    'RSVP Now'
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl max-w-lg w-full p-6 shadow-xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Schedule New Campus Event</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 text-red-700 dark:text-red-300 rounded-lg text-sm">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g. System Design Masterclass"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Event Type *
                  </label>
                  <select
                    value={createForm.event_type}
                    onChange={(e) => setCreateForm({ ...createForm, event_type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="WEBINAR">Webinar</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="REUNION">Reunion</option>
                    <option value="NETWORKING">Networking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Attendee Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={createForm.capacity}
                    onChange={(e) => setCreateForm({ ...createForm, capacity: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Description *
                </label>
                <textarea
                  rows="3"
                  required
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Outline topics covered, target audience, prerequisites..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={createForm.start_time}
                    onChange={(e) => setCreateForm({ ...createForm, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={createForm.end_time}
                    onChange={(e) => setCreateForm({ ...createForm, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Venue / Location
                </label>
                <input
                  type="text"
                  value={createForm.venue}
                  onChange={(e) => setCreateForm({ ...createForm, venue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="e.g. Auditorium Hall A or Online / Zoom"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Virtual Meeting URL (optional)
                </label>
                <input
                  type="url"
                  value={createForm.meeting_url}
                  onChange={(e) => setCreateForm({ ...createForm, meeting_url: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="https://meet.google.com/xyz or Zoom link"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                >
                  {createSubmitting ? 'Scheduling...' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
