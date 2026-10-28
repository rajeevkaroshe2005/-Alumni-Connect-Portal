import React from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Users,
  Calendar,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react'

export const LandingPage = () => {
  return (
    <div className="space-y-20 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#C4A878]/25 border border-[#C4A878] text-[#244B3A] text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-[#244B3A]" />
              <span>Next-Gen Career Intelligence Platform</span>
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold text-[#333333] tracking-tight leading-[1.15]">
              Empowering Students through <span className="text-[#244B3A] underline decoration-[#C4A878] decoration-4 underline-offset-8">AI-Assisted Alumni Networking</span>
            </h1>

            <p className="text-lg text-[#333333]/85 max-w-2xl mx-auto leading-relaxed">
              Connect with verified alumni leaders, unlock exclusive job opportunities, book conflict-free 1-on-1 mentorship, and discover personalized career roadmaps powered by TF-IDF matching.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#244B3A] hover:bg-[#3A5F50] text-white font-bold rounded-xl shadow-lg shadow-[#244B3A]/20 transition text-sm border border-[#244B3A]"
              >
                <span>Join the Network</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/alumni"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white hover:bg-[#F5F1E8] text-[#333333] font-semibold rounded-xl border border-[#D8D2C4] shadow-sm transition text-sm"
              >
                <span>Explore Directory</span>
              </Link>
            </div>

            {/* Quick Demo Credentials Info */}
            <div className="pt-6">
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl text-xs text-[#333333] border border-[#D8D2C4] shadow-xs">
                <span className="font-bold text-[#244B3A] uppercase tracking-wider">Academic Demo:</span>
                <span className="text-[#333333]/90">Pre-seeded with alumni from Google, Amazon & Stripe. Test with Student, Alumni, or Admin accounts.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#244B3A] uppercase tracking-wider">Institutional Architecture</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#333333] tracking-tight mt-1">
            Integrated Core Pillars
          </h2>
          <p className="text-[#333333]/70 text-sm mt-2">
            Engineered to replace fragmented social groups and manual spreadsheets with an institution-grade platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-[#D8D2C4] shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-[#244B3A]/10 text-[#244B3A] flex items-center justify-center mb-6 border border-[#244B3A]/20">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#333333] mb-2">Verified Alumni Discovery</h3>
            <p className="text-[#333333]/80 text-sm leading-relaxed mb-4">
              Multi-criteria search by department, company, industry, and graduation year with institutional verification badges.
            </p>
            <ul className="text-xs text-[#333333]/75 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#244B3A]" /> Admin degree verification queue</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#244B3A]" /> Granular privacy controls</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#D8D2C4] shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-[#C4A878]/25 text-[#244B3A] flex items-center justify-center mb-6 border border-[#C4A878]/40">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#333333] mb-2">Transactional Mentorship</h3>
            <p className="text-[#333333]/80 text-sm leading-relaxed mb-4">
              Real calendar slot bookings with atomic database locks preventing concurrent double-booking and schedule clashes.
            </p>
            <ul className="text-xs text-[#333333]/75 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#244B3A]" /> Concurrency-safe interval checks</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#244B3A]" /> Meeting links & post-session feedback</li>
            </ul>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-[#D8D2C4] shadow-xs hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-[#3A5F50]/15 text-[#244B3A] flex items-center justify-center mb-6 border border-[#3A5F50]/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#333333] mb-2">AI-Powered Intelligence</h3>
            <p className="text-[#333333]/80 text-sm leading-relaxed mb-4">
              TF-IDF and Cosine similarity scoring matching student profiles with relevant alumni mentors, mock interviews, and referral pitches.
            </p>
            <ul className="text-xs text-[#333333]/75 space-y-2">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#244B3A]" /> Transparent matching rationale</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-[#244B3A]" /> AI Mock Interview simulator</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Featured Alumni Showcase */}
      <section className="bg-[#EFE9DC]/70 py-16 border-y border-[#D8D2C4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-[#244B3A] uppercase tracking-wider">Our Community</span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#333333] tracking-tight mt-1">
                Featured Alumni in Industry
              </h2>
            </div>
            <Link
              to="/alumni"
              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#244B3A] hover:text-[#3A5F50]"
            >
              <span>View full directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1 */}
            <div className="bg-white rounded-2xl p-6 border border-[#D8D2C4] shadow-xs">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#244B3A] text-white font-bold flex items-center justify-center text-lg border border-[#C4A878]">
                  P
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-[#333333]">Priya Sharma</h4>
                    <ShieldCheck className="w-4 h-4 text-[#244B3A]" title="Verified Alumni" />
                  </div>
                  <p className="text-xs text-[#333333]/70 font-medium">Senior Software Engineer at Google</p>
                </div>
              </div>
              <p className="text-xs text-[#333333]/85 line-clamp-2 mb-4">
                B.Tech CSE '20. Specialized in distributed cloud infrastructure, microservices, and system design interviews.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#D8D2C4]/60">
                <span className="text-[10px] bg-[#F5F1E8] text-[#244B3A] px-2 py-0.5 rounded-full font-bold border border-[#C4A878]/40">Python</span>
                <span className="text-[10px] bg-[#F5F1E8] text-[#244B3A] px-2 py-0.5 rounded-full font-bold border border-[#C4A878]/40">Kubernetes</span>
                <span className="text-[10px] bg-[#F5F1E8] text-[#244B3A] px-2 py-0.5 rounded-full font-bold border border-[#C4A878]/40">System Design</span>
              </div>
            </div>

            {/* Card 2 */}
            <div className="bg-white rounded-2xl p-6 border border-[#D8D2C4] shadow-xs">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#3A5F50] text-white font-bold flex items-center justify-center text-lg border border-[#C4A878]">
                  R
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-[#333333]">Rohit Verma</h4>
                    <ShieldCheck className="w-4 h-4 text-[#244B3A]" title="Verified Alumni" />
                  </div>
                  <p className="text-xs text-[#333333]/70 font-medium">Staff Engineer at Stripe</p>
                </div>
              </div>
              <p className="text-xs text-[#333333]/85 line-clamp-2 mb-4">
                B.Tech CSE '18. Leading payments infrastructure, high-throughput concurrency, and architecture mentorship.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#D8D2C4]/60">
                <span className="text-[10px] bg-[#F5F1E8] text-[#244B3A] px-2 py-0.5 rounded-full font-bold border border-[#C4A878]/40">Java</span>
                <span className="text-[10px] bg-[#F5F1E8] text-[#244B3A] px-2 py-0.5 rounded-full font-bold border border-[#C4A878]/40">Spring Boot</span>
                <span className="text-[10px] bg-[#F5F1E8] text-[#244B3A] px-2 py-0.5 rounded-full font-bold border border-[#C4A878]/40">Fintech</span>
              </div>
            </div>

            {/* Card 3 */}
            <div className="bg-white rounded-2xl p-6 border border-[#D8D2C4] shadow-xs">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-[#244B3A] text-white font-bold flex items-center justify-center text-lg border border-[#C4A878]">
                  A
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-[#333333]">Ananya Sen</h4>
                    <ShieldCheck className="w-4 h-4 text-[#244B3A]" title="Verified Alumni" />
                  </div>
                  <p className="text-xs text-[#333333]/70 font-medium">Applied Scientist at Amazon</p>
                </div>
              </div>
              <p className="text-xs text-[#333333]/85 line-clamp-2 mb-4">
                B.Tech IT '21. Researching NLP and generative AI models. Passionate about guiding students in ML career trajectories.
              </p>
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#D8D2C4]/60">
                <span className="text-[10px] bg-[#F5F1E8] text-[#244B3A] px-2 py-0.5 rounded-full font-bold border border-[#C4A878]/40">Machine Learning</span>
                <span className="text-[10px] bg-[#F5F1E8] text-[#244B3A] px-2 py-0.5 rounded-full font-bold border border-[#C4A878]/40">PyTorch</span>
                <span className="text-[10px] bg-[#F5F1E8] text-[#244B3A] px-2 py-0.5 rounded-full font-bold border border-[#C4A878]/40">NLP</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#244B3A] rounded-3xl p-8 sm:p-12 text-[#F5F1E8] relative overflow-hidden shadow-xl border border-[#3A5F50]">
          <div className="relative z-10 max-w-2xl space-y-4">
            <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
              Ready to Accelerate Your Career Trajectory?
            </h2>
            <p className="text-[#F5F1E8]/85 text-sm leading-relaxed">
              Join thousands of fellow students and graduates. Gain access to verified alumni mentors, job referrals, and real-time guidance.
            </p>
            <div className="pt-2 flex flex-wrap gap-4">
              <Link
                to="/register"
                className="px-6 py-3 bg-[#C4A878] text-[#244B3A] font-extrabold rounded-xl hover:bg-[#b59969] transition text-sm shadow"
              >
                Create Free Account
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 bg-[#3A5F50] hover:bg-[#3A5F50]/80 text-[#F5F1E8] font-bold rounded-xl border border-[#C4A878]/50 transition text-sm"
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
