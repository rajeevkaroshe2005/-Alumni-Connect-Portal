import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, FileText, Upload, CheckCircle2, XCircle, 
  ArrowRight, Briefcase, UserCheck, Layers, BookOpen, 
  Code, Award, AlertCircle, RefreshCw, ChevronRight, Zap
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
      const res = await api.post('/ai/parse-resume', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-gray-200 dark:border-gray-800 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            AI Career Assistant & Recommendations
          </h1>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-2xl">
            Content-based recommendation algorithms matching your academic profile and skills with alumni mentors, curated jobs, and automated resume skill-gap roadmaps.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-xl self-start">
          <button
            onClick={() => setActiveTab('recommendations')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'recommendations'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Recommendations
          </button>
          <button
            onClick={() => setActiveTab('resume')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition ${
              activeTab === 'resume'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
            }`}
          >
            Resume Parser & Skill Gap
          </button>
        </div>
      </div>

      {/* Model Transparency Note */}
      <div className="mt-4 p-3.5 bg-blue-50/70 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl flex items-start gap-3">
        <Zap className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <p className="text-xs text-blue-800 dark:text-blue-300 leading-relaxed">
          <strong>Explainable AI Matching Architecture:</strong> Our engine utilizes scikit-learn TF-IDF vectorization and cosine similarity combined with Jaccard skill overlap to deliver verifiable match scores without black-box bias.
        </p>
      </div>

      {/* TAB 1: RECOMMENDATIONS */}
      {activeTab === 'recommendations' && (
        <div className="mt-8 space-y-12">
          {/* Recommended Mentors Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  Recommended Alumni Mentors
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Ranked by domain alignment, technical skill overlap, and verified industry background.
                </p>
              </div>
              <Link
                to="/mentorship"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Browse all mentors <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loadingRecommendations ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-64" />
                ))}
              </div>
            ) : recommendedMentors.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-500">
                No matching mentors found. Make sure your profile skills are updated!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedMentors.map((m) => (
                  <div
                    key={m.mentor_id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-between hover:shadow-lg transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
                          {Math.round(m.match_score * 100)}% Match
                        </span>
                        <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                          {m.company || 'Alumni Mentor'}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 dark:text-white text-base">
                        {m.name}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-1">
                        {m.job_title} • {m.experience_years}y exp
                      </p>

                      {/* Matching Skills */}
                      {m.matching_skills && m.matching_skills.length > 0 && (
                        <div className="mt-3">
                          <p className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 mb-1">
                            Shared Strengths:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {m.matching_skills.slice(0, 4).map((sk, idx) => (
                              <span
                                key={idx}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 font-medium"
                              >
                                {sk}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Reasons */}
                      {m.reasons && m.reasons.length > 0 && (
                        <ul className="mt-3 space-y-1 text-[11px] text-gray-600 dark:text-gray-300">
                          {m.reasons.slice(0, 2).map((r, i) => (
                            <li key={i} className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                              <span className="truncate">{r}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <Link
                        to={`/mentorship`}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Book Session
                      </Link>
                      <Link
                        to={`/messages?partner=${m.mentor_id}`}
                        className="text-xs px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium transition"
                      >
                        Message
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Recommended Jobs Section */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  Recommended Career Opportunities
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Filtered and prioritized based on required qualifications and student department profile.
                </p>
              </div>
              <Link
                to="/jobs"
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
              >
                Browse all jobs <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loadingRecommendations ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 h-64" />
                ))}
              </div>
            ) : recommendedJobs.length === 0 ? (
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 text-xs text-gray-500">
                No job recommendations available at this time.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedJobs.map((j) => (
                  <div
                    key={j.job_id}
                    className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 flex flex-col justify-between hover:shadow-lg transition"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-[11px] px-2.5 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300">
                          {Math.round(j.match_score * 100)}% Match
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {j.job_type}
                        </span>
                      </div>

                      <h3 className="font-bold text-gray-900 dark:text-white text-base">
                        {j.title}
                      </h3>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        {j.company} • {j.location}
                      </p>

                      {j.reasons && (
                        <div className="mt-3 space-y-1 text-[11px] text-gray-600 dark:text-gray-300">
                          {j.reasons.map((r, i) => (
                            <p key={i} className="flex items-center gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                              <span className="truncate">{r}</span>
                            </p>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between">
                      <Link
                        to={`/jobs/${j.job_id}`}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        View & Apply <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB 2: RESUME PARSER & SKILL GAP ROADMAP */}
      {activeTab === 'resume' && (
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Upload & Skill Configuration */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Upload Resume (PDF or TXT)
              </h2>

              <label className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-blue-500 transition">
                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                  {resumeFile ? resumeFile.name : 'Choose a file or drag & drop'}
                </span>
                <span className="text-[11px] text-gray-400 mt-1">
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
                <div className="text-xs text-blue-600 dark:text-blue-400 flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  Parsing resume skills securely in-memory...
                </div>
              )}

              {/* Extracted Skills List */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Recognized Skills ({extractedSkills.length})
                </label>
                <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600">
                  {extractedSkills.length === 0 ? (
                    <span className="text-xs text-gray-400">No skills parsed yet. Upload resume or add below.</span>
                  ) : (
                    extractedSkills.map((sk) => (
                      <span
                        key={sk}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 font-medium"
                      >
                        {sk}
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(sk)}
                          className="hover:text-red-500"
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>

                {/* Add Custom Skill */}
                <form onSubmit={handleAddSkill} className="mt-2 flex gap-2">
                  <input
                    type="text"
                    placeholder="Add custom skill..."
                    value={newSkillInput}
                    onChange={(e) => setNewSkillInput(e.target.value)}
                    className="flex-1 px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  />
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold"
                  >
                    Add
                  </button>
                </form>
              </div>

              {/* Select Target Job */}
              <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
                  Target Job Position
                </label>
                <select
                  value={selectedJobId}
                  onChange={(e) => setSelectedJobId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  {jobsList.map((j) => (
                    <option key={j.id} value={j.id}>
                      {j.title} at {j.company}
                    </option>
                  ))}
                </select>
              </div>

              {gapError && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 text-red-700 dark:text-red-300 rounded-lg text-xs">
                  {gapError}
                </div>
              )}

              <button
                onClick={handleRunAnalysis}
                disabled={analyzingGap}
                className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl text-xs shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {analyzingGap ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Gap...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Run Skill-Gap Analysis
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Analysis Results & 4-Phase Roadmap */}
          <div className="lg:col-span-2 space-y-6">
            {!analysisResult ? (
              <div className="h-full min-h-[400px] flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-400">
                <Layers className="w-16 h-16 stroke-1 text-gray-300 dark:text-gray-600 mb-3" />
                <h3 className="text-base font-bold text-gray-700 dark:text-gray-300">
                  Ready to Assess Your Preparedness
                </h3>
                <p className="text-xs max-w-md mt-1">
                  Upload your resume on the left, pick a target role from our active database, and click "Run Skill-Gap Analysis" to receive a tailored step-by-step career roadmap.
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Score Card Banner */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Role Compatibility Match
                    </span>
                    <h3 className="text-2xl font-black text-gray-900 dark:text-white mt-1">
                      {analysisResult.target_job_title}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Evaluated against {analysisResult.required_skills_count} required competencies.
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-20 h-20 rounded-full border-4 border-blue-600 dark:border-blue-500 flex flex-col items-center justify-center font-black text-xl text-blue-600 dark:text-blue-400">
                      {Math.round(analysisResult.match_score * 100)}%
                      <span className="text-[10px] font-normal text-gray-500">Score</span>
                    </div>
                  </div>
                </div>

                {/* Matched vs Missing Skills Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Matched */}
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      Acquired Match Skills ({analysisResult.matched_skills?.length || 0})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.matched_skills?.length > 0 ? (
                        analysisResult.matched_skills.map((s) => (
                          <span
                            key={s}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 font-medium"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400">No direct overlap identified.</span>
                      )}
                    </div>
                  </div>

                  {/* Missing */}
                  <div className="bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 rounded-xl p-4">
                    <h4 className="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5 mb-2">
                      <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                      Priority Skill Gaps ({analysisResult.missing_skills?.length || 0})
                    </h4>
                    <div className="flex flex-wrap gap-1.5">
                      {analysisResult.missing_skills?.length > 0 ? (
                        analysisResult.missing_skills.map((s) => (
                          <span
                            key={s}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300 font-medium"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-emerald-600 font-medium">All prerequisite skills satisfied!</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* 4-Phase Roadmap */}
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                      <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      Tailored 4-Phase Career Roadmap
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Step-by-step curriculum to close skill gaps and build a portfolio for this exact role.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {analysisResult.career_roadmap?.map((phase, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-700/30"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wide">
                            {phase.phase}
                          </h4>
                          <span className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                            {phase.timeline}
                          </span>
                        </div>

                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
                          {phase.title}
                        </p>

                        <div className="space-y-1">
                          {phase.actions?.map((act, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-300">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
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
      )}
    </div>
  );
}
