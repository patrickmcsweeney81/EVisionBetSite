"""Initial placeholder revision (create user table via autogenerate)

Revision ID: 000000000001
Revises: 
Create Date: 2025-11-27

NOTE: Replace this file by running:
    alembic revision --autogenerate -m "initial"
Then delete this placeholder.
"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '000000000001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # This placeholder does nothing; run real autogenerate.
    pass

def downgrade():
    pass
