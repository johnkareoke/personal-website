from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
import os
import re
from bs4 import BeautifulSoup
from datetime import datetime
import glob

app = Flask(__name__)
CORS(app)

# Configuration
POSTS_DIR = 'posts'
IMAGES_DIR = 'images'
VALID_CATEGORIES = ['snowboarding', 'cycling', 'photography', 'other']

def extract_post_metadata(html_content, filename):
    """Extract metadata from HTML post content"""
    soup = BeautifulSoup(html_content, 'html.parser')
    
    # Extract title
    title_tag = soup.find('title')
    title = title_tag.get_text().strip() if title_tag else filename.replace('.html', '').replace('-', ' ').title()
    
    # Extract date from filename or content
    date_match = re.search(r'(\d{4}-\d{2}-\d{2})', filename)
    if date_match:
        date_str = date_match.group(1)
        date = datetime.strptime(date_str, '%Y-%m-%d').strftime('%B %d, %Y')
    else:
        # Try to find date in content
        date_patterns = [
            r'(\w+ \d{1,2}, \d{4})',
            r'(\d{1,2}/\d{1,2}/\d{4})',
            r'(\d{4}-\d{2}-\d{2})'
        ]
        date = None
        for pattern in date_patterns:
            match = re.search(pattern, html_content)
            if match:
                date = match.group(1)
                break
        if not date:
            date = "Unknown Date"
    
    # Extract categories from content
    categories = []
    content_text = soup.get_text().lower()
    
    # Look for category indicators in the content
    for category in VALID_CATEGORIES:
        if category in content_text:
            categories.append(category)
    
    # If no categories found, default to 'other'
    if not categories:
        categories = ['other']
    
    # Extract thumbnail image
    thumbnail = None
    img_tag = soup.find('img', id='thumbnail')
    if img_tag:
        thumbnail = img_tag.get('src')
    else:
        # Look for first image in the post
        first_img = soup.find('img')
        if first_img:
            thumbnail = first_img.get('src')
    
    # If thumbnail path is relative, make it absolute
    if thumbnail and not thumbnail.startswith(('http://', 'https://')):
        if not thumbnail.startswith('/'):
            thumbnail = f'/{IMAGES_DIR}/{thumbnail}'
    
    # Extract main content
    content_div = soup.find('div', class_='entry-content')
    if not content_div:
        content_div = soup.find('article')
    if not content_div:
        content_div = soup.find('main')
    if not content_div:
        content_div = soup.find('body')
    
    content = str(content_div) if content_div else html_content
    
    # Create slug from filename
    slug = filename.replace('.html', '')
    
    return {
        'slug': slug,
        'title': title,
        'date': date,
        'categories': categories,
        'thumbnail': thumbnail,
        'content': content
    }

def get_all_posts():
    """Get all posts from the posts directory"""
    posts = []
    
    if not os.path.exists(POSTS_DIR):
        return posts
    
    # Get all HTML files in posts directory
    html_files = glob.glob(os.path.join(POSTS_DIR, '*.html'))
    
    for html_file in html_files:
        try:
            with open(html_file, 'r', encoding='utf-8') as f:
                html_content = f.read()
            
            filename = os.path.basename(html_file)
            metadata = extract_post_metadata(html_content, filename)
            posts.append(metadata)
            
        except Exception as e:
            print(f"Error processing {html_file}: {e}")
            continue
    
    # Sort posts by date (newest first)
    posts.sort(key=lambda x: x['date'], reverse=True)
    
    return posts

@app.route('/')
def index():
    return send_from_directory('.', 'index.html')

@app.route('/<path:filename>')
def static_files(filename):
    return send_from_directory('.', filename)

@app.route('/api/posts')
def get_posts():
    """API endpoint to get all posts"""
    posts = get_all_posts()
    return jsonify(posts)

@app.route('/api/posts/<slug>')
def get_post(slug):
    """API endpoint to get a specific post"""
    posts = get_all_posts()
    
    for post in posts:
        if post['slug'] == slug:
            return jsonify(post)
    
    return jsonify({'error': 'Post not found'}), 404

@app.route('/api/categories')
def get_categories():
    """API endpoint to get all categories"""
    posts = get_all_posts()
    categories = set()
    
    for post in posts:
        categories.update(post['categories'])
    
    return jsonify(list(categories))

if __name__ == '__main__':
    print("Starting Flask server...")
    print(f"Posts directory: {POSTS_DIR}")
    print(f"Valid categories: {VALID_CATEGORIES}")
    print("Server running at http://localhost:5001")
    app.run(debug=True, host='0.0.0.0', port=5001) 