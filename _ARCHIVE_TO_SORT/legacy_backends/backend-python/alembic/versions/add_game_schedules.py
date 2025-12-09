"""
Create game_schedules table

Revision ID: add_game_schedules
Revises: 
Create Date: 2025-11-28
"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'add_game_schedules'
down_revision = None  # Update this to your last migration
branch_labels = None
depends_on = None


def upgrade():
    op.create_table(
        'game_schedules',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('external_id', sa.String(), nullable=False),
        sa.Column('sport_key', sa.String(), nullable=False),
        sa.Column('home_team', sa.String(), nullable=False),
        sa.Column('away_team', sa.String(), nullable=False),
        sa.Column('commence_time', sa.DateTime(timezone=True), nullable=False),
        sa.Column('source', sa.String(), nullable=True),
        sa.Column('status', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id')
    )
    
    # Create indexes
    op.create_index('ix_game_schedules_external_id', 'game_schedules', ['external_id'], unique=True)
    op.create_index('ix_game_schedules_sport_key', 'game_schedules', ['sport_key'], unique=False)
    op.create_index('ix_game_schedules_commence_time', 'game_schedules', ['commence_time'], unique=False)
    op.create_index('ix_game_schedules_status', 'game_schedules', ['status'], unique=False)
    op.create_index('idx_sport_commence', 'game_schedules', ['sport_key', 'commence_time'], unique=False)
    op.create_index('idx_status_commence', 'game_schedules', ['status', 'commence_time'], unique=False)


def downgrade():
    op.drop_index('idx_status_commence', table_name='game_schedules')
    op.drop_index('idx_sport_commence', table_name='game_schedules')
    op.drop_index('ix_game_schedules_status', table_name='game_schedules')
    op.drop_index('ix_game_schedules_commence_time', table_name='game_schedules')
    op.drop_index('ix_game_schedules_sport_key', table_name='game_schedules')
    op.drop_index('ix_game_schedules_external_id', table_name='game_schedules')
    op.drop_table('game_schedules')
