# VS Code Setup for EVisionBetSite Frontend

Complete guide to configure VS Code for React/TypeScript frontend development.

## Step 1: Install Required Extensions

Open VS Code and go to **Extensions** (`Ctrl+Shift+X`):

### Essential Extensions
1. **ES7+ React/Redux/React-Native snippets** (by dsznajder)
   - ID: `dsznajder.es7-react-js-snippets`
   - React component templates and snippets

2. **TypeScript Vue Plugin (Volar)** (by Vue) OR **Thunder Client**
   - ID: `Vue.volar` (for TypeScript support)
   - Advanced TypeScript intellisense

3. **Prettier - Code formatter** (by Prettier)
   - ID: `esbenp.prettier-vscode`
   - Auto-format JavaScript/TypeScript/CSS

4. **ESLint** (by Microsoft)
   - ID: `dbaeumer.vscode-eslint`
   - Real-time linting (code quality warnings)

### Recommended Extensions
5. **REST Client** (by Huachao Zheng)
   - ID: `humao.rest-client`
   - Test API endpoints directly from VS Code

6. **Thunder Client** (by Thunder Client)
   - ID: `rangav.vscode-thunder-client`
   - Lightweight API testing (alternative to Postman)

7. **Git Graph** (by mhutchie)
   - ID: `mhutchie.git-graph`
   - Visual git history (optional)

8. **Thunder Client** 
   - ID: `rangav.vscode-thunder-client`
   - API testing (better than REST Client)

## Step 2: Check Node.js & npm Installation

```powershell
node --version    # Should be 14+ (recommend 16+)
npm --version     # Should be 6+ (recommend 8+)
```

If not installed:
1. Download from [nodejs.org](https://nodejs.org/)
2. Install LTS version (comes with npm)
3. Restart terminal
4. Verify versions above

## Step 3: Install Frontend Dependencies

```bash
# Navigate to frontend folder
cd C:\EVisionBetSite\frontend

# Install dependencies
npm install

# Expected: node_modules/ folder created with 1000+ packages
```

## Step 4: Create .env.local File

In `frontend/` create `.env.local`:

```
# Local development (backend running locally)
REACT_APP_API_URL=http://localhost:8000

# OR for Render backend
# REACT_APP_API_URL=https://evision-api.onrender.com
```

This tells the frontend where to find the backend API.

## Step 5: Configure VS Code for React/TypeScript

Press `Ctrl+,` (Settings) or:
1. **File** → **Preferences** → **Settings**
2. Search for each setting and enable:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "[javascript]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescript]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[typescriptreact]": {
    "editor.formatOnSave": true,
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json]": {
    "editor.formatOnSave": true
  },
  "eslint.enable": true,
  "eslint.validate": ["javascript", "typescript", "typescriptreact"],
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  }
}
```

## Step 6: Test Frontend Setup

```bash
# Start development server
npm start

# Expected output:
# Compiled successfully!
# 
# You can now view the app in the browser.
# 
#   Local:            http://localhost:3000
#   On Your Network:  http://192.168.x.x:3000
```

**In browser:**
- Go to `http://localhost:3000`
- You should see the EVisionBet homepage
- Check browser console (`F12` → **Console** tab) for errors

## Step 7: Test API Connection

### Option A: Direct API Test
```bash
# In another terminal, test backend health
curl http://localhost:8000/health
# Should return: {"status":"ok","timestamp":"...","database":"connected"}

# Test API endpoint
curl http://localhost:8000/api/ev/hits?limit=3
# Should return JSON array of EV opportunities
```

### Option B: REST Client in VS Code
Create file: `test-api.rest`:

```rest
### Health Check
GET http://localhost:8000/health

### Get Latest EV Hits
GET http://localhost:8000/api/ev/hits?limit=10

### Get Latest Odds
GET http://localhost:8000/api/odds/latest?limit=5
```

Click **Send Request** above each request to test.

## Step 8: Verify Fresh Data Flow

**Check 3 things in order:**

1. **Backend has fresh data:**
   ```bash
   cd C:\EVisionBetCode
   python src/pipeline_v2/calculate_opportunities.py
   # Check: data/ev_opportunities.csv has recent rows
   ```

