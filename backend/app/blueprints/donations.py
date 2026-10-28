import datetime
import uuid
from flask import Blueprint, request
from .. import db
from ..models import User, DonationCampaign, DonationTransaction
from ..utils.response import api_success, api_error
from ..utils.decorators import jwt_required, roles_required
from ..services.audit_service import AuditService

donations_bp = Blueprint('donations', __name__)


@donations_bp.route('/campaigns', methods=['GET'])
@jwt_required
def get_campaigns():
    """List active university donation and alumni giving campaigns."""
    campaigns = DonationCampaign.query.filter_by(is_active=True).order_by(DonationCampaign.created_at.desc()).all()
    return api_success(data={'campaigns': [c.to_dict() for c in campaigns]})


@donations_bp.route('/campaigns', methods=['POST'])
@jwt_required
@roles_required('ADMIN')
def create_campaign():
    """Create a new university fundraising campaign (Admin only)."""
    data = request.get_json() or {}
    title = data.get('title', '').strip()
    description = data.get('description', '').strip()
    category = data.get('category', 'LAB_EQUIPMENT')
    target_amount = data.get('target_amount')
    image_url = data.get('image_url', '').strip()

    if not title or not description or not target_amount:
        return api_error("Title, description, and target_amount are required.", 400)

    campaign = DonationCampaign(
        title=title,
        description=description,
        category=category,
        target_amount=float(target_amount),
        raised_amount=0.00,
        image_url=image_url or 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=800&auto=format&fit=crop&q=60',
        is_active=True
    )

    try:
        db.session.add(campaign)
        db.session.commit()
        return api_success(data={'campaign': campaign.to_dict()}, message="Campaign created!", status_code=201)
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to create campaign: {str(e)}", 500)


@donations_bp.route('/pledge', methods=['POST'])
@jwt_required
def pledge_donation():
    """Pledge a voluntary alumni donation with transaction receipt."""
    data = request.get_json() or {}
    campaign_id = data.get('campaign_id')
    amount = data.get('amount')
    is_anonymous = bool(data.get('is_anonymous', False))
    donor_message = data.get('donor_message', '').strip()

    if not campaign_id or not amount or float(amount) <= 0:
        return api_error("Valid campaign_id and positive amount are required.", 400)

    campaign = DonationCampaign.query.get(campaign_id)
    if not campaign or not campaign.is_active:
        return api_error("Campaign is not available for donations.", 404)

    ref = f"ALM-TXN-{uuid.uuid4().hex[:10].upper()}"

    donation = DonationTransaction(
        campaign_id=campaign.id,
        donor_id=request.user_id,
        amount=float(amount),
        is_anonymous=is_anonymous,
        donor_message=donor_message,
        transaction_ref=ref,
    )

    try:
        db.session.add(donation)
        campaign.raised_amount = float(campaign.raised_amount or 0) + float(amount)
        db.session.commit()

        AuditService.log(
            action='DONATION_PLEDGED',
            entity_type='DonationTransaction',
            entity_id=donation.id,
            details={'campaign_id': campaign.id, 'amount': float(amount), 'ref': ref},
            actor_id=request.user_id,
        )

        return api_success(
            data={
                'donation': donation.to_dict(),
                'campaign': campaign.to_dict(),
            },
            message=f"Thank you for your generous contribution of ₹{float(amount):,.2f}!",
            status_code=201
        )
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to record donation: {str(e)}", 500)


@donations_bp.route('/campaigns/<int:campaign_id>/donors', methods=['GET'])
@jwt_required
def get_campaign_donors(campaign_id):
    """Retrieve donor roll of honor for a campaign."""
    campaign = DonationCampaign.query.get(campaign_id)
    if not campaign:
        return api_error("Campaign not found.", 404)

    donations = DonationTransaction.query.filter_by(campaign_id=campaign.id).order_by(DonationTransaction.created_at.desc()).limit(20).all()
    return api_success(data={'donors': [d.to_dict() for d in donations]})
