// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const menuToggle = document.querySelector('.menu-toggle');
    const mainMenu = document.querySelector('.main-menu');

    if (menuToggle && mainMenu) {
        menuToggle.addEventListener('click', function() {
            mainMenu.classList.toggle('active');
        });
    }

    // Close mobile menu when clicking outside
    document.addEventListener('click', function(event) {
        if (!event.target.closest('.main-navigation') && !event.target.closest('.menu-toggle')) {
            mainMenu.classList.remove('active');
        }
    });


});
    
    // Smooth scrolling for anchor links
    const anchorLinks = document.querySelectorAll('a[href^="#"]');
    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);
            
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Search functionality
    const searchForm = document.getElementById('searchform');
    if (searchForm) {
        searchForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const searchTerm = document.getElementById('s').value.trim();
            if (searchTerm) {
                // For now, just log the search term
                // In a real implementation, you would redirect to a search results page
                console.log('Searching for:', searchTerm);
                alert('Search functionality would be implemented here. You searched for: ' + searchTerm);
            }
        });
    }
    
    // Add loading animation to post items
    const postItems = document.querySelectorAll('.post-item');
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    postItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });
    
    // Add hover effects for post items
    postItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Twitter feed simulation (placeholder)
    const tweetsContainer = document.getElementById('tweets');
    if (tweetsContainer) {
        // Simulate loading tweets
        setTimeout(() => {
            tweetsContainer.innerHTML = `
                <div class="tweet">
                    <p>Just finished a great cycle tour through the mountains! 🚴‍♂️</p>
                    <small>2 hours ago</small>
                </div>
                <div class="tweet">
                    <p>New photography gallery coming soon...</p>
                    <small>1 day ago</small>
                </div>
            `;
        }, 1000);
    }
    
    // Add scroll effect to header
    const header = document.getElementById('branding');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            // Scrolling down
            header.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up
            header.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Add parallax effect to hero section
    const hero = document.querySelector('.hero');
    if (hero) {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.5;
            hero.style.transform = `translateY(${rate}px)`;
        });
    }
    
    // Initialize tooltips for better UX
    const tooltipElements = document.querySelectorAll('[title]');
    tooltipElements.forEach(element => {
        element.addEventListener('mouseenter', function() {
            const title = this.getAttribute('title');
            if (title) {
                const tooltip = document.createElement('div');
                tooltip.className = 'tooltip';
                tooltip.textContent = title;
                tooltip.style.cssText = `
                    position: absolute;
                    background: rgba(0,0,0,0.8);
                    color: white;
                    padding: 5px 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    z-index: 10000;
                    pointer-events: none;
                    white-space: nowrap;
                `;
                
                document.body.appendChild(tooltip);
                
                const rect = this.getBoundingClientRect();
                tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
                tooltip.style.top = rect.top - tooltip.offsetHeight - 5 + 'px';
                
                this.addEventListener('mouseleave', function() {
                    if (tooltip.parentNode) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                });
            }
        });
    });
});

// Add CSS for tooltips
const tooltipStyles = document.createElement('style');
tooltipStyles.textContent = `
    .tooltip {
        animation: fadeIn 0.2s ease-in;
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
`;
document.head.appendChild(tooltipStyles);

