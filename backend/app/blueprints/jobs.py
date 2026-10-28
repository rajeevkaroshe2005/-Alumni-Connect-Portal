from flask import Blueprint, request
from sqlalchemy import or_
from .. import db
from ..models import Job, JobApplication, SavedJob, User, Notification
from ..utils.response import api_success, api_error
from ..utils.decorators import jwt_required, roles_required
from ..services.audit_service import AuditService

jobs_bp = Blueprint('jobs', __name__)


@jobs_bp.route('', methods=['GET'])
@jwt_required
def get_jobs():
    """List and search active jobs and internships with filters and pagination."""
    query_str = request.args.get('q', '').strip()
    job_type = request.args.get('job_type', '').strip()
    location = request.args.get('location', '').strip()
    exp_level = request.args.get('experience_level', '').strip()

    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 50)

    q = Job.query.filter_by(is_active=True, moderation_status='APPROVED')

    if job_type:
        q = q.filter(Job.job_type == job_type)
    if location:
        q = q.filter(Job.location.ilike(f"%{location}%"))
    if exp_level:
        q = q.filter(Job.experience_level == exp_level)
    if query_str:
        q = q.filter(
            or_(
                Job.title.ilike(f"%{query_str}%"),
                Job.company.ilike(f"%{query_str}%"),
                Job.description.ilike(f"%{query_str}%"),
                Job.skills_required.ilike(f"%{query_str}%"),
            )
        )

    q = q.order_by(Job.created_at.desc())
    pagination = q.paginate(page=page, per_page=per_page, error_out=False)

    # Check which jobs are saved or applied to by current user
    user_id = request.user_id
    saved_job_ids = set(
        sj.job_id for sj in SavedJob.query.filter_by(user_id=user_id).all()
    )
    applied_job_ids = set(
        ja.job_id for ja in JobApplication.query.filter_by(applicant_id=user_id).all()
    )

    items = []
    for job in pagination.items:
        data = job.to_dict()
        data['is_saved'] = job.id in saved_job_ids
        data['has_applied'] = job.id in applied_job_ids
        items.append(data)

    return api_success(
        data={
            'jobs': items,
            'pagination': {
                'page': pagination.page,
                'per_page': pagination.per_page,
                'total_items': pagination.total,
                'total_pages': pagination.pages,
                'has_next': pagination.has_next,
                'has_prev': pagination.has_prev,
            },
        }
    )


@jobs_bp.route('/<int:job_id>', methods=['GET'])
@jwt_required
def get_job_detail(job_id):
    """Retrieve full job details."""
    job = Job.query.get(job_id)
    if not job:
        return api_error("Job listing not found.", 404)

    user_id = request.user_id
    data = job.to_dict()
    data['is_saved'] = SavedJob.query.filter_by(user_id=user_id, job_id=job.id).first() is not None
    data['has_applied'] = JobApplication.query.filter_by(applicant_id=user_id, job_id=job.id).first() is not None

    return api_success(data={'job': data})


@jobs_bp.route('', methods=['POST'])
@roles_required('ALUMNI', 'ADMIN')
def create_job():
    """Publish a new job or internship opportunity."""
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    company = data.get('company', '').strip()
    location = data.get('location', '').strip()
    job_type = data.get('job_type', 'FULL_TIME').strip()
    description = data.get('description', '').strip()
    skills_required = data.get('skills_required', '')

    if not title or not company or not location or not description:
        return api_error("Title, company, location, and description are required.", 400)

    if isinstance(skills_required, list):
        skills_required = ', '.join(skills_required)

    user_id = request.user_id
    user = User.query.get(user_id)

    # If alumni is not verified, set moderation_status to PENDING
    moderation_status = 'APPROVED'
    if user.role == 'ALUMNI':
        if not user.alumni_detail or user.alumni_detail.verification_status != 'VERIFIED':
            moderation_status = 'PENDING'

    new_job = Job(
        posted_by_id=user_id,
        title=title,
        company=company,
        location=location,
        job_type=job_type,
        experience_level=data.get('experience_level', 'ENTRY'),
        description=description,
        requirements=data.get('requirements', ''),
        skills_required=skills_required,
        salary_range=data.get('salary_range', ''),
        is_active=True,
        moderation_status=moderation_status,
    )

    try:
        db.session.add(new_job)
        db.session.commit()

        AuditService.log(
            action='JOB_POSTED',
            entity_type='Job',
            entity_id=new_job.id,
            details={'title': title, 'company': company, 'status': moderation_status},
            actor_id=user_id,
        )

        msg = "Job published successfully." if moderation_status == 'APPROVED' else "Job submitted for admin moderation."
        return api_success(data={'job': new_job.to_dict()}, message=msg, status_code=201)
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to post job: {str(e)}", 500)


