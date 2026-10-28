import pytest
import datetime
from app import db
from app.models import (
    User, Profile, AlumniDetail, StudentDetail,
    SkillEndorsement, MentorshipSessionSummary, MentorshipBooking,
    MentorProfile, MentorAvailabilitySlot, CollaborationProject,
    ProjectApplication, AlumniAchievement, AchievementCheer,
    DonationCampaign, DonationTransaction, Event, EventRSVP, EventFeedback
)


def test_skill_endorsement_with_safeguards(client, seeded_users, auth_headers):
    student = seeded_users['student']
    alumnus = seeded_users['alumni']

    # 1. Student trying to endorse their own skill must be rejected
    res_self = client.post(
        '/api/v1/skills/endorse',
        json={'student_id': student.id, 'skill_name': 'Python'},
        headers=auth_headers['student']
    )
    # Role check: only ALUMNI/ADMIN can call endorse
    assert res_self.status_code == 403

    # 2. Alumnus endorses student skill
    res = client.post(
        '/api/v1/skills/endorse',
        json={
            'student_id': student.id,
            'skill_name': 'Docker',
            'relationship_context': 'Mentorship Session'
        },
        headers=auth_headers['alumni']
    )
    assert res.status_code == 201
    assert res.json['success'] is True
    assert res.json['data']['endorsement']['skill_name'] == 'Docker'

    # 3. Duplicate endorsement safeguard
    res_dup = client.post(
        '/api/v1/skills/endorse',
        json={'student_id': student.id, 'skill_name': 'Docker'},
        headers=auth_headers['alumni']
    )
    assert res_dup.status_code == 400

    # 4. Fetch student endorsements list
    res_list = client.get(
        f'/api/v1/skills/student/{student.id}',
        headers=auth_headers['student']
    )
    assert res_list.status_code == 200
    skills = res_list.json['data']['skills']
    assert any(s['skill_name'] == 'Docker' for s in skills)


def test_mentorship_session_summary_and_action_items(client, seeded_users, auth_headers):
    student = seeded_users['student']
    alumnus = seeded_users['alumni']

    # Create confirmed booking
    booking = MentorshipBooking(
        mentor_id=alumnus.id,
        student_id=student.id,
        session_date=datetime.date.today(),
        start_time=datetime.time(15, 0),
        end_time=datetime.time(15, 45),
        status='CONFIRMED',
        goal_notes="Technical system design guidance"
    )
    db.session.add(booking)
    db.session.commit()
    booking_id = booking.id

    # Post session summary with notes
    res = client.post(
        f'/api/v1/mentorship/bookings/{booking_id}/summary',
        json={
            'session_notes': "Discussed distributed caching with Redis and horizontal scaling.\nMentees should practice database sharding questions.",
            'key_takeaways': "Strong grasp of HTTP caching; needs practice on cache invalidation strategies.",
            'follow_up_date': str(datetime.date.today() + datetime.timedelta(days=14))
        },
        headers=auth_headers['alumni']
    )
    assert res.status_code == 200
    assert res.json['success'] is True
    summary = res.json['data']['summary']
    assert len(summary['action_items']) >= 2

    # Get summary
    res_get = client.get(
        f'/api/v1/mentorship/bookings/{booking_id}/summary',
        headers=auth_headers['student']
    )
    assert res_get.status_code == 200
    assert res_get.json['data']['summary'] is not None


def test_opportunity_alerts_and_network_graph(client, seeded_users, auth_headers):
    # Test Opportunity Alerts
    res_alerts = client.get(
        '/api/v1/ai/opportunity-alerts',
        headers=auth_headers['student']
    )
    assert res_alerts.status_code == 200
    assert res_alerts.json['success'] is True
    assert 'alerts' in res_alerts.json['data']

    # Test Network Graph
    res_graph = client.get(
        '/api/v1/ai/network-graph',
        headers=auth_headers['student']
    )
    assert res_graph.status_code == 200
    assert res_graph.json['success'] is True
    graph = res_graph.json['data']
    assert len(graph['nodes']) >= 1
    assert any(n['type'] == 'CURRENT_USER' for n in graph['nodes'])


