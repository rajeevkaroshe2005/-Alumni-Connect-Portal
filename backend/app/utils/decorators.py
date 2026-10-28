from functools import wraps
from flask import request
from .response import api_error
from ..services.auth_service import AuthService


def jwt_required(f):
    """Decorator to require valid JWT Bearer token on endpoints."""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return api_error("Missing Authorization header with Bearer token", 401)

        parts = auth_header.split()
        if parts[0].lower() != 'bearer' or len(parts) != 2:
            return api_error("Invalid Authorization header format. Expected 'Bearer <token>'", 401)

        token = parts[1]
        try:
            payload = AuthService.decode_token(token)
            request.user_id = payload.get('sub')
            request.user_role = payload.get('role')
            request.user_email = payload.get('email')
        except ValueError as e:
            return api_error(str(e), 401)
        except Exception:
            return api_error("Failed to authenticate token", 401)

        return f(*args, **kwargs)
    return decorated_function


def roles_required(*allowed_roles):
    """Decorator to enforce role-based access control (RBAC)."""
    if len(allowed_roles) == 1 and isinstance(allowed_roles[0], (list, tuple, set)):
        roles = set(allowed_roles[0])
    else:
        roles = set(allowed_roles)

    def decorator(f):
        @wraps(f)
        @jwt_required
        def decorated_function(*args, **kwargs):
            current_role = getattr(request, 'user_role', None)
            if not current_role or current_role not in roles:
                return api_error(
                    f"Access forbidden: requires one of roles [{', '.join(sorted(roles))}]",
                    403
                )
            return f(*args, **kwargs)
        return decorated_function
    return decorator
