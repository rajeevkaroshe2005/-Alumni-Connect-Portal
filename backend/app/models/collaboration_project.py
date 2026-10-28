import datetime
import json
from .. import db


class CollaborationProject(db.Model):
    """
    Project Collaboration Board where students and alumni form teams
    around real-world capstone projects, startups, or research ideas.
    """
    __tablename__ = 'collaboration_projects'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    creator_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(150), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    domain = db.Column(db.String(60), default='AI_ML', nullable=False, index=True)  # AI_ML, WEB_CLOUD, IOT_HARDWARE, CYBERSECURITY, FINTECH
    roles_needed_json = db.Column(db.Text, default='[]', nullable=False)  # e.g. ["Frontend Engineer", "ML Lead", "Alumni Advisor"]
    skills_needed_json = db.Column(db.Text, default='[]', nullable=False)
    status = db.Column(db.String(25), default='OPEN', nullable=False, index=True)  # OPEN, IN_PROGRESS, COMPLETED
    team_size_limit = db.Column(db.Integer, default=5, nullable=False)
    github_url = db.Column(db.String(255), nullable=True)
    demo_url = db.Column(db.String(255), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.timezone.utc and datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False
    )

    creator = db.relationship('User', foreign_keys=[creator_id], backref=db.backref('created_projects', cascade='all, delete-orphan'))
    applications = db.relationship('ProjectApplication', backref='project', cascade='all, delete-orphan')

    def get_roles_needed(self):
        try:
            return json.loads(self.roles_needed_json) if self.roles_needed_json else []
        except Exception:
            return []

    def set_roles_needed(self, roles):
        self.roles_needed_json = json.dumps(roles or [])

    def get_skills_needed(self):
        try:
            return json.loads(self.skills_needed_json) if self.skills_needed_json else []
        except Exception:
            return []

    def set_skills_needed(self, skills):
        self.skills_needed_json = json.dumps(skills or [])

    def to_dict(self):
        cr_profile = self.creator.profile if self.creator else None
        return {
            'id': self.id,
            'creator_id': self.creator_id,
            'creator_name': f"{cr_profile.first_name} {cr_profile.last_name}" if cr_profile else "Creator",
            'creator_role': self.creator.role if self.creator else "STUDENT",
            'title': self.title,
            'description': self.description,
            'domain': self.domain,
            'roles_needed': self.get_roles_needed(),
            'skills_needed': self.get_skills_needed(),
            'status': self.status,
            'team_size_limit': self.team_size_limit,
            'github_url': self.github_url,
            'demo_url': self.demo_url,
            'applications_count': len(self.applications),
            'accepted_count': len([a for a in self.applications if a.status == 'ACCEPTED']),
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class ProjectApplication(db.Model):
    """Application submitted by a student or alumnus to join a project."""
    __tablename__ = 'project_applications'
    __table_args__ = (
        db.UniqueConstraint('project_id', 'applicant_id', name='uq_project_applicant'),
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    project_id = db.Column(db.Integer, db.ForeignKey('collaboration_projects.id', ondelete='CASCADE'), nullable=False, index=True)
    applicant_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    role_applied = db.Column(db.String(80), nullable=False)
    pitch = db.Column(db.Text, nullable=False)
    status = db.Column(db.String(25), default='PENDING', nullable=False)  # PENDING, ACCEPTED, REJECTED
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    applicant = db.relationship('User', foreign_keys=[applicant_id], backref=db.backref('project_applications', cascade='all, delete-orphan'))

    def to_dict(self):
        app_profile = self.applicant.profile if self.applicant else None
        return {
            'id': self.id,
            'project_id': self.project_id,
            'applicant_id': self.applicant_id,
            'applicant_name': f"{app_profile.first_name} {app_profile.last_name}" if app_profile else "Applicant",
            'applicant_headline': app_profile.headline if app_profile else None,
            'applicant_avatar': app_profile.avatar_url if app_profile else None,
            'applicant_role': self.applicant.role if self.applicant else "STUDENT",
            'role_applied': self.role_applied,
            'pitch': self.pitch,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
