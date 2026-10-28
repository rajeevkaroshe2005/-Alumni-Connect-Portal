import pytest
from app import create_app, db
from app.models import User, Profile, StudentDetail, AlumniDetail, MentorProfile, MentorAvailabilitySlot, Job
from app.services.auth_service import AuthService
import datetime


@pytest.fixture
def app():
    """Create test application configured with in-memory SQLite database."""
    app = create_app('testing')
    with app.app_context():
        db.create_all()
        yield app
        db.session.remove()
        db.drop_all()


@pytest.fixture
def client(app):
    """Test HTTP client."""
    return app.test_client()


@pytest.fixture
def seeded_users(app):
    """Fixture providing initialized users across STUDENT, ALUMNI, and ADMIN roles."""
    pwd_hash = AuthService.hash_password("Password123!")

    admin = User(email="admin@test.edu", password_hash=pwd_hash, role="ADMIN")
    alumni = User(email="alumni@test.edu", password_hash=pwd_hash, role="ALUMNI")
    student = User(email="student@test.edu", password_hash=pwd_hash, role="STUDENT")

    db.session.add_all([admin, alumni, student])
    db.session.flush()

    p_admin = Profile(user_id=admin.id, first_name="Admin", last_name="User")
    p_alumni = Profile(
        user_id=alumni.id,
        first_name="Priya",
        last_name="Sharma",
        headline="Senior SWE at Google",
        skills="Python, Go, Distributed Systems, Kubernetes, Docker, Microservices, SQL",
    )
    p_student = Profile(
        user_id=student.id,
        first_name="Aarav",
        last_name="Mehta",
        headline="CS Undergraduate",
        skills="Python, React, MySQL, Git",
    )
    db.session.add_all([p_admin, p_alumni, p_student])

    ad = AlumniDetail(
        user_id=alumni.id,
        graduation_year=2020,
        degree="B.Tech CSE",
        department="Computer Science & Engineering",
        current_company="Google",
        current_position="Senior Software Engineer",
        verification_status="VERIFIED",
    )
    sd = StudentDetail(
        user_id=student.id,
        roll_number="CS22B001",
        current_year=3,
        degree="B.Tech CSE",
        department="Computer Science & Engineering",
        expected_graduation_year=2027,
        interests="Cloud Computing, Fullstack",
    )
    mp = MentorProfile(
        user_id=alumni.id,
        is_available=True,
        max_mentees=5,
        expertise_areas="Distributed Systems, Python, System Design",
        years_of_experience=5,
    )
    job = Job(
        posted_by_id=alumni.id,
        title="Software Engineer - Cloud",
        company="Google",
        location="Bengaluru",
        job_type="FULL_TIME",
        description="Develop scalable cloud services.",
        skills_required="Python, Go, Distributed Systems, Kubernetes",
        is_active=True,
        moderation_status="APPROVED",
    )
    slot = MentorAvailabilitySlot(
        mentor_id=alumni.id,
        slot_date=datetime.date.today() + datetime.timedelta(days=1),
        start_time=datetime.time(14, 0),
        end_time=datetime.time(14, 45),
        is_booked=False,
    )

    db.session.add_all([ad, sd, mp, job, slot])
    db.session.commit()

    return {
        'admin': admin,
        'alumni': alumni,
        'student': student,
        'job': job,
        'slot': slot,
    }


@pytest.fixture
def auth_headers(seeded_users):
    """Helper to generate Authorization headers for each seeded role."""
    tokens = {}
    for role_key in ['admin', 'alumni', 'student']:
        user = seeded_users[role_key]
        token = AuthService.generate_token(user.id, user.role, user.email)
        tokens[role_key] = {'Authorization': f'Bearer {token}'}
    return tokens
