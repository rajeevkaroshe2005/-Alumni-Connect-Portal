import datetime
from .. import db


class JobApplication(db.Model):
    """Job application records linking students and jobs."""
    __tablename__ = 'job_applications'
    __table_args__ = (
        db.UniqueConstraint('job_id', 'applicant_id', name='uq_job_applicant'),
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False, index=True)
    applicant_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    resume_url = db.Column(db.String(255), nullable=True)
    cover_note = db.Column(db.Text, nullable=True)
    status = db.Column(db.String(30), default='APPLIED', nullable=False, index=True)  # APPLIED, REVIEWING, SHORTLISTED, REJECTED, ACCEPTED
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False,
    )

    applicant = db.relationship('User', foreign_keys=[applicant_id], backref='job_applications')

    def to_dict(self):
        applicant_profile = self.applicant.profile if self.applicant else None
        return {
            'id': self.id,
            'job_id': self.job_id,
            'applicant_id': self.applicant_id,
            'applicant_name': f"{applicant_profile.first_name} {applicant_profile.last_name}" if applicant_profile else "Applicant",
            'applicant_email': self.applicant.email if self.applicant else None,
            'resume_url': self.resume_url,
            'cover_note': self.cover_note,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
