"""
Simple scheduler for background tasks
Uses APScheduler (lightweight, no extra dependencies needed)

Install: pip install apscheduler
"""
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
import requests
import logging

logger = logging.getLogger(__name__)

# Your backend URL
API_URL = "http://localhost:8000"


def refresh_all_schedules():
    """
    Call the admin endpoint to refresh all game schedules
    Uses free APIs (ESPN, NHL) - no Odds API credits used
    """
    try:
        logger.info("Starting scheduled refresh of all game schedules...")
        response = requests.post(f"{API_URL}/api/odds/admin/refresh-all-schedules", timeout=30)
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"Schedule refresh completed: {result}")
        else:
            logger.error(f"Schedule refresh failed: {response.status_code}")
            
    except Exception as e:
        logger.error(f"Error refreshing schedules: {e}")


def cleanup_old_data():
    """Cleanup task - could add more cleanup logic here"""
    logger.info("Running cleanup tasks...")
    # Add any cleanup logic here


def setup_scheduler():
    """
    Setup background scheduler with tasks
    
    Schedules:
    - Refresh game schedules: Every 6 hours
    - Cleanup old data: Daily at 2 AM
    """
    scheduler = BackgroundScheduler()
    
    # Refresh schedules every 6 hours
    scheduler.add_job(
        refresh_all_schedules,
        IntervalTrigger(hours=6),
        id='refresh_schedules',
        name='Refresh game schedules from free APIs',
        replace_existing=True
    )
    
    # Cleanup daily at 2 AM
    scheduler.add_job(
        cleanup_old_data,
        CronTrigger(hour=2, minute=0),
        id='cleanup_old_data',
        name='Cleanup old data',
        replace_existing=True
    )
    
    scheduler.start()
    logger.info("Background scheduler started with tasks:")
    scheduler.print_jobs()
    
    return scheduler


if __name__ == "__main__":
    # For testing - run manually
    logging.basicConfig(level=logging.INFO)
    print("Running manual schedule refresh...")
    refresh_all_schedules()
