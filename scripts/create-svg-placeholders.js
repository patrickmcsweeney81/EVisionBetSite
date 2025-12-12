#!/usr/bin/env node
/**
 * Create minimal SVG placeholders for all bookmakers
 * These serve as fallbacks when images aren't available
 */

const fs = require('fs');
const path = require('path');

const BOOKMAKERS = [
  'pinnacle', 'betfair_eu', 'betfair_uk', 'betfair_au',
  'draftkings', 'fanduel', 'betmgm', 'betrivers', 'betsson',
  'marathonbet', 'lowvig', 'nordicbet', 'mybookie', 'betonline',
  'bovada', 'sportsbet', 'pointsbet', 'tab', 'tabtouch',
  'unibet_au', 'unibet_fr', 'unibet_nl', 'unibet_se',
  'ladbrokes_au', 'neds', 'betr', 'boombet',
  'williamhill_us', 'williamhill_eu', 'williamhill_uk',
  'sbk', 'fanatics', 'ballybet', 'betparx', 'espnbet',
  'fliff', 'hardrockbet', 'rebet', 'betvictor', 'coral',
  'skybet', 'paddypower', 'boylesports', 'betfred', 'bwin',
  'codere', 'tipico', 'leovegas', 'parionssport',
  'winamax_fr', 'winamax_de', 'betclic'
];

const COLORS = [
  '#4be1c1', '#3498db', '#f39c12', '#2ecc71', 
  '#e74c3c', '#9b59b6', '#1abc9c', '#34495e'
];

const LOGOS_DIR = path.join(__dirname, '../public/logos/bookmakers');

// Create directory if it doesn't exist
if (!fs.existsSync(LOGOS_DIR)) {
  fs.mkdirSync(LOGOS_DIR, { recursive: true });
}

/**
 * Create a simple SVG badge with initials
 */
function createSvgBadge(name) {
  const initials = name
    .split('_')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const bgColor = COLORS[hash % COLORS.length];
  
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
  <defs>
    <linearGradient id="grad_${name}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:${bgColor};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${bgColor};stop-opacity:0.8" />
    </linearGradient>
  </defs>
  <rect width="200" height="200" rx="16" fill="url(#grad_${name})"/>
  <circle cx="100" cy="100" r="95" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2"/>
  <text x="100" y="120" font-size="80" font-weight="700" fill="white" text-anchor="middle" font-family="Arial, sans-serif">${initials}</text>
</svg>`;
  
  return svg;
}

/**
 * Main execution
 */
function main() {
  console.log('Creating SVG logo placeholders...\n');
  
  for (const name of BOOKMAKERS) {
    const svg = createSvgBadge(name);
    const filePath = path.join(LOGOS_DIR, `${name}.svg`);
    
    try {
      fs.writeFileSync(filePath, svg, 'utf8');
      console.log(`✓ ${name}`);
    } catch (err) {
      console.error(`✗ ${name}: ${err.message}`);
    }
  }
  
  console.log(`\n✓ Created ${BOOKMAKERS.length} SVG placeholders`);
}

main();
