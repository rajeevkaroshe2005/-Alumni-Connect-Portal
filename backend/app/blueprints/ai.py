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
            'algorithm': 'TF-IDF (N-gram 1-2) + Domain Synonym Normalizer + Cosine Similarity',
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


# ==========================================
# INNOVATIVE ENDPOINT 4: INTERACTIVE AI ATS RESUME SCANNER
# ==========================================
@ai_bp.route('/resume/scan', methods=['POST'])
@jwt_required
def scan_resume_ats_endpoint():
    """
    Perform deep ATS compliance audit on uploaded resume or raw text against a target job.
    Returns composite score (0-100), section analysis, contact audit, and metric bullet enhancements.
    """
    resume_text = ""
    target_job_title = ""
    target_job_description = ""
    required_skills = []

    # Check for file upload
    file_uploaded = False
    if 'resume' in request.files:
        file = request.files['resume']
        if file and file.filename != '':
            file_uploaded = True
            file_bytes = file.read()
            if len(file_bytes) > 5 * 1024 * 1024:
                return api_error("File size exceeds 5MB limit.", 400)
            try:
                parsed = AIService.parse_resume(file_bytes, file.filename)
                resume_text = (parsed.get('extracted_text') or '').strip()
            except Exception as e:
                return api_error(f"Error reading resume file: {str(e)}", 400)

            if not resume_text:
                return api_error(
                    "Unable to extract text from the uploaded PDF. It appears to be a scanned or image-based PDF without selectable text. Please switch to the 'Paste Raw Text' tab above and paste your resume text directly.",
                    400
                )

    # Support raw text or fallback form fields
    if not resume_text:
        data = request.get_json(silent=True) or {}
        resume_text = data.get('resume_text', '').strip()
        job_id = data.get('job_id')
        target_job_title = data.get('target_job_title', '')
        target_job_description = data.get('target_job_description', '')
    else:
        # Multipart form data may contain job_id
        job_id = request.form.get('job_id')
        target_job_title = request.form.get('target_job_title', '')
        target_job_description = request.form.get('target_job_description', '')

    if not resume_text:
        return api_error("No resume content provided. Please upload a PDF/TXT resume or provide resume_text.", 400)

    if job_id:
        job = Job.query.get(job_id)
        if job:
            target_job_title = job.title
            target_job_description = job.description
            required_skills = job.get_skills_list()

    audit = AIService.scan_resume_for_ats(
        resume_text=resume_text,
        target_job_title=target_job_title,
        target_job_description=target_job_description,
        required_skills=required_skills
    )

    return api_success(data={'audit': audit})


# ==========================================
# INNOVATIVE ENDPOINT 5: AI CAREER & COMPENSATION PREDICTOR
# ==========================================
@ai_bp.route('/career/predict', methods=['POST'])
@jwt_required
def predict_career_endpoint():
    """Predict market salary band, progression curve, and high-ROI skills to learn next."""
    data = request.get_json() or {}
    department = data.get('department', 'Computer Science & Engineering')
    years_experience = float(data.get('years_experience', 0))
    skills = data.get('skills', [])
    target_role = data.get('target_role', 'Software Engineer')
    company_tier = data.get('company_tier', 'TIER_1_PRODUCT')

    if not skills and request.user_id:
        user = User.query.get(request.user_id)
        if user and user.profile:
            skills = user.profile.get_skills_list()

    prediction = AIService.predict_career_compensation(
        department=department,
        years_experience=years_experience,
        skills=skills,
        target_role=target_role,
        company_tier=company_tier
    )

    return api_success(data={'prediction': prediction})


# ==========================================
# INNOVATIVE ENDPOINT 6: SMART ALUMNI OUTREACH WITH TONE SELECTION
# ==========================================
@ai_bp.route('/outreach/generate', methods=['POST'])
@jwt_required
def generate_outreach_endpoint():
    """Generate tailored outreach pitch across coffee-chat, referral, or technical guidance tones."""
    data = request.get_json() or {}
    alumnus_id = data.get('alumnus_id')
    tone = data.get('tone', 'COFFEE_CHAT')
    target_company = data.get('target_company')
    target_role = data.get('target_role')
    custom_note = data.get('custom_note')

    if not alumnus_id:
        return api_error("alumnus_id is required.", 400)

    student_user = User.query.get(request.user_id)
    alumnus_user = User.query.get(alumnus_id)

    if not student_user or not alumnus_user:
        return api_error("Student or Alumnus user not found.", 404)

    outreach = AIService.generate_networking_outreach(
        student_user=student_user,
        alumnus_user=alumnus_user,
        target_company=target_company,
        target_role=target_role,
        tone=tone,
        custom_note=custom_note
    )

    return api_success(data={'outreach': outreach})


