import datetime
from .. import db


class Event(db.Model):
    """Alumni events, webinars, workshops, and campus reunions."""
    __tablename__ = 'events'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    organizer_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(150), nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    event_type = db.Column(db.String(40), default='WEBINAR', nullable=False, index=True)  # WEBINAR, WORKSHOP, REUNION, NETWORKING
    venue = db.Column(db.String(255), nullable=True)
    meeting_url = db.Column(db.String(255), nullable=True)
    start_time = db.Column(db.DateTime, nullable=False, index=True)
    end_time = db.Column(db.DateTime, nullable=False)
    capacity = db.Column(db.Integer, default=100, nullable=False)
    banner_url = db.Column(db.String(255), nullable=True)
    moderation_status = db.Column(db.String(20), default='APPROVED', nullable=False, index=True)
    is_cancelled = db.Column(db.Boolean, default=False, nullable=False, index=True)

    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)
    updated_at = db.Column(
        db.DateTime,
        default=lambda: datetime.datetime.now(datetime.timezone.utc),
        onupdate=lambda: datetime.datetime.now(datetime.timezone.utc),
        nullable=False,
    )

    organizer = db.relationship('User', foreign_keys=[organizer_id], backref='organized_events')
    rsvps = db.relationship('EventRSVP', backref='event', cascade='all, delete-orphan')

    def to_dict(self):
        org_profile = self.organizer.profile if self.organizer else None
        return {
            'id': self.id,
            'organizer_id': self.organizer_id,
            'organizer_name': f"{org_profile.first_name} {org_profile.last_name}" if org_profile else "Organizer",
            'title': self.title,
            'description': self.description,
            'event_type': self.event_type,
            'venue': self.venue,
            'meeting_url': self.meeting_url,
            'start_time': self.start_time.isoformat() if self.start_time else None,
            'end_time': self.end_time.isoformat() if self.end_time else None,
            'capacity': self.capacity,
            'banner_url': self.banner_url,
            'moderation_status': self.moderation_status,
            'is_cancelled': self.is_cancelled,
            'rsvps_count': len(self.rsvps),
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
        }


class EventRSVP(db.Model):
    """User RSVP registrations for events."""
    __tablename__ = 'event_rsvps'
    __table_args__ = (
        db.UniqueConstraint('event_id', 'user_id', name='uq_event_user_rsvp'),
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    event_id = db.Column(db.Integer, db.ForeignKey('events.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    status = db.Column(db.String(25), default='REGISTERED', nullable=False)  # REGISTERED, ATTENDED, CANCELLED
    checkin_token = db.Column(db.String(64), nullable=True, index=True)
    checked_in_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    user = db.relationship('User', backref='event_rsvps')

    def to_dict(self):
        u_profile = self.user.profile if self.user else None
        return {
            'id': self.id,
            'event_id': self.event_id,
            'user_id': self.user_id,
            'user_name': f"{u_profile.first_name} {u_profile.last_name}" if u_profile else "Attendee",
            'user_email': self.user.email if self.user else None,
            'status': self.status,
            'checkin_token': self.checkin_token,
            'checked_in_at': self.checked_in_at.isoformat() if self.checked_in_at else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
