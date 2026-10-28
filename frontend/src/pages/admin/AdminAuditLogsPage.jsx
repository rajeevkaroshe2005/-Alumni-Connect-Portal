import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, FileText, Search, Clock } from 'lucide-react'
import api from '../../services/api'

export const AdminAuditLogsPage = () => {
  const [logs, setLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAuditLogs = async () => {
      setLoading(true)
      try {
        const res = await api.get('/admin/audit-logs?per_page=50')
        if (res.success && res.data) {
          setLogs(res.data.logs || [])
        }
      } catch (err) {
        console.error('Failed to fetch audit logs:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchAuditLogs()
  }, [])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Link to="/admin" className="p-2 bg-white hover:bg-slate-100 rounded-xl border border-slate-200 text-slate-600">
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Security & Governance Audit Trail</h1>
          <p className="text-xs text-slate-500">Immutable chronological record of administrative actions and authentication events</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500 text-xs">Loading audit records...</div>
        ) : logs.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-xs">No audit logs recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-6 py-4">Timestamp (UTC)</th>
                  <th className="px-6 py-4">Action</th>
                  <th className="px-6 py-4">Actor</th>
                  <th className="px-6 py-4">Entity</th>
                  <th className="px-6 py-4">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-[11px]">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition">
                    <td className="px-6 py-3.5 text-slate-500 flex items-center gap-1.5 whitespace-nowrap">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {new Date(log.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-indigo-700">{log.action}</td>
                    <td className="px-6 py-3.5 text-slate-800">{log.actor_name || 'System / Anonymous'}</td>
                    <td className="px-6 py-3.5 text-slate-600">
                      {log.entity_type} {log.entity_id ? `(#${log.entity_id})` : ''}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 max-w-xs truncate">{log.details || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
