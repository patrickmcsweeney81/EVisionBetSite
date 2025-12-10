/**
 * Bookmaker logo mapping and utilities
 * Uses Logo.dev API for dynamic logo loading
 * 
 * Logos are fetched from img.logo.dev with:
 * - PNG format (transparency support)
 * - 48px size for table display
 * - Dark theme for dark backgrounds
 * - Retina support for sharp display
 */

// Domain mappings for bookmakers (used by Logo.dev API)
const BOOKMAKER_DOMAINS = {
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

/**
 * Get logo URL for a bookmaker from Logo.dev API (light theme)
 * @param {string} bookmakerName - Name of the bookmaker
 * @returns {string} - Logo URL or fallback
 */
export const getBookmakerLogo = (bookmakerName) => {
  if (!bookmakerName) return null;
  
  const domain = BOOKMAKER_DOMAINS[bookmakerName];
  if (!domain) return createFallbackLogo(bookmakerName);
  
  // Use Logo.dev API with optimized parameters
  // - PNG format (transparency)
  // - 96px size (scales to 48px in CSS, crisp on retina)
  // - Light theme (for light table backgrounds)
  // - Retina support (sharp on high-DPI)
  // - Fallback to monogram if not found
  return `https://img.logo.dev/${domain}?format=png&size=96&theme=light&retina=true`;
};

/**
 * Get logo URL for a bookmaker from Logo.dev API (dark theme)
 * @param {string} bookmakerName - Name of the bookmaker
 * @returns {string} - Logo URL or fallback
 */
export const getBookmakerLogoDark = (bookmakerName) => {
  if (!bookmakerName) return null;
  
  const domain = BOOKMAKER_DOMAINS[bookmakerName];
  if (!domain) return createFallbackLogo(bookmakerName);
  
  // Dark theme version for use on dark backgrounds
  // - PNG format (transparency)
  // - 96px size (scales to 48px in CSS, crisp on retina)
  // - Dark theme (for dark backgrounds/sidebars)
  // - Retina support (sharp on high-DPI)
  // - Fallback to monogram if not found
  return `https://img.logo.dev/${domain}?format=png&size=96&theme=dark&retina=true`;
};

/**
 * Create a fallback SVG logo (initials in colored box)
 * @param {string} bookmakerName - Name of the bookmaker
 * @returns {string} - Data URL for fallback logo
 */
const createFallbackLogo = (bookmakerName) => {
  const initials = bookmakerName
    .split(/[_\s]+/)
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
  
  const colors = ['#4be1c1', '#3498db', '#f39c12', '#2ecc71', '#e74c3c'];
  const hash = bookmakerName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const bgColor = colors[hash % colors.length];
  
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48">
      <rect width="48" height="48" rx="4" fill="${bgColor}"/>
      <text x="24" y="30" font-size="18" font-weight="bold" fill="white" text-anchor="middle">
        ${initials}
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml;base64,${btoa(svg)}`;
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
