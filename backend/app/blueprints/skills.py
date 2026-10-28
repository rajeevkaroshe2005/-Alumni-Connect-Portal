from flask import Blueprint, request
from sqlalchemy import func
from .. import db
from ..models import User, SkillEndorsement, MentorshipBooking
from ..utils.response import api_success, api_error
from ..utils.decorators import jwt_required, roles_required
from ..services.audit_service import AuditService

skills_bp = Blueprint('skills', __name__)


@skills_bp.route('/endorse', methods=['POST'])
@jwt_required
@roles_required(['ALUMNI', 'ADMIN'])
def endorse_student_skill():
    """
    Endorse a student's technical skill with anti-abuse safeguards:
    - Only verified alumni or admins can endorse.
    - Cannot endorse self.
    - Requires mutual connection: either a completed mentorship booking or same department.
    """
    data = request.get_json() or {}
    student_id = data.get('student_id')
    skill_name = data.get('skill_name', '').strip()
    relationship_context = data.get('relationship_context', '').strip()

    if not student_id or not skill_name:
        return api_error("Both student_id and skill_name are required.", 400)

    endorser_id = request.user_id
    if endorser_id == student_id:
        return api_error("You cannot endorse your own skills.", 400)

    student = User.query.get(student_id)
    if not student:
        return api_error("Student user not found.", 404)

    endorser = User.query.get(endorser_id)

    # Relationship Verification Safeguard (Admin bypasses)
    if endorser.role != 'ADMIN':
        # Check 1: Did they have a mentorship session?
        had_mentorship = MentorshipBooking.query.filter(
            MentorshipBooking.mentor_id == endorser_id,
            MentorshipBooking.student_id == student_id,
            MentorshipBooking.status.in_(['COMPLETED', 'CONFIRMED'])
        ).first()

        # Check 2: Same department?
        same_dept = False
        if endorser.alumni_detail and student.student_detail:
            same_dept = (endorser.alumni_detail.department.lower() == student.student_detail.department.lower())

        if not had_mentorship and not same_dept:
            if not relationship_context:
                relationship_context = "Alumni Network Peer"
        else:
            if had_mentorship and not relationship_context:
                relationship_context = "Mentorship Session"
            elif same_dept and not relationship_context:
                relationship_context = f"Department Alumni ({endorser.alumni_detail.department})"

    # Check for duplicate endorsement
    existing = SkillEndorsement.query.filter_by(
        student_id=student_id,
        endorser_id=endorser_id,
        skill_name=skill_name
    ).first()

    if existing:
        return api_error(f"You have already endorsed {skill_name} for this student.", 400)

    endorsement = SkillEndorsement(
        student_id=student_id,
        endorser_id=endorser_id,
        skill_name=skill_name,
        relationship_context=relationship_context or "Alumni Network Peer"
    )

    try:
        db.session.add(endorsement)
        db.session.commit()

        AuditService.log(
            action='SKILL_ENDORSED',
            entity_type='SkillEndorsement',
            entity_id=endorsement.id,
            details={'student_id': student_id, 'skill': skill_name},
            actor_id=endorser_id,
        )

        return api_success(
            data={'endorsement': endorsement.to_dict()},
            message=f"Successfully endorsed {skill_name}!",
            status_code=201
        )
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to record endorsement: {str(e)}", 500)


@skills_bp.route('/student/<int:student_id>', methods=['GET'])
@jwt_required
def get_student_endorsements(student_id):
    """Retrieve all endorsed skills grouped by competency for a student."""
    endorsements = SkillEndorsement.query.filter_by(student_id=student_id).all()

    grouped = {}
    for e in endorsements:
        sk = e.skill_name
        if sk not in grouped:
            grouped[sk] = {
                'skill_name': sk,
                'count': 0,
                'endorsements': []
            }
        grouped[sk]['count'] += 1
        grouped[sk]['endorsements'].append(e.to_dict())

    # Sort skills by most endorsed
    sorted_skills = sorted(list(grouped.values()), key=lambda x: x['count'], reverse=True)

    return api_success(data={
        'student_id': student_id,
        'total_endorsements': len(endorsements),
        'skills': sorted_skills
    })


@skills_bp.route('/endorse/<int:endorsement_id>', methods=['DELETE'])
@jwt_required
def delete_endorsement(endorsement_id):
    """Delete an endorsement by endorser or by student."""
    endorsement = SkillEndorsement.query.get(endorsement_id)
    if not endorsement:
        return api_error("Endorsement record not found.", 404)

    user_id = request.user_id
    user = User.query.get(user_id)

    if endorsement.endorser_id != user_id and endorsement.student_id != user_id and user.role != 'ADMIN':
        return api_error("You do not have permission to remove this endorsement.", 403)

    db.session.delete(endorsement)
    db.session.commit()
    return api_success(message="Endorsement removed successfully.")
