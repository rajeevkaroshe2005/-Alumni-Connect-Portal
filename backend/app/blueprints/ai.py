from flask import Blueprint, request
from ..models import User, Job
from ..services.ai_service import AIService
from ..utils.response import api_success, api_error
from ..utils.decorators import jwt_required, roles_required

ai_bp = Blueprint('ai', __name__)


@ai_bp.route('/recommended-mentors', methods=['GET'])
@roles_required('STUDENT')
def get_recommended_mentors():
    """AI content-based mentor recommendations for logged-in student."""
    user = User.query.get(request.user_id)
    if not user:
        return api_error("User not found.", 404)

    limit = request.args.get('limit', 5, type=int)
    recommendations = AIService.recommend_mentors_for_student(user, limit=limit)

    return api_success(
        data={
            'recommendations': recommendations,
            'algorithm': 'TF-IDF + Cosine Similarity + Skill Jaccard Overlap',
        }
    )


@ai_bp.route('/recommended-jobs', methods=['GET'])
@roles_required('STUDENT')
def get_recommended_jobs():
    """AI job recommendations matching student profile and skills."""
    user = User.query.get(request.user_id)
    if not user:
        return api_error("User not found.", 404)

    limit = request.args.get('limit', 5, type=int)
    recommendations = AIService.recommend_jobs_for_student(user, limit=limit)

    return api_success(
        data={
            'recommendations': recommendations,
            'algorithm': 'TF-IDF Vector Space Model + Requirement Coverage',
        }
    )


@ai_bp.route('/parse-resume', methods=['POST'])
@jwt_required
def parse_resume_endpoint():
    """Upload resume (PDF or TXT) to extract recognized skills without persistent data retention."""
    if 'resume' not in request.files:
        return api_error("No resume file uploaded. Expecting multipart file field 'resume'.", 400)

    file = request.files['resume']
    if not file or file.filename == '':
        return api_error("No file selected for upload.", 400)

    # Size check limit: 5MB
    file_bytes = file.read()
    if len(file_bytes) > 5 * 1024 * 1024:
        return api_error("File size exceeds 5MB limit.", 400)

    try:
        parsed_data = AIService.parse_resume(file_bytes, file.filename)
        return api_success(
            data=parsed_data,
            message="Resume parsed successfully.",
        )
    except ValueError as ve:
        return api_error(str(ve), 400)
    except Exception as e:
        return api_error(f"Error parsing resume: {str(e)}", 500)


@ai_bp.route('/skill-gap-analysis', methods=['POST'])
@jwt_required
def perform_skill_gap_analysis():
    """
    Compare extracted resume skills against a target job's requirements,
    calculate match score, missing skills, and a tailored 4-phase career roadmap.
    """
    data = request.get_json() or {}
    job_id = data.get('job_id')
    skills = data.get('skills', [])

    if not job_id:
        return api_error("Target job_id is required.", 400)

    job = Job.query.get(job_id)
    if not job:
        return api_error("Target job not found.", 404)

    if not skills and request.user_id:
        # Fallback to student profile skills if no custom resume skills provided
        user = User.query.get(request.user_id)
        if user and user.profile:
            skills = user.profile.get_skills_list()

    analysis = AIService.compare_resume_with_job(skills, job)
    return api_success(data={'analysis': analysis})


# ==========================================
# INNOVATIVE ENDPOINT 1: AI MOCK INTERVIEW
# ==========================================
@ai_bp.route('/interview/questions', methods=['GET'])
@jwt_required
def get_mock_interview_questions():
    """Retrieve curated technical interview questions for chosen domain."""
    domain = request.args.get('domain', 'FULL_STACK')
    questions = AIService.get_mock_interview_questions(domain)
    return api_success(data={'questions': questions, 'domain': domain})


@ai_bp.route('/interview/evaluate', methods=['POST'])
@jwt_required
def evaluate_mock_interview_answer():
    """Evaluate candidate answer for technical depth, keywords, and action tips."""
    data = request.get_json() or {}
    question_text = data.get('question_text', '').strip()
    student_answer = data.get('student_answer', '').strip()
    domain = data.get('domain', 'FULL_STACK')

    if not question_text or not student_answer:
        return api_error("Both question_text and student_answer are required.", 400)

    evaluation = AIService.evaluate_mock_interview_answer(question_text, student_answer, domain)
    return api_success(data={'evaluation': evaluation})


# ==========================================
# INNOVATIVE ENDPOINT 2: SMART REFERRAL PITCH
# ==========================================
@ai_bp.route('/referral-pitch', methods=['POST'])
@jwt_required
def generate_smart_referral_pitch():
    """Generate personalized cold-outreach referral pitch for a target job and alumnus."""
    data = request.get_json() or {}
    alumnus_id = data.get('alumnus_id')
    job_id = data.get('job_id')

    if not alumnus_id or not job_id:
        return api_error("alumnus_id and job_id are required.", 400)

    student_user = User.query.get(request.user_id)
    alumnus_user = User.query.get(alumnus_id)
    job = Job.query.get(job_id)

    if not student_user or not alumnus_user or not job:
        return api_error("Target user or job opening not found.", 404)

    pitch = AIService.generate_referral_pitch(student_user, alumnus_user, job)
    return api_success(data={'pitch': pitch})


# ==========================================
# INNOVATIVE ENDPOINT 3: GLOBAL ALUMNI CAREER MATRIX
# ==========================================
@ai_bp.route('/analytics-hub', methods=['GET'])
@jwt_required
def get_global_analytics_hub():
    """Retrieve global alumni hub coordinates, placement pipeline, and trending competencies."""
    analytics = AIService.get_alumni_analytics_hub_data()
    return api_success(data={'analytics': analytics})
