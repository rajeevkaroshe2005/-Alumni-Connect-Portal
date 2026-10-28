import React, { useState, useEffect } from 'react'
import {
  FileText,
  UploadCloud,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Briefcase,
  Copy,
  Check,
  RotateCcw,
  Target,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react'
import api from '../../services/api'

export const AIResumeScannerPage = () => {
  const [file, setFile] = useState(null)
  const [resumeText, setResumeText] = useState('')
  const [inputMode, setInputMode] = useState('UPLOAD') // UPLOAD or PASTE
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [customJobDesc, setCustomJobDesc] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [auditResult, setAuditResult] = useState(null)
  const [copiedIndex, setCopiedIndex] = useState(null)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await api.get('/jobs?per_page=20')
        if (res.success && res.data?.jobs) {
          setJobs(res.data.jobs)
          if (res.data.jobs.length > 0) {
            setSelectedJobId(res.data.jobs[0].id)
          }
        }
      } catch {
        // gracefully handle
      }
    }
    fetchJobs()
  }, [])

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0]
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) {
        setError('Resume file size must be under 5MB.')
        return
      }
      setFile(selected)
      setError('')
    }
  }

  const handleScan = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      let res
      if (inputMode === 'UPLOAD' && file) {
        const formData = new FormData()
        formData.append('resume', file)
        if (selectedJobId) formData.append('job_id', selectedJobId)
        if (customJobDesc) formData.append('target_job_description', customJobDesc)

        res = await api.post('/ai/resume/scan', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        })
      } else {
        if (!resumeText.trim()) {
          setError('Please paste your resume text to scan.')
          setLoading(false)
          return
        }
        res = await api.post('/ai/resume/scan', {
          resume_text: resumeText,
          job_id: selectedJobId || undefined,
          target_job_description: customJobDesc || undefined,
        })
      }

      if (res.success && res.data?.audit) {
        setAuditResult(res.data.audit)
      } else {
        setError(res.message || 'ATS scan completed with unexpected format.')
      }
    } catch (err) {
      setError(err.message || 'Failed to scan resume. Please ensure file format is valid.')
    } finally {
      setLoading(false)
    }
  }

  const copyBullet = (text, idx) => {
    navigator.clipboard.writeText(text)
    setCopiedIndex(idx)
    setTimeout(() => setCopiedIndex(null), 2000)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D8D2C4]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C4A878]/25 text-[#244B3A] text-xs font-bold border border-[#C4A878] mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#244B3A]" />
            <span>AI Resume Intelligence & ATS Auditor</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#333333] tracking-tight">
            ATS Resume Scanner & Keyword Optimizer
          </h1>
          <p className="text-xs sm:text-sm text-[#333333]/70 mt-1">
            Simulate Fortune 500 applicant tracking algorithms, uncover missing competencies, and elevate resume impact metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-white border border-[#D8D2C4] rounded-xl text-[#244B3A]">
            TF-IDF & Semantic Grammar Engine
          </span>
        </div>
      </div>

      {/* Main Grid: Input Form & Results */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#D8D2C4] shadow-xs space-y-5">
          <div className="flex bg-[#EAE4D7] p-1 rounded-xl border border-[#D8D2C4] text-xs font-bold">
            <button
              type="button"
              onClick={() => setInputMode('UPLOAD')}
              className={`flex-1 py-2 rounded-lg transition ${
                inputMode === 'UPLOAD' ? 'bg-[#244B3A] text-white shadow-xs' : 'text-[#333333] hover:text-[#244B3A]'
              }`}
            >
              📄 Upload PDF / TXT
            </button>
            <button
              type="button"
              onClick={() => setInputMode('PASTE')}
              className={`flex-1 py-2 rounded-lg transition ${
                inputMode === 'PASTE' ? 'bg-[#244B3A] text-white shadow-xs' : 'text-[#333333] hover:text-[#244B3A]'
              }`}
            >
              ✍️ Paste Raw Text
            </button>
          </div>

          <form onSubmit={handleScan} className="space-y-4">
            {inputMode === 'UPLOAD' ? (
              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1.5">
                  Resume Document (.pdf or .txt) *
                </label>
                <div className="border-2 border-dashed border-[#D8D2C4] hover:border-[#244B3A] rounded-2xl p-6 text-center transition bg-[#F5F1E8]/50">
                  <UploadCloud className="w-8 h-8 text-[#244B3A] mx-auto mb-2" />
                  <input
                    type="file"
                    id="resume-upload"
                    accept=".pdf,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label
                    htmlFor="resume-upload"
                    className="cursor-pointer text-xs font-bold text-[#244B3A] hover:underline block"
                  >
                    {file ? file.name : 'Click to select or drag and drop your resume'}
                  </label>
                  <p className="text-[11px] text-[#333333]/60 mt-1">PDF or Plain Text (Maximum 5MB)</p>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#333333] mb-1.5">
                  Paste Resume Plain Text *
                </label>
                <textarea
                  rows={8}
                  value={resumeText}
                  onChange={(e) => setResumeText(e.target.value)}
                  placeholder="Paste your resume sections, education, skills, and project experience here..."
                  className="w-full p-3 bg-white border border-[#D8D2C4] rounded-xl text-xs text-[#333333] placeholder:text-[#8C8272] focus:ring-2 focus:ring-[#244B3A]/20 focus:border-[#244B3A]"
                />
              </div>
            )}

            {/* Target Job Selection */}
            <div>
              <label className="block text-xs font-bold text-[#333333] mb-1.5">
                Benchmark Against Target Job Opening
              </label>
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full p-2.5 bg-white border border-[#D8D2C4] rounded-xl text-xs text-[#333333] font-medium focus:ring-2 focus:ring-[#244B3A]/20 focus:border-[#244B3A]"
              >
                <option value="">-- General Software Engineering Baseline --</option>
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} at {j.company} ({j.job_type})
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Custom Job Description */}
            <div>
              <label className="block text-[11px] font-bold text-[#333333] mb-1">
                Or Paste Specific Job Description (Optional)
              </label>
              <textarea
                rows={3}
                value={customJobDesc}
                onChange={(e) => setCustomJobDesc(e.target.value)}
                placeholder="Paste external role requirements, qualifications, or tech stack..."
                className="w-full p-2.5 bg-white border border-[#D8D2C4] rounded-xl text-xs text-[#333333] placeholder:text-[#8C8272] focus:ring-2 focus:ring-[#244B3A]/20 focus:border-[#244B3A]"
              />
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || (inputMode === 'UPLOAD' && !file && !resumeText)}
              className="w-full py-3 px-4 bg-[#244B3A] hover:bg-[#3A5F50] disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 border border-[#244B3A]"
            >
              {loading ? (
                <span>Auditing ATS Compatibility...</span>
              ) : (
                <>
                  <span>Run ATS Audit & Optimization</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Scan Report / Empty State (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {!auditResult ? (
            <div className="bg-white p-10 rounded-2xl border border-[#D8D2C4] text-center space-y-4 shadow-xs">
              <div className="w-16 h-16 rounded-2xl bg-[#F5F1E8] text-[#244B3A] border border-[#C4A878] flex items-center justify-center mx-auto shadow-xs">
                <FileText className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-[#333333]">Ready for ATS Analysis</h3>
              <p className="text-xs text-[#333333]/70 max-w-md mx-auto leading-relaxed">
                Upload your resume PDF or paste raw text on the left to extract your ATS pass score, keyword density, section compliance, and metric bullet enhancements.
              </p>
              <div className="grid grid-cols-3 gap-3 pt-4 max-w-sm mx-auto text-left">
                <div className="p-3 bg-[#F5F1E8] rounded-xl border border-[#D8D2C4] text-[11px]">
                  <div className="font-bold text-[#244B3A]">Pass Score</div>
                  <div className="text-[#333333]/70">0 to 100 Index</div>
                </div>
                <div className="p-3 bg-[#F5F1E8] rounded-xl border border-[#D8D2C4] text-[11px]">
                  <div className="font-bold text-[#244B3A]">Keyword Radar</div>
                  <div className="text-[#333333]/70">Missing Skills</div>
                </div>
                <div className="p-3 bg-[#F5F1E8] rounded-xl border border-[#D8D2C4] text-[11px]">
                  <div className="font-bold text-[#244B3A]">Bullet Fixes</div>
                  <div className="text-[#333333]/70">Metric Rewrites</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Score Header Card */}
              <div className="bg-white p-6 rounded-2xl border border-[#D8D2C4] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                <div className="flex items-center gap-5">
                  <div className="relative w-24 h-24 rounded-full border-4 border-[#244B3A] flex flex-col items-center justify-center bg-[#F5F1E8] shrink-0 shadow-inner">
                    <span className="text-3xl font-extrabold text-[#244B3A] leading-none">
                      {auditResult.ats_score}
                    </span>
                    <span className="text-[10px] font-bold text-[#333333]/70 uppercase">/ 100</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#244B3A]/10 text-[#244B3A] border border-[#244B3A]/20">
                      {auditResult.grade}
                    </span>
                    <h3 className="text-lg font-extrabold text-[#333333] mt-1">
                      Target: {auditResult.target_job_title}
                    </h3>
                    <p className="text-xs text-[#333333]/70">
                      Skill Coverage: {auditResult.keyword_audit.skill_coverage_score}% • Section Structure: {auditResult.sections_audit.section_score}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact & Layout Checklist */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-2xl border border-[#D8D2C4] shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-[#244B3A] uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" />
                    Contact Info Audit
                  </h4>
                  <ul className="space-y-2 text-xs">
                    <li className="flex items-center justify-between">
                      <span className="text-[#333333]/80">Email Address Detected</span>
                      {auditResult.contact_audit.has_email ? (
                        <CheckCircle2 className="w-4 h-4 text-[#244B3A]" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-[#333333]/80">Phone Number Detected</span>
                      {auditResult.contact_audit.has_phone ? (
                        <CheckCircle2 className="w-4 h-4 text-[#244B3A]" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-[#333333]/80">LinkedIn Profile Link</span>
                      {auditResult.contact_audit.has_linkedin ? (
                        <CheckCircle2 className="w-4 h-4 text-[#244B3A]" />
                      ) : (
                        <XCircle className="w-4 h-4 text-rose-500" />
                      )}
                    </li>
                    <li className="flex items-center justify-between">
                      <span className="text-[#333333]/80">GitHub / Portfolio Link</span>
                      {auditResult.contact_audit.has_github ? (
                        <CheckCircle2 className="w-4 h-4 text-[#244B3A]" />
                      ) : (
                        <XCircle className="w-4 h-4 text-amber-500" />
                      )}
                    </li>
                  </ul>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-[#D8D2C4] shadow-xs space-y-3">
                  <h4 className="text-xs font-bold text-[#244B3A] uppercase tracking-wider flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4" />
                    Recognized Sections
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {auditResult.sections_audit.present_sections.map((sec, idx) => (
                      <span key={idx} className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-[#244B3A]/10 text-[#244B3A] border border-[#244B3A]/30">
                        ✓ {sec}
                      </span>
                    ))}
                    {auditResult.sections_audit.missing_sections.map((sec, idx) => (
                      <span key={idx} className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">
                        ✗ Missing {sec}
                      </span>
                    ))}
                  </div>
                  <div className="pt-2 text-[11px] text-[#333333]/70">
                    Quantifiable Impact Metrics: <strong className="text-[#244B3A]">{auditResult.content_strength.quantifiable_metrics_count}</strong> detected
                  </div>
                </div>
              </div>

              {/* Keywords Matched & Missing */}
              <div className="bg-white p-6 rounded-2xl border border-[#D8D2C4] shadow-xs space-y-4">
                <h4 className="text-xs font-bold text-[#333333] uppercase tracking-wider">
                  Target Technical Competency Breakdown
                </h4>

                <div>
                  <div className="text-xs font-bold text-[#244B3A] mb-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Matched Keywords in Resume ({auditResult.keyword_audit.matched_skills.length})
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {auditResult.keyword_audit.matched_skills.map((skill, idx) => (
                      <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-[#244B3A]/15 text-[#244B3A] font-bold border border-[#244B3A]/30">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {auditResult.keyword_audit.missing_skills.length > 0 && (
                  <div className="pt-3 border-t border-[#D8D2C4]/60">
                    <div className="text-xs font-bold text-amber-800 mb-2 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Missing Keywords to Consider Adding ({auditResult.keyword_audit.missing_skills.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {auditResult.keyword_audit.missing_skills.map((skill, idx) => (
                        <span key={idx} className="text-xs px-2.5 py-1 rounded-lg bg-[#C4A878]/25 text-[#333333] font-semibold border border-[#C4A878]">
                          + {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Metric-Driven Bullet Enhancer Suggestions */}
              <div className="bg-white p-6 rounded-2xl border border-[#D8D2C4] shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-[#244B3A] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#C4A878]" />
                    AI Bullet Rewriter (STAR + Metric Impact)
                  </h4>
                </div>

                <div className="space-y-4">
                  {auditResult.bullet_enhancements.map((b, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#F5F1E8] border border-[#D8D2C4] space-y-2">
                      <div className="text-[11px] font-bold text-[#244B3A] uppercase tracking-wider">
                        {b.category}
                      </div>

                      <div className="text-xs text-[#333333]/60 line-through">
                        "{b.weak_bullet}"
                      </div>

                      <div className="text-xs font-semibold text-[#333333] bg-white p-3 rounded-lg border border-[#C4A878] flex items-start justify-between gap-3">
                        <span>"{b.enhanced_bullet}"</span>
                        <button
                          type="button"
                          onClick={() => copyBullet(b.enhanced_bullet, idx)}
                          className="shrink-0 text-xs px-2.5 py-1 bg-[#244B3A] text-white rounded-md hover:bg-[#3A5F50] transition flex items-center gap-1"
                        >
                          {copiedIndex === idx ? (
                            <>
                              <Check className="w-3.5 h-3.5" />
                              <span>Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