// Infinite Scroll and Lazy Loading Functions
function initializeInfiniteScroll() {
    const postsGrid = document.getElementById('posts-grid');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    if (!postsGrid || !loadingIndicator) return;
    
    let isLoading = false;
    let currentPage = 1;
    const postsPerPage = 12;
    
    // All posts data (in a real app, this would come from an API)
    const allPosts = [
        // Page 1 posts (already in HTML)
        // Page 2 posts
        {
            title: "Pass at your own risk",
            image: "images/krugerpark-oct-2010-1-300x205.jpg",
            link: "posts/pass-at-your-own-risk.html",
            date: "December 25, 2010"
        },
        {
            title: "I'm looking at you!",
            image: "images/krugerpark-oct-2010-300x205.jpg",
            link: "posts/im-looking-at-you.html",
            date: "December 25, 2010"
        },
        {
            title: "A DIY splitboard with inside edges",
            image: "images/splitboard-7-300x205.jpg",
            link: "posts/diy-splitboard.html",
            date: "December 23, 2010"
        },
        {
            title: "Kappel am Albis",
            image: "images/leematt-house-1-300x205.jpg",
            link: "posts/kappel-am-albis.html",
            date: "December 4, 2010"
        },
        {
            title: "Antony and Rebecca's new house in Kappel am Albis, Switzerland",
            image: "images/leematt-house-300x205.jpg",
            link: "posts/antony-and-rebeccas-new-house.html",
            date: "December 4, 2010"
        },
        {
            title: "Yanik slaying the shark.. taken almost 2 years ago",
            image: "images/yanik-gulmarg-2009-4-300x205.jpg",
            link: "posts/yanik-slaying-the-shark.html",
            date: "December 4, 2010"
        },
        {
            title: "Bulb ramping arduino intervalometer for Time lapse photography",
            image: "images/img-1934-version-2-300x205.jpg",
            link: "posts/bulb-ramping-arduino-intervalometer.html",
            date: "November 17, 2010"
        },
        {
            title: "This is an old one that has never seen the light of day",
            image: "images/rebecca-resized-300x205.jpg",
            link: "posts/this-is-an-old-one.html",
            date: "November 17, 2010"
        },
        {
            title: "Ponte",
            image: "images/jnb-300x205.jpg",
            link: "posts/ponte.html",
            date: "November 17, 2010"
        },
        // Page 3 posts
        {
            title: "Canary Wharf Abstract",
            image: "images/img-9788-version-2-300x205.jpg",
            link: "posts/canary-wharf-abstract.html",
            date: "March 19, 2010"
        },
        {
            title: "Dragonfly on the Boteti river",
            image: "images/img-8480-version-2-300x205.jpg",
            link: "posts/dragonfly-on-the-boteti-river.html",
            date: "March 19, 2010"
        },
        {
            title: "Leh Palace at Dusk",
            image: "images/img-85061-300x205.jpg",
            link: "posts/leh-palace-at-dusk.html",
            date: "March 19, 2010"
        },
        {
            title: "Moonscape",
            image: "images/img-8488-version-2-300x205.jpg",
            link: "posts/moonscape.html",
            date: "March 19, 2010"
        },
        {
            title: "Taj Mahal",
            image: "images/img-7880-version-2-300x205.jpg",
            link: "posts/taj-mahal.html",
            date: "March 19, 2010"
        },
        {
            title: "London skyline",
            image: "images/img-9835-300x205.jpg",
            link: "posts/london-skyline.html",
            date: "March 19, 2010"
        },
        {
            title: "Nicole surveys the landscape",
            image: "images/img-8230-version-3-300x205.jpg",
            link: "posts/nicole-surveys-the-landscape.html",
            date: "March 19, 2010"
        },
        {
            title: "Pearl spotted owl",
            image: "images/img-3389-version-2-300x205.jpg",
            link: "posts/pearl-spotted-owl.html",
            date: "March 19, 2010"
        },
        {
            title: "A budding musician in the rural Transkei",
            image: "images/img-0054-version-2-version-2-300x205.jpg",
            link: "posts/a-budding-musician-in-the-rural-transkei.html",
            date: "March 19, 2010"
        },
        {
            title: "One of the most photographed places in the world",
            image: "images/img-8024-1-300x205.jpg",
            link: "posts/one-of-the-most-photographed-places-in-the-world.html",
            date: "March 19, 2010"
        },
        {
            title: "Zebra at Mena-a-Kwena",
            image: "images/img-3220-version-3-version-2-300x205.jpg",
            link: "posts/zebra-at-mena-a-kwena.html",
            date: "March 19, 2010"
        },
        {
            title: "Immersion SA volunteer accommodation at night",
            image: "images/img-1995-2010-02-28-at-22-12-382-300x205.jpg",
            link: "posts/immersion-sa-volunteer-accommodation-at-night.html",
            date: "March 19, 2010"
        },
        {
            title: "Bridge over the Danube between Buda and Pest",
            image: "images/img-3642831951-300x205.jpg",
            link: "posts/bridge-over-the-danube-between-buda-and-pest.html",
            date: "March 19, 2010"
        },
        {
            title: "Island living",
            image: "images/darryl-seychelles-221-300x205.jpg",
            link: "posts/island-living.html",
            date: "March 19, 2010"
        }
    ];
    
    function loadMorePosts() {
        if (isLoading) return;
        
        isLoading = true;
        loadingIndicator.style.display = 'block';
        
        // Simulate API delay
        setTimeout(() => {
            const startIndex = (currentPage - 1) * postsPerPage;
            const endIndex = startIndex + postsPerPage;
            const postsToLoad = allPosts.slice(startIndex, endIndex);
            
            if (postsToLoad.length === 0) {
                loadingIndicator.style.display = 'none';
                return;
            }
            
            postsToLoad.forEach(post => {
                const postElement = createPostElement(post);
                postsGrid.appendChild(postElement);
            });
            
            currentPage++;
            isLoading = false;
            loadingIndicator.style.display = 'none';
            
            // Initialize lazy loading for new images
            initializeLazyLoading();
        }, 1000);
    }
    
    function createPostElement(post) {
        const li = document.createElement('li');
        li.className = 'post-item';
        li.innerHTML = `
            <div class="entry-link">
                <a href="${post.link}" title="${post.title}"></a>
            </div>
            <img src="${post.image}" class="post-thumbnail" alt="${post.title}" loading="lazy">
            <div class="post-overlay">
                <h3 class="entry-title">${post.title}</h3>
                <footer class="entry-meta">
                    <span class="postdate">${post.date}</span>
                </footer>
            </div>
        `;
        return li;
    }
    
    // Intersection Observer for infinite scroll
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !isLoading) {
                loadMorePosts();
            }
        });
    }, {
        rootMargin: '100px'
    });
    
    // Observe the loading indicator
    observer.observe(loadingIndicator);
}

function initializeLazyLoading() {
    const images = document.querySelectorAll('.post-thumbnail[loading="lazy"]');
    
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.addEventListener('load', () => {
                    img.classList.add('loaded');
                });
                imageObserver.unobserve(img);
            }
        });
    }, {
        rootMargin: '50px'
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
}

// Initialize infinite scroll and lazy loading when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeInfiniteScroll();
    initializeLazyLoading();
    
    // Set current year in footer
    const currentYearElement = document.getElementById('current-year');
    if (currentYearElement) {
        currentYearElement.textContent = new Date().getFullYear();
    }
}); 