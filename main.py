from flask import Flask, send_file
import os

app = Flask(__name__)

@app.route('/')
def index():
    return send_file('index_static.html')

@app.route('/<path:path>')
def serve_static_files(path):
    if os.path.exists(path):
        return send_file(path)
    return send_file('index_static.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
