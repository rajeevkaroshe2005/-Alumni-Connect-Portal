import React from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Heart, Shield, Code, Sparkles } from 'lucide-react'

export const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-sm mt-auto border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">
                Alumni<span className="text-indigo-400">Connect</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-Powered Alumni Networking, Mentorship & Career Platform. Bridging academia and industry through intelligent connections.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              <span>Final Year Engineering Project</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/alumni" className="hover:text-indigo-400 transition">Alumni Directory</Link></li>
              <li><Link to="/jobs" className="hover:text-indigo-400 transition">Job & Internship Board</Link></li>
              <li><Link to="/mentorship" className="hover:text-indigo-400 transition">Book Mentorship</Link></li>
              <li><Link to="/events" className="hover:text-indigo-400 transition">Events & Reunions</Link></li>
              <li><Link to="/ai-assistant" className="text-violet-400 hover:text-violet-300 transition flex items-center gap-1"><Sparkles className="w-3 h-3" /> AI Career Engine</Link></li>
            </ul>
          </div>

          {/* Account Types */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="hover:text-indigo-400 transition">Student Login</Link></li>
              <li><Link to="/login" className="hover:text-indigo-400 transition">Alumni Portal</Link></li>
              <li><Link to="/login" className="hover:text-indigo-400 transition">Administration Center</Link></li>
              <li><Link to="/register" className="hover:text-indigo-400 transition">New Registration</Link></li>
            </ul>
          </div>

          {/* Institutional Compliance */}
          <div>
            <h4 className="font-semibold text-white text-xs uppercase tracking-wider mb-4">Trust & Security</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-400">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Verified Alumni Identity</span>
              </li>
              <li className="text-slate-500">
                Role-Based Access Control (RBAC)
              </li>
              <li className="text-slate-500">
                Anti-Double Booking Locks
              </li>
              <li className="text-slate-500">
                Secure JWT Authentication
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Alumni Connect Portal. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-slate-400 cursor-pointer">Research Architecture</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
