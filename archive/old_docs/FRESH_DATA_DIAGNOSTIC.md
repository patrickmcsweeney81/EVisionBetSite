# Fresh Data Not Showing – Diagnostic & Fix Guide

**Date:** December 13, 2025  
**Issue:** Frontend not displaying fresh EV opportunities data

---

## 🔍 Diagnostic Checklist

Check these in order to identify the problem:

### 1. Backend Data Exists ✅
```bash
cd C:\EVisionBetCode

# Check data was extracted
ls data/raw_odds_pure.csv

# Check calculated opportunities exist
ls data/ev_opportunities.csv

# Recent file timestamps?
ls -la data/ev_opportunities.csv
```

**Expected:** File modified today/recently

**If missing:** Run extraction & calculation:
```bash
python src/pipeline_v2/extract_odds.py
python src/pipeline_v2/calculate_opportunities.py
```

---

### 2. Backend API Running ✅
```bash
# In terminal 1
cd C:\EVisionBetCode
uvicorn backend_api:app --reload

# Expected:
# INFO:     Uvicorn running on http://127.0.0.1:8000
```

**Keep this terminal open!**

---

### 3. Backend API Responds ✅
```bash
# In terminal 2
curl http://localhost:8000/health

# Expected response:
# {"status":"ok","timestamp":"2025-12-13T...","database":"connected"}
```

**If fails:** Backend not running (see Step 2)

---

### 4. Backend Returns EV Data ✅
```bash
# In terminal 2
curl http://localhost:8000/api/ev/hits?limit=3

# Expected response:
# [
#   {
#     "sport": "basketball_nba",
#     "event_id": "...",
#     "market": "h2h",
#     "selection": "Home",
#     "best_book": "DraftKings",
#     "odds_decimal": 2.15,
#     "fair_odds": 1.95,
#     "ev_percent": 10.3,
#     ...
#   },
#   ...
# ]
```

**If empty array `[]`:** No data calculated yet (run pipeline)  
**If error:** Check backend logs for database issues

---

### 5. Frontend .env.local Set Up ✅
```bash
# In C:\EVisionBetSite\frontend\.env.local
cat .env.local
```

**Should contain:**
```
REACT_APP_API_URL=http://localhost:8000
```

**If missing or wrong:**
```bash
# Create/fix .env.local
echo "REACT_APP_API_URL=http://localhost:8000" > .env.local
```

---

### 6. Frontend Running ✅
```bash
# In terminal 3
cd C:\EVisionBetSite\frontend
npm start

# Expected:
# Compiled successfully!
# You can now view the app in the browser at:
#   http://localhost:3000
```

**Keep this terminal open!**

---

### 7. Frontend Loads ✅
- Open **http://localhost:3000** in browser
- You should see the EVisionBet interface
- Should NOT show "Loading..." forever

**If blank or error:** Check browser console (`F12` → **Console**)

---

### 8. Frontend Console Logs ✅
1. Open **http://localhost:3000**
2. Press `F12` (Developer Tools)
3. Click **Console** tab
4. Look for:
   - ✅ No red errors
   - ✅ Network requests to `/api/ev/hits`
   - ❌ "CORS error" (backend CORS misconfigured)
   - ❌ "Cannot read property..." (data format mismatch)

---

### 9. Network Tab ✅
1. Press `F12` (Developer Tools)
2. Click **Network** tab
3. Look for request to `/api/ev/hits`
4. Click on it and check:
   - **Status:** 200 (success)
   - **Response:** Should show JSON array with data
   - **Headers:** Look for `Content-Type: application/json`

**If 404 or 500:**
- 404: API endpoint not found (check backend_api.py)
- 500: Backend error (check backend terminal for exception)

---

## 🛠️ Common Issues & Fixes

### Issue 1: "No data available" or blank table

**Diagnose:**
```bash
# Step 1: Is backend running?
curl http://localhost:8000/health
# If fails: Start backend (Step 2 above)

# Step 2: Does backend have data?
curl http://localhost:8000/api/ev/hits?limit=1
# If empty: Run extraction/calculation

# Step 3: Can frontend reach backend?
# Open http://localhost:3000 → Press F12 → Network → look for /api/ev/hits
```

**Fix:**
- Ensure `REACT_APP_API_URL=http://localhost:8000` in `.env.local`
- Restart frontend: `npm start`
- Wait 2 min for auto-refresh
- Manually reload: `F5` in browser

---

### Issue 2: "CORS error" in console

