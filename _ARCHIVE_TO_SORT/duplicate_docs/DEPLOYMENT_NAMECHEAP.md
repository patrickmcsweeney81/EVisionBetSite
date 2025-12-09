# Deploying to Namecheap Hosting

Since you already have hosting through Namecheap, here's how to deploy your BET EVision application.

## Understanding Your Setup

Namecheap typically provides:
- **Shared hosting** (cPanel with PHP/MySQL)
- **Domain registration** (evisionbet.com)
- **Static file hosting**

**Important**: Standard Namecheap shared hosting doesn't support Node.js for the backend. You have two options:

## Option 1: Hybrid Approach (Recommended)

Deploy backend separately, use Namecheap for frontend.

### Backend: Deploy to Free Node.js Hosting

Choose one of these free services for your backend:

**Railway (Recommended - Easy Setup)**
1. Sign up at https://railway.app
2. Create new project → Deploy from GitHub
3. Select your repository
4. Railway auto-detects the backend folder
5. Your backend URL: `https://your-app.railway.app`

**Render**
1. Sign up at https://render.com
2. New → Web Service
3. Connect GitHub repository
4. Root directory: `backend`
5. Build command: `npm install`
6. Start command: `npm start`
7. Your backend URL: `https://your-app.onrender.com`

### Frontend: Deploy to Namecheap

#### Step 1: Build the Frontend

On your computer:
```bash
cd frontend

# Create production environment file
echo "REACT_APP_API_URL=https://your-backend-url.railway.app" > .env.production

# Build the app
npm run build
```

This creates a `build/` folder with static files.

#### Step 2: Upload to Namecheap via cPanel

1. **Login to cPanel**
   - Go to namecheap.com → Your account → Hosting List
   - Click "Manage" → Go to cPanel

2. **Access File Manager**
   - In cPanel, click "File Manager"
   - Navigate to `public_html` folder

3. **Backup Original Files**
   - Download your current `index.html` to your computer
   - You can restore it anytime if needed

4. **Upload Built Files**
   - Click "Upload" button
   - Upload ALL files from `frontend/build/` folder
   - Or use an FTP client like FileZilla for faster upload

5. **File Structure Should Look Like:**
   ```
   public_html/
   ├── index.html (new React app)
   ├── static/
   │   ├── css/
   │   ├── js/
   │   └── media/
   ├── img/
   │   ├── bet-evision-horizontal.png
   │   └── bet-evision-square.png
   ├── manifest.json
   ├── robots.txt
   └── favicon.ico
   ```

#### Step 3: Update Backend CORS

Update `backend/server.js` to allow your domain:

```javascript
app.use(cors({
  origin: ['https://evisionbet.com', 'https://www.evisionbet.com'],
  credentials: true
}));
```

Redeploy your backend after this change.

#### Step 4: Test Your Site

Visit https://evisionbet.com - you should see your login page!

## Option 2: Upgrade Namecheap to Node.js Hosting

Namecheap offers VPS hosting that supports Node.js.

### VPS Requirements
- Namecheap VPS Hosting (~$12/month)
- Full control over server
- Can run both frontend and backend on same server

### VPS Setup Overview
1. Order VPS from Namecheap
2. SSH into server
3. Install Node.js
4. Install Nginx (web server)
5. Deploy both frontend and backend
6. Configure Nginx to serve frontend and proxy backend
7. Setup SSL certificate (free with Let's Encrypt)

**Note**: This requires technical knowledge of Linux server administration.

## Option 3: Keep Shared Hosting, Use Subdomain for Backend

If you want to keep backend separate:

1. **Deploy backend** to Railway/Render (as in Option 1)
2. **Use Namecheap shared hosting** for frontend only
3. **Optional**: Set up subdomain
   - Create `api.evisionbet.com` pointing to backend service
   - Makes URLs cleaner: `https://api.evisionbet.com/api/login`

## Detailed Upload Instructions (FTP Method)

If uploading via File Manager is slow:

### Using FileZilla (Free FTP Client)

1. **Get FTP Credentials from Namecheap**
   - cPanel → Accounts → FTP Accounts
   - Or check welcome email from Namecheap

2. **Download FileZilla**
   - Get from https://filezilla-project.org

3. **Connect to Your Site**
   - Host: `ftp.evisionbet.com` (or IP from Namecheap)
   - Username: Your FTP username
   - Password: Your FTP password
   - Port: 21

4. **Upload Files**
   - Left side: Local computer (navigate to `frontend/build/`)
   - Right side: Remote server (navigate to `public_html/`)
   - Select all files in build folder → Right-click → Upload

## SSL Certificate (HTTPS)

Namecheap provides free SSL:

1. **In Namecheap Dashboard**
   - Go to SSL certificates
   - Activate free Positive SSL

2. **Or Use cPanel**
   - cPanel → Security → SSL/TLS
   - Enable AutoSSL (free)

3. **Force HTTPS**
   - Create `.htaccess` file in `public_html/`:
   ```apache
   RewriteEngine On
   RewriteCond %{HTTPS} off
   RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
   ```

## Environment Variables

**Frontend** (handled during build):
```bash
# .env.production
REACT_APP_API_URL=https://your-backend-url.railway.app
```

**Backend** (set in Railway/Render):
```bash
SESSION_SECRET=your-very-long-random-secret-string-here
FRONTEND_URL=https://evisionbet.com
NODE_ENV=production
```

## Quick Deployment Checklist

- [ ] Build frontend with correct backend URL
- [ ] Upload build files to Namecheap public_html
- [ ] Deploy backend to Railway or Render
- [ ] Update backend CORS to allow evisionbet.com
- [ ] Enable SSL certificate on Namecheap
- [ ] Test login at https://evisionbet.com
- [ ] Verify TODO page loads correctly

## Troubleshooting

### Login Not Working
- Check browser console for errors
- Verify backend URL in .env.production is correct
- Check backend CORS allows your domain
- Ensure cookies work (sameSite: 'none' in backend)

### Files Not Updating
- Clear browser cache (Ctrl+F5)
- Check you uploaded to correct folder
- Verify index.html was replaced

### Backend Connection Issues
- Test backend directly: Visit `https://your-backend-url.railway.app/api/check-auth`
- Should return: `{"authenticated":false}`
- If error, check backend logs

## Updating Your Site

After making changes:

1. **Frontend Changes**:
   ```bash
   cd frontend
   npm run build
   # Upload new build/ folder to Namecheap
   ```

2. **Backend Changes**:
   - Push to GitHub
   - Railway/Render auto-deploys
   - Or manually trigger deployment

## Cost Breakdown

**Option 1 (Recommended)**:
- Backend (Railway/Render): $0 (free tier)
- Frontend (Namecheap): Already paid
- Domain: Already paid
- **Total New Cost: $0/month**

**Option 2 (VPS)**:
- Namecheap VPS: ~$12/month
- Everything on one server
- More control, more maintenance

## Need Help?

- Namecheap Support: 24/7 live chat
- Railway Docs: https://docs.railway.app
- Render Docs: https://render.com/docs

## Alternative: Keep Static Site, Add App Subdomain

If you want to keep your current site at evisionbet.com:

1. Keep existing index.html at root
2. Create subdomain: `app.evisionbet.com`
3. Deploy React app to subdomain
4. Link from main site to app

This way you can have both the static site and the app!