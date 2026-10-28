from flask import Blueprint, request
from sqlalchemy import or_
from .. import db
from ..models import User, CollaborationProject, ProjectApplication
from ..utils.response import api_success, api_error
from ..utils.decorators import jwt_required, roles_required
from ..services.audit_service import AuditService

projects_bp = Blueprint('projects', __name__)


@projects_bp.route('', methods=['GET'])
@jwt_required
def get_projects():
    """List open collaboration projects with domain filtering and search."""
    domain = request.args.get('domain', '').strip()
    status = request.args.get('status', '').strip()
    query_str = request.args.get('q', '').strip()
    page = request.args.get('page', 1, type=int)
    per_page = min(request.args.get('per_page', 12, type=int), 50)

    q = CollaborationProject.query

    if domain:
        q = q.filter(CollaborationProject.domain == domain)

    if status:
        q = q.filter(CollaborationProject.status == status)
    else:
        q = q.filter(CollaborationProject.status.in_(['OPEN', 'IN_PROGRESS']))

    if query_str:
        q = q.filter(
            or_(
                CollaborationProject.title.ilike(f"%{query_str}%"),
                CollaborationProject.description.ilike(f"%{query_str}%"),
                CollaborationProject.skills_needed_json.ilike(f"%{query_str}%"),
                CollaborationProject.roles_needed_json.ilike(f"%{query_str}%"),
            )
        )

    q = q.order_by(CollaborationProject.created_at.desc())
    pagination = q.paginate(page=page, per_page=per_page, error_out=False)

    user_id = request.user_id
    user_apps = {
        a.project_id: a.status for a in ProjectApplication.query.filter_by(applicant_id=user_id).all()
    }

    items = []
    for p in pagination.items:
        data = p.to_dict()
        data['my_application_status'] = user_apps.get(p.id)
        data['is_creator'] = (p.creator_id == user_id)
        items.append(data)

    return api_success(data={
        'projects': items,
        'total': pagination.total,
        'page': page,
        'pages': pagination.pages,
    })


@projects_bp.route('/<int:project_id>', methods=['GET'])
@jwt_required
def get_project_detail(project_id):
    """Get project details, creator information, and team applicants."""
    project = CollaborationProject.query.get(project_id)
    if not project:
        return api_error("Project not found.", 404)

    user_id = request.user_id
    data = project.to_dict()
    data['is_creator'] = (project.creator_id == user_id)

    user_app = ProjectApplication.query.filter_by(project_id=project.id, applicant_id=user_id).first()
    data['my_application'] = user_app.to_dict() if user_app else None

    # Creators and Admins can see all applicants
    if data['is_creator'] or request.user_role == 'ADMIN':
        data['applications'] = [a.to_dict() for a in project.applications]
    else:
        data['accepted_members'] = [
            a.to_dict() for a in project.applications if a.status == 'ACCEPTED'
        ]

    return api_success(data={'project': data})


@projects_bp.route('', methods=['POST'])
@jwt_required
def create_project():
    """Create a new student or alumni collaborative project."""
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    domain = data.get('domain', 'AI_ML')
    roles_needed = data.get('roles_needed', [])
    skills_needed = data.get('skills_needed', [])
    team_size_limit = int(data.get('team_size_limit', 5))
    github_url = data.get('github_url', '').strip()
    demo_url = data.get('demo_url', '').strip()

    if not title or not description:
        return api_error("Title and description are required.", 400)

    project = CollaborationProject(
        creator_id=request.user_id,
        title=title,
        description=description,
        domain=domain,
        team_size_limit=team_size_limit,
        github_url=github_url,
        demo_url=demo_url,
    )
    project.set_roles_needed(roles_needed or ["Contributor", "Reviewer"])
    project.set_skills_needed(skills_needed or ["Git", "Python"])

    try:
        db.session.add(project)
        db.session.commit()

        AuditService.log(
            action='PROJECT_CREATED',
            entity_type='CollaborationProject',
            entity_id=project.id,
            details={'title': title, 'domain': domain},
            actor_id=request.user_id,
        )

        return api_success(
            data={'project': project.to_dict()},
            message="Project pitch created successfully!",
            status_code=201
        )
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to create project: {str(e)}", 500)


@projects_bp.route('/<int:project_id>/apply', methods=['POST'])
@jwt_required
def apply_to_project(project_id):
    """Apply to join a collaboration project team."""
    project = CollaborationProject.query.get(project_id)
    if not project or project.status != 'OPEN':
        return api_error("This project is not currently accepting applications.", 400)

    user_id = request.user_id
    if project.creator_id == user_id:
        return api_error("You are the creator of this project.", 400)

    existing = ProjectApplication.query.filter_by(project_id=project.id, applicant_id=user_id).first()
    if existing:
        return api_error("You have already submitted an application for this project.", 400)

    data = request.get_json() or {}
    role_applied = data.get('role_applied', '').strip()
    pitch = data.get('pitch', '').strip()

    if not role_applied or not pitch:
        return api_error("Target role and personal pitch are required.", 400)

    app_record = ProjectApplication(
        project_id=project.id,
        applicant_id=user_id,
        role_applied=role_applied,
        pitch=pitch,
        status='PENDING'
    )

    try:
        db.session.add(app_record)
        db.session.commit()
        return api_success(
            data={'application': app_record.to_dict()},
            message="Application submitted to project lead!",
            status_code=201
        )
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to submit application: {str(e)}", 500)


@projects_bp.route('/applications/<int:app_id>', methods=['PUT'])
@jwt_required
def review_project_application(app_id):
    """Accept or reject an applicant (Project creator or Admin only)."""
    application = ProjectApplication.query.get(app_id)
    if not application:
        return api_error("Application not found.", 404)

    project = application.project
    if project.creator_id != request.user_id and request.user_role != 'ADMIN':
        return api_error("Only the project creator can review applications.", 403)

    data = request.get_json() or {}
    decision = data.get('status', '').upper()

    if decision not in ['ACCEPTED', 'REJECTED']:
        return api_error("Decision must be either 'ACCEPTED' or 'REJECTED'.", 400)

    application.status = decision
    db.session.commit()

    return api_success(
        data={'application': application.to_dict()},
        message=f"Application {decision.lower()} successfully."
    )
