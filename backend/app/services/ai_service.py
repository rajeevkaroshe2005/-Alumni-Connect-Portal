import re
import io
from typing import List, Dict, Any, Optional
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pypdf
from ..models import User, MentorProfile, Job, Profile, StudentDetail, AlumniDetail


class AIService:
    """
    AI Recommendation & Career Intelligence Engine.
    Implements content-based filtering via TF-IDF, Cosine Similarity,
    skill-overlap analysis, resume extraction, and career roadmap generation.
    """

    TECH_SKILLS_TAXONOMY = {
        'python', 'javascript', 'typescript', 'react', 'react.js', 'vue', 'angular', 'node', 'node.js',
        'express', 'flask', 'django', 'fastapi', 'java', 'spring', 'spring boot', 'c++', 'c#', '.net',
        'mysql', 'postgresql', 'mongodb', 'redis', 'sqlite', 'docker', 'kubernetes', 'aws', 'azure',
        'gcp', 'git', 'github', 'ci/cd', 'linux', 'html', 'css', 'tailwind', 'bootstrap', 'graphql',
        'rest api', 'machine learning', 'deep learning', 'nlp', 'scikit-learn', 'tensorflow', 'pytorch',
        'pandas', 'numpy', 'data analysis', 'sql', 'cybersecurity', 'cloud computing', 'microservices',
        'agile', 'scrum', 'system design', 'data structures', 'algorithms', 'devops', 'unit testing'
    }

    @staticmethod
    def _clean_text(text: Optional[str]) -> str:
        """Normalize text by lowercasing and stripping non-alphanumeric noise."""
        if not text:
            return ""
        return re.sub(r'\s+', ' ', str(text).lower().strip())

    @staticmethod
    def _extract_skills_from_text(text: str) -> List[str]:
        """Extract recognized professional skills from text based on taxonomy and token matching."""
        cleaned = AIService._clean_text(text)
        found = set()
        for skill in AIService.TECH_SKILLS_TAXONOMY:
            pattern = r'\b' + re.escape(skill) + r'\b'
            if re.search(pattern, cleaned):
                found.add(skill.title())
        return sorted(list(found))

    @classmethod
    def recommend_mentors_for_student(cls, student_user: User, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Content-based mentor recommendation matching student goals/skills
        against mentor expertise using TF-IDF and Cosine Similarity.
        """
        student_profile = student_user.profile
        student_detail = student_user.student_detail

        student_skills = set(s.lower() for s in (student_profile.get_skills_list() if student_profile else []))
        student_interests = set(i.lower() for i in (student_detail.get_interests_list() if student_detail else []))
        student_dept = student_detail.department if student_detail else ""

        combined_student_query = " ".join([
            " ".join(student_skills),
            " ".join(student_interests),
            student_dept or "",
            (student_profile.headline or "") if student_profile else "",
            (student_profile.bio or "") if student_profile else "",
        ]).strip()

        # Query available mentors
        available_mentors = MentorProfile.query.filter_by(is_available=True).all()
        if not available_mentors:
            return []

        mentor_records = []
        mentor_docs = []

        for m in available_mentors:
            m_user = m.user
            if not m_user or not m_user.is_active:
                continue

            m_profile = m_user.profile
            m_alumni = m_user.alumni_detail

            mentor_skills = set(e.lower() for e in m.get_expertise_list())
            if m_profile and m_profile.skills:
                mentor_skills.update(s.lower() for s in m_profile.get_skills_list())

            doc = " ".join([
                " ".join(mentor_skills),
                m.bio or "",
                m_alumni.current_company if m_alumni else "",
                m_alumni.department if m_alumni else "",
                m_profile.headline if m_profile else "",
            ]).strip()

            mentor_records.append({
                'mentor_profile': m,
                'user': m_user,
                'skills': mentor_skills,
                'doc': doc,
            })
            mentor_docs.append(doc)

        if not mentor_records:
            return []

        # Build TF-IDF Matrix
        all_docs = [combined_student_query] + mentor_docs
        tfidf = TfidfVectorizer(stop_words='english', min_df=1)
        try:
            tfidf_matrix = tfidf.fit_transform(all_docs)
            student_vec = tfidf_matrix[0:1]
            mentor_vecs = tfidf_matrix[1:]
            cos_similarities = cosine_similarity(student_vec, mentor_vecs)[0]
        except Exception:
            cos_similarities = np.zeros(len(mentor_records))

        results = []
        for idx, rec in enumerate(mentor_records):
            cos_sim = float(cos_similarities[idx])
            m_skills = rec['skills']

            # Direct skill overlap
            common_skills = sorted(list(student_skills.intersection(m_skills)))
            skill_overlap_ratio = len(common_skills) / max(len(student_skills | m_skills), 1)

            # Combined content-based similarity score (0.0 to 1.0 -> scaled to percentage 0-100)
            composite_score = round((0.6 * cos_sim + 0.4 * skill_overlap_ratio) * 100, 1)

            # Reason generation
            reasons = []
            if common_skills:
                reasons.append(f"Shared expertise in: {', '.join([s.title() for s in common_skills[:3]])}")
            if rec['mentor_profile'].user.alumni_detail and student_dept:
                if rec['mentor_profile'].user.alumni_detail.department.lower() == student_dept.lower():
                    reasons.append(f"Same department: {student_dept}")
            if not reasons:
                reasons.append("Relevant professional background and industry mentorship availability")

            m_dict = rec['mentor_profile'].to_dict()
            m_dict['recommendation_score'] = composite_score
            m_dict['match_percentage'] = min(max(int(composite_score), 20), 98)
            m_dict['matched_skills'] = [s.title() for s in common_skills]
            m_dict['reasons'] = reasons

            results.append(m_dict)

        # Sort descending by recommendation score
        results.sort(key=lambda x: x['recommendation_score'], reverse=True)
        return results[:limit]

    @classmethod
    def recommend_jobs_for_student(cls, student_user: User, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Rank job opportunities for student based on student skills and background.
        """
        student_profile = student_user.profile
        student_detail = student_user.student_detail

        student_skills = set(s.lower() for s in (student_profile.get_skills_list() if student_profile else []))
        student_interests = set(i.lower() for i in (student_detail.get_interests_list() if student_detail else []))

        student_query = " ".join([
            " ".join(student_skills),
            " ".join(student_interests),
            (student_profile.headline or "") if student_profile else "",
            (student_detail.department or "") if student_detail else "",
        ]).strip()

        active_jobs = Job.query.filter_by(is_active=True, moderation_status='APPROVED').all()
        if not active_jobs:
            return []

        job_docs = []
        job_records = []

        for job in active_jobs:
            req_skills = set(s.lower() for s in job.get_skills_list())
            doc = " ".join([
                job.title,
                job.company,
                " ".join(req_skills),
                job.description,
            ])
            job_records.append({
                'job': job,
                'req_skills': req_skills,
                'doc': doc,
            })
            job_docs.append(doc)

        all_docs = [student_query] + job_docs
        tfidf = TfidfVectorizer(stop_words='english', min_df=1)
        try:
            tfidf_matrix = tfidf.fit_transform(all_docs)
            student_vec = tfidf_matrix[0:1]
            job_vecs = tfidf_matrix[1:]
            cos_similarities = cosine_similarity(student_vec, job_vecs)[0]
        except Exception:
            cos_similarities = np.zeros(len(job_records))

        results = []
        for idx, rec in enumerate(job_records):
            cos_sim = float(cos_similarities[idx])
            job_skills = rec['req_skills']

            matched = sorted(list(student_skills.intersection(job_skills)))
            missing = sorted(list(job_skills - student_skills))

            overlap_ratio = len(matched) / max(len(job_skills), 1)
            score = round((0.55 * cos_sim + 0.45 * overlap_ratio) * 100, 1)

            reasons = []
            if matched:
                reasons.append(f"You have {len(matched)} matching skill(s): {', '.join([m.title() for m in matched[:3]])}")
            if overlap_ratio >= 0.5:
                reasons.append("High skill coverage for requirements")
            if not reasons:
                reasons.append("Matches your degree track and foundational background")

            j_dict = rec['job'].to_dict()
            j_dict['match_score'] = score
            j_dict['match_percentage'] = min(max(int(score), 15), 99)
            j_dict['matched_skills'] = [m.title() for m in matched]
            j_dict['missing_skills'] = [m.title() for m in missing]
            j_dict['reasons'] = reasons

            results.append(j_dict)

        results.sort(key=lambda x: x['match_score'], reverse=True)
        return results[:limit]

    @classmethod
    def parse_resume(cls, file_bytes: bytes, filename: str) -> Dict[str, Any]:
        """Extract text from uploaded PDF or text resume with security type checks."""
        extracted_text = ""
        filename_lower = filename.lower()

        if filename_lower.endswith('.pdf'):
            try:
                reader = pypdf.PdfReader(io.BytesIO(file_bytes))
                for page in reader.pages:
                    txt = page.extract_text()
                    if txt:
                        extracted_text += txt + "\n"
            except Exception as e:
                raise ValueError(f"Failed to read PDF file contents: {str(e)}")

        elif filename_lower.endswith('.txt'):
            try:
                extracted_text = file_bytes.decode('utf-8', errors='ignore')
            except Exception as e:
                raise ValueError(f"Failed to decode text file: {str(e)}")
        else:
            raise ValueError("Unsupported resume format. Please upload a .pdf or .txt file.")

        extracted_skills = cls._extract_skills_from_text(extracted_text)

        # Basic experience year detector heuristics
        exp_match = re.findall(r'(\d+)\+?\s*(?:years?|yrs?)\s*(?:of)?\s*experience', extracted_text, re.IGNORECASE)
        detected_experience_years = max([int(x) for x in exp_match]) if exp_match else None

        return {
            'text_length': len(extracted_text),
            'extracted_skills': extracted_skills,
            'detected_experience_years': detected_experience_years,
            'summary_snippet': extracted_text[:400].strip() if extracted_text else "",
        }

    @classmethod
    def compare_resume_with_job(cls, extracted_skills: List[str], job: Job) -> Dict[str, Any]:
        """
        Compare candidate skills against job requirements, calculate match index,
        identify skill gaps, and provide a 4-phase career roadmap.
        """
        candidate_skills = set(s.lower() for s in extracted_skills)
        job_skills = set(s.lower() for s in job.get_skills_list())

        matched_skills = sorted(list(candidate_skills.intersection(job_skills)))
        missing_skills = sorted(list(job_skills - candidate_skills))

        match_ratio = len(matched_skills) / max(len(job_skills), 1)
        match_percentage = round(match_ratio * 100, 1)

        # Generate rule-based actionable Career Roadmap
        roadmap = [
            {
                'phase': 'Phase 1: Skill Gap Remediation',
                'focus': f"Bridge missing required competencies: {', '.join([s.title() for s in missing_skills[:4]]) if missing_skills else 'Advanced domain specializations'}",
                'actions': [
                    f"Complete targeted documentation tutorials or practical mini-courses in {missing_skills[0].title()}." if missing_skills else "Review system architecture patterns.",
                    "Build a working proof-of-concept demonstrating practical usage of these concepts.",
                ],
            },
            {
                'phase': 'Phase 2: Project Portfolio & Evidence',
                'focus': 'Showcase practical application for prospective employers',
                'actions': [
                    f"Implement an end-to-end project integrating {matched_skills[0].title() if matched_skills else 'fullstack development'} with the required tech stack.",
                    "Push code to GitHub with clean documentation, tests, and a deployed demo link.",
                ],
            },
            {
                'phase': 'Phase 3: Alumni Mentorship & Network Outreach',
                'focus': 'Connect with alumni working in target roles',
                'actions': [
                    f"Book a 1-on-1 mentorship session with alumni in {job.company} or similar industries.",
                    "Request a mock technical resume critique and advice on specific interview rounds.",
                ],
            },
            {
                'phase': 'Phase 4: Interview Preparation & Application',
                'focus': 'Tailored interview readiness',
                'actions': [
                    "Prepare STAR method behavioral responses addressing real project challenges.",
                    f"Submit your updated portfolio application for {job.title}.",
                ],
            },
        ]

        return {
            'job_id': job.id,
            'job_title': job.title,
            'company': job.company,
            'match_percentage': match_percentage,
            'matched_skills': [s.title() for s in matched_skills],
            'missing_skills': [s.title() for s in missing_skills],
            'gap_severity': 'Low' if match_percentage >= 70 else ('Moderate' if match_percentage >= 40 else 'High'),
            'roadmap': roadmap,
        }
