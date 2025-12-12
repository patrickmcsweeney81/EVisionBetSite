#!/usr/bin/env node
/**
 * Populate SVG bookmaker logos from Clearbit API
 * Creates working SVG files for all bookmakers
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const BOOKMAKERS = {
  pinnacle: 'pinnacle.com',
  betfair_eu: 'betfair.com',
  betfair_uk: 'betfair.co.uk',
  betfair_au: 'betfair.com.au',
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
  pointsbet: 'pointsbet.com',
  tab: 'tab.com.au',
  tabtouch: 'tabtouch.com.au',
  unibet_au: 'unibet.com.au',
  unibet_fr: 'unibet.fr',
  unibet_nl: 'unibet.nl',
  unibet_se: 'unibet.se',
  ladbrokes_au: 'ladbrokes.com.au',
  neds: 'neds.com.au',
  betr: 'betr.com.au',
  boombet: 'boombet.com.au',
  williamhill_us: 'williamhill.us',
  williamhill_eu: 'williamhill.eu',
  williamhill_uk: 'williamhill.co.uk',
  sbk: 'sbk.com',
  fanatics: 'fanatics.com',
  ballybet: 'ballybet.com',
  betparx: 'betparx.com',
  espnbet: 'espnbet.com',
  fliff: 'fliff.com',
  hardrockbet: 'hardrockbet.com',
  rebet: 'rebet.com',
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
  winamax_fr: 'winamax.fr',
  winamax_de: 'winamax.de',
  betclic: 'betclic.com'
};

const LOGOS_DIR = path.join(__dirname, '../public/logos/bookmakers');

// Create directory if it doesn't exist
if (!fs.existsSync(LOGOS_DIR)) {
  fs.mkdirSync(LOGOS_DIR, { recursive: true });
}

/**
 * Fetch logo from Clearbit API and save as SVG
 */
function fetchAndSaveLogo(name, domain) {
  return new Promise((resolve) => {
    const url = `https://logo.clearbit.com/${domain}?size=200`;
    const filePath = path.join(LOGOS_DIR, `${name}.svg`);

    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      if (response.statusCode === 200) {
        response.pipe(file);
        file.on('finish', () => {
          file.close();
          console.log(`✓ ${name.padEnd(20)} (${domain})`);
          resolve();
        });
        file.on('error', (err) => {
          fs.unlink(filePath, () => {});
          console.error(`✗ ${name} - write error: ${err && err.message ? err.message : err}`);
          resolve();
        });
      } else {
        console.error(`✗ ${name} - HTTP ${response.statusCode}`);
        resolve();
      }
    }).on('error', (err) => {
      console.error(`✗ ${name} - network error: ${err && err.message ? err.message : err}`);
      fs.unlink(filePath, () => {});
      resolve();
    });
  });
}

/**
 * Main execution
 */
async function main() {
  console.log('Populating SVG logos from Clearbit API...\n');
  
  const names = Object.keys(BOOKMAKERS);
  const total = names.length;
  
  for (const name of names) {
    await fetchAndSaveLogo(name, BOOKMAKERS[name]);
    // Rate limit: wait 100ms between requests
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log(`\n✓ Completed: ${total} bookmakers processed`);
}

main().catch(console.error);
