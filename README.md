# EVisionBetSite – Sports Betting EV Finder Frontend

React/TypeScript frontend for EVisionBet – displays expected value (EV) betting opportunities from 50+ bookmakers.

- **Status:** Production-ready (React + TypeScript)
- **Live API:** https://evision-api.onrender.com
- **Local Dev:** http://localhost:3000 (connects to http://localhost:8000)
- **Last Updated:** December 13, 2025

## Features

- 📊 Live EV opportunities from 50+ bookmakers
- 🎯 Filter by sport, minimum EV%, limit results
- 💰 Smart bookmaker selection (shows best odds per opportunity)
- ⚡ Auto-refresh every 2 minutes
- 🔐 Admin panel for debugging (if enabled)
- 📈 Summary stats (total hits, top EV, sports breakdown)
- 🎨 Modern UI with real-time updates

## Tech Stack

**Frontend:**
- React 18
- TypeScript
- CSS3 with modern layout
- Fetch API for backend communication

**Backend:**
- Python FastAPI (separate repo)
- SQLAlchemy ORM
- PostgreSQL database

**Deployment:**
- Netlify (frontend)
- Render (backend)


## Quick Start (10 minutes)

### Prerequisites
- Node.js 14+ (`node --version`)
- npm 6+ (`npm --version`)
- Backend running locally or on Render

### Setup

```bash
# 1. Navigate to frontend
cd C:\EVisionBetSite\frontend

# 2. Install dependencies (first time only)
npm install

# 3. Create .env.local for local development
echo "REACT_APP_API_URL=http://localhost:8000" > .env.local

# 4. Start development server
npm start
# Opens http://localhost:3000 automatically
```

**Expected:** Homepage loads, shows EV opportunities table (if backend running)

## Backend Quick Setup

Before starting frontend, ensure backend is ready:

```bash
# Terminal 1: Extract & calculate data
cd C:\EVisionBetCode
python src/pipeline_v2/extract_odds.py
python src/pipeline_v2/calculate_opportunities.py

# Terminal 2: Start backend API
uvicorn backend_api:app --reload
# Should see: INFO:     Uvicorn running on http://127.0.0.1:8000

# Terminal 3: Test backend
curl http://localhost:8000/health
# Returns: {"status":"ok",...}

curl http://localhost:8000/api/ev/hits?limit=2
# Returns: [{...EV data...}]
```

## File Structure

```
frontend/
├── src/
│   ├── App.js                      Main component
│   ├── App.css                     Styling
│   ├── config.js                   API URL config (auto-detects localhost)
│   ├── components/
│   │   ├── EVHits.js              ← Main table showing EV opportunities
│   │   ├── AdminPanel.js          Admin debugging panel
│   │   ├── DiagnosticPage.js      API health check & diagnostics
│   │   └── ...                    Other components
│   ├── contexts/                   React Context (state management)
│   ├── hooks/                      Custom React hooks
│   ├── utils/                      Utility functions
│   ├── api/
│   │   └── client.js              API request wrapper
│   └── index.js                    Entry point
├── public/                          Static files
├── package.json                     Dependencies & scripts
├── tsconfig.json                    TypeScript config
├── .env.local                       Local config (you create)
├── .env.example                     Example config
└── .gitignore                       Ignored files
```

## Troubleshooting

### No data showing?
1. **Check backend running:** `curl http://localhost:8000/health`
2. **Check backend has data:** `curl http://localhost:8000/api/ev/hits?limit=1`
3. **Check .env.local:** Should have `REACT_APP_API_URL=http://localhost:8000`
4. **Check frontend console:** `F12` → **Console** tab, look for errors

**Detailed guide:** See [FRESH_DATA_DIAGNOSTIC.md](FRESH_DATA_DIAGNOSTIC.md)

### CORS error?
Check backend `backend_api.py` has CORS configured for `http://localhost:3000`

### Port 3000 in use?
Terminal will ask to use port 3001 instead. Accept it.

### Dependencies issue?
```bash
# Delete node_modules and lock file, reinstall
rm -r node_modules package-lock.json
npm install
```

## Development

### Commands

```bash
# Install dependencies (first time)
npm install

# Start development server (localhost:3000)
npm start

# Build for production
npm run build

# Check code quality
npm run lint

# Auto-fix linting issues
npm run lint -- --fix

# Run tests
npm test
```

### Making Changes

1. Edit files in `src/` folder
2. Save file (`Ctrl+S`)
3. Browser auto-reloads (hot reload)
4. Open **Console** (`F12`) to check for errors

### Testing API Endpoints

Use **REST Client** extension in VS Code:

1. Create file: `test-api.rest`
2. Add requests:
   ```rest
   ### Health Check
   GET http://localhost:8000/health

   ### Get EV Hits
   GET http://localhost:8000/api/ev/hits?limit=10

   ### Get Summary
   GET http://localhost:8000/api/ev/summary
   ```
3. Click "Send Request" above each request

## API Integration

Frontend uses auto-detecting API URL:

```javascript
// frontend/src/config.js
const API_URL = (localhost) 
  ? 'http://localhost:8000'      // Development
  : 'https://evision-api.onrender.com'  // Production
```

**For local development:** Make sure `.env.local` has `REACT_APP_API_URL=http://localhost:8000`

## Deployment

### To Netlify

```bash
# 1. Build frontend
npm run build

# 2. Connect to Netlify
# - Go to netlify.com
# - Connect GitHub repo
# - Set build command: npm run build
# - Set publish directory: build/
# - Deploy!
```

