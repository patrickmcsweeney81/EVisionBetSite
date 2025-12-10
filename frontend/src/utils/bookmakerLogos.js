/**
 * Bookmaker logo mapping and utilities
 * Uses fallback SVG logos with initials for bookmaker identification
 *
 * Usage:
 * import { getBookmakerLogo, getBookmakerDisplayName } from '../utils/bookmakerLogos';
 * <img src={getBookmakerLogo(row.book || 'sportsbet')} alt="..." />
 *
 * Notes:
 * - Generates color-coded SVG logos with bookmaker initials
 * - No external API dependencies - works offline and in restricted networks
 * - Each bookmaker gets a consistent color based on name hash
 */

// Color palette for logo backgrounds - moved outside function for performance
const LOGO_COLORS = ['#4be1c1', '#3498db', '#f39c12', '#2ecc71', '#e74c3c', '#9b59b6'];

export const getBookmakerLogo = (bookmakerName, opts = {}) => {
  if (!bookmakerName) return createFallbackLogo('BK');
  const size = opts.size || 96;
  
  // Use fallback logos directly since Logo.dev may not be accessible
  // in all environments (network restrictions, CORS, etc.)
  return createFallbackLogo(bookmakerName, size);
};

export const createFallbackLogo = (bookmakerName = '', size = 48) => {
  // Extract initials from bookmaker name
  const initials = bookmakerName
    .split(/[_\s]+/)
    .map((word) => (word ? word[0] : ''))
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'BK';
  
  // Calculate consistent color based on name hash
  const hash = bookmakerName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const bgColor = LOGO_COLORS[hash % LOGO_COLORS.length];
  
  // Calculate SVG dimensions
  const borderRadius = Math.round(size * 0.08);
  const textY = Math.round(size * 0.65);
  const fontSize = Math.round(size * 0.45);
  const textX = size / 2;
  
  // Build SVG with readable template
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
    <rect width="${size}" height="${size}" rx="${borderRadius}" fill="${bgColor}"/>
    <text x="${textX}" y="${textY}" font-size="${fontSize}" font-weight="700" fill="white" text-anchor="middle" font-family="Helvetica, Arial, sans-serif">${initials}</text>
  </svg>`;
  
  // Encode SVG as data URL
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

const bookmakerLogos = { getBookmakerLogo, getBookmakerDisplayName, createFallbackLogo };
export default bookmakerLogos;
