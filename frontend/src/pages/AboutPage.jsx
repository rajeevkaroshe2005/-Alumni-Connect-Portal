import React from 'react'
import { GraduationCap, ShieldCheck, Database, Cpu, Lock, CheckCircle2 } from 'lucide-react'

export const AboutPage = () => {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          About Alumni Connect Portal
        </h1>
        <p className="text-slate-600 text-sm leading-relaxed">
          An AI-powered academic and career advancement ecosystem designed to unite students, alumni, and institutional leaders.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Project Context & Academic Objective</h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Educational institutions frequently struggle with disconnected alumni databases, lost career networking opportunities, and lack of structured mentorship channels. 
          The <strong>Alumni Connect Portal</strong> delivers a centralized, production-ready platform featuring:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <ShieldCheck className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-slate-800">Verified Alumni Network</h4>
              <p className="text-xs text-slate-600 mt-1">Multi-step administrative verification prevents fraudulent job postings and impersonation.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <Cpu className="w-5 h-5 text-violet-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-slate-800">Explainable AI Matchmaking</h4>
              <p className="text-xs text-slate-600 mt-1">Scikit-learn TF-IDF and Cosine Similarity models rank mentors and jobs with transparent justifications.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <Lock className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-slate-800">Transactional Integrity</h4>
              <p className="text-xs text-slate-600 mt-1">Concurrency-safe calendar locks prevent double-booking conflicts across overlapping sessions.</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80">
            <Database className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
            <div>
              <h4 className="font-bold text-sm text-slate-800">Auditability & Moderation</h4>
              <p className="text-xs text-slate-600 mt-1">Immutable audit logging ensures administrative accountability and student protection.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
