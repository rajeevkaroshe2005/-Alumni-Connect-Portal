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


def test_ai_mock_interview_questions_and_evaluation(client, seeded_users, auth_headers):
    """Test AI Mock Interview questions retrieval and answer evaluation."""
    # 1. Fetch questions
    res = client.get('/api/ai/interview/questions?domain=FULL_STACK', headers=auth_headers['student'])
    assert res.status_code == 200
    q_data = res.get_json()['data']
    assert len(q_data['questions']) >= 1
    sample_q = q_data['questions'][0]

    # 2. Evaluate answer
    eval_res = client.post('/api/ai/interview/evaluate', json={
        'question_text': sample_q['question'],
        'student_answer': 'To handle race conditions, we use database transactions with pessimistic locking via SELECT FOR UPDATE, ensuring atomic isolation and concurrency control.',
        'domain': 'FULL_STACK',
    }, headers=auth_headers['student'])

    assert eval_res.status_code == 200
    evaluation = eval_res.get_json()['data']['evaluation']
    assert evaluation['overall_score'] >= 50
    assert 'transaction' in evaluation['matched_keywords']
    assert 'model_answer' in evaluation
    assert len(evaluation['improvement_tips']) > 0


def test_ai_smart_referral_pitch(client, seeded_users, auth_headers):
    """Test 1-click personalized AI referral outreach generator."""
    alumni = seeded_users['alumni']
    job = seeded_users['job']

    res = client.post('/api/ai/referral-pitch', json={
        'alumnus_id': alumni.id,
        'job_id': job.id,
    }, headers=auth_headers['student'])

    assert res.status_code == 200
    pitch = res.get_json()['data']['pitch']
    assert 'subject_line' in pitch
    assert 'pitch_text' in pitch
    assert job.company in pitch['pitch_text']
    assert pitch['target_alumnus_id'] == alumni.id


def test_global_alumni_analytics_hub(client, seeded_users, auth_headers):
    """Test Global Alumni Career Matrix and placement analytics."""
    res = client.get('/api/ai/analytics-hub', headers=auth_headers['student'])
    assert res.status_code == 200
    analytics = res.get_json()['data']['analytics']
    assert 'global_hubs' in analytics
    assert len(analytics['global_hubs']) >= 5
    assert analytics['total_alumni_network'] > 100
    assert analytics['placement_percentage'] > 90
