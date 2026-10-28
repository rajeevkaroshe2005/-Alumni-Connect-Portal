import datetime
import bcrypt
import jwt
from flask import current_app


class AuthService:
    """Authentication and Token Management Service."""

    @staticmethod
    def hash_password(plain_password: str) -> str:
        """Hash a plain text password using bcrypt."""
        if isinstance(plain_password, str):
            plain_password = plain_password.encode('utf-8')
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(plain_password, salt)
        return hashed.decode('utf-8')

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verify plain password against bcrypt hash."""
        if isinstance(plain_password, str):
            plain_password = plain_password.encode('utf-8')
        if isinstance(hashed_password, str):
            hashed_password = hashed_password.encode('utf-8')
        try:
            return bcrypt.checkpw(plain_password, hashed_password)
        except Exception:
            return False

    @staticmethod
    def generate_token(user_id: int, role: str, email: str) -> str:
        """Generate a signed JWT token."""
        secret_key = current_app.config.get('JWT_SECRET_KEY', 'default-jwt-secret')
        expires_delta = current_app.config.get('JWT_ACCESS_TOKEN_EXPIRES', datetime.timedelta(days=1))
        now = datetime.datetime.now(datetime.timezone.utc)

        payload = {
            'sub': str(user_id),
            'role': role,
            'email': email,
            'iat': now,
            'exp': now + expires_delta,
        }
        token = jwt.encode(payload, secret_key, algorithm='HS256')
        return token

    @staticmethod
    def decode_token(token: str) -> dict:
        """Decode and validate a signed JWT token."""
        secret_key = current_app.config.get('JWT_SECRET_KEY', 'default-jwt-secret-32-character-minimum-key')
        try:
            payload = jwt.decode(token, secret_key, algorithms=['HS256'])
            if 'sub' in payload and payload['sub']:
                payload['sub'] = int(payload['sub'])
            return payload
        except jwt.ExpiredSignatureError:
            raise ValueError("Authentication token has expired.")
        except jwt.InvalidTokenError as ite:
            raise ValueError(f"Invalid authentication token: {str(ite)}")
