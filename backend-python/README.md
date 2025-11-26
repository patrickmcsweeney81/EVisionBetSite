# BET EVision Platform - FastAPI Backend

Python FastAPI backend for the BET EVision sports betting analytics platform.

## Architecture

```
backend-python/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI application entry point
│   ├── config.py            # Application settings
│   ├── database.py          # Database connection
│   ├── api/                 # API route handlers
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── odds.py          # Odds comparison endpoints (TODO)
│   │   └── bets.py          # Bet tracking endpoints (TODO)
│   ├── models/              # SQLAlchemy database models
│   │   └── user.py          # User model
│   ├── schemas/             # Pydantic schemas
│   │   └── user.py          # User validation schemas
│   └── services/            # Business logic
│       └── bot_service.py   # Integration with ../bot (TODO)
├── requirements.txt         # Python dependencies
└── .env                     # Environment variables (create from .env.example)
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
# Install PostgreSQL if not already installed
# Create database
createdb evisionbet

# Run migrations (TODO: set up Alembic)
# alembic upgrade head
```

### 5. Run Development Server

```powershell
uvicorn app.main:app --reload --port 8000
```

The API will be available at: `http://localhost:8000`

API documentation (Swagger): `http://localhost:8000/docs`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (returns JWT token)
- `GET /api/auth/me` - Get current user info

### Health
- `GET /` - Basic health check
- `GET /health` - Detailed health check

### TODO: Odds & Betting
- `GET /api/odds/sports` - List available sports
- `GET /api/odds/compare` - Compare odds across bookmakers
- `GET /api/odds/ev` - Get EV opportunities
- `POST /api/bets/track` - Track a bet
- `GET /api/bets/history` - Get bet history

## Integration with Bot

The bot code in `../bot/` will be integrated as a service:

```python
from ..bot.ev_arb_bot import scan_odds
from ..bot.core.config import load_env

# Call bot functions from API endpoints
results = scan_odds()
```

## Deployment

### Render.com

1. Create new Web Service
2. Connect GitHub repository
3. Set build command: `pip install -r backend-python/requirements.txt`
4. Set start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. Add environment variables from `.env.example`
6. Deploy!

## Development

### Adding New Endpoints

1. Create route handler in `app/api/`
2. Define Pydantic schemas in `app/schemas/`
3. Add database models in `app/models/` if needed
4. Import router in `app/main.py`

### Database Migrations

```powershell
# Create migration
alembic revision --autogenerate -m "Description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

## Testing

```powershell
pytest
```
