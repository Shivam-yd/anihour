import os
import logging
import requests
from flask import Flask, render_template, jsonify, request, Response
from flask_cors import CORS
import urllib.parse
import time
from functools import lru_cache
from datetime import datetime

# Configure logging
logging.basicConfig(level=logging.DEBUG)

# Create the Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "anime-tracker-secret-key")
CORS(app)

# Template context processor for current year
@app.context_processor
def inject_current_year():
    return {'current_year': datetime.now().year}

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
        response = requests.get(url, timeout=5)  # Reduced timeout
        response.raise_for_status()
        data = response.json()
        
        # Cache the response
        cache[cache_key] = (data, current_time)
        
        # Clean old cache entries (basic cleanup)
        if len(cache) > 100:
            old_keys = [k for k, (_, t) in cache.items() if current_time - t > CACHE_DURATION]
            for key in old_keys[:50]:  # Remove oldest 50 entries
                cache.pop(key, None)
        
        return data
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
    """Enhanced API endpoint for anime search with filters"""
    query = request.args.get('q', '')
    
    # Build the search URL with parameters
    search_params = ['limit=20']
    
    # Add query if provided
    if query:
        search_params.append(f'q={urllib.parse.quote(query)}')
    else:
        # If no query, we'll use browse endpoints with filters
        pass
    
    # Add status filter
    status = request.args.get('status')
    if status:
        search_params.append(f'status={status}')
    
    # Add type filter
    anime_type = request.args.get('type')
    if anime_type:
        search_params.append(f'type={anime_type}')
    
    # Add genres filter (comma-separated genre IDs)
    genres = request.args.get('genres')
    if genres:
        search_params.append(f'genres={genres}')
    
    # Add rating filter if provided
    rating = request.args.get('rating')
    if rating:
        search_params.append(f'rating={rating}')
    
    # Add order by if provided
    order_by = request.args.get('order_by', 'score')
    sort = request.args.get('sort', 'desc')
    search_params.extend([f'order_by={order_by}', f'sort={sort}'])
    
    # Choose appropriate endpoint based on whether we have filters or query
    if not query and not any([status, anime_type, genres]):
        # No query and no filters - return top anime
        search_url = f"/top/anime?type=tv&limit=20"
    elif not query:
        # No query but have filters - use search with wildcard or browse
        # For filter-only searches, we can use the anime endpoint with just filters
        search_url = f"/anime?{'&'.join(search_params)}"
    else:
        # Has query - normal search
        search_url = f"/anime?{'&'.join(search_params)}"
    
    logging.debug(f"Search URL: {search_url}")
    
    data = fetch_from_jikan(search_url)
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
                'date': anime.get('aired', {}).get('from', f'{datetime.now().year}-01-01'),
                'author_username': 'MyAnimeList'
            }
            news_data.append(news_item)
        return jsonify({'data': news_data})
    return jsonify({'error': 'Failed to fetch anime news'}), 500

@app.route('/api/hero-slideshow-images')
def api_hero_slideshow_images():
    """Optimized API endpoint for hero section slideshow images"""
    # Get both current season and top anime for variety (reduced limits for speed)
    current_season = fetch_from_jikan('/seasons/now')
    top_anime = fetch_from_jikan('/top/anime?type=tv&limit=10')  # Reduced from 15
    
    images = []
    
    if current_season and current_season.get('data'):
        # Get images from current season anime (reduced to 6 for faster loading)
        for anime in current_season['data'][:6]:
            if anime.get('images', {}).get('jpg', {}).get('large_image_url'):
                images.append({
                    'title': anime.get('title', ''),
                    'image_url': anime['images']['jpg']['large_image_url'],
                    'type': 'current'
                })
    
    if top_anime and top_anime.get('data'):
        # Get images from top anime (reduced to 4 for faster loading)
        for anime in top_anime['data'][:4]:
            if anime.get('images', {}).get('jpg', {}).get('large_image_url'):
                images.append({
                    'title': anime.get('title', ''),
                    'image_url': anime['images']['jpg']['large_image_url'],
                    'type': 'top'
                })
    
    # Add cache headers for this endpoint too
    response = jsonify({'images': images})
    response.headers['Cache-Control'] = 'public, max-age=300'  # 5 minutes
    return response

