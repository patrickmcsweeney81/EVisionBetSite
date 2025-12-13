# 📋 NEXT STEPS – Frontend Setup Complete

**Date:** December 13, 2025  
**Status:** Documentation ready, ready to diagnose fresh data issue

---

## ✅ What's Been Created For You

### 3 New Documentation Files

1. **[FRONTEND_VSCODE_SETUP.md](FRONTEND_VSCODE_SETUP.md)** (350 lines)
   - Install 5 extensions (React snippets, Prettier, ESLint, REST Client, Thunder Client)
   - Node.js & npm verification
   - `npm install` & dependencies
   - `.env.local` configuration
   - Test commands
   - Debugging setup
   - Troubleshooting table

2. **[FRESH_DATA_DIAGNOSTIC.md](FRESH_DATA_DIAGNOSTIC.md)** (300 lines)
   - 9-step diagnostic checklist
   - Common issues & fixes
   - End-to-end test procedure
   - Debug mode instructions
   - Network tab analysis

3. **[FRONTEND_SETUP_ACTION_PLAN.md](FRONTEND_SETUP_ACTION_PLAN.md)** (200 lines)
   - Quick reference guide
   - Backend quick start
   - Frontend setup steps
   - Common quick fixes
   - 3-terminal setup diagram

### Updated Main Documentation

4. **[README.md](README.md)** (Updated)
   - Modern description of frontend
   - Quick start (10 min)
   - Backend setup prerequisite
   - File structure
   - Troubleshooting links
   - Development workflow

---

## 🎯 Immediate Action Items (Do These Now)

### Step 1: Read Documentation (5 min)
- [ ] Read [FRONTEND_VSCODE_SETUP.md](FRONTEND_VSCODE_SETUP.md) Steps 1-7
- [ ] Skim [FRESH_DATA_DIAGNOSTIC.md](FRESH_DATA_DIAGNOSTIC.md) Diagnostic Checklist

### Step 2: Install VS Code Extensions (3 min)
- [ ] Open VS Code
- [ ] Press `Ctrl+Shift+X`
- [ ] Install:
  - [ ] ES7+ React/Redux/React-Native snippets (dsznajder)
  - [ ] Prettier - Code formatter (esbenp)
  - [ ] ESLint (dbaeumer)
  - [ ] REST Client (humao) - optional but helpful
  - [ ] Thunder Client (rangav) - optional, better than Postman

### Step 3: Check Node.js & npm (1 min)
```powershell
node --version    # Should be 14+
npm --version     # Should be 6+
```

### Step 4: Install Frontend Dependencies (3 min)
```powershell
cd C:\EVisionBetSite\frontend
npm install
# Takes 2-3 minutes
```

### Step 5: Create Configuration (1 min)
```powershell
# In C:\EVisionBetSite\frontend\
echo "REACT_APP_API_URL=http://localhost:8000" > .env.local
```

### Step 6: Prepare Backend (5 min)
```powershell
# Terminal 1: Extract & calculate fresh data
cd C:\EVisionBetCode
python src/pipeline_v2/extract_odds.py
python src/pipeline_v2/calculate_opportunities.py

# Terminal 2: Start backend
uvicorn backend_api:app --reload
# Keep this running!
```

### Step 7: Start Frontend (2 min)
```powershell
# Terminal 3: Start frontend
cd C:\EVisionBetSite\frontend
npm start
# Opens http://localhost:3000 automatically
```

### Step 8: Verify Fresh Data (3 min)
```powershell
# Terminal 4: Test API
curl http://localhost:8000/api/ev/hits?limit=2
# Should return JSON array with EV data

# In browser:
# - Go to http://localhost:3000
# - F12 → Network tab
# - Look for /api/ev/hits request
# - Click it → Response tab should show data
```

---

## ⏱️ Total Time Estimate

| Step | Time | Task |
|------|------|------|
| 1 | 5 min | Read documentation |
| 2 | 3 min | Install VS Code extensions |
| 3 | 1 min | Check Node.js & npm |
| 4 | 3 min | `npm install` |
| 5 | 1 min | Create `.env.local` |
| 6 | 5 min | Backend (extract, calculate, start) |
| 7 | 2 min | `npm start` |
| 8 | 3 min | Verify fresh data |
| **TOTAL** | **23 min** | **Complete setup** |

---

