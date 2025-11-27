# EVisionBet Management CLI

## Installation
```bash
cd backend-python
pip install click  # If not already installed
```

## Available Commands

### Database Management

**Initialize database tables:**
```bash
python manage.py init-db
```

**Run migrations:**
```bash
python manage.py migrate
python manage.py migrate head  # Explicit version
```

**Generate new migration:**
```bash
python manage.py makemigrations -m "add user preferences table"
```

### User Management

**Create a new user:**
```bash
python manage.py create-user
# Interactive prompts for username, email, password
# Add --superuser flag for admin users
```

**Seed default development user:**
```bash
python manage.py seed-default-user
# Creates: EVision / PattyMac (superuser)
```

**List all users:**
```bash
python manage.py list-users
```

### System Operations

**Show configuration:**
```bash
python manage.py show-config
```

**Health check:**
```bash
python manage.py check-health
# Checks: Database, Cache (Redis/memory), Bot data availability
```

## Usage Examples

### First-time Setup
```bash
# 1. Initialize database
python manage.py init-db

# 2. Create default user for development
python manage.py seed-default-user

# 3. Check health
python manage.py check-health
```

### Production Deployment
```bash
# 1. Run migrations
python manage.py migrate

# 2. Create admin user
python manage.py create-user --superuser

# 3. Verify configuration
python manage.py show-config
```

### Development Workflow
```bash
# After model changes:
python manage.py makemigrations -m "description of change"
python manage.py migrate

# Quick health check:
python manage.py check-health
```

## Command Reference

| Command | Description |
|---------|-------------|
| `init-db` | Create all database tables |
| `migrate [revision]` | Run database migrations |
| `makemigrations -m <msg>` | Generate new migration |
| `create-user` | Create new user interactively |
| `seed-default-user` | Create EVision/PattyMac user |
| `list-users` | Show all users |
| `show-config` | Display configuration |
| `check-health` | System health status |

## Notes

- All commands respect `.env` configuration
- Database URL and other settings are loaded from environment
- Use `--help` on any command for detailed options
- Migrations require `alembic` to be installed
