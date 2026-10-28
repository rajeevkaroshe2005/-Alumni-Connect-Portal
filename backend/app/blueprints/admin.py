import datetime
from flask import Blueprint, request
from sqlalchemy import or_, func
from .. import db
from ..models import User, Profile, AlumniDetail, Job, MentorshipBooking, Event, AuditLog, Notification
from ..utils.response import api_success, api_error
from ..utils.decorators import roles_required
from ..services.audit_service import AuditService

admin_bp = Blueprint('admin', __name__)


@admin_bp.route('/analytics', methods=['GET'])
@roles_required('ADMIN')
def get_platform_analytics():
    """Aggregate statistics for executive administrative dashboard."""
    total_users = User.query.count()
    total_students = User.query.filter_by(role='STUDENT').count()
    total_alumni = User.query.filter_by(role='ALUMNI').count()
    verified_alumni = AlumniDetail.query.filter_by(verification_status='VERIFIED').count()
    pending_verifications = AlumniDetail.query.filter_by(verification_status='PENDING').count()

    total_jobs = Job.query.count()
    active_jobs = Job.query.filter_by(is_active=True, moderation_status='APPROVED').count()
    pending_jobs = Job.query.filter_by(moderation_status='PENDING').count()

    total_mentorships = MentorshipBooking.query.count()
    confirmed_mentorships = MentorshipBooking.query.filter_by(status='CONFIRMED').count()
    completed_mentorships = MentorshipBooking.query.filter_by(status='COMPLETED').count()

    total_events = Event.query.count()
    upcoming_events = Event.query.filter(
        Event.start_time >= datetime.datetime.now(datetime.timezone.utc),
        Event.moderation_status == 'APPROVED',
    ).count()

    # Department distribution
    dept_distribution = db.session.query(
        AlumniDetail.department, func.count(AlumniDetail.id)
    ).group_by(AlumniDetail.department).all()

    return api_success(
        data={
            'users': {
                'total': total_users,
                'students': total_students,
                'alumni': total_alumni,
                'verified_alumni': verified_alumni,
                'pending_verifications': pending_verifications,
            },
            'jobs': {
                'total': total_jobs,
                'active': active_jobs,
                'pending_moderation': pending_jobs,
            },
            'mentorship': {
                'total_bookings': total_mentorships,
                'confirmed': confirmed_mentorships,
                'completed': completed_mentorships,
            },
            'events': {
                'total': total_events,
                'upcoming': upcoming_events,
            },
            'departments': [
                {'name': dept or 'Other', 'count': count} for dept, count in dept_distribution
            ],
        }
    )


@admin_bp.route('/users', methods=['GET'])
@roles_required('ADMIN')
def list_users():
    """List and moderate all users across roles."""
    role = request.args.get('role', '').strip()
    query_str = request.args.get('q', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)

    q = User.query

    if role:
        q = q.filter_by(role=role)

    if query_str:
        q = q.join(User.profile).filter(
            or_(
                User.email.ilike(f"%{query_str}%"),
                Profile.first_name.ilike(f"%{query_str}%"),
                Profile.last_name.ilike(f"%{query_str}%"),
            )
        )

    q = q.order_by(User.created_at.desc())
    pagination = q.paginate(page=page, per_page=per_page, error_out=False)

    return api_success(
        data={
            'users': [u.to_dict() for u in pagination.items],
            'pagination': {
                'page': pagination.page,
                'per_page': pagination.per_page,
                'total_items': pagination.total,
                'total_pages': pagination.pages,
            },
        }
    )


@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['PUT'])
@roles_required('ADMIN')
def toggle_user_status(user_id):
    """Activate or deactivate a user account."""
    if user_id == request.user_id:
        return api_error("Administrators cannot deactivate their own account.", 400)

    user = User.query.get(user_id)
    if not user:
        return api_error("User not found.", 404)

    try:
        user.is_active = not user.is_active
        db.session.commit()

        status_str = "activated" if user.is_active else "deactivated"
        AuditService.log(
            action=f"USER_{status_str.upper()}",
            entity_type="User",
            entity_id=user.id,
            details={'email': user.email, 'is_active': user.is_active},
            actor_id=request.user_id,
        )

        return api_success(
            data={'user': user.to_dict()},
            message=f"User account has been {status_str}."
        )
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to toggle user status: {str(e)}", 500)


