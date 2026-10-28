import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  GraduationCap,
  Bell,
  MessageSquare,
  User,
  LogOut,
  Menu,
  X,
  Briefcase,
  Users,
  Calendar,
  Sparkles,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export const Navbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [unreadNotifs, setUnreadNotifs] = useState(0)

  useEffect(() => {
    if (isAuthenticated) {
      const fetchNotifsCount = async () => {
        try {
          const res = await api.get('/notifications?per_page=1')
          if (res.success && res.data) {
            setUnreadNotifs(res.data.unread_count || 0)
          }
        } catch {
          // silently handle
        }
      }
      fetchNotifsCount()
      const interval = setInterval(fetchNotifsCount, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const roleBadgeColor = {
    ADMIN: 'bg-rose-100 text-rose-700 border-rose-200',
    ALUMNI: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    STUDENT: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  }[role] || 'bg-slate-100 text-slate-700'

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                Alumni<span className="text-indigo-600">Connect</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                AI Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {isAuthenticated ? (
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-600">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/dashboard' ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/alumni"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/alumni' ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Directory
              </Link>
              <Link
                to="/jobs"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  location.pathname.startsWith('/jobs') ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Jobs
              </Link>
              <Link
                to="/mentorship"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  location.pathname.startsWith('/mentorship') ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Mentorship
              </Link>
              <Link
                to="/events"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  location.pathname.startsWith('/events') ? 'text-indigo-600 bg-indigo-50 font-semibold' : 'hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Events
              </Link>
              <Link
                to="/ai"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/ai' ? 'text-violet-700 bg-violet-100 font-semibold' : 'text-violet-700 bg-violet-50/70 hover:bg-violet-100 font-semibold'
                } border border-violet-200/60`}
              >
                <Sparkles className="w-4 h-4 text-violet-600" />
                AI Career
              </Link>
              <Link
                to="/mock-interview"
                className={`px-3 py-2 rounded-lg transition-colors text-xs font-bold ${
                  location.pathname === '/mock-interview' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                AI Interview
              </Link>
              <Link
                to="/ai-referral"
                className={`px-3 py-2 rounded-lg transition-colors text-xs font-bold ${
                  location.pathname === '/ai-referral' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Referral Pitch
              </Link>
              <Link
                to="/analytics-hub"
                className={`px-3 py-2 rounded-lg transition-colors text-xs font-bold ${
                  location.pathname === '/analytics-hub' ? 'text-indigo-600 bg-indigo-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                Global Matrix
              </Link>
              {role === 'ADMIN' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1 px-3 py-2 rounded-lg transition-colors text-rose-700 bg-rose-50 hover:bg-rose-100 font-semibold border border-rose-200"
                >
                  <ShieldCheck className="w-4 h-4" />
                  Admin
                </Link>
              )}
            </nav>
          ) : (
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
              <Link to="/about" className="hover:text-slate-900 transition-colors">
                About
              </Link>
              <Link to="/alumni" className="hover:text-slate-900 transition-colors">
                Alumni Network
              </Link>
              <Link to="/jobs" className="hover:text-slate-900 transition-colors">
                Career Hub
              </Link>
            </nav>
          )}

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <>
                <Link
                  to="/messages"
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors relative"
                  title="Direct Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                <Link
                  to="/notifications"
                  className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors relative"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadNotifs > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-rose-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                      {unreadNotifs > 9 ? '9+' : unreadNotifs}
                    </span>
                  )}
                </Link>

                {/* Profile Pill */}
                <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
                  >
                    <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs uppercase overflow-hidden border border-slate-300">
                      {user?.profile?.avatar_url ? (
                        <img src={user.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user?.profile?.first_name?.[0] || 'U'
                      )}
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className="text-xs font-bold text-slate-800 leading-tight">
                        {user?.profile?.first_name || 'My Profile'}
                      </div>
                      <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded border ${roleBadgeColor}`}>
                        {role}
                      </span>
                    </div>
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-indigo-600 transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-xl shadow-sm hover:shadow transition"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Dashboard
              </Link>
              <Link
                to="/alumni"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Alumni Directory
              </Link>
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Jobs & Internships
              </Link>
              <Link
                to="/mentorship"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Mentorship
              </Link>
              <Link
                to="/events"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Campus Events
              </Link>
              <Link
                to="/ai"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-violet-700 bg-violet-50 rounded-lg"
              >
                AI Career Assistant
              </Link>
              <Link
                to="/mock-interview"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-indigo-700 bg-indigo-50 rounded-lg"
              >
                AI Mock Interview
              </Link>
              <Link
                to="/ai-referral"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-indigo-700 bg-indigo-50 rounded-lg"
              >
                Smart Referral Generator
              </Link>
              <Link
                to="/analytics-hub"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Global Alumni Matrix
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                My Profile
              </Link>
              {role === 'ADMIN' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block px-3 py-2 text-base font-semibold text-rose-700 bg-rose-50 rounded-lg"
                >
                  Admin Portal
                </Link>
              )}
              <button
                onClick={() => {
                  setMobileMenuOpen(false)
                  handleLogout()
                }}
                className="w-full text-left px-3 py-2 text-base font-medium text-rose-600 hover:bg-rose-50 rounded-lg"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-indigo-600 bg-indigo-50 rounded-lg"
              >
                Create Account
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  )
}
