import React, { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  Share2,
  Users,
  Building,
  GraduationCap,
  Sparkles,
  Search,
  Filter,
  ExternalLink,
  MessageSquare,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Info,
  RefreshCw,
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function NetworkGraphPage() {
  const { user } = useAuth()
  const [graphData, setGraphData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedNode, setSelectedNode] = useState(null)
  const [filterType, setFilterType] = useState('ALL') // ALL, 1ST_DEGREE, 2ND_DEGREE, COMPANY
  const [searchQuery, setSearchQuery] = useState('')

  const fetchGraph = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/ai/network-graph')
      if (res?.success && res.data) {
        setGraphData(res.data)
        // Select user node by default if available
        const me = res.data.nodes?.find((n) => n.id === `user_${user?.id}`)
        if (me) setSelectedNode(me)
        else if (res.data.nodes?.length > 0) setSelectedNode(res.data.nodes[0])
      }
    } catch (err) {
      setError(err.message || 'Failed to generate connection graph.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchGraph()
  }, [])

  // Calculate layout coordinates for nodes in a dynamic radial/hub visualization
  const { positionedNodes, positionedLinks } = useMemo(() => {
    if (!graphData || !graphData.nodes) return { positionedNodes: [], positionedLinks: [] }

    const width = 800
    const height = 600
    const centerX = width / 2
    const centerY = height / 2

    const nodes = graphData.nodes
    const links = graphData.links || []

    const centerNode = nodes.find((n) => n.type === 'USER') || nodes[0]
    const firstDegree = nodes.filter((n) => n.type === '1ST_DEGREE' && n.id !== centerNode?.id)
    const secondDegree = nodes.filter((n) => n.type === '2ND_DEGREE')
    const companyHubs = nodes.filter((n) => n.type === 'COMPANY_HUB')

    const nodeCoords = new Map()

    // 1. Center node
    if (centerNode) {
      nodeCoords.set(centerNode.id, { ...centerNode, x: centerX, y: centerY, r: 28 })
    }

    // 2. 1st Degree nodes on inner circle (radius 150)
    const r1 = 145
    firstDegree.forEach((n, idx) => {
      const angle = (idx / Math.max(firstDegree.length, 1)) * 2 * Math.PI - Math.PI / 2
      const x = centerX + r1 * Math.cos(angle)
      const y = centerY + r1 * Math.sin(angle)
      nodeCoords.set(n.id, { ...n, x, y, r: 22 })
    })

    // 3. Company hubs on middle circle (radius 220)
    const rCompany = 215
    companyHubs.forEach((n, idx) => {
      const angle = (idx / Math.max(companyHubs.length, 1)) * 2 * Math.PI + Math.PI / 4
      const x = centerX + rCompany * Math.cos(angle)
      const y = centerY + rCompany * Math.sin(angle)
      nodeCoords.set(n.id, { ...n, x, y, r: 24 })
    })

    // 4. 2nd Degree nodes on outer circle (radius 280)
    const r2 = 275
    secondDegree.forEach((n, idx) => {
      const angle = (idx / Math.max(secondDegree.length, 1)) * 2 * Math.PI
      const x = centerX + r2 * Math.cos(angle)
      const y = centerY + r2 * Math.sin(angle)
      nodeCoords.set(n.id, { ...n, x, y, r: 18 })
    })

    const finalNodes = Array.from(nodeCoords.values())

    const finalLinks = links
      .map((link) => {
        const source = nodeCoords.get(link.source)
        const target = nodeCoords.get(link.target)
        if (source && target) {
          return {
            ...link,
            sourceX: source.x,
            sourceY: source.y,
            targetX: target.x,
            targetY: target.y,
            sourceType: source.type,
            targetType: target.type,
          }
        }
        return null
      })
      .filter(Boolean)

    return { positionedNodes: finalNodes, positionedLinks: finalLinks }
  }, [graphData])

  // Filter nodes for search or filter tabs
  const filteredNodes = useMemo(() => {
    return positionedNodes.filter((node) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        node.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.subtitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        node.department?.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      if (filterType === '1ST_DEGREE') return node.type === '1ST_DEGREE' || node.type === 'USER'
      if (filterType === '2ND_DEGREE') return node.type === '2ND_DEGREE'
      if (filterType === 'COMPANY') return node.type === 'COMPANY_HUB'
      return true
    })
  }, [positionedNodes, searchQuery, filterType])

  const getNodeColor = (type, isSelected) => {
    if (isSelected) return '#C4A878' // Highlight gold
    switch (type) {
      case 'USER':
        return '#244B3A' // Primary Forest
      case '1ST_DEGREE':
        return '#3A5F50' // Secondary Forest
      case '2ND_DEGREE':
        return '#4B6B94' // Slate Blue
      case 'COMPANY_HUB':
        return '#D97706' // Warm Amber
      default:
        return '#64748B'
    }
  }

  const getNodeBadge = (type) => {
    switch (type) {
      case 'USER':
        return 'You (Center)'
      case '1ST_DEGREE':
        return '1st-Degree Connection'
      case '2ND_DEGREE':
        return '2nd-Degree Alum'
      case 'COMPANY_HUB':
        return 'Industry Hub'
      default:
        return 'Connection'
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#D8D2C4] gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#244B3A]/10 text-[#244B3A] text-xs font-semibold border border-[#244B3A]/20 mb-2">
            <Share2 className="w-3.5 h-3.5 text-[#244B3A]" />
            <span>Alumni Knowledge Graph Engine</span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#333333] tracking-tight">
            Smart Professional Connection Graph
          </h1>
          <p className="mt-1 text-sm text-[#333333]/70">
            Visualize your direct and 2nd-degree alumni network, discover shared departmental roots, and bridge connections into leading tech companies.
          </p>
        </div>

        <button
          onClick={fetchGraph}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-[#F5F1E8] text-[#244B3A] border border-[#244B3A]/30 rounded-xl text-xs font-bold shadow-xs transition"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Graph</span>
        </button>
      </div>

      {/* Network Stats Cards */}
      {graphData?.stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-[#D8D2C4] shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#333333]/60">Total Reach</span>
            <p className="text-2xl font-black text-[#244B3A] mt-1">{graphData.stats.total_network_reach}</p>
            <p className="text-[11px] text-[#333333]/70 mt-0.5">Alumni & mentors accessible</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-[#D8D2C4] shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#333333]/60">1st Degree Peers</span>
            <p className="text-2xl font-black text-[#3A5F50] mt-1">{graphData.stats.first_degree_count}</p>
            <p className="text-[11px] text-[#333333]/70 mt-0.5">Department & direct peers</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-[#D8D2C4] shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#333333]/60">2nd Degree Network</span>
            <p className="text-2xl font-black text-[#4B6B94] mt-1">{graphData.stats.second_degree_count}</p>
            <p className="text-[11px] text-[#333333]/70 mt-0.5">Warm referral bridges</p>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-[#D8D2C4] shadow-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#333333]/60">Company Hubs</span>
            <p className="text-2xl font-black text-[#D97706] mt-1">{graphData.stats.company_hubs_count}</p>
            <p className="text-[11px] text-[#333333]/70 mt-0.5">Top employer destinations</p>
          </div>
        </div>
      )}

      {/* Controls Bar: Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#D8D2C4] shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search alumni, companies, or departments..."
            className="w-full pl-9 pr-4 py-2 bg-[#F5F1E8]/60 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:outline-none focus:ring-2 focus:ring-[#244B3A]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'All Nodes' },
            { id: '1ST_DEGREE', label: '1st Degree' },
            { id: '2ND_DEGREE', label: '2nd Degree' },
            { id: 'COMPANY', label: 'Company Hubs' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-[#244B3A] text-white shadow-xs'
                  : 'bg-[#F5F1E8] text-[#333333] hover:bg-[#D8D2C4]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Graph Area & Inspector Drawer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* SVG Interactive Canvas */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#D8D2C4] p-4 shadow-sm relative overflow-hidden flex items-center justify-center min-h-[550px]">
          {loading ? (
            <div className="flex flex-col items-center gap-3 text-[#244B3A]">
              <RefreshCw className="w-8 h-8 animate-spin" />
              <p className="text-xs font-semibold">Generating graph topology & multi-degree clusters...</p>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-rose-600 text-xs font-semibold">{error}</div>
          ) : (
            <div className="w-full h-full flex flex-col items-center">
              {/* Legend */}
              <div className="w-full flex items-center justify-between pb-3 px-2 border-b border-[#D8D2C4]/40 text-[11px] font-medium text-[#333333]/80">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#244B3A]" />
                    <span>You</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#3A5F50]" />
                    <span>1st Degree</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#4B6B94]" />
                    <span>2nd Degree (Alumni)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-3 h-3 rounded-full bg-[#D97706]" />
                    <span>Company Hub</span>
                  </div>
                </div>
                <span className="text-[10px] text-slate-400">Click any node to inspect profile</span>
              </div>

              {/* Responsive SVG */}
              <div className="w-full overflow-auto flex items-center justify-center py-2">
                <svg
                  viewBox="0 0 800 600"
                  className="w-full max-w-[760px] h-auto select-none"
                  style={{ minHeight: '480px' }}
                >
                  {/* Grid background / subtle concentric circles */}
                  <circle cx="400" cy="300" r="145" fill="none" stroke="#E2E8F0" strokeDasharray="4 4" />
                  <circle cx="400" cy="300" r="215" fill="none" stroke="#E2E8F0" strokeDasharray="4 4" />
                  <circle cx="400" cy="300" r="275" fill="none" stroke="#E2E8F0" strokeDasharray="4 4" />

                  {/* Edges */}
                  <g className="links">
                    {positionedLinks.map((link, idx) => {
                      const isHighlighted =
                        selectedNode &&
                        (link.source === selectedNode.id || link.target === selectedNode.id)
                      return (
                        <line
                          key={idx}
                          x1={link.sourceX}
                          y1={link.sourceY}
                          x2={link.targetX}
                          y2={link.targetY}
                          stroke={isHighlighted ? '#C4A878' : '#CBD5E1'}
                          strokeWidth={isHighlighted ? 2.5 : 1.2}
                          strokeOpacity={isHighlighted ? 1 : 0.6}
                          strokeDasharray={link.type === 'SECOND_DEGREE' ? '4 3' : 'none'}
                        />
                      )
                    })}
                  </g>

                  {/* Nodes */}
                  <g className="nodes">
                    {filteredNodes.map((node) => {
                      const isSelected = selectedNode?.id === node.id
                      const color = getNodeColor(node.type, isSelected)
                      return (
                        <g
                          key={node.id}
                          className="cursor-pointer transition-transform hover:scale-110"
                          onClick={() => setSelectedNode(node)}
                        >
                          {/* Pulsing ring for selected node */}
                          {isSelected && (
                            <circle
                              cx={node.x}
                              cy={node.y}
                              r={node.r + 8}
                              fill="none"
                              stroke="#C4A878"
                              strokeWidth="2"
                              strokeOpacity="0.8"
                              className="animate-pulse"
                            />
                          )}

                          {/* Outer node circle */}
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={node.r}
                            fill={color}
                            stroke="#FFFFFF"
                            strokeWidth="2.5"
                            className="shadow-md"
                          />

                          {/* Initials / Icon letter */}
                          <text
                            x={node.x}
                            y={node.y + 4}
                            textAnchor="middle"
                            fill="#FFFFFF"
                            fontSize={node.type === 'COMPANY_HUB' ? '10' : '11'}
                            fontWeight="bold"
                            pointerEvents="none"
                          >
                            {node.label?.slice(0, 2).toUpperCase()}
                          </text>

                          {/* Label below node */}
                          <text
                            x={node.x}
                            y={node.y + node.r + 14}
                            textAnchor="middle"
                            fill="#333333"
                            fontSize="10"
                            fontWeight={isSelected ? 'bold' : '500'}
                            pointerEvents="none"
                          >
                            {node.label?.length > 15
                              ? node.label.slice(0, 13) + '…'
                              : node.label}
                          </text>
                        </g>
                      )
                    })}
                  </g>
                </svg>
              </div>
            </div>
          )}
        </div>

        {/* Selected Node Details Drawer */}
        <div className="bg-white rounded-3xl border border-[#D8D2C4] p-6 shadow-sm flex flex-col justify-between">
          {selectedNode ? (
            <div className="space-y-6">
              <div>
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      selectedNode.type === 'USER'
                        ? 'bg-[#244B3A]/10 text-[#244B3A]'
                        : selectedNode.type === '1ST_DEGREE'
                        ? 'bg-[#3A5F50]/10 text-[#3A5F50]'
                        : selectedNode.type === '2ND_DEGREE'
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-amber-50 text-amber-700'
                    }`}
                  >
                    {getNodeBadge(selectedNode.type)}
                  </span>
                  {selectedNode.degree && (
                    <span className="text-[11px] font-semibold text-slate-400">
                      Degree {selectedNode.degree}
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-md border-2 border-[#C4A878]"
                    style={{ backgroundColor: getNodeColor(selectedNode.type, false) }}
                  >
                    {selectedNode.type === 'COMPANY_HUB' ? (
                      <Building className="w-7 h-7 text-white" />
                    ) : (
                      selectedNode.label?.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#333333] leading-snug">
                      {selectedNode.label}
                    </h3>
                    <p className="text-xs font-medium text-[#333333]/70">{selectedNode.subtitle}</p>
                  </div>
                </div>
              </div>

              {/* Department & Connection Details */}
              <div className="space-y-3 pt-2 border-t border-[#D8D2C4]/60 text-xs">
                {selectedNode.department && (
                  <div className="flex items-center gap-2 text-[#333333]">
                    <GraduationCap className="w-4 h-4 text-[#244B3A]" />
                    <span className="font-semibold">Department:</span>
                    <span>{selectedNode.department}</span>
                  </div>
                )}
                {selectedNode.company && (
                  <div className="flex items-center gap-2 text-[#333333]">
                    <Building className="w-4 h-4 text-[#D97706]" />
                    <span className="font-semibold">Company:</span>
                    <span>{selectedNode.company}</span>
                  </div>
                )}
                {selectedNode.connection_path && (
                  <div className="p-3 bg-[#F5F1E8]/70 rounded-xl border border-[#D8D2C4] text-[11px] space-y-1">
                    <span className="font-bold text-[#244B3A] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#C4A878]" />
                      Connection Pathway:
                    </span>
                    <p className="text-[#333333]/80 leading-relaxed">
                      {selectedNode.connection_path}
                    </p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-4">
                {selectedNode.user_id && selectedNode.type !== 'USER' && (
                  <>
                    <Link
                      to={`/alumni/${selectedNode.user_id}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#244B3A] hover:bg-[#3A5F50] text-white font-bold rounded-xl text-xs shadow-xs transition"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>View Full Profile</span>
                    </Link>
                    <Link
                      to={`/messages/${selectedNode.user_id}`}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#F5F1E8] hover:bg-[#D8D2C4] text-[#244B3A] font-bold rounded-xl text-xs transition border border-[#D8D2C4]"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Send Direct Message</span>
                    </Link>
                  </>
                )}

                {selectedNode.type === 'COMPANY_HUB' && (
                  <Link
                    to={`/jobs?q=${encodeURIComponent(selectedNode.label)}`}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#D97706] hover:bg-[#B45309] text-white font-bold rounded-xl text-xs shadow-xs transition"
                  >
                    <Building className="w-3.5 h-3.5" />
                    <span>View Jobs at {selectedNode.label}</span>
                  </Link>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 text-slate-400 text-xs">
              Select a node in the graph to view relationship paths and alumni details.
            </div>
          )}

          {/* Institutional note */}
          <div className="p-3 bg-[#F5F1E8]/50 rounded-xl border border-[#D8D2C4]/60 text-[10px] text-[#333333]/70 mt-6 flex items-start gap-2">
            <Info className="w-4 h-4 text-[#244B3A] flex-shrink-0 mt-0.5" />
            <span>
              2nd-degree paths are computed via shared departmental cohorts and mentor-mentee circles, enabling higher warm-response rates.
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
