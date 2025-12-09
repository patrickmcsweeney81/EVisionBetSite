#!/usr/bin/env python
"""
Management CLI for EVisionBet backend operations
"""
import click
import sys
from pathlib import Path

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from app.database import SessionLocal, engine, Base
from app.models.user import User
from app.api.auth import get_password_hash
from app.config import settings


@click.group()
def cli():
    """EVisionBet Management CLI"""
    pass


@cli.command()
def init_db():
    """Initialize database tables"""
    click.echo("Creating database tables...")
    try:
        Base.metadata.create_all(bind=engine)
        click.echo("✓ Database tables created successfully")
    except Exception as e:
        click.echo(f"✗ Error creating tables: {e}", err=True)
        sys.exit(1)


@cli.command()
@click.option('--username', prompt=True, help='Username for new user')
@click.option('--email', prompt=True, help='Email address')
@click.option('--password', prompt=True, hide_input=True, confirmation_prompt=True, help='Password')
@click.option('--superuser', is_flag=True, help='Create as superuser')
def create_user(username, email, password, superuser):
    """Create a new user"""
    db = SessionLocal()
    try:
        # Check if user exists
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            click.echo(f"✗ User '{username}' already exists", err=True)
            sys.exit(1)
        
        # Create user
        user = User(
            username=username,
            email=email,
            hashed_password=get_password_hash(password),
            is_active=True,
            is_superuser=superuser
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        
        role = "superuser" if superuser else "user"
        click.echo(f"✓ Created {role} '{username}' with email '{email}'")
    except Exception as e:
        db.rollback()
        click.echo(f"✗ Error creating user: {e}", err=True)
        sys.exit(1)
    finally:
        db.close()


@cli.command()
def seed_default_user():
    """Create default EVision user for development"""
    db = SessionLocal()
    try:
        username = "EVision"
        existing = db.query(User).filter(User.username == username).first()
        if existing:
            click.echo(f"ℹ User '{username}' already exists")
            return
        
        user = User(
            username=username,
            email="admin@evisionbet.com",
            hashed_password=get_password_hash("PattyMac"),
            is_active=True,
            is_superuser=True
        )
        db.add(user)
        db.commit()
        
        click.echo(f"✓ Created default user: {username} / PattyMac")
    except Exception as e:
        db.rollback()
        click.echo(f"✗ Error seeding user: {e}", err=True)
        sys.exit(1)
    finally:
        db.close()


@cli.command()
def list_users():
    """List all users"""
    db = SessionLocal()
    try:
        users = db.query(User).all()
        if not users:
            click.echo("No users found")
            return
        
        click.echo(f"\nFound {len(users)} users:\n")
        for user in users:
            role = "superuser" if user.is_superuser else "user"
            status = "active" if user.is_active else "inactive"
            click.echo(f"  • {user.username} ({user.email}) - {role}, {status}")
    finally:
        db.close()


@cli.command()
def show_config():
    """Show current configuration"""
    click.echo("\n=== EVisionBet Configuration ===\n")
    click.echo(f"App Name: {settings.APP_NAME}")
    click.echo(f"Version: {settings.VERSION}")
    click.echo(f"Debug: {settings.DEBUG}")
    click.echo(f"Database: {settings.DATABASE_URL[:50]}...")
    click.echo(f"Redis: {settings.REDIS_URL}")
    click.echo(f"CORS Origins: {settings.ALLOWED_ORIGINS}")
    click.echo(f"Odds API: {'Configured' if settings.ODDS_API_KEY else 'Not configured'}")
    click.echo(f"Telegram: {'Enabled' if settings.TELEGRAM_ENABLED else 'Disabled'}")
    click.echo(f"EV Min Edge: {settings.EV_MIN_EDGE * 100}%")
    click.echo(f"Betfair Commission: {settings.BETFAIR_COMMISSION * 100}%")


@cli.command()
def check_health():
    """Check system health"""
    click.echo("\n=== System Health Check ===\n")
    
    # Database
    try:
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        click.echo("✓ Database: Connected")
    except Exception as e:
        click.echo(f"✗ Database: {e}")
    
    # Cache
    try:
        from app.cache import cache
        stats = cache.get_stats()
        backend = stats.get("backend", "unknown")
        click.echo(f"✓ Cache: {backend.capitalize()}")
        if backend == "redis":
            click.echo(f"  - Keys: {stats.get('redis_keys', 0)}")
            click.echo(f"  - Hits: {stats.get('redis_hits', 0)}")
            click.echo(f"  - Misses: {stats.get('redis_misses', 0)}")
    except Exception as e:
        click.echo(f"✗ Cache: {e}")
    
    # Bot data
    try:
        from app.api.ev import EV_CSV_PATH
        if EV_CSV_PATH.exists():
            from datetime import datetime
            mtime = datetime.fromtimestamp(EV_CSV_PATH.stat().st_mtime)
            click.echo(f"✓ Bot Data: Available (updated {mtime.strftime('%Y-%m-%d %H:%M:%S')})")
        else:
            click.echo("ℹ Bot Data: Not yet available")
    except Exception as e:
        click.echo(f"✗ Bot Data: {e}")


@cli.command()
@click.argument('revision', default='head')
def migrate(revision):
    """Run database migrations (alembic upgrade)"""
    import subprocess
    click.echo(f"Running migrations to {revision}...")
    try:
        result = subprocess.run(
            ['alembic', 'upgrade', revision],
            cwd=Path(__file__).parent,
            capture_output=True,
            text=True
        )
        click.echo(result.stdout)
        if result.returncode != 0:
            click.echo(result.stderr, err=True)
            sys.exit(result.returncode)
        click.echo("✓ Migrations completed")
    except FileNotFoundError:
        click.echo("✗ Alembic not found. Install with: pip install alembic", err=True)
        sys.exit(1)


@cli.command()
@click.option('--message', '-m', required=True, help='Migration message')
def makemigrations(message):
    """Generate new migration (alembic revision --autogenerate)"""
    import subprocess
    click.echo(f"Generating migration: {message}...")
    try:
        result = subprocess.run(
            ['alembic', 'revision', '--autogenerate', '-m', message],
            cwd=Path(__file__).parent,
            capture_output=True,
            text=True
        )
        click.echo(result.stdout)
        if result.returncode != 0:
            click.echo(result.stderr, err=True)
            sys.exit(result.returncode)
        click.echo("✓ Migration created")
    except FileNotFoundError:
        click.echo("✗ Alembic not found. Install with: pip install alembic", err=True)
        sys.exit(1)


if __name__ == '__main__':
    cli()
