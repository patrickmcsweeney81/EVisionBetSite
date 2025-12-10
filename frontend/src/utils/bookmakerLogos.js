/**
 * Bookmaker logo mapping and utilities
 * Uses Logo.dev API for dynamic logo loading (publishable keys only)
 *
 * Usage:
 * import { getBookmakerLogo, getBookmakerDisplayName } from '../utils/bookmakerLogos';
 * <img src={getBookmakerLogo(row.book || 'sportsbet')} alt="..." />
 *
 * Notes:
 * - Put a global publishable key in .env.local as REACT_APP_LOGODEV_PUBLISHABLE (optional).
 * - You can also add per-bookmaker publishable tokens in BOOKMAKER_TOKENS below
 *   (or set them via a server-side config if you prefer).
 * - Do NOT put secret keys (sk_...) into frontend env vars.
 */

const GLOBAL_LOGO_DEV_PUBLISHABLE = process.env.REACT_APP_LOGODEV_PUBLISHABLE || '';

const BOOKMAKER_TOKENS = {
  // Add per-bookmaker publishable keys here if you created them (publishable keys only)
};

const BOOKMAKER_DOMAINS = {
  'pinnacle': 'pinnacle.com',
  'betfair': 'betfair.com',
  'betfair_eu': 'betfair.com',
  'betfair_au': 'betfair.com.au',
  'betfair_uk': 'betfair.co.uk',
  'draftkings': 'draftkings.com',
  'fanduel': 'fanduel.com',
  'betmgm': 'betmgm.com',
  'betrivers': 'betrivers.com',
  'betsson': 'betsson.com',
  'marathonbet': 'marathonbet.com',
  'lowvig': 'lowvig.com',
  'nordicbet': 'nordicbet.com',
  'mybookie': 'mybookie.ag',
  'betonline': 'betonline.ag',
  'bovada': 'bovada.lv',
  'sportsbet': 'sportsbet.com.au',
  'pointsbet': 'pointsbet.com',
  'tab': 'tab.com.au',
  'tabtouch': 'tab.com.au',
  'unibet': 'unibet.com',
  'unibet_au': 'unibet.com.au',
  'ladbrokes': 'ladbrokes.com.au',
  'ladbrokes_au': 'ladbrokes.com.au',
  'neds': 'neds.com.au',
  'betr': 'betr.com.au',
  'boombet': 'boombet.com.au',
  'bet365': 'bet365.com',
  'williamhill_us': 'williamhill.us',
  'sbk': 'sbk.com',
  'fanatics': 'fanatics.com',
  'ballybet': 'ballybet.com',
  'betparx': 'betparx.com',
  'espnbet': 'espnbet.com',
  'fliff': 'fliff.com',
  'hardrockbet': 'hardrockbet.com',
  'rebet': 'rebet.com',
  'williamhill': 'williamhill.co.uk',
  'betvictor': 'betvictor.com',
  'coral': 'coral.co.uk',
  'skybet': 'skybet.com',
  'paddypower': 'paddypower.com',
  'boylesports': 'boylesports.com',
  'betfred': 'betfred.com',
  'bwin': 'bwin.com',
  'williamhill_eu': 'williamhill.eu',
  'codere': 'codere.com',
  'tipico': 'tipico.com',
  'leovegas': 'leovegas.com',
  'parionssport': 'parionssport.fr',
  'winamax': 'winamax.fr',
  'betclic': 'betclic.com',
};

function normalizeSlug(name) {
  if (!name) return '';
  return name.toString().trim().replace(/\s+/g, '_').replace(/\./g, '').toLowerCase();
}

export const getBookmakerLogo = (bookmakerName, opts = {}) => {
  if (!bookmakerName) return createFallbackLogo('BK');
  const size = opts.size || 96;
  const slug = normalizeSlug(bookmakerName);
  const domain = BOOKMAKER_DOMAINS[slug] || BOOKMAKER_DOMAINS[bookmakerName?.toString().toLowerCase()];
  const token = BOOKMAKER_TOKENS[slug] || GLOBAL_LOGO_DEV_PUBLISHABLE || '';
  if (domain) {
    const params = new URLSearchParams({ size: String(size), format: 'png' });
    if (token) params.set('token', token);
    return `https://img.logo.dev/${domain}?${params.toString()}`;
  }
  if (slug) {
    return `https://logo.clearbit.com/${encodeURIComponent(slug)}?size=${size * 2}`;
  }
  return createFallbackLogo(bookmakerName, size);
};

const createFallbackLogo = (bookmakerName = '', size = 48) => {
  const initials = bookmakerName
    .split(/[_\s]+/)
    .map((word) => (word ? word[0] : ''))
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'BK';
  const colors = ['#4be1c1', '#3498db', '#f39c12', '#2ecc71', '#e74c3c', '#9b59b6'];
  const hash = bookmakerName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const bgColor = colors[hash % colors.length];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">\n    <rect width="${size}" height="${size}" rx="${Math.round(size * 0.08)}" fill="${bgColor}"/>\n    <text x="${size / 2}" y="${Math.round(size * 0.65)}" font-size="${Math.round(size * 0.45)}" font-weight="700" fill="white" text-anchor="middle" font-family="Helvetica, Arial, sans-serif">${initials}</text>\n  </svg>`;
  try {
    const base64 = btoa(unescape(encodeURIComponent(svg)));
    return `data:image/svg+xml;base64,${base64}`;
  } catch (err) {
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }
};

export const getBookmakerDisplayName = (bookmakerName) => {
  if (!bookmakerName) return '';
  return bookmakerName.toString().replace(/_[A-Za-z]{2,}$/, '').replace(/_/g, ' ').trim();
};

const bookmakerLogos = { getBookmakerLogo, getBookmakerDisplayName };
export default bookmakerLogos;
