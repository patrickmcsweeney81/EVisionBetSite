# BET EVision Platform - Deployment Guide

## Backend Deployment (Render.com)

### 1. Create New Web Service on Render

1. Go to https://render.com and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `patrickmcsweeney81/EVisionBetSite`

### 2. Configure Build Settings

**Basic Settings:**
- **Name**: `evisionbet-api` (or your choice)
- **Region**: Choose closest to your users
- **Branch**: `main`
- **Root Directory**: Leave blank
- **Runtime**: `Python 3`
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `cd backend-python && uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### 3. Environment Variables

Add these in Render dashboard under "Environment":

```
DATABASE_URL=sqlite:///./evisionbet.db
SECRET_KEY=<generate-random-32-char-hex-string>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ALLOWED_ORIGINS=http://localhost:3000,https://evisionbetsite.netlify.app,https://evisionbet.com,https://www.evisionbet.com
ODDS_API_KEY=<your-odds-api-key>
ODDS_API_BASE=https://api.the-odds-api.com/v4
EV_MIN_EDGE=0.03
BETFAIR_COMMISSION=0.06
REGIONS=au,us,eu
MARKETS=h2h,spreads,totals
SPORTS=upcoming
TELEGRAM_ENABLED=0
```

**Generate SECRET_KEY:**
```powershell
-join ((1..32 | ForEach-Object {'{0:X2}' -f (Get-Random -Maximum 256)}))
```

### 4. Deploy

1. Click "Create Web Service"
2. Render will automatically deploy from GitHub
3. Wait for deployment (usually 2-3 minutes)
4. Note your deployment URL: `https://evisionbet-api.onrender.com`

### 5. Verify Deployment

Test endpoints:
```bash
curl https://evisionbet-api.onrender.com/
curl https://evisionbet-api.onrender.com/health
curl https://evisionbet-api.onrender.com/api/odds/config
```

## Frontend Deployment (Netlify)

### 1. Update Production Config

Create/update `frontend/.env.production`:
```
REACT_APP_API_URL=https://evisionbet-api.onrender.com
```

### 2. Deploy to Netlify

Netlify will auto-deploy from GitHub when you push to `main` branch.

Or manually:
```bash
cd frontend
npm run build
netlify deploy --prod
```

### 3. Update CORS in Backend

Add your Netlify/custom domain to `ALLOWED_ORIGINS` in Render environment variables.

## Auto-Deployment

Both services are configured for auto-deployment:
- **Backend**: Render watches `main` branch
- **Frontend**: Netlify watches `main` branch

Push to GitHub `main` branch to trigger deployments.

## Database Notes

Currently using SQLite for simplicity. For production with multiple users, upgrade to PostgreSQL:

1. Create PostgreSQL database on Render
2. Update `DATABASE_URL` environment variable
3. Run Alembic migrations (when implemented)

## Monitoring

- **Backend logs**: Render dashboard → Logs tab
- **Frontend logs**: Netlify dashboard → Deploys → Deploy log
- **API health**: Check `/health` endpoint

## Troubleshooting

### Backend won't start
- Check Render logs for Python errors
- Verify all environment variables are set
- Check `requirements.txt` has all dependencies

### Frontend can't connect to backend
- Verify `REACT_APP_API_URL` in Netlify env vars
- Check CORS settings in backend
- Test backend URL directly

### API rate limits
- Monitor Odds API usage at `/api/odds/config`
- Implement caching if hitting limits
