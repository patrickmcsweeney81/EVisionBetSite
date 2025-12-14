# 📖 Documentation Index

Welcome to **EVisionBetCode** - Smart EV Betting Finder

---

## 🎯 Start Here

### **First Time Setup?**

→ Read [VSCODE_SETUP.md](VSCODE_SETUP.md) (15 minutes)

- Python environment setup
- VS Code extensions
- Frontend dependencies
- Configuration files

### **Ready to Code?**

→ Read [STARTUP_CHECKLIST.md](STARTUP_CHECKLIST.md) (5 minutes)

- Daily 3-terminal startup
- Verification steps
- Development workflow
- Keyboard shortcuts

### **Daily Development?**

→ Read [DEVELOPMENT.md](DEVELOPMENT.md) (10 minutes)

- Hot reload workflow (1 second!)
- Testing procedures
- Git workflow
- Common tasks
- Troubleshooting

### **Project Overview?**

→ Read [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) (10 minutes)

- What we built
- Key accomplishments
- Architecture overview
- Next steps and ideas

---

## 📚 Complete Documentation Map

| Document                                         | Purpose                  | Time   | Audience                   |
| ------------------------------------------------ | ------------------------ | ------ | -------------------------- |
| **[VSCODE_SETUP.md](VSCODE_SETUP.md)**           | Initial setup guide      | 15 min | Developers (first-time)    |
| **[STARTUP_CHECKLIST.md](STARTUP_CHECKLIST.md)** | Daily startup procedures | 5 min  | Developers (daily use)     |
| **[DEVELOPMENT.md](DEVELOPMENT.md)**             | Development workflow     | 10 min | Developers (active coding) |
| **[PROJECT_SUMMARY.md](PROJECT_SUMMARY.md)**     | Project overview & ideas | 10 min | Everyone (context)         |
| **[README.md](../EVisionBetCode/README.md)**     | Backend overview         | 5 min  | Backend developers         |
| **.github/copilot-instructions.md**              | AI agent guidelines      | 3 min  | AI agents (Copilot)        |

---

## 🚀 Quick Start (TL;DR)

### Setup (One Time - 10 minutes)

```bash
# 1. Install Python 3.11+ and Node.js 18+
# 2. Clone both repos
git clone https://github.com/patrickmcsweeney81/EVisionBetCode.git
git clone https://github.com/patrickmcsweeney81/EVisionBetSite.git

# 3. Setup Python
cd EVisionBetCode
python -m venv .venv
.venv\Scripts\activate
pip install -e ".[dev]"

# 4. Setup Frontend
cd ../EVisionBetSite/frontend
npm install

# 5. Create .env files
# EVisionBetCode/.env
ODDS_API_KEY=your_api_key_here

# 6. Install VS Code extensions (see VSCODE_SETUP.md)
```

### Daily Start (2 minutes - 3 terminals)

```bash
# Terminal 1: Backend
cd EVisionBetCode
uvicorn backend_api:app --reload

# Terminal 2: Frontend
cd EVisionBetSite/frontend
npm start

# Terminal 3: Optional (data extraction, testing, etc)
# See STARTUP_CHECKLIST.md for details
```

### Code → See Changes (1 second!)

1. Edit `RawOddsTable.js`
2. Save (Ctrl+S)
3. Watch browser update automatically ✨

---

## 📊 Architecture Overview

```
The Odds API
    ↓
extract_odds.py (12 sports, parallel)
    ↓
raw_odds_pure.csv (7,420+ rows)
    ↓
calculate_opportunities.py (EV calculation)
    ↓
ev_opportunities.csv (250+ opportunities)
    ↓
backend_api.py (FastAPI server)
    ↓
Frontend (React 19)
    ↓
EVisionBetSite (user interface)
```

---

## 🎯 Common Tasks

### Adding a New Feature

1. Create a new branch: `git checkout -b feature/my-feature`
2. Edit files in frontend/src or backend_api.py
3. Test in browser (hot reload shows changes instantly)
4. Commit: `git commit -m "feat: Description"`
5. Push: `git push origin feature/my-feature`
6. Create PR on GitHub

### Running Tests

```bash
# Python tests
pytest tests/ -v

# Frontend tests
npm test

# All quality checks
make pre-commit
```

