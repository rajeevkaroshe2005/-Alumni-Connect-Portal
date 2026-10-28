import datetime
from .. import db


class AlumniDetail(db.Model):
    """Alumni graduation, employment, and administrative verification details."""
    __tablename__ = 'alumni_details'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False, index=True)
    graduation_year = db.Column(db.Integer, nullable=False, index=True)
    degree = db.Column(db.String(80), nullable=False)
    department = db.Column(db.String(100), nullable=False, index=True)
    current_company = db.Column(db.String(120), nullable=True, index=True)
    current_position = db.Column(db.String(120), nullable=True)
    industry = db.Column(db.String(80), nullable=True, index=True)

    # Verification workflow: PENDING, VERIFIED, REJECTED
    verification_status = db.Column(db.String(20), default='PENDING', nullable=False, index=True)
    verification_document_url = db.Column(db.String(255), nullable=True)
    verification_notes = db.Column(db.Text, nullable=True)
    verified_at = db.Column(db.DateTime, nullable=True)
    verified_by_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False,
    )

    verifier = db.relationship('User', foreign_keys=[verified_by_id], backref='verified_alumni')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'graduation_year': self.graduation_year,
            'degree': self.degree,
            'department': self.department,
            'current_company': self.current_company,
            'current_position': self.current_position,
            'industry': self.industry,
            'verification_status': self.verification_status,
            'verification_document_url': self.verification_document_url,
            'verification_notes': self.verification_notes,
            'verified_at': self.verified_at.isoformat() if self.verified_at else None,
            'verified_by_id': self.verified_by_id,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
