import { BOOKMAKER_LOGOS_LOCAL } from './bookmakerLogosLocal';

/**
 * Bookmaker logo mapping and utilities
 * Uses Logo.dev API for dynamic logo loading (publishable keys only)
 *
 * Notes:
 * - Put a global publishable key in .env.local as REACT_APP_LOGODEV_PUBLISHABLE (optional).
 * - You can also add per-bookmaker publishable tokens in BOOKMAKER_TOKENS below.
 * - Do NOT put secret keys (sk_...) into frontend env vars.
 * - If scripts/download-logos.js has been run, we will prefer the cached local SVG/PNG first.
 */

const GLOBAL_LOGO_DEV_PUBLISHABLE = process.env.REACT_APP_LOGODEV_PUBLISHABLE || '';

const BOOKMAKER_TOKENS = {
  // Add per-bookmaker publishable keys here if you created them (publishable keys only)
};

const normalizeSlug = (name) => {
  if (!name) return '';
  return name.toString().trim().replace(/\s+/g, '_').replace(/\./g, '').toLowerCase();
};

const BOOKMAKER_DOMAINS = {
  pinnacle: 'pinnacle.com',
  betfair: 'betfair.com',
  betfair_eu: 'betfair.com',
  betfair_ex: 'betfair.com',
  betfair_exchange: 'betfair.com',
  betfair_ex_eu: 'betfair.com',
  betfair_exchange_eu: 'betfair.com',
  betfair_au: 'betfair.com.au',
  betfair_ex_au: 'betfair.com.au',
  betfair_exchange_au: 'betfair.com.au',
  betfair_uk: 'betfair.co.uk',
  betfair_ex_uk: 'betfair.co.uk',
  betfair_exchange_uk: 'betfair.co.uk',
  draftkings: 'draftkings.com',
  fanduel: 'fanduel.com',
  betmgm: 'betmgm.com',
  betrivers: 'betrivers.com',
  betsson: 'betsson.com',
  marathonbet: 'marathonbet.com',
  lowvig: 'lowvig.com',
  nordicbet: 'nordicbet.com',
  mybookie: 'mybookie.ag',
  betonline: 'betonline.ag',
  bovada: 'bovada.lv',
  sportsbet: 'sportsbet.com.au',
  sportsbet_au: 'sportsbet.com.au',
  pointsbet: 'pointsbet.com',
  pointsbet_au: 'pointsbet.com.au',
  tab: 'tab.com.au',
  tab_au: 'tab.com.au',
  tabtouch: 'tabtouch.com.au',
  tabtouch_wa: 'tabtouch.com.au',
  unibet: 'unibet.com',
  unibet_au: 'unibet.com.au',
  unibet_fr: 'unibet.fr',
  unibet_nl: 'unibet.nl',
  unibet_se: 'unibet.se',
  ladbrokes: 'ladbrokes.com.au',
  ladbrokes_au: 'ladbrokes.com.au',
  ladbrokes_uk: 'ladbrokes.com',
  neds: 'neds.com.au',
  betr: 'betr.com.au',
  boombet: 'boombet.com.au',
  bet365: 'bet365.com',
  betright: 'betright.com.au',
  betright_au: 'betright.com.au',
  dabble: 'dabble.com.au',
  dabble_au: 'dabble.com.au',
  playup: 'playup.com.au',
  playup_au: 'playup.com.au',
  play_up: 'playup.com.au',
  williamhill_us: 'williamhill.us',
  sbk: 'sbk.com',
  fanatics: 'fanatics.com',
  ballybet: 'ballybet.com',
  betparx: 'betparx.com',
  espnbet: 'espnbet.com',
  fliff: 'fliff.com',
  hardrockbet: 'hardrockbet.com',
  rebet: 'rebet.com',
  williamhill: 'williamhill.co.uk',
  williamhill_eu: 'williamhill.eu',
  betvictor: 'betvictor.com',
  coral: 'coral.co.uk',
  skybet: 'skybet.com',
  paddypower: 'paddypower.com',
  boylesports: 'boylesports.com',
  betfred: 'betfred.com',
  bwin: 'bwin.com',
  codere: 'codere.com',
  tipico: 'tipico.com',
  leovegas: 'leovegas.com',
  parionssport: 'parionssport.fr',
  winamax: 'winamax.fr',
  betclic: 'betclic.com'
};

