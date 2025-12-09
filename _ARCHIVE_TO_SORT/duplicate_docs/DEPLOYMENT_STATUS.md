# 🚀 EVisionBet Render Deployment Progress

**Status:** Ready to Deploy ✅  
**Date:** November 27, 2025  
**Backend:** FastAPI Python  
**Database:** PostgreSQL (Render)

---

## ✅ Phase 1: Pre-Deployment (COMPLETE)

- [x] FastAPI backend implementation
- [x] Monitoring endpoints (/health, /metrics, /stats, /config)
- [x] Security middleware (rate limiting, headers, logging)
- [x] Database engine fix (SQLite vs Postgres pooling)
- [x] Management CLI (manage.py)
- [x] Local validation passed
- [x] Production SECRET_KEY generated
- [x] Deployment guides created
- [x] render.yaml configured
- [x] gunicorn added to requirements.txt
- [x] All changes committed and pushed to main

---

## 🎯 Phase 2: Render Setup (IN PROGRESS)

### Step 1: Create PostgreSQL Database
**Status:** ⏳ Pending  
**Action:** Go to https://dashboard.render.com/

- [ ] Click "New +" → "PostgreSQL"
- [ ] Name: `evisionbet-db`
- [ ] Database: `evisionbet`
- [ ] Region: `Oregon (US West)`
- [ ] Plan: `Free`
- [ ] Wait for provisioning (~2 minutes)
- [ ] **Copy Internal Database URL** → Save to clipboard

**Expected URL Format:**
```
postgresql://evisionbet_user:xxxxx@dpg-xxxxx-a.oregon-postgres.render.com/evisionbet
```

---

### Step 2: Create Web Service
**Status:** ⏳ Pending  
**Depends On:** Step 1 complete

- [ ] Click "New +" → "Web Service"
- [ ] Connect repository: `EVisionBetSite`
- [ ] Branch: `main`
- [ ] Name: `evisionbet-api`
- [ ] Region: `Oregon (US West)`
- [ ] Runtime: `Python 3`

**Build Command:**
```bash
pip install -r backend-python/requirements.txt
```

**Start Command:**
```bash
cd backend-python && gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:$PORT --workers 2
```

- [ ] Plan: `Free`
- [ ] **DO NOT DEPLOY YET** - Add env vars first

---

### Step 3: Configure Environment Variables
**Status:** ⏳ Pending  
**Depends On:** Step 2 complete  
**Reference:** See `DEPLOY_QUICK_REF.md`

Go to your service → "Environment" tab → Add these variables:

#### Core (Required)
- [ ] `DATABASE_URL` = [Paste from Step 1]
- [ ] `SECRET_KEY` = `t2D44yuWwPNS-8ENTSYEJ3hesg8hsVpDYxhVKaU_OrWQtd-DqgNmGZjR-jx0hq8So`
- [ ] `ALGORITHM` = `HS256`
- [ ] `ACCESS_TOKEN_EXPIRE_MINUTES` = `30`

#### CORS (Required)
- [ ] `FRONTEND_URL` = `https://evisionbetsite.netlify.app`
- [ ] `CORS_ORIGINS` = `https://evisionbetsite.netlify.app,https://evisionbet.com,https://www.evisionbet.com`
- [ ] `ALLOWED_ORIGINS` = `https://evisionbetsite.netlify.app,https://evisionbet.com,https://www.evisionbet.com`

#### Odds API (Required)
- [ ] `ODDS_API_KEY` = `81d1ac74594d5d453e242c14ad479955`
- [ ] `ODDS_API_BASE` = `https://api.the-odds-api.com/v4`

#### Bot Configuration (Required)
- [ ] `EV_MIN_EDGE` = `0.03`
- [ ] `BETFAIR_COMMISSION` = `0.06`
- [ ] `REGIONS` = `au,us,eu`
- [ ] `MARKETS` = `h2h,spreads,totals`
- [ ] `SPORTS` = `upcoming`
- [ ] `TELEGRAM_ENABLED` = `0`

- [ ] **Click "Save Changes"** → This will trigger deployment

---

### Step 4: Monitor Deployment
**Status:** ⏳ Pending  
**Depends On:** Step 3 complete

