import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Sparkles,
  Users,
  Calendar,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  Briefcase,
  TrendingUp,
  Award,
  FileText,
  MessageSquare,
  Search,
  Building2,
  ChevronDown,
  ChevronUp,
  Star,
  Zap,
  ExternalLink,
  Lock,
  Compass,
} from 'lucide-react'

export const LandingPage = () => {
  // Interactive Feature Tab Switcher State
  const [activeFeatureTab, setActiveFeatureTab] = useState('ai-suite')

  // Interactive Career Role Preview State
  const [selectedRoleIndex, setSelectedRoleIndex] = useState(0)

  // Interactive FAQ Accordion State
  const [openFaqIndex, setOpenFaqIndex] = useState(0)

  // Career Roles Data for the Live Interactive Estimator
  const careerRoles = [
    {
      title: 'Full Stack Software Engineer',
      domain: 'Cloud & Web Platforms',
      avgSalary: '₹14.5 - ₹32.0 LPA',
      skills: ['React', 'Node.js', 'PostgreSQL', 'Docker', 'System Design'],
      alumniCount: 86,
      topCompanies: ['Google', 'Microsoft', 'Stripe', 'Atlassian'],
      atsTip: 'Emphasize high-concurrency architecture, API latency reduction, and CI/CD pipelines.',
    },
    {
      title: 'Machine Learning & AI Engineer',
      domain: 'Artificial Intelligence & Deep Learning',
      avgSalary: '₹18.0 - ₹42.0 LPA',
      skills: ['Python', 'PyTorch', 'Transformers', 'NLP', 'Vector Databases'],
      alumniCount: 54,
      topCompanies: ['Amazon AWS', 'NVIDIA', 'Adobe', 'Meta'],
      atsTip: 'Highlight fine-tuning benchmarks, model inference optimization, and RAG pipelines.',
    },
    {
      title: 'Cloud DevOps & SRE Specialist',
      domain: 'Infrastructure & Reliability',
      avgSalary: '₹16.0 - ₹36.0 LPA',
      skills: ['Kubernetes', 'AWS/GCP', 'Terraform', 'Linux', 'Prometheus'],
      alumniCount: 42,
      topCompanies: ['Google Cloud', 'Salesforce', 'Databricks', 'Cisco'],
      atsTip: 'Quantify 99.99% uptime achievements, zero-downtime deployment, and cost savings.',
    },
    {
      title: 'Product & Technical Program Manager',
      domain: 'Engineering Strategy & Delivery',
      avgSalary: '₹19.0 - ₹45.0 LPA',
      skills: ['Agile Roadmap', 'SQL Analytics', 'User Research', 'A/B Testing', 'Stakeholder Mgt'],
      alumniCount: 38,
      topCompanies: ['Uber', 'Flipkart', 'Intuit', 'LinkedIn'],
      atsTip: 'Highlight business impact metrics (e.g. +34% retention, ₹5Cr ARR growth) in STAR format.',
    },
  ]

  // FAQs Data
  const faqs = [
    {
      q: 'How does the AI matching algorithm connect students with alumni?',
      a: 'Our engine uses scikit-learn N-gram (1, 2) TF-IDF vectorization and domain semantic normalization. It maps technical synonyms (e.g. "k8s" to "kubernetes", "ml" to "machine learning") and calculates cosine similarity combined with Jaccard competency overlap to recommend mentors and jobs with transparent, verifiable match scores.',
    },
    {
      q: 'How are alumni verified on the platform?',
      a: 'Every alumni registration undergoes admin verification where graduation year, department, and university credentials are authenticated before full directory listing and mentorship availability are activated. Look for the green verified badge across all alumni cards.',
    },
    {
      q: 'Can students book 1-on-1 mentorship sessions for free?',
      a: 'Yes! All alumni mentorship on the institutional portal is volunteer-based. The mentorship booking system uses transactional database locking to ensure conflict-free bookings without double-booking or scheduling clashes.',
    },
    {
      q: 'What does the AI Resume ATS Scanner check?',
      a: 'The ATS scanner performs a 4-pillar audit: ATS readiness score (0-100), structure and contact integrity checks, missing keyword radar matched against target job descriptions, and automated STAR-method bullet rewrites with strong action verbs.',
    },
    {
      q: 'Can alumni post job opportunities and provide referrals?',
      a: 'Yes. Verified alumni can post full-time openings and internships directly to the Jobs Board. Students can generate customized, professional referral pitches tailored to the job and alumnus using our Smart Referral Generator.',
    },
  ]

  return (
    <div className="space-y-24 pb-20">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-[#C4A878]/15 via-[#244B3A]/5 to-transparent blur-3xl pointer-events-none -z-10" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-4xl mx-auto space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-[#C4A878] text-[#244B3A] text-xs font-bold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#C4A878]" />
              <span>Official Institutional Alumni & Student Career Ecosystem</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-black text-[#333333] tracking-tight leading-[1.12]">
              Where Academic Heritage Meets{' '}
              <span className="text-[#244B3A] relative inline-block">
                Industry Excellence
                <svg
                  className="absolute -bottom-2 left-0 w-full text-[#C4A878]"
                  viewBox="0 0 300 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M3 9C70 3 230 3 297 9"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-[#555555] max-w-3xl mx-auto leading-relaxed">
              Connect with verified alumni leaders at Google, Stripe, Microsoft, and Amazon. Book conflict-free 1-on-1 mentorship, audit your resume against top ATS standards, and secure career opportunities powered by transparent AI matching.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                to="/register"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-[#244B3A] hover:bg-[#1B382B] text-white font-bold rounded-xl shadow-md transition text-sm cursor-pointer"
              >
                <span>Join the Network</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/alumni"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white hover:bg-[#FAF8F5] text-[#333333] font-bold rounded-xl border border-[#D8D2C4] shadow-xs transition text-sm"
              >
                <Search className="w-4 h-4 text-[#244B3A]" />
                <span>Explore Alumni Directory</span>
              </Link>
              <Link
                to="/resume-scanner"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#C4A878]/25 hover:bg-[#C4A878]/35 text-[#244B3A] font-bold rounded-xl border border-[#C4A878]/60 transition text-sm"
              >
                <Sparkles className="w-4 h-4 text-[#244B3A]" />
                <span>Try AI Resume ATS</span>
              </Link>
            </div>

            {/* Trust Pill */}
            <div className="pt-4 flex items-center justify-center gap-3 text-xs text-[#777777]">
              <span className="flex items-center gap-1 font-semibold text-[#244B3A]">
                <ShieldCheck className="w-4 h-4 text-[#244B3A]" /> Admin-Verified Alumni
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-[#244B3A]">
                <Lock className="w-3.5 h-3.5 text-[#244B3A]" /> Atomic Concurrency Booking
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-[#244B3A]">
                <Zap className="w-3.5 h-3.5 text-[#C4A878]" /> Explainable scikit-learn AI
              </span>
            </div>
          </div>

          {/* 2. LIVE METRICS STRIP */}
          <div className="mt-14 max-w-5xl mx-auto bg-white rounded-2xl border border-[#E5E0D5] p-6 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-[#EFECE6]">
              <div className="space-y-1 pt-3 md:pt-0">
                <p className="text-3xl font-black text-[#244B3A]">5,400+</p>
                <p className="text-xs font-semibold text-[#666666] uppercase tracking-wider">
                  Verified Alumni
                </p>
                <p className="text-[11px] text-[#888888]">Across 32+ Global Tech Hubs</p>
              </div>
              <div className="space-y-1 pt-3 md:pt-0">
                <p className="text-3xl font-black text-[#244B3A]">1,250+</p>
                <p className="text-xs font-semibold text-[#666666] uppercase tracking-wider">
                  Mentorship Sessions
                </p>
                <p className="text-[11px] text-[#888888]">Zero double-booking conflicts</p>
              </div>
              <div className="space-y-1 pt-3 md:pt-0">
                <p className="text-3xl font-black text-[#8B6B3E]">94.8%</p>
                <p className="text-xs font-semibold text-[#666666] uppercase tracking-wider">
                  AI Match Accuracy
                </p>
                <p className="text-[11px] text-[#888888]">TF-IDF semantic cosine similarity</p>
              </div>
              <div className="space-y-1 pt-3 md:pt-0">
                <p className="text-3xl font-black text-[#244B3A]">₹19.4 LPA</p>
                <p className="text-xs font-semibold text-[#666666] uppercase tracking-wider">
                  Average Package
                </p>
                <p className="text-[11px] text-[#888888]">Top tier campus & alumni hiring</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE FEATURE SHOWCASE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="text-xs font-bold text-[#244B3A] uppercase tracking-wider">
            Comprehensive Platform Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#333333] tracking-tight mt-1">
            Engineered for Academic & Career Growth
          </h2>
          <p className="text-[#666666] text-sm mt-2">
            Explore the four pillars connecting university students with alumni industry professionals.
          </p>
        </div>

        {/* Feature Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 max-w-3xl mx-auto mb-8 bg-[#EFECE6] p-1.5 rounded-2xl border border-[#E5E0D5]">
          <button
            onClick={() => setActiveFeatureTab('ai-suite')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeFeatureTab === 'ai-suite'
                ? 'bg-[#244B3A] text-white shadow-xs'
                : 'text-[#555555] hover:text-[#244B3A]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-[#C4A878]" />
            <span>AI Career Suite</span>
          </button>
          <button
            onClick={() => setActiveFeatureTab('mentorship')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeFeatureTab === 'mentorship'
                ? 'bg-[#244B3A] text-white shadow-xs'
                : 'text-[#555555] hover:text-[#244B3A]'
            }`}
          >
            <Calendar className="w-4 h-4 text-[#C4A878]" />
            <span>1-on-1 Mentorship</span>
          </button>
          <button
            onClick={() => setActiveFeatureTab('directory')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeFeatureTab === 'directory'
                ? 'bg-[#244B3A] text-white shadow-xs'
                : 'text-[#555555] hover:text-[#244B3A]'
            }`}
          >
            <Users className="w-4 h-4 text-[#C4A878]" />
            <span>Alumni Directory</span>
          </button>
          <button
            onClick={() => setActiveFeatureTab('jobs')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeFeatureTab === 'jobs'
                ? 'bg-[#244B3A] text-white shadow-xs'
                : 'text-[#555555] hover:text-[#244B3A]'
            }`}
          >
            <Briefcase className="w-4 h-4 text-[#C4A878]" />
            <span>Jobs & Referrals</span>
          </button>
        </div>

        {/* Feature Tab Content Display */}
        <div className="bg-white rounded-3xl border border-[#E5E0D5] p-6 sm:p-10 shadow-sm max-w-5xl mx-auto">
          {activeFeatureTab === 'ai-suite' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#244B3A]/10 text-[#244B3A] text-xs font-bold border border-[#244B3A]/20">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Next-Gen Machine Learning</span>
                </div>
                <h3 className="text-2xl font-black text-[#333333]">
                  AI Career Intelligence & ATS Audit
                </h3>
                <p className="text-sm text-[#555555] leading-relaxed">
                  Eliminate guesswork from your job search. Our content-based algorithms evaluate your academic trajectory, extract competencies from your resume, predict 5-year salary milestones, and run mock technical interviews with instant feedback.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E0D5]">
                    <p className="text-xs font-bold text-[#244B3A]">Deep ATS Radar</p>
                    <p className="text-[11px] text-[#666666] mt-0.5">Missing skill radar and STAR bullet optimization</p>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E0D5]">
                    <p className="text-xs font-bold text-[#244B3A]">Salary Predictor</p>
                    <p className="text-[11px] text-[#666666] mt-0.5">Role compensation & milestone progression</p>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E0D5]">
                    <p className="text-xs font-bold text-[#244B3A]">Interview Simulator</p>
                    <p className="text-[11px] text-[#666666] mt-0.5">Domain technical Q&A with keyword scoring</p>
                  </div>
                  <div className="p-3 bg-[#FAF8F5] rounded-xl border border-[#E5E0D5]">
                    <p className="text-xs font-bold text-[#244B3A]">Referral Pitcher</p>
                    <p className="text-[11px] text-[#666666] mt-0.5">Personalized alumni cold-outreach pitches</p>
                  </div>
                </div>
                <div className="pt-2 flex gap-3">
                  <Link
                    to="/resume-scanner"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#244B3A] hover:bg-[#1B382B] text-white rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    <span>Launch ATS Scanner</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to="/career-predictor"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#C4A878]/25 hover:bg-[#C4A878]/35 text-[#244B3A] rounded-xl text-xs font-bold border border-[#C4A878]/50 transition"
                  >
                    <span>Predict Compensation</span>
                  </Link>
                </div>
              </div>

              {/* Visual Card Preview */}
              <div className="bg-[#FAF8F5] rounded-2xl border border-[#E5E0D5] p-6 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-[#E5E0D5] pb-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#244B3A]" />
                    <span className="text-xs font-bold text-[#333333]">ATS Compatibility Snapshot</span>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-[#244B3A] text-white">
                    88/100 Score
                  </span>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-[#555555]">
                    <span>Target: Senior Cloud Engineer at Stripe</span>
                    <span className="font-bold text-[#244B3A]">Tier 1 Match</span>
                  </div>
                  <div className="w-full bg-[#E5E0D5] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#244B3A] h-full rounded-full w-[88%]" />
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#E5E0D5] text-[11px] space-y-1">
                  <p className="font-bold text-[#244B3A] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> STAR Bullet Recommended Rewrite:
                  </p>
                  <p className="text-[#555555] italic">
                    "Architected high-throughput microservices using Go and Kafka, cutting transaction latency by 38% for 2M daily users."
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'mentorship' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#244B3A]/10 text-[#244B3A] text-xs font-bold border border-[#244B3A]/20">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>Transactional Scheduling</span>
                </div>
                <h3 className="text-2xl font-black text-[#333333]">
                  Atomic 1-on-1 Mentorship Booking
                </h3>
                <p className="text-sm text-[#555555] leading-relaxed">
                  Connect directly with alumni in your dream companies. Our booking engine uses database-level row locking to eliminate double-booking bugs, automatically manages calendar status workflows, and delivers meeting links directly.
                </p>
                <ul className="text-xs text-[#555555] space-y-2.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#244B3A]" /> Conflict-free interval checking and automatic cancellation handling
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#244B3A]" /> Direct student booking requests with custom agenda notes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#244B3A]" /> Integrated meeting links and post-session rating system
                  </li>
                </ul>
                <div className="pt-2">
                  <Link
                    to="/mentorship"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#244B3A] hover:bg-[#1B382B] text-white rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    <span>Browse Available Mentors</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Visual Card Preview */}
              <div className="bg-[#FAF8F5] rounded-2xl border border-[#E5E0D5] p-6 space-y-3.5 shadow-xs">
                <div className="flex items-center justify-between pb-2 border-b border-[#E5E0D5]">
                  <span className="text-xs font-bold text-[#333333]">Confirmed Mentorship Slot</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                    Confirmed
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#244B3A] text-white font-bold flex items-center justify-center text-sm">
                    P
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#333333]">Priya Sharma (Google)</h4>
                    <p className="text-[11px] text-[#777777]">System Design & Distributed Cloud Prep</p>
                  </div>
                </div>
                <div className="p-3 bg-white rounded-xl border border-[#E5E0D5] text-xs space-y-1">
                  <p className="text-[#555555]">
                    <strong>Date & Time:</strong> Thursday, 5:00 PM – 5:45 PM IST
                  </p>
                  <p className="text-[#555555]">
                    <strong>Meeting URL:</strong> <span className="text-[#244B3A] underline font-medium">meet.google.com/alm-ptq-wxy</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'directory' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#244B3A]/10 text-[#244B3A] text-xs font-bold border border-[#244B3A]/20">
                  <Users className="w-3.5 h-3.5" />
                  <span>Verified Network</span>
                </div>
                <h3 className="text-2xl font-black text-[#333333]">
                  Granular Alumni Search & Filtering
                </h3>
                <p className="text-sm text-[#555555] leading-relaxed">
                  Search through thousands of verified graduates by company, industry, degree specialization, graduation batch, or technical expertise. Directly view verified badges, track career journeys, and initiate conversations.
                </p>
                <div className="flex flex-wrap gap-2 text-xs">
                  <span className="px-2.5 py-1 bg-[#FAF8F5] border border-[#E5E0D5] rounded-lg text-[#333333] font-semibold">
                    Google
                  </span>
                  <span className="px-2.5 py-1 bg-[#FAF8F5] border border-[#E5E0D5] rounded-lg text-[#333333] font-semibold">
                    Amazon
                  </span>
                  <span className="px-2.5 py-1 bg-[#FAF8F5] border border-[#E5E0D5] rounded-lg text-[#333333] font-semibold">
                    Microsoft
                  </span>
                  <span className="px-2.5 py-1 bg-[#FAF8F5] border border-[#E5E0D5] rounded-lg text-[#333333] font-semibold">
                    Stripe
                  </span>
                  <span className="px-2.5 py-1 bg-[#FAF8F5] border border-[#E5E0D5] rounded-lg text-[#333333] font-semibold">
                    Meta
                  </span>
                </div>
                <div className="pt-2">
                  <Link
                    to="/alumni"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#244B3A] hover:bg-[#1B382B] text-white rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    <span>Search Alumni Directory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Visual Card Preview */}
              <div className="bg-[#FAF8F5] rounded-2xl border border-[#E5E0D5] p-6 space-y-3 shadow-xs">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#3A5F50] text-white font-bold flex items-center justify-center text-lg border border-[#C4A878]">
                    R
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="font-bold text-[#333333]">Rohit Verma</h4>
                      <ShieldCheck className="w-4 h-4 text-[#244B3A]" />
                    </div>
                    <p className="text-xs text-[#777777]">Staff Engineer at Stripe • Class of 2018</p>
                  </div>
                </div>
                <p className="text-xs text-[#555555] leading-relaxed">
                  Leading payment infrastructure reliability, high-throughput microservices, and system architecture mentoring.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] bg-white border border-[#E5E0D5] text-[#244B3A] px-2 py-0.5 rounded font-bold">
                    Java
                  </span>
                  <span className="text-[10px] bg-white border border-[#E5E0D5] text-[#244B3A] px-2 py-0.5 rounded font-bold">
                    Spring Boot
                  </span>
                  <span className="text-[10px] bg-white border border-[#E5E0D5] text-[#244B3A] px-2 py-0.5 rounded font-bold">
                    Fintech
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeFeatureTab === 'jobs' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div className="space-y-5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#244B3A]/10 text-[#244B3A] text-xs font-bold border border-[#244B3A]/20">
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>Curated Opportunities</span>
                </div>
                <h3 className="text-2xl font-black text-[#333333]">
                  Alumni-Referred Jobs & Internships
                </h3>
                <p className="text-sm text-[#555555] leading-relaxed">
                  Skip the black hole of generic job boards. Explore exclusive openings posted directly by working alumni, review matching requirements against your coursework, and request direct internal employee referrals.
                </p>
                <ul className="text-xs text-[#555555] space-y-2.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#244B3A]" /> Direct referral outreach generator tailored to hiring alumni
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#244B3A]" /> Transparent skill gap radar comparing job criteria with your profile
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#244B3A]" /> Verified internal recruiter and engineering contacts
                  </li>
                </ul>
                <div className="pt-2">
                  <Link
                    to="/jobs"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#244B3A] hover:bg-[#1B382B] text-white rounded-xl text-xs font-bold shadow-xs transition"
                  >
                    <span>Browse Active Jobs</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Visual Card Preview */}
              <div className="bg-[#FAF8F5] rounded-2xl border border-[#E5E0D5] p-6 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#C4A878]/25 text-[#244B3A] border border-[#C4A878]/40">
                    Alumni Referral Available
                  </span>
                  <span className="text-[11px] text-[#777777]">Full-Time • Bengaluru</span>
                </div>
                <h4 className="text-sm font-bold text-[#333333]">Backend Platform Engineer</h4>
                <p className="text-xs text-[#555555]">
                  Google Cloud Infrastructure • Posted by Priya Sharma (Alumni '20)
                </p>
                <div className="p-3 bg-white rounded-xl border border-[#E5E0D5] text-xs space-y-1">
                  <span className="text-[#244B3A] font-bold">96% Skill Compatibility:</span>
                  <p className="text-[11px] text-[#666666]">
                    You match 4 out of 5 required skills: Python, Kubernetes, REST APIs, Microservices.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 4. INTERACTIVE CAREER ESTIMATOR & ROLE BENCHMARK */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#244B3A] via-[#2D5845] to-[#1C3B2E] rounded-3xl p-6 sm:p-10 text-white shadow-md border border-[#244B3A]/30">
          <div className="max-w-3xl space-y-2 mb-8">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#C4A878] text-xs font-bold border border-[#C4A878]/30">
              <Compass className="w-3.5 h-3.5" />
              <span>Interactive Career Intelligence Benchmark</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Explore Target Roles & Alumni Salary Milestones
            </h2>
            <p className="text-xs sm:text-sm text-[#F5F1E8]/85 leading-relaxed">
              Select a specialized domain below to inspect verified alumni hiring data, expected market compensation, and high-impact resume recommendations.
            </p>
          </div>

          {/* Interactive Role Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
            {careerRoles.map((role, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedRoleIndex(idx)}
                className={`p-3.5 rounded-2xl text-left transition border ${
                  selectedRoleIndex === idx
                    ? 'bg-white text-[#244B3A] border-white shadow-sm'
                    : 'bg-white/10 text-white border-white/20 hover:bg-white/15'
                }`}
              >
                <p className="text-xs font-bold line-clamp-1">{role.title}</p>
                <p className={`text-[11px] mt-0.5 ${selectedRoleIndex === idx ? 'text-[#666666]' : 'text-[#F5F1E8]/70'}`}>
                  {role.domain}
                </p>
              </button>
            ))}
          </div>

          {/* Selected Role Detailed Card */}
          <div className="bg-white rounded-2xl p-6 text-[#333333] shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-[#8B6B3E] uppercase tracking-wider">
                Benchmark Details
              </span>
              <h3 className="text-xl font-black text-[#244B3A]">
                {careerRoles[selectedRoleIndex].title}
              </h3>
              <p className="text-xs text-[#666666]">
                Verified against {careerRoles[selectedRoleIndex].alumniCount} active graduates.
              </p>
              <div className="pt-2">
                <p className="text-xs text-[#777777]">Predicted 0-3 Year CTC Range:</p>
                <p className="text-2xl font-black text-[#244B3A]">
                  {careerRoles[selectedRoleIndex].avgSalary}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="text-xs font-bold text-[#333333] mb-1.5">Core Required Competencies:</p>
                <div className="flex flex-wrap gap-1.5">
                  {careerRoles[selectedRoleIndex].skills.map((s, i) => (
                    <span
                      key={i}
                      className="text-[11px] px-2.5 py-0.5 rounded-md bg-[#FAF8F5] text-[#244B3A] font-bold border border-[#E5E0D5]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-[#333333] mb-1">Top Alumni Employers:</p>
                <p className="text-xs text-[#555555]">
                  {careerRoles[selectedRoleIndex].topCompanies.join(', ')}
                </p>
              </div>
            </div>

            <div className="bg-[#FAF8F5] p-4 rounded-xl border border-[#E5E0D5] space-y-3 flex flex-col justify-between h-full">
              <div>
                <p className="text-xs font-bold text-[#244B3A] flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#C4A878]" /> ATS Recommendation Tip:
                </p>
                <p className="text-xs text-[#555555] leading-relaxed">
                  {careerRoles[selectedRoleIndex].atsTip}
                </p>
              </div>
              <Link
                to="/resume-scanner"
                className="w-full text-center py-2 bg-[#244B3A] hover:bg-[#1B382B] text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Scan Resume for This Role →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 5. HOW IT WORKS (3 SIMPLE STEPS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#244B3A] uppercase tracking-wider">
            Clear Progression
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#333333] tracking-tight mt-1">
            How Alumni Connect Works
          </h2>
          <p className="text-[#666666] text-sm mt-2">
            A seamless bridge from undergraduate coursework to verified industry roles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Step 1 */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E0D5] shadow-xs relative space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#244B3A] text-white font-black flex items-center justify-center text-sm">
              01
            </div>
            <h3 className="text-base font-bold text-[#333333]">Verify & Setup Profile</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              Register using your academic email. Students input course specializations and skills; alumni undergo university degree verification.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E0D5] shadow-xs relative space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#C4A878] text-[#244B3A] font-black flex items-center justify-center text-sm">
              02
            </div>
            <h3 className="text-base font-bold text-[#333333]">Discover & Match</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              Our explainable scikit-learn matching engine ranks alumni mentors and jobs with transparent cosine similarity and Jaccard overlap rationale.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-2xl p-6 border border-[#E5E0D5] shadow-xs relative space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#244B3A] text-white font-black flex items-center justify-center text-sm">
              03
            </div>
            <h3 className="text-base font-bold text-[#333333]">Connect & Excel</h3>
            <p className="text-xs text-[#555555] leading-relaxed">
              Book 1-on-1 calendar slots with atomic concurrency locks, run mock technical interview simulations, and generate personalized referral pitches.
            </p>
          </div>
        </div>
      </section>

      {/* 6. ALUMNI WALL OF FAME & TESTIMONIALS */}
      <section className="bg-[#FAF8F5] py-16 border-y border-[#E5E0D5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-10 gap-4">
            <div>
              <span className="text-xs font-bold text-[#244B3A] uppercase tracking-wider">
                Alumni Wall of Fame
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#333333] tracking-tight mt-1">
                Mentors Shaping Global Technology
              </h2>
            </div>
            <Link
              to="/alumni"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#244B3A] hover:underline"
            >
              <span>View all 5,400+ graduates</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Mentor 1 */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5E0D5] shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#244B3A] text-white font-bold flex items-center justify-center text-lg border border-[#C4A878]">
                  P
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-[#333333] text-sm">Priya Sharma</h4>
                    <ShieldCheck className="w-4 h-4 text-[#244B3A]" />
                  </div>
                  <p className="text-xs text-[#666666]">Senior SWE at Google • CSE '20</p>
                </div>
              </div>
              <p className="text-xs text-[#555555] leading-relaxed">
                "I've conducted over 35 mock interview sessions through this portal. The students here have incredible foundational grasp, and 4 of my mentees have successfully joined Google!"
              </p>
              <div className="flex items-center gap-1 text-[#8B6B3E] text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-[#C4A878] text-[#C4A878]" />
                <Star className="w-3.5 h-3.5 fill-[#C4A878] text-[#C4A878]" />
                <Star className="w-3.5 h-3.5 fill-[#C4A878] text-[#C4A878]" />
                <Star className="w-3.5 h-3.5 fill-[#C4A878] text-[#C4A878]" />
                <Star className="w-3.5 h-3.5 fill-[#C4A878] text-[#C4A878]" />
                <span className="ml-1 text-[#555555]">(4.9/5 from 38 reviews)</span>
              </div>
            </div>

            {/* Mentor 2 */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5E0D5] shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#3A5F50] text-white font-bold flex items-center justify-center text-lg border border-[#C4A878]">
                  R
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-[#333333] text-sm">Rohit Verma</h4>
                    <ShieldCheck className="w-4 h-4 text-[#244B3A]" />
                  </div>
                  <p className="text-xs text-[#666666]">Staff Engineer at Stripe • CSE '18</p>
                </div>
              </div>
              <p className="text-xs text-[#555555] leading-relaxed">
                "The transactional booking calendar makes it effortless to offer slots around my work schedule without worrying about email back-and-forth or double-bookings."
              </p>
              <div className="flex items-center gap-1 text-[#8B6B3E] text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-[#C4A878] text-[#C4A878]" />
                <Star className="w-3.5 h-3.5 fill-[#C4A878] text-[#C4A878]" />
                <Star className="w-3.5 h-3.5 fill-[#C4A878] text-[#C4A878]" />
                <Star className="w-3.5 h-3.5 fill-[#C4A878] text-[#C4A878]" />
                <Star className="w-3.5 h-3.5 fill-[#C4A878] text-[#C4A878]" />
                <span className="ml-1 text-[#555555]">(5.0/5 from 42 reviews)</span>
              </div>
            </div>

            {/* Mentor 3 */}
            <div className="bg-white rounded-2xl p-6 border border-[#E5E0D5] shadow-xs space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#244B3A] text-white font-bold flex items-center justify-center text-lg border border-[#C4A878]">
                  A
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-[#333333] text-sm">Ananya Sen</h4>
                    <ShieldCheck className="w-4 h-4 text-[#244B3A]" />
                  </div>
                  <p className="text-xs text-[#666666]">Applied Scientist at Amazon • IT '21</p>
                </div>
              </div>
              <p className="text-xs text-[#555555] leading-relaxed">
                "Giving back to our university has never been this rewarding. Reviewing student ML portfolios and providing feedback on real industry problems is seamless here."
              </p>
              <div className="flex items-center gap-1 text-[#8B6B3E] text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-[#C4A878] text-[#C4A878]" />
                <Star className="w-3.5 h-3.5 fill-[#C4A878] text-[#C4A878]" />
                <Star className="w-3.5 h-3.5 fill-[#C4A878] text-[#C4A878]" />
                <Star className="w-3.5 h-3.5 fill-[#C4A878] text-[#C4A878]" />
                <Star className="w-3.5 h-3.5 fill-[#C4A878] text-[#C4A878]" />
                <span className="ml-1 text-[#555555]">(4.9/5 from 29 reviews)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FREQUENTLY ASKED QUESTIONS ACCORDION */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <span className="text-xs font-bold text-[#244B3A] uppercase tracking-wider">
            Clarifications
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-[#333333] tracking-tight mt-1">
            Frequently Asked Questions
          </h2>
          <p className="text-xs text-[#777777] mt-1">
            Everything you need to know about the portal's features and verification process.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaqIndex === idx
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-[#E5E0D5] overflow-hidden shadow-xs transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm text-[#333333] hover:text-[#244B3A] transition"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-[#244B3A] shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-[#777777] shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-[#555555] leading-relaxed border-t border-[#EFECE6] pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {/* 8. CALL TO ACTION BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-r from-[#244B3A] via-[#2F5A47] to-[#1C3B2E] rounded-3xl p-8 sm:p-14 text-white relative overflow-hidden shadow-md border border-[#244B3A]/30 text-center sm:text-left">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-[#C4A878] text-xs font-bold border border-[#C4A878]/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Get Started in 60 Seconds</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white">
              Ready to Accelerate Your Career Trajectory?
            </h2>
            <p className="text-[#F5F1E8]/90 text-sm leading-relaxed">
              Join thousands of students and alumni. Unlock verified mentors, exclusive internal job referrals, and instant AI resume feedback today.
            </p>
            <div className="pt-3 flex flex-wrap gap-3 justify-center sm:justify-start">
              <Link
                to="/register"
                className="px-6 py-3 bg-[#C4A878] hover:bg-[#B39767] text-[#244B3A] font-extrabold rounded-xl transition text-xs shadow-sm"
              >
                Create Student Account
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl border border-white/20 transition text-xs"
              >
                Sign In with Demo Accounts
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
export default LandingPage
