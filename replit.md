# Anihour

## Overview

Anihour is a colorful and professional anime tracking web application built as a static frontend application with vanilla JavaScript. It serves as a comprehensive anime discovery platform that fetches real-time data directly from the Jikan API (MyAnimeList's public API) to display current season anime, top-rated series, upcoming releases, and anime news. The application features a vibrant, responsive interface with anime-inspired gradients, smooth animations, and professional styling, offering an engaging experience for anime enthusiasts to discover their favorite shows.

## Recent Changes (August 19, 2025)

✓ **Pure Static Version Created**: Built `index_static.html` with original GitHub design restored
✓ **No Backend Required**: Completely eliminated Python/Flask dependencies  
✓ **Original Hero Slideshow**: Restored beautiful anime background slideshow from original design
✓ **Authentic Styling**: Maintained all original colorful gradients and visual elements
✓ **Universal Deployment**: Works on any static hosting without server requirements
✓ **Real API Integration**: Direct JavaScript connection to Jikan API for live anime data

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Static HTML**: Single-page application using pure HTML5
- **CSS Framework**: Bootstrap 5 for responsive grid system and components
- **Styling Approach**: Custom CSS with CSS variables for theming, featuring anime-inspired gradients and dark theme
- **JavaScript**: Vanilla JavaScript with class-based architecture for client-side functionality
- **Icons**: Font Awesome for consistent iconography
- **Responsive Design**: Mobile-first approach with Bootstrap's responsive utilities

### Backend Architecture
- **Static Serving**: Simple Python HTTP server for development (production uses static hosting)
- **API Integration**: Direct client-side integration with Jikan API v4 for anime data
- **Error Handling**: Comprehensive exception handling for API requests with timeout configuration
- **Caching**: Client-side caching with Map-based storage and TTL expiration
- **No Server Dependencies**: Fully static application that runs entirely in the browser

### Data Management
- **Data Source**: External API dependency on Jikan (MyAnimeList public API)
- **Caching Strategy**: Client-side Map-based caching with 5-minute TTL
- **Data Flow**: Client JavaScript → Jikan API → JSON responses → DOM manipulation

### Application Structure
- **Routing**: Modular route handlers for different anime categories (current, top, upcoming, news, details)
- **Template Inheritance**: Base template system with consistent navigation and styling
- **Static Assets**: Organized CSS and JavaScript files with proper asset management
- **Configuration**: Environment-based configuration for API secrets and debugging

## External Dependencies

### APIs and Services
- **Jikan API v4**: Primary data source for anime information, ratings, and metadata
- **MyAnimeList**: Underlying data source through Jikan API proxy
- **Pixabay CDN**: External image hosting for background images and visual elements

### Frontend Libraries
- **Bootstrap 5.3.0**: CSS framework from CDN for responsive design
- **Font Awesome 6.4.0**: Icon library from CDN for UI elements
- **Vanilla JavaScript**: No frontend framework dependencies, pure JavaScript implementation

### Python Dependencies
- **Flask**: Core web framework
- **Flask-CORS**: Cross-origin resource sharing support
- **Requests**: HTTP library for API communication
- **Standard Library**: Logging, OS modules for configuration

### Infrastructure Requirements
- **Python Runtime**: Flask-compatible Python environment
- **Static File Serving**: Flask's built-in static file handling
- **Environment Variables**: SESSION_SECRET for session security
- **Internet Connectivity**: Required for real-time API data fetching