# Development Workflow Guide

## Quick Start (After Initial Setup)

### 1. Open Workspace

```powershell
cd C:\EVisionBetSite
code .
```

VS Code will load both workspace folders (EVisionBetCode and EVisionBetSite).

### 2. Start All Services (3 Terminal Tabs)

**Tab 1: Python Backend**

```powershell
cd C:\EVisionBetCode
.\.venv\Scripts\Activate.ps1
uvicorn backend_api:app --reload
```

- Watches `backend_api.py` for changes
- Auto-restarts on code change
- **API on:** http://localhost:8000

**Tab 2: React Frontend**

```powershell
cd C:\EVisionBetSite\frontend
npm start
```

- Hot reload - changes appear in 1 second
- Auto-opens browser to http://localhost:3000
- Press `q` to close, Ctrl+C to stop

**Tab 3: On-demand (Python scripts)**

```powershell
cd C:\EVisionBetCode
.\.venv\Scripts\Activate.ps1
# Run as needed:
python src/pipeline_v2/extract_odds.py
python src/pipeline_v2/calculate_opportunities.py
make test
```

---

## Development Cycle

### Editing Frontend (RawOddsTable, EVHits, etc.)

1. **Edit file** in `EVisionBetSite/frontend/src/components/`
2. **Save** (Ctrl+S)
3. **See changes** in browser automatically (~1 sec) ✨
4. **No rebuild needed** - Hot reload handles it

Example: Edit `RawOddsTable.js` → save → see changes instantly on http://localhost:3000

### Editing Backend (API endpoints)

1. **Edit file** in `C:\EVisionBetCode/backend_api.py` or `src/pipeline_v2/`
2. **Save** (Ctrl+S)
3. **FastAPI auto-reloads** on file change
4. **Test endpoint** in Thunder Client or browser:
   - http://localhost:8000/api/odds/raw?limit=10
   - http://localhost:8000/health

### Editing Data Pipeline

1. **Edit** `extract_odds.py` or `calculate_opportunities.py`
2. **Run** in Terminal 3:
   ```powershell
   python src/pipeline_v2/extract_odds.py
   ```
3. **Check output** in `data/raw_odds_pure.csv` or `data/ev_opportunities.csv`
4. **Backend auto-picks up** new data files

---

## Testing & Validation

### Test Frontend Changes

- Open http://localhost:3000
- Use Chrome DevTools (F12) for debugging
- React DevTools extension for component inspection

### Test API Endpoints

**Option 1: Thunder Client** (installed in VS Code)

- Open Thunder Client in VS Code
- Create new request to `http://localhost:8000/api/odds/raw?limit=5`
- Send and inspect response

**Option 2: Browser**

- http://localhost:8000/api/odds/raw?limit=10
- http://localhost:8000/health

**Option 3: Python Testing**

```powershell
cd C:\EVisionBetCode
.\.venv\Scripts\Activate.ps1
pytest tests/test_book_weights.py -v
```

### Test Python Code Quality

```powershell
cd C:\EVisionBetCode
make pre-commit  # Runs: format, lint, type-check, test
make test        # Pytest with coverage
make lint        # Flake8 + pylint
make format      # Black + isort
```

---

## Git Workflow

### After Making Changes

```powershell
# In either workspace folder
git status                    # See what changed
git add .                     # Stage changes
git commit -m "feat: description"
git push origin main

# Or from VS Code:
# Ctrl+Shift+G → Stage → Commit → Sync
```

### Commit Message Format

```
feat: Add new feature
fix: Fix a bug
docs: Update documentation
refactor: Code restructuring
style: Formatting changes
perf: Performance improvements
test: Add/update tests
chore: Build/dependency updates
```

---

## Common Development Tasks

### Add New Filter to Raw Odds Table

1. Edit `EVisionBetSite/frontend/src/components/RawOddsTable.js`
2. Add filter key to `filters` state (line ~20)
3. Add to `filterOptions` state
4. Add to filter buttons array (line ~390)
5. Update `filteredAndSortedData` logic (line ~245)
6. Save → See changes immediately

