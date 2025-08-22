// Anime Tracker - Main JavaScript File

class AnimeTracker {
    constructor() {
        this.currentPage = window.location.pathname;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadPageContent();
        this.setupSearch();
        this.setupScrollAnimations();
    }

    setupEventListeners() {
        // Navigation active state
        this.updateNavigation();
        
        // Smooth scroll for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            });
        });
    }

    updateNavigation() {
        const currentPath = window.location.pathname;
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === currentPath) {
                link.classList.add('active');
            }
        });
    }

    setupSearch() {
        const searchForm = document.getElementById('searchForm');
        const searchInput = document.getElementById('searchInput');
        
        if (searchForm && searchInput) {
            searchForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSearch(searchInput.value.trim());
            });

            // Search suggestions (debounced)
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    const query = e.target.value.trim();
                    if (query.length > 2) {
                        this.showSearchSuggestions(query);
                    }
                }, 300);
            });
        }
    }

    async performSearch(query) {
        if (!query) return;

        try {
            this.showLoading('searchResults');
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (response.ok && data.data) {
                this.displaySearchResults(data.data, query);
            } else {
                this.showError('searchResults', 'Failed to search anime');
            }
        } catch (error) {
            console.error('Search error:', error);
            this.showError('searchResults', 'Network error occurred');
        }
    }

    displaySearchResults(results, query) {
        const container = document.getElementById('searchResults');
        if (!container) return;

        if (results.length === 0) {
            container.innerHTML = `
                <div class="error-message">
                    <div class="error-title">No Results Found</div>
                    <p>No anime found for "${query}". Try different keywords.</p>
                </div>
            `;
            return;
        }

        const html = `
            <div class="section-header">
                <h2 class="section-title">Search Results for "${query}"</h2>
                <p class="section-subtitle">Found ${results.length} anime</p>
            </div>
            <div class="anime-grid">
                ${results.map(anime => this.createAnimeCard(anime)).join('')}
            </div>
        `;

        container.innerHTML = html;
        this.setupAnimeCardEvents();
    }

    async showSearchSuggestions(query) {
        // Simple suggestion implementation
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(query)}&limit=5`);
            const data = await response.json();
            
            if (response.ok && data.data) {
                // Implementation for dropdown suggestions can be added here
                console.log('Suggestions:', data.data.slice(0, 5));
            }
        } catch (error) {
            console.error('Suggestions error:', error);
        }
    }

    loadPageContent() {
        switch (this.currentPage) {
            case '/':
                this.loadHomepageSections();
                break;
            case '/top':
                // Let the top anime page handle its own loading with filter buttons
                this.initializeTopAnimePage();
                break;
            case '/upcoming':
                this.loadUpcomingAnime();
                break;
            case '/news':
                this.loadNews();
                break;
            default:
                if (this.currentPage.includes('/anime/')) {
                    const animeId = this.currentPage.split('/anime/')[1];
                    this.loadAnimeDetails(animeId);
                }
        }
    }

    async loadHomepageSections() {
        // Load all homepage sections simultaneously
        await Promise.all([
            this.loadCurrentSeasonSection(),
            this.loadTopAnimeSection(),
            this.loadUpcomingAnimeSection()
        ]);
    }

    async loadCurrentSeasonSection() {
        try {
            this.showLoadingState('currentSeasonAnime');
            const response = await fetch('/api/current-season');
            const data = await response.json();

            console.log('Current season API response:', data);

            if (response.ok && data.data) {
                console.log('Displaying', data.data.length, 'anime');
                this.displayCompactAnimeGrid('currentSeasonAnime', data.data.slice(0, 8), 'Current Season');
            } else {
                console.error('API response not ok:', response.status, data);
                this.showError('currentSeasonAnime', 'Failed to load current season anime');
            }
        } catch (error) {
            console.error('Error loading current season:', error);
            this.showError('currentSeasonAnime', 'Network error occurred');
        }
    }

    async loadTopAnimeSection() {
        try {
            this.showLoadingState('topAnimeSection');
            const response = await fetch('/api/top-anime?limit=8');
            const data = await response.json();

            if (response.ok && data.data) {
                this.displayCompactAnimeGrid('topAnimeSection', data.data.slice(0, 8), 'Top Anime');
            } else {
                this.showError('topAnimeSection', 'Failed to load top anime');
            }
        } catch (error) {
            console.error('Error loading top anime:', error);
            this.showError('topAnimeSection', 'Network error occurred');
        }
    }

    async loadUpcomingAnimeSection() {
        try {
            this.showLoadingState('upcomingAnimeSection');
            const response = await fetch('/api/upcoming-anime');
            const data = await response.json();

            if (response.ok && data.data) {
                this.displayCompactAnimeGrid('upcomingAnimeSection', data.data.slice(0, 8), 'Upcoming Anime');
            } else {
                this.showError('upcomingAnimeSection', 'Failed to load upcoming anime');
            }
        } catch (error) {
            console.error('Error loading upcoming anime:', error);
            this.showError('upcomingAnimeSection', 'Network error occurred');
        }
    }

    showLoadingState(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="loading-state">
                <div class="loading-spinner"></div>
                <p>Loading amazing anime content...</p>
            </div>
        `;
    }

    displayCompactAnimeGrid(containerId, animeList, title) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const html = `
            <div class="anime-grid compact-grid">
                ${animeList.map(anime => this.createAnimeCard(anime)).join('')}
            </div>
        `;

        container.innerHTML = html;
        this.setupAnimeCardEvents();
        
        // Ensure loading states are cleared
        setTimeout(() => {
            const loadingStates = container.querySelectorAll('.loading-state, .loading-spinner');
            loadingStates.forEach(el => el.style.display = 'none');
        }, 100);
    }

    async loadCurrentSeason() {
        try {
            this.showLoading('currentSeasonAnime');
            const response = await fetch('/api/current-season');
            const data = await response.json();

            if (response.ok && data.data) {
                this.displayAnimeGrid('currentSeasonAnime', data.data, 'Current Season Anime');
            } else {
                this.showError('currentSeasonAnime', 'Failed to load current season anime');
            }
        } catch (error) {
            console.error('Error loading current season:', error);
            this.showError('currentSeasonAnime', 'Network error occurred');
        }
    }

    async loadTopAnime() {
        try {
            this.showLoading('topAnimeContent');
            const response = await fetch('/api/top-anime');
            const data = await response.json();

            if (response.ok && data.data) {
                this.displayAnimeGrid('topAnimeContent', data.data, 'Top Rated Anime');
            } else {
                this.showError('topAnimeContent', 'Failed to load top anime');
            }
        } catch (error) {
            console.error('Error loading top anime:', error);
            this.showError('topAnimeContent', 'Network error occurred');
        }
    }

    initializeTopAnimePage() {
        // Top anime page handles its own initialization
        // No action needed from main.js
        console.log('Top anime page initialized');
    }

    async loadUpcomingAnime() {
        try {
            this.showLoading('upcomingAnimeContent');
            const response = await fetch('/api/upcoming-anime');
            const data = await response.json();

            if (response.ok && data.data) {
                this.displayAnimeGrid('upcomingAnimeContent', data.data, 'Upcoming Anime');
            } else {
                this.showError('upcomingAnimeContent', 'Failed to load upcoming anime');
            }
        } catch (error) {
            console.error('Error loading upcoming anime:', error);
            this.showError('upcomingAnimeContent', 'Network error occurred');
        }
    }

    async loadNews() {
        try {
            this.showLoading('newsContent');
            const response = await fetch('/api/news');
            const data = await response.json();

            if (response.ok && data.data) {
                this.displayNews('newsContent', data.data);
            } else {
                this.showError('newsContent', 'Failed to load anime news');
            }
        } catch (error) {
            console.error('Error loading news:', error);
            this.showError('newsContent', 'Network error occurred');
        }
    }

    async loadAnimeDetails(animeId) {
        try {
            this.showLoading('animeDetailsContent');
            const [detailsResponse, charactersResponse] = await Promise.all([
                fetch(`/api/anime/${animeId}`),
                fetch(`/api/anime/${animeId}/characters`)
            ]);

            const detailsData = await detailsResponse.json();
            const charactersData = await charactersResponse.json();

            if (detailsResponse.ok && detailsData.data) {
                this.displayAnimeDetails('animeDetailsContent', detailsData.data, charactersData.data || []);
            } else {
                this.showError('animeDetailsContent', 'Failed to load anime details');
            }
        } catch (error) {
            console.error('Error loading anime details:', error);
            this.showError('animeDetailsContent', 'Network error occurred');
        }
    }

    displayAnimeGrid(containerId, animeList, title) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const html = `
            <div class="section-header">
                <h2 class="section-title">${title}</h2>
                <p class="section-subtitle">Discover amazing anime series</p>
            </div>
            <div class="anime-grid">
                ${animeList.map(anime => this.createAnimeCard(anime)).join('')}
            </div>
        `;

        container.innerHTML = html;
        this.setupAnimeCardEvents();
    }

    createAnimeCard(anime) {
        const rating = anime.score ? anime.score.toFixed(1) : 'N/A';
        const status = this.formatStatus(anime.status);
        
        // Extract studio information
        const studio = anime.studios && anime.studios.length > 0 ? anime.studios[0].name : 
                      (anime.producers && anime.producers.length > 0 ? anime.producers[0].name : '');
        
        // More robust image URL handling with proxy
        let image = '';
        if (anime.images && anime.images.jpg) {
            const originalImage = anime.images.jpg.large_image_url || anime.images.jpg.image_url || anime.images.jpg.small_image_url;
            if (originalImage && originalImage.startsWith('https://cdn.myanimelist.net/')) {
                image = `/api/image-proxy?url=${encodeURIComponent(originalImage)}`;
            } else {
                image = originalImage;
            }
        } else if (anime.image_url) {
            if (anime.image_url.startsWith('https://cdn.myanimelist.net/')) {
                image = `/api/image-proxy?url=${encodeURIComponent(anime.image_url)}`;
            } else {
                image = anime.image_url;
            }
        }
        
        console.log('Creating card for:', anime.title, 'Proxied Image URL:', image);
        
        // Use placeholder if no valid image found
        if (!image) {
            image = this.getPlaceholderImage();
        }
        
        const synopsis = anime.synopsis ? this.truncateText(anime.synopsis, 150) : 'No synopsis available.';
        const placeholderImg = this.getPlaceholderImage();
        
        return `
            <div class="anime-card" data-anime-id="${anime.mal_id}">
                <div class="anime-card-image-container">
                    <img src="${image}" 
                         alt="${anime.title}" 
                         class="anime-card-img" 
                         loading="lazy"
                         onerror="console.error('Image failed to load:', this.src); this.src='${placeholderImg}'; this.onerror=null; this.setAttribute('data-loaded', 'true'); this.parentElement.classList.add('loaded');"
                         onload="console.log('Image loaded:', this.alt); this.setAttribute('data-loaded', 'true'); this.parentElement.classList.add('loaded');">
                    ${studio ? `<div class="anime-studio">${studio}</div>` : ''}
                    <div class="anime-card-overlay">
                        <i class="fas fa-play-circle"></i>
                    </div>
                </div>
                <div class="anime-card-body">
                    <h3 class="anime-card-title">${anime.title}</h3>
                    <div class="anime-card-info">
                        <span class="anime-rating">★ ${rating}</span>
                        <span class="anime-status status-${status.toLowerCase()}">${status}</span>
                    </div>
                    <p class="anime-synopsis">${synopsis}</p>
                </div>
            </div>
        `;
    }

    getPlaceholderImage() {
        // Generate a colorful placeholder SVG for anime cards
        return `data:image/svg+xml;charset=UTF-8,%3csvg width='300' height='400' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3clinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3e%3cstop offset='0%25' style='stop-color:%23ff6b9d;stop-opacity:1' /%3e%3cstop offset='100%25' style='stop-color:%234ecdc4;stop-opacity:1' /%3e%3c/linearGradient%3e%3c/defs%3e%3crect width='300' height='400' fill='url(%23grad)'/%3e%3ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='18' fill='white' text-anchor='middle' dy='.3em'%3eAnime Image%3c/text%3e%3c/svg%3e`;
    }

    displayAnimeDetails(containerId, anime, characters) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const rating = anime.score ? anime.score.toFixed(1) : 'N/A';
        
        // Better image handling for details page with proxy
        let image = '';
        if (anime.images && anime.images.jpg) {
            const originalImage = anime.images.jpg.large_image_url || anime.images.jpg.image_url || anime.images.jpg.small_image_url;
            if (originalImage && originalImage.startsWith('https://cdn.myanimelist.net/')) {
                image = `/api/image-proxy?url=${encodeURIComponent(originalImage)}`;
            } else {
                image = originalImage;
            }
        } else if (anime.image_url) {
            if (anime.image_url.startsWith('https://cdn.myanimelist.net/')) {
                image = `/api/image-proxy?url=${encodeURIComponent(anime.image_url)}`;
            } else {
                image = anime.image_url;
            }
        }
        
        if (!image) {
            image = this.getPlaceholderImage();
        }
        
        const synopsis = anime.synopsis || 'No synopsis available.';
        const genres = anime.genres ? anime.genres.map(g => g.name).join(', ') : 'Unknown';
        
        const html = `
            <div class="anime-detail-hero">
                <div class="container">
                    <div class="row">
                        <div class="col-md-4">
                            <img src="${image}" alt="${anime.title}" class="anime-detail-img">
                        </div>
                        <div class="col-md-8 anime-detail-info">
                            <h1>${anime.title}</h1>
                            <p class="lead">${synopsis}</p>
                            <div class="anime-stats">
                                <div class="stat-item">
                                    <span class="stat-value">★ ${rating}</span>
                                    <div class="stat-label">Rating</div>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">${anime.episodes || 'Unknown'}</span>
                                    <div class="stat-label">Episodes</div>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">${this.formatStatus(anime.status)}</span>
                                    <div class="stat-label">Status</div>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value">${anime.year || 'Unknown'}</span>
                                    <div class="stat-label">Year</div>
                                </div>
                            </div>
                            <p><strong>Genres:</strong> ${genres}</p>
                            <p><strong>Type:</strong> ${anime.type || 'Unknown'}</p>
                            <p><strong>Duration:</strong> ${anime.duration || 'Unknown'}</p>
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    displayNews(containerId, newsList) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const html = `
            <div class="section-header">
                <h2 class="section-title">Latest Anime News</h2>
                <p class="section-subtitle">Stay updated with the latest anime industry news</p>
            </div>
            <div class="row">
                <div class="col-12">
                    ${newsList.slice(0, 20).map(news => this.createNewsCard(news)).join('')}
                </div>
            </div>
        `;

        container.innerHTML = html;
    }

    createNewsCard(news) {
        const date = new Date(news.date).toLocaleDateString();
        const author = news.author_username || 'MyAnimeList';
        
        return `
            <div class="news-card">
                <h3 class="news-title">${news.title}</h3>
                <div class="news-meta">
                    <span>By ${author}</span>
                    <span>${date}</span>
                </div>
                <div class="news-content">
                    ${this.truncateText(news.excerpt || '', 200)}
                    <a href="${news.url}" target="_blank" class="text-primary">Read more →</a>
                </div>
            </div>
        `;
    }

    setupAnimeCardEvents() {
        const animeCards = document.querySelectorAll('.anime-card');
        animeCards.forEach(card => {
            card.addEventListener('click', () => {
                const animeId = card.dataset.animeId;
                if (animeId) {
                    window.location.href = `/anime/${animeId}`;
                }
            });
        });
    }

    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);

        // Observe elements when they're added to the DOM
        const observeElements = () => {
            const elements = document.querySelectorAll('.anime-card, .news-card');
            elements.forEach(el => observer.observe(el));
        };

        // Initial observation
        observeElements();
        
        // Re-observe after content updates
        const originalDisplay = this.displayAnimeGrid;
        this.displayAnimeGrid = function(...args) {
            originalDisplay.apply(this, args);
            setTimeout(observeElements, 100);
        };
    }

    showLoading(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="loading">
                <div class="loading-spinner"></div>
                <p>Loading amazing anime content...</p>
            </div>
        `;
    }

    showError(containerId, message) {
        const container = document.getElementById(containerId);
        if (!container) return;

        container.innerHTML = `
            <div class="error-message">
                <div class="error-title">Oops! Something went wrong</div>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
            </div>
        `;
    }

    formatStatus(status) {
        if (!status) return 'Unknown';
        
        const statusMap = {
            'Currently Airing': 'Airing',
            'Not yet aired': 'Upcoming',
            'Finished Airing': 'Completed'
        };
        
        return statusMap[status] || status;
    }

    truncateText(text, length) {
        if (!text) return '';
        return text.length > length ? text.substring(0, length) + '...' : text;
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new AnimeTracker();
});

// Service Worker removed to prevent errors
