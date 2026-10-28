import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { GraduationCap, Lock, Mail, ArrowRight, AlertCircle, UserCheck } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'

export const LoginPage = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/dashboard'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await login(email, password)
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify credentials.')
    } finally {
      setSubmitting(false)
    }
  }

  const fillDemoAccount = (demoEmail) => {
    setEmail(demoEmail)
    setPassword('Password123!')
    setError('')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-[#F5F1E8]">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-[#244B3A] text-[#C4A878] rounded-2xl flex items-center justify-center mx-auto shadow-md border border-[#C4A878]">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-[#333333] tracking-tight">Sign in to your account</h2>
          <p className="text-xs text-[#333333]/70">Access your personalized alumni networking & mentorship dashboard</p>
        </div>

        {/* Quick Demo Fill Selector */}
        <div className="bg-white border border-[#D8D2C4] rounded-2xl p-4 space-y-2.5 shadow-xs">
          <div className="text-[11px] font-bold text-[#333333] uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-[#244B3A]" />
            <span>Instant Demo Accounts (Click to Fill)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('student@alumniportal.edu')}
              className="px-2.5 py-2 bg-[#F5F1E8] hover:bg-[#C4A878]/30 hover:border-[#244B3A] border border-[#D8D2C4] rounded-xl text-left transition text-xs group"
            >
              <div className="font-bold text-[#333333] group-hover:text-[#244B3A]">Student</div>
              <div className="text-[10px] text-[#333333]/70 truncate">Aarav (CSE '26)</div>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('priya@alumniportal.edu')}
              className="px-2.5 py-2 bg-[#F5F1E8] hover:bg-[#C4A878]/30 hover:border-[#244B3A] border border-[#D8D2C4] rounded-xl text-left transition text-xs group"
            >
              <div className="font-bold text-[#333333] group-hover:text-[#244B3A]">Alumni</div>
              <div className="text-[10px] text-[#333333]/70 truncate">Priya (Google)</div>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('admin@alumniportal.edu')}
              className="px-2.5 py-2 bg-[#F5F1E8] hover:bg-[#C4A878]/30 hover:border-[#244B3A] border border-[#D8D2C4] rounded-xl text-left transition text-xs group"
            >
              <div className="font-bold text-[#333333] group-hover:text-[#244B3A]">Admin</div>
              <div className="text-[10px] text-[#333333]/70 truncate">Administrator</div>
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-2xl border border-[#D8D2C4] shadow-xs space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#333333] mb-1.5">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#D8D2C4] rounded-xl text-sm text-[#333333] placeholder:text-[#8C8272] focus:outline-none focus:ring-2 focus:ring-[#244B3A]/20 focus:border-[#244B3A] transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#333333] mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-white border border-[#D8D2C4] rounded-xl text-sm text-[#333333] placeholder:text-[#8C8272] focus:outline-none focus:ring-2 focus:ring-[#244B3A]/20 focus:border-[#244B3A] transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-[#244B3A] hover:bg-[#3A5F50] disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md transition flex items-center justify-center gap-2 border border-[#244B3A]"
          >
            {submitting ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-xs text-[#333333] font-medium">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-[#244B3A] hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
