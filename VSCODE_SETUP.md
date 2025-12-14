# VS Code Setup Guide for EVisionBetCode

## Initial Setup (First Time Only)

### 1. Install Recommended Extensions
Run in terminal or install manually from Extensions panel:

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
```

### 2. Python Environment Setup
```powershell
cd C:\EVisionBetCode
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
```

### 3. Frontend Dependencies
```powershell
cd C:\EVisionBetSite\frontend
npm install
```

### 4. Create VS Code Workspace Settings
Create `.vscode/settings.json` in workspace root:

```json
{
  "[python]": {
    "editor.defaultFormatter": "ms-python.python",
    "editor.formatOnSave": true,
    "editor.codeActionsOnSave": {
      "source.organizeImports": "explicit"
    }
  },
  "[javascript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "[css]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode",
    "editor.formatOnSave": true
  },
  "python.testing.pytestEnabled": true,
  "python.testing.pytestArgs": ["tests"],
  "python.linting.enabled": true,
  "python.linting.pylintEnabled": true,
  "editor.rulers": [88, 120],
  "editor.renderWhitespace": "boundary",
  "files.exclude": {
    "**/__pycache__": true,
    "**/node_modules": true,
    "**/.venv": true,
    "**/build": true
  }
}
```

---

## Daily Development Workflow

### Start Services (3 Terminals)

**Terminal 1 - Backend API:**
```powershell
cd C:\EVisionBetCode
.\.venv\Scripts\Activate.ps1
uvicorn backend_api:app --reload
# Runs on http://localhost:8000
```

**Terminal 2 - Frontend Dev Server:**
```powershell
cd C:\EVisionBetSite\frontend
npm start
# Runs on http://localhost:3000 with Hot Reload
```

**Terminal 3 - Python Pipeline (as needed):**
```powershell
cd C:\EVisionBetCode
.\.venv\Scripts\Activate.ps1
# Run tasks manually or use VS Code tasks
python src/pipeline_v2/extract_odds.py
```

### Access Points
- **Frontend:** http://localhost:3000
- **API Docs:** http://localhost:8000/docs
- **API Health:** http://localhost:8000/health

---

## Folder Structure Overview

```
EVisionBetCode/
├── .venv/                          # Python virtual environment (git ignored)
├── src/
│   └── pipeline_v2/
│       ├── extract_odds.py         # Odds extraction from API
│       ├── calculate_opportunities.py  # EV calculations
│       └── ratings.py              # Bookmaker ratings & weights
├── backend_api.py                  # FastAPI server (main entry point)
├── data/
│   ├── raw_odds_pure.csv          # Raw odds extract
│   └── ev_opportunities.csv        # Calculated opportunities
├── tests/
│   └── test_book_weights.py        # Unit tests
├── pyproject.toml                  # Python package config
├── requirements.txt                # Dependencies
└── Makefile                        # Common tasks

EVisionBetSite/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── RawOddsTable.js     # Raw odds display (50/50 split)
│   │   │   ├── EVHits.js           # EV opportunities display
│   │   │   ├── Dashboard.js        # Main dashboard
│   │   │   └── ...
│   │   ├── App.js                  # Router/routes
│   │   ├── config.js               # API URL config
│   │   └── index.js                # Entry point
│   ├── package.json                # Node dependencies
│   ├── tsconfig.json               # TypeScript config
│   └── build/                      # Production build (git ignored)
└── public/                         # Static assets
```

---

## Key Configuration Files

### Environment Variables (.env)

**Backend** - Create `.env` in `C:\EVisionBetCode`:
```
ODDS_API_KEY=your_key_here
DATABASE_URL=postgresql://user:pass@host/db  # Optional
SPORTS=basketball_nba,americanfootball_nfl,icehockey_nhl,soccer_epl
REGIONS=au,us,us2,eu
ADMIN_PASSWORD_HASH=your_hash_here
```

**Frontend** - Create `.env` in `C:\EVisionBetSite\frontend`:
```
REACT_APP_API_URL=http://localhost:8000  # Dev
# Production: https://api.evisionbet.com
```

---

## VS Code Tasks (Already Configured)

Press `Ctrl+Shift+B` to see available tasks:

- **Pipeline: Extract Odds** - Run odds extraction
- **Pipeline: Calculate EV** - Run EV calculations
- **Pipeline: Run Full** - Extract then calculate
- **Backend: Start API** - Start FastAPI server
- **Frontend: Start Dev Server** - Start React dev server

---

## Debugging Tips

### Python Debugging
Add to `.vscode/launch.json`:
```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Python: FastAPI",
      "type": "python",
      "request": "launch",
      "module": "uvicorn",
      "args": ["backend_api:app", "--reload"],
      "jinja": true,
      "cwd": "${workspaceFolder:EVisionBetCode}"
    },
    {
      "name": "Python: Test",
      "type": "python",
      "request": "launch",
      "module": "pytest",
      "args": ["tests/", "-v"],
      "cwd": "${workspaceFolder:EVisionBetCode}"
    }
  ]
}
```

### React DevTools
- Install: Chrome extension "React Developer Tools"
- Use `Components` tab to inspect component hierarchy
- Use `Profiler` tab to measure render times

### API Testing
Use Thunder Client (installed extension):
- Create requests to `http://localhost:8000/api/*` endpoints
- Save requests as `.thunder-client` collection

---

## Performance Optimization

### Monitor Bundle Size
```powershell
cd C:\EVisionBetSite\frontend
npm run build
npm install -g source-map-explorer
source-map-explorer 'build/static/js/*.js'
```

### Check Frontend Performance
- Open DevTools (F12)
- Go to Lighthouse tab
- Run audit on http://localhost:3000

### Python Code Quality
```powershell
cd C:\EVisionBetCode
make pre-commit  # Runs all checks
make test        # Run tests with coverage
```

---

## Common Tasks

| Task | Command |
|------|---------|
| Install Python deps | `.\.venv\Scripts\Activate.ps1 && pip install -e ".[dev]"` |
| Install Node deps | `cd frontend && npm install` |
| Format Python code | `cd C:\EVisionBetCode && make format` |
| Format JS/CSS | `cd frontend && npx prettier --write src/` |
| Run Python tests | `cd C:\EVisionBetCode && make test` |
| Run all checks | `cd C:\EVisionBetCode && make pre-commit` |
| Build frontend | `cd frontend && npm run build` |

---

## Troubleshooting

**Frontend won't start:**
```powershell
cd C:\EVisionBetSite\frontend
rm -r node_modules package-lock.json
npm install
npm start
```

**Backend API errors:**
```powershell
cd C:\EVisionBetCode
.\.venv\Scripts\Activate.ps1
python -c "from backend_api import app; print('OK')"
```

**Port conflicts:**
```powershell
netstat -ano | findstr ":3000"  # Find process on port 3000
taskkill /PID <PID> /F          # Kill process
```

**CORS issues:**
- Check `backend_api.py` line 356-362 for allowed origins
- Frontend on port 3000 should be allowed
- Add new ports if needed

---

## Next Steps / Ideas

- [ ] Add Tailwind CSS for faster UI development
- [ ] Implement virtual scrolling for 5000+ row tables (react-window)
- [ ] Add caching layer for API responses
- [ ] Implement WebSocket for real-time odds updates
- [ ] Add dark mode toggle
- [ ] Create component library for reusable UI
- [ ] Add E2E tests with Cypress
- [ ] Monitor Lighthouse scores in CI/CD
- [ ] Implement smart table column visibility toggle
- [ ] Add bookmaker logo caching strategy