### Frontend Environment Variables

In Netlify Dashboard:
```
REACT_APP_API_URL=https://evision-api.onrender.com
```

## Documentation

- **[FRONTEND_VSCODE_SETUP.md](FRONTEND_VSCODE_SETUP.md)** – VS Code setup (extensions, debugging)
- **[FRESH_DATA_DIAGNOSTIC.md](FRESH_DATA_DIAGNOSTIC.md)** – Troubleshooting guide
- **[FRONTEND_SETUP_ACTION_PLAN.md](FRONTEND_SETUP_ACTION_PLAN.md)** – Quick action plan
- **[../../EVisionBetCode/README.md](../../EVisionBetCode/README.md)** – Backend documentation

## Key Components

### EVHits.js
Main component showing EV opportunities table with:
- Real-time data display
- Filtering (sport, minimum EV, result limit)
- 2-minute auto-refresh
- Summary statistics
- Debug mode (`?debug=1`)

### AdminPanel.js
Admin debugging panel with:
- Database statistics
- CSV download options
- API health checks

### DiagnosticPage.js
Diagnostic page showing:
- API health status
- Available sports
- API configuration

## Data Flow

```
Frontend (React)
    ↓ (fetch request)
fetch('/api/ev/hits')
    ↓
Backend API (FastAPI)
    ↓ (SQL query)
SELECT * FROM ev_opportunities
    ↓
Database (PostgreSQL or CSV)
    ↓ (JSON response)
Frontend displays data in table
```

## Support

### Quick Diagnostics

1. **Backend running?** `curl http://localhost:8000/health`
2. **Backend has data?** `curl http://localhost:8000/api/ev/hits?limit=1`
3. **Frontend sees API?** `F12` → **Network** tab → look for `/api/ev/hits` request
4. **Response valid?** Check **Response** tab in Network inspector

### Common Issues

| Issue | Solution |
|-------|----------|
| **No data** | Run extraction/calculation in backend |
| **CORS error** | Check backend CORS allows localhost:3000 |
| **Port in use** | Use offered alternate port (3001) |
| **Blank page** | Check browser console for errors (`F12`) |
| **Slow loading** | Check Network tab (F12) for response times |

For detailed help, see [FRESH_DATA_DIAGNOSTIC.md](FRESH_DATA_DIAGNOSTIC.md)

## Next Steps

1. ✅ Set up VS Code (see [FRONTEND_VSCODE_SETUP.md](FRONTEND_VSCODE_SETUP.md))
2. ✅ Verify fresh data displays
3. → Deploy to Netlify
4. → Configure Netlify domain
5. → Monitor frontend logs

---

**Frontend repo:** [patrickmcsweeney81/EVisionBetSite](https://github.com/patrickmcsweeney81/EVisionBetSite)  
**Backend repo:** [patrickmcsweeney81/EVisionBetCode](https://github.com/patrickmcsweeney81/EVisionBetCode)  
**Live site:** https://evisionbet.com

**Version:** 2.0 (React + TypeScript)  
**Last Updated:** December 13, 2025

The backend will run on `http://localhost:3001`.

### Start the Frontend Development Server

Open a new terminal window/tab:

```bash
cd frontend
npm start
```

The frontend will run on `http://localhost:3000` and automatically open in your browser.

## Using the Application

1. **Login**: Navigate to `http://localhost:3000`
   - Username: `EVison`
   - Password: `PattyMac`
2. **Dashboard**: After successful login, you'll be redirected to the dashboard
   - View various cards for different features
   - Access the Ideas/TODO page
3. **Ideas/TODO Page**: Click the "View TODO" button to see the project roadmap and development tasks

### Backend API Endpoints

- `POST /api/login` - Authenticate user

### Frontend Routes

- `/` - Login page
- `/dashboard` - Protected dashboard (requires authentication)
- `/todo` - Protected TODO/Ideas page (requires authentication)

## Original Static Site

The original `index.html` file is preserved at the root level and can be viewed by opening it directly in a browser.

## Current Limitations (Development Only)

- **Hardcoded credentials** - Username and password are hardcoded in the backend
- **No HTTPS** - Cookies are sent over HTTP (secure: false)
- ✅ HTTPS with secure cookies (secure: true)
- ✅ CSRF protection middleware
- ✅ Rate limiting on all API endpoints
- ✅ Input validation and sanitization
- ✅ Proper error handling and logging
- ✅ Security headers (helmet.js)

## Bookmaker Logos

This project uses Logo.dev API to fetch bookmaker logos. For complete documentation:

- **Quick Reference:** [LOGO_API_QUICKREF.md](LOGO_API_QUICKREF.md) - Fast lookup for domains and API keys
- **Full Documentation:** [docs/LOGO_APIS.md](docs/LOGO_APIS.md) - Complete API guide with all 52 bookmakers
- **Scripts:** [scripts/README.md](scripts/README.md) - Logo download tools

### Quick Setup

```bash
# Download and cache all bookmaker logos locally
node scripts/download-logos.js
```

## Future Enhancements

See `TODO.md` for a complete list of planned features and improvements.

## License

ISC

---

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change. See the `/docs` folder for architecture and contribution guidelines.

---

**Backend repo:** [EVisionBetCode](https://github.com/patrickmcsweeney81/EVisionBetCode)

**Maintainer:** Patrick McSweeney

## Author

Patrick McSweeney
