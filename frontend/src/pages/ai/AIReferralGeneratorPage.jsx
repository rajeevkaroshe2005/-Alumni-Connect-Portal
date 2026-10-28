import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  Send, Sparkles, Copy, Check, MessageSquare, 
  Briefcase, User, Building, ArrowRight, AlertCircle, RefreshCw, ChevronRight 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AIReferralGeneratorPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [alumni, setAlumni] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [selectedAlumnusId, setSelectedAlumnusId] = useState('');
  const [generating, setGenerating] = useState(false);
  const [pitchResult, setPitchResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [loadingInitial, setLoadingInitial] = useState(true);

  const fetchInitialData = async () => {
    try {
      setLoadingInitial(true);
      const [resJobs, resAlumni] = await Promise.all([
        api.get('/jobs?per_page=50'),
        api.get('/alumni?per_page=50'),
      ]);

      if (resJobs?.success) {
        const jList = resJobs.data?.jobs || [];
        setJobs(jList);
        if (jList.length > 0) setSelectedJobId(jList[0].id);
      }

      if (resAlumni?.success) {
        const aList = resAlumni.data?.alumni || [];
        setAlumni(aList);
        if (aList.length > 0) setSelectedAlumnusId(aList[0].id);
      }
    } catch (err) {
      setError(err.message || 'Failed to load options.');
    } finally {
      setLoadingInitial(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const handleGeneratePitch = async (e) => {
    e.preventDefault();
    if (!selectedJobId || !selectedAlumnusId || generating) return;

    try {
      setGenerating(true);
      setError('');
      setCopied(false);

      const res = await api.post('/ai/referral-pitch', {
        job_id: parseInt(selectedJobId, 10),
        alumnus_id: parseInt(selectedAlumnusId, 10),
      });

      if (res?.success) {
        setPitchResult(res.data?.pitch);
      }
    } catch (err) {
      setError(err.message || 'Failed to generate referral pitch.');
    } finally {
      setGenerating(false);
    }
  };

  const handleCopy = () => {
    if (!pitchResult) return;
    const fullText = `Subject: ${pitchResult.subject_line}\n\n${pitchResult.pitch_text}`;
    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendViaChat = async () => {
    if (!pitchResult) return;
    try {
      // Dispatch to chat API directly
      await api.post('/chat/send', {
        recipient_id: pitchResult.target_alumnus_id,
        content: pitchResult.pitch_text,
      });
      // Navigate to chat thread
      navigate(`/messages/${pitchResult.target_alumnus_id}`);
    } catch (err) {
      // Fallback navigate to messages with param
      navigate(`/messages/${pitchResult.target_alumnus_id}`);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-100 text-indigo-800 text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            AI Cold Outreach Automation
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            Smart AI Job Referral Pitch Generator
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
            Never send generic or awkward cold messages. Our AI pairs your project competencies with alumni affiliations to draft compelling, high-converting referral requests in seconds.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/mock-interview"
            className="px-4 py-2 bg-violet-50 hover:bg-violet-100 text-violet-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
          >
            <span>AI Mock Interview</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {loadingInitial ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Loading active opportunities and alumni list...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Configuration Form (Left) */}
          <div className="lg:col-span-5 space-y-6">
            <form onSubmit={handleGeneratePitch} className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-indigo-600" />
                Select Target Opportunity
              </h2>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  1. Target Job Opening *
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id} className="text-slate-900 bg-white">
                      {j.title} — {j.company} ({j.job_type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1.5">
                  2. Choose Alumnus at Target Company / Sector *
                </label>
                <select
                  value={selectedAlumnusId}
                  onChange={(e) => setSelectedAlumnusId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition"
                >
                  {alumni.map((a) => (
                    <option key={a.id} value={a.id} className="text-slate-900 bg-white">
                      {a.name} — {a.current_position || 'Engineer'} at {a.current_company || 'Tech'}
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={generating}
                className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {generating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Generating Personalized Pitch...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Generate Smart Referral Pitch
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Generated Pitch View (Right) */}
          <div className="lg:col-span-7 space-y-6">
            {!pitchResult ? (
              <div className="h-full min-h-[350px] bg-white rounded-3xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center space-y-3 text-slate-400">
                <Send className="w-14 h-14 stroke-1 text-slate-300" />
                <h3 className="text-base font-bold text-slate-800">Your Tailored Pitch Will Appear Here</h3>
                <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                  Select a job and target alumni mentor on the left to generate an authentic referral pitch ready to send via chat or email.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-wider">
                      Generated Referral Pitch
                    </span>
                    <h3 className="text-base font-bold text-slate-900">
                      Target: {pitchResult.target_alumnus_name} ({pitchResult.target_company})
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      {copied ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Text
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Subject Line */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Subject Line
                  </label>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 font-mono">
                    {pitchResult.subject_line}
                  </div>
                </div>

                {/* Message Body */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Message Body (Editable)
                  </label>
                  <textarea
                    rows="11"
                    value={pitchResult.pitch_text}
                    onChange={(e) => setPitchResult({ ...pitchResult, pitch_text: e.target.value })}
                    className="w-full p-3.5 bg-slate-50 border border-slate-300 rounded-xl text-xs text-slate-900 leading-relaxed font-sans focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                {/* Direct Action */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleSendViaChat}
                    className="w-full sm:w-auto px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Send Directly via Portal Chat</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
