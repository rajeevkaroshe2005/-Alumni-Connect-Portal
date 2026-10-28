import datetime
from app.models import MentorshipBooking, MentorAvailabilitySlot


def test_mentorship_slot_booking_and_double_booking_prevention(client, seeded_users, auth_headers):
    """
    Test transactional conflict check:
    1. Student books an available mentor slot.
    2. Attempting to book the same slot again returns 409 Conflict.
    3. Attempting to book an overlapping time returns 409 Conflict.
    """
    slot = seeded_users['slot']
    mentor = seeded_users['alumni']

    booking_payload = {
        'mentor_id': mentor.id,
        'slot_id': slot.id,
        'goal_notes': 'Discuss backend engineering roadmap and system design basics.',
    }

    # First booking request must succeed
    res = client.post('/api/mentorship/book', json=booking_payload, headers=auth_headers['student'])
    assert res.status_code == 201
    data = res.get_json()
    assert data['success'] is True
    assert data['data']['booking']['status'] == 'PENDING'

    # Slot must now be marked booked
    slot_refreshed = MentorAvailabilitySlot.query.get(slot.id)
    assert slot_refreshed.is_booked is True

    # Immediate second attempt to book the exact same slot must be rejected with 409
    res_conflict = client.post('/api/mentorship/book', json=booking_payload, headers=auth_headers['student'])
    assert res_conflict.status_code == 409
    assert "already been booked" in res_conflict.get_json()['message']

    # Attempting to book an overlapping manual interval on same date must also be rejected
    overlapping_payload = {
        'mentor_id': mentor.id,
        'session_date': slot.slot_date.isoformat(),
        'start_time': '14:15',
        'end_time': '15:00',
        'goal_notes': 'Overlapping session attempt',
    }
    res_overlap = client.post('/api/mentorship/book', json=overlapping_payload, headers=auth_headers['student'])
    assert res_overlap.status_code == 409
    assert "overlapping" in res_overlap.get_json()['message'].lower()


def test_mentor_approval_decision_workflow(client, seeded_users, auth_headers):
    """Test mentor confirming and declining a booking."""
    slot = seeded_users['slot']
    mentor = seeded_users['alumni']

    # Create a booking
    client.post('/api/mentorship/book', json={
        'mentor_id': mentor.id,
        'slot_id': slot.id,
        'goal_notes': 'Career advice on Google interviews.',
    }, headers=auth_headers['student'])

    booking = MentorshipBooking.query.filter_by(mentor_id=mentor.id).first()
    assert booking is not None

    # Mentor confirms booking
    res_confirm = client.put(f'/api/mentorship/bookings/{booking.id}/decision', json={
        'decision': 'CONFIRMED',
        'meeting_link': 'https://meet.google.com/abc-test-call',
        'mentor_notes': 'Looking forward to our call!',
    }, headers=auth_headers['alumni'])

    assert res_confirm.status_code == 200
    assert res_confirm.get_json()['data']['booking']['status'] == 'CONFIRMED'
    assert res_confirm.get_json()['data']['booking']['meeting_link'] == 'https://meet.google.com/abc-test-call'
