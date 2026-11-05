import React, { useState, useEffect, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import {
  GraduationCap,
  Bell,
  MessageSquare,
  LogOut,
  Menu,
  X,
  Sparkles,
  ShieldCheck,
  ChevronDown,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export const Navbar = () => {
  const { user, isAuthenticated, role, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [aiDropdownOpen, setAiDropdownOpen] = useState(false)
  const [communityDropdownOpen, setCommunityDropdownOpen] = useState(false)
  const [unreadNotifs, setUnreadNotifs] = useState(0)

  const communityRef = useRef(null)
  const aiRef = useRef(null)

  // Close dropdowns on route transition
  useEffect(() => {
    setCommunityDropdownOpen(false)
    setAiDropdownOpen(false)
    setMobileMenuOpen(false)
  }, [location.pathname])

  // Click outside listener for dropdowns
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (communityRef.current && !communityRef.current.contains(e.target)) {
        setCommunityDropdownOpen(false)
      }
      if (aiRef.current && !aiRef.current.contains(e.target)) {
        setAiDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

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
    ALUMNI: 'bg-[#244B3A]/15 text-[#244B3A] border-[#244B3A]/30',
    STUDENT: 'bg-[#C4A878]/25 text-[#244B3A] border-[#C4A878]',
  }[role] || 'bg-slate-100 text-slate-700'

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#D8D2C4] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-[#244B3A] flex items-center justify-center text-[#F5F1E8] shadow-md border border-[#C4A878]/50 group-hover:bg-[#3A5F50] transition-colors">
              <GraduationCap className="w-5 h-5 text-[#C4A878]" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[#333333] group-hover:text-[#244B3A] transition-colors">
                Alumni<span className="text-[#244B3A]">Connect</span>
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#F5F1E8] text-[#244B3A] border border-[#C4A878]/60">
                AI Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {isAuthenticated ? (
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium text-[#333333]">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/dashboard' ? 'text-[#244B3A] bg-[#244B3A]/10 font-bold border-b-2 border-[#244B3A]' : 'hover:text-[#244B3A] hover:bg-[#F5F1E8]'
                }`}
              >
                Dashboard
              </Link>
              <Link
                to="/alumni"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  location.pathname === '/alumni' ? 'text-[#244B3A] bg-[#244B3A]/10 font-bold border-b-2 border-[#244B3A]' : 'hover:text-[#244B3A] hover:bg-[#F5F1E8]'
                }`}
              >
                Directory
              </Link>
              <Link
                to="/jobs"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  location.pathname.startsWith('/jobs') ? 'text-[#244B3A] bg-[#244B3A]/10 font-bold border-b-2 border-[#244B3A]' : 'hover:text-[#244B3A] hover:bg-[#F5F1E8]'
                }`}
              >
                Jobs
              </Link>
              <Link
                to="/mentorship"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  location.pathname.startsWith('/mentorship') ? 'text-[#244B3A] bg-[#244B3A]/10 font-bold border-b-2 border-[#244B3A]' : 'hover:text-[#244B3A] hover:bg-[#F5F1E8]'
                }`}
              >
                Mentorship
              </Link>
              <Link
                to="/events"
                className={`px-3 py-2 rounded-lg transition-colors ${
                  location.pathname.startsWith('/events') ? 'text-[#244B3A] bg-[#244B3A]/10 font-bold border-b-2 border-[#244B3A]' : 'hover:text-[#244B3A] hover:bg-[#F5F1E8]'
                }`}
              >
                Events
              </Link>

              {/* Community & Venture Hub Dropdown */}
              <div
                ref={communityRef}
                className="relative"
                onMouseEnter={() => setCommunityDropdownOpen(true)}
                onMouseLeave={() => setCommunityDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setCommunityDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                    location.pathname === '/collaborations' || location.pathname === '/achievements' || location.pathname === '/donations'
                      ? 'text-[#244B3A] bg-[#244B3A]/10 font-bold border-b-2 border-[#244B3A]'
                      : 'hover:text-[#244B3A] hover:bg-[#F5F1E8]'
                  }`}
                >
                  <span>Community</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#244B3A]" />
                </button>

                {communityDropdownOpen && (
                  <div className="absolute top-full left-0 pt-1 w-64 z-50">
                    <div className="bg-white border border-[#D8D2C4] rounded-xl shadow-xl py-2 space-y-1">
                      <Link
                        to="/collaborations"
                        className="block px-4 py-2.5 text-xs font-semibold text-[#333333] hover:bg-[#F5F1E8] hover:text-[#244B3A] transition-colors"
                      >
                        🚀 Project Collaboration
                      </Link>
                      <Link
                        to="/achievements"
                        className="block px-4 py-2.5 text-xs font-semibold text-[#333333] hover:bg-[#F5F1E8] hover:text-[#244B3A] transition-colors"
                      >
                        🏆 Achievement Wall
                      </Link>
                      <Link
                        to="/donations"
                        className="block px-4 py-2.5 text-xs font-semibold text-[#333333] hover:bg-[#F5F1E8] hover:text-[#244B3A] transition-colors"
                      >
                        🌱 Alumni Giving & Campaigns
                      </Link>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Hub Suite Dropdown */}
              <div
                ref={aiRef}
                className="relative"
                onMouseEnter={() => setAiDropdownOpen(true)}
                onMouseLeave={() => setAiDropdownOpen(false)}
              >
                <button
                  type="button"
                  onClick={() => setAiDropdownOpen((prev) => !prev)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors font-semibold border cursor-pointer ${
                    location.pathname.startsWith('/ai') || location.pathname === '/resume-scanner' || location.pathname === '/career-predictor' || location.pathname === '/mock-interview' || location.pathname === '/analytics-hub' || location.pathname === '/network-graph'
                      ? 'text-[#244B3A] bg-[#C4A878]/30 border-[#C4A878]'
                      : 'text-[#244B3A] bg-[#C4A878]/20 hover:bg-[#C4A878]/30 border-[#C4A878]'
                  }`}
                >
                  <Sparkles className="w-4 h-4 text-[#C4A878]" />
                  <span>AI Suite</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#244B3A]" />
                </button>

                {aiDropdownOpen && (
                  <div className="absolute top-full left-0 pt-1 w-64 z-50">
                    <div className="bg-white border border-[#D8D2C4] rounded-xl shadow-xl py-2 space-y-1">
                      <Link
                        to="/network-graph"
                        className="block px-4 py-2.5 text-xs font-semibold text-[#333333] hover:bg-[#F5F1E8] hover:text-[#244B3A] transition-colors"
                      >
                        🕸️ Smart Connection Graph
                      </Link>
                      <Link
                        to="/ai"
                        className="block px-4 py-2.5 text-xs font-semibold text-[#333333] hover:bg-[#F5F1E8] hover:text-[#244B3A] transition-colors"
                      >
                        ✨ Recommendations & Matcher
                      </Link>
                      <Link
                        to="/resume-scanner"
                        className="block px-4 py-2.5 text-xs font-semibold text-[#333333] hover:bg-[#F5F1E8] hover:text-[#244B3A] transition-colors"
                      >
                        📄 ATS Resume Scanner
                      </Link>
                      <Link
                        to="/career-predictor"
                        className="block px-4 py-2.5 text-xs font-semibold text-[#333333] hover:bg-[#F5F1E8] hover:text-[#244B3A] transition-colors"
                      >
                        📈 Career & Salary Predictor
                      </Link>
                      <Link
                        to="/mock-interview"
                        className="block px-4 py-2.5 text-xs font-semibold text-[#333333] hover:bg-[#F5F1E8] hover:text-[#244B3A] transition-colors"
                      >
                        🎯 AI Mock Interview Simulator
                      </Link>
                      <Link
                        to="/ai-referral"
                        className="block px-4 py-2.5 text-xs font-semibold text-[#333333] hover:bg-[#F5F1E8] hover:text-[#244B3A] transition-colors"
                      >
                        🤝 Smart Referral & Outreach
                      </Link>
                      <Link
                        to="/analytics-hub"
                        className="block px-4 py-2.5 text-xs font-semibold text-[#333333] hover:bg-[#F5F1E8] hover:text-[#244B3A] transition-colors"
                      >
                        🌐 Global Alumni Matrix
                      </Link>
                    </div>
                  </div>
                )}
              </div>

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
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-[#333333]">
              <Link to="/about" className="hover:text-[#244B3A] transition-colors">
                About
              </Link>
              <Link to="/alumni" className="hover:text-[#244B3A] transition-colors">
                Alumni Network
              </Link>
              <Link to="/jobs" className="hover:text-[#244B3A] transition-colors">
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
                  className="p-2 text-[#333333] hover:text-[#244B3A] hover:bg-[#F5F1E8] rounded-xl transition-colors relative"
                  title="Direct Messages"
                >
                  <MessageSquare className="w-5 h-5" />
                </Link>

                <Link
                  to="/notifications"
                  className="p-2 text-[#333333] hover:text-[#244B3A] hover:bg-[#F5F1E8] rounded-xl transition-colors relative"
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
                <div className="flex items-center gap-2 pl-2 border-l border-[#D8D2C4]">
                  <Link
                    to="/profile"
                    className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#244B3A]/10 text-[#244B3A] font-bold text-xs uppercase flex items-center justify-center overflow-hidden border border-[#C4A878]">
                      {user?.profile?.avatar_url ? (
                        <img src={user.profile.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        user?.profile?.first_name?.[0] || 'U'
                      )}
                    </div>
                    <div className="hidden lg:block text-left">
                      <div className="text-xs font-bold text-[#333333] leading-tight">
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
                  className="text-sm font-semibold text-[#333333] hover:text-[#244B3A] transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold text-white bg-[#244B3A] hover:bg-[#3A5F50] px-4 py-2 rounded-xl shadow-sm hover:shadow transition border border-[#244B3A]"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#333333] hover:bg-[#F5F1E8] rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-[#D8D2C4] bg-white px-4 pt-3 pb-6 space-y-2">
          {isAuthenticated ? (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-[#333333] hover:bg-[#F5F1E8] rounded-lg"
              >
                Dashboard
              </Link>
              <Link
                to="/alumni"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-[#333333] hover:bg-[#F5F1E8] rounded-lg"
              >
                Alumni Directory
              </Link>
              <Link
                to="/jobs"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-[#333333] hover:bg-[#F5F1E8] rounded-lg"
              >
                Jobs & Internships
              </Link>
              <Link
                to="/mentorship"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-[#333333] hover:bg-[#F5F1E8] rounded-lg"
              >
                Mentorship
              </Link>
              <Link
                to="/events"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-[#333333] hover:bg-[#F5F1E8] rounded-lg"
              >
                Campus Events
              </Link>
              <div className="pt-2 pb-1 border-t border-[#D8D2C4]/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#244B3A] px-3">Community & Ventures</span>
              </div>
              <Link
                to="/collaborations"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-[#333333] hover:bg-[#F5F1E8] rounded-lg"
              >
                🚀 Project Collaborations
              </Link>
              <Link
                to="/achievements"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-[#333333] hover:bg-[#F5F1E8] rounded-lg"
              >
                🏆 Alumni Achievement Wall
              </Link>
              <Link
                to="/donations"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-[#333333] hover:bg-[#F5F1E8] rounded-lg"
              >
                🌱 Alumni Giving & Campaigns
              </Link>
              <div className="pt-2 pb-1 border-t border-[#D8D2C4]/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#244B3A] px-3">AI Intelligence Suite</span>
              </div>
              <Link
                to="/network-graph"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-[#244B3A] bg-[#244B3A]/10 rounded-lg"
              >
                🕸️ Smart Connection Graph
              </Link>
              <Link
                to="/resume-scanner"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-[#244B3A] bg-[#244B3A]/10 rounded-lg"
              >
                📄 ATS Resume Scanner
              </Link>
              <Link
                to="/career-predictor"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-[#244B3A] bg-[#244B3A]/10 rounded-lg"
              >
                📈 Career & Salary Predictor
              </Link>
              <Link
                to="/mock-interview"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-[#244B3A] bg-[#244B3A]/10 rounded-lg"
              >
                🎯 AI Mock Interview Simulator
              </Link>
              <Link
                to="/ai-referral"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-[#244B3A] bg-[#244B3A]/10 rounded-lg"
              >
                🤝 Smart Referral & Outreach
              </Link>
              <Link
                to="/analytics-hub"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-[#333333] hover:bg-[#F5F1E8] rounded-lg"
              >
                🌐 Global Alumni Matrix
              </Link>
              <Link
                to="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-medium text-[#333333] hover:bg-[#F5F1E8] rounded-lg"
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
                className="block px-3 py-2 text-base font-medium text-[#333333] hover:bg-[#F5F1E8] rounded-lg"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 text-base font-semibold text-white bg-[#244B3A] hover:bg-[#3A5F50] rounded-lg text-center"
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
