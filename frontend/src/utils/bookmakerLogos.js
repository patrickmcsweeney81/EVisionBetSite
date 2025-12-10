/**
 * Bookmaker logo mapping and utilities
 * Maps bookmaker names to logo URLs
 * 
 * To add logos:
 * 1. Get API key from https://www.logo.dev/dashboard/api-keys
 * 2. Use: https://api.logo.dev/logo?company={company}&format=svg
 * 3. Or host logos locally in /public/logos/bookmakers/
 */

// Logo URL mapping - update with actual logo URLs
const BOOKMAKER_LOGOS = {
  // 4⭐ - GOLD STANDARD
  'Pinnacle': 'https://api.logo.dev/logo?company=pinnacle&format=svg',
  'Betfair_EU': 'https://api.logo.dev/logo?company=betfair&format=svg',
  'Draftkings': 'https://api.logo.dev/logo?company=draftkings&format=svg',
  'Fanduel': 'https://api.logo.dev/logo?company=fanduel&format=svg',
  
  // 3⭐ - MAJOR SHARPS
  'Betfair_AU': 'https://api.logo.dev/logo?company=betfair&format=svg',
  'Betfair_UK': 'https://api.logo.dev/logo?company=betfair&format=svg',
  'Betmgm': 'https://api.logo.dev/logo?company=betmgm&format=svg',
  'Betrivers': 'https://api.logo.dev/logo?company=betrivers&format=svg',
  'Betsson': 'https://api.logo.dev/logo?company=betsson&format=svg',
  'Marathonbet': 'https://api.logo.dev/logo?company=marathonbet&format=svg',
  'Lowvig': 'https://api.logo.dev/logo?company=lowvig&format=svg',
  
  // 2⭐ - SECONDARY SOURCES
  'Nordicbet': 'https://api.logo.dev/logo?company=nordicbet&format=svg',
  'Mybookie': 'https://api.logo.dev/logo?company=mybookie&format=svg',
  'Betonline': 'https://api.logo.dev/logo?company=betonline&format=svg',
  'Bovada': 'https://api.logo.dev/logo?company=bovada&format=svg',
  
  // 1⭐ - TERTIARY (AU)
  'Sportsbet': 'https://api.logo.dev/logo?company=sportsbet&format=svg',
  'Pointsbet': 'https://api.logo.dev/logo?company=pointsbet&format=svg',
  'Tab': 'https://api.logo.dev/logo?company=tab&format=svg',
  'Tabtouch': 'https://api.logo.dev/logo?company=tabtouch&format=svg',
  'Unibet_AU': 'https://api.logo.dev/logo?company=unibet&format=svg',
  'Ladbrokes_AU': 'https://api.logo.dev/logo?company=ladbrokes&format=svg',
  'Neds': 'https://api.logo.dev/logo?company=neds&format=svg',
  'Betr': 'https://api.logo.dev/logo?company=betr&format=svg',
  'Boombet': 'https://api.logo.dev/logo?company=boombet&format=svg',
  
  // 1⭐ - TERTIARY (US)
  'Williamhill_US': 'https://api.logo.dev/logo?company=williamhill&format=svg',
  'Sbk': 'https://api.logo.dev/logo?company=sbk&format=svg',
  'Fanatics': 'https://api.logo.dev/logo?company=fanatics&format=svg',
  'Ballybet': 'https://api.logo.dev/logo?company=ballybet&format=svg',
  'Betparx': 'https://api.logo.dev/logo?company=betparx&format=svg',
  'Espnbet': 'https://api.logo.dev/logo?company=espnbet&format=svg',
  'Fliff': 'https://api.logo.dev/logo?company=fliff&format=svg',
  'Hardrockbet': 'https://api.logo.dev/logo?company=hardrockbet&format=svg',
  'Rebet': 'https://api.logo.dev/logo?company=rebet&format=svg',
  
  // 1⭐ - TERTIARY (UK)
  'Williamhill_UK': 'https://api.logo.dev/logo?company=williamhill&format=svg',
  'Betvictor': 'https://api.logo.dev/logo?company=betvictor&format=svg',
  'Coral': 'https://api.logo.dev/logo?company=coral&format=svg',
  'Skybet': 'https://api.logo.dev/logo?company=skybet&format=svg',
  'Paddypower': 'https://api.logo.dev/logo?company=paddypower&format=svg',
  'Boylesports': 'https://api.logo.dev/logo?company=boylesports&format=svg',
  'Betfred': 'https://api.logo.dev/logo?company=betfred&format=svg',
  
  // 1⭐ - TERTIARY (EU)
  'Bwin': 'https://api.logo.dev/logo?company=bwin&format=svg',
  'Williamhill_EU': 'https://api.logo.dev/logo?company=williamhill&format=svg',
  'Codere': 'https://api.logo.dev/logo?company=codere&format=svg',
  'Tipico': 'https://api.logo.dev/logo?company=tipico&format=svg',
  'Leovegas': 'https://api.logo.dev/logo?company=leovegas&format=svg',
  'Parionssport': 'https://api.logo.dev/logo?company=parionssport&format=svg',
  'Winamax_FR': 'https://api.logo.dev/logo?company=winamax&format=svg',
  'Winamax_DE': 'https://api.logo.dev/logo?company=winamax&format=svg',
  'Unibet_FR': 'https://api.logo.dev/logo?company=unibet&format=svg',
  'Unibet_NL': 'https://api.logo.dev/logo?company=unibet&format=svg',
  'Unibet_SE': 'https://api.logo.dev/logo?company=unibet&format=svg',
  'Betclic': 'https://api.logo.dev/logo?company=betclic&format=svg',
};

/**
 * Get logo URL for a bookmaker
 * @param {string} bookmakerName - Name of the bookmaker
 * @returns {string} - Logo URL or fallback placeholder
 */
export const getBookmakerLogo = (bookmakerName) => {
  if (!bookmakerName) return null;
  return BOOKMAKER_LOGOS[bookmakerName] || createFallbackLogo(bookmakerName);
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
  // Remove region codes like _AU, _UK, _US, etc.
  return bookmakerName
    .replace(/_[A-Z]{2}$/, '')
    .replace(/_/g, ' ')
    .trim();
};

export default BOOKMAKER_LOGOS;