# ==========================================
# INNOVATIVE FEATURE: SMART OPPORTUNITY ALERTS
# ==========================================
@ai_bp.route('/opportunity-alerts', methods=['GET'])
@jwt_required
def get_opportunity_alerts():
    """
    Generate proactive opportunity alerts for student when high-match
    jobs or alumni mentors (> 70% match) are detected by the TF-IDF engine.
    """
    user = User.query.get(request.user_id)
    if not user:
        return api_error("User not found.", 404)

    alerts = []
    if user.role == 'STUDENT':
        # 1. High match jobs
        try:
            recommended_jobs = AIService.recommend_jobs_for_student(user, limit=4)
            for j in recommended_jobs:
                if j.get('match_percentage', 0) >= 65:
                    alerts.append({
                        'id': f"job_{j['job_id']}",
                        'type': 'JOB_OPPORTUNITY',
                        'title': f"High-Match Role: {j['title']}",
                        'company': j['company'],
                        'match_percentage': j['match_percentage'],
                        'reason': j['reasons'][0] if j.get('reasons') else "Skills align with your academic profile",
                        'action_url': f"/jobs/{j['job_id']}",
                        'action_label': 'View Role & Apply',
                    })
        except Exception:
            pass

        # 2. High match mentors
        try:
            recommended_mentors = AIService.recommend_mentors_for_student(user, limit=3)
            for m in recommended_mentors:
                if m.get('match_percentage', 0) >= 65:
                    alerts.append({
                        'id': f"mentor_{m['mentor_id']}",
                        'type': 'MENTOR_RECOMMENDATION',
                        'title': f"Recommended Alumnus: {m['name']}",
                        'company': m.get('company', 'Alumni Mentor'),
                        'match_percentage': m['match_percentage'],
                        'reason': m['reasons'][0] if m.get('reasons') else "Shared domain and career path",
                        'action_url': f"/mentorship",
                        'action_label': 'Book 1-on-1 Session',
                    })
        except Exception:
            pass

    return api_success(data={
        'alerts': alerts,
        'count': len(alerts),
    })


# ==========================================
# INNOVATIVE FEATURE: SMART CONNECTION GRAPH
# ==========================================
@ai_bp.route('/network-graph', methods=['GET'])
@jwt_required
def get_network_graph():
    """
    Construct professional relationship node-link graph:
    - Center User node
    - Company hubs (Google, Stripe, Amazon, etc.)
    - 1st-degree connections (booked mentors or same department)
    - 2nd-degree connections (alumni at same company reachable via peers)
    """
    user = User.query.get(request.user_id)
    if not user:
        return api_error("User not found.", 404)

    user_profile = user.profile
    user_name = f"{user_profile.first_name} {user_profile.last_name}" if user_profile else "You"
    user_dept = ""
    if user.student_detail and user.student_detail.department:
        user_dept = user.student_detail.department
    elif user.alumni_detail and user.alumni_detail.department:
        user_dept = user.alumni_detail.department

    # Fetch all alumni
    alumni_users = User.query.filter_by(role='ALUMNI', is_active=True).limit(25).all()

    nodes = [
        {
            'id': f"user_{user.id}",
            'label': user_name,
            'type': 'CURRENT_USER',
            'department': user_dept,
            'color': '#244B3A',
            'size': 24,
        }
    ]

    edges = []
    companies_seen = set()

    for alm in alumni_users:
        alm_prof = alm.profile
        alm_det = alm.alumni_detail
        if not alm_prof or not alm_det:
            continue

        alm_name = f"{alm_prof.first_name} {alm_prof.last_name}"
        company = alm_det.current_company or "Tech Hub"

        # Add Company Hub node if not added
        company_node_id = f"comp_{company.lower().replace(' ', '_')}"
        if company not in companies_seen:
            companies_seen.add(company)
            nodes.append({
                'id': company_node_id,
                'label': company,
                'type': 'COMPANY',
                'color': '#C4A878',
                'size': 18,
            })

        # Determine Degree: 1st degree if same dept or booked, else 2nd degree
        is_first_degree = (user_dept and alm_det.department and user_dept.lower() == alm_det.department.lower())
        degree_str = "1st Degree (Same Dept)" if is_first_degree else "2nd Degree (Alumni Peer)"

        alumnus_node_id = f"alumni_{alm.id}"
        nodes.append({
            'id': alumnus_node_id,
            'label': alm_name,
            'type': 'ALUMNI',
            'company': company,
            'title': alm_det.current_position or "Engineer",
            'batch': alm_det.graduation_year,
            'department': alm_det.department,
            'degree': degree_str,
            'color': '#3A5F50' if is_first_degree else '#8B6B3E',
            'size': 14,
            'user_id': alm.id,
        })

        # Edge from Alumnus to Company
        edges.append({
            'source': alumnus_node_id,
            'target': company_node_id,
            'label': 'Works At',
            'type': 'EMPLOYMENT',
        })

        # Edge from User to 1st degree Alumnus
        if is_first_degree:
            edges.append({
                'source': f"user_{user.id}",
                'target': alumnus_node_id,
                'label': f"Alumni {alm_det.department}",
                'type': 'FIRST_DEGREE',
            })
        else:
            # 2nd degree edge via company
            edges.append({
                'source': f"user_{user.id}",
                'target': company_node_id,
                'label': 'Target Company',
                'type': 'INTEREST',
            })

    return api_success(data={
        'nodes': nodes,
        'edges': edges,
        'total_nodes': len(nodes),
        'total_edges': len(edges),
    })
