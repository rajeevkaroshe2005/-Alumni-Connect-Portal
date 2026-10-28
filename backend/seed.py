import datetime
from app import db
from app.models import (
    User, Profile, AlumniDetail, StudentDetail,
    Job, MentorProfile, MentorAvailabilitySlot,
    Event, MentorshipBooking, Notification
)
from app.services.auth_service import AuthService


def seed_all():
    """Populate database with clean, attributed demonstration records."""
    db.create_all()
    print("Clearing existing records...")
    db.session.query(MentorshipBooking).delete()
    db.session.query(MentorAvailabilitySlot).delete()
    db.session.query(MentorProfile).delete()
    db.session.query(Job).delete()
    db.session.query(Event).delete()
    db.session.query(Notification).delete()
    db.session.query(AlumniDetail).delete()
    db.session.query(StudentDetail).delete()
    db.session.query(Profile).delete()
    db.session.query(User).delete()
    db.session.commit()

    pwd_hash = AuthService.hash_password("Password123!")

    # 1. Admin Account
    admin = User(email="admin@alumniportal.edu", password_hash=pwd_hash, role="ADMIN", is_active=True)
    db.session.add(admin)
    db.session.flush()

    admin_profile = Profile(
        user_id=admin.id,
        first_name="Portal",
        last_name="Administrator",
        headline="Alumni Platform Director & Admin",
        bio="Managing institutional alumni relations, verification workflows, and career opportunities.",
        location="Campus Administration Office",
        skills="Administration, Platform Moderation, Career Services",
    )
    db.session.add(admin_profile)

    # 2. Alumni Accounts
    # Alumni 1: Priya Sharma (Google)
    a1 = User(email="priya.sharma@alumni.edu", password_hash=pwd_hash, role="ALUMNI", is_active=True)
    db.session.add(a1)
    db.session.flush()

    p1 = Profile(
        user_id=a1.id,
        first_name="Priya",
        last_name="Sharma",
        headline="Senior Software Engineer at Google | Cloud & Distributed Systems",
        bio="Passionate about helping juniors break into big tech. Specialized in distributed backend architecture and career transitions.",
        location="Bengaluru, India",
        linkedin_url="https://linkedin.com/in/priya-sharma-demo",
        github_url="https://github.com/priyasharma-demo",
        skills="Python, Go, Distributed Systems, Kubernetes, Docker, Microservices, System Design, SQL",
    )
    db.session.add(p1)

    ad1 = AlumniDetail(
        user_id=a1.id,
        graduation_year=2020,
        degree="B.Tech Computer Science & Engineering",
        department="Computer Science & Engineering",
        current_company="Google",
        current_position="Senior Software Engineer",
        industry="Cloud & Enterprise Software",
        verification_status="VERIFIED",
        verification_notes="Verified via corporate email and institutional degree archive.",
        verified_at=datetime.datetime.now(datetime.timezone.utc),
        verified_by_id=admin.id,
    )
    db.session.add(ad1)

    mp1 = MentorProfile(
        user_id=a1.id,
        is_available=True,
        max_mentees=5,
        bio="Available for mock system design rounds, resume reviews, and engineering guidance.",
        expertise_areas="Distributed Systems, Python, System Design, Career Transitions, Cloud Computing",
        years_of_experience=6,
        session_duration_minutes=45,
    )
    db.session.add(mp1)

    # Alumni 2: Rohit Verma (Stripe)
    a2 = User(email="rohit.verma@alumni.edu", password_hash=pwd_hash, role="ALUMNI", is_active=True)
    db.session.add(a2)
    db.session.flush()

    p2 = Profile(
        user_id=a2.id,
        first_name="Rohit",
        last_name="Verma",
        headline="Staff Engineer at Stripe | Payments & Fintech",
        bio="Alumni batch of 2018. Former Goldman Sachs engineer, currently building high-throughput payment infra.",
        location="Bengaluru, India",
        linkedin_url="https://linkedin.com/in/rohit-verma-demo",
        skills="Java, Spring Boot, MySQL, Kafka, Redis, Architecture, Payment Gateways, Algorithms",
    )
    db.session.add(p2)

    ad2 = AlumniDetail(
        user_id=a2.id,
        graduation_year=2018,
        degree="B.Tech Computer Science & Engineering",
        department="Computer Science & Engineering",
        current_company="Stripe",
        current_position="Staff Engineer",
        industry="Financial Technology",
        verification_status="VERIFIED",
        verification_notes="Alumni batch verification verified by Admin.",
        verified_at=datetime.datetime.now(datetime.timezone.utc),
        verified_by_id=admin.id,
    )
    db.session.add(ad2)

    mp2 = MentorProfile(
        user_id=a2.id,
        is_available=True,
        max_mentees=4,
        bio="Specialized in fintech architectures, concurrency, and scaling high-volume systems.",
        expertise_areas="Java, Fintech, System Design, Backend Engineering, Interview Preparation",
        years_of_experience=8,
        session_duration_minutes=45,
    )
    db.session.add(mp2)

    # Alumni 3: Ananya Sen (Amazon)
    a3 = User(email="ananya.sen@alumni.edu", password_hash=pwd_hash, role="ALUMNI", is_active=True)
    db.session.add(a3)
    db.session.flush()

    p3 = Profile(
        user_id=a3.id,
        first_name="Ananya",
        last_name="Sen",
        headline="Applied Machine Learning Scientist at Amazon AWS",
        bio="Working on generative AI and natural language processing solutions. Happy to guide students in AI research and applications.",
        location="Hyderabad, India",
        linkedin_url="https://linkedin.com/in/ananya-sen-demo",
        skills="Python, PyTorch, Machine Learning, Deep Learning, NLP, Scikit-Learn, Pandas, AWS",
    )
    db.session.add(p3)

    ad3 = AlumniDetail(
        user_id=a3.id,
        graduation_year=2021,
        degree="B.Tech Information Technology",
        department="Information Technology",
        current_company="Amazon",
        current_position="Applied Scientist",
        industry="Artificial Intelligence",
        verification_status="VERIFIED",
        verified_at=datetime.datetime.now(datetime.timezone.utc),
        verified_by_id=admin.id,
    )
    db.session.add(ad3)

    mp3 = MentorProfile(
        user_id=a3.id,
        is_available=True,
        max_mentees=6,
        bio="Mentoring on ML career roadmaps, thesis projects, and applied data science interviews.",
        expertise_areas="Machine Learning, NLP, Python, Deep Learning, Data Analysis",
        years_of_experience=5,
        session_duration_minutes=45,
    )
    db.session.add(mp3)

    # Alumni 4: Vikram Patel (Pending verification demo)
    a4 = User(email="vikram.patel@alumni.edu", password_hash=pwd_hash, role="ALUMNI", is_active=True)
    db.session.add(a4)
    db.session.flush()

    p4 = Profile(
        user_id=a4.id,
        first_name="Vikram",
        last_name="Patel",
        headline="Founder & CTO at CloudScale Technologies",
        bio="Serial entrepreneur building scalable SaaS platforms. ECE 2017 graduate.",
        location="Pune, India",
        skills="React, Node.js, AWS, DevOps, Startup Leadership, Product Architecture",
    )
    db.session.add(p4)

    ad4 = AlumniDetail(
        user_id=a4.id,
        graduation_year=2017,
        degree="B.Tech Electronics & Communication",
        department="Electronics & Communication Engineering",
        current_company="CloudScale",
        current_position="Co-founder & CTO",
        industry="Enterprise Software & Cloud",
        verification_status="PENDING",
        verification_notes="Awaiting degree document upload for admin verification review.",
    )
    db.session.add(ad4)

    # 3. Student Accounts
    # Student 1: Aarav Mehta
    s1 = User(email="aarav.mehta@student.edu", password_hash=pwd_hash, role="STUDENT", is_active=True)
    db.session.add(s1)
    db.session.flush()

    sp1 = Profile(
        user_id=s1.id,
        first_name="Aarav",
        last_name="Mehta",
        headline="Pre-final Year CSE Student | Aspiring Full Stack & Cloud Developer",
        bio="Passionate about web applications, React, Python, and microservices architecture.",
        location="Campus Hostel B",
        skills="Python, React, JavaScript, MySQL, Git, Tailwind, Docker",
    )
    db.session.add(sp1)

    sd1 = StudentDetail(
        user_id=s1.id,
        roll_number="CS22B1045",
        current_year=3,
        degree="B.Tech Computer Science & Engineering",
        department="Computer Science & Engineering",
        expected_graduation_year=2027,
        cgpa=8.85,
        interests="Fullstack Development, Cloud Computing, Open Source, System Design",
    )
    db.session.add(sd1)

    # Student 2: Sneha Rao
    s2 = User(email="sneha.rao@student.edu", password_hash=pwd_hash, role="STUDENT", is_active=True)
    db.session.add(s2)
    db.session.flush()

    sp2 = Profile(
        user_id=s2.id,
        first_name="Sneha",
        last_name="Rao",
        headline="Final Year CSE Student | Machine Learning & Data Science Enthusiast",
        bio="Final year undergraduate working on natural language processing and computer vision projects.",
        location="Bengaluru, India",
        skills="Python, Machine Learning, PyTorch, Pandas, Scikit-Learn, SQL, Data Analysis",
    )
    db.session.add(sp2)

    sd2 = StudentDetail(
        user_id=s2.id,
        roll_number="CS21B1012",
        current_year=4,
        degree="B.Tech Computer Science & Engineering",
        department="Computer Science & Engineering",
        expected_graduation_year=2026,
        cgpa=9.12,
        interests="Machine Learning, Data Science, NLP, AI Engineering",
    )
    db.session.add(sd2)

    # 4. Jobs and Internships
    j1 = Job(
        posted_by_id=a1.id,
        title="Associate Software Engineer (Cloud Platform)",
        company="Google",
        location="Bengaluru, India (Hybrid)",
        job_type="FULL_TIME",
        experience_level="ENTRY",
        description="Join Google Cloud Engineering team building reliable, globally distributed systems.",
        requirements="B.Tech/M.Tech in CS/IT or related field. Solid foundations in algorithms, data structures, and computer networking.",
        skills_required="Python, Go, Distributed Systems, Kubernetes, Docker, System Design",
        salary_range="₹22,00,000 - ₹28,00,000 / year",
        deadline=datetime.date.today() + datetime.timedelta(days=45),
        is_active=True,
        moderation_status="APPROVED",
    )
    db.session.add(j1)

    j2 = Job(
        posted_by_id=a3.id,
        title="Machine Learning Engineering Intern (Summer 2027)",
        company="Amazon",
        location="Hyderabad, India",
        job_type="INTERNSHIP",
        experience_level="ENTRY",
        description="3-month intensive internship with AWS AI Labs working on NLP and LLM inference pipelines.",
        requirements="Strong Python skills, coursework in Probability, Linear Algebra, and Machine Learning algorithms.",
        skills_required="Python, Machine Learning, Deep Learning, PyTorch, Scikit-Learn, Pandas",
        salary_range="₹80,000 / month stipend",
        deadline=datetime.date.today() + datetime.timedelta(days=30),
        is_active=True,
        moderation_status="APPROVED",
    )
    db.session.add(j2)

    j3 = Job(
        posted_by_id=a2.id,
        title="Backend Software Engineer - Payment Infrastructure",
        company="Stripe",
        location="Remote (India)",
        job_type="FULL_TIME",
        experience_level="ENTRY",
        description="Build secure, fault-tolerant financial settlement services processing millions of global API calls.",
        requirements="Proficiency in typed backend languages (Java, C++, or Go) and relational database design.",
        skills_required="Java, Spring Boot, MySQL, System Design, REST API, Unit Testing",
        salary_range="₹20,00,000 - ₹26,00,000 / year",
        deadline=datetime.date.today() + datetime.timedelta(days=60),
        is_active=True,
        moderation_status="APPROVED",
    )
    db.session.add(j3)

    # 5. Availability Slots for Mentors
    tomorrow = datetime.date.today() + datetime.timedelta(days=1)
    day_after = datetime.date.today() + datetime.timedelta(days=2)
    next_week = datetime.date.today() + datetime.timedelta(days=5)

    slot1 = MentorAvailabilitySlot(
        mentor_id=a1.id,
        slot_date=tomorrow,
        start_time=datetime.time(18, 0),
        end_time=datetime.time(18, 45),
        is_booked=False,
    )
    slot2 = MentorAvailabilitySlot(
        mentor_id=a1.id,
        slot_date=day_after,
        start_time=datetime.time(19, 0),
        end_time=datetime.time(19, 45),
        is_booked=False,
    )
    slot3 = MentorAvailabilitySlot(
        mentor_id=a3.id,
        slot_date=next_week,
        start_time=datetime.time(17, 30),
        end_time=datetime.time(18, 15),
        is_booked=False,
    )
    db.session.add_all([slot1, slot2, slot3])

    # 6. Events
    now = datetime.datetime.now(datetime.timezone.utc)
    evt1 = Event(
        organizer_id=a1.id,
        title="Navigating Big Tech Careers: From Campus Placements to Senior Engineer",
        description="An interactive session covering resume screening, technical interview rubrics, and high-impact project engineering.",
        event_type="WEBINAR",
        venue="Google Meet (Link shared upon registration)",
        meeting_url="https://meet.google.com/xyz-demo-link",
        start_time=now + datetime.timedelta(days=3, hours=2),
        end_time=now + datetime.timedelta(days=3, hours=3, minutes=30),
        capacity=150,
        moderation_status="APPROVED",
    )
    evt2 = Event(
        organizer_id=admin.id,
        title="Annual Tech Alumni Homecoming & Networking Mixer 2026",
        description="Reunite with your classmates, celebrate institutional achievements, and network across departments.",
        event_type="REUNION",
        venue="Main Auditorium, University Campus",
        start_time=now + datetime.timedelta(days=14, hours=10),
        end_time=now + datetime.timedelta(days=14, hours=16),
        capacity=300,
        moderation_status="APPROVED",
    )
    evt3 = Event(
        organizer_id=a3.id,
        title="Hands-on Workshop: Building and Deploying Machine Learning APIs",
        description="Practical tutorial creating production-ready ML inference APIs with Flask, Scikit-Learn, and Docker containers.",
        event_type="WORKSHOP",
        venue="CS Department Lab 3 & Virtual Livestream",
        start_time=now + datetime.timedelta(days=7, hours=4),
        end_time=now + datetime.timedelta(days=7, hours=6),
        capacity=80,
        moderation_status="APPROVED",
    )
    db.session.add_all([evt1, evt2, evt3])

    db.session.commit()
    print("Seed records successfully committed to database!")


if __name__ == '__main__':
    from app import create_app
    app = create_app()
    with app.app_context():
        seed_all()
