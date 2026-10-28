import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Calendar, PlusCircle, Trash2, Clock, CheckCircle2 } from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export const MentorshipAvailabilityPage = () => {
  const { user } = useAuth()
  const [slots, setSlots] = useState([])
  const [loading, setLoading] = useState(true)
  const [slotDate, setSlotDate] = useState('')
  const [startTime, setStartTime] = useState('18:00')
  const [endTime, setEndTime] = useState('18:45')
  const [submitting, setSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const fetchSlots = async () => {
    setLoading(true)
    try {
      if (user?.id) {
        const res = await api.get(`/mentorship/mentors/${user.id}`)
        if (res.success && res.data) {
          setSlots(res.data.mentor?.available_slots || [])
        }
      }
    } catch (err) {
      console.error('Failed to load mentor slots:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSlots()
  }, [user?.id])

  const handleAddSlot = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    setSuccessMsg('')
    try {
      const res = await api.post('/mentorship/slots', {
        slot_date: slotDate,
        start_time: startTime,
        end_time: endTime,
      })
      if (res.success) {
        setSuccessMsg('Availability slot added!')
        setSlotDate('')
        fetchSlots()
      }
    } catch (err) {
      alert(`Error adding slot: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteSlot = async (slotId) => {
    try {
      const res = await api.delete(`/mentorship/slots/${slotId}`)
      if (res.success) {
        setSlots(slots.filter((s) => s.id !== slotId))
      }
    } catch (err) {
      alert(`Failed to delete slot: ${err.message}`)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/dashboard" className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Mentorship Calendar Slots</h1>
          <p className="text-xs text-slate-500">Configure your open calendar windows for students to book 1-on-1 sessions</p>
        </div>
      </div>

      {successMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Add Slot Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <PlusCircle className="w-4 h-4 text-indigo-600" />
          <span>Add New Available Time Slot</span>
        </h3>

        <form onSubmit={handleAddSlot} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Session Date *</label>
            <input
              type="date"
              required
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">Start Time *</label>
            <input
              type="time"
              required
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 mb-1">End Time *</label>
            <input
              type="time"
              required
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs shadow-sm transition"
          >
            {submitting ? 'Adding...' : 'Add Slot'}
          </button>
        </form>
      </div>

      {/* Slots List */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-slate-900">Configured Open Slots</h3>

        {loading ? (
          <div className="py-8 text-center text-slate-500 text-xs">Loading availability...</div>
        ) : slots.length === 0 ? (
          <div className="p-8 text-center bg-slate-50 rounded-xl text-xs text-slate-500">
            No calendar slots configured yet. Add your first slot above so students can request sessions!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {slots.map((s) => (
              <div
                key={s.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between"
              >
                <div>
                  <div className="font-bold text-slate-900 text-xs">📅 {s.slot_date}</div>
                  <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" />
                    <span>{s.start_time} - {s.end_time}</span>
                  </div>
                </div>

                <button
                  onClick={() => handleDeleteSlot(s.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                  title="Delete slot"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
