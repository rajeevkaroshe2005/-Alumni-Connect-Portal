import React from 'react'
import { Link } from 'react-router-dom'
import { GraduationCap, Shield, Code, Sparkles } from 'lucide-react'

export const Footer = () => {
  return (
    <footer className="bg-[#244B3A] text-[#F5F1E8] text-sm mt-auto border-t border-[#3A5F50]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#3A5F50] border border-[#C4A878]/60 flex items-center justify-center text-[#C4A878]">
                <GraduationCap className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg text-white">
                Alumni<span className="text-[#C4A878]">Connect</span>
              </span>
            </div>
            <p className="text-xs text-[#F5F1E8]/80 leading-relaxed">
              AI-Powered Alumni Networking, Mentorship & Career Platform. Bridging academia and industry through intelligent connections.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#C4A878] font-mono">
              <Code className="w-3.5 h-3.5" />
              <span>Institutional Excellence Portal</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-[#C4A878] text-xs uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/alumni" className="text-[#F5F1E8]/80 hover:text-[#C4A878] transition">Alumni Directory</Link></li>
              <li><Link to="/jobs" className="text-[#F5F1E8]/80 hover:text-[#C4A878] transition">Job & Internship Board</Link></li>
              <li><Link to="/mentorship" className="text-[#F5F1E8]/80 hover:text-[#C4A878] transition">Book Mentorship</Link></li>
              <li><Link to="/events" className="text-[#F5F1E8]/80 hover:text-[#C4A878] transition">Events & Reunions</Link></li>
              <li><Link to="/ai" className="text-[#C4A878] hover:underline transition flex items-center gap-1 font-semibold"><Sparkles className="w-3 h-3" /> AI Career Engine</Link></li>
            </ul>
          </div>

          {/* Account Types */}
          <div>
            <h4 className="font-bold text-[#C4A878] text-xs uppercase tracking-wider mb-4">Portals</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/login" className="text-[#F5F1E8]/80 hover:text-[#C4A878] transition">Student Portal</Link></li>
              <li><Link to="/login" className="text-[#F5F1E8]/80 hover:text-[#C4A878] transition">Alumni Portal</Link></li>
              <li><Link to="/login" className="text-[#F5F1E8]/80 hover:text-[#C4A878] transition">Administration Center</Link></li>
              <li><Link to="/register" className="text-[#F5F1E8]/80 hover:text-[#C4A878] transition">New Registration</Link></li>
            </ul>
          </div>

          {/* Institutional Compliance */}
          <div>
            <h4 className="font-bold text-[#C4A878] text-xs uppercase tracking-wider mb-4">Trust & Security</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-[#F5F1E8]/90">
                <Shield className="w-3.5 h-3.5 text-[#C4A878]" />
                <span>Verified Alumni Identity</span>
              </li>
              <li className="text-[#F5F1E8]/70">
                Role-Based Access Control (RBAC)
              </li>
              <li className="text-[#F5F1E8]/70">
                Anti-Double Booking Locks
              </li>
              <li className="text-[#F5F1E8]/70">
                Secure JWT Authentication
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-[#3A5F50] flex flex-col sm:flex-row items-center justify-between text-xs text-[#F5F1E8]/70 gap-4">
          <p>© 2026 Alumni Connect Portal. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#C4A878] cursor-pointer">Privacy Policy</span>
            <span className="hover:text-[#C4A878] cursor-pointer">Terms of Service</span>
            <span className="hover:text-[#C4A878] cursor-pointer">Academic Verification</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
