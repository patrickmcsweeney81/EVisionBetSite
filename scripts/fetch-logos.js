#!/usr/bin/env node

/**
 * Fetch Bookmaker Logos from Logo.dev API
 * 
 * Usage: node scripts/fetch-logos.js
 * 
 * This script:
 * 1. Fetches logos for all 52 bookmakers from Logo.dev API
 * 2. Saves them to public/logos/bookmakers/
 * 3. Updates frontend/src/utils/bookmakerLogos.js with local paths
 * 
 * Requires: Node.js 14+
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Bookmaker list with domains for Logo.dev
const BOOKMAKERS = {
  // 4⭐
  'Pinnacle': 'pinnacle.com',
  'Betfair_EU': 'betfair.com',
  'Draftkings': 'draftkings.com',
  'Fanduel': 'fanduel.com',
  
  // 3⭐
  'Betfair_AU': 'betfair.com.au',
  'Betfair_UK': 'betfair.co.uk',
  'Betmgm': 'betmgm.com',
  'Betrivers': 'betrivers.com',
  'Betsson': 'betsson.com',
  'Marathonbet': 'marathonbet.com',
  'Lowvig': 'lowvig.com',
  
  // 2⭐
  'Nordicbet': 'nordicbet.com',
  'Mybookie': 'mybookie.ag',
  'Betonline': 'betonline.ag',
  'Bovada': 'bovada.lv',
  
  // 1⭐ - AU
  'Sportsbet': 'sportsbet.com.au',
  'Pointsbet': 'pointsbet.com',
  'Tab': 'tab.com.au',
  'Tabtouch': 'tab.com.au',
  'Unibet_AU': 'unibet.com.au',
  'Ladbrokes_AU': 'ladbrokes.com.au',
  'Neds': 'neds.com.au',
  'Betr': 'betr.com.au',
  'Boombet': 'boombet.com.au',
  
  // 1⭐ - US
  'Williamhill_US': 'williamhill.us',
  'Sbk': 'sbk.com',
  'Fanatics': 'fanatics.com',
  'Ballybet': 'ballybet.com',
  'Betparx': 'betparx.com',
  'Espnbet': 'espnbet.com',
  'Fliff': 'fliff.com',
  'Hardrockbet': 'hardrockbet.com',
  'Rebet': 'rebet.com',
  
  // 1⭐ - UK
  'Williamhill_UK': 'williamhill.co.uk',
  'Betvictor': 'betvictor.com',
  'Coral': 'coral.co.uk',
  'Skybet': 'skybet.com',
  'Paddypower': 'paddypower.com',
  'Boylesports': 'boylesports.com',
  'Betfred': 'betfred.com',
  
  // 1⭐ - EU
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
  'Betclic': 'betclic.com',
};

const LOGO_DIR = path.join(__dirname, '..', 'public', 'logos', 'bookmakers');
const OUTPUT_JS = path.join(__dirname, '..', 'frontend', 'src', 'utils', 'bookmakerLogos.js');

// API keys for bookmakers
const API_KEYS = {
  'Pinnacle': 'pk_HxFs1P6JRx62zWtMv_oq7g',
  'Sportsbet': 'pk_ACZ0pjTZRCOhx85alcjew',
  'Betfair_EU': 'pk_J1YM3orISmGgTEqow1GG2A',
  'Betfair_AU': 'pk_J1YM3orISmGgTEqow1GG2A',
  'Betfair_UK': 'pk_J1YM3orISmGgTEqow1GG2A',
  'Draftkings': 'pk_ALAW8HDETZeISyRIcmbXUg',
};

// Create directory if it doesn't exist
function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`✓ Created directory: ${dir}`);
  }
}

// Download file from URL
function downloadFile(url, filePath) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(filePath);
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        file.destroy();
        reject(new Error(`HTTP ${response.statusCode}: ${url}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

// Fetch all logos
async function fetchAllLogos() {
  console.log(`\n📥 Fetching ${Object.keys(BOOKMAKERS).length} bookmaker logos...\n`);
  
  ensureDir(LOGO_DIR);
  
  const results = {};
  const failures = [];
  let count = 0;

  for (const [bookmakerName, domain] of Object.entries(BOOKMAKERS)) {
    let url = `https://img.logo.dev/${domain}?format=svg&size=96`;
    if (API_KEYS[bookmakerName]) {
      url += `&token=${API_KEYS[bookmakerName]}`;
    }
    const fileName = `${bookmakerName.toLowerCase()}.svg`;
    const filePath = path.join(LOGO_DIR, fileName);
    
    try {
      await downloadFile(url, filePath);
      results[bookmakerName] = `/logos/bookmakers/${fileName}`;
      console.log(`✓ ${bookmakerName.padEnd(20)} → ${fileName}`);
      count++;
    } catch (err) {
      failures.push({ bookmakerName, error: err.message });
      results[bookmakerName] = null;
      console.log(`✗ ${bookmakerName.padEnd(20)} → Failed: ${err.message}`);
    }
    
    // Rate limit: 100ms between requests
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  
  console.log(`\n✓ Downloaded ${count}/${Object.keys(BOOKMAKERS).length} logos`);
  
  if (failures.length > 0) {
    console.log(`\n⚠️  ${failures.length} logos failed to download (will use fallbacks)`);
  }
  
  return results;
}

// Generate updated bookmakerLogos.js
function generateJSFile(logoMap) {
  const entries = Object.entries(logoMap)
    .map(([name, path]) => {
      if (!path) {
        return `  '${name}': null, // Will use fallback`;
      }
      return `  '${name}': '${path}',`;
    })
    .join('\n');
  
  const content = `/**
 * Bookmaker logo mapping and utilities
 * Auto-generated by scripts/fetch-logos.js
 * 
 * Local paths to downloaded logos (SVG format)
 * Fallback to auto-generated initials if logo missing
 */

