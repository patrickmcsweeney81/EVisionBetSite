# Archive Folder - Cleanup Guide

**Created:** December 9, 2025  
**Purpose:** Store legacy/duplicate files for sorting and potential deletion

---

## What's in This Archive

### 1. `legacy_backends/`
**Contents:**
- `backend/` - Old Node.js backend (server.js) with nested EV_ARB-Bot-VSCode folder
- `backend-python/` - Old Python backend with alembic migrations, SQLAlchemy models
- `bot/` - OLD VERSION of EV_ARB Bot with 50+ test/debug files

**Status:** All superseded by current deployments:
- Production backend: `c:\EV_Finder` (deployed to Render)
- Production bot: `c:\EV_ARB Bot VSCode` (Pipeline V2)

**Action:** Review and delete after confirming no unique code needed

---

### 2. `duplicate_docs/`
**Contents:** 20+ duplicate/outdated documentation files:
- Multiple deployment guides (DEPLOYMENT_*.md, RENDER_DEPLOYMENT_GUIDE.md, etc.)
- Cost analysis docs (COST_*.md)
- Feature implementation notes (EV_TAB_IMPLEMENTATION.md, etc.)
- Session summaries and handoff notes

**Status:** Information consolidated into current README files

**Action:** Extract any unique info, then delete

---

### 3. Root Archive Files
- `BET_EVision_Hero_Section_Design.docx` - Design mockup
- `simple-odds-viewer.html` - Standalone HTML demo
- `ssl-manager.php` - PHP script (not used in current stack)
- `img/` - Image assets folder

**Action:** Review and organize or delete

---

## What Remains in EVisionBetSite Root

### Active Files (DO NOT DELETE)
- `frontend/` - React app (Netlify deployment source)
- `docs/` - Active architecture documentation
- `README.md` - Main project documentation
- `DEPLOYMENT.md` - Current deployment guide
- `.github/`, `.gitignore`, `.env` - Git/config files
- `netlify.toml`, `Procfile`, `render.yaml`, `requirements.txt` - Deploy configs

---

## Recommended Next Steps

1. **Review `legacy_backends/bot/` folder** - Contains 50+ old test files:
   - `analyze_*.py`, `check_*.py`, `debug_*.py`, `test_*.py`
   - These were from old development phase before Pipeline V2
   - Production bot is now in `c:\EV_ARB Bot VSCode`

2. **Consolidate Documentation**
   - Merge unique info from `duplicate_docs/` into main README
   - Delete redundant deployment guides

3. **Clean Up Test Files**
   - Most `debug_*.py` and `check_*.py` files are obsolete
   - Keep only if they provide unique validation logic

4. **Delete Archive Folder** once reviewed (or move to external backup)

---

## Production Workspace Structure

```
c:\EV_ARB Bot VSCode\      ← Main EV calculation pipeline (Pipeline V2)
├── pipeline_v2/           ← Active: raw_odds_pure.py, calculate_ev.py
├── core/                  ← Shared utilities
├── data/                  ← ev_opportunities.csv output
└── docs/                  ← Pipeline documentation

c:\EV_Finder\              ← Backend API (deployed to Render)
├── src/api.py            ← FastAPI server with /api/ev/* endpoints
├── frontend/             ← React app (separate Netlify deployment)
├── data/                 ← Database-backed EV data
└── tests/                ← API tests

c:\EVisionBetSite\         ← Frontend deployment repo (Netlify)
├── frontend/             ← React source (builds to Netlify)
├── docs/                 ← Architecture docs
├── _ARCHIVE_TO_SORT/     ← THIS FOLDER (for cleanup)
└── README.md             ← Main documentation
```

---

## Questions to Consider

1. **Do you need the old Node.js backend code?** (backend/server.js)
2. **Any unique logic in old Python backend?** (backend-python/app/)
3. **Keep design mockup?** (BET_EVision_Hero_Section_Design.docx)
4. **Archive 50+ test files permanently?** (bot/*.py debug scripts)

**Default Recommendation:** Delete entire `_ARCHIVE_TO_SORT` folder after quick review - all active code is in proper locations.
