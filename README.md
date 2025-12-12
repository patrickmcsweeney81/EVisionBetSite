# BET EVision - Sports Betting Analytics Platform

A web application for sports betting analytics and expected value tools featuring a React frontend and Node.js/Express backend.

## Features

- 🔐 Secure login system (username: EVison, password: PattyMac)
- 📊 Protected dashboard after authentication
- 💡 Ideas/TODO page displaying project roadmap
- 🎨 Clean, modern UI with BET EVision branding
- 🔒 Session-based authentication

## Tech Stack

**Frontend:**
- React
- React Router DOM
- CSS3

**Backend:**
- Node.js
- Express
- express-session
- CORS


## Project Structure

```text
EVisionBetSite/
├── backend/                # Node.js/Express backend
│   ├── server.js          # Main server file
│   └── package.json       # Backend dependencies
├── frontend/              # React frontend
│   ├── public/
│   │   └── img/          # Logo and branding images
│   ├── src/
│   │   ├── components/   # React components
│   │   │   ├── Login.js
│   │   │   ├── Dashboard.js
│   │   │   ├── TodoPage.js
│   │   │   └── ProtectedRoute.js
│   │   ├── App.js
│   │   └── index.js
│   └── package.json       # Frontend dependencies
├── img/                   # Original image assets
├── index.html            # Original static homepage
├── TODO.md               # Project TODO and ideas
```

## Setup Instructions


### Prerequisites

- Node.js (v14 or higher)
- npm


### Installation


1. **Clone the repository** (if not already cloned)
1. **Install Backend Dependencies**
1. **Install Frontend Dependencies**

```bash
git clone https://github.com/patrickmcsweeney81/EVisionBetSite.git
cd EVisionBetSite
```

1. **Install Backend Dependencies**

```bash
cd backend
npm install
```

1. **Install Frontend Dependencies**


```bash
cd ../frontend
npm install
```



## Running the Application

You need to run both the backend and frontend servers:

### Start the Backend Server

```bash
cd backend
npm start
```

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
