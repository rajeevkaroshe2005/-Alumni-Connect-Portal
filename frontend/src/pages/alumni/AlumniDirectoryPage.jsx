import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Users,
  Search,
  Filter,
  ShieldCheck,
  Building,
  GraduationCap,
  MapPin,
  Calendar,
  MessageSquare,
  ArrowRight,
  RotateCcw,
} from 'lucide-react'
import api from '../../services/api'
import { useDebounce } from '../../hooks/useDebounce'
import { SkeletonCard } from '../../components/common/SkeletonLoader'
import { EmptyState } from '../../components/common/EmptyState'

export const AlumniDirectoryPage = () => {
  const [alumni, setAlumni] = useState([])
  const [filters, setFilters] = useState({
    departments: [],
    companies: [],
    industries: [],
    graduation_years: [],
  })
  const [selectedDept, setSelectedDept] = useState('')
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedYear, setSelectedYear] = useState('')
  const [verifiedOnly, setVerifiedOnly] = useState(false)
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [page, setPage] = useState(1)
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(true)

  // Fetch filter dropdown options once
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const res = await api.get('/alumni/filters')
        if (res.success && res.data) {
          setFilters(res.data)
        }
      } catch (err) {
        console.error('Failed to load filter options:', err)
      }
    }
    fetchFilterOptions()
  }, [])

  // Fetch alumni listing when filters or debounced search change
  const fetchAlumni = async () => {
    setLoading(true)
    try {
      let url = `/alumni?page=${page}&per_page=12`
      if (debouncedSearch) url += `&q=${encodeURIComponent(debouncedSearch)}`
      if (selectedDept) url += `&department=${encodeURIComponent(selectedDept)}`
      if (selectedCompany) url += `&company=${encodeURIComponent(selectedCompany)}`
      if (selectedYear) url += `&graduation_year=${selectedYear}`
      if (verifiedOnly) url += `&verified_only=true`

      const res = await api.get(url)
      if (res.success && res.data) {
        setAlumni(res.data.alumni || [])
        setPagination(res.data.pagination || {})
      }
    } catch (err) {
      console.error('Failed to search alumni:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAlumni()
  }, [page, debouncedSearch, selectedDept, selectedCompany, selectedYear, verifiedOnly])

  const handleResetFilters = () => {
    setSearch('')
    setSelectedDept('')
    setSelectedCompany('')
    setSelectedYear('')
    setVerifiedOnly(false)
    setPage(1)
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault()
    setPage(1)
    fetchAlumni()
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Alumni Discovery Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Connect with verified graduates across leading technology companies and research organizations
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-white rounded-2xl border border-[#D8D2C4] p-5 shadow-sm space-y-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#333333]/40 absolute left-3.5 top-3.5" />
            <input
              type="text"
              placeholder="Live search by name, company, position, or skills (e.g. Python, Google, ML)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D8D2C4] rounded-xl text-sm text-[#333333] placeholder:text-[#333333]/40 focus:outline-none focus:ring-2 focus:ring-[#244B3A]/20 focus:border-[#244B3A] transition"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 bg-[#244B3A] hover:bg-[#1B3B2B] text-white font-semibold rounded-xl text-sm shadow-sm transition"
          >
            Search
          </button>
          {(search || selectedDept || selectedCompany || selectedYear || verifiedOnly) && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2.5 border border-[#D8D2C4] hover:bg-[#F5F1E8] text-[#333333] font-medium rounded-xl text-sm transition flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#244B3A]" />
              <span>Reset</span>
            </button>
          )}
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#D8D2C4]/60">
          <select
            value={selectedDept}
            onChange={(e) => {
              setSelectedDept(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 bg-white border border-[#D8D2C4] rounded-xl text-xs font-medium text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#244B3A]"
          >
            <option value="" className="text-[#333333] bg-white">All Departments</option>
            {filters.departments?.map((d, i) => (
              <option key={i} value={d} className="text-[#333333] bg-white">{d}</option>
            ))}
          </select>

          <select
            value={selectedCompany}
            onChange={(e) => {
              setSelectedCompany(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 bg-white border border-[#D8D2C4] rounded-xl text-xs font-medium text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#244B3A]"
          >
            <option value="" className="text-[#333333] bg-white">All Companies</option>
            {filters.companies?.map((c, i) => (
              <option key={i} value={c} className="text-[#333333] bg-white">{c}</option>
            ))}
          </select>

          <select
            value={selectedYear}
            onChange={(e) => {
              setSelectedYear(e.target.value)
              setPage(1)
            }}
            className="px-3 py-2 bg-white border border-[#D8D2C4] rounded-xl text-xs font-medium text-[#333333] focus:outline-none focus:ring-1 focus:ring-[#244B3A]"
          >
            <option value="" className="text-[#333333] bg-white">All Graduation Years</option>
            {filters.graduation_years?.map((y, i) => (
              <option key={i} value={y} className="text-[#333333] bg-white">Class of {y}</option>
            ))}
          </select>

          <label className="flex items-center gap-2 px-3 py-2 bg-white border border-[#D8D2C4] rounded-xl text-xs font-semibold text-[#333333] cursor-pointer select-none hover:bg-[#F5F1E8]/50 transition">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => {
                setVerifiedOnly(e.target.checked)
                setPage(1)
              }}
              className="rounded accent-[#244B3A] text-[#244B3A] focus:ring-[#244B3A]"
            />
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#244B3A]" />
              Verified Alumni Only
            </span>
          </label>
        </div>
      </div>

      {/* Directory Grid */}
      {loading ? (
        <SkeletonCard count={6} />
      ) : alumni.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No Alumni Matched Your Filters"
          description="Try broadening your search term or clearing specific department, company, or graduation year filters."
          actionLabel="Clear All Filters"
          onAction={handleResetFilters}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alumni.map((item) => {
            const p = item.profile || {}
            const ad = item.alumni_detail || {}
            const isVerified = ad.verification_status === 'VERIFIED'
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 p-6 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start gap-3.5 mb-4">
                    <div className="w-12 h-12 rounded-full bg-slate-900 text-white font-bold flex items-center justify-center text-lg shrink-0">
                      {p.avatar_url ? (
                        <img src={p.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        p.first_name?.[0] || 'A'
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="font-bold text-slate-900 text-base">{p.first_name} {p.last_name}</h3>
                        {isVerified && (
                          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" title="Verified Alumni" />
                        )}
                      </div>
                      <p className="text-xs text-slate-600 font-medium line-clamp-1">
                        {ad.current_position || 'Engineer'} {ad.current_company ? `at ${ad.current_company}` : ''}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <GraduationCap className="w-3.5 h-3.5" />
                        <span>Class of {ad.graduation_year}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-3">
                    {p.bio || p.headline || `Graduate of ${ad.department}. Available for career guidance and networking.`}
                  </p>

                  <div className="flex flex-wrap gap-1.5">
                    {p.skills?.slice(0, 3).map((skill, idx) => (
                      <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <Link
                    to={`/messages/${item.id}`}
                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    title="Send Direct Message"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Link>

                  <Link
                    to={`/alumni/${item.id}`}
                    className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl transition flex items-center gap-1"
                  >
                    <span>View Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            disabled={!pagination.has_prev}
            onClick={() => setPage(page - 1)}
            className="px-4 py-2 border border-slate-200 bg-white text-xs font-semibold rounded-xl disabled:opacity-40"
          >
            Previous
          </button>
          <span className="text-xs text-slate-600 px-3">
            Page {pagination.page} of {pagination.total_pages}
          </span>
          <button
            disabled={!pagination.has_next}
            onClick={() => setPage(page + 1)}
            className="px-4 py-2 border border-slate-200 bg-white text-xs font-semibold rounded-xl disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
