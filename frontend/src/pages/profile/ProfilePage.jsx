import React, { useState, useEffect } from 'react';
import { 
  User, Mail, Briefcase, GraduationCap, MapPin, 
  Phone, Globe, Code, Shield, CheckCircle, 
  AlertCircle, Save, Plus, X 
} from 'lucide-react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ProfilePage() {
  const { user, login } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Base Profile State
  const [baseProfile, setBaseProfile] = useState({
    first_name: '',
    last_name: '',
    headline: '',
    bio: '',
    avatar_url: '',
    phone: '',
    location: '',
    linkedin_url: '',
    github_url: '',
    portfolio_url: '',
    skills: []
  });

  const [skillInput, setSkillInput] = useState('');

  // Student Detail State
  const [studentDetail, setStudentDetail] = useState({
    roll_number: '',
    current_year: 4,
    degree: 'B.Tech',
    department: 'Computer Science & Engineering',
    expected_graduation_year: 2026,
    cgpa: 8.8,
    interests: ''
  });

  // Alumni Detail State
  const [alumniDetail, setAlumniDetail] = useState({
    graduation_year: 2022,
    degree: 'B.Tech',
    department: 'Computer Science & Engineering',
    current_company: '',
    current_position: '',
    industry: 'Software & Technology',
    verification_status: 'PENDING',
    verification_document_url: ''
  });

  // Fetch full user profile
  const fetchProfile = async () => {
    if (!user?.id) return;
    try {
      setLoading(true);
      const res = await api.get(`/profiles/${user.id}`);
      if (res?.success) {
        const u = res.data?.user;
        const p = u.profile || {};
        setBaseProfile({
          first_name: p.first_name || '',
          last_name: p.last_name || '',
          headline: p.headline || '',
          bio: p.bio || '',
          avatar_url: p.avatar_url || '',
          phone: p.phone || '',
          location: p.location || '',
          linkedin_url: p.linkedin_url || '',
          github_url: p.github_url || '',
          portfolio_url: p.portfolio_url || '',
          skills: p.skills ? p.skills.split(',').map((s) => s.trim()).filter(Boolean) : []
        });

        if (u.student_detail) {
          setStudentDetail({
            roll_number: u.student_detail.roll_number || '',
            current_year: u.student_detail.current_year || 4,
            degree: u.student_detail.degree || 'B.Tech',
            department: u.student_detail.department || 'CSE',
            expected_graduation_year: u.student_detail.expected_graduation_year || 2026,
            cgpa: u.student_detail.cgpa || 8.5,
            interests: u.student_detail.interests || ''
          });
        }

        if (u.alumni_detail) {
          setAlumniDetail({
            graduation_year: u.alumni_detail.graduation_year || 2022,
            degree: u.alumni_detail.degree || 'B.Tech',
            department: u.alumni_detail.department || 'CSE',
            current_company: u.alumni_detail.current_company || '',
            current_position: u.alumni_detail.current_position || '',
            industry: u.alumni_detail.industry || 'Software',
            verification_status: u.alumni_detail.verification_status || 'PENDING',
            verification_document_url: u.alumni_detail.verification_document_url || ''
          });
        }
      }
    } catch (err) {
      setErrorMessage(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user?.id]);

  const handleAddSkill = (e) => {
    e.preventDefault();
    const clean = skillInput.trim();
    if (clean && !baseProfile.skills.includes(clean)) {
      setBaseProfile({
        ...baseProfile,
        skills: [...baseProfile.skills, clean]
      });
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setBaseProfile({
      ...baseProfile,
      skills: baseProfile.skills.filter((s) => s !== skillToRemove)
    });
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // 1. Update base profile
      await api.put('/profiles/me', {
        ...baseProfile,
        skills: baseProfile.skills.join(', ')
      });

      // 2. Update role-specific detail
      if (user?.role === 'STUDENT') {
        await api.put('/profiles/student-details', studentDetail);
      } else if (user?.role === 'ALUMNI') {
        await api.put('/profiles/alumni-details', alumniDetail);
      }

      setSuccessMessage('Your profile changes have been saved successfully.');
      setTimeout(() => setSuccessMessage(''), 5000);
    } catch (err) {
      setErrorMessage(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 animate-pulse space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 w-1/4 rounded" />
        <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="pb-6 border-b border-gray-200 dark:border-gray-800">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
          <User className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          My Profile & Settings
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Manage your verified credentials, technical skills, career summary, and social links.
        </p>
      </div>

      {successMessage && (
        <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl flex items-center gap-2 text-sm font-medium">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-300 rounded-xl flex items-center gap-2 text-sm font-medium">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="mt-6 space-y-8">
        {/* Basic Information Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-700">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              General Information
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                {user?.role}
              </span>
              {user?.role === 'ALUMNI' && (
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                    alumniDetail.verification_status === 'VERIFIED'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                  }`}
                >
                  {alumniDetail.verification_status}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                First Name *
              </label>
              <input
                type="text"
                required
                value={baseProfile.first_name}
                onChange={(e) => setBaseProfile({ ...baseProfile, first_name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Last Name *
              </label>
              <input
                type="text"
                required
                value={baseProfile.last_name}
                onChange={(e) => setBaseProfile({ ...baseProfile, last_name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Professional Headline
            </label>
            <input
              type="text"
              value={baseProfile.headline}
              onChange={(e) => setBaseProfile({ ...baseProfile, headline: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              placeholder="e.g. Senior Cloud Architect at Stripe | Distributed Systems"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Biography & Summary
            </label>
            <textarea
              rows="3"
              value={baseProfile.bio}
              onChange={(e) => setBaseProfile({ ...baseProfile, bio: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
              placeholder="Tell others about your professional journey, technical projects, or areas you mentor in..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Location
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={baseProfile.location}
                  onChange={(e) => setBaseProfile({ ...baseProfile, location: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  placeholder="e.g. Seattle, WA or Bengaluru, India"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Contact Phone
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={baseProfile.phone}
                  onChange={(e) => setBaseProfile({ ...baseProfile, phone: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Skills Section */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            Skills & Competencies
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            These skills power our AI recommendation algorithms to match you with compatible mentors and jobs.
          </p>

          <div className="flex flex-wrap gap-2 min-h-[48px] p-3 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-200 dark:border-gray-600">
            {baseProfile.skills.length === 0 ? (
              <span className="text-xs text-gray-400 italic">No skills added yet. Add one below!</span>
            ) : (
              baseProfile.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-red-500 transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add skill (e.g. Python, React, Kubernetes)..."
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              className="flex-1 px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-lg text-sm font-semibold flex items-center gap-1 transition"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {/* Role-Specific Card: Student */}
        {user?.role === 'STUDENT' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              Academic Credentials
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Roll / Student ID
                </label>
                <input
                  type="text"
                  value={studentDetail.roll_number}
                  onChange={(e) => setStudentDetail({ ...studentDetail, roll_number: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Degree & Program
                </label>
                <input
                  type="text"
                  value={studentDetail.degree}
                  onChange={(e) => setStudentDetail({ ...studentDetail, degree: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Department / Branch
                </label>
                <input
                  type="text"
                  value={studentDetail.department}
                  onChange={(e) => setStudentDetail({ ...studentDetail, department: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Current Year of Study
                </label>
                <select
                  value={studentDetail.current_year}
                  onChange={(e) => setStudentDetail({ ...studentDetail, current_year: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year (Final Year)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Expected Graduation Year
                </label>
                <input
                  type="number"
                  value={studentDetail.expected_graduation_year}
                  onChange={(e) => setStudentDetail({ ...studentDetail, expected_graduation_year: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  CGPA / Percentage
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={studentDetail.cgpa}
                  onChange={(e) => setStudentDetail({ ...studentDetail, cgpa: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Role-Specific Card: Alumni */}
        {user?.role === 'ALUMNI' && (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
            <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Alumni Career Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Current Company / Employer
                </label>
                <input
                  type="text"
                  value={alumniDetail.current_company}
                  onChange={(e) => setAlumniDetail({ ...alumniDetail, current_company: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Current Position / Role
                </label>
                <input
                  type="text"
                  value={alumniDetail.current_position}
                  onChange={(e) => setAlumniDetail({ ...alumniDetail, current_position: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Graduation Year
                </label>
                <input
                  type="number"
                  value={alumniDetail.graduation_year}
                  onChange={(e) => setAlumniDetail({ ...alumniDetail, graduation_year: parseInt(e.target.value, 10) })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Degree
                </label>
                <input
                  type="text"
                  value={alumniDetail.degree}
                  onChange={(e) => setAlumniDetail({ ...alumniDetail, degree: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Industry
                </label>
                <input
                  type="text"
                  value={alumniDetail.industry}
                  onChange={(e) => setAlumniDetail({ ...alumniDetail, industry: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Social Links */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-sm space-y-4">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            Social Profiles & Portfolio
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={baseProfile.linkedin_url}
                  onChange={(e) => setBaseProfile({ ...baseProfile, linkedin_url: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                GitHub Profile URL
              </label>
              <div className="relative">
                <Code className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={baseProfile.github_url}
                  onChange={(e) => setBaseProfile({ ...baseProfile, github_url: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  placeholder="https://github.com/username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Portfolio or Website
              </label>
              <div className="relative">
                <Globe className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                <input
                  type="url"
                  value={baseProfile.portfolio_url}
                  onChange={(e) => setBaseProfile({ ...baseProfile, portfolio_url: e.target.value })}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white"
                  placeholder="https://yourportfolio.dev"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm shadow-md transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {saving ? 'Saving Profile...' : 'Save All Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
