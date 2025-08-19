#!/usr/bin/python3.9
import sys
import os

# Add your project directory to the Python path
sys.path.insert(0, os.path.dirname(__file__))

# Set environment variables
os.environ['SESSION_SECRET'] = 'anime-tracker-secret-key-for-cpanel-2025'

# Import your Flask application
from app import app as application

# Configure for production
application.config['DEBUG'] = False

if __name__ == "__main__":
    application.run()