@jobs_bp.route('/<int:job_id>', methods=['PUT'])
@jwt_required
def update_job(job_id):
    """Edit existing job listing (owner or admin)."""
    job = Job.query.get(job_id)
    if not job:
        return api_error("Job not found.", 404)

    if job.posted_by_id != request.user_id and request.user_role != 'ADMIN':
        return api_error("Not authorized to modify this job listing.", 403)

    data = request.get_json() or {}
    if 'title' in data:
        job.title = data['title'].strip()
    if 'company' in data:
        job.company = data['company'].strip()
    if 'location' in data:
        job.location = data['location'].strip()
    if 'job_type' in data:
        job.job_type = data['job_type'].strip()
    if 'experience_level' in data:
        job.experience_level = data['experience_level'].strip()
    if 'description' in data:
        job.description = data['description'].strip()
    if 'requirements' in data:
        job.requirements = data['requirements'].strip()
    if 'skills_required' in data:
        if isinstance(data['skills_required'], list):
            job.skills_required = ', '.join(data['skills_required'])
        else:
            job.skills_required = str(data['skills_required']).strip()
    if 'salary_range' in data:
        job.salary_range = data['salary_range'].strip()
    if 'is_active' in data:
        job.is_active = bool(data['is_active'])

    try:
        db.session.commit()
        return api_success(data={'job': job.to_dict()}, message="Job listing updated.")
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to update job: {str(e)}", 500)


@jobs_bp.route('/<int:job_id>/apply', methods=['POST'])
@roles_required('STUDENT')
def apply_to_job(job_id):
    """Apply to a job listing with a resume reference and cover note."""
    job = Job.query.get(job_id)
    if not job or not job.is_active or job.moderation_status != 'APPROVED':
        return api_error("This job is not currently open for applications.", 400)

    applicant_id = request.user_id
    existing_app = JobApplication.query.filter_by(job_id=job.id, applicant_id=applicant_id).first()
    if existing_app:
        return api_error("You have already submitted an application for this position.", 409)

    data = request.get_json() or {}
    cover_note = data.get('cover_note', '').strip()
    resume_url = data.get('resume_url', '').strip()

    new_app = JobApplication(
        job_id=job.id,
        applicant_id=applicant_id,
        cover_note=cover_note,
        resume_url=resume_url,
        status='APPLIED',
    )

    try:
        db.session.add(new_app)

        # Notify job poster
        notif = Notification(
            user_id=job.posted_by_id,
            notification_type='APPLICATION',
            title='New Job Application Received',
            message=f"A student has applied for your listing: '{job.title}'.",
            link=f"/jobs/{job.id}/applications",
        )
        db.session.add(notif)
        db.session.commit()

        AuditService.log(
            action='JOB_APPLICATION_SUBMITTED',
            entity_type='JobApplication',
            entity_id=new_app.id,
            details={'job_id': job.id, 'title': job.title},
            actor_id=applicant_id,
        )

        return api_success(data={'application': new_app.to_dict()}, message="Application submitted successfully.", status_code=201)
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to submit application: {str(e)}", 500)


