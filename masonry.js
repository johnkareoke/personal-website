class MasonryGrid {
    constructor() {
        this.grid = document.getElementById('masonry-grid');
        this.loadingIndicator = document.getElementById('loading-indicator');
        this.filterLinks = document.querySelectorAll('.filter-link');
        this.currentFilter = 'all';
        this.posts = [];
        this.filteredPosts = [];
        
        this.init();
    }

    async init() {
        this.setupEventListeners();
        await this.loadPosts();
        this.setupMasonry();
        this.handleHashChange();
    }

    setupEventListeners() {
        // Filter click events
        this.filterLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const filter = link.getAttribute('data-filter');
                this.setActiveFilter(filter);
                this.filterPosts(filter);
                this.updateURL(filter);
            });
        });

        // Handle hash changes
        window.addEventListener('hashchange', () => {
            this.handleHashChange();
        });

        // Handle window resize for masonry
        window.addEventListener('resize', () => {
            this.layoutMasonry();
        });
    }

    async loadPosts() {
        this.showLoading();
        
        try {
            // Load regular posts from server
            const response = await fetch('/api/posts');
            if (!response.ok) {
                throw new Error('Failed to load posts');
            }
            
            const posts = await response.json();
            
            // Load Instagram posts if available
            let instagramPosts = [];
            if (window.instagramFeed && window.instagramFeed.isReady()) {
                instagramPosts = await window.instagramFeed.fetchPosts();
            }
            
            // Combine and sort posts by date
            this.posts = [...posts, ...instagramPosts].sort((a, b) => {
                const dateA = new Date(a.timestamp || a.date);
                const dateB = new Date(b.timestamp || b.date);
                return dateB - dateA; // Newest first
            });
            
            this.filteredPosts = [...this.posts];
            this.renderPosts();
        } catch (error) {
            console.error('Error loading posts:', error);
            this.showError('Failed to load posts. Please try again.');
        } finally {
            this.hideLoading();
        }
    }

    renderPosts() {
        this.grid.innerHTML = '';
        
        this.filteredPosts.forEach((post, index) => {
            const item = this.createPostElement(post);
            this.grid.appendChild(item);
            
            // Animate in with delay
            setTimeout(() => {
                item.classList.add('show');
            }, index * 50);
        });

        // Layout masonry after rendering
        setTimeout(() => {
            this.layoutMasonry();
        }, 100);
    }

        createPostElement(post) {
        const item = document.createElement('div');
        item.className = 'masonry-item post-item';
        item.setAttribute('data-categories', post.categories.join(' '));
        
        // Handle Instagram posts differently
        if (post.type === 'instagram') {
            item.innerHTML = `
                <div class="entry-link">
                    <a href="${post.permalink}" target="_blank" title="${post.title}"></a>
                </div>
                <img src="${post.thumbnail}" class="post-thumbnail" alt="${post.title}" loading="lazy">
                <div class="post-overlay">
                    <h3 class="entry-title">${post.title}</h3>
                    <footer class="entry-meta">
                        <span class="postdate">${post.timestamp.toLocaleDateString()}</span>
                        <div class="post-categories">
                            ${post.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
                            ${post.mediaType === 'VIDEO' ? '<span class="category-tag">video</span>' : ''}
                        </div>
                    </footer>
                </div>
            `;
        } else {
            // Regular posts
            item.innerHTML = `
                <div class="entry-link">
                    <a href="#" onclick="masonry.loadPost('${post.slug}'); return false;" title="${post.title}"></a>
                </div>
                <img src="${post.thumbnail}" class="post-thumbnail" alt="${post.title}" loading="lazy">
                <div class="post-overlay">
                    <h3 class="entry-title">${post.title}</h3>
                    <footer class="entry-meta">
                        <span class="postdate">${post.date}</span>
                        <div class="post-categories">
                            ${post.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
                        </div>
                    </footer>
                </div>
            `;
        }
        
        return item;
    }

    setActiveFilter(filter) {
        this.currentFilter = filter;
        
        // Update active state on filter links
        this.filterLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('data-filter') === filter) {
                link.classList.add('active');
            }
        });
    }

    filterPosts(filter) {
        const items = this.grid.querySelectorAll('.masonry-item');
        
        items.forEach(item => {
            const categories = item.getAttribute('data-categories').split(' ');
            
            if (filter === 'all' || categories.includes(filter)) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });

        // Re-layout masonry after filtering
        setTimeout(() => {
            this.layoutMasonry();
        }, 100);
    }

    updateURL(filter) {
        const hash = filter === 'all' ? '' : `#${filter}`;
        window.history.replaceState(null, null, hash);
    }

    handleHashChange() {
        const hash = window.location.hash.replace('#', '');
        const filter = hash || 'all';
        
        if (this.currentFilter !== filter) {
            this.setActiveFilter(filter);
            this.filterPosts(filter);
        }
    }

    setupMasonry() {
        // Use CSS Grid for masonry-like layout
        // The actual masonry effect will be handled by CSS Grid
        this.layoutMasonry();
    }

    layoutMasonry() {
        // Trigger reflow for smooth animations
        this.grid.style.display = 'none';
        this.grid.offsetHeight; // Force reflow
        this.grid.style.display = 'grid';
    }

    async loadPost(slug) {
        try {
            const response = await fetch(`/api/posts/${slug}`);
            if (!response.ok) {
                throw new Error('Post not found');
            }
            
            const post = await response.json();
            this.displayPost(post);
        } catch (error) {
            console.error('Error loading post:', error);
            this.showError('Failed to load post. Please try again.');
        }
    }

    displayPost(post) {
        // Hide hero and grid
        const hero = document.getElementById('hero-section');
        const filter = document.getElementById('filter');
        const grid = document.getElementById('masonry-grid');
        const dynamicContent = document.getElementById('dynamic-content');
        
        if (hero) hero.style.display = 'none';
        if (filter) filter.style.display = 'none';
        if (grid) grid.style.display = 'none';
        
        // Show dynamic content
        dynamicContent.style.display = 'block';
        dynamicContent.innerHTML = `
            <article class="post">
                <header class="post-header">
                    <a href="#" onclick="masonry.showGrid(); return false;" class="back-button">
                        <i class="fas fa-arrow-left"></i> Back to Posts
                    </a>
                    <h1 class="post-title">${post.title}</h1>
                    <div class="post-meta">
                        <time class="post-date">${post.date}</time>
                        <div class="post-categories">
                            ${post.categories.map(cat => `<span class="category-tag">${cat}</span>`).join('')}
                        </div>
                    </div>
                </header>
                
                <div class="post-content">
                    ${post.content}
                </div>
            </article>
        `;
    }

    showGrid() {
        // Show hero and grid
        const hero = document.getElementById('hero-section');
        const filter = document.getElementById('filter');
        const grid = document.getElementById('masonry-grid');
        const dynamicContent = document.getElementById('dynamic-content');
        
        if (hero) hero.style.display = 'block';
        if (filter) filter.style.display = 'flex';
        if (grid) grid.style.display = 'grid';
        if (dynamicContent) dynamicContent.style.display = 'none';
        
        // Update URL
        window.history.pushState({ page: 'home' }, '', '/');
    }

    showLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'block';
        }
    }

    hideLoading() {
        if (this.loadingIndicator) {
            this.loadingIndicator.style.display = 'none';
        }
    }

    showError(message) {
        this.grid.innerHTML = `
            <div class="error-message">
                <h2>Error</h2>
                <p>${message}</p>
            </div>
        `;
    }
}

// Initialize masonry grid when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.masonry = new MasonryGrid();
}); 