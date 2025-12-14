# EVisionBetSite Archive

This directory contains historical files that are no longer actively used but preserved for reference.

## 📂 Directory Structure

### deployment_configs/

**Purpose:** Old deployment configuration files

- `Procfile` - Heroku deployment config (not using Heroku)
- `requirements.txt` - Python backend dependencies (backend in separate repo)

**Why Archived:** Project deployed on Render using `render.yaml`. Heroku not used. Python dependencies managed in EVisionBetCode repo.

### old_docs/

**Purpose:** Superseded documentation files

- `FRESH_DATA_DIAGNOSTIC.md` - Old troubleshooting guide
- `FRONTEND_SETUP_ACTION_PLAN.md` - Old setup checklist
- `FRONTEND_SETUP_NEXT_STEPS.md` - Old next steps
- `FRONTEND_VSCODE_SETUP.md` - Old VS Code setup
- `LOGO_API_QUICKREF.md` - Logo API quick reference
- `DEPLOYMENT.md` - Old deployment guide

**Why Archived:** Comprehensive documentation suite created:

- `VSCODE_SETUP.md` - Current setup guide
- `DEVELOPMENT.md` - Current development workflow
- `STARTUP_CHECKLIST.md` - Current daily procedures
- `PROJECT_SUMMARY.md` - Current project overview
- `DOCUMENTATION_INDEX.md` - Current doc navigation

Old documentation preserved for historical reference but no longer maintained.

### testing/

**Purpose:** Development test and debug files

- `test_api_fetch.html` - HTML page for API testing

**Why Archived:** Production uses Thunder Client, browser DevTools, and automated tests. HTML test page no longer needed.

---

## 🔍 When to Reference Archive

- **Historical Context:** Understanding past setup procedures
- **Troubleshooting:** Reference old diagnostic approaches
- **Deployment History:** See previous deployment methods tried
- **Recovery:** If old test pages needed temporarily

---

## ⚠️ Important Notes

- **Do not modify** archived files - they are historical snapshots
- **Git history preserved** - All moves done via `git mv`
- **Reference only** - Use current documentation for active development
- **Context preserved** - These files explain evolution of the project

---

## 📚 Current Documentation

For active development, use these files:

- **[VSCODE_SETUP.md](../VSCODE_SETUP.md)** - Initial setup
- **[STARTUP_CHECKLIST.md](../STARTUP_CHECKLIST.md)** - Daily procedures
- **[DEVELOPMENT.md](../DEVELOPMENT.md)** - Development workflow
- **[PROJECT_SUMMARY.md](../PROJECT_SUMMARY.md)** - Project overview
- **[DOCUMENTATION_INDEX.md](../DOCUMENTATION_INDEX.md)** - Doc navigation

---

**Last Updated:** December 14, 2025  
**Archived By:** Repository cleanup and organization
