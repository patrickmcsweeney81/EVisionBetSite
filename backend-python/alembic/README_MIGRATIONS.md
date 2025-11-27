# Database Migrations

Alembic is configured for this backend. Workflow:

1. Ensure models updated in `app/models/*`.
2. Generate revision (autogenerate):
   ```bash
   alembic revision --autogenerate -m "describe change"
   ```
3. Review generated script under `alembic/versions/` for accuracy.
4. Apply migrations:
   ```bash
   alembic upgrade head
   ```
5. Downgrade (if needed):
   ```bash
   alembic downgrade -1
   ```

Environment Settings:
- DB URL pulled dynamically from `Settings` (env vars / `.env`).
- SQLite local dev will create tables automatically at startup (no migrations strictly required but recommended).
- Postgres (Render) MUST use migrations; disable any auto `create_all`.

Tips:
- When adding new columns with defaults, consider `nullable=True` then backfill and alter to not null to avoid locks.
- Use `compare_type=True` in `env.py` (already set) to detect type changes.
- Keep revisions small and focused.

Example initial migration command (after first setup):
```bash
alembic revision --autogenerate -m "initial user table"
alembic upgrade head
```
