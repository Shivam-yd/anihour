#!/usr/bin/python3.9
import sys
import os

# Add your project directory to the Python path  
sys.path.insert(0, os.path.dirname(__file__))

# Set environment variables
os.environ['SESSION_SECRET'] = 'anime-tracker-secret-key-for-cpanel-2025'

try:
    # Try to import the main app first
    from app import app as application
except ImportError as e:
    try:
        # If main app fails, try simplified version
        from app_simple import app as application
    except ImportError as e2:
        # Create a minimal WSGI app for debugging
        from flask import Flask
        application = Flask(__name__)
        
        @application.route('/')
        def error_page():
            return f"""
            <h1>Import Error</h1>
            <p>Main app error: {str(e)}</p>
            <p>Simple app error: {str(e2)}</p>
            <p>Python path: {sys.path}</p>
            <p>Current directory: {os.getcwd()}</p>
            <p>Files in directory: {os.listdir('.')}</p>
            """

# Configure for production
if hasattr(application, 'config'):
    application.config['DEBUG'] = False

if __name__ == "__main__":
    application.run()