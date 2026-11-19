import os
import sys

# Ensure backend directory is in sys.path regardless of current working directory
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, socketio, db

app = create_app(os.getenv('FLASK_ENV', 'development'))

# Ensure database tables exist and seed demo records if database is empty
with app.app_context():
    try:
        db.create_all()
        if os.getenv('AUTO_SEED', 'true').lower() in ('true', '1', 'yes'):
            from app.models import User
            if User.query.first() is None:
                print("Database is empty. Automatically seeding demonstration data...")
                from seed import seed_all
                seed_all()
                print("Demonstration data seeded successfully!")
    except Exception as e:
        print(f"Notice during automatic database initialization: {e}")


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
    socketio.run(app, host='0.0.0.0', port=port, debug=True, allow_unsafe_werkzeug=True)
