import datetime
from .. import db


class StudentDetail(db.Model):
    """Student academic and enrollment details."""
    __tablename__ = 'student_details'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False, index=True)
    roll_number = db.Column(db.String(50), nullable=True, index=True)
    current_year = db.Column(db.Integer, nullable=False, default=1)  # 1st, 2nd, 3rd, 4th year
    degree = db.Column(db.String(80), nullable=False)
    department = db.Column(db.String(100), nullable=False, index=True)
    expected_graduation_year = db.Column(db.Integer, nullable=False)
    cgpa = db.Column(db.Float, nullable=True)
    interests = db.Column(db.Text, nullable=True)  # Comma-separated career interests

    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False,
    )

    def get_interests_list(self):
        if not self.interests:
            return []
        return [i.strip() for i in self.interests.split(',') if i.strip()]

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'roll_number': self.roll_number,
            'current_year': self.current_year,
            'degree': self.degree,
            'department': self.department,
            'expected_graduation_year': self.expected_graduation_year,
            'cgpa': self.cgpa,
            'interests': self.get_interests_list(),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
