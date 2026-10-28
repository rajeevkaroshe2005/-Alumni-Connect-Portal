import datetime
from .. import db


class AuditLog(db.Model):
    """Audit log records for tracking security and administrative actions."""
    __tablename__ = 'audit_logs'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    actor_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)
    action = db.Column(db.String(80), nullable=False, index=True)
    entity_type = db.Column(db.String(60), nullable=False, index=True)
    entity_id = db.Column(db.Integer, nullable=True)
    details = db.Column(db.Text, nullable=True)
    ip_address = db.Column(db.String(45), nullable=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False, index=True)

    actor = db.relationship('User', foreign_keys=[actor_id], backref='audit_actions')

    def to_dict(self):
        actor_name = None
        if self.actor and self.actor.profile:
            actor_name = f"{self.actor.profile.first_name} {self.actor.profile.last_name}"
        elif self.actor:
            actor_name = self.actor.email

        return {
            'id': self.id,
            'actor_id': self.actor_id,
            'actor_name': actor_name,
            'action': self.action,
            'entity_type': self.entity_type,
            'entity_id': self.entity_id,
            'details': self.details,
            'ip_address': self.ip_address,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
