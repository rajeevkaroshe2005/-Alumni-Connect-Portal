import datetime
from .. import db


class AlumniAchievement(db.Model):
    """
    Alumni Achievement Wall showcasing verified career milestones:
    Promotions, Funding Rounds, Publications, Patents, and Honors with moderation.
    """
    __tablename__ = 'alumni_achievements'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    alumnus_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    title = db.Column(db.String(150), nullable=False)
    category = db.Column(db.String(40), default='PROMOTION', nullable=False, index=True)  # PROMOTION, FUNDING, PATENT, PUBLICATION, AWARD, FOUNDING
    company = db.Column(db.String(120), nullable=True)
    description = db.Column(db.Text, nullable=False)
    proof_url = db.Column(db.String(255), nullable=True)
    is_approved = db.Column(db.Boolean, default=True, nullable=False, index=True)  # Default approved for seeded/admin, flaggable
    cheers_count = db.Column(db.Integer, default=0, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    alumnus = db.relationship('User', foreign_keys=[alumnus_id], backref=db.backref('achievements', cascade='all, delete-orphan'))
    cheers = db.relationship('AchievementCheer', backref='achievement', cascade='all, delete-orphan')

    def to_dict(self, current_user_id=None):
        alm_profile = self.alumnus.profile if self.alumnus else None
        alm_detail = self.alumnus.alumni_detail if self.alumnus else None
        has_cheered = False
        if current_user_id:
            has_cheered = any(c.user_id == current_user_id for c in self.cheers)

        return {
            'id': self.id,
            'alumnus_id': self.alumnus_id,
            'alumnus_name': f"{alm_profile.first_name} {alm_profile.last_name}" if alm_profile else "Alumnus",
            'alumnus_avatar': alm_profile.avatar_url if alm_profile else None,
            'batch': alm_detail.graduation_year if alm_detail else None,
            'department': alm_detail.department if alm_detail else None,
            'title': self.title,
            'category': self.category,
            'company': self.company or (alm_detail.current_company if alm_detail else None),
            'description': self.description,
            'proof_url': self.proof_url,
            'is_approved': self.is_approved,
            'cheers_count': self.cheers_count,
            'has_cheered': has_cheered,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class AchievementCheer(db.Model):
    """Students and alumni can 'cheer' or applaud a verified milestone."""
    __tablename__ = 'achievement_cheers'
    __table_args__ = (
        db.UniqueConstraint('achievement_id', 'user_id', name='uq_achievement_user_cheer'),
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    achievement_id = db.Column(db.Integer, db.ForeignKey('alumni_achievements.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    user = db.relationship('User', foreign_keys=[user_id])
