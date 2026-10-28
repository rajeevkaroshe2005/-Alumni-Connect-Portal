import datetime
from .. import db


class EventFeedback(db.Model):
    """Post-event attendee ratings, reviews, and qualitative feedback."""
    __tablename__ = 'event_feedbacks'
    __table_args__ = (
        db.UniqueConstraint('event_id', 'user_id', name='uq_event_user_feedback'),
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    rating = db.Column(db.Integer, nullable=False)  # 1 to 5 stars
    feedback_text = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    user = db.relationship('User', foreign_keys=[user_id])
    event = db.relationship('Event', foreign_keys=[event_id], backref=db.backref('feedbacks', cascade='all, delete-orphan'))

    def to_dict(self):
        u_prof = self.user.profile if self.user else None
        return {
            'id': self.id,
            'event_id': self.event_id,
            'user_id': self.user_id,
            'user_name': f"{u_prof.first_name} {u_prof.last_name}" if u_prof else "Attendee",
            'rating': self.rating,
            'feedback_text': self.feedback_text,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
