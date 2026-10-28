import React, { useState, useEffect } from 'react'
import {
  Award,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Users,
  ChevronDown,
  ChevronUp,
  X,
  Sparkles,
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function SkillEndorsementWidget({ studentId, studentSkills = [], onSkillEndorsed }) {
  const { user, role } = useAuth()
  const [endorsements, setEndorsements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showEndorseModal, setShowEndorseModal] = useState(false)
  const [selectedSkill, setSelectedSkill] = useState('')
  const [customSkill, setCustomSkill] = useState('')
  const [relationshipContext, setRelationshipContext] = useState('Mentored in Capstone Project')
  const [submitting, setSubmitting] = useState(false)
  const [expandedSkill, setExpandedSkill] = useState(null)

  const fetchEndorsements = async () => {
    if (!studentId) return
    try {
      setLoading(true)
      const res = await api.get(`/skills/student/${studentId}`)
      if (res?.success && res.data) {
        setEndorsements(res.data.skills || [])
      }
    } catch (err) {
      console.error('Failed to load skill endorsements:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEndorsements()
  }, [studentId])

  const handleEndorseSubmit = async (e) => {
    e.preventDefault()
    const targetSkill = selectedSkill === '__custom__' ? customSkill.trim() : selectedSkill
    if (!targetSkill) {
      alert('Please specify a skill to endorse.')
      return
    }

    try {
      setSubmitting(true)
      const res = await api.post('/skills/endorse', {
        student_id: studentId,
        skill_name: targetSkill,
        relationship_context: relationshipContext,
      })
      if (res?.success) {
        setShowEndorseModal(false)
        setSelectedSkill('')
        setCustomSkill('')
        fetchEndorsements()
        if (onSkillEndorsed) onSkillEndorsed()
      }
    } catch (err) {
      alert(`Endorsement failed: ${err.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleRevokeEndorsement = async (endorsementId) => {
    if (!confirm('Are you sure you want to revoke this skill endorsement?')) return
    try {
      const res = await api.delete(`/skills/endorse/${endorsementId}`)
      if (res?.success) {
        fetchEndorsements()
      }
    } catch (err) {
      alert(`Error revoking endorsement: ${err.message}`)
    }
  }

  const relationshipOptions = [
    'Mentored in Capstone Project',
    'Supervised in Internship',
    'Collaborated on Open Source Repository',
    'Conducted Mock Technical Interview',
    'Department Academic Colleague',
  ]

  const canEndorse = (role === 'ALUMNI' || role === 'ADMIN') && user?.id !== studentId

  return (
    <div className="bg-white rounded-3xl p-6 border border-[#D8D2C4] shadow-xs space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-[#D8D2C4]/60">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#244B3A]" />
          <div>
            <h3 className="text-base font-extrabold text-[#333333]">
              Verified Skill Endorsements
            </h3>
            <p className="text-[11px] text-slate-500">
              Endorsed by verified university alumni and faculty mentors
            </p>
          </div>
        </div>

        {canEndorse && (
          <button
            onClick={() => setShowEndorseModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#244B3A] hover:bg-[#3A5F50] text-white rounded-xl text-xs font-bold shadow-xs transition"
          >
            <Plus className="w-3.5 h-3.5 text-[#C4A878]" />
            <span>Endorse Skill</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="py-6 text-center text-xs text-[#244B3A]">Loading verified endorsements...</div>
      ) : endorsements.length === 0 ? (
        <div className="py-6 text-center text-slate-400 text-xs">
          No skills have received alumni endorsements yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {endorsements.map((item) => {
            const isExpanded = expandedSkill === item.skill_name
            return (
              <div
                key={item.skill_name}
                className="p-3.5 bg-[#F5F1E8]/50 rounded-2xl border border-[#D8D2C4]/70 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-[#333333]">
                      {item.skill_name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-[#244B3A]/10 text-[#244B3A] text-[10px] font-bold border border-[#244B3A]/20">
                      {item.endorsement_count} {item.endorsement_count === 1 ? 'Endorsement' : 'Endorsements'}
                    </span>
                  </div>

                  <button
                    onClick={() => setExpandedSkill(isExpanded ? null : item.skill_name)}
                    className="p-1 text-slate-400 hover:text-[#244B3A]"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {/* Endorsers Drawer */}
                {isExpanded && item.endorsers && (
                  <div className="pt-2 border-t border-[#D8D2C4]/60 space-y-2 text-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Endorsed by:
                    </span>
                    <div className="space-y-1.5">
                      {item.endorsers.map((e) => (
                        <div
                          key={e.id}
                          className="p-2 bg-white rounded-xl border border-[#D8D2C4]/40 flex items-center justify-between"
                        >
                          <div>
                            <p className="font-bold text-[#333333] text-[11px]">
                              {e.endorser_name}{' '}
                              {e.endorser_company && (
                                <span className="font-normal text-slate-500">
                                  ({e.endorser_position || 'Alum'} @ {e.endorser_company})
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-[#244B3A] font-medium">
                              Context: {e.relationship_context}
                            </p>
                          </div>

                          {user?.id === e.endorser_id && (
                            <button
                              onClick={() => handleRevokeEndorsement(e.id)}
                              className="text-[10px] text-rose-600 hover:underline"
                            >
                              Revoke
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Endorse Skill Modal */}
      {showEndorseModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#D8D2C4] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8D2C4]">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#244B3A]" />
                <h3 className="text-base font-extrabold text-[#333333]">Endorse Student Skill</h3>
              </div>
              <button
                onClick={() => setShowEndorseModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEndorseSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#333333] mb-1">Select Skill to Endorse *</label>
                <select
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                  className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                >
                  <option value="">-- Choose student skill --</option>
                  {studentSkills.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                  <option value="__custom__">+ Other specific skill...</option>
                </select>
              </div>

              {selectedSkill === '__custom__' && (
                <div>
                  <label className="block font-bold text-[#333333] mb-1">Skill Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. PyTorch, Kubernetes, System Design"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-[#333333] mb-1">Professional Context *</label>
                <select
                  value={relationshipContext}
                  onChange={(e) => setRelationshipContext(e.target.value)}
                  className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                >
                  {relationshipOptions.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </div>

              <div className="p-3 bg-[#F5F1E8]/60 rounded-xl border border-[#D8D2C4]/60 text-[10px] text-slate-600">
                Safeguard: Endorsements are logged with your alumnus verification credential to ensure high industry credibility.
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowEndorseModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-[#333333] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#244B3A] hover:bg-[#3A5F50] text-white font-bold rounded-xl shadow-xs transition"
                >
                  {submitting ? 'Endorsing...' : 'Confirm Endorsement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
