import datetime
from flask import Blueprint, request
from sqlalchemy import or_, and_
from .. import db
from ..models import User, Profile, AlumniDetail, MentorProfile, MentorAvailabilitySlot, MentorshipBooking, Notification
from ..utils.response import api_success, api_error
from ..utils.decorators import jwt_required, roles_required
from ..services.audit_service import AuditService

mentorship_bp = Blueprint('mentorship', __name__)


@mentorship_bp.route('/mentors', methods=['GET'])
@jwt_required
def list_mentors():
    """Discover available alumni mentors with filtering by expertise, name, company."""
    query_str = request.args.get('q', '').strip()
    expertise = request.args.get('expertise', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 12, type=int), 50)

    q = db.session.query(MentorProfile).join(User, MentorProfile.user_id == User.id).filter(
        User.is_active == True,
        MentorProfile.is_available == True,
    )

    if expertise:
        q = q.filter(MentorProfile.expertise_areas.ilike(f"%{expertise}%"))

    if query_str:
        q = q.outerjoin(Profile, User.id == Profile.user_id).filter(
            or_(
                MentorProfile.bio.ilike(f"%{query_str}%"),
                MentorProfile.expertise_areas.ilike(f"%{query_str}%"),
                Profile.first_name.ilike(f"%{query_str}%"),
                Profile.last_name.ilike(f"%{query_str}%"),
                Profile.headline.ilike(f"%{query_str}%"),
            )
        )

    pagination = q.paginate(page=page, per_page=per_page, error_out=False)

    return api_success(
        data={
            'mentors': [m.to_dict() for m in pagination.items],
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


@mentorship_bp.route('/mentors/<int:mentor_user_id>', methods=['GET'])
@jwt_required
def get_mentor_detail(mentor_user_id):
    """Retrieve mentor profile and upcoming unbooked availability slots."""
    mentor_profile = MentorProfile.query.filter_by(user_id=mentor_user_id).first()
    if not mentor_profile:
        return api_error("Mentor profile not found.", 404)

    today = datetime.date.today()
    slots = MentorAvailabilitySlot.query.filter(
        MentorAvailabilitySlot.mentor_id == mentor_user_id,
        MentorAvailabilitySlot.slot_date >= today,
        MentorAvailabilitySlot.is_booked == False,
    ).order_by(MentorAvailabilitySlot.slot_date.asc(), MentorAvailabilitySlot.start_time.asc()).all()

    data = mentor_profile.to_dict()
    data['available_slots'] = [s.to_dict() for s in slots]
    return api_success(data={'mentor': data})


@mentorship_bp.route('/slots', methods=['POST'])
@roles_required('ALUMNI', 'ADMIN')
def create_availability_slots():
    """Alumni mentor adds calendar availability slots."""
    mentor_id = request.user_id
    data = request.get_json() or {}

    slots_input = data.get('slots', [])
    if not slots_input and ('slot_date' in data and 'start_time' in data and 'end_time' in data):
        slots_input = [data]

    if not slots_input:
        return api_error("At least one slot with slot_date, start_time, and end_time is required.", 400)

    created_slots = []
    try:
        for item in slots_input:
            slot_date = datetime.date.fromisoformat(item['slot_date'])
            start_time = datetime.datetime.strptime(item['start_time'], '%H:%M').time()
            end_time = datetime.datetime.strptime(item['end_time'], '%H:%M').time()

            if start_time >= end_time:
                continue

            # Check if identical slot already exists
            existing = MentorAvailabilitySlot.query.filter_by(
                mentor_id=mentor_id,
                slot_date=slot_date,
                start_time=start_time,
                end_time=end_time,
            ).first()

            if not existing:
                new_slot = MentorAvailabilitySlot(
                    mentor_id=mentor_id,
                    slot_date=slot_date,
                    start_time=start_time,
                    end_time=end_time,
                    is_booked=False,
                )
                db.session.add(new_slot)
                created_slots.append(new_slot)

        db.session.commit()
        return api_success(
            data={'slots': [s.to_dict() for s in created_slots]},
            message=f"Added {len(created_slots)} availability slot(s).",
            status_code=201,
        )
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to create availability slots: {str(e)}", 500)


@mentorship_bp.route('/slots/<int:slot_id>', methods=['DELETE'])
@roles_required('ALUMNI', 'ADMIN')
def delete_availability_slot(slot_id):
    """Delete an unbooked availability slot."""
    slot = MentorAvailabilitySlot.query.get(slot_id)
    if not slot:
        return api_error("Slot not found.", 404)

    if slot.mentor_id != request.user_id and request.user_role != 'ADMIN':
        return api_error("Not authorized to remove this slot.", 403)

    if slot.is_booked:
        return api_error("Cannot delete a slot that already has an active booking.", 400)

    try:
        db.session.delete(slot)
        db.session.commit()
        return api_success(message="Slot deleted successfully.")
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to delete slot: {str(e)}", 500)


@mentorship_bp.route('/book', methods=['POST'])
@roles_required('STUDENT')
def book_mentorship_session():
    """
    Transaction-safe mentorship session booking with anti-double-booking locking.
    Prevents race conditions and overlapping mentor sessions.
    """
    data = request.get_json() or {}
    mentor_id = data.get('mentor_id')
    slot_id = data.get('slot_id')
    goal_notes = data.get('goal_notes', '').strip()

    if not mentor_id or not goal_notes:
        return api_error("Mentor ID and goal notes are required.", 400)

    student_id = request.user_id

    try:
        # Begin explicit transaction block
        with db.session.begin_nested():
            if slot_id:
                # Lock the slot row with FOR UPDATE to prevent concurrent booking
                slot = db.session.query(MentorAvailabilitySlot).filter_by(
                    id=slot_id,
                    mentor_id=mentor_id,
                ).with_for_update().first()

                if not slot:
                    return api_error("Specified mentor slot was not found.", 404)

                if slot.is_booked:
                    return api_error("This slot has already been booked by another student.", 409)

                session_date = slot.slot_date
                start_time = slot.start_time
                end_time = slot.end_time
            else:
                session_date = datetime.date.fromisoformat(data['session_date'])
                start_time = datetime.datetime.strptime(data['start_time'], '%H:%M').time()
                end_time = datetime.datetime.strptime(data['end_time'], '%H:%M').time()

            # Transactional conflict check: Ensure mentor has no overlapping confirmed/pending booking
            mentor_conflict = db.session.query(MentorshipBooking).filter(
                MentorshipBooking.mentor_id == mentor_id,
                MentorshipBooking.session_date == session_date,
                MentorshipBooking.status.in_(['PENDING', 'CONFIRMED']),
                MentorshipBooking.start_time < end_time,
                MentorshipBooking.end_time > start_time,
            ).first()

            if mentor_conflict:
                return api_error("The mentor is already booked for an overlapping time on this date.", 409)

            # Check student does not double book themselves
            student_conflict = db.session.query(MentorshipBooking).filter(
                MentorshipBooking.student_id == student_id,
                MentorshipBooking.session_date == session_date,
                MentorshipBooking.status.in_(['PENDING', 'CONFIRMED']),
                MentorshipBooking.start_time < end_time,
                MentorshipBooking.end_time > start_time,
            ).first()

            if student_conflict:
                return api_error("You already have an active mentorship booking during this time interval.", 409)

            # Mark slot booked
            if slot_id and slot:
                slot.is_booked = True

            booking = MentorshipBooking(
                mentor_id=mentor_id,
                student_id=student_id,
                slot_id=slot_id,
                session_date=session_date,
                start_time=start_time,
                end_time=end_time,
                status='PENDING',
                goal_notes=goal_notes,
            )
            db.session.add(booking)
            db.session.flush()

            # Create notification for mentor
            student_user = User.query.get(student_id)
            student_name = f"{student_user.profile.first_name} {student_user.profile.last_name}" if student_user.profile else "A student"
            notif = Notification(
                user_id=mentor_id,
                notification_type='BOOKING',
                title="New Mentorship Request",
                message=f"{student_name} requested a mentorship session on {session_date.strftime('%b %d, %Y')}.",
                link="/mentorship/bookings",
            )
            db.session.add(notif)

        db.session.commit()

        AuditService.log(
            action='MENTORSHIP_BOOKED',
            entity_type='MentorshipBooking',
            entity_id=booking.id,
            details={'mentor_id': mentor_id, 'date': str(session_date)},
            actor_id=student_id,
        )

        return api_success(
            data={'booking': booking.to_dict()},
            message="Mentorship session requested. Awaiting mentor confirmation.",
            status_code=201,
        )

    except Exception as e:
        db.session.rollback()
        return api_error(f"Booking transaction failed: {str(e)}", 500)


@mentorship_bp.route('/bookings/<int:booking_id>/decision', methods=['PUT'])
@jwt_required
def handle_booking_decision(booking_id):
    """Mentor accepts or declines a mentorship booking."""
    booking = MentorshipBooking.query.get(booking_id)
    if not booking:
        return api_error("Booking not found.", 404)

    if booking.mentor_id != request.user_id and request.user_role != 'ADMIN':
        return api_error("Only the assigned mentor can approve or decline this booking.", 403)

    data = request.get_json() or {}
    decision = data.get('decision', '').upper()  # CONFIRMED, REJECTED, CANCELLED, COMPLETED
    meeting_link = data.get('meeting_link', '').strip()
    mentor_notes = data.get('mentor_notes', '').strip()

    if decision not in ['CONFIRMED', 'REJECTED', 'CANCELLED', 'COMPLETED']:
        return api_error("Invalid decision status.", 400)

    try:
        booking.status = decision
        if meeting_link:
            booking.meeting_link = meeting_link
        if mentor_notes:
            booking.mentor_notes = mentor_notes

        # If rejected or cancelled, free the slot if attached
        if decision in ['REJECTED', 'CANCELLED'] and booking.slot:
            booking.slot.is_booked = False

        # Notify student
        student_notif = Notification(
            user_id=booking.student_id,
            notification_type='BOOKING',
            title=f"Mentorship Session {decision.capitalize()}",
            message=f"Your mentorship session on {booking.session_date.strftime('%b %d')} has been {decision.lower()}.",
            link="/mentorship/bookings",
        )
        db.session.add(student_notif)
        db.session.commit()

        AuditService.log(
            action=f'MENTORSHIP_{decision}',
            entity_type='MentorshipBooking',
            entity_id=booking.id,
            actor_id=request.user_id,
        )

        return api_success(data={'booking': booking.to_dict()}, message=f"Booking {decision.lower()} successfully.")
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to update booking status: {str(e)}", 500)


@mentorship_bp.route('/bookings/<int:booking_id>/feedback', methods=['POST'])
@roles_required('STUDENT')
def submit_feedback(booking_id):
    """Student provides rating and feedback post-session."""
    booking = MentorshipBooking.query.get(booking_id)
    if not booking:
        return api_error("Booking not found.", 404)

    if booking.student_id != request.user_id:
        return api_error("Only the booked mentee can submit feedback.", 403)

    data = request.get_json() or {}
    rating = data.get('rating')
    feedback = data.get('feedback', '').strip()

    if not rating or not (1 <= int(rating) <= 5):
        return api_error("Rating must be an integer between 1 and 5.", 400)

    try:
        booking.student_rating = int(rating)
        booking.student_feedback = feedback
        booking.status = 'COMPLETED'
        db.session.commit()

        return api_success(data={'booking': booking.to_dict()}, message="Feedback submitted. Thank you!")
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to submit feedback: {str(e)}", 500)


@mentorship_bp.route('/my-bookings', methods=['GET'])
@jwt_required
def get_my_bookings():
    """Retrieve all bookings involving the authenticated student or mentor."""
    user_id = request.user_id
    role = request.user_role

    if role == 'ALUMNI':
        bookings = MentorshipBooking.query.filter_by(mentor_id=user_id).order_by(MentorshipBooking.session_date.desc()).all()
    elif role == 'STUDENT':
        bookings = MentorshipBooking.query.filter_by(student_id=user_id).order_by(MentorshipBooking.session_date.desc()).all()
    else:
        bookings = MentorshipBooking.query.order_by(MentorshipBooking.session_date.desc()).all()

    return api_success(data={'bookings': [b.to_dict() for b in bookings]})


@mentorship_bp.route('/bookings/<int:booking_id>/summary', methods=['POST'])
@jwt_required
def save_session_summary(booking_id):
    """
    Save consensual session notes and extract structured action items and follow-up milestones.
    Accessible to either participant (mentor or mentee).
    """
    from ..models.mentorship_summary import MentorshipSessionSummary

    booking = MentorshipBooking.query.get(booking_id)
    if not booking:
        return api_error("Booking not found.", 404)

    user_id = request.user_id
    if user_id not in [booking.mentor_id, booking.student_id] and request.user_role != 'ADMIN':
        return api_error("You must be an active participant in this session to record summaries.", 403)

    data = request.get_json() or {}
    session_notes = data.get('session_notes', '').strip()
    key_takeaways = data.get('key_takeaways', '').strip()
    action_items = data.get('action_items', [])
    recommended_resources = data.get('recommended_resources', [])
    follow_up_date_str = data.get('follow_up_date')

    if not session_notes:
        return api_error("Session notes are required.", 400)

    # Automated action-item extractor if not provided
    if not action_items:
        # Generate 3 targeted action items based on notes
        lines = [line.strip().lstrip('•-*1234567890. ') for line in session_notes.split('\n') if line.strip()]
        if len(lines) >= 2:
            action_items = [f"Complete: {lines[0]}", f"Deepen practice in: {lines[1]}", "Push progress updates to GitHub / portfolio for next check-in"]
        else:
            action_items = [
                "Review recommended system design patterns and practice on LeetCode/HackerRank.",
                "Revise resume project bullet points using STAR action-result verbs.",
                "Schedule a follow-up 30-day sync to review completed project milestone."
            ]

    if not recommended_resources:
        recommended_resources = [
            "Designing Data-Intensive Applications (Kleppmann)",
            "System Design Primer (GitHub / Donne Martin)",
            "FAANG Behavioral STAR Interview Preparation Guide"
        ]

    follow_up_date = None
    if follow_up_date_str:
        try:
            follow_up_date = datetime.date.fromisoformat(follow_up_date_str)
        except Exception:
            pass

    summary = MentorshipSessionSummary.query.filter_by(booking_id=booking.id).first()
    if summary:
        summary.session_notes = session_notes
        summary.key_takeaways = key_takeaways
        summary.set_action_items(action_items)
        summary.set_resources(recommended_resources)
        if follow_up_date:
            summary.follow_up_date = follow_up_date
    else:
        summary = MentorshipSessionSummary(
            booking_id=booking.id,
            author_id=user_id,
            session_notes=session_notes,
            key_takeaways=key_takeaways,
            follow_up_date=follow_up_date
        )
        summary.set_action_items(action_items)
        summary.set_resources(recommended_resources)
        db.session.add(summary)

    # Mark booking completed if still confirmed
    if booking.status == 'CONFIRMED':
        booking.status = 'COMPLETED'

    db.session.commit()

    return api_success(
        data={'summary': summary.to_dict()},
        message="Mentorship session summary and action items recorded successfully!"
    )


@mentorship_bp.route('/bookings/<int:booking_id>/summary', methods=['GET'])
@jwt_required
def get_session_summary(booking_id):
    """Retrieve session summary, action items, and follow-up timeline."""
    from ..models.mentorship_summary import MentorshipSessionSummary

    booking = MentorshipBooking.query.get(booking_id)
    if not booking:
        return api_error("Booking not found.", 404)

    summary = MentorshipSessionSummary.query.filter_by(booking_id=booking.id).first()
    if not summary:
        return api_success(data={'summary': None})

    return api_success(data={'summary': summary.to_dict()})
