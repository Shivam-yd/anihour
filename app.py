import os
import logging
import requests
from flask import Flask, render_template, jsonify, request, Response
from flask_cors import CORS
import urllib.parse

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create the Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "anime-tracker-secret-key")
CORS(app)

# Jikan API base URL (MyAnimeList public API)
JIKAN_BASE_URL = "https://api.jikan.moe/v4"

def fetch_from_jikan(endpoint):
    """Fetch data from Jikan API with error handling"""
    try:
        url = f"{JIKAN_BASE_URL}{endpoint}"
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logging.error(f"Error fetching from Jikan API: {e}")
        return None

@app.route('/')
def index():
    """Home page showing current season anime"""
    return render_template('index.html')

@app.route('/top')
def top_anime():
    """Top anime page"""
    return render_template('top_anime.html')

@app.route('/upcoming')
def upcoming():
    """Upcoming anime page"""
    return render_template('upcoming.html')

@app.route('/news')
def news():
    """Anime news page"""
    return render_template('news.html')

@app.route('/anime/<int:anime_id>')
def anime_detail(anime_id):
    """Anime detail page"""
    return render_template('anime_detail.html', anime_id=anime_id)

# API Routes
@app.route('/api/current-season')
def api_current_season():
    """API endpoint for current season anime"""
    data = fetch_from_jikan('/seasons/now')
    if data:
        return jsonify(data)
    return jsonify({'error': 'Failed to fetch current season anime'}), 500

@app.route('/api/top-anime')
def api_top_anime():
    """API endpoint for top anime"""
    anime_type = request.args.get('type', 'tv')
    data = fetch_from_jikan(f'/top/anime?type={anime_type}&limit=25')
    if data:
        return jsonify(data)
    return jsonify({'error': 'Failed to fetch top anime'}), 500

@app.route('/api/upcoming-anime')
def api_upcoming_anime():
    """API endpoint for upcoming anime"""
    data = fetch_from_jikan('/seasons/upcoming')
    if data:
        return jsonify(data)
    return jsonify({'error': 'Failed to fetch upcoming anime'}), 500

@app.route('/api/anime/<int:anime_id>')
def api_anime_detail(anime_id):
    """API endpoint for anime details"""
    data = fetch_from_jikan(f'/anime/{anime_id}/full')
    if data:
        return jsonify(data)
    return jsonify({'error': 'Failed to fetch anime details'}), 500

@app.route('/api/anime/<int:anime_id>/characters')
def api_anime_characters(anime_id):
    """API endpoint for anime characters"""
    data = fetch_from_jikan(f'/anime/{anime_id}/characters')
    if data:
        return jsonify(data)
    return jsonify({'error': 'Failed to fetch anime characters'}), 500

@app.route('/api/search')
def api_search():
    """API endpoint for anime search"""
    query = request.args.get('q', '')
    if not query:
        return jsonify({'error': 'Search query is required'}), 400
    
    data = fetch_from_jikan(f'/anime?q={query}&limit=20')
    if data:
        return jsonify(data)
    return jsonify({'error': 'Failed to search anime'}), 500

@app.route('/api/news')
def api_news():
    """API endpoint for anime news"""
    # Use the top anime news endpoint instead
    data = fetch_from_jikan('/top/anime?limit=10')
    if data:
        # Transform the data to look like news
        news_data = []
        for anime in data.get('data', [])[:10]:
            news_item = {
                'title': f"Top Anime: {anime.get('title', 'Unknown')}",
                'excerpt': anime.get('synopsis', 'No description available.')[:200] + '...' if anime.get('synopsis') else 'No description available.',
                'url': anime.get('url', '#'),
                'date': anime.get('aired', {}).get('from', '2025-01-01'),
                'author_username': 'MyAnimeList'
            }
            news_data.append(news_item)
        return jsonify({'data': news_data})
    return jsonify({'error': 'Failed to fetch anime news'}), 500

@app.route('/api/hero-slideshow-images')
def api_hero_slideshow_images():
    """API endpoint for hero section slideshow images"""
    # Get both current season and top anime for variety
    current_season = fetch_from_jikan('/seasons/now')
    top_anime = fetch_from_jikan('/top/anime?type=tv&limit=15')
    
    images = []
    
    if current_season and current_season.get('data'):
        # Get images from current season anime (first 8)
        for anime in current_season['data'][:8]:
            if anime.get('images', {}).get('jpg', {}).get('large_image_url'):
                images.append({
                    'title': anime.get('title', ''),
                    'image_url': anime['images']['jpg']['large_image_url'],
                    'type': 'current'
                })
    
    if top_anime and top_anime.get('data'):
        # Get images from top anime (first 7)
        for anime in top_anime['data'][:7]:
            if anime.get('images', {}).get('jpg', {}).get('large_image_url'):
                images.append({
                    'title': anime.get('title', ''),
                    'image_url': anime['images']['jpg']['large_image_url'],
                    'type': 'top'
                })
    
    return jsonify({'images': images})

@app.route('/api/image-proxy')
def image_proxy():
    """Proxy images to avoid CORS and ad-blocker issues"""
    image_url = request.args.get('url')
    if not image_url:
        return jsonify({'error': 'URL parameter required'}), 400
    
    # Only allow MyAnimeList CDN images for security
    if not image_url.startswith('https://cdn.myanimelist.net/'):
        return jsonify({'error': 'Invalid image source'}), 400
    
    try:
        response = requests.get(image_url, timeout=10, stream=True)
        response.raise_for_status()
        
        # Return the image with proper headers
        return Response(
            response.content,
            content_type=response.headers.get('content-type', 'image/jpeg'),
            headers={
                'Cache-Control': 'public, max-age=3600',
                'Access-Control-Allow-Origin': '*'
            }
        )
    except requests.exceptions.RequestException as e:
        logging.error(f"Error proxying image {image_url}: {e}")
        return jsonify({'error': 'Failed to load image'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
