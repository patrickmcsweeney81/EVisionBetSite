/**
 * Local cached bookmaker logos
 * Maps bookmaker names to local SVG files in public/logos/bookmakers/
 */

export const BOOKMAKER_LOGOS_LOCAL = {
  // Direct mappings
  pinnacle: '/logos/bookmakers/pinnacle.svg',
  betfair: '/logos/bookmakers/betfair_eu.svg',
  betfair_eu: '/logos/bookmakers/betfair_eu.svg',
  betfair_uk: '/logos/bookmakers/betfair_uk.svg',
  betfair_au: '/logos/bookmakers/betfair_au.svg',
  betfair_ex: '/logos/bookmakers/betfair_eu.svg',
  betfair_exchange: '/logos/bookmakers/betfair_eu.svg',
  betfair_ex_eu: '/logos/bookmakers/betfair_eu.svg',
  betfair_exchange_eu: '/logos/bookmakers/betfair_eu.svg',
  betfair_ex_au: '/logos/bookmakers/betfair_au.svg',
  betfair_exchange_au: '/logos/bookmakers/betfair_au.svg',
  betfair_ex_uk: '/logos/bookmakers/betfair_uk.svg',
  betfair_exchange_uk: '/logos/bookmakers/betfair_uk.svg',
  draftkings: '/logos/bookmakers/draftkings.svg',
  fanduel: '/logos/bookmakers/fanduel.svg',
  betmgm: '/logos/bookmakers/betmgm.svg',
  betrivers: '/logos/bookmakers/betrivers.svg',
  betsson: '/logos/bookmakers/betsson.svg',
  marathonbet: '/logos/bookmakers/marathonbet.svg',
  lowvig: '/logos/bookmakers/lowvig.svg',
  nordicbet: '/logos/bookmakers/nordicbet.svg',
  mybookie: '/logos/bookmakers/mybookie.svg',
  betonline: '/logos/bookmakers/betonline.svg',
  bovada: '/logos/bookmakers/bovada.svg',
  sportsbet: '/logos/bookmakers/sportsbet.svg',
  sportsbet_au: '/logos/bookmakers/sportsbet.svg',
  pointsbet: '/logos/bookmakers/pointsbet.svg',
  pointsbet_au: '/logos/bookmakers/pointsbet.svg',
  tab: '/logos/bookmakers/tab.svg',
  tab_au: '/logos/bookmakers/tab.svg',
  tabtouch: '/logos/bookmakers/tabtouch.svg',
  tabtouch_wa: '/logos/bookmakers/tabtouch.svg',
  unibet: '/logos/bookmakers/unibet_au.svg',
  unibet_au: '/logos/bookmakers/unibet_au.svg',
  unibet_fr: '/logos/bookmakers/unibet_fr.svg',
  unibet_nl: '/logos/bookmakers/unibet_nl.svg',
  unibet_se: '/logos/bookmakers/unibet_se.svg',
  ladbrokes: '/logos/bookmakers/ladbrokes_au.svg',
  ladbrokes_au: '/logos/bookmakers/ladbrokes_au.svg',
  neds: '/logos/bookmakers/neds.svg',
  betr: '/logos/bookmakers/betr.svg',
  boombet: '/logos/bookmakers/boombet.svg',
  // No BetRight logo available; using BetVictor logo as a fallback for now.
  // See issue #<ISSUE_NUMBER>: Replace with betright.svg if/when available.
  betright: '/logos/bookmakers/betvictor.svg',
  betright_au: '/logos/bookmakers/betvictor.svg',
  williamhill_us: '/logos/bookmakers/williamhill_us.svg',
  williamhill_eu: '/logos/bookmakers/williamhill_eu.svg',
  williamhill_uk: '/logos/bookmakers/williamhill_uk.svg',
  williamhill: '/logos/bookmakers/williamhill_eu.svg',
  sbk: '/logos/bookmakers/sbk.svg',
  fanatics: '/logos/bookmakers/fanatics.svg',
  ballybet: '/logos/bookmakers/ballybet.svg',
  betparx: '/logos/bookmakers/betparx.svg',
  espnbet: '/logos/bookmakers/espnbet.svg',
  fliff: '/logos/bookmakers/fliff.svg',
  hardrockbet: '/logos/bookmakers/hardrockbet.svg',
  rebet: '/logos/bookmakers/rebet.svg',
  betvictor: '/logos/bookmakers/betvictor.svg',
  coral: '/logos/bookmakers/coral.svg',
  skybet: '/logos/bookmakers/skybet.svg',
  paddypower: '/logos/bookmakers/paddypower.svg',
  boylesports: '/logos/bookmakers/boylesports.svg',
  betfred: '/logos/bookmakers/betfred.svg',
  bwin: '/logos/bookmakers/bwin.svg',
  codere: '/logos/bookmakers/codere.svg',
  tipico: '/logos/bookmakers/tipico.svg',
  leovegas: '/logos/bookmakers/leovegas.svg',
  parionssport: '/logos/bookmakers/parionssport.svg',
  winamax: '/logos/bookmakers/winamax_fr.svg',
  winamax_de: '/logos/bookmakers/winamax_de.svg',
  winamax_fr: '/logos/bookmakers/winamax_fr.svg',
  betclic: '/logos/bookmakers/betclic.svg'
};

/**
 * Get local logo path for a bookmaker
 * @param {string} bookmakerName - Name of the bookmaker
 * @returns {string|null} - Local path to logo or null if not cached
 */
export const getBookmakerLogoLocal = (bookmakerName) => {
  return BOOKMAKER_LOGOS_LOCAL[bookmakerName] || null;
};
