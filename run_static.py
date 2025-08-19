#!/usr/bin/env python3
import http.server
import socketserver
import os
import sys

class CORSHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_GET(self):
        # Serve index.html for root requests
        if self.path == '/':
            self.path = '/index.html'
        return super().do_GET()

def run_server():
    PORT = 5000
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    
    print(f"Starting Anihour static server on port {PORT}")
    print(f"Serving from: {os.getcwd()}")
    print(f"Files available: {[f for f in os.listdir('.') if f.endswith(('.html', '.css', '.js'))]}")
    
    try:
        with socketserver.TCPServer(("0.0.0.0", PORT), CORSHTTPRequestHandler) as httpd:
            print(f"✓ Anihour anime app is running at http://localhost:{PORT}")
            httpd.serve_forever()
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    run_server()