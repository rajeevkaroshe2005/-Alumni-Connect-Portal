import datetime
from .. import db


class User(db.Model):
    """User account entity supporting STUDENT, ALUMNI, and ADMIN roles."""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(20), nullable=False, default='STUDENT', index=True)  # STUDENT, ALUMNI, ADMIN
    is_active = db.Column(db.Boolean, default=True, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False,
    )

    # Relationships
    profile = db.relationship('Profile', backref='user', uselist=False, cascade='all, delete-orphan')
    student_detail = db.relationship('StudentDetail', backref='user', uselist=False, cascade='all, delete-orphan')
    alumni_detail = db.relationship(
        'AlumniDetail',
        foreign_keys='AlumniDetail.user_id',
        backref='user',
        uselist=False,
        cascade='all, delete-orphan',
    )
    mentor_profile = db.relationship('MentorProfile', backref='user', uselist=False, cascade='all, delete-orphan')

    def to_dict(self):
        """Serialize user object."""
        return {
            'id': self.id,
            'email': self.email,
            'role': self.role,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'profile': self.profile.to_dict() if self.profile else None,
            'alumni_detail': self.alumni_detail.to_dict() if self.alumni_detail else None,
            'student_detail': self.student_detail.to_dict() if self.student_detail else None,
        }
