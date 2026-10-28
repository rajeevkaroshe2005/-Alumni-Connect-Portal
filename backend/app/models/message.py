import datetime
from .. import db


class Message(db.Model):
    """Direct chat messages between authenticated users."""
    __tablename__ = 'messages'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    sender_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    recipient_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    conversation_id = db.Column(db.String(80), nullable=False, index=True)  # Normalized e.g. "min(id)_max(id)"
    content = db.Column(db.Text, nullable=False)
    is_read = db.Column(db.Boolean, default=False, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False, index=True)

    sender = db.relationship('User', foreign_keys=[sender_id], backref='sent_messages')
    recipient = db.relationship('User', foreign_keys=[recipient_id], backref='received_messages')

    @staticmethod
    def build_conversation_id(user_a: int, user_b: int) -> str:
        """Create a deterministic unique conversation identifier for two participants."""
        return f"conv_{min(user_a, user_b)}_{max(user_a, user_b)}"

    def to_dict(self):
        s_profile = self.sender.profile if self.sender else None
        return {
            'id': self.id,
            'sender_id': self.sender_id,
            'sender_name': f"{s_profile.first_name} {s_profile.last_name}" if s_profile else "User",
            'sender_avatar': s_profile.avatar_url if s_profile else None,
            'recipient_id': self.recipient_id,
            'conversation_id': self.conversation_id,
            'content': self.content,
            'is_read': self.is_read,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