- [ ] Go to "Logs" tab
- [ ] Watch for successful startup messages
- [ ] Wait for "Deploy live" status (~3-5 minutes)
- [ ] Copy your service URL (e.g., `https://evisionbet-api.onrender.com`)

**Expected Log Output:**
```
Installing dependencies...
Starting gunicorn...
Uvicorn running on http://0.0.0.0:10000
Application startup complete
```

---

### Step 5: Initialize Database
**Status:** ⏳ Pending  
**Depends On:** Step 4 complete

- [ ] Go to "Shell" tab in your web service
- [ ] Click "Launch Shell"
- [ ] Wait for connection

**Run these commands:**
```bash
cd backend-python
python manage.py init-db
python manage.py seed-default-user
python manage.py check-health
```

**Expected Output:**
```
✓ Database schema created
✓ Default user: admin / admin123
✓ Health: All systems operational
```

---

## ✅ Phase 3: Verification

### Backend Health Checks
**Replace** `YOUR_URL` **with your actual Render URL**

- [ ] Health Check
  ```bash
  curl https://YOUR_URL/api/monitoring/health
  ```
  Expected: `{"status":"healthy",...}`

- [ ] Metrics
  ```bash
  curl https://YOUR_URL/metrics
  ```
  Expected: JSON with CPU, memory, database stats

- [ ] API Docs
  Open in browser: `https://YOUR_URL/docs`
  Expected: Interactive Swagger UI

- [ ] Authentication Test
  ```bash
  curl -X POST https://YOUR_URL/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin123"}'
  ```
  Expected: JWT token in response

---

## 🌐 Phase 4: Frontend Connection

### Update Netlify Environment Variables

- [ ] Go to Netlify Dashboard
- [ ] Your site → "Site configuration" → "Environment variables"
- [ ] Add or update:
  ```
  REACT_APP_API_URL=https://YOUR_RENDER_URL
  ```
  Or if using Vite:
  ```
  VITE_API_URL=https://YOUR_RENDER_URL
  ```

- [ ] Go to "Deploys" tab
- [ ] Click "Trigger deploy" → "Deploy site"
- [ ] Wait for build (~2 minutes)

### Test Frontend Integration

- [ ] Open `https://evisionbetsite.netlify.app`
- [ ] Open browser console (F12)
- [ ] Check for API requests to Render URL
- [ ] Test login with `admin` / `admin123`
- [ ] Verify dashboard loads
- [ ] Check odds data appears

---

## 🔒 Phase 5: Security & Cleanup

- [ ] Change admin password (login → profile → change password)
- [ ] Set up health check alerts in Render
- [ ] Enable error notifications
- [ ] Test all main features:
  - [ ] EV calculations
  - [ ] Odds display
  - [ ] User authentication
  - [ ] Data refresh
- [ ] Plan retirement of old Node.js backend (if applicable)
- [ ] Update documentation with production URLs

---

## 📊 Deployment Summary

| Component | Platform | Status | URL |
|-----------|----------|--------|-----|
| Backend | Render | ⏳ Pending | `https://evisionbet-api.onrender.com` |
| Database | Render PostgreSQL | ⏳ Pending | Internal connection |
| Frontend | Netlify | ✅ Live | `https://evisionbetsite.netlify.app` |

---

## 🆘 Troubleshooting

**Build fails?**
- Check logs for missing dependencies
- Verify `requirements.txt` path in build command

**Database connection fails?**
- Ensure using **Internal Database URL** (not external)
- Check database status is "Available"

**CORS errors?**
- Verify `CORS_ORIGINS` includes your Netlify URL
- Use HTTPS (not HTTP)

**503 Service Unavailable?**
- Render free tier spins down after 15 min idle
- First request takes ~30 seconds to wake up
- Consider paid plan for production

---

## 📚 Resources

- **Full Guide:** [RENDER_DEPLOYMENT_GUIDE.md](./RENDER_DEPLOYMENT_GUIDE.md)
- **Quick Reference:** [DEPLOY_QUICK_REF.md](./DEPLOY_QUICK_REF.md)
- **Render Docs:** https://render.com/docs
- **FastAPI Docs:** https://fastapi.tiangolo.com

---

**Last Updated:** November 27, 2025  
**Next Step:** Create PostgreSQL database on Render  
**Current Phase:** 2 of 5
