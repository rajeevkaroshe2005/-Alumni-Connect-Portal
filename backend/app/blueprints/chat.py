from flask import Blueprint, request
from flask_socketio import emit, join_room, leave_room, disconnect
from sqlalchemy import or_, and_, desc
from .. import db
from ..models import Message, User, Profile, Notification
from ..services.auth_service import AuthService
from ..utils.response import api_success, api_error
from ..utils.decorators import jwt_required

chat_bp = Blueprint('chat', __name__)


@chat_bp.route('/conversations', methods=['GET'])
@jwt_required
def get_user_conversations():
    """List recent conversation threads for authenticated user with last message and unread count."""
    user_id = request.user_id

    # Find distinct conversation partners
    messages = Message.query.filter(
        or_(Message.sender_id == user_id, Message.recipient_id == user_id)
    ).order_by(Message.created_at.desc()).all()

    seen_partners = set()
    conversations = []

    for msg in messages:
        partner_id = msg.recipient_id if msg.sender_id == user_id else msg.sender_id
        if partner_id in seen_partners:
            continue
        seen_partners.add(partner_id)

        partner = User.query.get(partner_id)
        if not partner:
            continue

        partner_profile = partner.profile
        unread_count = Message.query.filter_by(
            sender_id=partner_id,
            recipient_id=user_id,
            is_read=False,
        ).count()

        conversations.append({
            'partner_id': partner_id,
            'partner_name': f"{partner_profile.first_name} {partner_profile.last_name}" if partner_profile else "User",
            'partner_avatar': partner_profile.avatar_url if partner_profile else None,
            'partner_headline': partner_profile.headline if partner_profile else None,
            'partner_role': partner.role,
            'conversation_id': msg.conversation_id,
            'last_message': msg.content,
            'last_message_at': msg.created_at.isoformat(),
            'unread_count': unread_count,
        })

    return api_success(data={'conversations': conversations})


@chat_bp.route('/messages/<int:partner_id>', methods=['GET'])
@jwt_required
def get_messages_with_partner(partner_id):
    """Fetch message history between current user and partner, marking received messages as read."""
    user_id = request.user_id
    conversation_id = Message.build_conversation_id(user_id, partner_id)

    # Fetch messages
    messages = Message.query.filter_by(conversation_id=conversation_id).order_by(Message.created_at.asc()).all()

    # Mark unread messages sent by partner as read
    unread_messages = Message.query.filter_by(
        conversation_id=conversation_id,
        recipient_id=user_id,
        is_read=False,
    ).all()

    if unread_messages:
        for m in unread_messages:
            m.is_read = True
        db.session.commit()

    return api_success(data={'messages': [m.to_dict() for m in messages]})


@chat_bp.route('/send', methods=['POST'])
@jwt_required
def send_message_api():
    """REST endpoint fallback to send a direct message."""
    data = request.get_json() or {}
    recipient_id = data.get('recipient_id')
    content = data.get('content', '').strip()

    if not recipient_id or not content:
        return api_error("Recipient ID and message content are required.", 400)

    sender_id = request.user_id
    if sender_id == recipient_id:
        return api_error("Cannot send messages to yourself.", 400)

    recipient = User.query.get(recipient_id)
    if not recipient:
        return api_error("Recipient user not found.", 404)

    conversation_id = Message.build_conversation_id(sender_id, recipient_id)
    new_msg = Message(
        sender_id=sender_id,
        recipient_id=recipient_id,
        conversation_id=conversation_id,
        content=content,
    )

    try:
        db.session.add(new_msg)
        db.session.commit()
        msg_dict = new_msg.to_dict()

        # Emit real-time WebSocket events to both participant rooms
        try:
            from .. import socketio
            room_name = f"room_{conversation_id}"
            socketio.emit('new_message', msg_dict, to=room_name)
            socketio.emit('new_message', msg_dict, to=f"user_{recipient_id}")
            socketio.emit('new_message', msg_dict, to=f"user_{sender_id}")

            sender_profile = new_msg.sender.profile if new_msg.sender else None
            sender_name = f"{sender_profile.first_name} {sender_profile.last_name}".strip() if sender_profile else "Someone"
            socketio.emit('message_notification', {
                'sender_id': sender_id,
                'sender_name': sender_name or "Someone",
                'content': content[:50] + ('...' if len(content) > 50 else ''),
                'conversation_id': conversation_id,
            }, to=f"user_{recipient_id}")
        except Exception:
            pass

        return api_success(data={'message': msg_dict}, status_code=201)
    except Exception as e:
        db.session.rollback()
        return api_error(f"Failed to send message: {str(e)}", 500)


