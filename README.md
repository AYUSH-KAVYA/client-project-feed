# Real-Time Client Project Dashboard & Activity Feed

A full-stack agency project management system featuring strict role-based access control (RBAC), WebSocket live activity streams, background overdue task cron scheduling, in-app notifications, and PostgreSQL relational database design.

---

## Key Features

1. **Strict API-Level Role-Based Access Control (RBAC)**
   - **Admin**: Full access across all clients, projects, users, and global real-time activity feeds.
   - **Project Manager**: Create & manage owned projects and tasks. Enforced ownership checks ensure PMs cannot access or edit another PM's projects or tasks.
   - **Developer**: View assigned tasks only (sorted by priority then due date). Restricted from viewing unassigned tasks or other PMs' project data even with direct API requests.

2. **JWT Authentication & Secure Token Storage**
   - Access tokens (15-min lifespan) passed via `Authorization: Bearer <token>`.
   - Refresh tokens (7-day lifespan) stored in secure `HttpOnly` `SameSite=Lax` cookies to prevent XSS token theft.

3. **Real-Time Activity Feed & Presence**
   - **Socket.io WebSocket Server**: Real-time room-scoped event broadcasting (`room:admin`, `room:pm:<id>`, `room:project:<id>`, `room:dev:<id>`).
   - **Live Presence**: Displays a live counter of online users connected via WebSockets for authorized roles.
   - **Missed Event Catchup**: Users coming back online fetch top 20 missed activity events directly from PostgreSQL via role-filtered DB queries.

4. **Automated Background Overdue Scheduler**
   - Background cron job (`node-cron`) automatically flags tasks past their due date as `isOverdue: true` every minute and emits real-time activity log events.

5. **In-App Real-Time Notifications**
   - Unread notification count badge and dropdown.
   - Triggers live WebSocket updates when tasks are assigned to developers or moved to `IN_REVIEW`.

6. **Shareable URL Query Parameters**
   - Task filters (Status, Priority, Due Date Range, Search) sync with URL query string parameters (`?status=IN_PROGRESS&priority=HIGH`), making filtered views bookmarkable and shareable.

---

## Custom Extensions & Additional Requirements

1. **Top Navbar Presence & Status Indicator**
   - Removed pulsing signal animations in favor of a static status dot.
   - Shows a static green dot when `onlineCount >= 1` and a static red dot with red text (`0 Online`) when `onlineCount === 0`.
   - Displays static `Socket.io Live Connected` connection status.
   - **Developer Visibility Scoping**: Developers cannot view active user counts or online user lists. Presence metrics and active user lists are restricted exclusively to `ADMIN` and `PROJECT_MANAGER` roles.

2. **Contextual Task Card Background Color Shading**
   - **Done Tasks**: Rendered with a green background shade (`bg-emerald-950/50 border-emerald-800/80`).
   - **Due Date < 24h OR Overdue**: Tasks with a due date in less than 24 hours or overdue (and not completed) render with a prominent red background shade (`bg-rose-950/60 border-rose-800/90`), regardless of critical or normal priority.
   - **Critical Priority (Not Done)**: Rendered with a red background shade (`bg-rose-950/40 border-rose-800/70`).
   - **In Progress (Not Done)**: Rendered with a yellow/amber background shade (`bg-amber-950/40 border-amber-800/70`).
   - **Default Cases**: Standard clean dark card background styling.

3. **Project Hierarchy & Admin Approval Workflow**
   - **Admin Created Projects**: Automatically approved and immediately reflected across Project Managers and Developers.
   - **PM Created Projects**: Created with `PENDING_APPROVAL` status requiring Admin authorization.
   - **Project Requests Queue**: Admins have a dedicated Project Requests page (`/project-requests`) to review, approve, or reject pending project proposals submitted by Project Managers.

4. **Developer Feature Proposals Workflow ("Dev Modifications")**
   - **Developers**: Can propose technical feature modifications for assigned projects/tasks via the Dev Modifications page (`/modifications`).
   - **Project Managers**: Have a dedicated review queue under Dev Modifications to review proposals and approve or reject feature requests from developers, sending real-time notifications to the developer.

5. **Dashboard Telemetry Refinement**
   - Removed active online user count cards from the Admin Dashboard view.

---

## Local Setup Instructions

### Prerequisites
- Node.js (v18+) & npm
- PostgreSQL (v15+) OR Docker & Docker Compose

---

### Option A: Running with Docker Compose (Recommended)

```bash
# Navigate to root directory
cd "Client Project Feed"

# Launch PostgreSQL, Backend, and Frontend containers
docker-compose up --build
```

Access the frontend application at **`http://localhost`**.

---

### Option B: Local Manual Setup (Without Docker)

#### 1. Database Setup
Create PostgreSQL database:
```sql
CREATE DATABASE client_project_feed;
```

#### 2. Backend Setup
```bash
cd backend

# Create .env file from template
cp .env.example .env

# Install dependencies
npm install

# Push Prisma Schema to database
npx prisma db push

# Seed Database with initial data
npm run prisma:seed

# Start backend development server (Port 5001)
npm run dev
```

#### 3. Frontend Setup
In a new terminal window:
```bash
cd frontend

# Install dependencies
npm install

# Start Vite frontend development server (Port 5173)
npm run dev
```

