import React, { useState, useEffect } from 'react'
import {
  User,
  Mail,
  Briefcase,
  GraduationCap,
  MapPin,
  Phone,
  Globe,
  Code,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  Plus,
  X,
  Sparkles,
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import SkillEndorsementWidget from '../../components/skills/SkillEndorsementWidget'

export default function ProfilePage() {
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  // Base Profile State
  const [baseProfile, setBaseProfile] = useState({
    first_name: '',
    last_name: '',
    headline: '',
    bio: '',
    avatar_url: '',
    phone: '',
    location: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    skills: [],
  })

  const [skillInput, setSkillInput] = useState('')

  // Student Detail State
  const [studentDetail, setStudentDetail] = useState({
    roll_number: '',
    current_year: 4,
    degree: 'B.Tech / B.E.',
    department: 'Computer Science & Engineering',
    expected_graduation_year: 2026,
    cgpa: 8.8,
    interests: '',
  })

  // Alumni Detail State
  const [alumniDetail, setAlumniDetail] = useState({
    graduation_year: 2022,
    degree: 'B.Tech / B.E.',
    department: 'Computer Science & Engineering',
    current_company: '',
    current_position: '',
    industry: 'Information Technology',
    verification_status: 'PENDING',
    verification_document_url: '',
  })

  // Fetch full user profile
  const fetchProfile = async () => {
    if (!user?.id) return
    try {
      setLoading(true)
      const res = await api.get(`/profiles/${user.id}`)
      if (res?.success) {
        const u = res.data?.user
        const p = u.profile || {}
        setBaseProfile({
          first_name: p.first_name || '',
          last_name: p.last_name || '',
          headline: p.headline || '',
          bio: p.bio || '',
          avatar_url: p.avatar_url || '',
          phone: p.phone || '',
          location: p.location || '',
          linkedin_url: p.linkedin_url || '',
          github_url: p.github_url || '',
          portfolio_url: p.portfolio_url || '',
          skills: Array.isArray(p.skills)
            ? p.skills
            : p.skills
              ? String(p.skills).split(',').map((s) => s.trim()).filter(Boolean)
              : [],
        })

        if (u.student_detail) {
          setStudentDetail({
            roll_number: u.student_detail.roll_number || '',
            current_year: u.student_detail.current_year || 4,
            degree: u.student_detail.degree || 'B.Tech / B.E.',
            department: u.student_detail.department || 'Computer Science & Engineering',
            expected_graduation_year: u.student_detail.expected_graduation_year || 2026,
            cgpa: u.student_detail.cgpa || 8.5,
            interests: u.student_detail.interests || '',
          })
        }

        if (u.alumni_detail) {
          setAlumniDetail({
            graduation_year: u.alumni_detail.graduation_year || 2022,
            degree: u.alumni_detail.degree || 'B.Tech / B.E.',
            department: u.alumni_detail.department || 'Computer Science & Engineering',
            current_company: u.alumni_detail.current_company || '',
            current_position: u.alumni_detail.current_position || '',
            industry: u.alumni_detail.industry || 'Information Technology',
            verification_status: u.alumni_detail.verification_status || 'PENDING',
            verification_document_url: u.alumni_detail.verification_document_url || '',
          })
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load profile.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProfile()
  }, [user?.id])

  const handleAddSkill = (e) => {
    e.preventDefault()
    const clean = skillInput.trim()
    if (clean && !baseProfile.skills.includes(clean)) {
      setBaseProfile({
        ...baseProfile,
        skills: [...baseProfile.skills, clean],
      })
      setSkillInput('')
    }
  }

  const handleRemoveSkill = (skillToRemove) => {
    setBaseProfile({
      ...baseProfile,
      skills: baseProfile.skills.filter((s) => s !== skillToRemove),
    })
  }

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMessage('')
    setErrorMessage('')

    try {
      // 1. Update base profile
      await api.put('/profiles/me', {
        ...baseProfile,
        skills: baseProfile.skills.join(', '),
      })

      // 2. Update role-specific detail
      if (user?.role === 'STUDENT') {
        await api.put('/profiles/student-details', studentDetail)
      } else if (user?.role === 'ALUMNI') {
        await api.put('/profiles/alumni-details', alumniDetail)
      }

      setSuccessMessage('Your profile changes have been saved successfully!')
      setTimeout(() => setSuccessMessage(''), 5000)
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save changes.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] bg-[#F5F1E8] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto animate-pulse space-y-6">
          <div className="h-10 bg-[#D8D2C4]/60 w-1/3 rounded-2xl" />
          <div className="h-64 bg-white border border-[#D8D2C4] rounded-3xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F5F1E8] py-8 sm:py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-[#D8D2C4]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 bg-[#244B3A] text-[#C4A878] rounded-2xl flex items-center justify-center shadow-md border border-[#C4A878]/60 shrink-0">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#333333] tracking-tight">
                My Profile & Settings
              </h1>
              <p className="text-xs sm:text-sm text-[#333333]/70">
                Manage your verified credentials, technical skills, career summary, and social links.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#244B3A]/10 text-[#244B3A] border border-[#244B3A]/20">
              {user?.role}
            </span>
            {user?.role === 'ALUMNI' && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold border ${
                  alumniDetail.verification_status === 'VERIFIED'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                {alumniDetail.verification_status}
              </span>
            )}
          </div>
        </div>

        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 rounded-2xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold shadow-xs">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSaveProfile} className="space-y-6">
          {/* Card 1: General Information */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D8D2C4] shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D8D2C4]/60">
              <User className="w-5 h-5 text-[#244B3A]" />
              <h2 className="text-base sm:text-lg font-extrabold text-[#333333]">
                General Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1.5">
                  First Name *
                </label>
                <input
                  type="text"
                  required
                  value={baseProfile.first_name}
                  onChange={(e) => setBaseProfile({ ...baseProfile, first_name: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl text-[#333333] placeholder-[#333333]/40 focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40 focus:border-[#244B3A] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1.5">
                  Last Name *
                </label>
                <input
                  type="text"
                  required
                  value={baseProfile.last_name}
                  onChange={(e) => setBaseProfile({ ...baseProfile, last_name: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl text-[#333333] placeholder-[#333333]/40 focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40 focus:border-[#244B3A] transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1.5">
                Professional Headline
              </label>
              <input
                type="text"
                value={baseProfile.headline}
                onChange={(e) => setBaseProfile({ ...baseProfile, headline: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl text-[#333333] placeholder-[#333333]/40 focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40 focus:border-[#244B3A] transition"
                placeholder="e.g. Senior Software Engineer at Google | Cloud & Distributed Systems"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1.5">
                Biography & Summary
              </label>
              <textarea
                rows="3"
                value={baseProfile.bio}
                onChange={(e) => setBaseProfile({ ...baseProfile, bio: e.target.value })}
                className="w-full px-4 py-2.5 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl text-[#333333] placeholder-[#333333]/40 focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40 focus:border-[#244B3A] transition"
                placeholder="Tell others about your professional journey, technical projects, or areas you mentor in..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1.5">
                  Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#333333]/50 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={baseProfile.location}
                    onChange={(e) => setBaseProfile({ ...baseProfile, location: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl text-[#333333] placeholder-[#333333]/40 focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40 focus:border-[#244B3A] transition"
                    placeholder="e.g. Bengaluru, India or Seattle, WA"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1.5">
                  Contact Phone
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-[#333333]/50 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={baseProfile.phone}
                    onChange={(e) => setBaseProfile({ ...baseProfile, phone: e.target.value })}
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl text-[#333333] placeholder-[#333333]/40 focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40 focus:border-[#244B3A] transition"
                    placeholder="+91 98765 43210"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Skills & Competencies */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D8D2C4] shadow-xs space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D8D2C4]/60">
              <Sparkles className="w-5 h-5 text-[#244B3A]" />
              <div>
                <h2 className="text-base sm:text-lg font-extrabold text-[#333333]">
                  Skills & Competencies
                </h2>
                <p className="text-[11px] text-[#333333]/70">
                  These skills power our content-based AI recommendation engine to match you with compatible mentors and jobs.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 min-h-[48px] p-3.5 bg-[#FBF9F4] rounded-2xl border border-[#D8D2C4]">
              {baseProfile.skills.length === 0 ? (
                <span className="text-xs text-[#333333]/50 italic self-center">
                  No skills added yet. Type a skill and click Add below.
                </span>
              ) : (
                baseProfile.skills.map((skill) => (
                  <span
                    key={skill}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-[#244B3A]/10 text-[#244B3A] border border-[#244B3A]/20"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSkill(skill)}
                      className="hover:text-rose-600 transition cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </span>
                ))
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add skill (e.g. Python, React, Distributed Systems, SQL)..."
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleAddSkill(e)
                  }
                }}
                className="flex-1 px-4 py-2.5 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl text-[#333333] placeholder-[#333333]/40 focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40 focus:border-[#244B3A] transition"
              />
              <button
                type="button"
                onClick={handleAddSkill}
                className="px-5 py-2.5 bg-[#244B3A] hover:bg-[#1b382b] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4 text-[#C4A878]" />
                <span>Add Skill</span>
              </button>
            </div>
          </div>

          {/* Card 3: Role Specific Credentials (STUDENT) */}
          {user?.role === 'STUDENT' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D8D2C4] shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#D8D2C4]/60">
                <GraduationCap className="w-5 h-5 text-[#244B3A]" />
                <h2 className="text-base sm:text-lg font-extrabold text-[#333333]">
                  Academic Credentials
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1.5">
                    Roll / Student ID
                  </label>
                  <input
                    type="text"
                    value={studentDetail.roll_number}
                    onChange={(e) =>
                      setStudentDetail({ ...studentDetail, roll_number: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40 focus:border-[#244B3A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1.5">
                    Degree & Program
                  </label>
                  <input
                    type="text"
                    value={studentDetail.degree}
                    onChange={(e) =>
                      setStudentDetail({ ...studentDetail, degree: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40 focus:border-[#244B3A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1.5">
                    Department / Branch
                  </label>
                  <input
                    type="text"
                    value={studentDetail.department}
                    onChange={(e) =>
                      setStudentDetail({ ...studentDetail, department: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40 focus:border-[#244B3A]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1.5">
                    Current Year of Study
                  </label>
                  <select
                    value={studentDetail.current_year}
                    onChange={(e) =>
                      setStudentDetail({
                        ...studentDetail,
                        current_year: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40 focus:border-[#244B3A]"
                  >
                    <option value={1}>1st Year (Freshman)</option>
                    <option value={2}>2nd Year (Sophomore)</option>
                    <option value={3}>3rd Year (Junior)</option>
                    <option value={4}>4th Year (Final Year)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1.5">
                    Expected Graduation Year
                  </label>
                  <input
                    type="number"
                    value={studentDetail.expected_graduation_year}
                    onChange={(e) =>
                      setStudentDetail({
                        ...studentDetail,
                        expected_graduation_year: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40 focus:border-[#244B3A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1.5">
                    CGPA / Grade
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={studentDetail.cgpa}
                    onChange={(e) =>
                      setStudentDetail({ ...studentDetail, cgpa: parseFloat(e.target.value) })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40 focus:border-[#244B3A]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Card 4: Role Specific Credentials (ALUMNI) */}
          {user?.role === 'ALUMNI' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D8D2C4] shadow-xs space-y-5">
              <div className="flex items-center gap-2 pb-3 border-b border-[#D8D2C4]/60">
                <Briefcase className="w-5 h-5 text-[#244B3A]" />
                <h2 className="text-base sm:text-lg font-extrabold text-[#333333]">
                  Alumni Career Information
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1.5">
                    Current Company / Employer
                  </label>
                  <input
                    type="text"
                    value={alumniDetail.current_company}
                    onChange={(e) =>
                      setAlumniDetail({ ...alumniDetail, current_company: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40 focus:border-[#244B3A]"
                    placeholder="e.g. Google, Microsoft, Amazon, Infosys"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1.5">
                    Current Position / Role
                  </label>
                  <input
                    type="text"
                    value={alumniDetail.current_position}
                    onChange={(e) =>
                      setAlumniDetail({ ...alumniDetail, current_position: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40 focus:border-[#244B3A]"
                    placeholder="e.g. Senior Software Engineer"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1.5">
                    Graduation Year
                  </label>
                  <input
                    type="number"
                    value={alumniDetail.graduation_year}
                    onChange={(e) =>
                      setAlumniDetail({
                        ...alumniDetail,
                        graduation_year: parseInt(e.target.value, 10),
                      })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40 focus:border-[#244B3A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1.5">
                    Degree
                  </label>
                  <input
                    type="text"
                    value={alumniDetail.degree}
                    onChange={(e) =>
                      setAlumniDetail({ ...alumniDetail, degree: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40 focus:border-[#244B3A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1.5">
                    Industry Sector
                  </label>
                  <input
                    type="text"
                    value={alumniDetail.industry}
                    onChange={(e) =>
                      setAlumniDetail({ ...alumniDetail, industry: e.target.value })
                    }
                    className="w-full px-4 py-2.5 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40 focus:border-[#244B3A]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Card 5: Social Profiles & Portfolio */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#D8D2C4] shadow-xs space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-[#D8D2C4]/60">
              <Globe className="w-5 h-5 text-[#244B3A]" />
              <h2 className="text-base sm:text-lg font-extrabold text-[#333333]">
                Social Profiles & Portfolio
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1.5">
                  LinkedIn URL
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-[#333333]/50 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    value={baseProfile.linkedin_url}
                    onChange={(e) =>
                      setBaseProfile({ ...baseProfile, linkedin_url: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl text-[#333333] placeholder-[#333333]/40 focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40 focus:border-[#244B3A]"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1.5">
                  GitHub URL
                </label>
                <div className="relative">
                  <Code className="w-4 h-4 text-[#333333]/50 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    value={baseProfile.github_url}
                    onChange={(e) =>
                      setBaseProfile({ ...baseProfile, github_url: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl text-[#333333] placeholder-[#333333]/40 focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40 focus:border-[#244B3A]"
                    placeholder="https://github.com/username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#333333] uppercase tracking-wider mb-1.5">
                  Portfolio / Website
                </label>
                <div className="relative">
                  <Globe className="w-4 h-4 text-[#333333]/50 absolute left-3.5 top-3" />
                  <input
                    type="url"
                    value={baseProfile.portfolio_url}
                    onChange={(e) =>
                      setBaseProfile({ ...baseProfile, portfolio_url: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-[#FBF9F4] border border-[#D8D2C4] rounded-xl text-[#333333] placeholder-[#333333]/40 focus:outline-none focus:ring-2 focus:ring-[#244B3A]/40 focus:border-[#244B3A]"
                    placeholder="https://yourportfolio.dev"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Card 6: Verified Endorsements Widget */}
          {user?.id && (
            <SkillEndorsementWidget
              studentId={user.id}
              studentSkills={baseProfile.skills}
            />
          )}

          {/* Submit Action Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3.5 bg-[#244B3A] hover:bg-[#1b382b] text-white font-extrabold rounded-2xl text-sm shadow-md transition flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4 text-[#C4A878]" />
              <span>{saving ? 'Saving Profile...' : 'Save All Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
