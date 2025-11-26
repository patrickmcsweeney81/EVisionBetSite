# BET EVision Platform - Architecture

## Overview

BET EVision is a sports betting analytics platform that finds Expected Value (EV) betting opportunities by comparing odds across multiple bookmakers against fair/sharp prices.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Frontend                             │
│                      (React + Vite)                          │
│  - Odds comparison table                                     │
│  - Real-time updates (WebSocket)                            │
│  - User dashboard & analytics                               │
│  - Bet tracking interface                                   │
└────────────────┬────────────────────────────────────────────┘
                 │
                 │ HTTPS/WSS
                 ▼
┌─────────────────────────────────────────────────────────────┐
│                      Backend API                             │
│                   (Python FastAPI)                           │
│  - User authentication (JWT)                                │
│  - API endpoints for odds & EV data                         │
│  - WebSocket server for real-time updates                   │
│  - Background job scheduling                                │
└─────┬──────────────────────────────┬────────────────────────┘
      │                              │
      │                              │
      ▼                              ▼
┌──────────────────┐         ┌────────────────────┐
│   PostgreSQL     │         │   Redis Cache      │
│                  │         │                    │
│  - Users         │         │  - Odds data       │
│  - Bet history   │         │  - EV results      │
│  - Preferences   │         │  - Session data    │
└──────────────────┘         └────────────────────┘
      │
      │
      ▼
┌─────────────────────────────────────────────────────────────┐
│                      EV Bot Engine                           │
│                    (Python Module)                           │
│  - Odds API integration (The Odds API)                      │
│  - Fair odds calculation (Pinnacle, Betfair)                │
│  - EV calculation                                            │
│  - Arbitrage detection                                       │
│  - Deduplication & filtering                                │
└─────────────────────────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **UI Library:** Material-UI / Ant Design (TBD)
- **Table:** TanStack Table / AG-Grid
- **Charts:** Recharts / Victory
- **Real-time:** Socket.io-client
- **Routing:** React Router
- **State Management:** React Context / Zustand
- **Hosting:** Netlify

### Backend
- **Framework:** Python FastAPI (migrating from Node.js)
- **Authentication:** JWT (JSON Web Tokens)
- **Database ORM:** SQLAlchemy
- **Migrations:** Alembic
- **Background Jobs:** Celery + Redis
- **WebSocket:** FastAPI WebSockets / Socket.io
- **Hosting:** Render

### Database & Cache
- **Database:** PostgreSQL (on Render or Supabase)
- **Cache:** Redis (for odds data, session storage)
- **File Storage:** S3 or Render disk (for CSV exports)

### External Services
- **Odds Data:** The Odds API
- **Notifications:** SendGrid (email), Twilio (SMS)
- **Monitoring:** Sentry (errors), Datadog (performance)
- **DNS:** Namecheap
- **SSL:** Let's Encrypt (via Netlify)

## Data Flow

### 1. Odds Fetching (Background Job)
```
Celery Worker (every 1-5 min)
  ↓
Fetch from The Odds API
  ↓
Process & Calculate Fair Odds
  ↓
Calculate EV for each bookmaker
  ↓
Store in Redis (with TTL)
  ↓
Filter by user preferences
  ↓
Broadcast to connected WebSocket clients
```

### 2. User Request Flow
```
User visits /dashboard
  ↓
Frontend requests GET /api/ev-opportunities
  ↓
Backend checks Redis cache
  ↓
If cache hit: return data
If cache miss: fetch from DB or trigger calculation
  ↓
Return JSON response to frontend
  ↓
Frontend renders odds comparison table
```

### 3. Real-time Updates
```
User connects via WebSocket
  ↓
Backend registers client connection
  ↓
Background job finds new EV opportunity
  ↓
Backend broadcasts to all connected clients
  ↓
Frontend receives update via WebSocket
  ↓
Frontend updates table without page refresh
```

## Security

- **Authentication:** JWT tokens with refresh token rotation
- **Password Storage:** Bcrypt hashing with salt
- **HTTPS:** Enforced via Netlify & Render
- **CORS:** Configured to allow only production domains
- **Rate Limiting:** Applied to all API endpoints
- **Input Validation:** Pydantic models in FastAPI
- **SQL Injection:** Prevented via SQLAlchemy ORM
- **CSRF:** Protection for state-changing operations

## Scalability Considerations

### Current Phase (MVP)
- Single backend instance
- Redis on Render
- PostgreSQL on Render
- Expected load: <100 concurrent users

### Future Scaling
- **Horizontal Scaling:** Multiple FastAPI instances behind load balancer
- **Database:** Read replicas for reporting queries
- **Cache:** Redis Cluster for distributed caching
- **CDN:** Cloudflare for static assets
- **Background Jobs:** Multiple Celery workers

## Monitoring & Observability

- **Application Logs:** Python logging module → Sentry
- **Performance Metrics:** Datadog APM
- **Error Tracking:** Sentry
- **Uptime Monitoring:** UptimeRobot / Betteruptime
- **Database Metrics:** PostgreSQL logs + Datadog
- **API Usage:** Custom middleware tracking

## Deployment Pipeline

```
Developer pushes to GitHub main branch
  ↓
GitHub Actions CI/CD triggers
  ↓
Run tests (pytest, Jest)
  ↓
Build frontend (npm run build)
  ↓
Deploy frontend to Netlify (auto)
  ↓
Deploy backend to Render (auto)
  ↓
Run database migrations (Alembic)
  ↓
Deployment complete
  ↓
Slack/Discord notification
```

## Environment Variables

### Frontend (.env.production)
- `REACT_APP_API_URL`: Backend API URL
- `REACT_APP_WS_URL`: WebSocket URL
- `REACT_APP_ENV`: production

### Backend (.env on Render)
- `DATABASE_URL`: PostgreSQL connection string
- `REDIS_URL`: Redis connection string
- `ODDS_API_KEY`: The Odds API key
- `JWT_SECRET`: Secret for JWT signing
- `SENDGRID_API_KEY`: Email service
- `TWILIO_*`: SMS credentials
- `SENTRY_DSN`: Error tracking
- `CORS_ORIGINS`: Allowed origins

## Directory Structure (Updated)

```
EVisionBetSite/
├── frontend/              # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── hooks/        # Custom hooks
│   │   ├── utils/        # Utility functions
│   │   └── styles/       # CSS/styling
│   ├── public/           # Static assets
│   └── package.json
├── backend/              # FastAPI application (will replace Node.js)
│   ├── api/             # API routes
│   ├── models/          # Database models
│   ├── services/        # Business logic
│   ├── utils/           # Helper functions
│   ├── main.py          # FastAPI app entry
│   └── requirements.txt
├── bot/                  # EV bot Python code
│   ├── core/            # Bot core modules
│   ├── data/            # Data storage
│   ├── scripts/         # Utility scripts
│   └── ev_arb_bot.py
├── docs/                 # Documentation
├── .github/             # CI/CD workflows
├── tests/               # Test files
└── README.md
```

## Next Steps

See [TODO.md](../TODO.md) for detailed implementation roadmap.