@admin_bp.route('/alumni-verification', methods=['GET'])
@roles_required('ADMIN')
def get_pending_alumni():
    """Retrieve alumni queue awaiting verification."""
    status = request.args.get('status', 'PENDING').upper()
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)

    q = AlumniDetail.query.filter_by(verification_status=status).order_by(AlumniDetail.created_at.asc())
    pagination = q.paginate(page=page, per_page=per_page, error_out=False)

    items = []
    for detail in pagination.items:
        user_dict = detail.user.to_dict() if detail.user else {}
        items.append(user_dict)

    return api_success(
        data={
            'alumni': items,
            'pagination': {
                'page': pagination.page,
                'per_page': pagination.per_page,
                'total_items': pagination.total,
                'total_pages': pagination.pages,
            },
        }
    )


@admin_bp.route('/alumni-verification/<int:alumni_user_id>', methods=['PUT'])
@roles_required('ADMIN')
def verify_alumni(alumni_user_id):
    """Approve or reject alumni verification."""
    detail = AlumniDetail.query.filter_by(user_id=alumni_user_id).first()
    if not detail:
        return api_error("Alumni detail record not found.", 404)

    data = request.get_json() or {}
    new_status = data.get('status', '').upper()
    notes = data.get('notes', '').strip()

    if new_status not in ['VERIFIED', 'REJECTED', 'PENDING']:
        return api_error("Status must be VERIFIED, REJECTED, or PENDING.", 400)

    try:
        detail.verification_status = new_status
        detail.verification_notes = notes
        detail.verified_at = datetime.datetime.now(datetime.timezone.utc) if new_status == 'VERIFIED' else None
        detail.verified_by_id = request.user_id

        # Send notification to alumni user
        notif = Notification(
            user_id=detail.user_id,
            notification_type='VERIFICATION',
            title=f"Alumni Profile {new_status.capitalize()}",
            message=f"Your alumni verification status is now {new_status}. {notes}",
            link="/profile",
        )
        db.session.add(notif)
        db.session.commit()

        AuditService.log(
            action=f"ALUMNI_VERIFICATION_{new_status}",
            entity_type="AlumniDetail",
            entity_id=detail.id,
            details={'alumni_user_id': alumni_user_id, 'notes': notes},
            actor_id=request.user_id,
        )

        return api_success(
            data={'alumni_detail': detail.to_dict()},
            message=f"Alumni verification marked as {new_status}."
        )
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to update verification status: {str(e)}", 500)


@admin_bp.route('/jobs-moderation', methods=['GET'])
@roles_required('ADMIN')
def get_jobs_for_moderation():
    """List jobs awaiting administrative approval."""
    status = request.args.get('status', 'PENDING').upper()
    jobs = Job.query.filter_by(moderation_status=status).order_by(Job.created_at.asc()).all()
    return api_success(data={'jobs': [j.to_dict() for j in jobs]})


@admin_bp.route('/jobs-moderation/<int:job_id>', methods=['PUT'])
@roles_required('ADMIN')
def moderate_job(job_id):
    """Approve or reject job posting."""
    job = Job.query.get(job_id)
    if not job:
        return api_error("Job not found.", 404)

    data = request.get_json() or {}
    status = data.get('status', '').upper()
    if status not in ['APPROVED', 'REJECTED']:
        return api_error("Status must be APPROVED or REJECTED.", 400)

    try:
        job.moderation_status = status
        db.session.commit()

        AuditService.log(
            action=f"JOB_{status}",
            entity_type="Job",
            entity_id=job.id,
            details={'title': job.title},
            actor_id=request.user_id,
        )

        return api_success(data={'job': job.to_dict()}, message=f"Job marked as {status}.")
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to moderate job: {str(e)}", 500)


@admin_bp.route('/audit-logs', methods=['GET'])
@roles_required('ADMIN')
def get_audit_logs():
    """Retrieve chronologically ordered audit logs with optional filters."""
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 25, type=int), 100)
    action = request.args.get('action', '').strip()

    q = AuditLog.query
    if action:
        q = q.filter(AuditLog.action.ilike(f"%{action}%"))

    q = q.order_by(AuditLog.created_at.desc())
    pagination = q.paginate(page=page, per_page=per_page, error_out=False)

    return api_success(
        data={
            'logs': [log.to_dict() for log in pagination.items],
            'pagination': {
                'page': pagination.page,
                'per_page': pagination.per_page,
                'total_items': pagination.total,
                'total_pages': pagination.pages,
            },
        }
    )
