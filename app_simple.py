#!/usr/bin/python3.9
"""
Simplified Flask app for cPanel compatibility with Python 3.9
"""
import os
import logging
import requests
from flask import Flask, render_template, jsonify, request, Response
try:
    from flask_cors import CORS
except ImportError:
    CORS = None
import time

# Configure logging
logging.basicConfig(level=logging.INFO)

# Create the Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "anime-tracker-secret-key-cpanel")

# Only enable CORS if available
if CORS:
    CORS(app)

# Jikan API base URL (MyAnimeList public API)
JIKAN_BASE_URL = "https://api.jikan.moe/v4"

# Simple in-memory cache
cache = {}
CACHE_DURATION = 300  # 5 minutes

def fetch_from_jikan(endpoint):
    """Fetch data from Jikan API with caching and error handling"""
    cache_key = endpoint
    current_time = time.time()
    
    # Check cache first
    if cache_key in cache:
        cached_data, timestamp = cache[cache_key]
        if current_time - timestamp < CACHE_DURATION:
            return cached_data
    
    try:
        url = f"{JIKAN_BASE_URL}{endpoint}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        
        # Cache the response
        cache[cache_key] = (data, current_time)
        
        return data
    except Exception as e:
        logging.error(f"Error fetching from Jikan API: {e}")
        return {"data": [], "error": str(e)}

@app.route('/')
def index():
    """Home page showing current season anime"""
    try:
        return render_template('index.html')
    except Exception as e:
        return f"Error loading homepage: {str(e)}"

@app.route('/test')
def test():
    """Test route to verify app is working"""
    return "Anihour Flask app is working on cPanel!"

@app.route('/top')
def top_anime():
    """Top anime page"""
    try:
        return render_template('top_anime.html')
    except Exception as e:
        return f"Error loading top anime page: {str(e)}"

@app.route('/upcoming')
def upcoming():
    """Upcoming anime page"""
    try:
        return render_template('upcoming.html')
    except Exception as e:
        return f"Error loading upcoming page: {str(e)}"

@app.route('/news')
def news():
    """Anime news page"""
    try:
        return render_template('news.html')
    except Exception as e:
        return f"Error loading news page: {str(e)}"

@app.route('/anime/<int:anime_id>')
def anime_detail(anime_id):
    """Anime detail page"""
    try:
        return render_template('anime_detail.html', anime_id=anime_id)
    except Exception as e:
        return f"Error loading anime detail page: {str(e)}"

# API Routes
@app.route('/api/current-season')
def api_current_season():
    """API endpoint for current season anime"""
    try:
        data = fetch_from_jikan('/seasons/now')
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': f'Failed to fetch current season anime: {str(e)}'}), 500

@app.route('/api/top-anime')
def api_top_anime():
    """API endpoint for top anime"""
    try:
        anime_type = request.args.get('type', 'tv')
        data = fetch_from_jikan(f'/top/anime?type={anime_type}&limit=25')
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': f'Failed to fetch top anime: {str(e)}'}), 500

@app.route('/api/upcoming-anime')
def api_upcoming_anime():
    """API endpoint for upcoming anime"""
    try:
        data = fetch_from_jikan('/seasons/upcoming')
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': f'Failed to fetch upcoming anime: {str(e)}'}), 500

@app.route('/api/anime/<int:anime_id>')
def api_anime_detail(anime_id):
    """API endpoint for anime details"""
    try:
        data = fetch_from_jikan(f'/anime/{anime_id}/full')
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': f'Failed to fetch anime details: {str(e)}'}), 500

@app.route('/api/search')
def api_search():
    """API endpoint for anime search"""
    try:
        query = request.args.get('q', '')
        if not query:
            return jsonify({'error': 'Search query is required'}), 400
        
        data = fetch_from_jikan(f'/anime?q={query}&limit=20')
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': f'Failed to search anime: {str(e)}'}), 500

@app.route('/api/hero-slideshow-images')
def api_hero_slideshow_images():
    """API endpoint for hero section slideshow images"""
    try:
        # Get current season anime for slideshow
        current_season = fetch_from_jikan('/seasons/now')
        
        images = []
        
        if current_season and current_season.get('data'):
            # Get images from current season anime
            for anime in current_season['data'][:10]:
                if anime.get('images', {}).get('jpg', {}).get('large_image_url'):
                    images.append({
                        'title': anime.get('title', ''),
                        'image_url': anime['images']['jpg']['large_image_url'],
                        'type': 'current'
                    })
        
        response = jsonify({'images': images})
        response.headers['Cache-Control'] = 'public, max-age=300'
        return response
    except Exception as e:
        return jsonify({'error': f'Failed to fetch slideshow images: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=False)