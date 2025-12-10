# Logo Fetching Script

This script downloads bookmaker logos from Logo.dev API and saves them locally.

## Quick Start

```bash
# Run from project root
node scripts/fetch-logos.js
```

## What it does

1. **Fetches logos** for all 52 bookmakers from Logo.dev API
2. **Saves to** `public/logos/bookmakers/` (SVG format)
3. **Generates** updated `frontend/src/utils/bookmakerLogos.js` with local paths
4. **Provides fallbacks** for any failed downloads (auto-generated initials)

## Requirements

- Node.js 14+ (uses built-in `https` module)
- Internet connection to Logo.dev API
- ~10 seconds to complete

## Output

```
public/logos/bookmakers/
├── pinnacle.svg
├── betfair.svg
├── draftkings.svg
└── ... (48 more)

frontend/src/utils/bookmakerLogos.js (updated with local paths)
```

## After running

```bash
# Stage the new logos
git add public/logos/

# Stage the updated mapping
git add frontend/src/utils/bookmakerLogos.js

# Commit
git commit -m "feat: download and cache bookmaker logos locally"

# Push to deploy
git push
```

## Notes

- Logos are cached locally, no runtime API dependency
- Fallback SVG still works if a logo fails to download
- Re-run script to update logos anytime
- Logos are ~2-5MB total (negligible storage cost)

## Troubleshooting

**"Command not found: node"**
- Install Node.js from https://nodejs.org/

**"EACCES: permission denied"** (Mac/Linux)
- Run: `chmod +x scripts/fetch-logos.js`
- Or: `sudo node scripts/fetch-logos.js`

**"ECONNREFUSED"** 
- Check internet connection
- Verify Logo.dev API is accessible: `curl https://api.logo.dev/logo?company=pinnacle&format=svg`
