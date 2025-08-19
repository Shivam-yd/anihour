# Anime Tracker

## Overview

Anime Tracker is a web application built with Flask that serves as a comprehensive anime discovery platform. It leverages the Jikan API (MyAnimeList's public API) to provide users with current season anime, top-rated series, upcoming releases, and anime news. The application features a modern, responsive interface with gradient designs and smooth animations, offering an engaging experience for anime enthusiasts to discover and track their favorite shows.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Template Engine**: Jinja2 templating with Flask for server-side rendering
- **CSS Framework**: Bootstrap 5 for responsive grid system and components
- **Styling Approach**: Custom CSS with CSS variables for theming, featuring anime-inspired gradients and dark theme
- **JavaScript**: Vanilla JavaScript with class-based architecture for client-side functionality
- **Icons**: Font Awesome for consistent iconography
- **Responsive Design**: Mobile-first approach with Bootstrap's responsive utilities

### Backend Architecture
- **Web Framework**: Flask with CORS support for cross-origin requests
- **API Integration**: RESTful integration with Jikan API v4 for anime data
- **Error Handling**: Comprehensive exception handling for API requests with timeout configuration
- **Logging**: Python's logging module configured for debugging
- **Session Management**: Flask's built-in session handling with configurable secret key

### Data Management
- **Data Source**: External API dependency on Jikan (MyAnimeList public API)
- **Caching Strategy**: No persistent data storage - real-time API fetching
- **Data Flow**: Client → Flask routes → Jikan API → JSON responses → Template rendering

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