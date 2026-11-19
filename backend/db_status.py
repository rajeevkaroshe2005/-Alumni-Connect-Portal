"""Database Health & Statistics Inspection Utility.

Run with:
    python db_status.py
"""

import os
import sys

# Ensure UTF-8 output on Windows consoles
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models import User, Profile, StudentDetail, AlumniDetail, Job, Event, Message


def check_status():
    app = create_app()
    with app.app_context():
        db_uri = app.config['SQLALCHEMY_DATABASE_URI']
        print("\n" + "=" * 60)
        print("  [*] ALUMNI CONNECT PORTAL - DATABASE STATUS REPORT")
        print("=" * 60)
        print(f"  Active Database Engine : {db_uri}")
        print(f"  Environment            : {app.config.get('ENV', 'development')}")
        print("-" * 60)

        total_users = User.query.count()
        students = User.query.filter_by(role='STUDENT').count()
        alumni = User.query.filter_by(role='ALUMNI').count()
        admins = User.query.filter_by(role='ADMIN').count()
        jobs_count = Job.query.count()
        events_count = Event.query.count()
        messages_count = Message.query.count()

        print(f"  Total Users Registered : {total_users}")
        print(f"   |-- Students           : {students}")
        print(f"   |-- Alumni             : {alumni}")
        print(f"   `-- Admins             : {admins}")
        print(f"  Total Job Postings     : {jobs_count}")
        print(f"  Campus Events          : {events_count}")
        print(f"  Chat Messages          : {messages_count}")
        print("-" * 60)
        print("  Recent User Accounts:")
        recent_users = User.query.order_by(User.id.desc()).limit(10).all()
        for u in recent_users:
            name = f"{u.profile.first_name} {u.profile.last_name}" if u.profile else "No Profile"
            print(f"   * [ID: {u.id:2d}] {u.email:<30} | {u.role:<8} | {name}")
        print("=" * 60 + "\n")


if __name__ == '__main__':
    check_status()