**Error looks like:**
```
Access to XMLHttpRequest at 'http://localhost:8000/api/ev/hits' 
from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Fix:**
Check [backend_api.py](../../EVisionBetCode/backend_api.py) CORS config:

```python
# Should have:
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:8000", "https://evisionbet.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

If missing, restart backend after adding.

---

### Issue 3: "Cannot connect to database" in backend

**Backend error:**
```
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) 
could not translate host name "localhost" to address
```

**Fix - Option A (Skip Database, Use CSV):**
```bash
# Stop backend
# Edit backend_api.py, comment out database code
# Use CSV files from data/ folder
# Restart backend
```

**Fix - Option B (Set Up PostgreSQL Local):**
```bash
# Install PostgreSQL (see PostgreSQL docs)
# Create database & user
# Set DATABASE_URL in .env
# Restart backend
```

**For Now (Quick):** Use CSV fallback (Option A)

---

### Issue 4: Frontend stuck on "Loading..."

**Console shows:** No errors, but data doesn't load

**Diagnose:**
```bash
# Is API actually responding?
curl http://localhost:8000/api/ev/hits?limit=1
# Should return data, not hang

# If hangs: API might be stuck or crashed
# Check backend terminal for errors
```

**Fix:**
```bash
# Stop backend (Ctrl+C)
# Restart: uvicorn backend_api:app --reload
# Reload frontend: F5 in browser
```

---

### Issue 5: "TypeError: Cannot read property 'map'" or similar

**Console shows:** Data not in expected format

**Diagnose:**
```bash
# Check API response format
curl http://localhost:8000/api/ev/hits?limit=1 | python -m json.tool
# Should be: {"hits": [...], "last_updated": "..."}
```

**Fix:** Check [EVHits.js](../src/components/EVHits.js) expects correct format:

```javascript
// Line ~78:
const data = await response.json();
setHits(data.hits || []);  // Expects data.hits array
```

If API returns different format, update this line or fix API response.

---

## ✅ Complete End-to-End Test

**Terminal 1: Start Backend**
```bash
cd C:\EVisionBetCode
python src/pipeline_v2/extract_odds.py
python src/pipeline_v2/calculate_opportunities.py
uvicorn backend_api:app --reload
# Wait for: INFO:     Uvicorn running on http://127.0.0.1:8000
```

**Terminal 2: Start Frontend**
```bash
cd C:\EVisionBetSite\frontend
npm start
# Wait for: Compiled successfully! View at http://localhost:3000
```

**Browser: Test Frontend**
1. Go to http://localhost:3000
2. Verify data loads in table
3. Wait 2+ seconds for API call
4. Should show NBA/NFL EV opportunities
5. Open `F12` → **Network** tab
6. Click `/api/ev/hits` request
7. **Response** tab should show JSON array

**If all working:** 🎉 Fresh data is flowing!

---

## 🚀 Quick Command Summary

```bash
# Terminal 1: Backend
cd C:\EVisionBetCode
python src/pipeline_v2/extract_odds.py
python src/pipeline_v2/calculate_opportunities.py
uvicorn backend_api:app --reload

# Terminal 2: Frontend
cd C:\EVisionBetSite\frontend
npm install              # (first time only)
npm start

# Terminal 3: Test commands
curl http://localhost:8000/health
curl http://localhost:8000/api/ev/hits?limit=3
```

---

## 🔧 Advanced: Enable Debug Mode

Add `?debug=1` to frontend URL:

```
http://localhost:3000?debug=1
```

This shows:
- API URL being used
- Last update timestamp
- Response status & timing
- Hits count
- Summary stats

---

## 📚 Key Files

| File | Purpose |
|------|---------|
| [backend_api.py](../../EVisionBetCode/backend_api.py) | Backend API (starts with uvicorn) |
| [EVHits.js](../src/components/EVHits.js) | Frontend component (fetches & displays data) |
| [config.js](../src/config.js) | API URL config (auto-detects localhost vs prod) |
| [client.js](../src/api/client.js) | API request wrapper |
| [.env.local](../frontend/.env.local) | Frontend env (set REACT_APP_API_URL) |

---

## 💡 Next Steps

1. ✅ Follow diagnostic checklist (Sections 1-9)
2. ✅ Identify which step fails
3. ✅ Apply fix for that issue
4. ✅ Verify fresh data shows

**Once working:** Move to Netlify deployment & frontend customization

---

**Question?** Check which diagnostic step fails, then apply corresponding fix above.
