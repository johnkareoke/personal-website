// Single Page Application (SPA) functionality
class SPA {
    constructor() {
        this.currentPage = 'home';
        this.contentContainer = null;
        this.heroSection = null;
        this.mainContent = null;
        
        this.init();
    }
    
    init() {
        console.log('SPA init() called');
        this.heroSection = document.getElementById('hero-section');
        this.filterSection = document.getElementById('filter');
        this.masonryGrid = document.getElementById('masonry-grid');
        this.dynamicContent = document.getElementById('dynamic-content');
        
        console.log('Elements found:');
        console.log('- heroSection:', this.heroSection);
        console.log('- filterSection:', this.filterSection);
        console.log('- masonryGrid:', this.masonryGrid);
        console.log('- dynamicContent:', this.dynamicContent);
        
        // Set up navigation event listeners
        this.setupNavigation();
        
        // Handle browser back/forward buttons
        window.addEventListener('popstate', (e) => {
            this.handleRoute(e.state?.page || 'home');
        });
        
        // Initialize with current route
        this.handleRoute(this.getCurrentRoute());
    }
    

    
    setupNavigation() {
        // Handle site title link
        const siteTitle = document.querySelector('#site-title a');
        if (siteTitle) {
            siteTitle.addEventListener('click', (e) => {
                e.preventDefault();
                if (window.masonry) {
                    window.masonry.showGrid();
                }
            });
        }
    }
    
    getPageFromHref(href) {
        if (href === 'index.html' || href === '/') return 'home';
        if (href === 'about.html') return 'about';
        if (href.startsWith('musings.html')) return 'musings';
        if (href.startsWith('galleries.html')) return 'galleries';
        return 'home';
    }
    
    getPostIdFromHref(href) {
        // Extract post ID from href like "posts/black-sea-coast.html"
        const match = href.match(/posts\/(.+)\.html/);
        return match ? match[1] : null;
    }
    
    getCurrentRoute() {
        const hash = window.location.hash.slice(1);
        if (hash) {
            const [page, id] = hash.split('/');
            return { page, id };
        }
        return { page: 'home' };
    }
    
    navigateTo(page, id = null) {
        const route = { page, id };
        const hash = id ? `#${page}/${id}` : `#${page}`;
        
        // Update URL without page reload
        window.history.pushState(route, '', hash);
        
        this.handleRoute(route);
    }
    
    async handleRoute(route) {
        const { page, id } = route;
        
        // Update active navigation
        this.updateActiveNavigation(page);
        
        // Load content based on route
        switch (page) {
            case 'home':
                await this.loadHomePage();
                break;
            case 'about':
                await this.loadAboutPage();
                break;
            case 'post':
                await this.loadPostPage(id);
                break;
            case 'musings':
                await this.loadMusingsPage(id);
                break;
            case 'galleries':
                await this.loadGalleriesPage(id);
                break;
            default:
                await this.loadHomePage();
        }
        
        this.currentPage = page;
    }
    
