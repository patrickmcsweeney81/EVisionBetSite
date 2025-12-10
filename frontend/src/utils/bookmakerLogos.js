/**
 * Bookmaker logo mapping and utilities
 * Uses Logo.dev API for dynamic logo loading
 * 
 * Example usage:
 * <img
 *   src="https://img.logo.dev/sportsbet.com.au?token=pk_live_6a1a28fd-6420-4492-aeb0-b297461d9de2"
 *   alt="Sportsbet logo"
 *   loading="lazy"
 * />
 */

// Logo.dev public demo key (replace with your publishable key for production)
const LOGO_DEV_KEY = 'pk_live_6a1a28fd-6420-4492-aeb0-b297461d9de2';

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
 * Get logo URL for a bookmaker
 * Tries Logo.dev API first, falls back to SVG with initials
 * 
 * @param {string} bookmakerName - Name of the bookmaker
 * @returns {string} - Logo URL or data URI
 */
export const getBookmakerLogo = (bookmakerName) => {
  if (!bookmakerName) return null;
  
  const domain = BOOKMAKER_DOMAINS[bookmakerName];
  if (domain) {
    // Return Logo.dev API URL with token
    return `https://img.logo.dev/${domain}?token=${LOGO_DEV_KEY}&size=96&format=png`;
  }
  
  // Fallback to generated SVG
  return createFallbackLogo(bookmakerName);
};

/**
 * Create a fallback SVG logo with bookmaker initials
 * @param {string} bookmakerName - Name of the bookmaker
 * @returns {string} - Data URI for SVG
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
 * Get display-friendly bookmaker name
 * Removes region codes and underscores
 * 
 * @param {string} bookmakerName - Raw bookmaker name
 * @returns {string} - Display name (e.g., "Betfair AU" from "Betfair_AU")
 */
export const getBookmakerDisplayName = (bookmakerName) => {
  if (!bookmakerName) return '';
  return bookmakerName
    .replace(/_[A-Z]{2}$/, '')
    .replace(/_/g, ' ')
    .trim();
};

export default { getBookmakerLogo, getBookmakerDisplayName };