### Add New API Endpoint

1. Edit `C:\EVisionBetCode\backend_api.py`
2. Add new route:

```python
@app.get("/api/new-endpoint")
async def new_endpoint():
    return {"data": "value"}
```

3. Save → FastAPI auto-reloads
4. Test: http://localhost:8000/api/new-endpoint

### Add New Data Column

1. Edit `C:\EVisionBetCode\src/pipeline_v2/extract_odds.py`
2. Add column extraction logic
3. Run: `python src/pipeline_v2/extract_odds.py`
4. Check CSV output for new column
5. If using in frontend, update `RawOddsTable.js` baseColumns

---

## Debugging

### Debug Frontend Component

```javascript
// In component:
console.log("Filter changed:", filters);
console.log("Data rows:", odds.length);
```

Open browser DevTools (F12) → Console tab → See logs

### Debug API Response

```python
# In backend_api.py endpoint:
print(f"Request received: {request.query_params}")
return JSONResponse({"debug": True, "data": data})
```

Check terminal output where FastAPI is running

### Debug Python Script

```python
# In extract_odds.py:
import pdb; pdb.set_trace()  # Breakpoint
# OR
print(f"Debug: {variable}")  # Print debug info
```

Run script, hits breakpoint, step through

---

## Performance Tips

### Frontend Performance

- **Use React DevTools Profiler** (F12 → Profiler tab)
- **Check for unnecessary re-renders** - look at component tree
- **Lazy load components** - use `React.lazy()` for heavy components
- **Memoize expensive calculations** - use `useMemo()` for filters

### Backend Performance

- **Monitor query times** - add timing logs
- **Cache API responses** - store raw odds for 5 minutes
- **Use pagination** - limit=50 default, not 5000

### Build Performance

```powershell
cd C:\EVisionBetSite\frontend
npm run build
# Check build/static/js for file sizes
```

---

## Troubleshooting During Development

| Issue                  | Solution                                                             |
| ---------------------- | -------------------------------------------------------------------- |
| Frontend won't load    | Kill port 3000: `netstat -ano \| findstr :3000` then `taskkill /PID` |
| Backend won't start    | Check `.env` file has `ODDS_API_KEY`                                 |
| Changes not reflecting | Hard refresh: Ctrl+Shift+R in browser                                |
| Hot reload not working | Restart: `npm start` in frontend terminal                            |
| API endpoint 404       | Check CORS in `backend_api.py` line 356                              |
| Python package errors  | Reinstall: `.\.venv\Scripts\pip install -e ".[dev]"`                 |

---

## When Ready to Deploy

### Build for Production

```powershell
# Frontend build
cd C:\EVisionBetSite\frontend
npm run build
# Creates `build/` folder for Render

# Python backend
cd C:\EVisionBetCode
# Just commit and push - Render handles it
```

### Check Build Size

```powershell
cd C:\EVisionBetSite\frontend
npm run build
# Look for size warnings - optimize if >500KB gzipped
```

### Deploy to Render

1. Commit and push changes
2. Render auto-detects pushes
3. Builds and deploys automatically
4. Check https://evisionbet.com for live site

---

## Ideas & Improvements

### Short Term (This Week)

- [ ] Add Tailwind CSS for faster styling
- [ ] Implement virtual scrolling for 5000-row tables
- [ ] Add loading skeletons while data fetches
- [ ] Implement "sticky header" for tables

### Medium Term (This Month)

- [ ] Add WebSocket for real-time odds updates
- [ ] Create reusable filter component
- [ ] Add dark/light mode toggle
- [ ] Implement bookmaker logo caching

### Long Term (Future)

- [ ] Mobile responsive design
- [ ] Add E2E tests (Cypress)
- [ ] Build component library (Storybook)
- [ ] Add analytics/tracking
- [ ] Implement notification system
