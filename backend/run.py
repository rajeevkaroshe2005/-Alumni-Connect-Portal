import os
from app import create_app, socketio, db

app = create_app(os.getenv('FLASK_ENV', 'development'))


@app.cli.command("init-db")
def init_db():
    """Create database tables."""
    with app.app_context():
        db.create_all()
        print("Database tables initialized successfully!")


@app.cli.command("seed-db")
def seed_db():
    """Seed the database with realistic demonstration data."""
    from seed import seed_all
    with app.app_context():
        seed_all()
        print("Database seeded successfully!")


if __name__ == '__main__':
    port = int(os.getenv('PORT', 5000))
    socketio.run(app, host='127.0.0.1', port=port, debug=True, allow_unsafe_werkzeug=True)