def test_digital_event_qr_checkin_and_feedback(client, seeded_users, auth_headers):
    alumnus = seeded_users['alumni']
    now = datetime.datetime.now(datetime.timezone.utc)
    evt = Event(
        organizer_id=alumnus.id,
        title="Specialist Cloud Native Masterclass",
        description="Deep dive on Kubernetes and cloud architectures.",
        event_type="WORKSHOP",
        start_time=now + datetime.timedelta(days=2),
        end_time=now + datetime.timedelta(days=2, hours=2),
        capacity=50,
        moderation_status="APPROVED"
    )
    db.session.add(evt)
    db.session.commit()
    evt_id = evt.id

    # 1. Student RSVPs
    res_rsvp = client.post(
        f'/api/v1/events/{evt_id}/rsvp',
        headers=auth_headers['student']
    )
    assert res_rsvp.status_code in [200, 201]
    token = res_rsvp.json['data']['checkin_token']
    assert token is not None

    # 2. Check in attendee using digital token
    res_checkin = client.post(
        f'/api/v1/events/{evt_id}/checkin',
        json={'checkin_token': token},
        headers=auth_headers['alumni']
    )
    assert res_checkin.status_code == 200
    assert res_checkin.json['data']['rsvp']['status'] == 'ATTENDED'

    # 3. Submit 5-star post-event feedback
    res_fb = client.post(
        f'/api/v1/events/{evt_id}/feedback',
        json={'rating': 5, 'feedback_text': 'Outstanding hands-on session with production-grade insights!'},
        headers=auth_headers['student']
    )
    assert res_fb.status_code == 200

    # 4. View event feedbacks
    res_fb_list = client.get(
        f'/api/v1/events/{evt_id}/feedback',
        headers=auth_headers['student']
    )
    assert res_fb_list.status_code == 200
    assert res_fb_list.json['data']['average_rating'] == 5.0


def test_project_collaboration_board(client, seeded_users, auth_headers):
    # 1. Student creates project
    res_create = client.post(
        '/api/v1/projects',
        json={
            'title': 'Autonomous Rover with ROS2 & Vision',
            'description': 'Building an indoor mapping robot for campus library navigation.',
            'domain': 'IOT_HARDWARE',
            'roles_needed': ['ROS2 Engineer', 'Computer Vision Contributor'],
            'skills_needed': ['Python', 'C++', 'OpenCV'],
            'team_size_limit': 4
        },
        headers=auth_headers['student']
    )
    assert res_create.status_code == 201
    proj_id = res_create.json['data']['project']['id']

    # 2. Alumnus applies to advise/contribute
    res_apply = client.post(
        f'/api/v1/projects/{proj_id}/apply',
        json={
            'role_applied': 'Computer Vision Contributor',
            'pitch': 'I have 3 years of robotics experience at autonomous delivery startups and would love to guide the vision stack.'
        },
        headers=auth_headers['alumni']
    )
    assert res_apply.status_code == 201
    app_id = res_apply.json['data']['application']['id']

    # 3. Creator accepts application
    res_decision = client.put(
        f'/api/v1/projects/applications/{app_id}',
        json={'status': 'ACCEPTED'},
        headers=auth_headers['student']
    )
    assert res_decision.status_code == 200
    assert res_decision.json['data']['application']['status'] == 'ACCEPTED'


def test_alumni_achievement_wall_and_cheers(client, seeded_users, auth_headers):
    # 1. Alumnus posts milestone
    res_post = client.post(
        '/api/v1/achievements',
        json={
            'title': 'Selected for Y Combinator Winter 2026 Batch',
            'category': 'FUNDING',
            'company': 'NeuralGrid AI',
            'description': 'Our developer tooling startup has been accepted into YC with $500k in pre-seed funding.',
            'proof_url': 'https://techcrunch.com/yc-w26'
        },
        headers=auth_headers['alumni']
    )
    assert res_post.status_code == 201
    ach_id = res_post.json['data']['achievement']['id']

    # 2. Student cheers milestone
    res_cheer = client.post(
        f'/api/v1/achievements/{ach_id}/cheer',
        headers=auth_headers['student']
    )
    assert res_cheer.status_code == 200
    assert res_cheer.json['data']['has_cheered'] is True
    assert res_cheer.json['data']['cheers_count'] >= 1


def test_donation_campaign_and_pledge(client, seeded_users, auth_headers):
    # 1. Admin creates campaign
    res_camp = client.post(
        '/api/v1/donations/campaigns',
        json={
            'title': 'High-Performance Supercomputing GPU Pod',
            'description': 'Acquiring 8x NVIDIA H100 GPUs for university deep learning lab.',
            'category': 'LAB_EQUIPMENT',
            'target_amount': 5000000.00
        },
        headers=auth_headers['admin']
    )
    assert res_camp.status_code == 201
    camp_id = res_camp.json['data']['campaign']['id']

    # 2. Alumnus pledges donation
    res_pledge = client.post(
        '/api/v1/donations/pledge',
        json={
            'campaign_id': camp_id,
            'amount': 25000.00,
            'is_anonymous': False,
            'donor_message': 'Proud to support our alma mater research community!'
        },
        headers=auth_headers['alumni']
    )
    assert res_pledge.status_code == 201
    assert res_pledge.json['data']['donation']['amount'] == 25000.00
    assert 'ALM-TXN' in res_pledge.json['data']['donation']['transaction_ref']
