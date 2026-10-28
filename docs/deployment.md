# Production Deployment & Operations Guide
## Alumni Connect Portal — AI-Powered Alumni Networking, Mentorship & Career Platform

---

### 1. Deployment Topology

The application supports three operational environments:
1. **Local Development:** Vite dev server on `http://localhost:5173`, Flask dev server with SocketIO on `http://127.0.0.1:5000`, local MySQL on port `3306`.
2. **Dockerized Environment:** Multi-container `docker-compose` orchestration featuring Nginx frontend reverse proxy, Python Gunicorn + Eventlet backend, and MySQL 8.0 container.
3. **Cloud Production (e.g. Render / Railway / AWS):** Managed MySQL instance, containerized backend web service with WebSocket worker support, and static CDN frontend hosting (Vercel / Netlify / Cloudflare Pages).

```mermaid
flowchart LR
    Browser["Client Browser (HTTPS)"] --> CDN["Nginx / CDN (Static SPA Assets)"]
    CDN -->|API Requests /api/v1| Gunicorn["Gunicorn + Eventlet (Flask Backend)"]
    Browser <-->|WebSocket /socket.io| Gunicorn
    Gunicorn --> MySQL[("Managed MySQL 8.0 Database")]
```

---

### 2. Environment Variables Configuration

Copy `.env.example` to `.env` in both `backend/` and `frontend/` roots before launching.

#### Backend (`backend/.env`):
```ini
FLASK_APP=run.py
FLASK_ENV=production
DEBUG=False
SECRET_KEY=change-this-to-a-secure-random-256-bit-key
JWT_SECRET_KEY=change-this-to-a-cryptographically-secure-jwt-key
JWT_ACCESS_TOKEN_EXPIRES_DAYS=1

# MySQL Database Connection String
# Format: mysql+pymysql://<user>:<password>@<host>:<port>/<database_name>
DATABASE_URL=mysql+pymysql://root:password@127.0.0.1:3306/alumni_portal

# CORS Allowed Origins (Comma-separated)
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://alumniportal.edu
```

#### Frontend (`frontend/.env`):
```ini
VITE_API_BASE_URL=/api/v1
```

---

### 3. Containerization Strategy (Docker)

#### 3.1 Backend Dockerfile (`backend/Dockerfile`)
```dockerfile
FROM python:3.14-slim

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    default-libmysqlclient-dev \
    pkg-config \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn eventlet

COPY . .

EXPOSE 5000

CMD ["gunicorn", "--worker-class", "eventlet", "-w", "1", "--bind", "0.0.0.0:5000", "run:app"]
```

#### 3.2 Frontend Dockerfile (`frontend/Dockerfile`)
```dockerfile
# Stage 1: Build static React bundle
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve via Nginx
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

#### 3.3 Frontend Nginx Reverse Proxy (`frontend/nginx.conf`)
```nginx
server {
    listen 80;
    server_name localhost;

    location / {
        root /usr/share/nginx/html;
        index index.html index.htm;
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io/ {
        proxy_pass http://backend:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

#### 3.4 Docker Compose (`docker-compose.yml`)
```yaml
version: '3.8'

services:
  db:
    image: mysql:8.0
    container_name: alumni_db
    restart: always
    environment:
      MYSQL_ROOT_PASSWORD: rootpassword
      MYSQL_DATABASE: alumni_portal
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      timeout: 20s
      retries: 10

  backend:
    build:
      context: ./backend
    container_name: alumni_backend
    restart: always
    environment:
      - DATABASE_URL=mysql+pymysql://root:rootpassword@db:3306/alumni_portal
      - SECRET_KEY=prod-secret-key-32-chars-long!
      - JWT_SECRET_KEY=prod-jwt-secret-key-32-chars!
      - CORS_ORIGINS=http://localhost:80,http://localhost
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "5000:5000"

  frontend:
    build:
      context: ./frontend
    container_name: alumni_frontend
    restart: always
    ports:
      - "80:80"
    depends_on:
      - backend

volumes:
  mysql_data:
```

---

### 4. Database Initialization & Seeding in Production

To seed the initial institutional administrator and demonstration accounts:
```bash
# In backend directory or within backend container:
python seed.py
```

This registers:
* **Admin:** `admin@alumniportal.edu` (Password: `Password123!`)
* **Alumni:** `priya@alumniportal.edu`, `rohit@alumniportal.edu`, `ananya@alumniportal.edu`, `vikram@alumniportal.edu` (Password: `Password123!`)
* **Students:** `student@alumniportal.edu`, `neha@alumniportal.edu` (Password: `Password123!`)
* Pre-populated with realistic campus events, job opportunities, and mentorship availability slots.

---

### 5. Health Checks & Monitoring

* **Liveness Endpoint:** `GET /api/v1/health`
  Returns `200 OK` with status `HEALTHY` and database connectivity confirmation:
  ```json
  {
    "success": true,
    "status": "HEALTHY",
    "database": "CONNECTED",
    "timestamp": "2026-10-28T18:30:00Z"
  }
  ```
