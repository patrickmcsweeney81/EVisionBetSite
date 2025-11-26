# EV Bot - Python Code

This directory contains the Python code for the Expected Value (EV) betting bot.

## Structure

```
bot/
├── core/              # Core modules (odds processing, EV calculation)
├── data/              # Data storage (seen_hits.json, CSV logs)
├── scripts/           # Utility scripts
├── ev_arb_bot.py      # Main bot entry point
└── requirements.txt   # Python dependencies
```

## Setup

1. **Create virtual environment:**
   ```bash
   python -m venv venv
   ```

2. **Activate virtual environment:**
   - Windows: `venv\Scripts\activate`
   - Mac/Linux: `source venv/bin/activate`

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment:**
   - Copy `.env.example` to `.env`
   - Add your API keys (The Odds API, Telegram, etc.)

5. **Run the bot:**
   ```bash
   python ev_arb_bot.py
   ```

## Integration with Web Platform

The bot code will be integrated into the FastAPI backend to provide:
- Real-time odds data
- EV calculations
- Fair odds computation
- Arbitrage detection
- Historical data logging

See main project README for full architecture details.
