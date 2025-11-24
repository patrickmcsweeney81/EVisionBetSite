# Deployment Guide for BET EVision

This guide will help you deploy the BET EVision application to make it accessible on evisionbet.com.

## Overview

The application consists of two parts that need to be deployed:
1. **Backend (Node.js/Express)** - Needs a Node.js hosting service
2. **Frontend (React)** - Can be deployed as static files to any web hosting

## Prerequisites

- [ ] Domain name (evisionbet.com) with access to DNS settings
- [ ] Hosting account that supports Node.js (for backend)
- [ ] Web hosting or static site hosting (for frontend)
- [ ] SSL certificate (for HTTPS)

## Deployment Options

### Option 1: Simple Hosting (Recommended for Beginners)

#### Backend Deployment Services (Choose One):
- **Heroku** (free tier available) - https://www.heroku.com
- **Railway** (free tier available) - https://railway.app
- **Render** (free tier available) - https://render.com
- **DigitalOcean App Platform** - https://www.digitalocean.com/products/app-platform

#### Frontend Deployment Services (Choose One):
- **Vercel** (free for personal projects) - https://vercel.com
- **Netlify** (free tier available) - https://www.netlify.com
- **GitHub Pages** - https://pages.github.com
- **Cloudflare Pages** - https://pages.cloudflare.com

### Option 2: VPS Hosting (For More Control)
- **DigitalOcean Droplet**
- **AWS EC2**
- **Linode**
- **Vultr**

## Step-by-Step Deployment

### Part 1: Deploy Backend (Using Heroku as Example)

#### 1. Prepare Backend for Deployment

```bash
cd backend
```

Create a `Procfile` in the backend directory:
```
web: node server.js
```

Update `package.json` to specify Node version:
```json
{
  "engines": {
    "node": "18.x"
  }
}
```

#### 2. Deploy to Heroku

```bash
# Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli
heroku login
heroku create evisionbet-api

# Set environment variables
heroku config:set SESSION_SECRET=your-very-long-random-secret-string

# Deploy
git subtree push --prefix backend heroku main

# Your backend will be at: https://evisionbet-api.herokuapp.com
```

#### 3. Update Backend for Production

After deployment, your backend URL will be something like:
- `https://evisionbet-api.herokuapp.com`

### Part 2: Deploy Frontend (Using Netlify as Example)

#### 1. Update Frontend Configuration

Create `.env.production` in the frontend directory:
```
REACT_APP_API_URL=https://evisionbet-api.herokuapp.com
```

Update API calls to use environment variable. Edit `frontend/src/components/Login.js`:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

// Update fetch calls to use API_URL
const response = await fetch(`${API_URL}/api/login`, {
  // ... rest of the code
});
```

Do the same for all other API calls in:
- `frontend/src/App.js`
- `frontend/src/components/TodoPage.js`
- `frontend/src/components/Dashboard.js`

#### 2. Build Frontend

```bash
cd frontend
npm run build
```

This creates a `build/` directory with optimized production files.

#### 3. Deploy to Netlify

**Option A: Using Netlify CLI**
```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=build
```

**Option B: Using Netlify Website**
1. Go to https://app.netlify.com
2. Drag and drop the `build` folder
3. Your site will be deployed with a random URL

#### 4. Configure Custom Domain

In Netlify dashboard:
1. Go to Domain Settings
2. Add custom domain: `evisionbet.com`
3. Follow DNS configuration instructions
4. Netlify will automatically provision SSL certificate

### Part 3: Update DNS Settings

Point your domain to the deployed frontend:

**For Netlify:**
Add CNAME record:
```
Name: www
Value: your-site-name.netlify.app
```

Add A record for root domain:
```
Name: @
Value: 75.2.60.5 (Netlify's load balancer)
```

### Part 4: Configure Backend CORS

Update `backend/server.js` to allow your production domain:

```javascript
app.use(cors({
  origin: 'https://evisionbet.com',
  credentials: true
}));
```

If using both www and non-www:
```javascript
app.use(cors({
  origin: ['https://evisionbet.com', 'https://www.evisionbet.com'],
  credentials: true
}));
```

### Part 5: Enable HTTPS and Secure Cookies

Update `backend/server.js` session configuration:

```javascript
app.use(session({
  secret: process.env.SESSION_SECRET || 'evisionbet-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Enable for HTTPS
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: 'none' // Required for cross-origin cookies
  }
}));
```

## Quick Deployment Checklist

- [ ] Deploy backend to hosting service
- [ ] Note backend URL (e.g., `https://evisionbet-api.herokuapp.com`)
- [ ] Update frontend API URLs to use production backend
- [ ] Build frontend (`npm run build`)
- [ ] Deploy frontend build folder
- [ ] Configure custom domain DNS
- [ ] Update backend CORS to allow production domain
- [ ] Enable secure cookies in backend (secure: true)
- [ ] Test login functionality on production site
- [ ] Verify TODO page loads correctly

## Alternative: All-in-One VPS Deployment

If you prefer hosting everything on one server:

### Using DigitalOcean Droplet

1. **Create a Droplet** (Ubuntu 22.04)
2. **Install Node.js**:
   ```bash
   curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
   sudo apt-get install -y nodejs
   ```

3. **Install Nginx**:
   ```bash
   sudo apt install nginx
   ```

4. **Clone and setup**:
   ```bash
   git clone https://github.com/patrickmcsweeney81/EVisionBetSite.git
   cd EVisionBetSite/backend
   npm install
   ```

5. **Setup PM2** (process manager):
   ```bash
   sudo npm install -g pm2
   pm2 start server.js --name evisionbet-backend
   pm2 startup
   pm2 save
   ```

6. **Build Frontend**:
   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

7. **Configure Nginx** to serve frontend and proxy backend
8. **Setup SSL** with Let's Encrypt certbot

## Testing Deployment

After deployment, test:
1. Visit https://evisionbet.com
2. Try logging in (EVison / PattyMac)
3. Navigate to dashboard
4. Check TODO page loads
5. Test logout

## Troubleshooting

### Common Issues:

**CORS errors:**
- Verify backend CORS allows your frontend domain
- Check that credentials: true is set in both frontend and backend

**Login not working:**
- Check browser console for errors
- Verify backend API URL is correct
- Ensure cookies are being set (check browser dev tools > Application > Cookies)

**Build fails:**
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version matches requirements

## Cost Estimate

**Free Tier Option:**
- Heroku/Railway/Render backend: $0 (with limitations)
- Netlify/Vercel frontend: $0
- Total: **$0/month**

**Basic Paid Option:**
- VPS (DigitalOcean): $6-12/month
- Domain + SSL: Included with most hosting
- Total: **$6-12/month**

## Next Steps After Deployment

1. Set up monitoring (e.g., UptimeRobot)
2. Configure backups
3. Implement proper authentication (database-backed users)
4. Add analytics (Google Analytics, Plausible)
5. Set up CI/CD for automatic deployments

## Need Help?

- Each hosting provider has detailed documentation
- Most offer free trials to test deployment
- Consider starting with Netlify (frontend) + Render (backend) for easiest setup

## Security Reminders

Before going live:
- [ ] Change session secret to a strong random string
- [ ] Enable HTTPS (secure: true for cookies)
- [ ] Add rate limiting
- [ ] Implement proper user authentication
- [ ] Regular security updates

---

For questions or issues, refer to the hosting provider's documentation or reach out for help.
