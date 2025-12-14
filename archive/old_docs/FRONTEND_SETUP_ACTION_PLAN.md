# Frontend Setup & Fresh Data Fix – Action Plan

**Status:** Ready to diagnose and fix fresh data issue

---

## 📋 What Just Happened

You asked: *"How should I setup VS Code before we start?"*

I created two guides:

1. **[FRONTEND_VSCODE_SETUP.md](FRONTEND_VSCODE_SETUP.md)** ← Start here!
   - Install 5 frontend extensions
   - Node.js & npm setup
   - Frontend dependencies (`npm install`)
   - `.env.local` configuration
   - Test frontend server
   - Debugging tips

2. **[FRESH_DATA_DIAGNOSTIC.md](FRESH_DATA_DIAGNOSTIC.md)** ← For troubleshooting
   - 9-step diagnostic checklist
   - Common issues & fixes
   - End-to-end test procedure
   - Debug mode instructions

---

## 🚀 Quick Start (Next 15 Minutes)

### Step 1: Open Frontend in VS Code

```powershell
cd C:\EVisionBetSite\frontend
code .
```

### Step 2: Install Extensions

Press `Ctrl+Shift+X` and install:
1. **ES7+ React/Redux/React-Native snippets** (dsznajder)
2. **Prettier - Code formatter** (esbenp)
3. **ESLint** (dbaeumer)
4. **REST Client** (humao) - for testing API
5. **Thunder Client** (rangav) - optional, better API testing

### Step 3: Check Node.js & npm

```powershell
node --version    # Should be 14+
npm --version     # Should be 6+
```

### Step 4: Install Dependencies

```powershell
npm install
# This creates node_modules/ with 1000+ packages (takes 2-3 min)
```

### Step 5: Create .env.local

In `C:\EVisionBetSite\frontend\` create file `.env.local`:

```
REACT_APP_API_URL=http://localhost:8000
```

### Step 6: Start Frontend

In terminal:

```powershell
npm start
# Opens browser to http://localhost:3000 automatically
```

**Expected:** Homepage loads, shows "No data" or loading spinner

---

## 🔍 Why No Fresh Data? (5-Minute Diagnosis)

Open 3 terminals side-by-side:

### Terminal 1: Ensure Backend Has Data

```powershell
cd C:\EVisionBetCode
python src/pipeline_v2/extract_odds.py
python src/pipeline_v2/calculate_opportunities.py

# Check output: should say "X rows written"
```

### Terminal 2: Start Backend API

```powershell
cd C:\EVisionBetCode
uvicorn backend_api:app --reload

# Expected: INFO:     Uvicorn running on http://127.0.0.1:8000
```

### Terminal 3: Test Backend Returns Data

```powershell
curl http://localhost:8000/api/ev/hits?limit=3

# Should return JSON array with EV opportunities
# If empty: data wasn't calculated (check Terminal 1)
# If error: backend issue (check Terminal 2 logs)
```

### Browser: Check Frontend Sees Data

1. Go to http://localhost:3000
2. Open Developer Tools: `F12`
3. Go to **Network** tab
4. Look for request to `/api/ev/hits`
5. Click it → **Response** tab should show JSON data

**If data shows:** ✅ Fresh data is flowing!  
**If error:** Check [FRESH_DATA_DIAGNOSTIC.md](FRESH_DATA_DIAGNOSTIC.md)

---

## 🔧 Common Quick Fixes

### Fix 1: Stale Frontend Cache
```powershell
# Browser: Press Ctrl+Shift+Delete
# Clear browsing data → Cache → Delete

# Or:
# F12 → Network tab → Disable cache (checkbox)
# Then reload page
```

### Fix 2: Frontend Not Using Correct API URL
```powershell
# In terminal 3 (frontend folder):
npm start

# Check console (F12) for which API URL it's using
# Should show: http://localhost:8000
```

### Fix 3: Backend Not Returning Data
```powershell
# In Terminal 1, verify data exists:
ls C:\EVisionBetCode\data\ev_opportunities.csv
# File should exist and be recent (modified today)

# If missing: Run extract & calculate again
```

---

## 📁 Frontend Project Structure

```
EVisionBetSite/
└── frontend/
    ├── src/
    │   ├── App.js                    Main component
    │   ├── components/
    │   │   └── EVHits.js             Shows EV data table
    │   ├── api/
    │   │   └── client.js             Calls backend API
    │   └── config.js                 API URL config (auto-detects)
    ├── public/                       Static files
    ├── package.json                  Dependencies
    ├── .env.local                    Local config (you create)
    └── .env.example                  Example config
```

---

## 📖 Documentation Created

```
✅ FRONTEND_VSCODE_SETUP.md          ← Complete VS Code setup (10 min)
✅ FRESH_DATA_DIAGNOSTIC.md          ← Diagnose fresh data issue (5 min)
```

Both files in: `C:\EVisionBetSite\`

---

## ✅ Next Immediate Actions

### Right Now:
1. Read [FRONTEND_VSCODE_SETUP.md](FRONTEND_VSCODE_SETUP.md) (10 min)
2. Follow Steps 1-7 (install extensions, npm install, npm start)
3. Open http://localhost:3000

### Then:
4. Run diagnostic from [FRESH_DATA_DIAGNOSTIC.md](FRESH_DATA_DIAGNOSTIC.md)
5. Identify which step fails
6. Apply corresponding fix

### Once Fresh Data Shows:
7. Move to Netlify deployment setup
8. Configure frontend features (sports filters, etc.)

---

## 💡 Pro Tips

- **Hot reload:** Edit `src/` files → browser auto-reloads (no restart needed)
- **Network debugging:** Use REST Client or Thunder Client to test `/api/ev/hits`
- **Debug mode:** Add `?debug=1` to URL for extra logging
- **ESLint:** Run `npm run lint` to check code quality

---

## 🎯 Questions to Ask Yourself

If fresh data doesn't show:

1. **Does backend have data?** → Check: `ls data/ev_opportunities.csv`
2. **Is backend running?** → Check Terminal 2: should see "Uvicorn running"
3. **Can I reach backend?** → Run: `curl http://localhost:8000/health`
4. **Is API returning data?** → Run: `curl http://localhost:8000/api/ev/hits`
5. **Is frontend connecting?** → F12 → Network → look for `/api/ev/hits` request
6. **Is response valid JSON?** → F12 → Network → click request → Response tab

---

**Ready to get started?** Follow the quick start above (15 min) then run the diagnostic! 🚀
