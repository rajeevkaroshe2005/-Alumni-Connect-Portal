import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, FileText, Upload, CheckCircle2, XCircle, 
  ArrowRight, Briefcase, UserCheck, Layers, BookOpen, 
  Code, Award, AlertCircle, RefreshCw, ChevronRight, Zap,
  ExternalLink, Search
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function AICareerAssistantPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('recommendations'); // 'recommendations' | 'resume'

  // Tab 1: Recommendations State
  const [recommendedMentors, setRecommendedMentors] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(true);
  const [recError, setRecError] = useState('');

  // Tab 2: Resume & Skill Gap State
  const [jobsList, setJobsList] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [resumeFile, setResumeFile] = useState(null);
  const [parsingResume, setParsingResume] = useState(false);
  const [extractedSkills, setExtractedSkills] = useState([]);
  const [newSkillInput, setNewSkillInput] = useState('');
  const [analyzingGap, setAnalyzingGap] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [gapError, setGapError] = useState('');

  // 1. Fetch AI recommendations
  const fetchRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      setRecError('');

      if (user?.role === 'STUDENT') {
        const [resMentors, resJobs] = await Promise.all([
          api.get('/ai/recommended-mentors?limit=6'),
          api.get('/ai/recommended-jobs?limit=6')
        ]);

        if (resMentors?.success) {
          setRecommendedMentors(resMentors.data?.recommendations || []);
        }
        if (resJobs?.success) {
          setRecommendedJobs(resJobs.data?.recommendations || []);
        }
      }
    } catch (err) {
      setRecError(err.message || 'Failed to generate recommendations.');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // 2. Fetch available jobs for selector
  const fetchJobs = async () => {
    try {
      const res = await api.get('/jobs?per_page=50');
      if (res?.success) {
        const list = res.data?.jobs || [];
        setJobsList(list);
        if (list.length > 0 && !selectedJobId) {
          setSelectedJobId(list[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching jobs for selector:', err);
    }
  };

  useEffect(() => {
    if (user?.role === 'STUDENT') {
      fetchRecommendations();
    }
    fetchJobs();
  }, [user]);

  // Handle Resume File Upload & Parsing
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setResumeFile(file);
    setGapError('');
    setParsingResume(true);

    const formData = new FormData();
    formData.append('resume', file);

    try {
      const res = await api.post('/ai/parse-resume', formData);
      if (res?.success) {
        const skills = res.data?.extracted_skills || [];
        setExtractedSkills(skills);
      }
    } catch (err) {
      setGapError(err.message || 'Failed to parse resume file.');
    } finally {
      setParsingResume(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    const clean = newSkillInput.trim();
    if (clean && !extractedSkills.some((s) => s.toLowerCase() === clean.toLowerCase())) {
      setExtractedSkills([...extractedSkills, clean]);
      setNewSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setExtractedSkills(extractedSkills.filter((s) => s !== skillToRemove));
  };

  // Run Skill Gap Analysis
  const handleRunAnalysis = async () => {
    if (!selectedJobId) {
      setGapError('Please select a target job position.');
      return;
    }

    try {
      setAnalyzingGap(true);
      setGapError('');
      const res = await api.post('/ai/skill-gap-analysis', {
        job_id: parseInt(selectedJobId, 10),
        skills: extractedSkills
      });

      if (res?.success) {
        setAnalysisResult(res.data?.analysis);
      }
    } catch (err) {
      setGapError(err.message || 'Failed to evaluate skill gap.');
    } finally {
      setAnalyzingGap(false);
    }
  };

  const getMatchScoreDisplay = (item) => {
    if (item.match_percentage !== undefined && item.match_percentage !== null) {
      return item.match_percentage;
    }
    if (item.match_score !== undefined && item.match_score !== null) {
      return item.match_score > 1 ? Math.round(item.match_score) : Math.round(item.match_score * 100);
    }
    if (item.recommendation_score !== undefined && item.recommendation_score !== null) {
      return Math.round(item.recommendation_score);
    }
    return 0;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-[#E5E0D5] gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#244B3A]/10 text-[#244B3A] text-xs font-bold mb-2 border border-[#244B3A]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#244B3A]" />
            <span>AI Career Intelligence Suite</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#333333] tracking-tight">
            AI Recommendations & Career Matcher
          </h1>
          <p className="mt-1 text-sm text-[#666666] max-w-2xl leading-relaxed">
            Content-based recommendation algorithms matching your academic profile and skills with alumni mentors, curated jobs, and automated resume skill-gap roadmaps.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-[#EFECE6] p-1.5 rounded-2xl border border-[#E5E0D5] self-start sm:self-auto shrink-0 shadow-xs">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'recommendations'
                ? 'bg-[#244B3A] text-white shadow-xs'
                : 'text-[#555555] hover:text-[#244B3A]'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Recommendations</span>
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'resume'
                ? 'bg-[#244B3A] text-white shadow-xs'
                : 'text-[#555555] hover:text-[#244B3A]'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Resume & Skill Gap</span>
          </button>
        </div>
      </div>

      {/* Model Transparency Note */}
      <div className="p-4 bg-white border border-[#C4A878]/40 rounded-2xl flex items-start gap-3 shadow-xs">
        <div className="w-7 h-7 rounded-lg bg-[#C4A878]/20 text-[#244B3A] flex items-center justify-center shrink-0 mt-0.5">
          <Zap className="w-4 h-4 text-[#244B3A]" />
        </div>
        <p className="text-xs text-[#444444] leading-relaxed">
          <strong className="text-[#244B3A] font-bold">Explainable AI Matching Engine:</strong> Our models utilize scikit-learn N-gram TF-IDF vectorization, domain semantic synonym normalization, and Jaccard competency overlap to deliver transparent match scores without black-box bias.
        </p>
      </div>

      {/* TAB 1: RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="space-y-10">
          {/* Recommended Mentors Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#333333] flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-[#244B3A]" />
                  Recommended Alumni Mentors
                </h2>
                <p className="text-xs text-[#777777]">
                  Ranked by domain alignment, technical skill overlap, and verified industry background.
                </p>
              </div>
              <Link
                to="/mentorship"
                className="text-xs font-bold text-[#244B3A] hover:text-[#1B382B] hover:underline flex items-center gap-1"
              >
                <span>Browse all mentors</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loadingRecommendations ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-white p-6 rounded-2xl border border-[#E5E0D5] h-56" />
                ))}
              </div>
            ) : recommendedMentors.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-[#E5E0D5] text-xs text-[#666666] shadow-xs">
                No matching mentors found. Make sure your profile skills are updated!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedMentors.map((m) => {
                  const match = getMatchScoreDisplay(m);
                  return (
                    <div
                      key={m.mentor_id || m.id}
                      className="bg-white rounded-2xl border border-[#E5E0D5] hover:border-[#244B3A]/40 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#244B3A]/10 text-[#244B3A] border border-[#244B3A]/20">
                            {match}% Match
                          </span>
                          <span className="text-xs font-semibold text-[#8B6B3E]">
                            {m.company || 'Alumni Mentor'}
                          </span>
                        </div>

                        <h3 className="font-bold text-[#333333] text-base">
                          {m.name || m.mentor_name}
                        </h3>
                        <p className="text-xs text-[#666666] mt-0.5 line-clamp-1">
                          {m.job_title || m.headline} {m.experience_years ? `• ${m.experience_years}y exp` : ''}
                        </p>

                        {/* Matching Skills */}
                        {m.matching_skills && m.matching_skills.length > 0 && (
                          <div className="mt-3">
                            <p className="text-[11px] font-bold text-[#777777] mb-1">
                              Shared Strengths:
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {m.matching_skills.slice(0, 4).map((sk, idx) => (
                                <span
                                  key={idx}
                                  className="text-[10px] px-2 py-0.5 rounded-md bg-[#F5F1E8] text-[#244B3A] font-semibold border border-[#E5E0D5]"
                                >
                                  {sk}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Reasons */}
                        {m.reasons && m.reasons.length > 0 && (
                          <ul className="mt-3 space-y-1 text-[11px] text-[#555555]">
                            {m.reasons.slice(0, 2).map((r, i) => (
                              <li key={i} className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#244B3A] shrink-0" />
                                <span className="truncate">{r}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#EFECE6] flex items-center justify-between gap-3">
                        <Link
                          to={`/alumni/${m.user_id || m.mentor_id}`}
                          className="text-xs font-bold text-[#244B3A] hover:underline"
                        >
                          View Profile
                        </Link>
                        <Link
                          to={`/mentorship`}
                          className="text-xs px-3.5 py-1.5 rounded-xl bg-[#244B3A] hover:bg-[#1B382B] text-white font-bold transition shadow-xs"
                        >
                          Book Session
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Recommended Jobs Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-[#333333] flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-[#244B3A]" />
                  Recommended Career Opportunities
                </h2>
                <p className="text-xs text-[#777777]">
                  Filtered and prioritized based on required qualifications and student department profile.
                </p>
              </div>
              <Link
                to="/jobs"
                className="text-xs font-bold text-[#244B3A] hover:text-[#1B382B] hover:underline flex items-center gap-1"
              >
                <span>Browse all jobs</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loadingRecommendations ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-white p-6 rounded-2xl border border-[#E5E0D5] h-56" />
                ))}
              </div>
            ) : recommendedJobs.length === 0 ? (
              <div className="text-center py-10 bg-white rounded-2xl border border-[#E5E0D5] text-xs text-[#666666] shadow-xs">
                No job recommendations available at this time.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedJobs.map((j) => {
                  const match = getMatchScoreDisplay(j);
                  return (
                    <div
                      key={j.job_id || j.id}
                      className="bg-white rounded-2xl border border-[#E5E0D5] hover:border-[#244B3A]/40 p-6 flex flex-col justify-between shadow-xs hover:shadow-md transition"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-[#C4A878]/25 text-[#244B3A] border border-[#C4A878]/40">
                            {match}% Match
                          </span>
                          <span className="text-[11px] font-semibold text-[#777777] bg-[#F5F1E8] px-2 py-0.5 rounded">
                            {j.job_type ? j.job_type.replace('_', ' ') : 'Full Time'}
                          </span>
                        </div>

                        <h3 className="font-bold text-[#333333] text-base">
                          {j.title}
                        </h3>
                        <p className="text-xs text-[#666666] mt-0.5">
                          <span className="font-semibold text-[#333333]">{j.company}</span> • {j.location}
                        </p>

                        {j.reasons && (
                          <div className="mt-3 space-y-1 text-[11px] text-[#555555]">
                            {j.reasons.map((r, i) => (
                              <p key={i} className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-[#244B3A] shrink-0" />
                                <span className="truncate">{r}</span>
                              </p>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="mt-6 pt-4 border-t border-[#EFECE6] flex items-center justify-between">
                        <Link
                          to={`/jobs/${j.job_id || j.id}`}
                          className="text-xs font-bold text-[#244B3A] hover:underline inline-flex items-center gap-1"
                        >
                          <span>View & Apply</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 2: RESUME PARSER & SKILL GAP ROADMAP */}
      {activeTab === 'resume' && (
        <div className="space-y-6">
          {/* Banner: Deep ATS Scanner Callout */}
          <div className="p-4 bg-gradient-to-r from-[#244B3A] to-[#1F3E30] rounded-2xl text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C4A878]" />
                <h3 className="text-sm font-bold text-white">Looking for Full Resume ATS Audit & STAR Rewrites?</h3>
              </div>
              <p className="text-xs text-[#F5F1E8]/85 max-w-2xl">
                Check our new Deep ATS Resume Scanner for instant ATS scoring, bullet action-verb audits, and keyword gap analysis.
              </p>
            </div>
            <Link
              to="/resume-scanner"
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#C4A878] hover:bg-[#B39767] text-[#244B3A] font-bold rounded-xl text-xs shrink-0 transition"
            >
              <span>Open ATS Scanner</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column: Upload & Skill Configuration */}
            <div className="space-y-6">
              <div className="bg-white rounded-2xl p-6 border border-[#E5E0D5] shadow-xs space-y-4">
                <h2 className="text-base font-bold text-[#333333] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-[#244B3A]" />
                  Upload Resume (PDF or TXT)
                </h2>

                <label className="border-2 border-dashed border-[#D8D2C4] hover:border-[#244B3A] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition bg-[#FAF8F5]">
                  <Upload className="w-8 h-8 text-[#888888] mb-2" />
                  <span className="text-xs font-bold text-[#333333]">
                    {resumeFile ? resumeFile.name : 'Choose a file or drag & drop'}
                  </span>
                  <span className="text-[11px] text-[#777777] mt-1">
                    Supported formats: .pdf, .txt (max 5MB)
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.txt"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </label>

                {parsingResume && (
                  <div className="text-xs text-[#244B3A] flex items-center gap-2 font-medium">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Parsing resume competencies securely in-memory...
                  </div>
                )}

                {/* Extracted Skills List */}
                <div className="pt-2">
                  <label className="block text-xs font-bold text-[#333333] mb-2">
                    Recognized Skills ({extractedSkills.length})
                  </label>
                  <div className="flex flex-wrap gap-1.5 min-h-[44px] p-2.5 bg-[#FAF8F5] rounded-xl border border-[#E5E0D5]">
                    {extractedSkills.length === 0 ? (
                      <span className="text-xs text-[#888888]">No skills parsed yet. Upload resume or add below.</span>
                    ) : (
                      extractedSkills.map((sk) => (
                        <span
                          key={sk}
                          className="inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg bg-[#244B3A]/10 text-[#244B3A] font-semibold border border-[#244B3A]/20"
                        >
                          {sk}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(sk)}
                            className="hover:text-rose-600 font-bold ml-0.5"
                          >
                            ×
                          </button>
                        </span>
                      ))
                    )}
                  </div>

                  {/* Add Custom Skill */}
                  <form onSubmit={handleAddSkill} className="mt-2.5 flex gap-2">
                    <input
                      type="text"
                      placeholder="Add custom skill (e.g. Docker, PyTorch)..."
                      value={newSkillInput}
                      onChange={(e) => setNewSkillInput(e.target.value)}
                      className="flex-1 px-3 py-2 text-xs bg-white border border-[#D8D2C4] rounded-xl text-[#333333] focus:outline-none focus:border-[#244B3A]"
                    />
                    <button
                      type="submit"
                      className="px-3.5 py-2 bg-[#244B3A] hover:bg-[#1B382B] text-white rounded-xl text-xs font-bold transition shadow-xs"
                    >
                      Add
                    </button>
                  </form>
                </div>

                {/* Select Target Job */}
                <div className="pt-2 border-t border-[#EFECE6]">
                  <label className="block text-xs font-bold text-[#333333] mb-2">
                    Target Job Position
                  </label>
                  <select
                    value={selectedJobId}
                    onChange={(e) => setSelectedJobId(e.target.value)}
                    className="w-full px-3 py-2.5 text-xs bg-white border border-[#D8D2C4] rounded-xl text-[#333333] focus:outline-none focus:border-[#244B3A]"
                  >
                    {jobsList.map((j) => (
                      <option key={j.id} value={j.id}>
                        {j.title} at {j.company}
                      </option>
                    ))}
                  </select>
                </div>

                {gapError && (
                  <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs font-medium">
                    {gapError}
                  </div>
                )}

                <button
                  onClick={handleRunAnalysis}
                  disabled={analyzingGap}
                  className="w-full py-3 bg-[#244B3A] hover:bg-[#1B382B] text-white font-bold rounded-xl text-xs shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {analyzingGap ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Gap...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-[#C4A878]" /> Run Skill-Gap Analysis
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Right Column: Analysis Results & 4-Phase Roadmap */}
            <div className="lg:col-span-2 space-y-6">
              {!analysisResult ? (
                <div className="h-full min-h-[380px] flex flex-col items-center justify-center bg-white rounded-2xl border border-[#E5E0D5] p-8 text-center text-[#777777] shadow-xs">
                  <div className="w-16 h-16 rounded-full bg-[#FAF8F5] border border-[#E5E0D5] flex items-center justify-center mb-3 text-[#244B3A]">
                    <Layers className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-[#333333]">
                    Ready to Assess Your Preparedness
                  </h3>
                  <p className="text-xs max-w-md mt-1 text-[#666666] leading-relaxed">
                    Upload your resume on the left, pick a target role from our active database, and click "Run Skill-Gap Analysis" to receive a tailored step-by-step career roadmap.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Score Card Banner */}
                  <div className="bg-white rounded-2xl p-6 border border-[#E5E0D5] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <span className="text-xs font-bold text-[#8B6B3E] uppercase tracking-wider">
                        Role Compatibility Match
                      </span>
                      <h3 className="text-2xl font-black text-[#333333] mt-1">
                        {analysisResult.target_job_title || analysisResult.job_title}
                      </h3>
                      <p className="text-xs text-[#666666] mt-0.5">
                        {analysisResult.company ? `At ${analysisResult.company} • ` : ''}
                        Evaluated against {analysisResult.required_skills_count || ((analysisResult.matched_skills?.length || 0) + (analysisResult.missing_skills?.length || 0))} required competencies.
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="w-20 h-20 rounded-full border-4 border-[#244B3A] bg-[#FAF8F5] flex flex-col items-center justify-center font-black text-xl text-[#244B3A] shadow-xs">
                        {Math.round(analysisResult.match_percentage || (analysisResult.match_score > 1 ? analysisResult.match_score : analysisResult.match_score * 100) || 0)}%
                        <span className="text-[10px] font-bold text-[#777777] uppercase tracking-wider">Score</span>
                      </div>
                    </div>
                  </div>

                  {/* Matched vs Missing Skills Breakdown */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Matched */}
                    <div className="bg-[#FAF8F5] border border-[#244B3A]/20 rounded-2xl p-5 shadow-xs">
                      <h4 className="text-xs font-bold text-[#244B3A] flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-4 h-4 text-[#244B3A]" />
                        Acquired Match Skills ({analysisResult.matched_skills?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.matched_skills?.length > 0 ? (
                          analysisResult.matched_skills.map((s) => (
                            <span
                              key={s}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-[#244B3A]/10 text-[#244B3A] font-semibold border border-[#244B3A]/20"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#888888]">No direct overlap identified.</span>
                        )}
                      </div>
                    </div>

                    {/* Missing */}
                    <div className="bg-[#FFF8F8] border border-rose-200 rounded-2xl p-5 shadow-xs">
                      <h4 className="text-xs font-bold text-rose-800 flex items-center gap-1.5 mb-2">
                        <XCircle className="w-4 h-4 text-rose-600" />
                        Priority Skill Gaps ({analysisResult.missing_skills?.length || 0})
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {analysisResult.missing_skills?.length > 0 ? (
                          analysisResult.missing_skills.map((s) => (
                            <span
                              key={s}
                              className="text-[11px] px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-semibold border border-rose-200"
                            >
                              {s}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-[#244B3A] font-bold">All prerequisite skills satisfied!</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4-Phase Roadmap */}
                  <div className="bg-white rounded-2xl p-6 border border-[#E5E0D5] shadow-xs space-y-6">
                    <div>
                      <h3 className="text-base font-bold text-[#333333] flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#244B3A]" />
                        Tailored 4-Phase Career Roadmap
                      </h3>
                      <p className="text-xs text-[#777777]">
                        Step-by-step curriculum to close skill gaps and build a portfolio for this exact role.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {(analysisResult.career_roadmap || analysisResult.roadmap || []).map((phase, idx) => (
                        <div
                          key={idx}
                          className="p-4 rounded-xl border border-[#E5E0D5] bg-[#FAF8F5]"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="text-xs font-bold text-[#244B3A] uppercase tracking-wide">
                              {phase.phase}
                            </h4>
                            <span className="text-[11px] text-[#888888] font-bold">
                              {phase.timeline || `Phase ${idx + 1}`}
                            </span>
                          </div>

                          <p className="text-sm font-bold text-[#333333] mb-2">
                            {phase.title || phase.focus}
                          </p>

                          <div className="space-y-1.5">
                            {phase.actions?.map((act, i) => (
                              <div key={i} className="flex items-start gap-2 text-xs text-[#555555]">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#244B3A] mt-1.5 shrink-0" />
                                <span>{act}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}