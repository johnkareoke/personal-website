// Music Player functionality
class MusicPlayer {
    constructor() {
        this.audio = null;
        this.isPlaying = false;
        this.musicToggleBtn = null;
        this.musicIcon = null;
        this.musicToggle = null;
        
        this.init();
    }
    
    init() {
        console.log('MusicPlayer init() called');
        
        // Create audio element - use the correct MP3 file
        this.audio = new Audio('http://www.archive.org/download/WhatWeHaveEp/KaluacurrsAcousticRemix_64kb.mp3');
        this.audio.loop = true;
        console.log('Audio element created:', this.audio);
        
        // Get DOM elements
        this.musicToggleBtn = document.getElementById('music-toggle-btn');
        this.musicIcon = document.querySelector('.music-icon');
        this.musicToggle = document.querySelector('.music-toggle');
        
        console.log('DOM elements found:');
        console.log('- musicToggleBtn:', this.musicToggleBtn);
        console.log('- musicIcon:', this.musicIcon);
        console.log('- musicToggle:', this.musicToggle);
        
        // Load saved state
        this.loadState();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Update UI based on current state
        this.updateUI();
        
        // If music was playing when user left, resume it
        if (this.isPlaying) {
            this.play();
        }
    }
    
    setupEventListeners() {
        // Audio event listeners
        this.audio.addEventListener('play', () => {
            this.isPlaying = true;
            this.updateUI();
            this.saveState();
        });
        
        this.audio.addEventListener('pause', () => {
            this.isPlaying = false;
            this.updateUI();
            this.saveState();
        });
        
        this.audio.addEventListener('ended', () => {
            // This shouldn't happen with loop=true, but just in case
            if (this.isPlaying) {
                this.audio.play();
            }
        });
        
        this.audio.addEventListener('error', (e) => {
            console.error('Audio error:', e);
            this.isPlaying = false;
            this.updateUI();
        });
    }
    
    toggle() {
        console.log('MusicPlayer.toggle() called');
        console.log('Current isPlaying state:', this.isPlaying);
        
        if (this.isPlaying) {
            console.log('Pausing music...');
            this.pause();
        } else {
            console.log('Playing music...');
            this.play();
        }
    }
    
    play() {
        console.log('MusicPlayer.play() called');
        console.log('Audio element:', this.audio);
        
        // Try to play the audio
        const playPromise = this.audio.play();
        console.log('Play promise:', playPromise);
        
        if (playPromise !== undefined) {
            playPromise.catch(error => {
                console.error('Error playing audio:', error);
                // Handle autoplay policy restrictions
                if (error.name === 'NotAllowedError') {
                    console.log('Autoplay blocked by browser policy');
                    this.isPlaying = false;
                    this.updateUI();
                }
            });
        }
    }
    
    pause() {
        this.audio.pause();
    }
    
    updateUI() {
        if (!this.musicIcon || !this.musicToggle) return;
        
        if (this.isPlaying) {
            this.musicIcon.textContent = '♪';
            this.musicToggle.classList.add('playing');
        } else {
            this.musicIcon.textContent = '♪';
            this.musicToggle.classList.remove('playing');
        }
    }
    
    saveState() {
        localStorage.setItem('musicPlaying', this.isPlaying.toString());
    }
    
    loadState() {
        const savedState = localStorage.getItem('musicPlaying');
        if (savedState === 'true') {
            this.isPlaying = true;
        } else {
            this.isPlaying = false;
        }
    }
}

// Global music player instance
let musicPlayer;

// Initialize music player when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    musicPlayer = new MusicPlayer();
});

// Global function for the onclick handler
function toggleMusic() {
    console.log('toggleMusic() called');
    console.log('musicPlayer:', musicPlayer);
    
    if (musicPlayer) {
        console.log('Calling musicPlayer.toggle()');
        musicPlayer.toggle();
    } else {
        console.error('musicPlayer not initialized');
    }
} 