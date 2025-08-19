// Anihour - Static Version Main JavaScript

class AnihourStatic {
    constructor() {
        this.apiBase = 'https://api.jikan.moe/v4';
        this.cache = new Map();
        this.cacheDuration = 5 * 60 * 1000; // 5 minutes
        this.heroImages = [];
        this.currentHeroIndex = 0;
        this.slideShowInterval = null;
        
        this.init();
    }

    async init() {
        console.log('Initializing Anihour app...');
        this.setupNavigation();
        this.setupSearch();
        
        // Load content sequentially with delays
        await this.loadHeroSection();
        await this.delay(1500);
        await this.loadCurrentSeason();
        await this.delay(1500);
        await this.loadTopAnime();
        await this.delay(1500);
        await this.loadUpcoming();
        await this.delay(1500);
        await this.loadNews();
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    async fetchFromAPI(endpoint) {
        const cacheKey = endpoint;
        const now = Date.now();
        
        // Check cache first
        if (this.cache.has(cacheKey)) {
            const { data, timestamp } = this.cache.get(cacheKey);
            if (now - timestamp < this.cacheDuration) {
                console.log(`Using cached data for ${endpoint}`);
                return data;
            }
        }
        
        try {
            console.log(`Fetching from API: ${endpoint}`);
            const response = await fetch(`${this.apiBase}${endpoint}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            this.cache.set(cacheKey, { data, timestamp: now });
            
            return data;
        } catch (error) {
            console.error(`Error fetching ${endpoint}:`, error);
            return null;
        }
    }

    setupNavigation() {
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const target = link.getAttribute('href');
                
                // Update active states
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                
                // Smooth scroll to section
                if (target.startsWith('#')) {
                    const section = document.querySelector(target);
                    if (section) {
                        section.scrollIntoView({ 
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });

        // Update active nav on scroll
        window.addEventListener('scroll', this.updateActiveNav.bind(this));
    }

    updateActiveNav() {
        const sections = ['home', 'current-season', 'top', 'upcoming', 'news'];
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        
        let current = '';
        sections.forEach(sectionId => {
            const section = document.getElementById(sectionId) || document.getElementById(sectionId.replace('-', ''));
            if (section) {
                const rect = section.getBoundingClientRect();
                if (rect.top <= 100 && rect.bottom >= 100) {
                    current = sectionId;
                }
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${current}` || (current === 'home' && href === '#home')) {
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
        }
    }

    async performSearch(query) {
        if (!query || query.length < 3) return;
        
        try {
            const data = await this.fetchFromAPI(`/anime?q=${encodeURIComponent(query)}&limit=20`);
            if (data && data.data) {
                this.displaySearchResults(data.data, query);
            }
        } catch (error) {
            console.error('Search error:', error);
        }
    }

    displaySearchResults(results, query) {
        // You can implement a modal or dedicated section for search results
        console.log(`Search results for "${query}":`, results);
    }

    async loadHeroSection() {
        try {
            // Get top anime for hero slideshow
            const data = await this.fetchFromAPI('/top/anime?type=tv&limit=10');
            if (data && data.data) {
                this.heroImages = data.data.map(anime => ({
                    title: anime.title,
                    image: anime.images?.jpg?.large_image_url || anime.images?.jpg?.image_url,
                    type: anime.type,
                    score: anime.score,
                    synopsis: anime.synopsis
                })).filter(item => item.image);
                
                if (this.heroImages.length > 0) {
                    this.startHeroSlideshow();
                }
            }
        } catch (error) {
            console.error('Error loading hero section:', error);
        }
    }

    startHeroSlideshow() {
        if (this.heroImages.length === 0) return;
        
        this.updateHeroContent();
        
        // Clear existing interval
        if (this.slideShowInterval) {
            clearInterval(this.slideShowInterval);
        }
        
        // Start auto slideshow
        this.slideShowInterval = setInterval(() => {
            this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroImages.length;
            this.updateHeroContent();
        }, 6000);
        
        console.log('Auto slideshow started');
    }

    updateHeroContent() {
        const hero = this.heroImages[this.currentHeroIndex];
        const heroImage = document.getElementById('heroAnimeImage');
        const heroTitle = document.getElementById('heroAnimeTitle');
        const heroType = document.getElementById('heroAnimeType');
        const heroSlideshow = document.getElementById('heroSlideshow');
        
        if (heroImage && heroTitle && heroType) {
            console.log(`Updating hero anime box with: ${hero.title} at index: ${this.currentHeroIndex}`);
            
            // Update hero image
            heroImage.src = hero.image;
            heroImage.style.display = 'block';
            heroImage.onload = () => {
                console.log(`Hero anime image loaded: ${hero.title}`);
            };
            
            // Update hero text
            heroTitle.textContent = hero.title;
            heroType.textContent = `${hero.type} • ★ ${hero.score || 'N/A'}`;
            
            // Update background slideshow
            if (heroSlideshow) {
                heroSlideshow.style.backgroundImage = `url(${hero.image})`;
            }
        }
    }

    async loadCurrentSeason() {
        try {
            const data = await this.fetchFromAPI('/seasons/now?limit=24');
            if (data && data.data) {
                this.displayAnimeGrid(data.data, 'currentSeason');
            }
        } catch (error) {
            console.error('Error loading current season:', error);
        }
    }

    async loadTopAnime() {
        try {
            const data = await this.fetchFromAPI('/top/anime?type=tv&limit=24');
            if (data && data.data) {
                this.displayAnimeGrid(data.data, 'topAnime');
            }
        } catch (error) {
            console.error('Error loading top anime:', error);
        }
    }

    async loadUpcoming() {
        try {
            const data = await this.fetchFromAPI('/seasons/upcoming?limit=24');
            if (data && data.data) {
                this.displayAnimeGrid(data.data, 'upcoming');
            }
        } catch (error) {
            console.error('Error loading upcoming anime:', error);
        }
    }

    async loadNews() {
        try {
            // Since Jikan doesn't have news endpoint, we'll show a message
            const newsContent = document.getElementById('newsContent');
            const newsLoading = document.getElementById('newsLoading');
            
            if (newsLoading) newsLoading.style.display = 'none';
            if (newsContent) {
                newsContent.style.display = 'block';
                newsContent.innerHTML = `
                    <div class="col-12 text-center">
                        <div class="alert alert-info">
                            <i class="fas fa-info-circle me-2"></i>
                            News feature coming soon! Stay tuned for the latest anime updates.
                        </div>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading news:', error);
        }
    }

    displayAnimeGrid(animeList, sectionId) {
        const loading = document.getElementById(`${sectionId}Loading`);
        const content = document.getElementById(`${sectionId}Content`);
        
        if (loading) loading.style.display = 'none';
        if (content) {
            content.style.display = 'grid';
            content.innerHTML = animeList.map(anime => this.createAnimeCard(anime)).join('');
        }
    }

    createAnimeCard(anime) {
        const score = anime.score ? `★ ${anime.score}` : 'N/A';
        const year = anime.year || anime.aired?.prop?.from?.year || '';
        const status = anime.status || '';
        
        return `
            <div class="anime-card" data-anime-id="${anime.mal_id}">
                <div class="anime-card-image">
                    <img src="${anime.images?.jpg?.image_url || anime.images?.jpg?.large_image_url}" 
                         alt="${anime.title}" 
                         loading="lazy"
                         onerror="this.src='https://via.placeholder.com/200x280/667eea/ffffff?text=No+Image'">
                    <div class="anime-card-overlay">
                        <div class="anime-score">${score}</div>
                        <button class="btn btn-sm btn-primary anime-details-btn">
                            <i class="fas fa-info-circle"></i>
                        </button>
                    </div>
                </div>
                <div class="anime-card-content">
                    <h6 class="anime-card-title" title="${anime.title}">${this.truncateText(anime.title, 40)}</h6>
                    <div class="anime-card-meta">
                        <span class="anime-type">${anime.type || 'TV'}</span>
                        ${year ? `<span class="anime-year">${year}</span>` : ''}
                        ${status ? `<span class="anime-status">${status}</span>` : ''}
                    </div>
                </div>
            </div>
        `;
    }

    truncateText(text, maxLength) {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, starting Anihour app...');
    new AnihourStatic();
});

// Handle window resize for responsive updates
window.addEventListener('resize', () => {
    // Handle any responsive updates if needed
});

// Handle visibility change to pause/resume slideshow
document.addEventListener('visibilitychange', () => {
    if (window.anihour) {
        if (document.hidden) {
            if (window.anihour.slideShowInterval) {
                clearInterval(window.anihour.slideShowInterval);
            }
        } else {
            if (window.anihour.heroImages.length > 0) {
                window.anihour.startHeroSlideshow();
            }
        }
    }
});