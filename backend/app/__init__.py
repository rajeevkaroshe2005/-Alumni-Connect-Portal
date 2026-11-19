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

    # Performance: API Response-Time tracking & latency metrics
    import time
    from .utils.response import api_error
    from flask import g

    @app.before_request
    def record_request_start():
        g._request_start_time = time.time()

    @app.after_request
    def attach_response_time(response):
        if hasattr(g, '_request_start_time'):
            elapsed_ms = (time.time() - g._request_start_time) * 1000
            response.headers['X-Response-Time'] = f"{elapsed_ms:.2f}ms"
        return response

    # Centralized REST API Error Handlers
    @app.errorhandler(400)
    def handle_bad_request(e):
        return api_error(str(e.description) if hasattr(e, 'description') else "Invalid request parameters.", 400)

    @app.errorhandler(404)
    def handle_not_found(e):
        return api_error("The requested resource was not found.", 404)

    @app.errorhandler(405)
    def handle_method_not_allowed(e):
        return api_error("HTTP method not allowed for this route.", 405)

    @app.errorhandler(429)
    def handle_rate_limited(e):
        return api_error("Too many requests. Please wait a moment before trying again.", 429)

    @app.errorhandler(500)
    def handle_server_error(e):
        return api_error("An internal error occurred. Please try again later.", 500)

    # Serve Frontend Single-Page Application (SPA) & Static Assets
    from flask import send_from_directory

    candidates = [
        os.path.join(os.path.dirname(__file__), 'static_dist'),
        os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'frontend', 'dist')),
        os.path.abspath(os.path.join(os.path.dirname(os.path.dirname(__file__)), 'dist')),
    ]
    frontend_dist_dir = next((d for d in candidates if os.path.exists(os.path.join(d, 'index.html'))), candidates[0])

    @app.route('/api')
    @app.route('/api/health')
    def api_health():
        return jsonify({
            "status": "healthy",
            "service": "Alumni Connect Portal API",
            "version": "1.0.0"
        }), 200

    @app.route('/', defaults={'path': ''})
    @app.route('/<path:path>')
    def serve_frontend(path):
        if path.startswith('api') or path.startswith('socket.io'):
            return api_error("The requested resource was not found.", 404)

        target_file = os.path.join(frontend_dist_dir, path)
        if path and os.path.isfile(target_file):
            return send_from_directory(frontend_dist_dir, path)

        index_file = os.path.join(frontend_dist_dir, 'index.html')
        if os.path.exists(index_file):
            return send_from_directory(frontend_dist_dir, 'index.html')

        return jsonify({
            "status": "online",
            "service": "Alumni Connect Portal Backend API",
            "message": "Frontend static build not found."
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
    from .blueprints.skills import skills_bp
    from .blueprints.projects import projects_bp
    from .blueprints.achievements import achievements_bp
    from .blueprints.donations import donations_bp

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
        app.register_blueprint(skills_bp, url_prefix=f'{prefix}/skills', name=f'skills{prefix.replace("/", "_")}')
        app.register_blueprint(projects_bp, url_prefix=f'{prefix}/projects', name=f'projects{prefix.replace("/", "_")}')
        app.register_blueprint(achievements_bp, url_prefix=f'{prefix}/achievements', name=f'achievements{prefix.replace("/", "_")}')
        app.register_blueprint(donations_bp, url_prefix=f'{prefix}/donations', name=f'donations{prefix.replace("/", "_")}')

    # Register socket event handlers
    from .blueprints.chat import register_socket_events
    register_socket_events(socketio)

    return app
