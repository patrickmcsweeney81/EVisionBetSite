# DNS Setup Guide: Connecting Namecheap Domain to Netlify

## Your Current Setup
- **Frontend:** https://evisionbetsite.netlify.app (deployed)
- **Backend:** https://evisionbetsite.onrender.com (deployed)
- **Target Domain:** Your Namecheap domain (e.g., evisionbet.com)

## Quick Setup Steps

### Step 1: Add Domain in Netlify (5 minutes)

1. Go to **Netlify Dashboard**: https://app.netlify.com
2. Click your site: **evisionbetsite**
3. Go to **Domain settings** (in left sidebar)
4. Click **Add custom domain**
5. Enter your Namecheap domain: `evisionbet.com`
6. Click **Verify** → **Add domain**

### Step 2: Choose DNS Method

**🔹 Method A: Use Netlify DNS (RECOMMENDED - Automatic SSL)**

This is easier and Netlify handles everything including SSL.

1. In Netlify Domain settings, click **Use Netlify DNS**
2. Netlify shows you **4 nameservers**, like:
   ```
   dns1.p01.nsone.net
   dns2.p01.nsone.net
   dns3.p01.nsone.net
   dns4.p01.nsone.net
   ```
3. Copy these nameservers

4. **In Namecheap:**
   - Login to namecheap.com
   - Go to **Domain List** → Click **Manage** on your domain
   - Scroll to **Nameservers** section
   - Select **Custom DNS**
   - Paste all 4 Netlify nameservers
   - Click **Save** (green checkmark)

5. Wait 24-48 hours for DNS propagation (usually faster, 1-2 hours)

**🔹 Method B: Use Namecheap DNS (Manual Setup)**

1. **In Namecheap:**
   - Login → Domain List → Manage your domain
   - Click **Advanced DNS** tab

2. **Delete existing records:**
   - Remove any A Records pointing to old hosting
   - Remove any CNAME for @ or www

3. **Add these records:**
   
   | Type | Host | Value | TTL |
   |------|------|-------|-----|
   | A Record | @ | 75.2.60.5 | Automatic |
   | CNAME | www | evisionbetsite.netlify.app | Automatic |

4. Click **Save All Changes**

5. **In Netlify:**
   - Go back to Domain settings
   - Click **Verify DNS configuration**
   - Netlify will provision SSL automatically (takes 24 hours)

### Step 3: Verify Everything Works

After DNS propagates (check status at https://dnschecker.org):

1. **Test your domain:**
   - Visit `https://evisionbet.com`
   - Visit `https://www.evisionbet.com`
   - Both should redirect to your site with SSL (🔒)

2. **Test login:**
   - Username: `EVision`
   - Password: `PattyMac`

3. **Check SSL certificate:**
   - Click the padlock in browser
   - Should show "Let's Encrypt" certificate

## Troubleshooting

### DNS Not Working Yet?
- DNS changes take 1-48 hours to propagate
- Check status: https://dnschecker.org (enter your domain)
- Clear browser cache: Ctrl+Shift+Delete

### SSL Certificate Not Showing?
- Wait 24 hours after DNS verification
- In Netlify: Domain settings → HTTPS → **Verify DNS configuration**
- Netlify auto-provisions Let's Encrypt certificates

### Site Shows 404?
- Check Netlify deployment status
- Verify domain is added in Netlify Domain settings
- Check DNS records are correct

### Login Not Working?
- Your backend CORS is already configured for `evisionbet.com`
- If issues persist, clear browser cookies

## What's Already Configured

✅ **Backend CORS** - Already allows:
- `http://localhost:3000` (development)
- `https://evisionbetsite.netlify.app` (current)
- `https://evisionbet.com` (your domain)
- `https://www.evisionbet.com` (www subdomain)

✅ **Frontend Build** - Environment variable points to Render backend

✅ **Backend Deployed** - Running on Render with proper credentials

## After DNS Setup

Once your custom domain works:

1. **Optional:** Remove the Netlify subdomain redirect
   - In Netlify: Domain settings → **evisionbetsite.netlify.app** → Options → Remove

2. **Update bookmarks** to use your custom domain

3. **Share your site** with your custom domain!

## Need Help?

- **DNS Propagation Check:** https://dnschecker.org
- **Netlify Docs:** https://docs.netlify.com/domains-https/custom-domains/
- **Namecheap Support:** https://www.namecheap.com/support/

---

**Next Steps:**
1. Choose DNS method (Netlify DNS recommended)
2. Update nameservers in Namecheap
3. Wait for propagation (check dnschecker.org)
4. Verify SSL and login work