## 🚨 If Fresh Data Doesn't Show

**Refer to:** [FRESH_DATA_DIAGNOSTIC.md](FRESH_DATA_DIAGNOSTIC.md)

**Quick diagnosis (5 min):**

```powershell
# 1. Does backend have data?
ls C:\EVisionBetCode\data\ev_opportunities.csv
# File should exist

# 2. Is backend API responding?
curl http://localhost:8000/api/ev/hits?limit=1
# Should return JSON, not error

# 3. Is frontend configured correctly?
cat C:\EVisionBetSite\frontend\.env.local
# Should show: REACT_APP_API_URL=http://localhost:8000

# 4. Check frontend console
# F12 → Console tab → look for error messages
```

**Most common fixes:**
1. Backend not running → Start: `uvicorn backend_api:app --reload`
2. No data → Run: `python src/pipeline_v2/extract_odds.py`
3. Wrong API URL → Create/fix `.env.local`
4. Stale cache → Press `Ctrl+Shift+Delete` in browser

---

## 📖 Documentation Map

```
📄 README.md (main guide)
├── 🔧 FRONTEND_VSCODE_SETUP.md (extensions, setup, debugging)
├── 🔍 FRESH_DATA_DIAGNOSTIC.md (troubleshooting, 9-step checklist)
├── 📋 FRONTEND_SETUP_ACTION_PLAN.md (quick checklist)
└── ← You are here

Backend Docs (separate folder):
└── C:\EVisionBetCode\
    ├── README.md
    ├── VSCODE_SETUP.md
    └── RENDER_DEPLOYMENT.md
```

---

## ✨ Key Points to Remember

- **API auto-detects:** `config.js` automatically uses `http://localhost:8000` when running locally
- **Hot reload:** Save file → browser auto-updates (no restart needed)
- **2-minute refresh:** Frontend polls backend every 2 minutes for fresh data
- **Keep terminals open:** You need 3 terminals running (extract/calc, backend, frontend)
- **Check console:** Always check browser console (`F12`) for errors
- **Network tab:** Use Network tab (F12) to verify API calls and responses

---

## 🎯 Success Checklist

When everything is working, you should see:

- ✅ `npm start` shows "Compiled successfully!"
- ✅ Browser opens to http://localhost:3000
- ✅ Page shows "EVisionBet" title
- ✅ Table displays EV opportunities with data
- ✅ No red errors in browser console (`F12`)
- ✅ Network tab shows `/api/ev/hits` with status 200
- ✅ Response tab shows JSON array with betting data

---

## 🚀 Next Phase (After Setup Works)

1. **Verify daily updates** – Monitor that new data arrives every 30 min
2. **Deploy to Netlify** – Push frontend to production
3. **Custom features** – Add filters, sorting, user preferences
4. **Admin panel** – Database management tools
5. **Monitoring** – Set up alerts for new EV opportunities

---

## 📞 Quick Commands

```bash
# Navigate to folders
cd C:\EVisionBetCode        # Backend
cd C:\EVisionBetSite        # Frontend root
cd C:\EVisionBetSite\frontend  # Frontend app

# Backend commands
python src/pipeline_v2/extract_odds.py
python src/pipeline_v2/calculate_opportunities.py
uvicorn backend_api:app --reload

# Frontend commands
npm install
npm start
npm run build
npm run lint

# Test commands
curl http://localhost:8000/health
curl http://localhost:8000/api/ev/hits?limit=3
```

---

## 🎓 Architecture Reminder

```
┌─────────────┐
│   Browser   │
│ localhost   │
└──────┬──────┘
       │ http://localhost:3000
       ▼
┌──────────────────┐
│  Frontend React  │
│  (npm start)     │
└──────┬───────────┘
       │ fetch /api/ev/hits
       ▼
┌──────────────────┐
│  Backend FastAPI │
│  (uvicorn)       │
└──────┬───────────┘
       │ SELECT FROM ev_opportunities
       ▼
┌──────────────────┐
│    Database      │
│ (PostgreSQL/CSV) │
└──────────────────┘
```

---

**You now have everything you need!** Follow the 8 steps above in order, then verify fresh data displays. 

**Questions?** Check [FRESH_DATA_DIAGNOSTIC.md](FRESH_DATA_DIAGNOSTIC.md) for detailed troubleshooting.

🚀 **Let's get this running!**

