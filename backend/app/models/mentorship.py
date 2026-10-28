import datetime
from sqlalchemy.orm import foreign
from .. import db


class MentorProfile(db.Model):
    """Mentorship configuration and profile details."""
    __tablename__ = 'mentor_profiles'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), unique=True, nullable=False, index=True)
    is_available = db.Column(db.Boolean, default=True, nullable=False, index=True)
    max_mentees = db.Column(db.Integer, default=5, nullable=False)
    bio = db.Column(db.Text, nullable=True)
    expertise_areas = db.Column(db.Text, nullable=False)  # Comma-separated topics
    years_of_experience = db.Column(db.Integer, default=1, nullable=False)
    session_duration_minutes = db.Column(db.Integer, default=45, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False,
    )

    def get_expertise_list(self):
        if not self.expertise_areas:
            return []
        return [e.strip() for e in self.expertise_areas.split(',') if e.strip()]

    def to_dict(self):
        user_profile = self.user.profile if self.user else None
        return {
            'id': self.id,
            'user_id': self.user_id,
            'mentor_name': f"{user_profile.first_name} {user_profile.last_name}" if user_profile else "Mentor",
            'avatar_url': user_profile.avatar_url if user_profile else None,
            'headline': user_profile.headline if user_profile else None,
            'company': self.user.alumni_detail.current_company if (self.user and self.user.alumni_detail) else None,
            'is_available': self.is_available,
            'max_mentees': self.max_mentees,
            'bio': self.bio,
            'expertise_areas': self.get_expertise_list(),
            'years_of_experience': self.years_of_experience,
            'session_duration_minutes': self.session_duration_minutes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class MentorAvailabilitySlot(db.Model):
    """Specific calendar date slots when a mentor is available."""
    __tablename__ = 'mentor_availability_slots'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    mentor_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    slot_date = db.Column(db.Date, nullable=False, index=True)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)
    is_booked = db.Column(db.Boolean, default=False, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    mentor = db.relationship('User', foreign_keys=[mentor_id], backref='availability_slots')

    def to_dict(self):
        return {
            'id': self.id,
            'mentor_id': self.mentor_id,
            'slot_date': self.slot_date.isoformat() if self.slot_date else None,
            'start_time': self.start_time.strftime('%H:%M') if self.start_time else None,
            'end_time': self.end_time.strftime('%H:%M') if self.end_time else None,
            'is_booked': self.is_booked,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class MentorshipBooking(db.Model):
    """Mentorship session bookings with transactional conflict prevention."""
    __tablename__ = 'mentorship_bookings'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    mentor_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    slot_id = db.Column(db.Integer, db.ForeignKey('mentor_availability_slots.id', ondelete='SET NULL'), nullable=True)

    session_date = db.Column(db.Date, nullable=False, index=True)
    start_time = db.Column(db.Time, nullable=False)
    end_time = db.Column(db.Time, nullable=False)

    # Status: PENDING, CONFIRMED, COMPLETED, CANCELLED, REJECTED
    status = db.Column(db.String(25), default='PENDING', nullable=False, index=True)
    goal_notes = db.Column(db.Text, nullable=False)
    meeting_link = db.Column(db.String(255), nullable=True)
    student_rating = db.Column(db.Integer, nullable=True)
    student_feedback = db.Column(db.Text, nullable=True)
    mentor_notes = db.Column(db.Text, nullable=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False,
    )

    mentor = db.relationship('User', foreign_keys=[mentor_id], backref='mentor_bookings')
    student = db.relationship('User', foreign_keys=[student_id], backref='student_bookings')
    slot = db.relationship('MentorAvailabilitySlot', backref='booking', uselist=False)

    def to_dict(self):
        m_profile = self.mentor.profile if self.mentor else None
        s_profile = self.student.profile if self.student else None
        return {
            'id': self.id,
            'mentor_id': self.mentor_id,
            'mentor_name': f"{m_profile.first_name} {m_profile.last_name}" if m_profile else "Mentor",
            'student_id': self.student_id,
            'student_name': f"{s_profile.first_name} {s_profile.last_name}" if s_profile else "Student",
            'slot_id': self.slot_id,
            'session_date': self.session_date.isoformat() if self.session_date else None,
            'start_time': self.start_time.strftime('%H:%M') if self.start_time else None,
            'end_time': self.end_time.strftime('%H:%M') if self.end_time else None,
            'status': self.status,
            'goal_notes': self.goal_notes,
            'meeting_link': self.meeting_link,
            'student_rating': self.student_rating,
            'student_feedback': self.student_feedback,
            'mentor_notes': self.mentor_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
