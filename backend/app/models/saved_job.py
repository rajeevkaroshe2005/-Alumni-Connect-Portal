import datetime
from .. import db


class SavedJob(db.Model):
    """Saved/Bookmarked job listings per user."""
    __tablename__ = 'saved_jobs'
    __table_args__ = (
        db.UniqueConstraint('user_id', 'job_id', name='uq_user_saved_job'),
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    job_id = db.Column(db.Integer, db.ForeignKey('jobs.id', ondelete='CASCADE'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    user = db.relationship('User', backref='saved_jobs')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'job_id': self.job_id,
            'job': self.job.to_dict() if self.job else None,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
