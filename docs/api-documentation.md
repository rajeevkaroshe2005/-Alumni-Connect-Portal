# RESTful API Specification & Endpoints Reference
## Alumni Connect Portal — AI-Powered Alumni Networking, Mentorship & Career Platform

---

### 1. General API Conventions

* **Base URL:** `/api/v1` (with backward-compatible alias `/api`).
* **Transport:** HTTPS with JSON request/response payloads (`Content-Type: application/json`).
* **Authentication Header:** Standard RFC 6750 Bearer token:
  ```http
  Authorization: Bearer <jwt_access_token>
  ```
* **Unified Success Response Format:**
  ```json
  {
    "success": true,
    "data": { ... },
    "message": "Operation completed successfully."
  }
  ```
* **Unified Error Response Format:**
  ```json
  {
    "success": false,
    "message": "Descriptive human-readable error explanation.",
    "error_code": "RESOURCE_NOT_FOUND",
    "status_code": 404
  }
  ```

---

### 2. Authentication & User Session (`/api/v1/auth`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register new `STUDENT` or `ALUMNI` account with profile details. |
| `POST` | `/auth/login` | Public | Authenticate user credentials, returning signed JWT and profile payload. |
| `GET` | `/auth/me` | Authenticated | Retrieve authenticated user session details, role, and profile. |
| `POST` | `/auth/refresh` | Authenticated | Refresh current access token before expiry. |

#### Request: `POST /api/v1/auth/login`
```json
{
  "email": "student@alumniportal.edu",
  "password": "Password123!"
}
```

#### Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 5,
      "email": "student@alumniportal.edu",
      "role": "STUDENT",
      "is_verified": true,
      "profile": {
        "first_name": "Aarav",
        "last_name": "Sharma",
        "headline": "Final Year Computer Science Student",
        "skills": "Python, React, Machine Learning, SQL"
      }
    }
  },
  "message": "Login successful."
}
```

---

### 3. Profiles & Academic/Career Data (`/api/v1/profiles`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/profiles/:id` | Authenticated | Retrieve public profile and bio of a specific user. |
| `PUT` | `/profiles/me` | Authenticated | Update personal profile details, skills, phone, location, and social links. |
| `PUT` | `/profiles/student-details`| `STUDENT` | Update academic department, degree, roll number, CGPA, graduation year. |
| `PUT` | `/profiles/alumni-details` | `ALUMNI` | Update current employer, position, graduation year, industry, and verification proof. |

---

### 4. Alumni Directory (`/api/v1/alumni`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/alumni` | Authenticated | Paginated directory of alumni with filters (`q`, `company`, `industry`, `year`). |
| `GET` | `/alumni/:id` | Authenticated | Detailed professional view of an alumnus, including mentorship availability. |

---

### 5. Jobs & Applications (`/api/v1/jobs`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/jobs` | Authenticated | Filterable job/internship listings (`job_type`, `experience_level`, `q`). |
| `POST` | `/jobs` | `ALUMNI`, `ADMIN`| Publish a new career opportunity. |
| `GET` | `/jobs/:id` | Authenticated | Full job description, responsibilities, and application status. |
| `POST` | `/jobs/:id/apply` | `STUDENT` | Submit resume and cover note for job opening. |
| `POST` | `/jobs/:id/save` | `STUDENT` | Toggle bookmark on job opening. |
| `GET` | `/jobs/my-applications`| `STUDENT` | List student's submitted applications and employer decisions. |

---

### 6. Mentorship & Anti-Double-Booking Scheduler (`/api/v1/mentorship`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/mentorship/mentors` | Authenticated | List all active alumni offering 1-on-1 mentorship. |
| `GET` | `/mentorship/mentors/:id`| Authenticated | Retrieve mentor bio, expertise areas, and available calendar slots. |
| `POST` | `/mentorship/book` | `STUDENT` | Book an open slot with atomic concurrency protection. |
| `GET` | `/mentorship/my-bookings`| Authenticated | View upcoming and past mentorship sessions (student or mentor). |
| `PUT` | `/mentorship/bookings/:id/status`| `ALUMNI`, `ADMIN`| Confirm, complete, or reject a student's mentorship booking. |
| `GET` | `/mentorship/availability`| `ALUMNI` | View mentor's created availability calendar slots. |
| `POST` | `/mentorship/availability`| `ALUMNI` | Create open calendar slots for student bookings. |

#### Request: `POST /api/v1/mentorship/book`
```json
{
  "slot_id": 2,
  "goal_notes": "Seeking feedback on distributed systems architecture and system design interview prep."
}
```

---

