import datetime
import uuid
from flask import Blueprint, request
from sqlalchemy import or_, func
from .. import db
from ..models import Event, EventRSVP, User
from ..models.event_feedback import EventFeedback
from ..utils.response import api_success, api_error
from ..utils.decorators import jwt_required, roles_required
from ..services.audit_service import AuditService

events_bp = Blueprint('events', __name__)


@events_bp.route('', methods=['GET'])
@jwt_required
def get_events():
    """List approved events with filter by event type and search."""
    event_type = request.args.get('event_type', '').strip()
    query_str = request.args.get('q', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 10, type=int), 50)

    q = Event.query.filter_by(moderation_status='APPROVED', is_cancelled=False)

    if event_type:
        q = q.filter(Event.event_type == event_type)

    if query_str:
        q = q.filter(
            or_(
                Event.title.ilike(f"%{query_str}%"),
                Event.description.ilike(f"%{query_str}%"),
                Event.venue.ilike(f"%{query_str}%"),
            )
        )

    q = q.order_by(Event.start_time.asc())
    pagination = q.paginate(page=page, per_page=per_page, error_out=False)

    user_id = request.user_id
    rsvps_map = {
        r.event_id: r for r in EventRSVP.query.filter_by(user_id=user_id).all()
    }

    items = []
    for evt in pagination.items:
        data = evt.to_dict()
        user_rsvp = rsvps_map.get(evt.id)
        data['is_registered'] = user_rsvp is not None and user_rsvp.status in ['REGISTERED', 'ATTENDED']
        data['user_status'] = user_rsvp.status if user_rsvp else None
        data['checkin_token'] = user_rsvp.checkin_token if user_rsvp else None
        items.append(data)

    return api_success(data={
        'events': items,
        'total': pagination.total,
        'page': page,
        'pages': pagination.pages,
    })


@events_bp.route('/<int:event_id>', methods=['GET'])
@jwt_required
def get_event_detail(event_id):
    """Get single event with registration state for current user."""
    evt = Event.query.get(event_id)
    if not evt:
        return api_error("Event not found.", 404)

    user_id = request.user_id
    rsvp = EventRSVP.query.filter_by(event_id=evt.id, user_id=user_id).first()

    data = evt.to_dict()
    data['is_registered'] = rsvp is not None and rsvp.status in ['REGISTERED', 'ATTENDED']
    data['rsvp_status'] = rsvp.status if rsvp else None
    data['checkin_token'] = rsvp.checkin_token if rsvp else None
    data['attended'] = rsvp.status == 'ATTENDED' if rsvp else False

    # Calculate average feedback rating
    avg_rating = db.session.query(func.avg(EventFeedback.rating)).filter_by(event_id=evt.id).scalar()
    feedbacks_count = EventFeedback.query.filter_by(event_id=evt.id).count()
    data['avg_rating'] = round(float(avg_rating), 1) if avg_rating else None
    data['feedbacks_count'] = feedbacks_count

    return api_success(data={'event': data})


@events_bp.route('', methods=['POST'])
@jwt_required
@roles_required(['ALUMNI', 'ADMIN'])
def create_event():
    """Create a new campus or alumni event."""
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    event_type = data.get('event_type', 'WEBINAR')
    start_time_raw = data.get('start_time')
    end_time_raw = data.get('end_time')

    if not title or not description or not start_time_raw or not end_time_raw:
        return api_error("Title, description, start time, and end time are required.", 400)

    try:
        start_time = datetime.datetime.fromisoformat(start_time_raw.replace('Z', '+00:00'))
        end_time = datetime.datetime.fromisoformat(end_time_raw.replace('Z', '+00:00'))
    except Exception:
        return api_error("Invalid ISO timestamp format for start_time or end_time.", 400)

    if start_time >= end_time:
        return api_error("Start time must precede end time.", 400)

    user_id = request.user_id
    new_event = Event(
        organizer_id=user_id,
        title=title,
        description=description,
        event_type=event_type,
        venue=data.get('venue', 'Online / Virtual Platform'),
        meeting_url=data.get('meeting_url', ''),
        start_time=start_time,
        end_time=end_time,
        capacity=int(data.get('capacity', 100)),
        banner_url=data.get('banner_url', ''),
        moderation_status='APPROVED',
    )

    try:
        db.session.add(new_event)
        db.session.commit()

        AuditService.log(
            action='EVENT_CREATED',
            entity_type='Event',
            entity_id=new_event.id,
            details={'title': title, 'type': event_type},
            actor_id=user_id,
        )

        return api_success(data={'event': new_event.to_dict()}, message="Event scheduled successfully.", status_code=201)
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to create event: {str(e)}", 500)


