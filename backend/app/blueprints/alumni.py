import time
from flask import Blueprint, request
from sqlalchemy import or_, distinct
from sqlalchemy.orm import joinedload
from .. import db
from ..models import User, Profile, AlumniDetail
from ..utils.response import api_success, api_error
from ..utils.decorators import jwt_required

alumni_bp = Blueprint('alumni', __name__)


@alumni_bp.route('', methods=['GET'])
@jwt_required
def search_alumni():
    """Search and discover alumni with multi-attribute filtering and pagination."""
    query_str = request.args.get('q', '').strip()
    department = request.args.get('department', '').strip()
    company = request.args.get('company', '').strip()
    industry = request.args.get('industry', '').strip()
    grad_year = request.args.get('graduation_year', '').strip()
    verified_only = request.args.get('verified_only', 'false').lower() == 'true'

    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 12, type=int), 50)

    # Base query joined with Profile and AlumniDetail with explicit onclause
    q = db.session.query(User).join(
        Profile, User.id == Profile.user_id
    ).join(
        AlumniDetail, User.id == AlumniDetail.user_id
    ).filter(
        User.role == 'ALUMNI',
        User.is_active == True,
    )

    if verified_only:
        q = q.filter(AlumniDetail.verification_status == 'VERIFIED')

    if department:
        q = q.filter(AlumniDetail.department.ilike(f"%{department}%"))

    if company:
        q = q.filter(AlumniDetail.current_company.ilike(f"%{company}%"))

    if industry:
        q = q.filter(AlumniDetail.industry.ilike(f"%{industry}%"))

    if grad_year and grad_year.isdigit():
        q = q.filter(AlumniDetail.graduation_year == int(grad_year))

    if query_str:
        q = q.filter(
            or_(
                Profile.first_name.ilike(f"%{query_str}%"),
                Profile.last_name.ilike(f"%{query_str}%"),
                Profile.headline.ilike(f"%{query_str}%"),
                Profile.skills.ilike(f"%{query_str}%"),
                AlumniDetail.current_company.ilike(f"%{query_str}%"),
                AlumniDetail.current_position.ilike(f"%{query_str}%"),
                AlumniDetail.department.ilike(f"%{query_str}%"),
            )
        )

    # Order by verified status first, then newest
    q = q.options(
        joinedload(User.profile),
        joinedload(User.alumni_detail),
    ).order_by(
        (AlumniDetail.verification_status == 'VERIFIED').desc(),
        User.id.desc(),
    )

    pagination = q.paginate(page=page, per_page=per_page, error_out=False)

    alumni_list = [user.to_dict() for user in pagination.items]

    return api_success(
        data={
            'alumni': alumni_list,
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


@alumni_bp.route('/<int:alumni_id>', methods=['GET'])
@jwt_required
def get_alumni_detail(alumni_id):
    """Retrieve full details of a specific alumnus."""
    user = User.query.filter_by(id=alumni_id, role='ALUMNI').first()
    if not user:
        return api_error("Alumni record not found.", 404)

    return api_success(data={'alumnus': user.to_dict()})


# In-memory cache for filter options (120s TTL)
_FILTER_CACHE = {'timestamp': 0, 'data': None}


@alumni_bp.route('/filters', methods=['GET'])
@jwt_required
def get_filter_options():
    """Retrieve distinct departments, companies, industries, and years for filter UI with TTL caching."""
    global _FILTER_CACHE
    now = time.time()
    if _FILTER_CACHE['data'] and (now - _FILTER_CACHE['timestamp']) < 120:
        return api_success(data=_FILTER_CACHE['data'])

    departments = [
        d[0] for d in db.session.query(distinct(AlumniDetail.department)).filter(AlumniDetail.department != None).all() if d[0]
    ]
    companies = [
        c[0] for c in db.session.query(distinct(AlumniDetail.current_company)).filter(AlumniDetail.current_company != None).all() if c[0]
    ]
    industries = [
        i[0] for i in db.session.query(distinct(AlumniDetail.industry)).filter(AlumniDetail.industry != None).all() if i[0]
    ]
    years = [
        y[0] for y in db.session.query(distinct(AlumniDetail.graduation_year)).filter(AlumniDetail.graduation_year != None).order_by(AlumniDetail.graduation_year.desc()).all() if y[0]
    ]

    result = {
        'departments': sorted(departments),
        'companies': sorted(companies),
        'industries': sorted(industries),
        'graduation_years': sorted(years, reverse=True),
    }
    _FILTER_CACHE = {'timestamp': now, 'data': result}
    return api_success(data=result)
