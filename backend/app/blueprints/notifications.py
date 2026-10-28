from flask import Blueprint, request
from .. import db
from ..models import Notification
from ..utils.response import api_success, api_error
from ..utils.decorators import jwt_required

notifications_bp = Blueprint('notifications', __name__)


@notifications_bp.route('', methods=['GET'])
@jwt_required
def get_notifications():
    """Retrieve notifications for the current user."""
    user_id = request.user_id
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 20, type=int), 100)

    pagination = Notification.query.filter_by(user_id=user_id).order_by(
        Notification.created_at.desc()
    ).paginate(page=page, per_page=per_page, error_out=False)

    unread_count = Notification.query.filter_by(user_id=user_id, is_read=False).count()

    return api_success(
        data={
            'notifications': [n.to_dict() for n in pagination.items],
            'unread_count': unread_count,
            'pagination': {
                'page': pagination.page,
                'per_page': pagination.per_page,
                'total_items': pagination.total,
                'total_pages': pagination.pages,
            },
        }
    )


@notifications_bp.route('/<int:notif_id>/read', methods=['PUT'])
@jwt_required
def mark_notification_as_read(notif_id):
    """Mark a specific notification as read."""
    notif = Notification.query.filter_by(id=notif_id, user_id=request.user_id).first()
    if not notif:
        return api_error("Notification not found.", 404)

    try:
        notif.is_read = True
        db.session.commit()
        return api_success(data={'notification': notif.to_dict()}, message="Marked as read.")
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to update notification: {str(e)}", 500)


@notifications_bp.route('/read-all', methods=['PUT'])
@jwt_required
def mark_all_as_read():
    """Mark all unread notifications as read for current user."""
    user_id = request.user_id
    try:
        Notification.query.filter_by(user_id=user_id, is_read=False).update({'is_read': True})
        db.session.commit()
        return api_success(message="All notifications marked as read.")
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to update notifications: {str(e)}", 500)