Access the application at **`http://localhost:5173`**.

---

## Pre-seeded Accounts (Password: `password123`)

| Role | Name | Email | Password | Access Scope |
|---|---|---|---|---|
| **Admin** | Alice Admin | `admin@agency.com` | `password123` | Full global access across agency |
| **Project Manager 1** | Sarah Jenkins | `pm.sarah@agency.com` | `password123` | Manages Acme E-Commerce & Globex Mobile |
| **Project Manager 2** | David Vance | `pm.david@agency.com` | `password123` | Manages Stark Analytics Dashboard |
| **Developer 1** | Ravi Sharma | `dev.ravi@agency.com` | `password123` | Assigned to Acme & Globex tasks |
| **Developer 2** | Elena Rostova | `dev.elena@agency.com` | `password123` | Assigned to Acme & Stark tasks |
| **Developer 3** | Marcus Vance | `dev.marcus@agency.com` | `password123` | Assigned to Globex & Stark tasks |
| **Developer 4** | Chloe Bennett | `dev.chloe@agency.com` | `password123` | Assigned to Globex & Stark tasks |

---

## Database Schema & Indexing Architecture

```
User (id, email, passwordHash, name, role)
 ├── Project (createdById)
 ├── Task (assignedToId)
 ├── ActivityLog (userId)
 ├── Notification (userId)
 └── ModificationRequest (devId, pmId)

Client (id, name, company, email, phone)
 └── Project (clientId)

Project (id, name, description, clientId, createdById, approvalStatus)
 ├── Task (projectId)
 ├── ActivityLog (projectId)
 └── ModificationRequest (projectId)

Task (id, taskNumber, title, description, status, priority, isOverdue, dueDate, projectId, assignedToId)
 ├── ActivityLog (taskId)
 ├── Notification (taskId)
 └── ModificationRequest (taskId)

ActivityLog (id, taskId, projectId, userId, action, previousStatus, newStatus, message, createdAt)

Notification (id, userId, title, message, isRead, taskId, createdAt)

ModificationRequest (id, title, description, status, devId, pmId, projectId, taskId, createdAt)
```

---

## Production Deployment Guide

Follow these steps to deploy the application into a production cloud environment (e.g., AWS EC2, DigitalOcean Droplet, Ubuntu Linux VM).

### Step 1: Server Preparation
Install Docker and Docker Compose on the host machine:
```bash
sudo apt-get update
sudo apt-get install -y docker.io docker-compose git
sudo systemctl enable --now docker
```

### Step 2: Clone Repository & Configure Production Environment
```bash
git clone <your-repository-url> client-project-feed
cd client-project-feed
```

Configure production variables in `backend/.env`:
```env
PORT=5001
NODE_ENV=production
DATABASE_URL="postgresql://postgres:YOUR_STRONG_PASSWORD@postgres:5432/client_project_feed?schema=public"
JWT_ACCESS_SECRET="GENERATE_STRONG_RANDOM_SECRET_KEY_32_CHARS"
JWT_REFRESH_SECRET="GENERATE_STRONG_RANDOM_SECRET_KEY_32_CHARS"
JWT_ACCESS_EXPIRES_IN="15m"
JWT_REFRESH_EXPIRES_IN="7d"
CORS_ORIGIN="https://yourdomain.com"
```

### Step 3: Launch Containers with Docker Compose
```bash
docker-compose -f docker-compose.yml up -d --build
```

Verify running containers:
```bash
docker-compose ps
```

### Step 4: SSL/TLS Reverse Proxy Setup (Nginx + Certbot)
Install Nginx and Let's Encrypt Certbot on the host server:
```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
```

Configure Nginx reverse proxy block (`/etc/nginx/sites-available/client-project-feed`):
```nginx
server {
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:80;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /socket.io {
        proxy_pass http://localhost:5001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

Enable site configuration and issue SSL certificate:
```bash
sudo ln -s /etc/nginx/sites-available/client-project-feed /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
sudo certbot --nginx -d yourdomain.com
```

---

## Architectural Decisions

### 1. WebSocket Library Choice: Socket.io vs. Native WebSocket
- **Decision**: Socket.io
- **Rationale**: Built-in room management (`socket.join('room:project:123')`) simplifies role-based broadcast scoping without custom room tracking engines. Additionally, Socket.io provides automatic transport fallback, connection state recovery, and heartbeats out of the box.

### 2. Job Queue Choice: node-cron vs. Bull Queue
- **Decision**: `node-cron`
- **Rationale**: Lightweight, single-instance scheduler running directly within the Node process without requiring an additional Redis cluster infrastructure dependency, perfectly suited for periodic task due-date auditing.

### 3. Token Storage Approach: Access Token + HttpOnly Refresh Cookie
- **Decision**: Dual Token Authentication
- **Rationale**: Storing access tokens in React memory/state prevents XSS script access to tokens. Refresh tokens stored in `HttpOnly`, `SameSite=Lax` cookies ensure secure token renewal across page refreshes without risking local Storage leakage.

---

## Known Limitations
1. Single-node in-memory presence tracking (requires Redis adapter if scaling to multi-instance backend clusters).
2. Email notification integration (currently in-app notifications only).
