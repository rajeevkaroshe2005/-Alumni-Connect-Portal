import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  HeartHandshake,
  DollarSign,
  TrendingUp,
  Award,
  Users,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Plus,
  X,
  CreditCard,
  Gift,
  Sparkles,
  ArrowRight,
} from 'lucide-react'
import api from '../../services/api'
import { useAuth } from '../../context/AuthContext'

export default function DonationCampaignsPage() {
  const { user, role } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [stats, setStats] = useState({ total_raised: 0, total_donations: 0 })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Pledge Contribution Modal State
  const [selectedCampaignForPledge, setSelectedCampaignForPledge] = useState(null)
  const [pledging, setPledging] = useState(false)
  const [pledgeAmount, setPledgeAmount] = useState(5000)
  const [customAmount, setCustomAmount] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [donorNote, setDonorNote] = useState('')
  const [pledgeReceipt, setPledgeReceipt] = useState(null)

  // Donor Wall of Honor Modal
  const [viewingDonorsCampaign, setViewingDonorsCampaign] = useState(null)
  const [donorsList, setDonorsList] = useState([])
  const [loadingDonors, setLoadingDonors] = useState(false)

  // Admin Create Campaign Modal
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: '',
    description: '',
    category: 'SCHOLARSHIP',
    target_amount: 500000,
    end_date: '',
  })

  const fetchCampaigns = async () => {
    try {
      setLoading(true)
      setError('')
      const res = await api.get('/donations/campaigns')
      if (res?.success && res.data) {
        setCampaigns(res.data.campaigns || [])
        setStats({
          total_raised: res.data.total_platform_raised || 0,
          total_donations: res.data.total_donations_count || 0,
        })
      }
    } catch (err) {
      setError(err.message || 'Failed to load institutional campaigns.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCampaigns()
  }, [])

  const handlePledgeSubmit = async (e) => {
    e.preventDefault()
    if (!selectedCampaignForPledge) return
    const finalAmount = customAmount ? parseFloat(customAmount) : pledgeAmount
    if (!finalAmount || finalAmount <= 0) {
      alert('Please enter a valid contribution amount.')
      return
    }

    try {
      setPledging(true)
      const res = await api.post('/donations/pledge', {
        campaign_id: selectedCampaignForPledge.id,
        amount: finalAmount,
        is_anonymous: isAnonymous,
        donor_note: donorNote,
      })

      if (res?.success && res.data?.transaction) {
        setPledgeReceipt(res.data.transaction)
        fetchCampaigns()
      }
    } catch (err) {
      alert(`Pledge error: ${err.message}`)
    } finally {
      setPledging(false)
    }
  }

  const openDonorsWall = async (campaign) => {
    setViewingDonorsCampaign(campaign)
    setLoadingDonors(true)
    try {
      const res = await api.get(`/donations/campaigns/${campaign.id}/donors`)
      if (res?.success && res.data) {
        setDonorsList(res.data.donors || [])
      }
    } catch (err) {
      alert(`Failed to load donors: ${err.message}`)
    } finally {
      setLoadingDonors(false)
    }
  }

  const handleCreateCampaign = async (e) => {
    e.preventDefault()
    try {
      setCreating(true)
      const res = await api.post('/donations/campaigns', {
        ...createForm,
        target_amount: parseFloat(createForm.target_amount),
      })
      if (res?.success) {
        setShowCreateModal(false)
        setCreateForm({
          title: '',
          description: '',
          category: 'SCHOLARSHIP',
          target_amount: 500000,
          end_date: '',
        })
        fetchCampaigns()
      }
    } catch (err) {
      alert(`Campaign creation error: ${err.message}`)
    } finally {
      setCreating(false)
    }
  }

  const quickAmounts = [1000, 5000, 25000, 50000]

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#244B3A] via-[#2F5A47] to-[#1C3B2E] rounded-3xl p-6 sm:p-10 text-white shadow-md relative overflow-hidden border border-[#244B3A]/20">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#C4A878] text-xs font-semibold border border-[#C4A878]/30">
            <HeartHandshake className="w-3.5 h-3.5 text-[#C4A878]" />
            <span>Alumni Giving & Institutional Advancement</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-tight">
            Empower the Next Generation of Innovators
          </h1>
          <p className="text-sm text-[#F5F1E8]/90 leading-relaxed">
            Your voluntary gifts directly sponsor student merit scholarships, seed-stage AI research labs, hackathon fellowships, and emergency tuition funds.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-white/20">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#C4A878]">Total Funds Raised</span>
              <p className="text-2xl font-black mt-0.5">₹{(stats.total_raised || 0).toLocaleString()}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#C4A878]">Alumni Contributions</span>
              <p className="text-2xl font-black mt-0.5">{stats.total_donations || 0} Pledges</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#C4A878]">Impact Status</span>
              <p className="text-2xl font-black mt-0.5">100% Tax Exempt</p>
            </div>
          </div>
        </div>

        {role === 'ADMIN' && (
          <div className="absolute top-6 right-6 z-20">
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#C4A878] hover:bg-[#B39767] text-[#244B3A] font-bold rounded-xl text-xs shadow-md transition"
            >
              <Plus className="w-3.5 h-3.5 text-[#244B3A]" />
              <span>Launch Campaign</span>
            </button>
          </div>
        )}
      </div>

      {/* Campaigns Section */}
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-extrabold text-[#333333] tracking-tight">
            Active University Campaigns
          </h2>
          <p className="text-xs text-[#333333]/70">
            Select a designated cause to make a secure tax-deductible pledge.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-[#244B3A] text-xs font-semibold">
            Loading campaigns...
          </div>
        ) : error ? (
          <div className="p-6 text-center text-rose-600 text-xs font-semibold">{error}</div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-[#D8D2C4] space-y-2">
            <Gift className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-[#333333]">No Active Campaigns</h3>
            <p className="text-xs text-[#333333]/70">Check back soon for upcoming campus initiatives.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((camp) => {
              const progressPct = Math.min(
                Math.round(((camp.raised_amount || 0) / (camp.target_amount || 1)) * 100),
                100
              )

              return (
                <div
                  key={camp.id}
                  className="bg-white rounded-3xl border border-[#D8D2C4] p-6 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    {/* Badge & Donor Count */}
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#244B3A]/10 text-[#244B3A] border border-[#244B3A]/20">
                        {camp.category}
                      </span>
                      <button
                        onClick={() => openDonorsWall(camp)}
                        className="text-[11px] font-bold text-[#244B3A] hover:underline inline-flex items-center gap-1"
                      >
                        <Users className="w-3.5 h-3.5" />
                        <span>{camp.donors_count || 0} Donors</span>
                      </button>
                    </div>

                    <div>
                      <h3 className="text-base font-extrabold text-[#333333] leading-snug">
                        {camp.title}
                      </h3>
                      <p className="mt-1 text-xs text-[#333333]/70 line-clamp-3 leading-relaxed">
                        {camp.description}
                      </p>
                    </div>

                    {/* Progress Bar & Amount */}
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-[#244B3A]">
                          ₹{(camp.raised_amount || 0).toLocaleString()} raised
                        </span>
                        <span className="text-slate-400">
                          Goal: ₹{(camp.target_amount || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="w-full bg-[#F5F1E8] h-2.5 rounded-full overflow-hidden border border-[#D8D2C4]/60">
                        <div
                          className="bg-[#244B3A] h-full rounded-full transition-all duration-500"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-[#333333]/70">
                        <span>{progressPct}% of target reached</span>
                        <span className="text-emerald-700 font-semibold">Active Fund</span>
                      </div>
                    </div>
                  </div>

                  {/* Pledge CTA */}
                  <div className="mt-6 pt-3 border-t border-[#D8D2C4]/60">
                    <button
                      onClick={() => {
                        setSelectedCampaignForPledge(camp)
                        setPledgeReceipt(null)
                        setPledgeAmount(5000)
                        setCustomAmount('')
                        setIsAnonymous(false)
                        setDonorNote('')
                      }}
                      className="w-full py-2.5 bg-[#244B3A] hover:bg-[#3A5F50] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition"
                    >
                      <Gift className="w-3.5 h-3.5 text-[#C4A878]" />
                      <span>Pledge Contribution</span>
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pledge Modal */}
      {selectedCampaignForPledge && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#D8D2C4] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8D2C4]">
              <div>
                <h3 className="text-base font-extrabold text-[#333333]">Make a University Gift</h3>
                <p className="text-[11px] text-[#333333]/70">{selectedCampaignForPledge.title}</p>
              </div>
              <button
                onClick={() => setSelectedCampaignForPledge(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {pledgeReceipt ? (
              <div className="space-y-4 py-2">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-black text-emerald-900">Thank You for Giving!</h4>
                  <p className="text-xs text-emerald-800">
                    Your contribution of <span className="font-bold">₹{pledgeReceipt.amount?.toLocaleString()}</span> has been securely processed.
                  </p>
                  <div className="text-[10px] text-slate-500 pt-1">
                    Ref ID: <span className="font-mono font-bold">{pledgeReceipt.transaction_ref}</span>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedCampaignForPledge(null)}
                  className="w-full py-2.5 bg-[#244B3A] text-white font-bold rounded-xl text-xs"
                >
                  Close & Return to Giving Page
                </button>
              </div>
            ) : (
              <form onSubmit={handlePledgeSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-[#333333] mb-1.5">Select Pledge Amount</label>
                  <div className="grid grid-cols-4 gap-2 mb-2">
                    {quickAmounts.map((amt) => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => {
                          setPledgeAmount(amt)
                          setCustomAmount('')
                        }}
                        className={`py-2 rounded-xl font-bold border transition ${
                          pledgeAmount === amt && !customAmount
                            ? 'bg-[#244B3A] text-white border-[#244B3A]'
                            : 'bg-[#F5F1E8] text-[#333333] border-[#D8D2C4] hover:bg-[#D8D2C4]'
                        }`}
                      >
                        ₹{amt.toLocaleString()}
                      </button>
                    ))}
                  </div>

                  <input
                    type="number"
                    placeholder="Or enter custom amount in ₹"
                    value={customAmount}
                    onChange={(e) => setCustomAmount(e.target.value)}
                    className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#333333] mb-1">Donor Note / Dedication (Optional)</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. In memory of Prof. Smith or in honor of the Class of 2022..."
                    value={donorNote}
                    onChange={(e) => setDonorNote(e.target.value)}
                    className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymousCheck"
                    checked={isAnonymous}
                    onChange={(e) => setIsAnonymous(e.target.checked)}
                    className="w-4 h-4 text-[#244B3A] rounded focus:ring-[#244B3A]"
                  />
                  <label htmlFor="anonymousCheck" className="text-xs font-semibold text-[#333333] cursor-pointer">
                    Display contribution anonymously on the Wall of Honor
                  </label>
                </div>

                <div className="p-3 bg-[#F5F1E8]/70 rounded-xl border border-[#D8D2C4] text-[11px] text-[#333333]/80 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-[#244B3A] flex-shrink-0" />
                  <span>256-Bit Encrypted Gateway. Institutional 80G Tax Exemption receipt emailed immediately.</span>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCampaignForPledge(null)}
                    className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-[#333333] hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={pledging}
                    className="px-5 py-2 bg-[#244B3A] hover:bg-[#3A5F50] text-white font-bold rounded-xl shadow-xs transition"
                  >
                    {pledging ? 'Securing Pledge...' : 'Confirm Pledge'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Donor Wall of Honor Modal */}
      {viewingDonorsCampaign && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#D8D2C4] space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#D8D2C4]">
              <div>
                <h3 className="text-base font-extrabold text-[#333333]">Donor Wall of Honor</h3>
                <p className="text-xs text-[#333333]/70">{viewingDonorsCampaign.title}</p>
              </div>
              <button
                onClick={() => setViewingDonorsCampaign(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingDonors ? (
              <div className="py-8 text-center text-xs text-[#244B3A]">Loading donors...</div>
            ) : donorsList.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No public pledges recorded for this initiative yet.
              </div>
            ) : (
              <div className="divide-y divide-[#D8D2C4]/60">
                {donorsList.map((d) => (
                  <div key={d.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-[#333333] text-xs">
                        {d.is_anonymous ? 'Anonymous Patron' : d.donor_name}
                      </p>
                      {d.donor_note && (
                        <p className="text-[11px] text-slate-500 italic mt-0.5">"{d.donor_note}"</p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-0.5">
                        {new Date(d.donated_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span className="text-xs font-black text-[#244B3A]">
                      ₹{d.amount?.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admin Create Campaign Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#D8D2C4] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D8D2C4]">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-[#244B3A]" />
                <h3 className="text-base font-extrabold text-[#333333]">Launch Giving Campaign</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCampaign} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-[#333333] mb-1">Campaign Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 2026 Student Innovation & Hardware Grant"
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#333333] mb-1">Category *</label>
                <select
                  value={createForm.category}
                  onChange={(e) => setCreateForm({ ...createForm, category: e.target.value })}
                  className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                >
                  <option value="SCHOLARSHIP">Merit & Need Scholarship</option>
                  <option value="INFRASTRUCTURE">Lab & GPU Infrastructure</option>
                  <option value="RESEARCH">Faculty & Student Research</option>
                  <option value="EMERGENCY">Emergency Student Assistance</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-[#333333] mb-1">Target Amount (₹) *</label>
                <input
                  type="number"
                  required
                  value={createForm.target_amount}
                  onChange={(e) => setCreateForm({ ...createForm, target_amount: e.target.value })}
                  className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#333333] mb-1">Campaign Description *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe the institutional purpose and impact..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full p-2.5 bg-[#F5F1E8]/50 border border-[#D8D2C4] rounded-xl text-xs text-[#333333] focus:ring-2 focus:ring-[#244B3A]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-xl font-bold text-[#333333] hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 bg-[#244B3A] hover:bg-[#3A5F50] text-white font-bold rounded-xl shadow-xs transition"
                >
                  {creating ? 'Launching...' : 'Launch Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
