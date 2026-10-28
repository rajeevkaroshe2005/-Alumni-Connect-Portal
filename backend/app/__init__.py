import os
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_socketio import SocketIO
from .config import config_by_name

# Initialize Flask extensions
db = SQLAlchemy()
migrate = Migrate()
cors = CORS()
socketio = SocketIO()


def create_app(config_name=None):
    """Application factory for Alumni Connect Portal."""
    if config_name is None:
        config_name = os.getenv('FLASK_ENV', 'development')

    app = Flask(__name__)
    config_class = config_by_name.get(config_name, config_by_name['default'])
    app.config.from_object(config_class)

    # Ensure uploads directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    # Initialize extensions with app
    db.init_app(app)
    migrate.init_app(app, db)
    cors.init_app(
        app,
        resources={r"/api/*": {"origins": app.config.get('CORS_ORIGINS', '*')}},
        supports_credentials=True,
    )
    socketio.init_app(
        app,
        cors_allowed_origins="*",
        async_mode='threading',
    )

    # Register Healthcheck / Base API Route
    @app.route('/api/health', methods=['GET'])
    @app.route('/api/v1/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'service': 'Alumni Connect Portal API',
            'version': '1.0.0',
            'environment': config_name,
            'database': 'connected' if db.engine else 'unknown',
        }), 200

    # Register blueprints under /api and /api/v1 versioned prefixes
    from .blueprints.auth import auth_bp
    from .blueprints.profiles import profiles_bp
    from .blueprints.alumni import alumni_bp
    from .blueprints.jobs import jobs_bp
    from .blueprints.mentorship import mentorship_bp
    from .blueprints.events import events_bp
    from .blueprints.chat import chat_bp
    from .blueprints.notifications import notifications_bp
    from .blueprints.admin import admin_bp
    from .blueprints.ai import ai_bp

    for prefix in ['/api', '/api/v1']:
        app.register_blueprint(auth_bp, url_prefix=f'{prefix}/auth', name=f'auth{prefix.replace("/", "_")}')
        app.register_blueprint(profiles_bp, url_prefix=f'{prefix}/profiles', name=f'profiles{prefix.replace("/", "_")}')
        app.register_blueprint(alumni_bp, url_prefix=f'{prefix}/alumni', name=f'alumni{prefix.replace("/", "_")}')
        app.register_blueprint(jobs_bp, url_prefix=f'{prefix}/jobs', name=f'jobs{prefix.replace("/", "_")}')
        app.register_blueprint(mentorship_bp, url_prefix=f'{prefix}/mentorship', name=f'mentorship{prefix.replace("/", "_")}')
        app.register_blueprint(events_bp, url_prefix=f'{prefix}/events', name=f'events{prefix.replace("/", "_")}')
        app.register_blueprint(chat_bp, url_prefix=f'{prefix}/chat', name=f'chat{prefix.replace("/", "_")}')
        app.register_blueprint(notifications_bp, url_prefix=f'{prefix}/notifications', name=f'notifications{prefix.replace("/", "_")}')
        app.register_blueprint(admin_bp, url_prefix=f'{prefix}/admin', name=f'admin{prefix.replace("/", "_")}')
        app.register_blueprint(ai_bp, url_prefix=f'{prefix}/ai', name=f'ai{prefix.replace("/", "_")}')

    # Register socket event handlers
    from .blueprints.chat import register_socket_events
    register_socket_events(socketio)

    return app
