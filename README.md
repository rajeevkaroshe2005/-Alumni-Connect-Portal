# Alumni Connect Portal 🎓

[![Build Status](https://img.shields.io/badge/Build-Passing-244B3A?style=for-the-badge&logo=github-actions)](https://github.com)
[![Tests](https://img.shields.io/badge/Tests-24%2F24%20Passed-brightgreen?style=for-the-badge&logo=pytest)](https://pytest.org)
[![Python](https://img.shields.io/badge/Python-3.12%2B-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-3.x-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.x-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://mysql.com)

> An enterprise-grade, full-stack institutional alumni engagement and career acceleration platform connecting students, graduates, and university administrators through content-based AI recommendations, real-time messaging, mentorship scheduling, and career intelligence.

---

## 🌟 Key Features & Innovations

### 1. 🤖 AI Career Intelligence & Recommendations
- **Content-Based TF-IDF Recommendations**: Matches students with optimal alumni mentors and job openings using N-gram vector space modeling and cosine similarity.
- **ATS Resume Scanner & Skill Gap Matrix**: Analyzes student resumes against job descriptions, computes percentage fit, flags missing high-value keywords, and generates a personalized 4-phase career roadmap.
- **AI Mock Technical Interview Simulator**: Interactive domain-specific interview questions (Full-Stack, Cloud/DevOps, Data/AI) with automated keyword and depth analysis.
- **Smart Cold Outreach Pitch Generator**: Drafts tailored outreach messages (Coffee Chat, Referral Request, Advice) parameterized by alumni company and shared background.
- **Career & Compensation Predictor**: Predicts market compensation bands, salary growth trajectories, and high-ROI competencies to learn next.
- **Proactive Opportunity Alerts**: Automatic trigger notifications when job openings or mentors exceed a 65% profile match score.

### 2. 📅 High-Concurrency Mentorship Booking Engine
- **Slot Availability Scheduling**: Mentors publish discrete time slots with custom topics and durations.
- **Double-Booking & Race-Condition Safeguards**: Transaction-level checks prevent simultaneous slot collision.
- **Workflow State Machine**: Supports `PENDING` → `CONFIRMED` / `REJECTED` → `COMPLETED` lifecycle with meeting links, session minutes, action items, and student star ratings.

### 3. 💼 Institutional Job & Internship Board
- **Full Hiring Lifecycle**: Postings with experience level filters, work arrangement tags (Remote, Hybrid, On-site), and direct application workflows.
- **Application Tracking System (ATS)**: Candidates track review stages (`APPLIED`, `REVIEWING`, `SHORTLISTED`, `ACCEPTED`, `REJECTED`).

### 4. 🌐 Enterprise Community & Collaboration
- **Interactive Relationship Network Graph**: Visual node-link visualization mapping student connections to alumni across tier-1 company hubs.
- **Cross-Batch Collaboration Board**: Student and alumni project proposals seeking co-founders, contributors, and research teammates.
- **Peer Skill Endorsements with Anti-Abuse Rules**: Verified alumni endorse student skills only if mutual relationship criteria (e.g. completed mentorship session or shared department) are met.
- **Alumni Achievement Wall & Cheers**: Showcase graduate career promotions, startup fundraises, and research awards with campus applause.
- **Donation & Crowdfunding Campaigns**: Campus fundraising campaigns with real-time progress bars, pledge tracking, and donor recognition rolls.

### 5. 🎟️ Digital Campus Events & QR Check-In
- **Event Registrations**: Capacity tracking and automated digital verification tokens for campus and virtual events.
- **Instant Check-In**: Fast token and user-ID verification at venue entry, followed by attendee feedback and ratings.

### 6. 💬 Real-Time Chat & Communications
- **Socket.IO Real-Time Chat**: Live peer-to-peer messaging with unread badges and typing indicators.
- **Centralized Notification Hub**: Alerts for booking approvals, application status updates, and peer endorsements.

### 7. 🛡️ Administrative Moderation & Audit Logs
- **Alumni Degree Verification**: Admin verification workflow for graduating batches and student ID numbers.
- **Job & Content Moderation**: Platform safety controls approving public listings.
- **Immutable Audit Trail**: Security and compliance log tracking all sensitive institutional operations.

---

## 🏗️ Architecture & Technology Stack

```
alumni-connect-portal/
├── backend/
│   ├── app/
│   │   ├── blueprints/       # Modular REST APIs (auth, ai, mentorship, jobs, events, etc.)
│   │   ├── models/           # SQLAlchemy 2.0 ORM Entities & Schema definitions
│   │   ├── services/         # AI Recommendation, Auth, Audit, and Business Services
│   │   └── utils/            # JWT decorators, standard JSON response formatters
│   ├── tests/                # Comprehensive Pytest suite (AI, Concurrency, Auth, RBAC)
│   ├── run.py                # Flask Application Factory with SocketIO server
│   └── seed.py               # Pre-populated demonstration database seeder
├── frontend/
│   ├── src/
│   │   ├── components/       # Reusable UI controls, Navigation, Footers, and Protected Routes
│   │   ├── context/          # Global AuthContext and SocketContext providers
│   │   ├── pages/            # Route pages (Lazy-loaded code-split modules)
│   │   └── services/         # Axios API client with automatic JWT bearer interceptors
│   ├── vite.config.js        # Vite 8 + Rolldown optimized vendor chunking
│   └── index.html            # Single Page Application HTML5 entry point
├── docs/                     # Architectural, database, API, and security documentation
└── docker-compose.yml        # Multi-container orchestration (MySQL, Flask, Nginx/React)
```

| Component | Technology | Description |
|:---|:---|:---|
| **Backend Framework** | Flask 3.x, Werkzeug | Lightweight, modular Python web service |
| **Database ORM** | SQLAlchemy 2.0, Flask-SQLAlchemy | Robust relational mapping with SQLite/MySQL fallback |
| **Authentication** | PyJWT, PBKDF2-SHA256 | Stateless JSON Web Tokens with encrypted password hashing |
| **Real-time Protocol** | Flask-SocketIO & Socket.IO Client | Event-driven duplex WebSocket communication |
| **Frontend Framework** | React 19, React Router 7 | Modern declarative UI with route-based lazy loading |
| **Styling & Theme** | Tailwind CSS 4 | Institutional palette (`#244B3A` Forest, `#F5F1E8` Sand) |
| **Data Visualization** | Recharts, Lucide Icons | Responsive SVG charts and iconography |
| **Bundler & Build Tool**| Vite 8, Rolldown | High-performance sub-3-second builds with vendor code-splitting |

---

## 👥 Demo Accounts & Credentials

All seeded demonstration accounts share the master demonstration password:
> **Default Password:** `Password123!`

| Role | Email | Name | Focus / Department |
|:---|:---|:---|:---|
| **ADMIN** | `admin@alumniportal.edu` | Portal Administrator | Platform Moderation & Degree Verification |
| **ALUMNI** | `priya.sharma@alumni.edu` | Priya Sharma | Staff Software Engineer @ Google (CSE '18) |
| **ALUMNI** | `rohit.verma@alumni.edu` | Rohit Verma | Senior Product Manager @ Microsoft (ECE '19) |
| **ALUMNI** | `ananya.sen@alumni.edu` | Ananya Sen | Senior Data Scientist @ Amazon (Data Science '20) |
| **STUDENT** | `aarav.mehta@student.edu` | Aarav Mehta | Final Year B.Tech CSE (Class of '25) |
| **STUDENT** | `sneha.rao@student.edu` | Sneha Rao | Pre-Final Year B.Tech ECE (Class of '26) |

---

## 🚀 Quick Start Guide

### Option A: Docker Compose (Recommended for Production)

Run the entire platform with a single command:

```bash
docker-compose up --build
```

- **Frontend Application:** [http://localhost:80](http://localhost:80)
- **Backend REST API:** [http://localhost:5000](http://localhost:5000)
- **MySQL Database:** `localhost:3306`

---

### Option B: Local Development Setup

#### 1. Backend Setup

```bash
# Navigate to backend and activate virtual environment
cd backend
python -m venv venv

# Windows:
.\venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Seed demonstration data (creates SQLite/MySQL schema and demo records)
python seed.py

# Start Flask backend server
python run.py
```
Backend will start at: `http://localhost:5000`

#### 2. Frontend Setup

```bash
# Navigate to frontend in a new terminal
cd frontend

# Install npm packages
npm install

# Start Vite development server
npm run dev
```
Frontend will start at: `http://localhost:5173`

---

## 🧪 Testing & Quality Assurance

### Run Backend Integration Tests (Pytest)
```bash
# From workspace root:
.\venv\Scripts\pytest -v
```
- **Coverage:** 24 test suites covering AI recommendation algorithms, double-booking prevention under concurrency, JWT authentication, RBAC authorization, event check-in, donation campaigns, and skill endorsements.
- **Status:** `24 passed, 0 warnings` (100% clean SQLAlchemy 2.0 execution).

### Run Frontend Unit Tests (Vitest)
```bash
npm --prefix frontend test -- --run
```

### Production Build & Bundle Verification
```bash
npm --prefix frontend run build
```
- Builds in **< 3 seconds** with optimized code-split chunks:
  - Entry Bundle: `~132 kB` (reduced by 88% from initial 1.13 MB monolith)
  - Modular on-demand chunks for AI Tools, Dashboards, Jobs, and Mentorship.

---

## 🔒 Security & Governance

- **Authentication**: Signed JWT tokens stored in browser local storage and dispatched in the `Authorization: Bearer <token>` header.
- **Authorization**: Granular `@roles_required(['ADMIN', 'ALUMNI', 'STUDENT'])` route decorators enforcing least-privilege access.
- **Audit Logging**: Sensitive changes (user deactivation, job moderation, donation pledges, password updates) logged with client IP address, actor ID, and metadata.
- **Input Sanitization**: Parameter validation across all endpoints protecting against injection and unauthorized state mutations.

---

## 📄 License
This project is licensed under the MIT License. Developed for university and enterprise alumni networks.
