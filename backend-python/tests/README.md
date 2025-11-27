# Backend Tests

Run tests locally:
```bash
cd backend-python
pytest tests/ -v
```

Run with coverage:
```bash
pytest tests/ --cov=app --cov-report=term-missing
```

Run specific test file:
```bash
pytest tests/test_api.py -v
```

Tests included:
- Health and version endpoints
- Authentication flow (register, login, /me)
- Odds API endpoints (sports, config)
- EV hits endpoints
- TODO content endpoint

Note: Some tests may require environment variables to be set (DATABASE_URL, SECRET_KEY, etc.). Use a `.env` file or export them before running tests.
