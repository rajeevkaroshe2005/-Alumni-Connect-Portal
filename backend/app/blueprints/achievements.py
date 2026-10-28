from flask import Blueprint, request
from sqlalchemy import or_
from .. import db
from ..models import User, AlumniAchievement, AchievementCheer
from ..utils.response import api_success, api_error
from ..utils.decorators import jwt_required, roles_required
from ..services.audit_service import AuditService

achievements_bp = Blueprint('achievements', __name__)


@achievements_bp.route('', methods=['GET'])
@jwt_required
def get_achievements():
    """List verified alumni achievements with categories and cheer counts."""
    category = request.args.get('category', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 12, type=int), 50)

    q = AlumniAchievement.query.filter_by(is_approved=True)

    if category:
        q = q.filter(AlumniAchievement.category == category)

    q = q.order_by(AlumniAchievement.created_at.desc())
    pagination = q.paginate(page=page, per_page=per_page, error_out=False)

    user_id = request.user_id
    items = [a.to_dict(current_user_id=user_id) for a in pagination.items]

    return api_success(data={
        'achievements': items,
        'total': pagination.total,
        'page': page,
        'pages': pagination.pages,
    })


@achievements_bp.route('', methods=['POST'])
@jwt_required
@roles_required(['ALUMNI', 'ADMIN'])
def post_achievement():
    """Post an alumni achievement milestone."""
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    category = data.get('category', 'PROMOTION')
    company = data.get('company', '').strip()
    description = data.get('description', '').strip()
    proof_url = data.get('proof_url', '').strip()

    if not title or not description:
        return api_error("Title and description are required.", 400)

    user_id = request.user_id
    achievement = AlumniAchievement(
        alumnus_id=user_id,
        title=title,
        category=category,
        company=company,
        description=description,
        proof_url=proof_url,
        is_approved=True,  # Seeded / authenticated alumni auto-approved
    )

    try:
        db.session.add(achievement)
        db.session.commit()

        AuditService.log(
            action='ACHIEVEMENT_POSTED',
            entity_type='AlumniAchievement',
            entity_id=achievement.id,
            details={'title': title, 'category': category},
            actor_id=user_id,
        )

        return api_success(
            data={'achievement': achievement.to_dict(current_user_id=user_id)},
            message="Milestone posted to Alumni Wall of Fame!",
            status_code=201
        )
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to post achievement: {str(e)}", 500)


@achievements_bp.route('/<int:achievement_id>/cheer', methods=['POST'])
@jwt_required
def toggle_cheer(achievement_id):
    """Toggle a campus cheer/applaud for an achievement."""
    achievement = AlumniAchievement.query.get(achievement_id)
    if not achievement:
        return api_error("Achievement not found.", 404)

    user_id = request.user_id
    cheer = AchievementCheer.query.filter_by(achievement_id=achievement.id, user_id=user_id).first()

    if cheer:
        db.session.delete(cheer)
        achievement.cheers_count = max(0, achievement.cheers_count - 1)
        db.session.commit()
        return api_success(data={'has_cheered': False, 'cheers_count': achievement.cheers_count}, message="Cheer removed.")
    else:
        new_cheer = AchievementCheer(achievement_id=achievement.id, user_id=user_id)
        db.session.add(new_cheer)
        achievement.cheers_count += 1
        db.session.commit()
        return api_success(data={'has_cheered': True, 'cheers_count': achievement.cheers_count}, message="Cheered this milestone!")


@achievements_bp.route('/<int:achievement_id>/moderate', methods=['PUT'])
@jwt_required
@roles_required('ADMIN')
def moderate_achievement(achievement_id):
    """Admin moderate / approve or hide an achievement."""
    achievement = AlumniAchievement.query.get(achievement_id)
    if not achievement:
        return api_error("Achievement not found.", 404)

    data = request.get_json() or {}
    is_approved = data.get('is_approved', True)
    achievement.is_approved = bool(is_approved)
    db.session.commit()

    return api_success(
        data={'achievement': achievement.to_dict()},
        message=f"Achievement {'approved' if achievement.is_approved else 'hidden'}."
    )
