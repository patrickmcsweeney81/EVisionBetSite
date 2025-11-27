# BET EVision Platform - FastAPI Backend

**Production-ready** Python FastAPI backend for the BET EVision sports betting analytics platform.

## 🚀 Quick Start

```powershell
# Install dependencies
pip install -r requirements.txt

# Initialize database
python manage.py init-db
python manage.py seed-default-user

# Run development server
uvicorn app.main:app --reload
```

API available at: `http://localhost:8000` | Docs: `http://localhost:8000/docs`

## 📚 Documentation

- **[PRODUCTION_READY.md](./PRODUCTION_READY.md)** - Complete feature overview
- **[DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md)** - Deployment guide
- **[SECURITY.md](./SECURITY.md)** - Security implementation details
- **[MANAGEMENT.md](./MANAGEMENT.md)** - CLI usage reference

## 🏗️ Architecture

```
backend-python/
├── app/
│   ├── main.py              # FastAPI app with middleware
│   ├── config.py            # Settings and configuration
│   ├── database.py          # SQLAlchemy setup
│   ├── security.py          # Rate limiting, audit logging
│   ├── cache.py             # Redis/in-memory cache manager
│   ├── websocket.py         # WebSocket connection manager
│   ├── api/                 # API endpoints
│   │   ├── auth.py          # JWT authentication
│   │   ├── odds.py          # Odds comparison (with caching)
│   │   ├── ev.py            # EV calculation endpoints
│   │   ├── ws.py            # WebSocket endpoints
│   │   └── monitoring.py    # Health/metrics/stats
│   ├── models/              # Database models
│   │   └── user.py          # User model
│   └── schemas/             # Pydantic validation
│       └── user.py          # User schemas
├── tests/                   # pytest test suite
├── migrations/              # Alembic migrations
├── data/                    # Data files (audit.log, etc.)
├── manage.py                # CLI for operations
├── requirements.txt         # Dependencies
├── validate.py              # Pre-deployment validation
└── .env                     # Environment variables
```

## Setup

### 1. Create Virtual Environment

```powershell
cd backend-python
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 2. Install Dependencies

```powershell
pip install -r requirements.txt
```

### 3. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: JWT secret (generate with `openssl rand -hex 32`)
- `ODDS_API_KEY`: Your Odds API key

### 4. Set Up Database

```powershell
# Initialize database
python manage.py init-db

# Create default user (test/test123)
python manage.py seed-default-user

# Run migrations (when needed)
python manage.py migrate
```

### 5. Run Development Server

```powershell
uvicorn app.main:app --reload --port 8000
```

The API will be available at: `http://localhost:8000`

API documentation (Swagger): `http://localhost:8000/docs`

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT token)
- `GET /api/auth/me` - Get current user info (requires auth)

### Odds & Betting
- `GET /api/odds/sports` - List available sports (with caching)
- `GET /api/odds/{sport}` - Get odds for sport (with caching)
- `GET /api/ev/hits` - Get EV opportunities (from bot CSV)
- `GET /api/ev/summary` - Get EV summary statistics

### WebSocket
- `WS /ws/live` - Real-time updates (topic-based subscriptions)
- `GET /ws/stats` - WebSocket connection statistics

### Monitoring (Production)
- `GET /api/monitoring/health` - Health check (DB, cache, WebSocket)
- `GET /api/monitoring/metrics` - Prometheus metrics
- `GET /api/monitoring/stats` - Detailed stats (requires auth)
- `GET /api/monitoring/config` - Configuration (requires auth)

### Version
- `GET /version` - Git commit info, Python version

## 🤖 Management CLI

```powershell
# Database operations
python manage.py init-db              # Initialize database
python manage.py migrate              # Run migrations
python manage.py makemigrations "msg" # Create new migration

# User management
python manage.py create-user          # Interactive user creation
python manage.py seed-default-user    # Create demo user (test/test123)
python manage.py list-users           # List all users

# System operations
python manage.py show-config          # Display configuration
python manage.py check-health         # Run health check
```

See [MANAGEMENT.md](./MANAGEMENT.md) for full CLI documentation.

## 🔒 Security Features

**Implemented**:
- ✅ Rate limiting (10-60 req/min per endpoint)
- ✅ Security headers (CSP, HSTS, X-Frame-Options, etc.)
- ✅ Audit logging (all auth events, admin actions)
- ✅ JWT authentication with secure tokens
- ✅ CORS configuration
- ✅ Request logging with timing

See [SECURITY.md](./SECURITY.md) for security details.

## 📊 Monitoring

**Health Check**:
```bash
curl http://localhost:8000/api/monitoring/health
```

**Metrics** (Prometheus format):
```bash
curl http://localhost:8000/api/monitoring/metrics
```

**Stats** (requires auth):
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:8000/api/monitoring/stats
```

## 🚀 Deployment

See [DEPLOYMENT_CHECKLIST.md](../DEPLOYMENT_CHECKLIST.md) for complete deployment guide.

**Quick Deploy (Render)**:
1. Connect repo to Render
2. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
3. Add environment variables (DATABASE_URL, SECRET_KEY, etc.)
4. Deploy!

**First-Time Setup**:
```bash
# On production server
python manage.py init-db
python manage.py seed-default-user
python manage.py check-health
```

## 🧪 Testing

```powershell
# Run all tests
pytest

# With coverage
pytest --cov=app --cov-report=term-missing

# Specific test file
pytest tests/test_auth.py

# Validate production readiness
python validate.py
```

## ⚡ Performance

**Caching**:
- Redis (primary) with automatic fallback to in-memory
- 60-second TTL for odds data
- Cache stats available via monitoring endpoints

**Database**:
- PostgreSQL with connection pooling
- SQLite for local development
- Alembic migrations for schema management

**WebSocket**:
- Topic-based subscriptions
- Connection pooling
- Auto-reconnect in frontend
