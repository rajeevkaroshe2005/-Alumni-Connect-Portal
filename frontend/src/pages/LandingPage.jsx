import React from 'react'
import { Link } from 'react-router-dom'
import {
  GraduationCap,
  Sparkles,
  Users,
  Briefcase,
  Calendar,
  MessageSquare,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react'

export const LandingPage = () => {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Next-Gen Career Intelligence Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15]">
              Empowering Students through <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">AI-Assisted Alumni Networking</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Connect with verified alumni leaders, unlock exclusive job opportunities, book conflict-free 1-on-1 mentorship, and discover personalized career roadmaps powered by TF-IDF matching.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 transition text-sm"
              >
                <span>Join the Network</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/alumni"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-300 shadow-sm transition text-sm"
              >
                <span>Explore Directory</span>
              </Link>
            </div>

            {/* Quick Demo Credentials Info */}
            <div className="pt-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100/90 rounded-xl text-xs text-slate-600 border border-slate-200">
                <span className="font-semibold text-slate-800">Academic Demo:</span>
                <span>Pre-seeded with real alumni from Google, Amazon & Stripe. Test with Student, Alumni, or Admin credentials on Sign In.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Integrated Core Pillars
          </h2>
          <p className="text-slate-600 text-sm mt-2">
            Engineered to replace fragmented social groups and manual spreadsheets with an institution-grade platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Verified Alumni Discovery</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Multi-criteria search by department, company, industry, and graduation year with institutional verification badges.
            </p>
            <ul className="text-xs text-slate-500 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Admin degree verification queue</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Granular privacy controls</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center mb-6">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Transactional Mentorship</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              Real calendar slot bookings with atomic database locks preventing concurrent double-booking and schedule clashes.
            </p>
            <ul className="text-xs text-slate-500 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Concurrency-safe interval checks</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Meeting links & post-session feedback</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-6">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">AI-Powered Recommendations</h3>
            <p className="text-slate-600 text-sm leading-relaxed mb-4">
              TF-IDF and Cosine similarity scoring matching student profiles with relevant alumni mentors and job descriptions.
            </p>
            <ul className="text-xs text-slate-500 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Transparent matching rationale</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Resume skill-gap & 4-phase roadmap</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Featured Alumni Showcase */}
      <section className="bg-slate-100/70 py-16 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Our Community</span>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
                Featured Alumni in Industry
              </h2>
            </div>
            <Link
              to="/alumni"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-700"
            >
              <span>View full directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-lg">
                  P
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900">Priya Sharma</h4>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" title="Verified Alumni" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Senior Software Engineer at Google</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                B.Tech CSE '20. Specialized in distributed cloud infrastructure, microservices, and system design interviews.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">Python</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">Kubernetes</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">System Design</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-lg">
                  R
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900">Rohit Verma</h4>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" title="Verified Alumni" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Staff Engineer at Stripe</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                B.Tech CSE '18. Leading payments infrastructure, high-throughput concurrency, and architecture mentorship.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">Java</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">Spring Boot</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">Fintech</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-violet-600 text-white font-bold flex items-center justify-center text-lg">
                  A
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-slate-900">Ananya Sen</h4>
                    <ShieldCheck className="w-4 h-4 text-emerald-600" title="Verified Alumni" />
                  </div>
                  <p className="text-xs text-slate-500 font-medium">Applied Scientist at Amazon</p>
                </div>
              </div>
              <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                B.Tech IT '21. Researching NLP and generative AI models. Passionate about guiding students in ML career trajectories.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100">
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">Machine Learning</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">PyTorch</span>
                <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full font-medium">NLP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Ready to Accelerate Your Career Trajectory?
            </h2>
            <p className="text-indigo-200 text-sm leading-relaxed">
              Join thousands of fellow students and graduates. Gain access to verified alumni mentors, job referrals, and real-time guidance.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="px-6 py-3 bg-white text-indigo-900 font-bold rounded-xl hover:bg-indigo-50 transition text-sm shadow"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 bg-indigo-700/60 hover:bg-indigo-700 text-white font-semibold rounded-xl border border-indigo-500/40 transition text-sm"
              >
                Sign In With Demo Accounts
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
