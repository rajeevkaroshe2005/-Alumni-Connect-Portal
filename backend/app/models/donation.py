import datetime
from .. import db


class DonationCampaign(db.Model):
    """Institutional crowdfunding campaigns for research, labs, and student aid."""
    __tablename__ = 'donation_campaigns'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, nullable=False)
    category = db.Column(db.String(50), default='LAB_EQUIPMENT', nullable=False)  # LAB_EQUIPMENT, SCHOLARSHIP, HACKATHON, INCUBATOR
    target_amount = db.Column(db.Numeric(12, 2), nullable=False)
    raised_amount = db.Column(db.Numeric(12, 2), default=0.00, nullable=False)
    image_url = db.Column(db.String(255), nullable=True)
    is_active = db.Column(db.Boolean, default=True, nullable=False, index=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    donations = db.relationship('DonationTransaction', backref='campaign', cascade='all, delete-orphan')

    def to_dict(self):
        target = float(self.target_amount) if self.target_amount else 1.0
        raised = float(self.raised_amount) if self.raised_amount else 0.0
        pct = round((raised / target) * 100, 1) if target > 0 else 0
        return {
            'id': self.id,
            'title': self.title,
            'description': self.description,
            'category': self.category,
            'target_amount': target,
            'raised_amount': raised,
            'progress_percentage': min(pct, 100.0),
            'donors_count': len(self.donations),
            'image_url': self.image_url,
            'is_active': self.is_active,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }


class DonationTransaction(db.Model):
    """Voluntary contributions made by alumni with verified receipts."""
    __tablename__ = 'donation_transactions'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    campaign_id = db.Column(db.Integer, db.ForeignKey('donation_campaigns.id', ondelete='CASCADE'), nullable=False, index=True)
    donor_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='SET NULL'), nullable=True, index=True)
    amount = db.Column(db.Numeric(10, 2), nullable=False)
    is_anonymous = db.Column(db.Boolean, default=False, nullable=False)
    donor_message = db.Column(db.String(255), nullable=True)
    transaction_ref = db.Column(db.String(80), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.datetime.now(datetime.timezone.utc), nullable=False)

    donor = db.relationship('User', foreign_keys=[donor_id])

    def to_dict(self):
        d_profile = self.donor.profile if self.donor and not self.is_anonymous else None
        d_alumni = self.donor.alumni_detail if self.donor and not self.is_anonymous else None
        return {
            'id': self.id,
            'campaign_id': self.campaign_id,
            'donor_name': f"{d_profile.first_name} {d_profile.last_name}" if d_profile else "Anonymous Alumnus",
            'donor_batch': d_alumni.graduation_year if d_alumni else None,
            'amount': float(self.amount),
            'is_anonymous': self.is_anonymous,
            'donor_message': self.donor_message,
            'transaction_ref': self.transaction_ref,
            'created_at': self.created_at.isoformat() if self.created_at else None,
        }
