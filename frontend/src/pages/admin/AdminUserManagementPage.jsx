import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Users, Shield, Search, CheckCircle, Ban } from 'lucide-react'
import api from '../../services/api'

export const AdminUserManagementPage = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const fetchUsers = async () => {
    setLoading(true)
    try {
      let url = '/admin/users?per_page=50'
      if (search) url += `&q=${encodeURIComponent(search)}`
      if (roleFilter) url += `&role=${roleFilter}`
      const res = await api.get(url)
      if (res.success && res.data) {
        setUsers(res.data.users || [])
      }
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [roleFilter])

  const handleToggleStatus = async (userId) => {
    try {
      const res = await api.put(`/admin/users/${userId}/toggle-status`)
      if (res.success) {
        setUsers(users.map((u) => (u.id === userId ? { ...u, is_active: !u.is_active } : u)))
      }
    } catch (err) {
      alert(`Status toggle failed: ${err.message}`)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">User Moderation & Governance</h1>
          <p className="text-xs text-slate-500">Manage institutional accounts, role assignments, and active account states</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            className="w-full pl-10 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700"
          >
            <option value="">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="ALUMNI">Alumni</option>
            <option value="ADMIN">Administrators</option>
          </select>

          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-sm transition"
          >
            Filter
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading user directory...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Department / Organization</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {users.map((u) => {
                  const p = u.profile || {}
                  const ad = u.alumni_detail
                  const sd = u.student_detail
                  return (
                    <tr key={u.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-xs uppercase text-slate-700">
                            {p.first_name?.[0] || 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900">{p.first_name} {p.last_name}</div>
                            <div className="text-[11px] text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'ADMIN' ? 'bg-rose-100 text-rose-800' :
                          u.role === 'ALUMNI' ? 'bg-emerald-100 text-emerald-800' : 'bg-indigo-100 text-indigo-800'
                        }`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {ad?.current_company ? `${ad.current_company} (${ad.department})` : sd?.department || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          u.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {u.is_active ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.role !== 'ADMIN' && (
                          <button
                            onClick={() => handleToggleStatus(u.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                              u.is_active
                                ? 'text-rose-600 hover:bg-rose-50 border border-rose-200'
                                : 'text-emerald-600 hover:bg-emerald-50 border border-emerald-200'
                            }`}
                          >
                            {u.is_active ? 'Suspend' : 'Reactivate'}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
