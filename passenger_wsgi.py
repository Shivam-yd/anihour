#!/usr/bin/python3.9
import sys
import os

# Add your project directory to the Python path
sys.path.insert(0, os.path.dirname(__file__))

# Set environment variables
os.environ['SESSION_SECRET'] = 'anime-tracker-secret-key-for-cpanel-2025'

try:
    # Import your Flask application
    from app import app as application
    
    # Configure for production
    application.config['DEBUG'] = False
    
    # Test route to ensure app is working
    @application.route('/test')
    def test():
        return "Flask app is working on cPanel!"
        
except Exception as e:
    # Create a simple WSGI application for debugging
    def application(environ, start_response):
        status = '500 Internal Server Error'
        headers = [('Content-type', 'text/plain')]
        start_response(status, headers)
        return [f"Error importing Flask app: {str(e)}".encode('utf-8')]

if __name__ == "__main__":
    application.run()