2. **API returns data:**
   ```bash
   curl http://localhost:8000/api/ev/hits?limit=1
   # Should return fresh EV opportunities
   ```

3. **Frontend displays data:**
   - Go to http://localhost:3000
   - Open browser Console (`F12` → **Console**)
   - Check for errors
   - Look for API calls in **Network** tab

## Step 9: Debug Frontend

### See Console Logs
1. Press `F12` to open browser Developer Tools
2. Click **Console** tab
3. Look for errors in red

### Common Issues
```javascript
// ❌ No data displayed
// Check: console.log(data) to see API response
// Network tab → find /api/ev/hits request → check response body

// ❌ CORS error (Origin not allowed)
// Check: backend_api.py CORS config allows localhost:3000

// ❌ 404 errors
// Check: REACT_APP_API_URL in .env.local matches backend location
```

### Edit & Hot Reload
1. Open `src/App.js` or any component
2. Make a change (e.g., "EV Opportunities" → "Test")
3. Save file (`Ctrl+S`)
4. Browser auto-reloads (no need to restart)

## Step 10: Configure Linting & Formatting

### Auto-Format on Save (TypeScript/React)
Settings already configured in Step 5.

**Test it:**
1. Open any `.tsx` or `.ts` file
2. Write bad formatting:
   ```javascript
   const x=1+2;const y=  3+4;
   ```
3. Save (`Ctrl+S`)
4. Code auto-formats to:
   ```javascript
   const x = 1 + 2;
   const y = 3 + 4;
   ```

### Run ESLint Check
```bash
# Check all files for linting issues
npm run lint
# Or: npx eslint src/

# Fix auto-fixable issues
npm run lint -- --fix
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| **npm install fails** | Delete `node_modules/` and `package-lock.json`, run `npm install` again |
| **Port 3000 already in use** | `npm start` will prompt to use port 3001 (accept it) |
| **No data on frontend** | Check backend running: `curl http://localhost:8000/api/ev/hits` |
| **CORS error in console** | Backend CORS not allowing localhost:3000 (check backend_api.py) |
| **TypeScript errors** | Restart VS Code: `Ctrl+Shift+P` → "Developer: Reload Window" |
| **Components not updating** | Check `.env.local` has correct `REACT_APP_API_URL` |
| **Build fails** | Check `src/` folder structure, rebuild: `npm run build` |

## Quick Command Reference

```bash
# Navigate to frontend
cd C:\EVisionBetSite\frontend

# Install dependencies (first time only)
npm install

# Start development server (localhost:3000)
npm start

# Build for production
npm build

# Run ESLint
npm run lint

# Test
npm test

# Stop server
Ctrl+C
```

## File Structure

```
frontend/
├── src/
│   ├── App.js              Main component
│   ├── App.css             Styling
│   ├── components/         Reusable components
│   ├── contexts/           React context (state management)
│   ├── hooks/              Custom React hooks
│   ├── utils/              Utility functions
│   ├── api/
│   │   └── client.js       API client (calls backend)
│   └── index.js            Entry point
├── public/                 Static files
├── package.json            Dependencies & scripts
├── tsconfig.json           TypeScript config
├── .env.local              Local config (don't commit)
└── .env.example            Example config
```

## Understanding the API Flow

```
Frontend (React)
  ↓ (makes request)
  fetch('http://localhost:8000/api/ev/hits')
  ↓
Backend API (FastAPI)
  ↓ (queries database)
  SELECT * FROM ev_opportunities
  ↓
Backend returns JSON
  ↓ (frontend processes)
Frontend displays in table/cards
```

---

## Next Steps

1. ✅ Install extensions (Prettier, ESLint, REST Client)
2. ✅ Install dependencies: `npm install`
3. ✅ Create `.env.local` with `REACT_APP_API_URL`
4. ✅ Start frontend: `npm start`
5. ✅ Start backend: `uvicorn backend_api:app --reload`
6. ✅ Test API: `curl http://localhost:8000/api/ev/hits`
7. ✅ View frontend: `http://localhost:3000`
8. 🔄 Diagnose why fresh data isn't showing

---

**Setup complete!** You're ready for frontend development. See main [EVisionBetSite README.md](../README.md) for next steps.