// Local logo paths
const BOOKMAKER_LOGOS = {
${entries}
};

/**
 * Get logo URL for a bookmaker
 * @param {string} bookmakerName - Name of the bookmaker
 * @returns {string} - Logo path or fallback
 */
export const getBookmakerLogo = (bookmakerName) => {
  if (!bookmakerName) return null;
  const localPath = BOOKMAKER_LOGOS[bookmakerName];
  return localPath || createFallbackLogo(bookmakerName);
};

/**
 * Create a fallback SVG logo (initials in colored box)
 * @param {string} bookmakerName - Name of the bookmaker
 * @returns {string} - Data URL for fallback logo
 */
const createFallbackLogo = (bookmakerName) => {
  const initials = bookmakerName
    .split(/[_\\s]+/)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  const colors = ['#4be1c1', '#3498db', '#f39c12', '#2ecc71', '#e74c3c'];
  const hash = bookmakerName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const bgColor = colors[hash % colors.length];
  
  const svg = \`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <rect width="48" height="48" rx="4" fill="\${bgColor}"/>
      <text x="24" y="30" font-size="18" font-weight="bold" fill="white" text-anchor="middle">
        \${initials}
      </text>
    </svg>
  \`;
  
  return \`data:image/svg+xml;base64,\${btoa(svg)}\`;
};

/**
 * Get bookmaker name display (removes underscores for region codes)
 * @param {string} bookmakerName - Raw bookmaker name
 * @returns {string} - Display name
 */
export const getBookmakerDisplayName = (bookmakerName) => {
  if (!bookmakerName) return '';
  return bookmakerName
    .replace(/_[A-Z]{2}$/, '')
    .replace(/_/g, ' ')
    .trim();
};

export default BOOKMAKER_LOGOS;
`;
  
  fs.writeFileSync(OUTPUT_JS, content, 'utf-8');
  console.log(`\n✓ Generated: ${OUTPUT_JS}`);
}

// Main execution
(async () => {
  try {
    console.log('🚀 Logo Fetcher - Downloading bookmaker logos\n');
    
    const logoMap = await fetchAllLogos();
    generateJSFile(logoMap);
    
    console.log('\n✅ Complete! Logos saved to:', LOGO_DIR);
    console.log('   Updated:', OUTPUT_JS);
    console.log('\n📝 Next steps:');
    console.log('   1. Commit the new logos: git add public/logos/');
    console.log('   2. Commit the updated mapping: git add frontend/src/utils/bookmakerLogos.js');
    console.log('   3. Push to GitHub and redeploy');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
  }
})();