# SEO Routes
@app.route('/sitemap.xml')
def sitemap():
    """Generate XML sitemap for search engines"""
    from datetime import datetime
    
    # Get current date in ISO format
    today = datetime.now().strftime('%Y-%m-%d')
    
    # Define your website pages with priorities
    pages = [
        {'url': '/', 'changefreq': 'daily', 'priority': '1.0'},
        {'url': '/top', 'changefreq': 'weekly', 'priority': '0.9'},
        {'url': '/upcoming', 'changefreq': 'daily', 'priority': '0.8'},
        {'url': '/news', 'changefreq': 'daily', 'priority': '0.7'},
    ]
    
    # Create XML sitemap
    xml_content = '''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'''
    
    for page in pages:
        xml_content += f'''
    <url>
        <loc>{request.host_url.rstrip('/')}{page['url']}</loc>
        <lastmod>{today}</lastmod>
        <changefreq>{page['changefreq']}</changefreq>
        <priority>{page['priority']}</priority>
    </url>'''
    
    xml_content += '''
</urlset>'''
    
    response = Response(xml_content, mimetype='application/xml')
    response.headers['Cache-Control'] = 'public, max-age=86400'  # 24 hours cache
    return response

@app.route('/robots.txt')
def robots():
    """Serve robots.txt with proper host"""
    robots_content = f"""User-agent: *
Allow: /
Allow: /static/
Allow: /api/

# Enhanced crawling directives for SEO
Crawl-delay: 1

# Priority pages for search engines
Allow: /top
Allow: /upcoming  
Allow: /news
Allow: /anime/

# Block unnecessary paths
Disallow: /admin/
Disallow: /private/
Disallow: /temp/
Disallow: /*.json$
Disallow: /*?*&*

# XML Sitemap location
Sitemap: {request.host_url}sitemap.xml

# Specific bot instructions
User-agent: Googlebot
Allow: /
Crawl-delay: 1

User-agent: Bingbot  
Allow: /
Crawl-delay: 2

User-agent: facebookexternalhit
Allow: /

User-agent: Twitterbot
Allow: /"""
    
    response = Response(robots_content, mimetype='text/plain')
    response.headers['Cache-Control'] = 'public, max-age=86400'  # 24 hours cache
    return response

@app.route('/api/image-proxy')
def image_proxy():
    """Optimized image proxy with caching and better performance"""
    image_url = request.args.get('url')
    if not image_url:
        return jsonify({'error': 'URL parameter required'}), 400
    
    # Only allow MyAnimeList CDN images for security
    if not image_url.startswith('https://cdn.myanimelist.net/'):
        return jsonify({'error': 'Invalid image source'}), 400
    
    # Use image URL as cache key
    cache_key = f"img_{hash(image_url)}"
    current_time = time.time()
    
    # Check cache first for images (longer cache duration)
    if cache_key in cache:
        cached_data, timestamp = cache[cache_key]
        if current_time - timestamp < 1800:  # 30 minutes for images
            return Response(
                cached_data['content'],
                content_type=cached_data['content_type'],
                headers=cached_data['headers']
            )
    
    try:
        # Optimized request with better headers
        response = requests.get(
            image_url, 
            timeout=8,
            stream=True,
            headers={
                'User-Agent': 'Mozilla/5.0 (compatible; AnihourBot/1.0)',
                'Accept': 'image/webp,image/avif,image/*,*/*;q=0.8'
            }
        )
        response.raise_for_status()
        
        # Optimize response headers
        headers = {
            'Cache-Control': 'public, max-age=7200, immutable',  # 2 hours cache
            'Access-Control-Allow-Origin': '*',
            'Content-Type': response.headers.get('content-type', 'image/jpeg'),
            'X-Content-Type-Options': 'nosniff'
        }
        
        # Cache the image response
        cached_data = {
            'content': response.content,
            'content_type': response.headers.get('content-type', 'image/jpeg'),
            'headers': headers
        }
        cache[cache_key] = (cached_data, current_time)
        
        return Response(
            response.content,
            content_type=response.headers.get('content-type', 'image/jpeg'),
            headers=headers
        )
    except requests.exceptions.RequestException as e:
        logging.error(f"Error proxying image {image_url}: {e}")
        return jsonify({'error': 'Failed to load image'}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
