# Logo API Documentation

## Overview

This document provides a comprehensive list of APIs and resources used for fetching bookmaker logos in the BET EVision platform.

## Logo.dev API

### Service Information
- **Provider:** Logo.dev
- **Website:** https://logo.dev
- **API Endpoint:** `https://img.logo.dev/{domain}`
- **Purpose:** Fetch high-quality company logos based on domain names

### API Usage

#### Basic URL Format
```
https://img.logo.dev/{domain}?format={format}&size={size}&theme={theme}
```

#### Query Parameters
- `format`: Image format (`png`, `svg`, `jpeg`)
- `size`: Logo size in pixels (e.g., `96`, `128`, `256`)
- `theme`: Color theme (`light`, `dark`)
- `retina`: High DPI support (`true`, `false`)
- `token`: Optional publishable API key for authenticated requests

#### Example API Calls
```bash
# PNG format, 96px size
https://img.logo.dev/pinnacle.com?format=png&size=96

# SVG format with API token
https://img.logo.dev/betfair.com?format=svg&size=96&token=pk_YOUR_TOKEN

# Retina display support
https://img.logo.dev/draftkings.com?format=png&size=96&theme=light&retina=true
```

### Authentication
- **Publishable Keys:** Can be used in frontend code (format: `pk_...`)
- **Secret Keys:** Must be kept server-side only (format: `sk_...`)
- **Free Tier:** Limited requests without authentication
- **Rate Limiting:** ~100ms delay recommended between requests

## Bookmaker Logo Domains

### Complete List of Supported Bookmakers (52 total)

#### Tier 4⭐ (Premium/Sharp Books)
```javascript
{
  'Pinnacle': 'pinnacle.com',
  'Betfair_EU': 'betfair.com',
  'Draftkings': 'draftkings.com',
  'Fanduel': 'fanduel.com'
}
```

#### Tier 3⭐ (Major Books)
```javascript
{
  'Betfair_AU': 'betfair.com.au',
  'Betfair_UK': 'betfair.co.uk',
  'Betmgm': 'betmgm.com',
  'Betrivers': 'betrivers.com',
  'Betsson': 'betsson.com',
  'Marathonbet': 'marathonbet.com',
  'Lowvig': 'lowvig.com'
}
```

#### Tier 2⭐ (Regional Books)
```javascript
{
  'Nordicbet': 'nordicbet.com',
  'Mybookie': 'mybookie.ag',
  'Betonline': 'betonline.ag',
  'Bovada': 'bovada.lv'
}
```

#### Tier 1⭐ - Australian Market
```javascript
{
  'Sportsbet': 'sportsbet.com.au',
  'Pointsbet': 'pointsbet.com',
  'Tab': 'tab.com.au',
  'Tabtouch': 'tab.com.au',
  'Unibet_AU': 'unibet.com.au',
  'Ladbrokes_AU': 'ladbrokes.com.au',
  'Neds': 'neds.com.au',
  'Betr': 'betr.com.au',
  'Boombet': 'boombet.com.au'
}
```

#### Tier 1⭐ - US Market
```javascript
{
  'Williamhill_US': 'williamhill.us',
  'Sbk': 'sbk.com',
  'Fanatics': 'fanatics.com',
  'Ballybet': 'ballybet.com',
  'Betparx': 'betparx.com',
  'Espnbet': 'espnbet.com',
  'Fliff': 'fliff.com',
  'Hardrockbet': 'hardrockbet.com',
  'Rebet': 'rebet.com'
}
```

#### Tier 1⭐ - UK Market
```javascript
{
  'Williamhill_UK': 'williamhill.co.uk',
  'Betvictor': 'betvictor.com',
  'Coral': 'coral.co.uk',
  'Skybet': 'skybet.com',
  'Paddypower': 'paddypower.com',
  'Boylesports': 'boylesports.com',
  'Betfred': 'betfred.com'
}
```

#### Tier 1⭐ - European Market
```javascript
{
  'Bwin': 'bwin.com',
  'Williamhill_EU': 'williamhill.eu',
  'Codere': 'codere.com',
  'Tipico': 'tipico.com',
  'Leovegas': 'leovegas.com',
  'Parionssport': 'parionssport.fr',
  'Winamax_FR': 'winamax.fr',
  'Winamax_DE': 'winamax.de',
  'Unibet_FR': 'unibet.fr',
  'Unibet_NL': 'unibet.nl',
  'Unibet_SE': 'unibet.se',
  'Betclic': 'betclic.com'
}
```

## API Keys Reference

The following bookmakers have dedicated API keys configured:

```javascript
{
  'Pinnacle': 'pk_HxFs1P6JRx62zWtMv_oq7g',
  'Sportsbet': 'pk_ACZ0pjTZRCOhx85alcjew',
  'Betfair_EU': 'pk_J1YM3orISmGgTEqow1GG2A',
  'Betfair_AU': 'pk_J1YM3orISmGgTEqow1GG2A',
  'Betfair_UK': 'pk_J1YM3orISmGgTEqow1GG2A',
  'Draftkings': 'pk_ALAW8HDETZeISyRIcmbXUg'
}
```

**Note:** These are publishable keys (pk_*) and are safe to use in frontend code.

## Logo Fetching Scripts

### 1. fetch-logos.js
**Location:** `/scripts/fetch-logos.js`

**Purpose:** Downloads all bookmaker logos in SVG format from Logo.dev API

**Usage:**
```bash
cd /home/runner/work/EVisionBetSite/EVisionBetSite
node scripts/fetch-logos.js
```

**What it does:**
1. Fetches logos for all 52 bookmakers
2. Saves SVG files to `public/logos/bookmakers/`
3. Generates updated `frontend/src/utils/bookmakerLogos.js` with local paths
4. Provides fallback initials for failed downloads

**Output:**
- `public/logos/bookmakers/*.svg` - Logo files
- `frontend/src/utils/bookmakerLogos.js` - Updated mapping file

### 2. download-logos.js
**Location:** `/scripts/download-logos.js`

**Purpose:** Downloads and caches bookmaker logos locally in PNG format

**Usage:**
```bash
cd /home/runner/work/EVisionBetSite/EVisionBetSite
node scripts/download-logos.js
```

**What it does:**
1. Downloads logos from Logo.dev API in PNG format (96px, retina)
2. Caches logos to `frontend/public/logos/bookmakers/`
3. Generates `frontend/src/utils/bookmakerLogosLocal.js` with local paths
4. Skips existing cached files

**Output:**
- `frontend/public/logos/bookmakers/*.png` - Cached logo files
- `frontend/src/utils/bookmakerLogosLocal.js` - Local path mapping

## Frontend Integration

### Import and Usage

```javascript
// Import the logo utility
import { getBookmakerLogo, getBookmakerDisplayName } from '../utils/bookmakerLogos';

// Use in React component
<img 
  src={getBookmakerLogo('Pinnacle')} 
  alt={getBookmakerDisplayName('Pinnacle')}
  width="48" 
  height="48"
/>
```

### Fallback Mechanism

If a logo fails to load, the system automatically generates a fallback SVG with:
- Bookmaker initials (first 2 letters)
- Color-coded background based on name hash
- Consistent styling across the platform

Example fallback for "Pinnacle":
```
[PI] - displayed in a colored box
```

## Configuration

### Environment Variables

**Frontend (.env.local):**
```bash
# Optional: Global Logo.dev publishable key
REACT_APP_LOGODEV_PUBLISHABLE=pk_YOUR_KEY_HERE
```

**No backend configuration needed** - Logo fetching is handled client-side or via build scripts.

## API Rate Limits & Best Practices

1. **Rate Limiting:** Add 100ms delay between requests
2. **Caching:** Store downloaded logos locally to minimize API calls
3. **Fallbacks:** Always provide fallback UI for missing logos
4. **CDN:** Consider using a CDN for cached logos in production
5. **Lazy Loading:** Implement lazy loading for logo images

## File Locations

```
EVisionBetSite/
├── scripts/
│   ├── fetch-logos.js           # SVG logo downloader
│   ├── download-logos.js        # PNG logo downloader
│   └── README.md                # Scripts documentation
├── frontend/
│   ├── public/logos/bookmakers/ # Cached logo files (PNG)
│   └── src/utils/
│       ├── bookmakerLogos.js    # Main logo utility
│       └── bookmakerLogosLocal.js # Local cache mapping
└── public/logos/bookmakers/     # SVG logos (if using fetch-logos.js)
```

## Troubleshooting

### Common Issues

**1. API Request Fails (HTTP 404)**
- Domain may not exist in Logo.dev database
- Fallback will be used automatically

**2. Rate Limiting (HTTP 429)**
- Increase delay between requests
- Use API key for higher limits

**3. CORS Issues**
- Logo.dev API supports CORS
- If issues persist, download and cache logos locally

**4. Missing Logos**
- Run `node scripts/download-logos.js` to cache all logos
- Fallback initials will display for any missing logos

## Additional Resources

- [Logo.dev Documentation](https://logo.dev/docs)
- [Logo.dev API Reference](https://logo.dev/docs/api)
- [Scripts README](/scripts/README.md)
- [Architecture Documentation](/docs/ARCHITECTURE.md)

## Future Improvements

- [ ] Implement automatic logo updates on schedule
- [ ] Add WebP format support for better compression
- [ ] Create admin panel for logo management
- [ ] Add logo quality monitoring
- [ ] Implement multi-CDN strategy for logo delivery

---

**Last Updated:** December 10, 2024  
**Maintained By:** BET EVision Development Team
