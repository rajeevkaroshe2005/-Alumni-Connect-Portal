import os
from datetime import timedelta
from dotenv import load_dotenv

# Load .env from project root or backend dir
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), '.env'))


BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
DEFAULT_SQLITE_PATH = os.path.join(BASE_DIR, 'alumni_portal.db').replace('\\', '/')


def _determine_database_uri():
    explicit_url = os.getenv('DATABASE_URL') or os.getenv('SQLALCHEMY_DATABASE_URI')
    if explicit_url:
        return explicit_url
    if os.getenv('USE_SQLITE', 'false').lower() == 'true':
        return f"sqlite:///{DEFAULT_SQLITE_PATH}"

    db_user = os.getenv('DB_USER', 'root')
    db_password = os.getenv('DB_PASSWORD', 'rajeev')
    db_host = os.getenv('DB_HOST', '127.0.0.1')
    db_port = os.getenv('DB_PORT', '3306')
    db_name = os.getenv('DB_NAME', 'alumni_portal')

    import socket
    try:
        with socket.create_connection((db_host, int(db_port)), timeout=0.3):
            return f"mysql+pymysql://{db_user}:{db_password}@{db_host}:{db_port}/{db_name}?charset=utf8mb4"
    except (OSError, socket.timeout):
        return f"sqlite:///{DEFAULT_SQLITE_PATH}"


class Config:
    """Base application configuration."""
    SECRET_KEY = os.getenv('SECRET_KEY', 'default-dev-secret-key-change-me')
    JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', 'default-jwt-secret-key-change-me')
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(minutes=int(os.getenv('JWT_ACCESS_TOKEN_EXPIRES_MINUTES', 1440)))

    # Database configuration: MySQL is primary database per project credentials; fallback to DATABASE_URL or local SQLite if unavailable
    DB_USER = os.getenv('DB_USER', 'root')
    DB_PASSWORD = os.getenv('DB_PASSWORD', 'rajeev')
    DB_HOST = os.getenv('DB_HOST', '127.0.0.1')
    DB_PORT = os.getenv('DB_PORT', '3306')
    DB_NAME = os.getenv('DB_NAME', 'alumni_portal')

    SQLALCHEMY_DATABASE_URI = _determine_database_uri()
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    SQLALCHEMY_ENGINE_OPTIONS = (
        {} if 'sqlite' in SQLALCHEMY_DATABASE_URI else {
            'pool_recycle': 280,
            'pool_pre_ping': True,
        }
    )

    CORS_ORIGINS = [
        origin.strip()
        for origin in os.getenv('CORS_ORIGINS', 'http://localhost:5173,http://127.0.0.1:5173').split(',')
        if origin.strip()
    ]

    BASE_DIR = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
    UPLOAD_FOLDER = os.path.join(BASE_DIR, os.getenv('UPLOAD_FOLDER', 'uploads'))
    MAX_CONTENT_LENGTH = int(os.getenv('MAX_CONTENT_LENGTH', 10 * 1024 * 1024))  # 10 MB

    LLM_PROVIDER = os.getenv('LLM_PROVIDER', 'offline_fallback')
    LLM_API_KEY = os.getenv('LLM_API_KEY', '')


class DevelopmentConfig(Config):
    """Development environment configuration."""
    DEBUG = True
    TESTING = False


class TestingConfig(Config):
    """Test environment configuration with isolated in-memory database."""
    DEBUG = False
    TESTING = True
    SQLALCHEMY_DATABASE_URI = 'sqlite:///:memory:'
    SQLALCHEMY_ENGINE_OPTIONS = {}
    SECRET_KEY = 'testing-secret-key-at-least-32-bytes-secure'
    JWT_SECRET_KEY = 'testing-jwt-secret-key-at-least-32-bytes-secure'
    JWT_ACCESS_TOKEN_EXPIRES = timedelta(hours=1)


class ProductionConfig(Config):
    """Production configuration with strict security flags."""
    DEBUG = False
    TESTING = False
    SESSION_COOKIE_SECURE = True
    SESSION_COOKIE_HTTPONLY = True
    SESSION_COOKIE_SAMESITE = 'Lax'


config_by_name = {
    'development': DevelopmentConfig,
    'testing': TestingConfig,
    'production': ProductionConfig,
    'default': DevelopmentConfig,
}