### 7. Campus & Alumni Events (`/api/v1/events`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/events` | Authenticated | List upcoming webinars, workshops, reunions, and meetups. |
| `POST` | `/events` | `ALUMNI`, `ADMIN`| Schedule a new campus event with capacity and virtual room link. |
| `GET` | `/events/:id` | Authenticated | Event details, organizer information, and RSVP status. |
| `POST` | `/events/:id/rsvp` | Authenticated | Toggle attendee RSVP registration. |
| `GET` | `/events/:id/attendees`| Authenticated | Retrieve list of registered attendees for the event. |

---

### 8. Direct Messaging & Chat (`/api/v1/chat`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/chat/conversations` | Authenticated | List recent conversations with latest message snippet and unread badges. |
| `GET` | `/chat/messages/:partnerId`| Authenticated | Historical chronological message stream between current user and partner. |
| `POST` | `/chat/send` | Authenticated | Send direct message and emit real-time WebSocket event. |

---

### 9. Notifications Engine (`/api/v1/notifications`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/notifications` | Authenticated | Paginated notifications list with total unread counter. |
| `PUT` | `/notifications/:id/read` | Authenticated | Mark a single notification as read. |
| `PUT` | `/notifications/read-all` | Authenticated | Bulk mark all notifications as read for current user. |

---

### 10. AI Career Recommendations & Skill-Gap Analysis (`/api/v1/ai`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/ai/recommended-mentors`| `STUDENT` | TF-IDF content-based mentor matches with explainable similarity scores. |
| `GET` | `/ai/recommended-jobs` | `STUDENT` | TF-IDF career matches based on student profile and requirements overlap. |
| `POST` | `/ai/parse-resume` | Authenticated | Multipart PDF/TXT upload extracting technical skills in-memory. |
| `POST` | `/ai/skill-gap-analysis` | Authenticated | Compare resume skills with target job to output a 4-phase career roadmap. |

#### Request: `POST /api/v1/ai/skill-gap-analysis`
```json
{
  "job_id": 1,
  "skills": ["Python", "Flask", "SQL", "Git"]
}
```

#### Response: `200 OK`
```json
{
  "success": true,
  "data": {
    "analysis": {
      "target_job_title": "Full-Stack Engineer (React & Python)",
      "target_company": "Stripe",
      "match_score": 0.67,
      "required_skills_count": 6,
      "matched_skills": ["Python", "Flask", "SQL", "Git"],
      "missing_skills": ["React", "Docker"],
      "career_roadmap": [
        {
          "phase": "Phase 1: Core Fundamentals & Theory",
          "timeline": "Weeks 1 - 3",
          "title": "Master React and Docker Prerequisite Foundations",
          "actions": [
            "Study modern React hooks, component lifecycles, and state management patterns.",
            "Understand Docker containerization, image building, and multi-stage builds."
          ]
        },
        {
          "phase": "Phase 2: Hands-on Projects & Architecture",
          "timeline": "Weeks 4 - 6",
          "title": "Build Real-World Integrated Solutions",
          "actions": [
            "Build a full-stack CRUD application pairing React with Python Flask REST endpoints.",
            "Containerize both frontend and backend using Docker Compose."
          ]
        },
        {
          "phase": "Phase 3: Advanced Topics & System Optimization",
          "timeline": "Weeks 7 - 9",
          "title": "Production Readiness & Distributed Architecture",
          "actions": [
            "Implement caching, database connection pooling, and JWT authorization flows.",
            "Write comprehensive automated unit and integration tests."
          ]
        },
        {
          "phase": "Phase 4: Interview Preparation & Portfolio Showcase",
          "timeline": "Weeks 10 - 12",
          "title": "Target Role Interview Readiness",
          "actions": [
            "Practice technical coding interview challenges for full-stack competencies.",
            "Publish working demonstration with live URL and documented architecture."
          ]
        }
      ]
    }
  }
}
```

---

### 11. Admin Governance & Audit Logs (`/api/v1/admin`)

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/stats` | `ADMIN` | System-wide aggregate statistics (users, jobs, mentorship hours, events). |
| `GET` | `/admin/pending-verifications`| `ADMIN` | List alumni awaiting institutional verification review. |
| `PUT` | `/admin/alumni/:id/verify` | `ADMIN` | Approve or reject alumni degree verification. |
| `GET` | `/admin/users` | `ADMIN` | Moderation table for all registered users across all roles. |
| `PUT` | `/admin/users/:id/status` | `ADMIN` | Deactivate or reinstate user access. |
| `GET` | `/admin/audit-logs` | `ADMIN` | Immutable administrative audit trails for compliance. |
