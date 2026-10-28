import json
from flask import request
from .. import db
from ..models.audit_log import AuditLog


class AuditService:
    """Service to record administrative and security audit events."""

    @staticmethod
    def log(action: str, entity_type: str, entity_id: int = None, details: dict = None, actor_id: int = None):
        """Persist an audit log entry."""
        try:
            ip_address = None
            if request:
                ip_address = request.remote_addr

            if actor_id is None and request and hasattr(request, 'user_id'):
                actor_id = request.user_id

            details_str = json.dumps(details) if details else None

            log_entry = AuditLog(
                actor_id=actor_id,
                action=action,
                entity_type=entity_type,
                entity_id=entity_id,
                details=details_str,
                ip_address=ip_address,
            )
            db.session.add(log_entry)
            db.session.commit()
            return log_entry
        except Exception as e:
            db.session.rollback()
            print(f"[AuditService Error] Failed to log audit event: {e}")
            return None
