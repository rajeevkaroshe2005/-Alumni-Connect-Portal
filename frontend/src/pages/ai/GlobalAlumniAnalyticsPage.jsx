import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Globe2, TrendingUp, Building2, MapPin, Award, 
  Sparkles, Layers, ChevronRight, RefreshCw, AlertCircle 
} from 'lucide-react';
import api from '../../services/api';

export default function GlobalAlumniAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/ai/analytics-hub');
      if (res?.success) {
        setAnalytics(res.data?.analytics);
      }
    } catch (err) {
      setError(err.message || 'Failed to load global alumni analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2">
            <Globe2 className="w-3.5 h-3.5" />
            Institutional Career Intelligence Hub
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Global Alumni Footprint & Career Matrix
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
            Live macro intelligence tracking global tech hub distribution, university-to-industry career trajectories, and trending high-growth skill demands.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/mock-interview"
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
          >
            <span>AI Mock Interview</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/ai-referral"
            className="px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
          >
            <span>Referral Generator</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Synthesizing global analytics...</p>
        </div>
      ) : error || !analytics ? (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error || 'Analytics unavailable.'}</span>
        </div>
      ) : (
        <div className="space-y-8">
          {/* High-Level Metric Tiles */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Active Alumni</span>
              <div className="text-3xl font-black text-slate-900 mt-1">{analytics.total_alumni_network}+</div>
              <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">Across Global Tech</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Countries Represented</span>
              <div className="text-3xl font-black text-indigo-600 mt-1">{analytics.countries_represented}</div>
              <span className="text-[11px] text-slate-500 font-medium mt-1 inline-block">Worldwide Distribution</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Average Starting Package</span>
              <div className="text-3xl font-black text-emerald-600 mt-1">₹{analytics.average_starting_package_lpa} LPA</div>
              <span className="text-[11px] text-emerald-600 font-bold mt-1 inline-block">Tier-1 & Global Roles</span>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Placement Success Rate</span>
              <div className="text-3xl font-black text-violet-600 mt-1">{analytics.placement_percentage}%</div>
              <span className="text-[11px] text-violet-600 font-bold mt-1 inline-block">Verified Outcomes</span>
            </div>
          </div>

          {/* Global Tech Hubs Section */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-indigo-600" />
                Key Global Alumni Clusters & Employment Density
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Top metropolitan technological hubs where graduates hold active engineering and leadership positions.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {analytics.global_hubs?.map((hub, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl border border-slate-200/90 hover:border-indigo-300 bg-slate-50/50 transition flex flex-col justify-between space-y-3"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{hub.city}</h3>
                      <span className="text-xs text-slate-500 font-medium">{hub.country}</span>
                    </div>
                    <span className="text-xs font-black px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800">
                      {hub.alumni_count} Alumni
                    </span>
                  </div>

                  <div className="pt-2 border-t border-slate-200/60">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                      Prominent Employers:
                    </span>
                    <span className="text-xs font-semibold text-slate-800">{hub.top_employers}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department to Career Pipeline & In-Demand Skills */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Career Pipeline */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-5 h-5 text-emerald-600" />
                  Department &rarr; Industry Specialization Pipeline
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Primary technological domains entered by university department alumni.
                </p>
              </div>

              <div className="space-y-3">
                {analytics.career_trajectory_pipeline?.map((item, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-900">
                      <span>{item.department}</span>
                      <span className="text-emerald-700">Avg ₹{item.avg_starting_lpa} LPA</span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>{item.domain}</span>
                      <span className="font-bold text-slate-800">{item.share_percentage}% of cohort</span>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-emerald-600 h-1.5 rounded-full"
                        style={{ width: `${item.share_percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Trending In-Demand Skills */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-violet-600" />
                  High-Growth Competencies Demanded by Alumni Companies
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Aggregate skill demand indices indexed from alumni job listings and referral openings.
                </p>
              </div>

              <div className="space-y-3">
                {analytics.top_in_demand_skills?.map((sk, idx) => (
                  <div key={idx} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-900">{sk.skill}</div>
                      <div className="text-[11px] text-emerald-600 font-bold mt-0.5">{sk.growth_rate}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                        Demand: {sk.demand_index}/100
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
