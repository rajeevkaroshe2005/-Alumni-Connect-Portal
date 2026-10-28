import json
from app.models import User


def test_health_check(client):
    """Test health-check endpoint."""
    res = client.get('/api/health')
    assert res.status_code == 200
    data = res.get_json()
    assert data['status'] == 'healthy'
    assert data['service'] == 'Alumni Connect Portal API'


def test_student_registration_success(client):
    """Test valid student registration."""
    payload = {
        'email': 'new.student@test.edu',
        'password': 'Password123!',
        'first_name': 'Rohan',
        'last_name': 'Das',
        'role': 'STUDENT',
        'department': 'Information Technology',
        'expected_graduation_year': 2026,
    }
    res = client.post('/api/auth/register', data=json.dumps(payload), content_type='application/json')
    assert res.status_code == 201
    data = res.get_json()
    assert data['success'] is True
    assert 'token' in data['data']
    assert data['data']['user']['email'] == 'new.student@test.edu'
    assert data['data']['user']['role'] == 'STUDENT'


def test_duplicate_email_registration_fails(client, seeded_users):
    """Test that duplicate email registration returns 409 conflict."""
    payload = {
        'email': 'student@test.edu',  # Already seeded
        'password': 'Password123!',
        'first_name': 'Duplicate',
        'last_name': 'User',
        'role': 'STUDENT',
    }
    res = client.post('/api/auth/register', data=json.dumps(payload), content_type='application/json')
    assert res.status_code == 409
    data = res.get_json()
    assert data['success'] is False


def test_login_success_and_invalid_credentials(client, seeded_users):
    """Test valid login returns JWT token and invalid password fails."""
    # Valid login
    res = client.post('/api/auth/login', json={
        'email': 'student@test.edu',
        'password': 'Password123!',
    })
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert 'token' in data['data']

    # Invalid password
    res_fail = client.post('/api/auth/login', json={
        'email': 'student@test.edu',
        'password': 'WrongPassword!',
    })
    assert res_fail.status_code == 401
    assert res_fail.get_json()['success'] is False


def test_get_current_user_me(client, auth_headers):
    """Test authenticated /me endpoint returns user details."""
    res = client.get('/api/auth/me', headers=auth_headers['student'])
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert data['data']['user']['email'] == 'student@test.edu'


def test_rbac_denies_unauthorized_role(client, auth_headers):
    """Test that a student is strictly denied from accessing admin-only endpoints."""
    res = client.get('/api/admin/analytics', headers=auth_headers['student'])
    assert res.status_code == 403
    assert res.get_json()['success'] is False

    # Admin can access successfully
    res_admin = client.get('/api/admin/analytics', headers=auth_headers['admin'])
    assert res_admin.status_code == 200
    assert res_admin.get_json()['success'] is True
