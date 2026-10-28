import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  ShieldCheck,
  Briefcase,
  Calendar,
  AlertCircle,
  Clock,
  ArrowRight,
  TrendingUp,
  FileText,
} from 'lucide-react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import api from '../../services/api'

export const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get('/admin/analytics')
        if (res.success && res.data) {
          setAnalytics(res.data)
        }
      } catch (err) {
        console.error('Failed to load administrative analytics:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center text-slate-500 text-sm">
        Loading institutional analytics...
      </div>
    )
  }

  const roleData = [
    { name: 'Students', count: analytics?.users?.students || 0, color: '#4f46e5' },
    { name: 'Verified Alumni', count: analytics?.users?.verified_alumni || 0, color: '#10b981' },
    { name: 'Pending Alumni', count: analytics?.users?.pending_verifications || 0, color: '#f59e0b' },
  ]

  const deptData = analytics?.departments || []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider">Institutional Oversight</span>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Administrative Governance Portal</h1>
          <p className="text-xs text-slate-500 mt-1">Platform moderation, verification queues, and institutional metrics</p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Link
            to="/admin/verification"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl text-xs shadow transition"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Verification Queue ({analytics?.users?.pending_verifications || 0})</span>
          </Link>
          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl text-xs shadow transition"
          >
            <Users className="w-4 h-4" />
            <span>Manage Users</span>
          </Link>
          <Link
            to="/admin/audit-logs"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition"
          >
            <FileText className="w-4 h-4" />
            <span>Audit Trail</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Total Community</span>
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{analytics?.users?.total || 0}</div>
          <p className="text-xs text-slate-500 mt-1">
            {analytics?.users?.students} Students • {analytics?.users?.alumni} Alumni
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Alumni Verified</span>
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{analytics?.users?.verified_alumni || 0}</div>
          <p className="text-xs text-emerald-600 font-medium mt-1">
            {analytics?.users?.pending_verifications} awaiting review
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Active Opportunities</span>
            <Briefcase className="w-5 h-5 text-violet-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{analytics?.jobs?.active || 0}</div>
          <p className="text-xs text-slate-500 mt-1">Jobs and internships published</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-bold uppercase tracking-wider">Mentorship Sessions</span>
            <Calendar className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{analytics?.mentorship?.total_bookings || 0}</div>
          <p className="text-xs text-slate-500 mt-1">
            {analytics?.mentorship?.confirmed} confirmed calls
          </p>
        </div>
      </div>

      {/* Visual Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* User Breakdown Pie */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">User Role Distribution</h3>
          <p className="text-xs text-slate-500">Breakdown of registered students vs verified/pending alumni</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="count"
                  label={({ name, count }) => `${name}: ${count}`}
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Department Breakdown Bar */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-slate-900">Alumni by Department</h3>
          <p className="text-xs text-slate-500">Distribution of graduate records across university departments</p>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis dataKey="name" tick={{ fontSize: 10 }} interval={0} angle={-15} textAnchor="end" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  )
}
