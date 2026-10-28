import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Send,
  Sparkles,
  Copy,
  Check,
  MessageSquare,
  Briefcase,
  User,
  Building,
  ArrowRight,
  AlertCircle,
  RefreshCw,
  ChevronRight,
  Coffee,
  GraduationCap,
  Code,
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function AIReferralGeneratorPage() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const [jobs, setJobs] = useState([])
  const [alumni, setAlumni] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [selectedAlumnusId, setSelectedAlumnusId] = useState('')
  const [selectedTone, setSelectedTone] = useState('FORMAL_REFERRAL')
  const [generating, setGenerating] = useState(false)
  const [pitchResult, setPitchResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')
  const [loadingInitial, setLoadingInitial] = useState(true)

  const TONES = [
    { id: 'FORMAL_REFERRAL', label: 'Formal Referral', icon: Briefcase, desc: 'Direct employee referral pitch with project highlights' },
    { id: 'COFFEE_CHAT', label: 'Coffee Chat', icon: Coffee, desc: 'Casual 15-minute introductory virtual chat' },
    { id: 'HIGHER_STUDIES_ADVICE', label: 'Higher Studies', icon: GraduationCap, desc: 'Grad school, MS/PhD, and research advice inquiry' },
    { id: 'TECHNICAL_GUIDANCE', label: 'Tech Guidance', icon: Code, desc: 'System design, architecture, and tech stack discussion' },
  ]

  const fetchInitialData = async () => {
    try {
      setLoadingInitial(true)
      const [resJobs, resAlumni] = await Promise.all([
        api.get('/jobs?per_page=50'),
        api.get('/alumni?per_page=50'),
      ])

      if (resJobs?.success) {
        const jList = resJobs.data?.jobs || []
        setJobs(jList)
        if (jList.length > 0) setSelectedJobId(jList[0].id)
      }

      if (resAlumni?.success) {
        const aList = resAlumni.data?.alumni || []
        setAlumni(aList)
        if (aList.length > 0) setSelectedAlumnusId(aList[0].id)
      }
    } catch (err) {
      setError(err.message || 'Failed to load options.')
    } finally {
      setLoadingInitial(false)
    }
  }

  useEffect(() => {
    fetchInitialData()
  }, [])

  const handleGeneratePitch = async (e) => {
    e.preventDefault()
    if (!selectedAlumnusId || generating) return

    try {
      setGenerating(true)
      setError('')
      setCopied(false)

      let res
      if (selectedTone === 'FORMAL_REFERRAL' && selectedJobId) {
        res = await api.post('/ai/referral-pitch', {
          job_id: parseInt(selectedJobId, 10),
          alumnus_id: parseInt(selectedAlumnusId, 10),
        })
      } else {
        const selectedJob = jobs.find((j) => j.id === parseInt(selectedJobId, 10))
        res = await api.post('/ai/outreach/generate', {
          alumnus_id: parseInt(selectedAlumnusId, 10),
          tone: selectedTone,
          target_company: selectedJob?.company,
          target_role: selectedJob?.title,
        })
      }

      if (res?.success) {
        const data = res.data?.pitch || res.data?.outreach
        setPitchResult({
          subject_line: data.subject_line,
          pitch_text: data.pitch_text || data.message_body,
          target_alumnus_id: data.target_alumnus_id || parseInt(selectedAlumnusId, 10),
          target_alumnus_name: data.target_alumnus_name,
          target_company: data.target_company,
          target_job_title: data.target_job_title || data.target_role,
          shared_skills: data.shared_skills || [],
          follow_up_tip: data.follow_up_tip || 'Follow up politely after 5 business days.',
        })
      }
    } catch (err) {
      setError(err.message || 'Failed to generate referral pitch.')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = () => {
    if (!pitchResult) return
    const fullText = `Subject: ${pitchResult.subject_line}\n\n${pitchResult.pitch_text}`
    navigator.clipboard.writeText(fullText)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  const handleSendViaChat = async () => {
    if (!pitchResult) return
    try {
      await api.post('/chat/send', {
        recipient_id: pitchResult.target_alumnus_id,
        content: pitchResult.pitch_text,
      })
      navigate(`/messages/${pitchResult.target_alumnus_id}`)
    } catch {
      navigate(`/messages/${pitchResult.target_alumnus_id}`)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#D8D2C4] gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C4A878]/25 text-[#244B3A] text-xs font-bold border border-[#C4A878] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#244B3A]" />
            <span>AI Cold Outreach & Referral Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#333333] tracking-tight">
            Smart AI Job Referral & Outreach Generator
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#333333]/70 max-w-2xl">
            Never send generic or awkward cold messages. Our AI pairs your project competencies with alumni affiliations to draft compelling, high-converting outreach in seconds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/mock-interview"
            className="px-3.5 py-2 bg-white hover:bg-[#F5F1E8] text-[#244B3A] border border-[#D8D2C4] rounded-xl text-xs font-bold transition flex items-center gap-1"
          >
            <span>AI Mock Interview</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {loadingInitial ? (
        <div className="bg-white rounded-3xl border border-[#D8D2C4] p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-[#244B3A] mx-auto" />
          <p className="text-sm font-semibold text-[#333333]">Loading active opportunities and alumni list...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Configuration Form (Left - 5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleGeneratePitch} className="bg-white rounded-2xl border border-[#D8D2C4] p-6 sm:p-7 shadow-xs space-y-5">
              <h2 className="text-xs font-bold text-[#333333] uppercase tracking-wider flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-[#244B3A]" />
                Select Outreach Strategy
              </h2>

              {/* Tone Selection */}
              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1.5">
                  1. Communication Tone & Purpose *
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {TONES.map((t) => {
                    const Icon = t.icon
                    const active = selectedTone === t.id
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTone(t.id)}
                        className={`p-2.5 rounded-xl border text-left transition flex items-start gap-2 ${
                          active
                            ? 'bg-[#244B3A] text-white border-[#244B3A] shadow-xs'
                            : 'bg-[#F5F1E8] text-[#333333] border-[#D8D2C4] hover:border-[#244B3A]'
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${active ? 'text-[#C4A878]' : 'text-[#244B3A]'}`} />
                        <div>
                          <div className="text-xs font-bold leading-tight">{t.label}</div>
                          <div className={`text-[10px] ${active ? 'text-white/80' : 'text-[#333333]/60'} line-clamp-1`}>
                            {t.desc}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1.5">
                  2. Choose Alumnus at Target Company *
                </label>
                <select
                  value={selectedAlumnusId}
                  onChange={(e) => setSelectedAlumnusId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8D2C4] rounded-xl text-xs font-medium text-[#333333] focus:ring-2 focus:ring-[#244B3A]/20 focus:border-[#244B3A]"
                >
                  {alumni.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} — {a.current_position || 'Engineer'} at {a.current_company || 'Tech'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1.5">
                  3. Associated Job / Opportunity
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-[#D8D2C4] rounded-xl text-xs font-medium text-[#333333] focus:ring-2 focus:ring-[#244B3A]/20 focus:border-[#244B3A]"
                >
                  <option value="">-- General Networking (No Specific Job) --</option>
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} — {j.company} ({j.job_type})
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={generating}
                className="w-full py-3 px-4 bg-[#244B3A] hover:bg-[#3A5F50] text-white font-bold rounded-xl text-xs shadow-md transition flex items-center justify-center gap-2 disabled:opacity-50 border border-[#244B3A]"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Drafting Tailored Pitch...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-[#C4A878]" /> Generate Custom Message
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Result Column (Right - 7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {!pitchResult ? (
              <div className="bg-white rounded-2xl border border-[#D8D2C4] p-10 text-center space-y-4 shadow-xs">
                <div className="w-16 h-16 rounded-2xl bg-[#F5F1E8] border border-[#C4A878] text-[#244B3A] flex items-center justify-center mx-auto shadow-xs">
                  <Send className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-[#333333]">Ready to Draft Your Message</h3>
                <p className="text-xs text-[#333333]/70 max-w-md mx-auto leading-relaxed">
                  Select your desired communication tone and an alumnus on the left. The AI will weave your skills, university background, and project accomplishments into a high-response outreach message.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-[#D8D2C4] p-6 sm:p-8 shadow-xs space-y-6">
                {/* Header Information */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#D8D2C4] gap-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#244B3A]/10 text-[#244B3A] border border-[#244B3A]/20">
                      Drafted For: {pitchResult.target_alumnus_name} ({pitchResult.target_company})
                    </span>
                    <h3 className="text-sm font-extrabold text-[#333333] mt-1">
                      {pitchResult.target_job_title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-3 py-1.5 bg-[#F5F1E8] hover:bg-[#C4A878]/30 text-[#244B3A] border border-[#D8D2C4] rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-[#244B3A]" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy All'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleSendViaChat}
                      className="px-3.5 py-1.5 bg-[#244B3A] hover:bg-[#3A5F50] text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 border border-[#244B3A]"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Send via Portal DM</span>
                    </button>
                  </div>
                </div>

                {/* Subject Line */}
                <div>
                  <label className="block text-[11px] font-bold text-[#244B3A] uppercase tracking-wider mb-1">
                    Subject Line
                  </label>
                  <div className="p-3 bg-[#F5F1E8] rounded-xl text-xs font-bold text-[#333333] border border-[#D8D2C4]">
                    {pitchResult.subject_line}
                  </div>
                </div>

                {/* Message Body */}
                <div>
                  <label className="block text-[11px] font-bold text-[#244B3A] uppercase tracking-wider mb-1">
                    Personalized Message Body
                  </label>
                  <div className="p-4 bg-white rounded-xl text-xs font-medium text-[#333333] border border-[#D8D2C4] whitespace-pre-wrap leading-relaxed shadow-inner font-sans">
                    {pitchResult.pitch_text}
                  </div>
                </div>

                {/* Tactical Advice Box */}
                <div className="p-4 bg-[#F5F1E8] rounded-xl border border-[#C4A878] text-xs space-y-1">
                  <div className="font-bold text-[#244B3A] flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#C4A878]" />
                    Tactical Follow-Up Advice:
                  </div>
                  <p className="text-[#333333]/80">{pitchResult.follow_up_tip}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