    updateActiveNavigation(page) {
        // Remove active class from all nav items
        document.querySelectorAll('.main-menu a').forEach(link => {
            link.classList.remove('active');
        });
        
        // Add active class to current page
        const activeLink = document.querySelector(`.main-menu a[href*="${page}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    
    async loadHomePage() {
        // Remove dynamic content if it exists
        const dynamicContent = document.getElementById('dynamic-content');
        if (dynamicContent) {
            dynamicContent.remove();
        }
        
        // Show hero section and posts grid
        this.showHeroSection();
        this.showPostsGrid();
        
        // Re-initialize infinite scroll for home page
        if (typeof initializeInfiniteScroll === 'function') {
            initializeInfiniteScroll();
        }
    }
    
    async loadAboutPage() {
        console.log('SPA.loadAboutPage() called');
        try {
            console.log('Fetching about.html...');
            const response = await fetch('about.html');
            console.log('Response status:', response.status);
            
            if (!response.ok) {
                throw new Error('Failed to load about page');
            }
            
            const htmlContent = await response.text();
            console.log('HTML content length:', htmlContent.length);
            
            const parser = new DOMParser();
            const doc = parser.parseFromString(htmlContent, 'text/html');
            
            // Extract the main content from about.html - look for the page-content div
            const pageContent = doc.querySelector('.page-content');
            console.log('Found page content:', pageContent);
            
            if (pageContent) {
                console.log('Using page content from about.html');
                const content = pageContent.outerHTML;
                
                this.currentPage = 'about';
                this.hideHeroSection();
                this.replaceMainContent(content);
            } else {
                console.error('Could not find .page-content in about.html');
                console.log('Available elements:', doc.querySelectorAll('*'));
                // Fallback to embedded content
                const content = this.getAboutContent();
                this.currentPage = 'about';
                this.hideHeroSection();
                this.replaceMainContent(content);
            }
        } catch (error) {
            console.error('Error loading about page:', error);
            // Fallback to embedded content
            const content = this.getAboutContent();
            this.currentPage = 'about';
            this.hideHeroSection();
            this.replaceMainContent(content);
        }
    }
    
    async loadPostPage(postId) {
        // First try to get embedded content
        let content = this.getPostContent(postId);
        
        // If no embedded content found, try to fetch from posts directory
        if (content.includes('Post Not Found')) {
            content = await this.fetchPostContent(postId);
        }
        
        this.hideHeroSection();
        this.replaceMainContent(content);
    }
    
    async loadMusingsPage(subPage = null) {
        const content = this.getMusingsContent(subPage);
        this.hideHeroSection();
        this.replaceMainContent(content);
    }
    
    async loadGalleriesPage(subPage = null) {
        const content = this.getGalleriesContent(subPage);
        this.hideHeroSection();
        this.replaceMainContent(content);
    }
    
    getAboutContent() {
        return `
            <div class="page-content">
                <header class="page-header">
                    <h1 class="page-title">About</h1>
                    <p class="page-subtitle">A bit about me and what I do</p>
                </header>
                
                <div class="about-content">
                    <img src="images/profile.jpg" alt="John Carolin" class="profile-image">
                    
                    <p>Hello! I'm John Carolin, and this is my personal space on the web where I share my adventures, thoughts, and creative projects. I'm passionate about photography, outdoor activities, and exploring the world around me.</p>
                    
                    <h2>What I Do</h2>
                    <p>I spend my time cycling through beautiful landscapes, snowboarding in the mountains, and capturing moments through photography. When I'm not outdoors, I work on software projects and share my experiences through writing and images.</p>
                    
                    <h2>My Interests</h2>
                    <div class="interests-grid">
                        <div class="interest-card">
                            <div class="interest-icon">
                                <i class="fas fa-camera"></i>
                            </div>
                            <h3 class="interest-title">Photography</h3>
                            <p class="interest-description">Capturing moments and landscapes through the lens, from urban scenes to natural wonders.</p>
                        </div>
                        
                        <div class="interest-card">
                            <div class="interest-icon">
                                <i class="fas fa-bicycle"></i>
                            </div>
                            <h3 class="interest-title">Cycle Touring</h3>
                            <p class="interest-description">Exploring the world on two wheels, discovering new places and meeting interesting people along the way.</p>
                        </div>
                        
                        <div class="interest-card">
                            <div class="interest-icon">
                                <i class="fas fa-mountain"></i>
                            </div>
                            <h3 class="interest-title">Snowboarding</h3>
                            <p class="interest-description">Riding the slopes and backcountry, experiencing the thrill of winter sports in beautiful mountain settings.</p>
                        </div>
                        
                        <div class="interest-card">
                            <div class="interest-icon">
                                <i class="fas fa-code"></i>
                            </div>
                            <h3 class="interest-title">Software Development</h3>
                            <p class="interest-description">Creating useful tools and applications, including the Panoplugin project for panoramic photography.</p>
                        </div>
                    </div>
                    
                    <h2>My Story</h2>
                    <p>I've been fortunate to travel to many amazing places and experience different cultures. From the mountains of New Zealand to the coastlines of Europe, each journey has taught me something new and provided inspiration for my photography and writing.</p>
                    
                    <p>This website serves as a repository of those experiences - a collection of images, stories, and projects that I hope will inspire others to explore and create.</p>
                    
                    <div class="contact-info">
                        <h3>Get in Touch</h3>
                        <p>I'm always interested in connecting with fellow travelers, photographers, and outdoor enthusiasts. Feel free to reach out!</p>
                        <div class="contact-links">
                            <a href="https://twitter.com/johnkareoke" class="contact-link" target="_blank" rel="noopener">
                                <i class="fab fa-twitter"></i>
                                Twitter
                            </a>
                            <a href="https://instagram.com/johncarolin" class="contact-link" target="_blank" rel="noopener">
                                <i class="fab fa-instagram"></i>
                                Instagram
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getPostContent(postId) {
        const posts = {
            'black-sea-coast': {
                title: 'Black Sea Coast',
                date: 'March 5, 2014',
                image: 'images/black-sea-coast-300x200.jpg',
                content: `
                    <p>This photograph captures the serene beauty of the Black Sea coast during a particularly calm morning. The gentle waves lapping against the shore create a peaceful atmosphere that's characteristic of this region.</p>
                    
                    <p>The Black Sea coast has always held a special place in my photography. The unique lighting conditions, combined with the dramatic landscapes, make it an ideal location for capturing both the power and tranquility of nature.</p>
                    
                    <h2>The Journey</h2>
                    <p>This image was taken during a cycling tour along the coast. The early morning light provided perfect conditions for photography, with soft, diffused lighting that brought out the subtle textures of the landscape.</p>
                    
                    <h2>Technical Details</h2>
                    <ul>
                        <li><strong>Camera:</strong> Canon EOS 5D Mark III</li>
                        <li><strong>Lens:</strong> 24-70mm f/2.8L</li>
                        <li><strong>Settings:</strong> f/8, 1/125s, ISO 100</li>
                        <li><strong>Location:</strong> Black Sea Coast, Bulgaria</li>
                    </ul>
                    
                    <p>The composition emphasizes the vastness of the sea while maintaining a sense of intimacy through the foreground elements. The horizon line is positioned to create a balanced, harmonious image that draws the viewer's eye naturally through the scene.</p>
                `
            },
            'brave-skiff': {
                title: 'Brave Skiff',
                date: 'March 3, 2014',
                image: 'images/brave-skiff-300x200.jpg',
                content: `
                    <p>The "Brave Skiff" captures a moment of solitude and adventure on the open water. This small boat, seemingly alone against the vast expanse of the sea, represents the spirit of exploration and the courage to venture into the unknown.</p>
                    
                    <p>Photographed during a coastal expedition, this image embodies the essence of maritime photography - the interplay between human endeavor and the natural world.</p>
                    
                    <h2>The Story Behind the Image</h2>
                    <p>This photograph was taken during a particularly calm morning when the sea was like glass. The skiff, with its weathered appearance, told a story of countless journeys and adventures across the water.</p>
                    
                    <p>The composition emphasizes the contrast between the small vessel and the vast ocean, creating a sense of both vulnerability and determination.</p>
                    
                    <h2>Technical Details</h2>
                    <ul>
                        <li><strong>Camera:</strong> Canon EOS 5D Mark III</li>
                        <li><strong>Lens:</strong> 70-200mm f/2.8L</li>
                        <li><strong>Settings:</strong> f/5.6, 1/250s, ISO 200</li>
                        <li><strong>Location:</strong> Mediterranean Coast</li>
                    </ul>
                    
                    <p>The long lens compression helped to bring the distant horizon closer, creating a more intimate relationship between the boat and its surroundings.</p>
                `
            }
        };
        
        const post = posts[postId];
        if (!post) {
            return `<div class="error-message"><h2>Post Not Found</h2><p>The requested post could not be found.</p></div>`;
        }
        
        return `
            <article class="post">
                <header class="post-header">
                    <h1 class="post-title">${post.title}</h1>
                    <div class="post-meta">
                        <time class="post-date">${post.date}</time>
                    </div>
                </header>
                
                <div class="post-content">
                    <img src="${post.image}" alt="${post.title}" class="post-featured-image">
                    ${post.content}
                </div>
                
                <footer class="post-footer">
                    <div class="post-navigation">
                        <a href="#" class="prev-post" onclick="spa.navigateTo('post', 'brave-skiff'); return false;">← Brave Skiff</a>
                        <a href="#" class="next-post" onclick="spa.navigateTo('post', 'black-sea-coast'); return false;">Black Sea Coast →</a>
                    </div>
                </footer>
            </article>
        `;
    }
    
    async fetchPostContent(postId) {
        try {
            const response = await fetch(`posts/${postId}.html`);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const html = await response.text();
            
            // Extract main content from the post HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const mainContent = doc.querySelector('#content');
            
            if (mainContent) {
                return mainContent.innerHTML;
            } else {
                return `<div class="error-message"><h2>Post Not Found</h2><p>The requested post could not be found.</p></div>`;
            }
        } catch (error) {
            console.error(`Error loading post ${postId}:`, error);
            return `<div class="error-message"><h2>Post Not Found</h2><p>The requested post could not be found.</p></div>`;
        }
    }
    
    getMusingsContent(subPage = null) {
        const musingsContent = {
            'cycle-touring': {
                title: 'Cycle Touring',
                subtitle: 'Adventures on two wheels',
                content: `
                    <h2>Cycle Touring Adventures</h2>
                    <p>My experiences exploring the world by bicycle, from short weekend trips to extended tours across continents.</p>
                    
                    <h3>Recent Tours</h3>
                    <ul>
                        <li><strong>Europe 2024:</strong> Amsterdam to Venice via the Alps</li>
                        <li><strong>New Zealand 2023:</strong> South Island circuit</li>
                        <li><strong>Canada 2022:</strong> Vancouver to Calgary</li>
                    </ul>
                    
                    <h3>Gear & Tips</h3>
                    <p>Lessons learned from thousands of kilometers on the road, including gear recommendations, route planning, and survival tips.</p>
                `
            },
            'snowboarding': {
                title: 'Snowboarding',
                subtitle: 'Winter adventures in the mountains',
                content: `
                    <h2>Snowboarding Adventures</h2>
                    <p>From resort riding to backcountry exploration, my experiences in the mountains during winter.</p>
                    
                    <h3>Destinations</h3>
                    <ul>
                        <li><strong>Whistler, BC:</strong> Resort and backcountry</li>
                        <li><strong>Mount Baker, WA:</strong> Powder paradise</li>
                        <li><strong>New Zealand:</strong> Southern Hemisphere seasons</li>
                    </ul>
                    
                    <h3>Backcountry Safety</h3>
                    <p>Important lessons about avalanche safety, weather assessment, and backcountry navigation.</p>
                `
            },
            'photography': {
                title: 'Photography',
                subtitle: 'Capturing moments and landscapes',
                content: `
                    <h2>Photography Musings</h2>
                    <p>Thoughts on composition, technique, and the art of capturing the world through a lens.</p>
                    
                    <h3>Techniques</h3>
                    <ul>
                        <li><strong>Landscape:</strong> Finding the perfect light</li>
                        <li><strong>Action:</strong> Capturing movement and energy</li>
                        <li><strong>Portrait:</strong> Telling stories through faces</li>
                    </ul>
                    
                    <h3>Equipment</h3>
                    <p>My thoughts on cameras, lenses, and accessories for different types of photography.</p>
                `
            },
            'other': {
                title: 'Other Adventures',
                subtitle: 'Miscellaneous thoughts and experiences',
                content: `
                    <h2>Other Adventures</h2>
                    <p>Random thoughts, experiences, and adventures that don't fit into the other categories.</p>
                    
                    <h3>Recent Experiences</h3>
                    <ul>
                        <li><strong>Hiking:</strong> Mountain trails and wilderness</li>
                        <li><strong>Travel:</strong> Cultural experiences and learning</li>
                        <li><strong>Projects:</strong> DIY and creative endeavors</li>
                    </ul>
                    
                    <p>Life is full of unexpected adventures and learning opportunities.</p>
                `
            }
        };

        const content = subPage && musingsContent[subPage] 
            ? musingsContent[subPage] 
            : {
                title: 'Musings',
                subtitle: 'Thoughts and reflections on my adventures',
                content: `
                    <h2>Choose a Category</h2>
                    <p>Select a category from the dropdown menu above to read my thoughts and experiences in that area.</p>
                    
                    <div class="musings-categories">
                        <h3>Available Categories:</h3>
                        <ul>
                            <li><strong>Cycle Touring:</strong> Adventures on two wheels</li>
                            <li><strong>Snowboarding:</strong> Winter adventures in the mountains</li>
                            <li><strong>Photography:</strong> Capturing moments and landscapes</li>
                            <li><strong>Other:</strong> Miscellaneous thoughts and experiences</li>
                        </ul>
                    </div>
                `
            };

        return `
            <div class="page-content">
                <header class="page-header">
                    <h1 class="page-title">${content.title}</h1>
                    <p class="page-subtitle">${content.subtitle}</p>
                </header>
                
                <div class="about-content">
                    ${content.content}
                </div>
            </div>
        `;
    }
    
    getGalleriesContent(subPage = null) {
        const galleriesContent = {
            'afrikaburn-2013': {
                title: 'Afrikaburn 2013',
                subtitle: 'Burning Man in the Karoo Desert',
                content: `
                    <h2>Afrikaburn 2013 Gallery</h2>
                    <p>A collection of images from the 2013 Afrikaburn festival in the Karoo Desert of South Africa.</p>
                    
                    <h3>About Afrikaburn</h3>
                    <p>Afrikaburn is South Africa's regional Burning Man event, held annually in the Tankwa Karoo National Park. It's a week-long celebration of art, community, and radical self-expression.</p>
                    
                    <h3>Gallery Highlights</h3>
                    <ul>
                        <li><strong>Art Installations:</strong> Large-scale sculptures and interactive art</li>
                        <li><strong>Desert Landscapes:</strong> The stark beauty of the Karoo</li>
                        <li><strong>Community:</strong> People and connections</li>
                        <li><strong>Sunrise/Sunset:</strong> Golden hour photography</li>
                    </ul>
                    
                    <p>This gallery captures the spirit and creativity of the Afrikaburn community.</p>
                `
            },
            'gulmarg-2009': {
                title: 'Gulmarg 2009',
                subtitle: 'Skiing in the Himalayas',
                content: `
                    <h2>Gulmarg 2009 Gallery</h2>
                    <p>Photographs from a skiing adventure in Gulmarg, Kashmir, India in 2009.</p>
                    
                    <h3>About Gulmarg</h3>
                    <p>Gulmarg is a hill station and skiing destination in the Pir Panjal Range of the Himalayas. It's known for its deep powder and stunning mountain views.</p>
                    
                    <h3>Gallery Highlights</h3>
                    <ul>
                        <li><strong>Mountain Views:</strong> Panoramic shots of the Himalayas</li>
                        <li><strong>Skiing Action:</strong> Powder turns and mountain descents</li>
                        <li><strong>Local Culture:</strong> Kashmiri people and traditions</li>
                        <li><strong>Lodge Life:</strong> Accommodation and après-ski</li>
                    </ul>
                    
                    <p>An unforgettable experience in one of the world's most beautiful mountain ranges.</p>
                `
            },
            'temple-basin': {
                title: 'Temple Basin',
                subtitle: 'Backcountry skiing in New Zealand',
                content: `
                    <h2>Temple Basin Gallery</h2>
                    <p>A collection of images from backcountry skiing adventures at Temple Basin, New Zealand.</p>
                    
                    <h3>About Temple Basin</h3>
                    <p>Temple Basin is a club field in Arthur's Pass National Park, known for its challenging terrain and backcountry access. It's a favorite destination for experienced skiers and snowboarders.</p>
                    
                    <h3>Gallery Highlights</h3>
                    <ul>
                        <li><strong>Backcountry Lines:</strong> Steep chutes and powder fields</li>
                        <li><strong>Alpine Scenery:</strong> Rugged mountain landscapes</li>
                        <li><strong>Weather Conditions:</strong> From bluebird days to storm riding</li>
                        <li><strong>Lodge Life:</strong> The unique atmosphere of a club field</li>
                    </ul>
                    
                    <p>Pure backcountry skiing in the heart of the Southern Alps.</p>
                `
            },
            'splitboard-diy': {
                title: 'Splitboard DIY',
                subtitle: 'Building my own splitboard',
                content: `
                    <h2>Splitboard DIY Gallery</h2>
                    <p>Documentation of the process of building a custom splitboard from scratch.</p>
                    
                    <h3>About the Project</h3>
                    <p>This project involved designing and building a splitboard using traditional snowboard construction techniques, adapted for backcountry use.</p>
                    
                    <h3>Gallery Highlights</h3>
                    <ul>
                        <li><strong>Design Process:</strong> Sketches and CAD drawings</li>
                        <li><strong>Construction:</strong> Step-by-step build process</li>
                        <li><strong>Materials:</strong> Wood cores, fiberglass, and bindings</li>
                        <li><strong>Testing:</strong> First descents and performance</li>
                    </ul>
                    
                    <p>A labor of love that resulted in a unique piece of equipment.</p>
                `
            },
            'timelapse-intervalometer': {
                title: 'Timelapse Intervalometer',
                subtitle: 'DIY photography equipment',
                content: `
                    <h2>Timelapse Intervalometer Gallery</h2>
                    <p>Documentation of building a custom intervalometer for timelapse photography.</p>
                    
                    <h3>About the Project</h3>
                    <p>This DIY project created a programmable intervalometer for capturing timelapse sequences, with features like bulb ramping and exposure control.</p>
                    
                    <h3>Gallery Highlights</h3>
                    <ul>
                        <li><strong>Circuit Design:</strong> Electronics and schematics</li>
                        <li><strong>Construction:</strong> Building the device</li>
                        <li><strong>Programming:</strong> Arduino code and interface</li>
                        <li><strong>Results:</strong> Timelapse sequences created</li>
                    </ul>
                    
                    <p>Combining electronics, programming, and photography in one project.</p>
                `
            }
        };

        const content = subPage && galleriesContent[subPage] 
            ? galleriesContent[subPage] 
            : {
                title: 'Galleries',
                subtitle: 'Collections of my photography',
                content: `
                    <h2>Choose a Gallery</h2>
                    <p>Select a gallery from the dropdown menu above to view collections of my photography.</p>
                    
                    <div class="galleries-categories">
                        <h3>Available Galleries:</h3>
                        <ul>
                            <li><strong>Afrikaburn 2013:</strong> Burning Man in the Karoo Desert</li>
                            <li><strong>Gulmarg 2009:</strong> Skiing in the Himalayas</li>
                            <li><strong>Temple Basin:</strong> Backcountry skiing in New Zealand</li>
                            <li><strong>Splitboard DIY:</strong> Building my own splitboard</li>
                            <li><strong>Timelapse Intervalometer:</strong> DIY photography equipment</li>
                        </ul>
                    </div>
                `
            };

        return `
            <div class="page-content">
                <header class="page-header">
                    <h1 class="page-title">${content.title}</h1>
                    <p class="page-subtitle">${content.subtitle}</p>
                </header>
                
                <div class="about-content">
                    ${content.content}
                </div>
            </div>
        `;
    }
    
    showHeroSection() {
        if (this.heroSection) {
            this.heroSection.style.display = 'block';
        }
    }
    
    hideHeroSection() {
        console.log('hideHeroSection() called');
        if (this.heroSection) {
            this.heroSection.style.display = 'none';
            console.log('Hero section hidden');
        }
        if (this.filterSection) {
            this.filterSection.style.display = 'none';
            console.log('Filter section hidden');
        }
        if (this.masonryGrid) {
            this.masonryGrid.style.display = 'none';
            console.log('Masonry grid hidden');
        }
    }
    
    showPostsGrid() {
        if (this.mainContent) {
            this.mainContent.style.display = 'grid';
        }
    }
    
    replaceMainContent(content) {
        console.log('replaceMainContent() called');
        console.log('Content length:', content.length);
        console.log('dynamicContent element:', this.dynamicContent);
        
        // Check if the element still exists in the DOM
        const dynamicContentInDOM = document.getElementById('dynamic-content');
        console.log('dynamicContent in DOM:', dynamicContentInDOM);
        
        if (this.dynamicContent && dynamicContentInDOM) {
            this.dynamicContent.innerHTML = content;
            this.dynamicContent.style.display = 'block';
            console.log('Content set and dynamic content shown');
            console.log('Final dynamicContent HTML:', this.dynamicContent.innerHTML.substring(0, 200) + '...');
        } else {
            console.error('dynamicContent element not found!');
            console.log('Creating new dynamic content div...');
            
            // Create the div if it doesn't exist
            const newDynamicContent = document.createElement('div');
            newDynamicContent.id = 'dynamic-content';
            newDynamicContent.style.display = 'block';
            newDynamicContent.innerHTML = content;
            
            // Insert it into the main content area
            const mainContent = document.querySelector('.full-width');
            if (mainContent) {
                mainContent.appendChild(newDynamicContent);
                this.dynamicContent = newDynamicContent;
                console.log('New dynamic content div created and added');
            } else {
                console.error('Could not find .full-width to append dynamic content');
            }
        }
        
        // Hide hero, filter, and masonry grid
        if (this.heroSection) {
            this.heroSection.style.display = 'none';
        }
        if (this.filterSection) {
            this.filterSection.style.display = 'none';
        }
        if (this.masonryGrid) {
            this.masonryGrid.style.display = 'none';
        }
        
        // Add back button for non-home pages
        console.log('Current page:', this.currentPage);
        if (this.currentPage !== 'home') {
            console.log('Adding back button for non-home page');
            this.addBackButton(this.dynamicContent);
        } else {
            console.log('Not adding back button - current page is home');
        }
    }
    
    addBackButton(container) {
        console.log('Adding back button to container:', container);
        const backButton = document.createElement('div');
        backButton.className = 'back-button';
        backButton.innerHTML = `
            <a href="#" onclick="spa.showHomePage(); return false;">
                ← Back to Home
            </a>
        `;
        container.insertBefore(backButton, container.firstChild);
        console.log('Back button added:', backButton);
    }
    
    showHomePage() {
        // Show hero, filter, and masonry grid
        if (this.heroSection) {
            this.heroSection.style.display = 'block';
        }
        if (this.filterSection) {
            this.filterSection.style.display = 'flex';
        }
        if (this.masonryGrid) {
            this.masonryGrid.style.display = 'grid';
        }
        
        // Hide dynamic content
        if (this.dynamicContent) {
            this.dynamicContent.style.display = 'none';
        }
        
        // Update URL
        window.history.pushState({ page: 'home' }, '', '/');
    }
}

// Initialize SPA when DOM is loaded
let spa;
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing SPA...');
    spa = new SPA();
    window.spa = spa; // Make it globally accessible
    console.log('SPA initialized and assigned to window.spa');
});

// Global function for loading about page
function loadAboutPage() {
    console.log('loadAboutPage() called');
    console.log('window.spa:', window.spa);
    
    if (window.spa) {
        console.log('SPA found, calling loadAboutPage()');
        window.spa.loadAboutPage();
    } else {
        console.error('SPA not initialized, waiting...');
        // Wait a bit and try again
        setTimeout(() => {
            if (window.spa) {
                console.log('SPA found after delay, calling loadAboutPage()');
                window.spa.loadAboutPage();
            } else {
                console.error('SPA still not available after delay');
            }
        }, 100);
    }
} 