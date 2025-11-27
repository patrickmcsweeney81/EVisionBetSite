# Render.com Deployment Guide - EVisionBet Backend

## 🎯 Overview
This guide walks through deploying the FastAPI backend to Render.com with PostgreSQL database.

---

## 📋 Pre-Deployment Checklist

✅ Backend code committed and pushed to main branch  
✅ `requirements.txt` includes all dependencies  
✅ `manage.py` CLI tool ready for DB operations  
✅ Local testing passed  

---

## 🔑 Step 1: Generate and Save SECRET_KEY

**Generated SECRET_KEY (Production):**
```
t2D44yuWwPNS-8ENTSYEJ3hesg8hsVpDYxhVKaU_OrWQtd-DqgNmGZjR-jx0hq8So
```

⚠️ **IMPORTANT:** Save this securely! You'll need it in Step 4.

To regenerate if needed:
```powershell
python -c "import secrets; print(secrets.token_urlsafe(48))"
```

---

## 🗄️ Step 2: Create PostgreSQL Database on Render

1. **Go to Render Dashboard:** https://dashboard.render.com/
2. **Click "New +" → "PostgreSQL"**
3. **Configure Database:**
   - **Name:** `evisionbet-db`
   - **Database:** `evisionbet`
   - **User:** `evisionbet_user` (auto-generated)
   - **Region:** `Oregon (US West)` (same as backend)
   - **Plan:** `Free` (or Starter $7/month for better performance)

4. **Create Database** → Wait for provisioning (~2 min)
5. **Copy Internal Database URL:**
   - Find "Internal Database URL" in the database info page
   - Format: `postgresql://user:password@hostname/database`
   - **Save this - you'll need it in Step 4**

Example:
```
postgresql://evisionbet_user:xxxxxxxxxxxxx@dpg-xxxxx-a.oregon-postgres.render.com/evisionbet
```

---

## 🚀 Step 3: Create Python Web Service on Render

1. **Click "New +" → "Web Service"**
2. **Connect Repository:**
   - Select your GitHub/GitLab repository
   - Repository: `EVisionBetSite`
   - Branch: `main`

3. **Configure Service:**
   - **Name:** `evisionbet-api`
   - **Region:** `Oregon (US West)`
   - **Branch:** `main`
   - **Runtime:** `Python 3`
   - **Build Command:**
     ```bash
     pip install -r backend-python/requirements.txt
     ```
   - **Start Command:**
     ```bash
     cd backend-python && gunicorn -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:$PORT --workers 2
     ```
   - **Plan:** `Free` (or Starter $7/month)

