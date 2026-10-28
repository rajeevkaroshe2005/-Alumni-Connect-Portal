import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { GraduationCap, Lock, Mail, User, Building, BookOpen, AlertCircle, ArrowRight } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const RegisterPage = () => {
  const [role, setRole] = useState('STUDENT') // STUDENT or ALUMNI
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    department: 'Computer Science & Engineering',
    degree: 'B.Tech / B.E.',
    // Student specific
    roll_number: '',
    current_year: 4,
    expected_graduation_year: 2026,
    interests: 'Software Engineering, AI, Cloud Computing',
    // Alumni specific
    graduation_year: 2022,
    current_company: '',
    current_position: '',
    industry: 'Information Technology',
    skills: 'Python, React, System Design, SQL',
  })
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await register({
        ...formData,
        role,
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message || 'Registration failed. Please check inputs.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-gray-950">
      <div className="max-w-xl w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-indigo-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Create your platform account
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Connect with the official university student & alumni network
          </p>
        </div>

        {/* Role Switcher Tabs */}
        <div className="flex bg-slate-200 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-300 dark:border-slate-700">
          <button
            type="button"
            onClick={() => setRole('STUDENT')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
              role === 'STUDENT'
                ? 'bg-white text-indigo-700 shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            🎓 I am a Student
          </button>
          <button
            type="button"
            onClick={() => setRole('ALUMNI')}
            className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition ${
              role === 'ALUMNI'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            💼 I am an Alumnus / Graduate
          </button>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3.5 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span className="font-medium">{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5">First name *</label>
              <input
                type="text"
                name="first_name"
                required
                value={formData.first_name}
                onChange={handleChange}
                placeholder="e.g. Rajeev"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5">Last name *</label>
              <input
                type="text"
                name="last_name"
                required
                value={formData.last_name}
                onChange={handleChange}
                placeholder="e.g. Karoshe"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5">Email address *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder={role === 'STUDENT' ? 'student@university.edu' : 'name@company.com'}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5">Password *</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5">Department *</label>
              <select
                name="department"
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-sm text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              >
                <option value="Computer Science & Engineering" className="text-slate-900 bg-white dark:bg-gray-800 dark:text-white">Computer Science & Engineering</option>
                <option value="Information Technology" className="text-slate-900 bg-white dark:bg-gray-800 dark:text-white">Information Technology</option>
                <option value="Electronics & Communication Engineering" className="text-slate-900 bg-white dark:bg-gray-800 dark:text-white">Electronics & Communication Engineering</option>
                <option value="Mechanical Engineering" className="text-slate-900 bg-white dark:bg-gray-800 dark:text-white">Mechanical Engineering</option>
                <option value="Electrical Engineering" className="text-slate-900 bg-white dark:bg-gray-800 dark:text-white">Electrical Engineering</option>
                <option value="Civil Engineering" className="text-slate-900 bg-white dark:bg-gray-800 dark:text-white">Civil Engineering</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5">Degree *</label>
              <input
                type="text"
                name="degree"
                value={formData.degree}
                onChange={handleChange}
                placeholder="e.g. B.Tech / B.E."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          {/* Role specific dynamic fields */}
          {role === 'STUDENT' ? (
            <div className="p-4 bg-indigo-50/70 dark:bg-indigo-950/30 rounded-xl border border-indigo-200 dark:border-indigo-900/50 space-y-3">
              <h4 className="text-xs font-bold text-indigo-950 dark:text-indigo-300 uppercase tracking-wider">
                Student Academic Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-900 dark:text-slate-200 mb-1">
                    Roll / Student ID *
                  </label>
                  <input
                    type="text"
                    name="roll_number"
                    required
                    value={formData.roll_number}
                    onChange={handleChange}
                    placeholder="e.g. CS23B1020"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-900 dark:text-slate-200 mb-1">
                    Current Year of Study *
                  </label>
                  <select
                    name="current_year"
                    value={formData.current_year}
                    onChange={handleChange}
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg text-xs text-slate-900 dark:text-white font-medium focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value={1} className="text-slate-900 bg-white dark:bg-gray-800 dark:text-white">1st Year</option>
                    <option value={2} className="text-slate-900 bg-white dark:bg-gray-800 dark:text-white">2nd Year</option>
                    <option value={3} className="text-slate-900 bg-white dark:bg-gray-800 dark:text-white">3rd Year</option>
                    <option value={4} className="text-slate-900 bg-white dark:bg-gray-800 dark:text-white">4th Year (Final Year)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-900 dark:text-slate-200 mb-1">
                    Expected Graduation *
                  </label>
                  <input
                    type="number"
                    name="expected_graduation_year"
                    required
                    value={formData.expected_graduation_year}
                    onChange={handleChange}
                    placeholder="2026"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-900 dark:text-slate-200 mb-1">
                  Career Interests & Key Skills
                </label>
                <input
                  type="text"
                  name="interests"
                  value={formData.interests}
                  onChange={handleChange}
                  placeholder="e.g. Python, React, Cloud, Distributed Systems"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          ) : (
            <div className="p-4 bg-emerald-50/70 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-900/50 space-y-3">
              <h4 className="text-xs font-bold text-emerald-950 dark:text-emerald-300 uppercase tracking-wider">
                Alumni Employment Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-900 dark:text-slate-200 mb-1">
                    Current Employer / Company *
                  </label>
                  <input
                    type="text"
                    name="current_company"
                    required
                    value={formData.current_company}
                    onChange={handleChange}
                    placeholder="e.g. Google, Microsoft, Startup"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-900 dark:text-slate-200 mb-1">
                    Current Job Title *
                  </label>
                  <input
                    type="text"
                    name="current_position"
                    required
                    value={formData.current_position}
                    onChange={handleChange}
                    placeholder="e.g. Senior Software Engineer"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-900 dark:text-slate-200 mb-1">
                    Graduation Year *
                  </label>
                  <input
                    type="number"
                    name="graduation_year"
                    required
                    value={formData.graduation_year}
                    onChange={handleChange}
                    placeholder="2022"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-900 dark:text-slate-200 mb-1">
                    Industry Sector *
                  </label>
                  <input
                    type="text"
                    name="industry"
                    required
                    value={formData.industry}
                    onChange={handleChange}
                    placeholder="e.g. Software & Technology, Finance"
                    className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-900 dark:text-slate-200 mb-1">
                  Core Skills & Mentorship Expertise
                </label>
                <input
                  type="text"
                  name="skills"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="e.g. System Design, Python, Fintech, Product Management"
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2"
          >
            {submitting ? (
              <span>Creating Account...</span>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-slate-600 dark:text-slate-400 font-medium pb-8">
          Already have an account?{' '}
          <Link to="/login" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
