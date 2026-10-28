import datetime
from .. import db


class Job(db.Model):
    """Job and internship listing entity."""
    __tablename__ = 'jobs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    posted_by_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(120), nullable=False, index=True)
    company = db.Column(db.String(120), nullable=False, index=True)
    location = db.Column(db.String(120), nullable=False, index=True)
    job_type = db.Column(db.String(30), nullable=False, default='FULL_TIME', index=True)  # FULL_TIME, INTERNSHIP, PART_TIME, REMOTE
    experience_level = db.Column(db.String(30), nullable=False, default='ENTRY')  # ENTRY, MID, SENIOR
    description = db.Column(db.Text, nullable=False)
    requirements = db.Column(db.Text, nullable=True)
    skills_required = db.Column(db.Text, nullable=False)  # Comma-separated list of required skills
    salary_range = db.Column(db.String(80), nullable=True)
    deadline = db.Column(db.Date, nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False, index=True)
    moderation_status = db.Column(db.String(20), default='APPROVED', nullable=False, index=True)  # APPROVED, PENDING, REJECTED
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False,
    )

    poster = db.relationship('User', foreign_keys=[posted_by_id], backref='posted_jobs')
    applications = db.relationship('JobApplication', backref='job', cascade='all, delete-orphan')
    saved_by = db.relationship('SavedJob', backref='job', cascade='all, delete-orphan')

    def get_skills_list(self):
        if not self.skills_required:
            return []
        return [s.strip() for s in self.skills_required.split(',') if s.strip()]

    def to_dict(self):
        return {
            'id': self.id,
            'posted_by_id': self.posted_by_id,
            'poster_name': f"{self.poster.profile.first_name} {self.poster.profile.last_name}" if self.poster and self.poster.profile else "Admin",
            'poster_email': self.poster.email if self.poster else None,
            'title': self.title,
            'company': self.company,
            'location': self.location,
            'job_type': self.job_type,
            'experience_level': self.experience_level,
            'description': self.description,
            'requirements': self.requirements,
            'skills_required': self.get_skills_list(),
            'salary_range': self.salary_range,
            'deadline': self.deadline.isoformat() if self.deadline else None,
            'is_active': self.is_active,
            'moderation_status': self.moderation_status,
            'applications_count': len(self.applications),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
