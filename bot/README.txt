# EV Bot – Sports Betting Expected Value Finder

This bot scans sports betting odds from multiple bookmakers using The Odds API and identifies expected value (EV) opportunities. Results are logged for review and deduplication.

## How It Works
- Fetches odds for selected sports and markets from The Odds API
- Calculates fair prices using sharp bookmakers (Pinnacle, Betfair)
- Adjusts Betfair odds for commission (default: 6%)
   - Combines fair estimates with a weighted model favoring Pinnacle and Betfair
- Detects: **EV hits** only (arbitrage support has been removed)
- Logs results to `data/hits_log.csv` and deduplicates using `data/seen_hits.json`

## Configuration
All settings are controlled via the `.env` file in the project root. Avoid inline comments on the same line as values unless quoted because the parser strips everything after `#`.

```
ODDS_API_KEY=...                 # API key (required)
ODDS_API_BASE=https://api.the-odds-api.com/v4
REGIONS=au,us                    # Comma-separated regions
MARKETS=h2h,spreads,totals       # Market types (default: h2h; spreads/totals supported for EV)
SPORTS=upcoming                  # "upcoming" or comma list of sport keys
EV_MIN_EDGE=0.03                 # Minimum EV edge (default 3%)
BETFAIR_COMMISSION=0.06          # Betfair commission (default 6%)
FAIR_WEIGHT_PINNACLE=0.5         # Weight for Pinnacle in fair combine
FAIR_WEIGHT_BETFAIR=0.3          # Weight for Betfair (post-commission)
FAIR_WEIGHT_SHARPS=0.2           # Weight for other sharps (median)
TELEGRAM_ENABLED=1               # 1=on, 0=off
TELEGRAM_BOT_TOKEN=              # Telegram bot token (optional)
TELEGRAM_CHAT_ID=                # Telegram chat/channel id (optional)
TELEGRAM_DEBUG=0                 # 1=print Telegram API responses
BANKROLL=1000                    # Bankroll for Kelly stake calc
KELLY_FRACTION=0.25              # Fractional Kelly sizing
STAKE_FALLBACK=10                # Stake used if Kelly <= 0
SUMMARY_ENABLED=0                # 1=send per-run summary message
EV_MAX_ALERTS=0                  # 0=unlimited EV alerts; else cap
FILTER_BOOKS=                    # Optional: comma list of bookmaker keys
FILTER_SPORTS=                   # Optional: comma list overrides SPORTS
TEST_ALLOW_DUPES=0               # 1=ignore dedupe (testing only)
```

## Thresholds & Key Points
- **EV_MIN_EDGE**: Only bets with expected value edge ≥ this threshold are logged (edge formula: `odds * true_prob - 1`).
- **BETFAIR_COMMISSION**: Betfair back odds are adjusted: `effective = 1 + (raw - 1) * (1 - commission)`.
- **Weighted fair combine**: Convert each available fair odds to probability and combine with normalized weights: Pinnacle (FAIR_WEIGHT_PINNACLE), Betfair (FAIR_WEIGHT_BETFAIR), median of other sharps (FAIR_WEIGHT_SHARPS). Convert back to odds via `1 / p*`.
- **AU_BOOKIES**: Target AU soft books (tweak in `ev_arb_bot.py`).
- **SHARP_BOOKIES**: Pinnacle & Betfair (commission-adjusted) used to build fair probabilities, then combine via median of available fair odds.
- **TEST_ALLOW_DUPES**: Set to `1` for demonstrations; disables dedupe so hits can repeat.
- **FILTER_BOOKS / FILTER_SPORTS**: Narrow scope to control volume and speed.

## Output Files
- `data/hits_ev.csv`: EV hits with individual bookmaker odds columns
- `data/seen_hits.json`: Deduplication store to avoid duplicate notifications

## Running the Bot
1. Ensure `.env` is configured with your API key and desired settings
2. Install dependencies:
   - `pip install requests python-dotenv`
3. Run the bot:
   - Windows: `launcher.bat` or `python ev_arb_bot.py`
   - PowerShell: `$env:ODDS_API_KEY='yourkey'; python ev_arb_bot.py`
4. Review results in `data/hits_log.csv`

## Customization
- To scan specific sports, set `SPORTS` in `.env` (e.g., `soccer_epl,americanfootball_nfl`)
- To add bookmakers, update `AU_BOOKIES` or `SHARP_BOOKIES` in `ev_arb_bot.py`
- Adjust thresholds (`EV_MIN_EDGE`) in `.env` as needed

## Telegram Alerts
- If `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set and `TELEGRAM_ENABLED!=0`, the bot sends a message for each EV hit in this format:

   ```
   🔥 Pats EV Bot 🔥 EV +2.9%
   Monaco V Valencia
   🏀 Basketball    H2H
   Sat Oct 18, 01:30AM (local time)
   H2H
   Valencia • Unibet $3.55
   Stake = $12.34
   Fair = $3.45     Prob 29.0%
   ```

- Stake is computed using fractional Kelly on `BANKROLL` and `KELLY_FRACTION` with a fallback of `STAKE_FALLBACK`.

## Summary Messages
- If `SUMMARY_ENABLED=1`, a per-run summary is sent to Telegram after the scan, showing EV count and total hits.

## Launcher Usage
- Run normally (uses `.env`):
   ```bat
   launcher.bat
   ```
- Disable Telegram for a run:
   ```bat
   launcher.bat --no-telegram
   ```
- Explicitly enable Telegram:
   ```bat
   launcher.bat --telegram-on
   ```

## Notes
- Times in messages are shown in your local timezone; CSV timestamps are UTC.
- Data directory is auto-created if missing.
- To test Telegram connectivity without scanning odds: `python ev_arb_bot.py --test-telegram`.
- Avoid inline comments on value lines (use separate comment lines) to ensure parsing succeeds.

For further details, see code comments in `ev_arb_bot.py` and `.github/copilot-instructions.md`.
