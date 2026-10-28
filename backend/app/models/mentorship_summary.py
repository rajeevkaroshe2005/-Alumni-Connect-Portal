import datetime
import json
from .. import db


class MentorshipSessionSummary(db.Model):
    """
    Consensual post-session notes and AI-structured action items.
    Generated from participant notes with follow-up milestones.
    """
    __tablename__ = 'mentorship_session_summaries'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    booking_id = db.Column(db.Integer, db.ForeignKey('mentorship_bookings.id', ondelete='CASCADE'), nullable=False, unique=True, index=True)
    author_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    session_notes = db.Column(db.Text, nullable=False)
    key_takeaways = db.Column(db.Text, nullable=True)
    action_items_json = db.Column(db.Text, default='[]', nullable=False)
    recommended_resources_json = db.Column(db.Text, default='[]', nullable=False)
    follow_up_date = db.Column(db.Date, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False
    )

    booking = db.relationship('MentorshipBooking', backref=db.backref('session_summary', uselist=False, cascade='all, delete-orphan'))
    author = db.relationship('User', foreign_keys=[author_id])

    def get_action_items(self):
        try:
            return json.loads(self.action_items_json) if self.action_items_json else []
        except Exception:
            return []

    def set_action_items(self, items):
        self.action_items_json = json.dumps(items or [])

    def get_resources(self):
        try:
            return json.loads(self.recommended_resources_json) if self.recommended_resources_json else []
        except Exception:
            return []

    def set_resources(self, resources):
        self.recommended_resources_json = json.dumps(resources or [])

    def to_dict(self):
        return {
            'id': self.id,
            'booking_id': self.booking_id,
            'author_id': self.author_id,
            'session_notes': self.session_notes,
            'key_takeaways': self.key_takeaways,
            'action_items': self.get_action_items(),
            'recommended_resources': self.get_resources(),
            'follow_up_date': self.follow_up_date.isoformat() if self.follow_up_date else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }
