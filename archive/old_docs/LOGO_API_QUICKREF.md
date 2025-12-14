# Logo API Quick Reference

Quick reference guide for bookmaker logo APIs used in BET EVision.

## 🚀 Quick Start

### Download All Logos (Recommended)
```bash
# Download PNG logos (cached locally)
node scripts/download-logos.js

# OR download SVG logos
node scripts/fetch-logos.js
```

### Use in React Component
```javascript
import { getBookmakerLogo } from '../utils/bookmakerLogos';

<img src={getBookmakerLogo('Pinnacle')} alt="Pinnacle" />
```

## 📋 API Endpoints

### Logo.dev API
```
https://img.logo.dev/{domain}?format=png&size=96
```

**Example:**
```
https://img.logo.dev/pinnacle.com?format=png&size=96
```

## 🏢 Bookmaker List (52 Total)

| Region | Count | Examples |
|--------|-------|----------|
| **4⭐ Premium** | 4 | Pinnacle, Betfair, Draftkings, Fanduel |
| **3⭐ Major** | 7 | Betmgm, Betrivers, Betsson, Marathonbet |
| **2⭐ Regional** | 4 | Nordicbet, Mybookie, Betonline, Bovada |
| **1⭐ Australia** | 9 | Sportsbet, Pointsbet, Tab, Neds, Betr |
| **1⭐ US** | 9 | Fanatics, Espnbet, Ballybet, Fliff |
| **1⭐ UK** | 7 | Skybet, Coral, Paddypower, Betfred |
| **1⭐ Europe** | 12 | Bwin, Tipico, Leovegas, Winamax, Betclic |

### Complete Domain Mapping

```javascript
const DOMAINS = {
  // 4⭐ Premium
  'Pinnacle': 'pinnacle.com',
  'Betfair_EU': 'betfair.com',
  'Draftkings': 'draftkings.com',
  'Fanduel': 'fanduel.com',
  
  // 3⭐ Major
  'Betfair_AU': 'betfair.com.au',
  'Betfair_UK': 'betfair.co.uk',
  'Betmgm': 'betmgm.com',
  'Betrivers': 'betrivers.com',
  'Betsson': 'betsson.com',
  'Marathonbet': 'marathonbet.com',
  'Lowvig': 'lowvig.com',
  
  // 2⭐ Regional
  'Nordicbet': 'nordicbet.com',
  'Mybookie': 'mybookie.ag',
  'Betonline': 'betonline.ag',
  'Bovada': 'bovada.lv',
  
  // 1⭐ Australian
  'Sportsbet': 'sportsbet.com.au',
  'Pointsbet': 'pointsbet.com',
  'Tab': 'tab.com.au',
  'Tabtouch': 'tab.com.au',
  'Unibet_AU': 'unibet.com.au',
  'Ladbrokes_AU': 'ladbrokes.com.au',
  'Neds': 'neds.com.au',
  'Betr': 'betr.com.au',
  'Boombet': 'boombet.com.au',
  
  // 1⭐ US
  'Williamhill_US': 'williamhill.us',
  'Sbk': 'sbk.com',
  'Fanatics': 'fanatics.com',
  'Ballybet': 'ballybet.com',
  'Betparx': 'betparx.com',
  'Espnbet': 'espnbet.com',
  'Fliff': 'fliff.com',
  'Hardrockbet': 'hardrockbet.com',
  'Rebet': 'rebet.com',
  
  // 1⭐ UK
  'Williamhill_UK': 'williamhill.co.uk',
  'Betvictor': 'betvictor.com',
  'Coral': 'coral.co.uk',
  'Skybet': 'skybet.com',
  'Paddypower': 'paddypower.com',
  'Boylesports': 'boylesports.com',
  'Betfred': 'betfred.com',
  
  // 1⭐ European
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
};
```

## 🔑 API Keys (Publishable)

These are safe for frontend use:

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

## 📁 File Locations

```
scripts/
├── fetch-logos.js          # Download SVG logos
├── download-logos.js       # Download PNG logos
└── README.md               # Detailed script docs

frontend/
├── public/logos/bookmakers/  # Cached PNG logos
└── src/utils/
    ├── bookmakerLogos.js     # Main logo utility
    └── bookmakerLogosLocal.js # Local cache map

docs/
└── LOGO_APIS.md            # Complete API documentation
```

## 💡 Usage Examples

### Basic Usage
```javascript
import { getBookmakerLogo, getBookmakerDisplayName } from '../utils/bookmakerLogos';

// Get logo URL
const logoUrl = getBookmakerLogo('Draftkings');

// Get display name (removes region codes)
const name = getBookmakerDisplayName('Betfair_AU'); // Returns "Betfair"
```

### With Custom Size
```javascript
const logoUrl = getBookmakerLogo('Pinnacle', { size: 128 });
```

### Complete Example
```jsx
function BookmakerLogo({ name }) {
  return (
    <div className="bookmaker-logo">
      <img 
        src={getBookmakerLogo(name)} 
        alt={getBookmakerDisplayName(name)}
        width="48"
        height="48"
      />
      <span>{getBookmakerDisplayName(name)}</span>
    </div>
  );
}
```

## ⚡ Best Practices

1. **Cache Locally:** Run download scripts to cache logos
2. **Rate Limiting:** 100ms delay between API requests
3. **Fallbacks:** System auto-generates initials if logo fails
4. **Lazy Load:** Use lazy loading for better performance
5. **CDN:** Consider CDN for production logo delivery

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Missing logo | Run `node scripts/download-logos.js` |
| 404 Error | Logo not in API, fallback will show |
| Rate limit | Increase delay or use API key |
| CORS issue | Download and use local cache |

## 📚 More Info

- Full Documentation: [docs/LOGO_APIS.md](docs/LOGO_APIS.md)
- Script Details: [scripts/README.md](scripts/README.md)
- Logo.dev Docs: https://logo.dev/docs

---

**Last Updated:** December 10, 2024
