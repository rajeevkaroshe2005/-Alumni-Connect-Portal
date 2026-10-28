from flask import Blueprint, request
from .. import db
from ..models import User, Profile, StudentDetail, AlumniDetail
from ..utils.response import api_success, api_error
from ..utils.decorators import jwt_required
from ..services.audit_service import AuditService

profiles_bp = Blueprint('profiles', __name__)


@profiles_bp.route('/<int:user_id>', methods=['GET'])
@jwt_required
def get_user_profile(user_id):
    """Retrieve full public profile of a user by ID."""
    user = User.query.get(user_id)
    if not user:
        return api_error("User not found.", 404)

    return api_success(data={'user': user.to_dict()})


@profiles_bp.route('/me', methods=['PUT'])
@jwt_required
def update_my_profile():
    """Update profile attributes of the authenticated user."""
    data = request.get_json() or {}
    user = User.query.get(request.user_id)
    if not user:
        return api_error("User not found.", 404)

    profile = user.profile
    if not profile:
        profile = Profile(user_id=user.id, first_name="", last_name="")
        db.session.add(profile)

    # Update basic profile attributes
    if 'first_name' in data:
        profile.first_name = data['first_name'].strip()
    if 'last_name' in data:
        profile.last_name = data['last_name'].strip()
    if 'headline' in data:
        profile.headline = data['headline'].strip()
    if 'bio' in data:
        profile.bio = data['bio'].strip()
    if 'avatar_url' in data:
        profile.avatar_url = data['avatar_url'].strip()
    if 'phone' in data:
        profile.phone = data['phone'].strip()
    if 'location' in data:
        profile.location = data['location'].strip()
    if 'linkedin_url' in data:
        profile.linkedin_url = data['linkedin_url'].strip()
    if 'github_url' in data:
        profile.github_url = data['github_url'].strip()
    if 'portfolio_url' in data:
        profile.portfolio_url = data['portfolio_url'].strip()
    if 'skills' in data:
        # If passed as list, join with commas
        if isinstance(data['skills'], list):
            profile.skills = ', '.join(data['skills'])
        else:
            profile.skills = str(data['skills']).strip()

    try:
        db.session.commit()
        AuditService.log(
            action='PROFILE_UPDATED',
            entity_type='Profile',
            entity_id=profile.id,
            actor_id=user.id,
        )
        return api_success(data={'user': user.to_dict()}, message="Profile updated successfully.")
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to update profile: {str(e)}", 500)


@profiles_bp.route('/student-details', methods=['PUT'])
@jwt_required
def update_student_details():
    """Update student-specific educational details."""
    user = User.query.get(request.user_id)
    if not user or user.role != 'STUDENT':
        return api_error("Only students can update student details.", 403)

    data = request.get_json() or {}
    detail = user.student_detail
    if not detail:
        detail = StudentDetail(user_id=user.id, degree="B.Tech", department="CSE", expected_graduation_year=2026)
        db.session.add(detail)

    if 'roll_number' in data:
        detail.roll_number = str(data['roll_number']).strip()
    if 'current_year' in data:
        detail.current_year = int(data['current_year'])
    if 'degree' in data:
        detail.degree = str(data['degree']).strip()
    if 'department' in data:
        detail.department = str(data['department']).strip()
    if 'expected_graduation_year' in data:
        detail.expected_graduation_year = int(data['expected_graduation_year'])
    if 'cgpa' in data:
        detail.cgpa = float(data['cgpa']) if data['cgpa'] is not None else None
    if 'interests' in data:
        if isinstance(data['interests'], list):
            detail.interests = ', '.join(data['interests'])
        else:
            detail.interests = str(data['interests']).strip()

    try:
        db.session.commit()
        return api_success(data={'student_detail': detail.to_dict()}, message="Student details updated.")
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to update student details: {str(e)}", 500)


@profiles_bp.route('/alumni-details', methods=['PUT'])
@jwt_required
def update_alumni_details():
    """Update alumni employment and industry details."""
    user = User.query.get(request.user_id)
    if not user or user.role != 'ALUMNI':
        return api_error("Only alumni can update alumni details.", 403)

    data = request.get_json() or {}
    detail = user.alumni_detail
    if not detail:
        detail = AlumniDetail(user_id=user.id, graduation_year=2022, degree="B.Tech", department="CSE")
        db.session.add(detail)

    if 'graduation_year' in data:
        detail.graduation_year = int(data['graduation_year'])
    if 'degree' in data:
        detail.degree = str(data['degree']).strip()
    if 'department' in data:
        detail.department = str(data['department']).strip()
    if 'current_company' in data:
        detail.current_company = str(data['current_company']).strip()
    if 'current_position' in data:
        detail.current_position = str(data['current_position']).strip()
    if 'industry' in data:
        detail.industry = str(data['industry']).strip()
    if 'verification_document_url' in data:
        detail.verification_document_url = str(data['verification_document_url']).strip()

    try:
        db.session.commit()
        return api_success(data={'alumni_detail': detail.to_dict()}, message="Alumni details updated.")
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to update alumni details: {str(e)}", 500)