def register_socket_events(socketio):
    """Register WebSocket event listeners for authorized real-time messaging."""

    @socketio.on('connect')
    def handle_connect(auth):
        """Authenticate connecting socket client via JWT."""
        token = None
        if isinstance(auth, dict):
            token = auth.get('token')
        if not token:
            token = request.args.get('token')

        if not token:
            emit('error', {'message': 'Authentication token missing.'})
            return False  # Refuse connection

        try:
            payload = AuthService.decode_token(token)
            # Store authenticated user identity on the socket session
            user_id = payload.get('sub')
            join_room(f"user_{user_id}")
            emit('connected', {'user_id': user_id, 'message': 'WebSocket connected and authorized.'})
        except Exception:
            emit('error', {'message': 'Invalid token signature or expired token.'})
            return False

    @socketio.on('join_conversation')
    def handle_join_conversation(data):
        """Authorize user to join a specific conversation room."""
        auth_header = data.get('token') or request.args.get('token')
        conversation_id = data.get('conversation_id')

        if not conversation_id:
            return

        try:
            payload = AuthService.decode_token(auth_header)
            user_id = payload.get('sub')

            # Verify that the user is an authorized participant of this conversation
            # conversation_id format: "conv_{id1}_{id2}"
            parts = conversation_id.split('_')
            if len(parts) != 3 or parts[0] != 'conv':
                emit('error', {'message': 'Malformed conversation ID.'})
                return

            user_a, user_b = int(parts[1]), int(parts[2])
            if user_id != user_a and user_id != user_b:
                emit('error', {'message': 'Unauthorized: Access to this conversation is forbidden.'})
                return

            room_name = f"room_{conversation_id}"
            join_room(room_name)
            emit('joined_room', {'room': room_name, 'conversation_id': conversation_id})

        except Exception as e:
            emit('error', {'message': f'Authorization failure: {str(e)}'})

    @socketio.on('send_message')
    def handle_send_message(data):
        """Process and broadcast outgoing message within authorized room."""
        token = data.get('token')
        recipient_id = data.get('recipient_id')
        content = (data.get('content') or '').strip()

        if not content or not recipient_id:
            return

        try:
            payload = AuthService.decode_token(token)
            sender_id = payload.get('sub')
            recipient_id = int(recipient_id)

            conversation_id = Message.build_conversation_id(sender_id, recipient_id)
            room_name = f"room_{conversation_id}"

            # Persist message to database
            msg = Message(
                sender_id=sender_id,
                recipient_id=recipient_id,
                conversation_id=conversation_id,
                content=content,
                is_read=False,
            )
            db.session.add(msg)
            db.session.commit()

            msg_dict = msg.to_dict()

            # Broadcast message to participants in room
            emit('new_message', msg_dict, to=room_name)

            # Emit notification event to recipient's individual user channel
            sender_profile = msg.sender.profile if msg.sender else None
            sender_name = f"{sender_profile.first_name} {sender_profile.last_name}" if sender_profile else "Someone"
            emit('message_notification', {
                'sender_id': sender_id,
                'sender_name': sender_name,
                'content': content[:50] + ('...' if len(content) > 50 else ''),
                'conversation_id': conversation_id,
            }, to=f"user_{recipient_id}")

        except Exception as e:
            db.session.rollback()
            emit('error', {'message': f"Failed to deliver message: {str(e)}"})