const BOOKMAKER_LOCAL_ALIASES = {
  betfair_ex: 'betfair',
  betfair_exchange: 'betfair',
  betfair_ex_eu: 'betfair_eu',
  betfair_exchange_eu: 'betfair_eu',
  betfair_ex_au: 'betfair_au',
  betfair_exchange_au: 'betfair_au',
  betfair_ex_uk: 'betfair_uk',
  betfair_exchange_uk: 'betfair_uk',
  sportsbet_au: 'sportsbet',
  pointsbet_au: 'pointsbet',
  tab_au: 'tab',
  tabtouch_wa: 'tabtouch',
  playup_au: 'playup',
  play_up: 'playup',
  betright_au: 'betright',
  dabble_au: 'dabble'
};

const LOCAL_LOGO_LOOKUP = Object.entries(BOOKMAKER_LOGOS_LOCAL || {}).reduce((acc, [name, path]) => {
  if (!name || !path) return acc;
  const slug = normalizeSlug(name);
  acc[name] = path;
  acc[name.toLowerCase()] = path;
  if (slug) acc[slug] = path;
  return acc;
}, {});

const resolveLocalLogoPath = (bookmakerName) => {
  if (!bookmakerName) return null;
  const slug = normalizeSlug(bookmakerName);
  if (LOCAL_LOGO_LOOKUP[slug]) return LOCAL_LOGO_LOOKUP[slug];
  const aliasSlug = BOOKMAKER_LOCAL_ALIASES[slug];
  if (aliasSlug && LOCAL_LOGO_LOOKUP[aliasSlug]) {
    return LOCAL_LOGO_LOOKUP[aliasSlug];
  }
  const lower = bookmakerName.toString().toLowerCase();
  if (LOCAL_LOGO_LOOKUP[lower]) return LOCAL_LOGO_LOOKUP[lower];
  if (LOCAL_LOGO_LOOKUP[bookmakerName]) return LOCAL_LOGO_LOOKUP[bookmakerName];
  return null;
};

const PREFETCHED_LOGOS = new Set();
const DEFAULT_BOOKMAKERS = Object.keys(BOOKMAKER_DOMAINS);

export const getBookmakerLogo = (bookmakerName, opts = {}) => {
  if (!bookmakerName) return createFallbackLogo('BK');
  const { size = 96, preferLocal = true } = opts;

  // FIRST: Try local SVG files (highest priority - they're always available)
  if (preferLocal) {
    const localPath = resolveLocalLogoPath(bookmakerName);
    if (localPath) {
      return localPath;
    }
  }

  // SECOND: Try Logo.dev API (if domain is mapped)
  const slug = normalizeSlug(bookmakerName);
  const rawLower = bookmakerName.toString().toLowerCase();
  const domain =
    BOOKMAKER_DOMAINS[slug] ||
    BOOKMAKER_DOMAINS[BOOKMAKER_LOCAL_ALIASES[slug]] ||
    BOOKMAKER_DOMAINS[rawLower];
  const token = BOOKMAKER_TOKENS[slug] || GLOBAL_LOGO_DEV_PUBLISHABLE || '';

  if (domain) {
    const params = new URLSearchParams({ size: String(size), format: 'png' });
    if (token) params.set('token', token);
    return `https://img.logo.dev/${domain}?${params.toString()}`;
  }

  // THIRD: Fallback to generated SVG badge with initials
  return createFallbackLogo(bookmakerName, size);
};

export const preloadBookmakerLogos = (bookmakers = DEFAULT_BOOKMAKERS) => {
  if (typeof window === 'undefined' || typeof window.Image === 'undefined') return;
  const unique = Array.from(new Set(bookmakers.filter(Boolean))); // dedupe
  unique.forEach((name) => {
    const url = getBookmakerLogo(name, { size: 64 });
    if (!url || PREFETCHED_LOGOS.has(url)) return;
    const img = new window.Image();
    img.src = url;
    PREFETCHED_LOGOS.add(url);
  });
};

export const createFallbackLogo = (bookmakerName = '', size = 48) => {
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

const bookmakerLogos = { getBookmakerLogo, getBookmakerDisplayName, createFallbackLogo, preloadBookmakerLogos };
export default bookmakerLogos;
