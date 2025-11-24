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

```
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
└── README.md             # This file
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm

### Installation

1. **Clone the repository** (if not already cloned)
```bash
git clone https://github.com/patrickmcsweeney81/EVisionBetSite.git
cd EVisionBetSite
```

2. **Install Backend Dependencies**
```bash
cd backend
npm install
```

3. **Install Frontend Dependencies**
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

The backend will run on `http://localhost:3001`

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

4. **Logout**: Click the logout button in the navigation bar

## Development

### Backend API Endpoints

- `POST /api/login` - Authenticate user
- `POST /api/logout` - End user session
- `GET /api/check-auth` - Check authentication status
- `GET /api/todo` - Get TODO.md content (protected route)

### Frontend Routes

- `/` - Login page
- `/dashboard` - Protected dashboard (requires authentication)
- `/todo` - Protected TODO/Ideas page (requires authentication)

## Original Static Site

The original `index.html` file is preserved at the root level and can be viewed by opening it directly in a browser.

## Security Considerations

⚠️ **This is a development scaffold** - The current implementation includes several security considerations for local development:

### Current Limitations (Development Only)
- **Hardcoded credentials** - Username and password are hardcoded in the backend
- **No HTTPS** - Cookies are sent over HTTP (secure: false)
- **No CSRF protection** - Session middleware lacks CSRF token validation
- **No rate limiting** - API endpoints are not rate-limited
- **Session secret** - Using a hardcoded session secret

### Production Requirements
Before deploying to production, implement:
- ✅ Database-backed user authentication
- ✅ Environment variables for secrets and credentials
- ✅ HTTPS with secure cookies (secure: true)
- ✅ CSRF protection middleware
- ✅ Rate limiting on all API endpoints
- ✅ Input validation and sanitization
- ✅ Proper error handling and logging
- ✅ Security headers (helmet.js)

See `TODO.md` for additional security improvements.

## Future Enhancements

See `TODO.md` for a complete list of planned features and improvements.

## License

ISC

## Author

Patrick McSweeney
