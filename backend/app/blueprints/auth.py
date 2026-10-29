from flask import Blueprint, request
from .. import db
from ..models import User, Profile, StudentDetail, AlumniDetail, MentorProfile
from ..services.auth_service import AuthService
from ..services.audit_service import AuditService
from ..utils.response import api_success, api_error
from ..utils.decorators import jwt_required

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new student or alumni account."""
    data = request.get_json() or {}

    email = data.get('email', '').strip().lower()
    password = data.get('password', '')
    first_name = data.get('first_name', '').strip()
    last_name = data.get('last_name', '').strip()
    role = data.get('role', 'STUDENT').upper()

    # Basic validations
    if not email or not password or not first_name or not last_name:
        return api_error("Email, password, first name, and last name are required.", 400)

    if role not in ['STUDENT', 'ALUMNI', 'ADMIN']:
        return api_error("Invalid role specified.", 400)

    # Disallow direct public registration as ADMIN unless system has no admin yet
    if role == 'ADMIN':
        existing_admin = User.query.filter_by(role='ADMIN').first()
        if existing_admin:
            return api_error("Admin accounts cannot be registered publicly.", 403)

    if len(password) < 6:
        return api_error("Password must be at least 6 characters long.", 400)

    if User.query.filter_by(email=email).first():
        return api_error("An account with this email already exists.", 409)

    try:
        # Create User
        password_hash = AuthService.hash_password(password)
        new_user = User(
            email=email,
            password_hash=password_hash,
            role=role,
            is_active=True,
        )
        db.session.add(new_user)
        db.session.flush()

        # Create Profile
        new_profile = Profile(
            user_id=new_user.id,
            first_name=first_name,
            last_name=last_name,
            headline=data.get('headline', f"{role.capitalize()} at University"),
            bio=data.get('bio', ''),
            phone=data.get('phone', ''),
            location=data.get('location', ''),
            skills=data.get('skills', ''),
        )
        db.session.add(new_profile)

        # Create role-specific detail records
        if role == 'STUDENT':
            student_detail = StudentDetail(
                user_id=new_user.id,
                roll_number=data.get('roll_number', ''),
                current_year=int(data.get('current_year', 1)),
                degree=data.get('degree', 'B.Tech / B.E.'),
                department=data.get('department', 'Computer Science & Engineering'),
                expected_graduation_year=int(data.get('expected_graduation_year', 2027)),
                cgpa=float(data.get('cgpa', 8.0)) if data.get('cgpa') else None,
                interests=data.get('interests', ''),
            )
            db.session.add(student_detail)

        elif role == 'ALUMNI':
            alumni_detail = AlumniDetail(
                user_id=new_user.id,
                graduation_year=int(data.get('graduation_year', 2022)),
                degree=data.get('degree', 'B.Tech / B.E.'),
                department=data.get('department', 'Computer Science & Engineering'),
                current_company=data.get('current_company', ''),
                current_position=data.get('current_position', ''),
                industry=data.get('industry', 'Information Technology'),
                verification_status='PENDING',
                verification_notes='Self-registered alumni awaiting admin review.',
            )
            db.session.add(alumni_detail)

            # Auto create initial mentor profile shell
            mentor_profile = MentorProfile(
                user_id=new_user.id,
                is_available=True,
                max_mentees=5,
                bio=data.get('bio', 'Available for career guidance and resume reviews.'),
                expertise_areas=data.get('skills', 'Software Engineering, Career Advice'),
                years_of_experience=int(data.get('years_of_experience', 2)),
                session_duration_minutes=45,
            )
            db.session.add(mentor_profile)

        db.session.commit()

        # Audit registration
        AuditService.log(
            action='USER_REGISTER',
            entity_type='User',
            entity_id=new_user.id,
            details={'email': email, 'role': role},
            actor_id=new_user.id,
        )

        # Generate JWT Token
        token = AuthService.generate_token(new_user.id, new_user.role, new_user.email)

        return api_success(
            data={
                'token': token,
                'user': new_user.to_dict(),
            },
            message=f"{role.capitalize()} registered successfully.",
            status_code=201,
        )

    except Exception as e:
        db.session.rollback()
        return api_error(f"Registration failed: {str(e)}", 500)


@auth_bp.route('/login', methods=['POST'])
def login():
    """Authenticate user with email and password, returning JWT token."""
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    password = data.get('password', '')

    if not email or not password:
        return api_error("Email and password are required.", 400)

    DEMO_EMAIL_ALIASES = {
        'priya@alumniportal.edu': 'priya.sharma@alumni.edu',
        'student@alumniportal.edu': 'aarav.mehta@student.edu',
        'alumni@alumniportal.edu': 'priya.sharma@alumni.edu',
    }
    lookup_email = DEMO_EMAIL_ALIASES.get(email, email)

    user = User.query.filter_by(email=lookup_email).first()
    if not user or not AuthService.verify_password(password, user.password_hash):
        return api_error("Invalid email or password.", 401)

    if not user.is_active:
        return api_error("Your account has been deactivated. Please contact support.", 403)

    token = AuthService.generate_token(user.id, user.role, user.email)

    AuditService.log(
        action='USER_LOGIN',
        entity_type='User',
        entity_id=user.id,
        details={'email': email, 'role': user.role},
        actor_id=user.id,
    )

    return api_success(
        data={
            'token': token,
            'user': user.to_dict(),
        },
        message="Login successful.",
    )


@auth_bp.route('/me', methods=['GET'])
@jwt_required
def get_current_user():
    """Retrieve details of the authenticated user."""
    user = User.query.get(request.user_id)
    if not user:
        return api_error("User not found.", 404)

    return api_success(data={'user': user.to_dict()})


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required
def change_password():
    """Change user password after verifying existing password."""
    data = request.get_json() or {}
    current_password = data.get('current_password', '')
    new_password = data.get('new_password', '')

    if not current_password or not new_password:
        return api_error("Current password and new password are required.", 400)

    if len(new_password) < 6:
        return api_error("New password must be at least 6 characters long.", 400)

    user = User.query.get(request.user_id)
    if not user or not AuthService.verify_password(current_password, user.password_hash):
        return api_error("Incorrect current password.", 400)

    try:
        user.password_hash = AuthService.hash_password(new_password)
        db.session.commit()

        AuditService.log(
            action='PASSWORD_CHANGED',
            entity_type='User',
            entity_id=user.id,
            actor_id=user.id,
        )

        return api_success(message="Password updated successfully.")
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to update password: {str(e)}", 500)
