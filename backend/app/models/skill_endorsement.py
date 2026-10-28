import datetime
from .. import db


class SkillEndorsement(db.Model):
    """
    Skill Endorsement with anti-abuse safeguards.
    Verified alumni or mentors can endorse a student's technical skills.
    """
    __tablename__ = 'skill_endorsements'
    __table_args__ = (
        db.UniqueConstraint('student_id', 'endorser_id', 'skill_name', name='uq_student_endorser_skill'),
    )

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    endorser_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    skill_name = db.Column(db.String(80), nullable=False, index=True)
    relationship_context = db.Column(db.String(100), default='Alumni Network', nullable=False)  # 'Mentorship Session', 'Department Alumni', 'Project Review'
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    student = db.relationship('User', foreign_keys=[student_id], backref=db.backref('received_endorsements', cascade='all, delete-orphan'))
    endorser = db.relationship('User', foreign_keys=[endorser_id], backref=db.backref('given_endorsements', cascade='all, delete-orphan'))

    def to_dict(self):
        endorser_profile = self.endorser.profile if self.endorser else None
        endorser_alumni = self.endorser.alumni_detail if self.endorser else None
        return {
            'id': self.id,
            'student_id': self.student_id,
            'endorser_id': self.endorser_id,
            'endorser_name': f"{endorser_profile.first_name} {endorser_profile.last_name}" if endorser_profile else "Verified Alumnus",
            'endorser_company': endorser_alumni.current_company if endorser_alumni else (endorser_profile.headline if endorser_profile else 'Alumni Mentor'),
            'endorser_avatar': endorser_profile.avatar_url if endorser_profile else None,
            'skill_name': self.skill_name,
            'relationship_context': self.relationship_context,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
