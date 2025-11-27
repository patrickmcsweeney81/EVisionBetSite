# Production Deployment Checklist

## Pre-Deployment

### Backend
- [ ] All tests passing: `pytest backend-python/tests/ -v`
- [ ] Environment variables documented
- [ ] Database migrations generated and tested locally
- [ ] Secret key generated (32+ random characters)
- [ ] Dependencies updated in `requirements.txt`
- [ ] `.env.example` created with all required vars
- [ ] Redis configured or in-memory fallback verified
- [ ] Bot CSV path configured correctly

### Frontend
- [ ] All tests passing: `npm test`
- [ ] Build succeeds locally: `npm run build`
- [ ] API_URL environment variable set
- [ ] No console errors in production build
- [ ] Images optimized in `/img` directory
- [ ] Service worker configured (if using)

### Documentation
- [ ] README updated with setup instructions
- [ ] DEPLOYMENT.md reviewed and current
- [ ] API endpoints documented
- [ ] Migration guide complete

## Deployment Steps

### Render Backend

1. **Create Web Service**
   - [ ] Name: `evisionbet-api`
   - [ ] Branch: `main`
   - [ ] Build command set
   - [ ] Start command set

2. **Add PostgreSQL**
   - [ ] Database created
   - [ ] Internal URL copied to `DATABASE_URL`

3. **Environment Variables**
   - [ ] All vars from `.env.example` added
   - [ ] `SECRET_KEY` set to strong random value
   - [ ] `ALLOWED_ORIGINS` includes production URLs
   - [ ] `ODDS_API_KEY` configured

4. **Initial Deploy**
   - [ ] Deploy triggered
   - [ ] Build completes successfully
   - [ ] Service starts without errors

5. **Post-Deploy Setup**
   - [ ] Migrations run: `python manage.py migrate`
   - [ ] Admin user created: `python manage.py seed-default-user`
   - [ ] Health check passes: `/health` endpoint

### Netlify Frontend

1. **Site Setup**
   - [ ] Repository connected
   - [ ] Base directory: `frontend`
   - [ ] Build command: `npm run build`
   - [ ] Publish directory: `frontend/build`

2. **Environment Variables**
   - [ ] `REACT_APP_API_URL` set to backend URL
   - [ ] Manual redeploy triggered after setting

3. **Build & Deploy**
   - [ ] Initial build succeeds
   - [ ] Site accessible
   - [ ] No JavaScript errors in console

4. **Domain Configuration** (Optional)
   - [ ] Custom domain added
   - [ ] DNS records configured
   - [ ] SSL certificate active

## Post-Deployment Verification

### Backend
- [ ] Health endpoint returns healthy: `curl https://api.yourdomain.com/health`
- [ ] Version endpoint accessible: `curl https://api.yourdomain.com/version`
- [ ] Database connected (check health response)
- [ ] Cache operational (Redis or memory)
- [ ] Login works: Test `/api/auth/login`
- [ ] Protected routes require auth
- [ ] Odds endpoints return data
- [ ] EV endpoints accessible
- [ ] WebSocket connects: `ws://api.yourdomain.com/ws/live`

### Frontend
- [ ] Site loads without errors
- [ ] Login successful with test user
- [ ] Dashboard renders correctly
- [ ] Odds page fetches data
- [ ] TODO page displays content
- [ ] Logout works
- [ ] Protected routes redirect when not logged in
- [ ] Mobile responsive
- [ ] Images load correctly

### Integration
- [ ] Frontend connects to backend
- [ ] CORS working (no browser errors)
- [ ] API calls succeed
- [ ] JWT authentication functional
- [ ] Real-time data (if bot running)

## Monitoring Setup

- [ ] Uptime monitor configured (UptimeRobot, etc.)
- [ ] Ping `/health` every 5 minutes to prevent sleep
- [ ] Error alerting enabled
- [ ] Log aggregation reviewed (Render logs)
- [ ] Performance monitoring baseline established

## Security Verification

- [ ] HTTPS enforced on all domains
- [ ] CORS limited to production origins only
- [ ] No secrets in code or public repos
- [ ] Admin password changed from default
- [ ] Database uses internal connection string
- [ ] Rate limiting considered (add if needed)
- [ ] Input validation tested
- [ ] SQL injection prevention verified
- [ ] XSS protection in place

## Performance Testing

- [ ] Initial page load < 3 seconds
- [ ] API response times < 500ms
- [ ] Large lists paginated
- [ ] Images lazy-loaded
- [ ] Cache headers set correctly
- [ ] CDN enabled for static assets
- [ ] Database queries optimized

## Backup Strategy

- [ ] Database backup schedule confirmed (Render auto-backup)
- [ ] Manual backup procedure documented
- [ ] Bot data CSV backed up (if persistent)
- [ ] Environment variables documented securely
- [ ] Rollback procedure tested

## Documentation

- [ ] README updated with production URLs
- [ ] Environment variables list complete
- [ ] Deployment guide accurate
- [ ] API documentation current
- [ ] Troubleshooting section complete
- [ ] Team access documented

## Communication

- [ ] Stakeholders notified of deployment
- [ ] Production URLs shared
- [ ] Known issues documented
- [ ] Support contact information provided
- [ ] Maintenance window scheduled (if needed)

## Post-Launch Monitoring (First 24 Hours)

- [ ] Monitor error rates
- [ ] Check response times
- [ ] Review logs for issues
- [ ] Verify uptime
- [ ] Test all critical paths
- [ ] Collect user feedback
- [ ] Address any immediate issues

## Rollback Plan (If Needed)

1. **Frontend Rollback**
   - [ ] Previous Netlify deploy identified
   - [ ] Rollback procedure: Netlify → Deploys → Publish previous

2. **Backend Rollback**
   - [ ] Previous commit SHA noted
   - [ ] Rollback procedure: Render → Manual Deploy → Previous SHA

3. **Database Rollback**
   - [ ] Migration downgrade: `python manage.py migrate <prev_revision>`
   - [ ] Backup restoration procedure ready

## Success Criteria

- [ ] Site accessible at production URL
- [ ] No critical errors in logs
- [ ] User login/signup works
- [ ] Core features functional
- [ ] Performance acceptable
- [ ] Monitoring active
- [ ] Team has access
- [ ] Documentation complete

---

**Deployment Date:** _______________  
**Deployed By:** _______________  
**Version:** _______________  
**Notes:**
