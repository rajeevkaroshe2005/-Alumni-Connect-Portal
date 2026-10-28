import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bot, Sparkles, CheckCircle2, XCircle, ArrowRight, 
  RefreshCw, Award, Code, BookOpen, AlertCircle, ChevronRight,
  ShieldCheck, HelpCircle, Flame
} from 'lucide-react';
import api from '../../services/api';

export default function AIMockInterviewPage() {
  const [domain, setDomain] = useState('FULL_STACK');
  const [questions, setQuestions] = useState([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [studentAnswer, setStudentAnswer] = useState('');
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [evaluating, setEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState(null);
  const [error, setError] = useState('');

  const domains = [
    { id: 'FULL_STACK', label: 'Full-Stack Web Arch', icon: '💻' },
    { id: 'CLOUD_DEVOPS', label: 'Cloud & Distributed DevOps', icon: '☁️' },
    { id: 'AI_ML', label: 'AI & Machine Learning', icon: '🤖' },
    { id: 'SYSTEM_DESIGN', label: 'System Design & Scale', icon: '🏗' },
  ];

  const fetchQuestions = async (selectedDomain) => {
    try {
      setLoadingQuestions(true);
      setError('');
      setEvaluation(null);
      setStudentAnswer('');
      setCurrentIdx(0);

      const res = await api.get(`/ai/interview/questions?domain=${selectedDomain}`);
      if (res?.success) {
        setQuestions(res.data?.questions || []);
      }
    } catch (err) {
      setError(err.message || 'Failed to load interview questions.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  useEffect(() => {
    fetchQuestions(domain);
  }, [domain]);

  const handleEvaluate = async () => {
    if (!studentAnswer.trim() || evaluating) return;
    const currentQ = questions[currentIdx];
    if (!currentQ) return;

    try {
      setEvaluating(true);
      setError('');
      const res = await api.post('/ai/interview/evaluate', {
        question_text: currentQ.question,
        student_answer: studentAnswer.trim(),
        domain: domain,
      });

      if (res?.success) {
        setEvaluation(res.data?.evaluation);
      }
    } catch (err) {
      setError(err.message || 'Failed to evaluate your response.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx(currentIdx + 1);
      setStudentAnswer('');
      setEvaluation(null);
      setError('');
    }
  };

  const currentQ = questions[currentIdx];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-slate-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-100 text-violet-800 text-xs font-bold mb-2">
            <Bot className="w-3.5 h-3.5" />
            AI-Powered Technical Assessment Lab
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            AI Technical Mock Interview Simulator
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-600 max-w-2xl">
            Practice real technical interview questions asked by alumni employers. Receive instant automated evaluation on keyword coverage, depth, and actionable coaching tips.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/ai-referral"
            className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center gap-1"
          >
            <span>AI Referral Generator</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            to="/analytics-hub"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
          >
            Alumni Matrix
          </Link>
        </div>
      </div>

      {/* Domain Selection Tabs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {domains.map((d) => (
          <button
            key={d.id}
            onClick={() => setDomain(d.id)}
            className={`p-3.5 rounded-2xl border text-left transition flex items-center gap-3 ${
              domain === d.id
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/20'
                : 'bg-white hover:bg-slate-50 text-slate-800 border-slate-200'
            }`}
          >
            <span className="text-xl">{d.icon}</span>
            <div>
              <div className="text-xs font-bold">{d.label}</div>
              <div className={`text-[10px] ${domain === d.id ? 'text-indigo-100' : 'text-slate-500'}`}>
                Interactive Q&A
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Main Interview Terminal */}
      {loadingQuestions ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-3">
          <RefreshCw className="w-8 h-8 animate-spin text-indigo-600 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">Loading interview prompts...</p>
        </div>
      ) : !currentQ ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-8 text-center text-slate-500 text-sm">
          No questions found for this domain. Select another category above.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Question & Answer Box (Left Column) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-wider">
                  Question {currentIdx + 1} of {questions.length}
                </span>
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                  currentQ.difficulty === 'Hard'
                    ? 'bg-rose-100 text-rose-800'
                    : currentQ.difficulty === 'Medium'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {currentQ.difficulty} Difficulty
                </span>
              </div>

              <h2 className="text-lg sm:text-xl font-bold text-slate-900 leading-snug">
                {currentQ.question}
              </h2>

              {/* Response Editor */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-slate-700 mb-2">
                  Your Technical Answer / Explanation
                </label>
                <textarea
                  rows="9"
                  value={studentAnswer}
                  onChange={(e) => setStudentAnswer(e.target.value)}
                  placeholder="Type your structured technical answer here. Mention architectural patterns, trade-offs, and implementation details..."
                  className="w-full p-4 bg-slate-50 border border-slate-300 rounded-2xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition leading-relaxed font-mono"
                />
                <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1.5 px-1">
                  <span>Words: {studentAnswer.trim() ? studentAnswer.trim().split(/\s+/).length : 0} (Aim for 80+ words)</span>
                  <span>Supports markdown syntax</span>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={handleEvaluate}
                  disabled={!studentAnswer.trim() || evaluating}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold rounded-xl text-xs shadow-md shadow-indigo-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {evaluating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Evaluating Answer...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Run AI Assessment
                    </>
                  )}
                </button>

                {currentIdx < questions.length - 1 && (
                  <button
                    type="button"
                    onClick={handleNextQuestion}
                    className="w-full sm:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* AI Scorecard & Feedback (Right Column) */}
          <div className="lg:col-span-5 space-y-6">
            {!evaluation ? (
              <div className="h-full min-h-[380px] bg-white rounded-3xl border border-slate-200 p-8 text-center flex flex-col items-center justify-center space-y-3 text-slate-400">
                <Award className="w-14 h-14 stroke-1 text-slate-300" />
                <h3 className="text-base font-bold text-slate-800">Awaiting Your Answer</h3>
                <p className="text-xs text-slate-500 max-w-xs leading-relaxed">
                  Write your answer on the left and submit it to see your technical score, keyword coverage analysis, and canonical benchmark answer.
                </p>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm space-y-6">
                {/* Score Banner */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                      Technical Score
                    </span>
                    <h3 className="text-xl font-black text-slate-900 mt-0.5">
                      {evaluation.performance_tier}
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {evaluation.summary_headline}
                    </p>
                  </div>

                  <div className="w-16 h-16 rounded-full border-4 border-indigo-600 flex flex-col items-center justify-center font-black text-indigo-700 text-lg">
                    {evaluation.overall_score}%
                  </div>
                </div>

                {/* Keyword Analysis */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>Key Concept Coverage</span>
                    <span className="text-indigo-600 font-bold">{evaluation.keyword_coverage_ratio}%</span>
                  </h4>

                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block mb-1">
                        ✓ Mentioned Technical Terms:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {evaluation.matched_keywords?.length > 0 ? (
                          evaluation.matched_keywords.map((kw) => (
                            <span key={kw} className="text-[10px] px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-semibold">
                              {kw}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-slate-400 italic">None detected</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider block mb-1">
                        ⚠ Recommended Missing Terms:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {evaluation.missing_keywords?.slice(0, 5).map((kw) => (
                          <span key={kw} className="text-[10px] px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 font-semibold border border-rose-200">
                            {kw}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Coaching Tips */}
                {evaluation.improvement_tips && (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 text-amber-500" />
                      Actionable Interview Tips:
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-600">
                      {evaluation.improvement_tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Canonical Benchmark Answer */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Benchmark Model Answer:
                  </h4>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed font-sans">
                    {evaluation.model_answer}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
