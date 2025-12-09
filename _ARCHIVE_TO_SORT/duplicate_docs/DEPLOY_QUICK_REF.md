# 🚀 Quick Deploy Reference

## Production SECRET_KEY
```
t2D44yuWwPNS-8ENTSYEJ3hesg8hsVpDYxhVKaU_OrWQtd-DqgNmGZjR-jx0hq8So
```

## Essential Environment Variables (Copy to Render)

```bash
# Core
SECRET_KEY=t2D44yuWwPNS-8ENTSYEJ3hesg8hsVpDYxhVKaU_OrWQtd-DqgNmGZjR-jx0hq8So
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
FRONTEND_URL=https://evisionbetsite.netlify.app
CORS_ORIGINS=https://evisionbetsite.netlify.app,https://evisionbet.com,https://www.evisionbet.com
ALLOWED_ORIGINS=https://evisionbetsite.netlify.app,https://evisionbet.com,https://www.evisionbet.com

# Odds API
ODDS_API_KEY=81d1ac74594d5d453e242c14ad479955
ODDS_API_BASE=https://api.the-odds-api.com/v4

# Bot Config
EV_MIN_EDGE=0.03
BETFAIR_COMMISSION=0.06
REGIONS=au,us,eu
MARKETS=h2h,spreads,totals
SPORTS=upcoming
TELEGRAM_ENABLED=0
```

## Render Build/Start Commands

**Build Command:**
```bash
pip install -r backend-python/requirements.txt
```

**Start Command:**
```bash
cd backend-python && gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:$PORT --workers 2
```

**Health Check Path:**
```
/api/monitoring/health
```

## Post-Deploy Shell Commands

```bash
cd backend-python
python manage.py init-db
python manage.py seed-default-user
python manage.py check-health
```

## Test URLs (after deploy)

Replace `YOUR_SERVICE_URL` with your actual Render URL:

- Health: `https://YOUR_SERVICE_URL/api/monitoring/health`
- Docs: `https://YOUR_SERVICE_URL/docs`
- Metrics: `https://YOUR_SERVICE_URL/metrics`
- Stats: `https://YOUR_SERVICE_URL/stats`

## Default Login

- Username: `admin`
- Password: `admin123`

⚠️ **Change immediately after first login!**

---

📖 Full guide: See [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)
