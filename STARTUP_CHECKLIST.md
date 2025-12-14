# VS Code Startup Checklist

Run this checklist when starting a new development session.

## Pre-Session (First Time Only)

### 1. Clone Repositories
```powershell
mkdir C:\EVisionBet
cd C:\EVisionBet
git clone https://github.com/patrickmcsweeney81/EVisionBetCode.git
git clone https://github.com/patrickmcsweeney81/EVisionBetSite.git
```

### 2. Install VS Code Extensions
```powershell
code --install-extension bradlc.vscode-tailwindcss
code --install-extension esbenp.prettier-vscode
code --install-extension dsznajder.es7-react-js-snippets
code --install-extension rangav.vscode-thunder-client
code --install-extension pranaygp.vscode-css-peek
code --install-extension ms-python.python
code --install-extension ms-vscode.makefile-tools
code --install-extension eamodio.gitlens
code --install-extension GitHub.copilot
code --install-extension GitHub.copilot-chat
code --install-extension ms-vscode.vscode-typescript-next
```

### 3. Setup Python Environment
```powershell
cd C:\EVisionBetCode
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install --upgrade pip
pip install -e ".[dev]"
```

### 4. Setup Frontend
```powershell
cd C:\EVisionBetSite\frontend
npm install
```

### 5. Create Configuration Files

**C:\EVisionBetCode\.env**
```
ODDS_API_KEY=your_actual_key_here
SPORTS=basketball_nba,americanfootball_nfl,icehockey_nhl,soccer_epl
REGIONS=au,us,us2,eu
DATABASE_URL=postgresql://user:pass@host/db  # Optional
ADMIN_PASSWORD_HASH=your_hash              # Optional
```

**C:\EVisionBetSite\frontend\.env**
```
REACT_APP_API_URL=http://localhost:8000
```

### 6. Open Workspace
```powershell
cd C:\EVisionBetSite
code .  # Opens both folders in VS Code
```

---

## Daily Startup Checklist

### ✅ Step 1: Open Workspace
```powershell
cd C:\EVisionBetSite
code .
```

### ✅ Step 2: Open 3 Terminals in VS Code

**Terminal 1: Backend API**
```powershell
cd C:\EVisionBetCode
.\.venv\Scripts\Activate.ps1
uvicorn backend_api:app --reload
```
Expected: `Uvicorn running on http://127.0.0.1:8000`

**Terminal 2: Frontend Dev Server**
```powershell
cd C:\EVisionBetSite\frontend
npm start
```
Expected: Automatically opens http://localhost:3000 in browser

**Terminal 3: On-demand Tasks**
```powershell
cd C:\EVisionBetCode
.\.venv\Scripts\Activate.ps1
# Ready for manual commands
```

### ✅ Step 3: Verify Services Running

**In Browser:**
- Frontend: http://localhost:3000 → Should see dashboard
- API Docs: http://localhost:8000/docs → Should see Swagger UI
- API Health: http://localhost:8000/health → Should see `{"status":"ok"}`

**In Terminal 1:** Should show `Application startup complete`

**In Terminal 2:** Should show `Compiled successfully` with a link to localhost:3000

### ✅ Step 4: Login to Frontend
- Username: admin
- Password: password

### ✅ Step 5: Test Data Pipeline (Optional)

In Terminal 3:
```powershell
python src/pipeline_v2/extract_odds.py
# Wait 2-3 minutes for completion
# Check C:\EVisionBetCode\data\raw_odds_pure.csv for new data

python src/pipeline_v2/calculate_opportunities.py
# Wait 30 seconds for completion
# Check C:\EVisionBetCode\data\ev_opportunities.csv for opportunities
```

---

## Development Session

### Making Frontend Changes
1. Edit file in `C:\EVisionBetSite\frontend\src/components/`
2. Save (Ctrl+S)
3. **See changes in 1 second** ✨ (hot reload)
4. No rebuild needed!

**Example:** Edit `RawOddsTable.js` line 100 → save → see changes immediately

### Making Backend Changes
1. Edit file in `C:\EVisionBetCode\backend_api.py` or `src/pipeline_v2/`
2. Save (Ctrl+S)
3. FastAPI auto-reloads (check Terminal 1)
4. Test via http://localhost:8000/docs or Thunder Client

### Making Data Pipeline Changes
1. Edit `extract_odds.py` or `calculate_opportunities.py`
2. Run in Terminal 3: `python src/pipeline_v2/extract_odds.py`
3. Check output in `data/` folder
4. Backend automatically picks up new data

---

## Testing During Development

### Test Frontend Changes
- Open DevTools (F12)
- Console tab for errors
- React DevTools extension for component inspection
- Network tab to see API calls

### Test API Endpoints
**Option 1: Thunder Client (Recommended)**
- Click Thunder Client in VS Code sidebar
- Create new request to `http://localhost:8000/api/odds/raw?limit=10`
- Send and inspect response

**Option 2: Browser**
- http://localhost:8000/api/odds/raw?limit=5
- http://localhost:8000/health

**Option 3: Python Testing**
```powershell
cd C:\EVisionBetCode
.\.venv\Scripts\Activate.ps1
pytest tests/ -v
```

---

## Before Committing Code

### 1. Run Quality Checks
```powershell
cd C:\EVisionBetCode
make pre-commit  # Runs: format, lint, type-check, test
```

### 2. Test Frontend Build
```powershell
cd C:\EVisionBetSite\frontend
npm run build
# Check for any build errors
```

### 3. Commit Changes
```powershell
git add .
git commit -m "feat: Description of changes"
git push origin main
```

---

## Troubleshooting

### Frontend won't start
```powershell
cd C:\EVisionBetSite\frontend
rm -r node_modules package-lock.json
npm install
npm start
```

### Port already in use
```powershell
# Find process on port 3000
netstat -ano | findstr ":3000"
# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Backend won't start
```powershell
cd C:\EVisionBetCode
.\.venv\Scripts\Activate.ps1
# Check .env file exists
cat .env
# Check ODDS_API_KEY is set
echo $env:ODDS_API_KEY
```

### Hot reload not working
```powershell
# Kill and restart npm
Ctrl+C in Terminal 2
npm start
```

### Git conflicts
```powershell
git status
git pull origin main
# Resolve conflicts in VS Code
git add .
git commit -m "Merge main"
git push origin main
```

---

## Keyboard Shortcuts (VS Code)

| Shortcut | Action |
|----------|--------|
| Ctrl+` | Open terminal |
| Ctrl+Shift+P | Command palette |
| Ctrl+Shift+B | Run task (build/run) |
| F5 | Debug |
| F12 | DevTools (in browser) |
| Ctrl+F | Find in file |
| Ctrl+H | Find & replace |
| Ctrl+/ | Toggle comment |
| Alt+Up/Down | Move line up/down |
| Ctrl+D | Select word |

---

## Helpful Resources

- **[VSCODE_SETUP.md](VSCODE_SETUP.md)** - Full setup guide
- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Development workflow details
- **[README.md](../EVisionBetCode/README.md)** - Project overview
- **API Docs:** http://localhost:8000/docs (when running)
- **React DevTools:** Chrome extension for component debugging
- **Thunder Client:** Built into VS Code for API testing

---

## Daily Shutdown

```powershell
# Terminal 1: Ctrl+C
# Terminal 2: Ctrl+C
# Terminal 3: Ctrl+C
# VS Code: Close window or File > Exit

# Make sure to commit changes!
git status
git add .
git commit -m "Your message"
git push origin main
```

---

**Last Updated:** December 14, 2025

