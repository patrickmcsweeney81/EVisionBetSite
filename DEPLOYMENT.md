# Deployment Guide for BET EVision

This guide will help you deploy the BET EVision application to make it accessible on evisionbet.com.


## 📋 Quick Start

**Recommended Setup (Automated):**
- **Backend:** Render (free tier, auto-deploy from GitHub)
- **Frontend:** Netlify (free tier, auto-deploy from GitHub)

**Already have hosting?**
- **Namecheap hosting?** → See [DEPLOYMENT_NAMECHEAP.md](./DEPLOYMENT_NAMECHEAP.md) for specific instructions
- **Other shared hosting?** → Follow the Namecheap guide, it applies to most shared hosting

---

## Overview

The application consists of two parts that need to be deployed:
1. **Backend (Node.js/Express)** - Needs a Node.js hosting service
2. **Frontend (React)** - Can be deployed as static files to any web hosting

## Prerequisites

- [ ] Domain name (evisionbet.com) with access to DNS settings
- [ ] Hosting account that supports Node.js (for backend) OR use free services below
- [ ] Web hosting or static site hosting (for frontend) OR use free services below
- [ ] SSL certificate (for HTTPS) - usually free with hosting


## Deployment Options

### Option 1: Automated (Recommended)

- **Backend:** Render (auto-deploy from GitHub via GitHub Actions)
- **Frontend:** Netlify (auto-deploy from GitHub via GitHub Actions)

### Option 2: Manual/Other
- See Namecheap or other shared hosting instructions

---

## Step-by-Step Deployment


### Part 1: Deploy Backend (Automated with Render)

1. Create a free Render account and connect your GitHub repo.
2. Set up your backend as a "Web Service" with root directory `backend`.
3. Set your Render API key and service ID as GitHub secrets (`RENDER_API_KEY`, `RENDER_SERVICE_ID`).
4. GitHub Actions will auto-deploy on every push to main or copilot/scaffold-react-node-app (see `.github/workflows/deploy-backend-render.yml`).
5. Your backend URL will look like: `https://your-app.onrender.com`

---


### Part 2: Deploy Frontend (Automated with Netlify)

1. Create a free Netlify account and connect your GitHub repo.
2. Set your Netlify auth token and site ID as GitHub secrets (`NETLIFY_AUTH_TOKEN`, `NETLIFY_SITE_ID`).
3. GitHub Actions will auto-build and deploy on every push to main or copilot/scaffold-react-node-app (see `.github/workflows/deploy-frontend-netlify.yml`).
4. Your frontend URL will look like: `https://your-site-name.netlify.app` (or your custom domain).

---


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

Netlify will automatically provision SSL for your domain.


### Part 4: Configure Backend CORS

Update `backend/server.js` to allow your production domain:

```javascript
app.use(cors({
  origin: ['https://evisionbet.com', 'https://www.evisionbet.com', 'https://your-site-name.netlify.app'],
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

- [ ] Backend auto-deploys to Render on every push
- [ ] Frontend auto-builds and deploys to Netlify on every push
- [ ] Set API URLs in `frontend/.env.production`
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
