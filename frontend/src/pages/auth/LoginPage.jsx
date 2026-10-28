import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { GraduationCap, Lock, Mail, ArrowRight, AlertCircle, Shield, Briefcase, UserCheck } from 'lucide-react'
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

  const fillDemoAccount = (demoEmail, demoRole) => {
    setEmail(demoEmail)
    setPassword('Password123!')
    setError('')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-start py-8 sm:py-12 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-gray-950">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-gradient-to-tr from-indigo-600 to-violet-600 text-white rounded-2xl flex items-center justify-center mx-auto shadow-md shadow-indigo-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Sign in to your account</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Access your personalized alumni networking & mentorship dashboard</p>
        </div>

        {/* Quick Demo Fill Selector */}
        <div className="bg-slate-100 dark:bg-gray-900 border border-slate-300 dark:border-gray-800 rounded-2xl p-4 space-y-2.5">
          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>Instant Demo Accounts (Click to Fill)</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillDemoAccount('student@alumniportal.edu', 'STUDENT')}
              className="px-2.5 py-2 bg-white dark:bg-gray-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 hover:border-indigo-300 border border-slate-300 dark:border-gray-700 rounded-xl text-left transition text-xs group"
            >
              <div className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">Student</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Aarav (CSE '26)</div>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('priya@alumniportal.edu', 'ALUMNI')}
              className="px-2.5 py-2 bg-white dark:bg-gray-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:border-emerald-300 border border-slate-300 dark:border-gray-700 rounded-xl text-left transition text-xs group"
            >
              <div className="font-bold text-slate-900 dark:text-white group-hover:text-emerald-600">Alumni</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Priya (Google)</div>
            </button>

            <button
              type="button"
              onClick={() => fillDemoAccount('admin@alumniportal.edu', 'ADMIN')}
              className="px-2.5 py-2 bg-white dark:bg-gray-800 hover:bg-rose-50 dark:hover:bg-rose-950/40 hover:border-rose-300 border border-slate-300 dark:border-gray-700 rounded-xl text-left transition text-xs group"
            >
              <div className="font-bold text-slate-900 dark:text-white group-hover:text-rose-600">Admin</div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Administrator</div>
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
        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-gray-800 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5">Email address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@university.edu"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-900 dark:text-slate-200 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-300 dark:border-gray-700 rounded-xl text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold rounded-xl text-sm shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2"
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

        <p className="text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
          Don't have an account yet?{' '}
          <Link to="/register" className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}
