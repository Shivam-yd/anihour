from flask import Flask, send_from_directory, send_file
import os

app = Flask(__name__)

@app.route('/')
def index():
    return send_file('index.html')

@app.route('/<path:path>')
def serve_static(path):
    if os.path.exists(path):
        return send_file(path)
    else:
        return send_file('index.html')  # Fallback to index.html for SPA

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
