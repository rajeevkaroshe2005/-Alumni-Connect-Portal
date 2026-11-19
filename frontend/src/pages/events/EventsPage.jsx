import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, Plus, Search, Filter, Video, 
  Clock, CheckCircle, AlertCircle, X, ExternalLink, RotateCcw
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { SkeletonCard } from '../../components/common/SkeletonLoader';
import { EmptyState } from '../../components/common/EmptyState';

export default function EventsPage() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
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
      if (debouncedSearch.trim()) params.q = debouncedSearch.trim();

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
  }, [selectedType, debouncedSearch]);

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
    WEBINAR: 'bg-[#244B3A]/10 text-[#244B3A] border border-[#244B3A]/20',
    WORKSHOP: 'bg-emerald-100 text-emerald-800 border border-emerald-300',
    REUNION: 'bg-purple-100 text-purple-800 border border-purple-300',
    NETWORKING: 'bg-[#C4A878]/20 text-[#244B3A] border border-[#C4A878]/40'
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#D8D2C4] gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#333333] flex items-center gap-2">
            <Calendar className="w-8 h-8 text-[#244B3A]" />
            Campus & Alumni Events
          </h1>
          <p className="mt-1 text-[#333333]/70 text-sm">
            Connect through technical webinars, masterclasses, reunions, and professional networking meetups.
          </p>
        </div>

        {(user?.role === 'ALUMNI' || user?.role === 'ADMIN') && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-[#244B3A] hover:bg-[#1B3B2B] transition"
          >
            <Plus className="w-4 h-4 mr-2" />
            Schedule Event
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="mt-6 flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-[#D8D2C4] shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-[#333333]/40" />
            <input
              type="text"
              placeholder="Live search by topic, speaker, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-[#D8D2C4] rounded-xl bg-white text-[#333333] placeholder:text-[#333333]/40 focus:outline-none focus:ring-2 focus:ring-[#244B3A]/20 focus:border-[#244B3A] text-sm"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-[#244B3A] hover:bg-[#1B3B2B] text-white rounded-xl text-sm font-semibold transition shadow-sm"
          >
            Search
          </button>
          {(searchQuery || selectedType !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedType('ALL');
              }}
              className="px-3.5 py-2.5 border border-[#D8D2C4] hover:bg-[#F5F1E8] text-[#333333] rounded-xl text-sm font-medium transition flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#244B3A]" />
              <span>Reset</span>
            </button>
          )}
        </form>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-[#333333]/40 hidden sm:block mr-1" />
          {['ALL', 'WEBINAR', 'WORKSHOP', 'REUNION', 'NETWORKING'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedType === type
                  ? 'bg-[#244B3A] text-white shadow-sm'
                  : 'bg-[#F5F1E8] text-[#333333] hover:bg-[#D8D2C4]/40'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      {loading ? (
        <div className="mt-8">
          <SkeletonCard count={6} />
        </div>
      ) : error ? (
        <div className="mt-8 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      ) : events.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No Events Scheduled"
          description="No events match your current filter criteria. Try adjusting your search query or check back soon."
          actionLabel="View All Events"
          onAction={() => {
            setSearchQuery('');
            setSelectedType('ALL');
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {events.map((evt) => (
            <div
              key={evt.id}
              className="bg-white rounded-2xl border border-[#D8D2C4] shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                      eventTypeColors[evt.event_type] || 'bg-gray-100 text-[#333333]'
                    }`}
                  >
                    {evt.event_type}
                  </span>
                  <div className="flex items-center text-xs text-[#333333]/60 gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <span>
                      {evt.attendee_count || 0} / {evt.capacity} registered
                    </span>
                  </div>
                </div>

                <Link
                  to={`/events/${evt.id}`}
                  className="block text-xl font-bold text-[#333333] hover:text-[#244B3A] transition mb-2"
                >
                  {evt.title}
                </Link>

                <p className="text-[#333333]/70 text-sm line-clamp-3 mb-4">
                  {evt.description}
                </p>

                <div className="space-y-2 text-xs text-[#333333]/60">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#244B3A] flex-shrink-0" />
                    <span>{formatDateTime(evt.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#C4A878] flex-shrink-0" />
                    <span className="truncate">{evt.venue || 'Virtual Online Platform'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#FBF9F4] border-t border-[#D8D2C4] flex items-center justify-between gap-3">
                <Link
                  to={`/events/${evt.id}`}
                  className="text-xs font-bold text-[#244B3A] hover:underline inline-flex items-center gap-1"
                >
                  Details <ExternalLink className="w-3 h-3" />
                </Link>

                <button
                  onClick={() => handleToggleRSVP(evt.id)}
                  disabled={actionLoading === evt.id}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    evt.is_registered
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-[#244B3A] text-white hover:bg-[#1b382b]'
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
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-xl border border-[#D8D2C4] max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-4 border-b border-[#D8D2C4]">
              <h2 className="text-xl font-bold text-[#333333]">Schedule New Campus Event</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-[#333333]/50 hover:text-[#333333] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {createError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                {createError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1">
                  Event Title *
                </label>
                <input
                  type="text"
                  required
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D8D2C4] rounded-xl text-sm bg-[#FBF9F4] text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40"
                  placeholder="e.g. System Design Masterclass"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1">
                    Event Type *
                  </label>
                  <select
                    value={createForm.event_type}
                    onChange={(e) => setCreateForm({ ...createForm, event_type: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D8D2C4] rounded-xl text-sm bg-[#FBF9F4] text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40"
                  >
                    <option value="WEBINAR">Webinar</option>
                    <option value="WORKSHOP">Workshop</option>
                    <option value="REUNION">Reunion</option>
                    <option value="NETWORKING">Networking</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1">
                    Attendee Capacity
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={createForm.capacity}
                    onChange={(e) => setCreateForm({ ...createForm, capacity: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D8D2C4] rounded-xl text-sm bg-[#FBF9F4] text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1">
                  Description *
                </label>
                <textarea
                  rows="3"
                  required
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D8D2C4] rounded-xl text-sm bg-[#FBF9F4] text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40"
                  placeholder="Outline topics covered, target audience, prerequisites..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1">
                    Start Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={createForm.start_time}
                    onChange={(e) => setCreateForm({ ...createForm, start_time: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D8D2C4] rounded-xl text-sm bg-[#FBF9F4] text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1">
                    End Time *
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={createForm.end_time}
                    onChange={(e) => setCreateForm({ ...createForm, end_time: e.target.value })}
                    className="w-full px-3 py-2 border border-[#D8D2C4] rounded-xl text-sm bg-[#FBF9F4] text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1">
                  Venue / Location
                </label>
                <input
                  type="text"
                  value={createForm.venue}
                  onChange={(e) => setCreateForm({ ...createForm, venue: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D8D2C4] rounded-xl text-sm bg-[#FBF9F4] text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40"
                  placeholder="e.g. Auditorium Hall A or Online / Zoom"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1">
                  Virtual Meeting URL (optional)
                </label>
                <input
                  type="url"
                  value={createForm.meeting_url}
                  onChange={(e) => setCreateForm({ ...createForm, meeting_url: e.target.value })}
                  className="w-full px-3 py-2 border border-[#D8D2C4] rounded-xl text-sm bg-[#FBF9F4] text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40"
                  placeholder="https://meet.google.com/xyz or Zoom link"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#D8D2C4]">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#D8D2C4] text-[#333333] rounded-xl text-sm font-semibold hover:bg-[#FBF9F4] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createSubmitting}
                  className="px-5 py-2 bg-[#244B3A] hover:bg-[#1b382b] text-white font-bold rounded-xl text-sm disabled:opacity-50 cursor-pointer shadow-xs"
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