### Debugging

- **Frontend:** Open DevTools (F12) → Console tab
- **Backend:** Check terminal output for print() statements
- **Network:** Thunder Client extension to test API endpoints

### Git Workflow

```bash
git status              # See what changed
git add .              # Stage all changes
git commit -m "..."    # Commit with message
git push               # Push to GitHub
git log --oneline      # See commit history
```

---

## 🔑 Key Technical Decisions

### Why Two-Stage Pipeline?

- **Stage 1** (extract_odds.py): Fetch from API → Save to CSV

  - Benefit: Can run extraction once, calculate multiple times without API costs
  - Benefit: Future multi-source data merging ready

- **Stage 2** (calculate_opportunities.py): EV calculation → Save CSV + Database
  - Benefit: Independent of API, can tweak formulas without refetching
  - Benefit: Database optional (CSV fallback always works)

### Why Smart Book Weighting?

- Only 4⭐/3⭐ books (DraftKings, FanDuel, Pinnacle) used for "fair odds"
- 1⭐ books (Sportsbet, PointsBet) are "target" books (find EV there)
- Prevents low-quality books from skewing fair value calculations
- Separate weight totals for Over/Under sides (not shared)

### Why React Hot Reload?

- Edit JS → Save → See changes in 1 second (no rebuild)
- Makes development 10x faster than traditional builds
- Enables experimentation and quick iteration

---

## 💡 Ideas for Improvement

### This Week

- [ ] Add Tailwind CSS for faster styling
- [ ] Virtual scrolling for 5000+ row tables
- [ ] Loading skeletons while data fetches
- [ ] Sticky column headers

### This Month

- [ ] WebSocket real-time odds updates
- [ ] Dark/light mode toggle
- [ ] Reusable filter component library
- [ ] Bookmaker logo caching

### This Year

- [ ] Mobile responsive design
- [ ] E2E tests (Cypress)
- [ ] Component library (Storybook)
- [ ] Analytics dashboard
- [ ] Notification system for high-EV bets

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed implementation notes.

---

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Find process using port 8000 (backend)
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# Or use different port
uvicorn backend_api:app --reload --port 8001
```

### Frontend Won't Load

```bash
# Clean install
cd EVisionBetSite/frontend
rm -r node_modules package-lock.json
npm install
npm start
```

### Backend Won't Start

1. Check `.env` file exists with ODDS_API_KEY
2. Verify Python venv is activated: `.venv\Scripts\activate`
3. Check pip packages: `pip list | grep -i fastapi`

### CORS Error

The backend CORS is configured for localhost:3000, 8000, and 62527.
If you're using a different port, add it to [backend_api.py](../EVisionBetCode/backend_api.py) line ~360.

See [STARTUP_CHECKLIST.md](STARTUP_CHECKLIST.md) "Troubleshooting" section for more.

---

## 🎓 Learning Resources

- **[The Odds API Docs](https://theoddsapi.com/)**
- **[FastAPI Docs](https://fastapi.tiangolo.com/)**
- **[React Docs](https://react.dev/)**
- **[VS Code Docs](https://code.visualstudio.com/docs)**
- **[Python Docs](https://docs.python.org/3/)**

---

## 📞 Questions?

1. **Check documentation first** (start with relevant doc above)
2. **Check git history:** `git log --oneline --all`
3. **Run tests:** `pytest tests/ -v`
4. **Check API:** `curl http://localhost:8000/docs`
5. **Use DevTools:** F12 for frontend, terminal output for backend

---

## ✅ Development Checklist

Before pushing code:

```bash
make pre-commit      # Format, lint, type-check, test
git status           # Review changes
git add .
git commit -m "feat/fix: description"
git push origin main
```

---

## 🎉 Happy Coding!

The project is setup for productivity. Key benefits:

✨ **1-second hot reload** - See changes instantly
✅ **Comprehensive tests** - Confidence in changes
📚 **Great documentation** - Easy onboarding
🚀 **Automated deployment** - Push = Deploy to production
🔧 **Developer tools** - Thunder Client, React DevTools, etc.

---

**Next Step:** Open [STARTUP_CHECKLIST.md](STARTUP_CHECKLIST.md) and follow daily startup!