@jobs_bp.route('/<int:job_id>/applications', methods=['GET'])
@jwt_required
def get_job_applications(job_id):
    """View applications for a specific job (poster or admin only)."""
    job = Job.query.get(job_id)
    if not job:
        return api_error("Job not found.", 404)

    if job.posted_by_id != request.user_id and request.user_role != 'ADMIN':
        return api_error("Not authorized to view applicants for this job.", 403)

    applications = JobApplication.query.filter_by(job_id=job.id).order_by(JobApplication.created_at.desc()).all()
    return api_success(data={'applications': [a.to_dict() for a in applications]})


@jobs_bp.route('/applications/<int:app_id>/status', methods=['PUT'])
@jwt_required
def update_application_status(app_id):
    """Update applicant status (e.g., SHORTLISTED, REJECTED, ACCEPTED) and notify candidate."""
    app_record = JobApplication.query.get(app_id)
    if not app_record:
        return api_error("Application record not found.", 404)

    job = app_record.job
    if job.posted_by_id != request.user_id and request.user_role != 'ADMIN':
        return api_error("Not authorized to update application status.", 403)

    data = request.get_json() or {}
    new_status = data.get('status', '').upper()
    if new_status not in ['APPLIED', 'REVIEWING', 'SHORTLISTED', 'REJECTED', 'ACCEPTED']:
        return api_error("Invalid application status.", 400)

    try:
        app_record.status = new_status

        # Send notification to student applicant
        status_msg = f"Your application for '{job.title}' at {job.company} is now marked as {new_status}."
        notif = Notification(
            user_id=app_record.applicant_id,
            notification_type='APPLICATION',
            title=f"Application Update: {job.title}",
            message=status_msg,
            link=f"/jobs/{job.id}",
        )
        db.session.add(notif)
        db.session.commit()

        AuditService.log(
            action='APPLICATION_STATUS_UPDATED',
            entity_type='JobApplication',
            entity_id=app_record.id,
            details={'job_id': job.id, 'status': new_status},
            actor_id=request.user_id,
        )

        return api_success(data={'application': app_record.to_dict()}, message="Status updated successfully.")
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to update status: {str(e)}", 500)


@jobs_bp.route('/<int:job_id>/save', methods=['POST'])
@jwt_required
def toggle_save_job(job_id):
    """Bookmark or remove bookmark for a job."""
    job = Job.query.get(job_id)
    if not job:
        return api_error("Job not found.", 404)

    user_id = request.user_id
    existing = SavedJob.query.filter_by(user_id=user_id, job_id=job.id).first()

    try:
        if existing:
            db.session.delete(existing)
            db.session.commit()
            return api_success(data={'is_saved': False}, message="Job removed from saved list.")
        else:
            saved = SavedJob(user_id=user_id, job_id=job.id)
            db.session.add(saved)
            db.session.commit()
            return api_success(data={'is_saved': True}, message="Job saved successfully.")
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to save/unsave job: {str(e)}", 500)


@jobs_bp.route('/saved', methods=['GET'])
@jwt_required
def get_saved_jobs():
    """List all saved jobs for current user."""
    user_id = request.user_id
    saved = SavedJob.query.filter_by(user_id=user_id).order_by(SavedJob.created_at.desc()).all()
    return api_success(data={'saved_jobs': [s.to_dict() for s in saved]})


@jobs_bp.route('/my-postings', methods=['GET'])
@roles_required('ALUMNI', 'ADMIN')
def get_my_job_postings():
    """List jobs created by current user."""
    user_id = request.user_id
    postings = Job.query.filter_by(posted_by_id=user_id).order_by(Job.created_at.desc()).all()
    return api_success(data={'jobs': [p.to_dict() for p in postings]})


@jobs_bp.route('/my-applications', methods=['GET'])
@roles_required('STUDENT')
def get_my_applications():
    """List all applications submitted by current student."""
    user_id = request.user_id
    apps = JobApplication.query.filter_by(applicant_id=user_id).order_by(JobApplication.created_at.desc()).all()
    return api_success(data={'applications': [a.to_dict() for a in apps]})