@events_bp.route('/<int:event_id>/rsvp', methods=['POST'])
@jwt_required
def toggle_rsvp(event_id):
    """Register or cancel RSVP attendance with digital check-in token."""
    evt = Event.query.get(event_id)
    if not evt or evt.is_cancelled:
        return api_error("Event is not available for RSVP.", 400)

    user_id = request.user_id
    existing_rsvp = EventRSVP.query.filter_by(event_id=evt.id, user_id=user_id).first()

    try:
        active_count = EventRSVP.query.filter(
            EventRSVP.event_id == evt.id,
            EventRSVP.status.in_(['REGISTERED', 'ATTENDED'])
        ).count()

        if existing_rsvp:
            if existing_rsvp.status in ['REGISTERED', 'ATTENDED']:
                existing_rsvp.status = 'CANCELLED'
                db.session.commit()
                return api_success(data={'is_registered': False}, message="RSVP registration cancelled.")
            else:
                if active_count >= evt.capacity:
                    return api_error("This event has reached full capacity.", 400)
                existing_rsvp.status = 'REGISTERED'
                if not existing_rsvp.checkin_token:
                    existing_rsvp.checkin_token = uuid.uuid4().hex[:12].upper()
                db.session.commit()
                return api_success(
                    data={'is_registered': True, 'checkin_token': existing_rsvp.checkin_token},
                    message="Successfully registered for the event!"
                )
        else:
            if active_count >= evt.capacity:
                return api_error("This event has reached full capacity.", 400)

            token = uuid.uuid4().hex[:12].upper()
            rsvp = EventRSVP(
                event_id=evt.id,
                user_id=user_id,
                status='REGISTERED',
                checkin_token=token
            )
            db.session.add(rsvp)
            db.session.commit()
            return api_success(
                data={'is_registered': True, 'checkin_token': token},
                message="Successfully registered for the event!",
                status_code=201
            )

    except Exception as e:
        db.session.rollback()
        return api_error(f"RSVP failed: {str(e)}", 500)


@events_bp.route('/<int:event_id>/checkin', methods=['POST'])
@jwt_required
def checkin_attendee(event_id):
    """Verify attendee digital QR token or mark check-in by organizer."""
    evt = Event.query.get(event_id)
    if not evt:
        return api_error("Event not found.", 404)

    data = request.get_json() or {}
    token = (data.get('checkin_token') or data.get('token') or '').strip().upper()
    attendee_id = data.get('attendee_id')

    q = EventRSVP.query.filter_by(event_id=evt.id)
    if token:
        rsvp = q.filter_by(checkin_token=token).first()
    elif attendee_id:
        rsvp = q.filter_by(user_id=attendee_id).first()
    else:
        # Default to current user's RSVP if checking in themselves at venue
        rsvp = q.filter_by(user_id=request.user_id).first()

    if not rsvp:
        return api_error("Valid RSVP pass not found for this event.", 404)

    if rsvp.status == 'ATTENDED':
        return api_success(data={'rsvp': rsvp.to_dict()}, message="Attendee has already been checked in.")

    rsvp.status = 'ATTENDED'
    rsvp.checked_in_at = datetime.datetime.now(datetime.timezone.utc)
    db.session.commit()

    return api_success(data={'rsvp': rsvp.to_dict()}, message=f"Check-in successful for {rsvp.to_dict()['user_name']}!")


@events_bp.route('/<int:event_id>/feedback', methods=['POST'])
@jwt_required
def submit_event_feedback(event_id):
    """Submit post-event 1-5 star rating and review."""
    evt = Event.query.get(event_id)
    if not evt:
        return api_error("Event not found.", 404)

    data = request.get_json() or {}
    rating = data.get('rating')
    feedback_text = data.get('feedback_text', '').strip()

    if not rating or not (1 <= int(rating) <= 5):
        return api_error("Rating must be an integer between 1 and 5.", 400)

    user_id = request.user_id
    existing = EventFeedback.query.filter_by(event_id=evt.id, user_id=user_id).first()
    if existing:
        existing.rating = int(rating)
        existing.feedback_text = feedback_text
    else:
        fb = EventFeedback(event_id=evt.id, user_id=user_id, rating=int(rating), feedback_text=feedback_text)
        db.session.add(fb)

    db.session.commit()
    return api_success(message="Feedback submitted successfully!")


@events_bp.route('/<int:event_id>/feedback', methods=['GET'])
@jwt_required
def get_event_feedbacks(event_id):
    """List feedbacks and aggregated rating for an event."""
    evt = Event.query.get(event_id)
    if not evt:
        return api_error("Event not found.", 404)

    feedbacks = EventFeedback.query.filter_by(event_id=evt.id).order_by(EventFeedback.created_at.desc()).all()
    avg_rating = db.session.query(func.avg(EventFeedback.rating)).filter_by(event_id=evt.id).scalar()

    return api_success(data={
        'feedbacks': [f.to_dict() for f in feedbacks],
        'average_rating': round(float(avg_rating), 1) if avg_rating else None,
        'total_feedbacks': len(feedbacks),
    })


@events_bp.route('/<int:event_id>/attendees', methods=['GET'])
@jwt_required
def get_attendees(event_id):
    """List registered attendees for an event with attendance status."""
    evt = Event.query.get(event_id)
    if not evt:
        return api_error("Event not found.", 404)

    attendees = EventRSVP.query.filter_by(event_id=evt.id).filter(
        EventRSVP.status.in_(['REGISTERED', 'ATTENDED'])
    ).all()
    return api_success(data={'attendees': [a.to_dict() for a in attendees]})