4. **Click "Create Web Service"** (don't deploy yet - we need to add env vars first)

---

## ⚙️ Step 4: Configure Environment Variables

In your new web service, go to **"Environment"** tab and add these variables:

### Core Configuration
| Key | Value |
|-----|-------|
| `DATABASE_URL` | `[Paste Internal Database URL from Step 2]` |
| `SECRET_KEY` | `t2D44yuWwPNS-8ENTSYEJ3hesg8hsVpDYxhVKaU_OrWQtd-DqgNmGZjR-jx0hq8So` |
| `ALGORITHM` | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | `30` |

### CORS Configuration
| Key | Value |
|-----|-------|
| `FRONTEND_URL` | `https://evisionbetsite.netlify.app` |
| `CORS_ORIGINS` | `https://evisionbetsite.netlify.app,https://evisionbet.com,https://www.evisionbet.com` |
| `ALLOWED_ORIGINS` | `https://evisionbetsite.netlify.app,https://evisionbet.com,https://www.evisionbet.com` |

### Odds API Configuration
| Key | Value |
|-----|-------|
| `ODDS_API_KEY` | `81d1ac74594d5d453e242c14ad479955` |
| `ODDS_API_BASE` | `https://api.the-odds-api.com/v4` |

### Bot Configuration
| Key | Value |
|-----|-------|
| `EV_MIN_EDGE` | `0.03` |
| `BETFAIR_COMMISSION` | `0.06` |
| `REGIONS` | `au,us,eu` |
| `MARKETS` | `h2h,spreads,totals` |
| `SPORTS` | `upcoming` |

### Optional (Disabled for now)
| Key | Value |
|-----|-------|
| `REDIS_URL` | `redis://localhost:6379` |
| `TELEGRAM_ENABLED` | `0` |

**After adding all variables, click "Save Changes"**

---

## 🔧 Step 5: Initialize Database via Render Shell

1. **Go to your web service** → **"Shell"** tab
2. **Click "Launch Shell"** (wait for it to connect)
3. **Run initialization commands:**

```bash
# Navigate to backend directory
cd backend-python

# Initialize database schema
python manage.py init-db

# Seed default admin user
python manage.py seed-default-user

# Verify health
python manage.py check-health
```

**Expected Output:**
```
✓ Database initialized successfully
✓ Default user created: admin / admin123
✓ Health check passed
```

---

## ✅ Step 6: Deploy and Verify

### 6.1 Trigger Deployment
- Render should auto-deploy after saving environment variables
- If not, click **"Manual Deploy"** → **"Deploy latest commit"**
- Wait for build to complete (~3-5 minutes)

### 6.2 Get Your Backend URL
Once deployed, you'll see:
```
Your service is live at https://evisionbet-api.onrender.com
```

### 6.3 Test Endpoints

**Health Check:**
```bash
curl https://evisionbet-api.onrender.com/api/monitoring/health
```
Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-27T...",
  "database": "connected",
  "version": "1.0.0"
}
```

**Metrics:**
```bash
curl https://evisionbet-api.onrender.com/metrics
```

**API Documentation:**
Open in browser:
```
https://evisionbet-api.onrender.com/docs
```

**Test Authentication:**
```bash
# Login
curl -X POST https://evisionbet-api.onrender.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Should return JWT token
```

---

## 🌐 Step 7: Update Frontend Configuration

### For Netlify:

1. **Go to Netlify Dashboard** → Your site → **"Site configuration"** → **"Environment variables"**

2. **Add/Update:**
   ```
   REACT_APP_API_URL=https://evisionbet-api.onrender.com
   ```
   or
   ```
   VITE_API_URL=https://evisionbet-api.onrender.com
   ```
   (depending on your build tool: Create React App vs Vite)

3. **Redeploy Frontend:**
   - Go to **"Deploys"** tab
   - Click **"Trigger deploy"** → **"Deploy site"**

4. **Verify Frontend Connects:**
   - Open https://evisionbetsite.netlify.app
   - Check browser console (F12) for API requests
   - Try logging in with `admin / admin123`

---

## 🔍 Step 8: Monitor and Troubleshoot

### View Logs
- **Render Dashboard** → Your service → **"Logs"** tab
- Real-time streaming logs
- Look for startup messages and errors

### Common Issues

**Issue:** `ModuleNotFoundError`
- **Fix:** Ensure `requirements.txt` path is correct in build command
- Build command should be: `pip install -r backend-python/requirements.txt`

**Issue:** `Connection refused` to database
- **Fix:** Verify `DATABASE_URL` is the **Internal Database URL** from Render PostgreSQL
- Check database is running (green status in dashboard)

**Issue:** CORS errors in frontend
- **Fix:** Verify `CORS_ORIGINS` includes your Netlify URL
- Check frontend is using HTTPS (not HTTP)

**Issue:** 503 Service Unavailable
- **Fix:** Render free tier spins down after inactivity
- First request after idle takes ~30 seconds to wake up
- Consider upgrading to Starter plan for always-on

### Health Monitoring

Set up health checks in Render:
1. **Service Settings** → **"Health & Alerts"**
2. **Health Check Path:** `/api/monitoring/health`
3. **Enable email alerts** for downtime

---

## 🎉 Deployment Complete!

Your backend is now live at:
```
https://evisionbet-api.onrender.com
```

### Next Steps:
- [ ] Test all API endpoints via `/docs`
- [ ] Verify frontend authentication flow
- [ ] Test EV bot functionality
- [ ] Set up monitoring alerts
- [ ] Consider upgrading to paid plan for production
- [ ] Plan retirement of old Node.js backend (if applicable)

---

## 📝 Default Credentials

**Admin User:**
- Username: `admin`
- Password: `admin123`

⚠️ **Change password immediately after first login!**

---

## 🔒 Security Checklist

- [x] SECRET_KEY is unique and secure (64+ characters)
- [x] Database password is auto-generated and secure
- [x] CORS origins are whitelisted (no wildcards)
- [x] Rate limiting enabled (via FastAPI middleware)
- [x] Security headers configured
- [ ] Change default admin password
- [ ] Set up Render IP allowlist (optional)
- [ ] Enable 2FA on Render account
- [ ] Set up backup strategy for PostgreSQL

---

## 📚 Useful Commands

### Local Development
```powershell
# Activate virtual environment
& C:\Users\patri\.virtualenvs\.venv\Scripts\Activate.ps1

# Run locally
cd C:\EVisionBetSite\backend-python
python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

### Render Shell Commands
```bash
# Check database connection
python manage.py check-health

# Run migrations (if you add new ones)
alembic upgrade head

# View logs
tail -f /var/log/render.log
```

### Git Workflow
```powershell
# Deploy new changes
git add .
git commit -m "feat: your changes"
git push origin main
# Render auto-deploys from main branch
```

---

## 🆘 Support

**Render Documentation:** https://render.com/docs  
**FastAPI Documentation:** https://fastapi.tiangolo.com  
**Project Issues:** Check logs in Render Dashboard → Logs tab

---

**Generated:** November 27, 2025  
**Backend Version:** FastAPI 1.0.0  
**Database:** PostgreSQL (Render)  
**Deployment Platform:** Render.com
