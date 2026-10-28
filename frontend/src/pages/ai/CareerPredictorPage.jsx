import React, { useState, useEffect } from 'react'
import {
  TrendingUp,
  DollarSign,
  Briefcase,
  Award,
  Zap,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export const CareerPredictorPage = () => {
  const { user } = useAuth()
  const [department, setDepartment] = useState('Computer Science & Engineering')
  const [yearsExperience, setYearsExperience] = useState(1)
  const [targetRole, setTargetRole] = useState('Software Engineer')
  const [companyTier, setCompanyTier] = useState('TIER_1_PRODUCT')
  const [selectedSkills, setSelectedSkills] = useState(['Python', 'React', 'SQL', 'Git'])
  const [prediction, setPrediction] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const AVAILABLE_SKILLS = [
    'Python', 'React', 'JavaScript', 'TypeScript', 'Node.js', 'Java', 'Spring Boot',
    'SQL', 'PostgreSQL', 'Docker', 'Kubernetes', 'AWS', 'System Design', 'Distributed Systems',
    'Machine Learning', 'Deep Learning', 'PyTorch', 'Large Language Models', 'DevOps', 'Redis'
  ]

  const toggleSkill = (skill) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill))
    } else {
      setSelectedSkills([...selectedSkills, skill])
    }
  }

  const handlePredict = async (e) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await api.post('/ai/career/predict', {
        department,
        years_experience: Number(yearsExperience),
        skills: selectedSkills,
        target_role: targetRole,
        company_tier: companyTier,
      })

      if (res.success && res.data?.prediction) {
        setPrediction(res.data.prediction)
      } else {
        setError(res.message || 'Prediction failed.')
      }
    } catch (err) {
      setError(err.message || 'Error running career prediction.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    handlePredict()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-[#D8D2C4]">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C4A878]/25 text-[#244B3A] text-xs font-bold border border-[#C4A878] mb-2">
            <TrendingUp className="w-3.5 h-3.5 text-[#244B3A]" />
            <span>Explainable Career Intelligence & Salary Modeling</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#333333] tracking-tight">
            Career Trajectory & Compensation Predictor
          </h1>
          <p className="text-xs sm:text-sm text-[#333333]/70 mt-1">
            Predict market salary bands, visualize 5-year progression curves, and identify high-ROI skills that maximize promotion velocity.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 bg-white border border-[#D8D2C4] rounded-xl text-[#244B3A]">
            Heuristic Regression & Tier Multiplier Model
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Controls (5 cols) */}
        <form onSubmit={handlePredict} className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#D8D2C4] shadow-xs space-y-5">
          <h3 className="text-sm font-extrabold text-[#333333] uppercase tracking-wider flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-[#244B3A]" />
            Career Profile Inputs
          </h3>

          <div>
            <label className="block text-xs font-bold text-[#333333] mb-1.5">Academic Department</label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#D8D2C4] rounded-xl text-xs text-[#333333] font-medium focus:ring-2 focus:ring-[#244B3A]/20 focus:border-[#244B3A]"
            >
              <option value="Computer Science & Engineering">Computer Science & Engineering</option>
              <option value="Information Technology">Information Technology</option>
              <option value="Electronics & Communication Engineering">Electronics & Communication Engineering</option>
              <option value="Mechanical Engineering">Mechanical Engineering</option>
              <option value="Electrical Engineering">Electrical Engineering</option>
              <option value="Civil Engineering">Civil Engineering</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[#333333] mb-1.5">
              <span>Experience Level: {yearsExperience} Years</span>
              <span className="text-[#244B3A]">
                {yearsExperience === 0 ? 'Fresh Graduate' : (yearsExperience <= 2 ? 'Junior SDE' : (yearsExperience <= 5 ? 'Mid-Senior' : 'Senior/Lead'))}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              value={yearsExperience}
              onChange={(e) => setYearsExperience(e.target.value)}
              className="w-full accent-[#244B3A]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#333333] mb-1.5">Target Engineering Role</label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full p-2.5 bg-white border border-[#D8D2C4] rounded-xl text-xs text-[#333333] font-medium focus:ring-2 focus:ring-[#244B3A]/20 focus:border-[#244B3A]"
            >
              <option value="Software Engineer">Software Engineer (General)</option>
              <option value="Full-Stack Engineer">Full-Stack Engineer</option>
              <option value="Backend & Distributed Systems Engineer">Backend & Distributed Systems Engineer</option>
              <option value="AI / Machine Learning Engineer">AI / Machine Learning Engineer</option>
              <option value="DevOps & Cloud Architect">DevOps & Cloud Architect</option>
              <option value="Technical Product Manager">Technical Product Manager</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#333333] mb-1.5">Target Company Tier</label>
            <div className="grid grid-cols-2 gap-2">
              {[
                { id: 'TIER_1_PRODUCT', name: 'Tier 1 Product', sub: 'Google, Stripe, Meta' },
                { id: 'FINTECH_HIGH_GROWTH', name: 'FinTech / Unicorn', sub: 'Razorpay, Revolut' },
                { id: 'MID_TIER_PRODUCT', name: 'SaaS Product', sub: 'Mid-Market Scale' },
                { id: 'IT_SERVICES', name: 'IT Services', sub: 'Consulting & Services' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  type="button"
                  onClick={() => setCompanyTier(tier.id)}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    companyTier === tier.id
                      ? 'bg-[#244B3A] text-white border-[#244B3A] shadow-xs'
                      : 'bg-[#F5F1E8] text-[#333333] border-[#D8D2C4] hover:border-[#244B3A]'
                  }`}
                >
                  <div className="text-xs font-bold">{tier.name}</div>
                  <div className={`text-[10px] ${companyTier === tier.id ? 'text-white/80' : 'text-[#333333]/60'} truncate`}>
                    {tier.sub}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#333333] mb-1.5">
              Select Your Tech Skills ({selectedSkills.length} selected)
            </label>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-[#F5F1E8]/70 rounded-xl border border-[#D8D2C4]">
              {AVAILABLE_SKILLS.map((skill) => {
                const active = selectedSkills.includes(skill)
                return (
                  <button
                    key={skill}
                    type="button"
                    onClick={() => toggleSkill(skill)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg font-medium transition ${
                      active
                        ? 'bg-[#244B3A] text-white'
                        : 'bg-white text-[#333333] border border-[#D8D2C4] hover:bg-slate-100'
                    }`}
                  >
                    {active ? '✓ ' : '+ '}{skill}
                  </button>
                )
              })}
            </div>
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 bg-[#244B3A] hover:bg-[#3A5F50] text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 border border-[#244B3A]"
          >
            {loading ? <span>Predicting Trajectory...</span> : <span>Recalculate Compensation & Path</span>}
          </button>
        </form>

        {/* Prediction Display (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {prediction && (
            <>
              {/* Compensation Hero Card */}
              <div className="bg-[#244B3A] rounded-2xl p-6 text-[#F5F1E8] border border-[#3A5F50] shadow-md relative overflow-hidden">
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-[#3A5F50] text-[#C4A878] border border-[#C4A878]/40">
                      Estimated Annual Compensation Band
                    </span>
                    <span className="text-xs text-[#F5F1E8]/80">{prediction.target_role}</span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                    <span className="text-3xl sm:text-4xl font-extrabold text-white">
                      ₹{prediction.compensation_band.median_lpa} LPA
                    </span>
                    <span className="text-xs text-[#C4A878] font-semibold">
                      (Range: ₹{prediction.compensation_band.min_lpa} - ₹{prediction.compensation_band.max_lpa} LPA)
                    </span>
                  </div>

                  <div className="pt-3 border-t border-[#3A5F50] flex items-center justify-between text-xs text-[#F5F1E8]/80">
                    <span>Global Remote Equivalent: <strong>{prediction.compensation_band.median_usd} / year</strong></span>
                    <span>Skill Stack Multiplier: <strong>Active</strong></span>
                  </div>
                </div>
              </div>

              {/* 5-Year Career Progression Timeline */}
              <div className="bg-white p-6 rounded-2xl border border-[#D8D2C4] shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-[#333333] uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[#244B3A]" />
                  5-Year Milestone Progression Curve
                </h3>

                <div className="space-y-4 relative pl-4 border-l-2 border-[#D8D2C4]">
                  {prediction.progression_timeline.map((step, idx) => (
                    <div key={idx} className="relative group space-y-1">
                      <div className="absolute -left-[23px] top-1 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#244B3A] group-hover:bg-[#244B3A] transition" />
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-[#244B3A]">{step.year}</span>
                        <span className="text-xs font-extrabold text-[#333333] px-2 py-0.5 rounded bg-[#F5F1E8] border border-[#D8D2C4]">
                          {step.expected_lpa}
                        </span>
                      </div>
                      <div className="text-xs font-bold text-[#333333]">{step.title}</div>
                      <p className="text-[11px] text-[#333333]/70">{step.focus}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* High-ROI Next Skills to Learn */}
              <div className="bg-white p-6 rounded-2xl border border-[#D8D2C4] shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-[#244B3A] uppercase tracking-wider flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-[#C4A878]" />
                  High-ROI Competencies to Boost Your Compensation
                </h3>

                <div className="grid grid-cols-1 gap-3">
                  {prediction.high_roi_skills.map((skillItem, idx) => (
                    <div key={idx} className="p-4 rounded-xl bg-[#F5F1E8] border border-[#D8D2C4] flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-[#333333]">{skillItem.skill}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#244B3A] text-white">
                            {skillItem.salary_bump} Bump
                          </span>
                        </div>
                        <p className="text-[11px] text-[#333333]/70 leading-relaxed">{skillItem.impact}</p>
                        <div className="text-[10px] text-[#333333]/60 pt-1">
                          Est. Time to Master: <strong>{skillItem.time_to_master}</strong> • Difficulty: <strong>{skillItem.difficulty}</strong>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
