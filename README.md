# John Carolin - Personal Website

A modern, responsive personal website built with HTML, CSS, JavaScript, and Python Flask. Features a masonry grid layout, Instagram integration, and single-page application architecture.

## Features

- 🎨 **Modern Design**: Clean, minimalist aesthetic inspired by Mixfolio theme
- 📱 **Responsive Layout**: Fixed-width (1080px) centered design that works on all devices
- 🧱 **Masonry Grid**: Dynamic post grid with category filtering (Snowboarding, Cycling, Photography, Other)
- 📸 **Instagram Integration**: Automated Instagram feed integration
- 🎵 **Music Player**: Background music toggle with user preference memory
- 🔄 **Single Page App**: Smooth navigation without page reloads
- 📝 **Dynamic Content**: Posts loaded from `posts/` directory with automatic metadata extraction
- 🐳 **Docker Ready**: Containerized for easy deployment

## Quick Start with Docker

### Prerequisites
- Docker and Docker Compose installed

### 1. Clone the repository
```bash
git clone <your-repo-url>
cd personal-website
```

### 2. Build and run with Docker Compose
```bash
docker-compose up --build
```

### 3. Access the website
Open your browser and navigate to: **http://localhost:5001**

## Local Development Setup

### Prerequisites
- Python 3.7+
- pip

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Run the Flask server
```bash
python server.py
```

### 3. Access the website
Open your browser and navigate to: **http://localhost:5001**

## Project Structure

```
personal-website/
├── index.html              # Main HTML file (SPA shell)
├── styles.css              # Main stylesheet
├── script.js               # General JavaScript utilities
├── spa.js                  # Single Page Application logic
├── masonry.js              # Masonry grid and post management
├── music.js                # Music player functionality
├── instagram.js            # Instagram feed integration
├── server.py               # Flask backend server
├── requirements.txt        # Python dependencies
├── posts/                  # HTML post files
│   ├── sample-snowboarding-post.html
│   ├── cycling-adventure-2024.html
│   └── ...
├── privacy.html            # Privacy policy page
├── tos.html               # Terms of service page
├── deletion.html          # Data deletion form
├── Dockerfile             # Docker container definition
├── docker-compose.yml     # Docker Compose configuration
├── docker-compose.prod.yml # Production Docker Compose
├── Caddyfile              # Caddy web server configuration
├── .github/workflows/deploy.yml # GitHub Actions workflow
├── DEPLOYMENT.md          # Deployment guide
└── README.md              # This file
```

## Adding New Posts

1. Create a new HTML file in the `posts/` directory
2. Include an image with `id="thumbnail"` for the grid thumbnail
3. Add a `datetime` attribute for proper date sorting
4. Include category keywords in the content (Snowboarding, Cycling, Photography, Other)

Example post structure:
```html
<article class="post">
    <img id="thumbnail" src="path/to/image.jpg" alt="Post thumbnail">
    <time datetime="2024-01-15">January 15, 2024</time>
    <h2>Post Title</h2>
    <div class="post-content">
        <p>Post content with category keywords like Snowboarding...</p>
    </div>
</article>
```

## Configuration

### Instagram Integration
- Username is hardcoded to `@johnkareoke` in `instagram.js`
- Posts are fetched every 30 minutes
- Fallback to sample posts if scraping fails

### Music Player
- Audio file: `KaluacurrsAcousticRemix_64kb.mp3`
- User preference is remembered in localStorage
- Toggle button in main navigation

### Server Settings
- Port: 5001
- Debug mode: Enabled in development
- CORS: Enabled for cross-origin requests

## Docker Commands

### Build the image
```bash
docker build -t personal-website .
```

### Run the container
```bash
docker run -p 5001:5001 personal-website
```

### Stop the container
```bash
docker stop $(docker ps -q --filter ancestor=personal-website)
```

### View logs
```bash
docker-compose logs -f
```

## Development

### Making Changes
1. Edit source files
2. If using Docker: `docker-compose up --build`
3. If local: Restart `python server.py`

### Testing
- Test all navigation links
- Verify masonry grid filtering
- Check Instagram integration
- Test music player functionality
- Verify legal pages load correctly

## Deployment

### GitHub Actions (Recommended)

This repository includes a complete CI/CD pipeline that automatically builds and deploys your website to a virtual server.

**Features:**
- 🚀 **Automatic deployment** on push to `main` branch
- 🐳 **Docker containerization** with GitHub Container Registry
- 🔒 **Secure SSH deployment** to your server
- 🌐 **Caddy reverse proxy** for production serving
- 📊 **Health checks** and monitoring

**Quick Setup:**
1. Add repository secrets: `SERVER_SSH_KEY`, `SERVER_HOST`, `SERVER_USER`
2. Push to `main` branch to trigger deployment
3. Your site will be available at `archive.johncarolin.com`

See [DEPLOYMENT.md](DEPLOYMENT.md) for complete setup instructions.

### Manual Production Docker
```bash
# Build production image
docker build -t personal-website:prod .

# Run with production environment
docker run -d -p 80:5001 -e FLASK_DEBUG=0 personal-website:prod
```

### Environment Variables
- `FLASK_DEBUG`: Set to `0` for production deployment

## License

© 2024 John Carolin. All Rights Reserved.

## Support

For questions or issues, please use the data deletion form on the website or create an issue in this repository. 