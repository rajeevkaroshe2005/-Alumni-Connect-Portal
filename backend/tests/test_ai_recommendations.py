from app.services.ai_service import AIService
from app.models import User, Job


def test_ai_mentor_recommendation(client, seeded_users, auth_headers):
    """Test TF-IDF and skill overlap mentor recommendation."""
    res = client.get('/api/ai/recommended-mentors', headers=auth_headers['student'])
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert 'recommendations' in data['data']
    recs = data['data']['recommendations']
    assert len(recs) >= 1
    top_rec = recs[0]
    assert 'match_percentage' in top_rec
    assert 'reasons' in top_rec
    assert len(top_rec['reasons']) > 0


def test_ai_job_recommendation(client, seeded_users, auth_headers):
    """Test job recommendation ranking and missing skills identification."""
    res = client.get('/api/ai/recommended-jobs', headers=auth_headers['student'])
    assert res.status_code == 200
    data = res.get_json()
    assert data['success'] is True
    assert 'recommendations' in data['data']
    recs = data['data']['recommendations']
    assert len(recs) >= 1
    job_rec = recs[0]
    assert 'match_score' in job_rec
    assert 'matched_skills' in job_rec
    assert 'missing_skills' in job_rec


def test_skill_gap_analysis_and_career_roadmap(client, seeded_users, auth_headers):
    """Test skill gap analysis and 4-phase actionable career roadmap."""
    job = seeded_users['job']
    res = client.post('/api/ai/skill-gap-analysis', json={
        'job_id': job.id,
        'skills': ['Python', 'SQL', 'Git'],
    }, headers=auth_headers['student'])

    assert res.status_code == 200
    data = res.get_json()['data']['analysis']
    assert data['job_id'] == job.id
    assert 'Python' in data['matched_skills']
    assert 'Kubernetes' in data['missing_skills'] or 'Go' in data['missing_skills']
    assert len(data['roadmap']) == 4
    assert 'Phase 1' in data['roadmap'][0]['phase']
