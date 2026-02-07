// =============================================
// PARTICLE SYSTEM - Modern Animated Background
// =============================================

class ParticleSystem {
    constructor() {
        this.canvas = document.getElementById('particleCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.mouse = { x: 0, y: 0, radius: 150 };
        this.particleCount = 75;

        this.init();
        this.animate();
        this.setupEventListeners();
    }
    
    init() {
        this.resize();
        this.createParticles();
    }
    
    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    createParticles() {
        this.particles = [];
        
        for (let i = 0; i < this.particleCount; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 1,
                speedY: (Math.random() - 0.5) * 1,
                color: this.getRandomParticleColor(),
                opacity: Math.random() * 0.8 + 0.2
            });
        }
    }
    
    getRandomParticleColor() {
        const theme = document.body.getAttribute('data-theme');
        if (theme === 'dark') {
            const colors = [
                'rgba(255, 255, 255, 1)',
                'rgba(180, 180, 255, 1)',
                'rgba(255, 200, 255, 1)'
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        } else {
            const colors = [
                'rgba(225, 48, 108, 0.8)',
                'rgba(247, 119, 55, 0.6)',
                'rgba(252, 175, 69, 0.5)'
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }
    }
    
    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Update and draw particles
        for (let particle of this.particles) {
            this.updateParticle(particle);
            this.drawParticle(particle);
        }
        
        // Draw connections
        this.drawConnections();
        
        requestAnimationFrame(() => this.animate());
    }
    
    updateParticle(particle) {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Bounce off walls
        if (particle.x < 0 || particle.x > this.canvas.width) particle.speedX *= -1;
        if (particle.y < 0 || particle.y > this.canvas.height) particle.speedY *= -1;
        
        // Mouse interaction
        const dx = particle.x - this.mouse.x;
        const dy = particle.y - this.mouse.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < this.mouse.radius) {
            const angle = Math.atan2(dy, dx);
            const force = (this.mouse.radius - distance) / this.mouse.radius;
            particle.x += Math.cos(angle) * force * 3;
            particle.y += Math.sin(angle) * force * 3;
        }
    }
    
    drawParticle(particle) {
        this.ctx.beginPath();
        this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        this.ctx.fillStyle = particle.color;
        this.ctx.shadowBlur = 15;
        this.ctx.shadowColor = particle.color;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
    }
    
    drawConnections() {
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < this.particles.length; j++) {
                const dx = this.particles[i].x - this.particles[j].x;
                const dy = this.particles[i].y - this.particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 120) {
                    const opacity = 1 - (distance / 120);
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.2})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(this.particles[i].x, this.particles[i].y);
                    this.ctx.lineTo(this.particles[j].x, this.particles[j].y);
                    this.ctx.stroke();
                }
            }
        }
    }
    
    setupEventListeners() {
        window.addEventListener('resize', () => {
            this.resize();
            this.createParticles();
        });
        
        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        // Update particles when theme changes
        const observer = new MutationObserver(() => {
            this.updateParticleColors();
        });
        
        observer.observe(document.body, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
    }
    
    updateParticleColors() {
        this.particles.forEach(particle => {
            particle.color = this.getRandomParticleColor();
        });
    }
}

// =============================================
// GRADIENT ORBS SYSTEM
// =============================================

class GradientOrbs {
    constructor() {
        this.canvas = document.getElementById("orbCanvas");
        this.ctx = this.canvas.getContext("2d");
        this.orbs = [];
        this.orbCount = 3;

        this.resize();
        window.addEventListener("resize", () => this.resize());
        this.createOrbs();
        this.animate();
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    createOrbs() {
        const theme = document.body.getAttribute('data-theme');
        
        if (theme === 'dark') {
            this.orbs = [
                { x: this.canvas.width * 0.2, y: this.canvas.height * 0.3, radius: 250, color: 'rgba(255, 255, 255, 0.6)', dx: 0.2, dy: 0.1 },
                { x: this.canvas.width * 0.7, y: this.canvas.height * 0.6, radius: 300, color: 'rgba(150, 150, 255, 0.55)', dx: -0.15, dy: 0.2 },
                { x: this.canvas.width * 0.4, y: this.canvas.height * 0.8, radius: 200, color: 'rgba(255, 180, 255, 0.5)', dx: 0.1, dy: -0.15 }
            ];
        } else {
            // Light mode - Instagram colors
            this.orbs = [
                { x: this.canvas.width * 0.2, y: this.canvas.height * 0.3, radius: 250, color: 'rgba(225, 48, 108, 0.4)', dx: 0.2, dy: 0.1 },
                { x: this.canvas.width * 0.7, y: this.canvas.height * 0.6, radius: 300, color: 'rgba(247, 119, 55, 0.35)', dx: -0.15, dy: 0.2 },
                { x: this.canvas.width * 0.4, y: this.canvas.height * 0.8, radius: 200, color: 'rgba(252, 175, 69, 0.3)', dx: 0.1, dy: -0.15 }
            ];
        }
    }

    drawOrbs() {
        this.orbs.forEach(orb => {
            // Create gradient for each orb
            const gradient = this.ctx.createRadialGradient(
                orb.x, orb.y, 0,
                orb.x, orb.y, orb.radius
            );
            
            gradient.addColorStop(0, orb.color);
            gradient.addColorStop(1, 'transparent');
            
            this.ctx.beginPath();
            this.ctx.fillStyle = gradient;
            this.ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    moveOrbs() {
        this.orbs.forEach(orb => {
            orb.x += orb.dx;
            orb.y += orb.dy;

            // Bounce off edges
            if (orb.x - orb.radius > this.canvas.width || orb.x + orb.radius < 0) orb.dx *= -1;
            if (orb.y - orb.radius > this.canvas.height || orb.y + orb.radius < 0) orb.dy *= -1;
        });
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawOrbs();
        this.moveOrbs();
        requestAnimationFrame(() => this.animate());
    }
}

// =============================================
// EXISTING APPLICATION CODE
// =============================================

// DOM Elements
const API_URL = "http://127.0.0.1:5000";
const usernameInput = document.getElementById('usernameInput');
const analyzeBtn = document.getElementById('analyzeBtn');
const resultsSection = document.getElementById('results');
const loadingOverlay = document.getElementById('loadingOverlay');
const newAnalysisBtn = document.getElementById('newAnalysisBtn');
const exportBtn = document.getElementById('exportBtn');
const themeToggle = document.getElementById('themeToggle');
const mobileThemeToggle = document.getElementById('mobileThemeToggle');
const mobileMenuBtn = document.getElementById('mobileMenuBtn');
const mobileMenu = document.getElementById('mobileMenu');
const errorCard = document.getElementById('errorCard');
const errorMessage = document.getElementById('errorMessage');
const errorClose = document.getElementById('errorClose');

// Input Mode Elements
const modeBtns = document.querySelectorAll('.mode-btn');
const autoInput = document.getElementById('autoInput');
const manualInput = document.getElementById('manualInput');
const manualUsername = document.getElementById('manualUsername');
const manualFollowers = document.getElementById('manualFollowers');
const manualFollowing = document.getElementById('manualFollowing');
const manualPosts = document.getElementById('manualPosts');
const manualBio = document.getElementById('manualBio');
const analyzeManualBtn = document.getElementById('analyzeManualBtn');

// Tab functionality
const tabBtns = document.querySelectorAll('.tab-btn');
const tabPanes = document.querySelectorAll('.tab-pane');

// Theme Management
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.body.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    document.body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
    
    // Update background systems when theme changes
    setTimeout(() => {
        particleSystem.updateParticleColors();
        gradientOrbs.createOrbs();
    }, 100);
}

function updateThemeIcon(theme) {
    const icons = document.querySelectorAll('.theme-toggle i');
    icons.forEach(icon => {
        icon.className = theme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    });
}

// Input Mode Management
function initInputMode() {
    const savedMode = localStorage.getItem('inputMode') || 'auto';
    setInputMode(savedMode);
    
    modeBtns.forEach(btn => {
        if (btn.getAttribute('data-mode') === savedMode) {
            btn.classList.add('active');
        }
    });
}

function setInputMode(mode) {
    localStorage.setItem('inputMode', mode);
    
    if (mode === 'auto') {
        autoInput.style.display = 'flex';
        manualInput.style.display = 'none';
    } else {
        autoInput.style.display = 'none';
        manualInput.style.display = 'block';
    }
}

// Username Validation
function validateUsername(username) {
    if (!username.trim()) {
        showError('Please enter an Instagram username or URL');
        return false;
    }
    
    // Basic Instagram username validation
    const instagramRegex = /^(@)?[a-zA-Z0-9._]{1,30}$|^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]{1,30}\/?$/;

    if (!instagramRegex.test(username)) {
        showError('Please enter a valid Instagram username or URL (e.g., @username or https://instagram.com/username)');
        return false;
    }
    
    return true;
}

function validateManualInput() {
    const username = manualUsername.value.trim();
    const followers = manualFollowers.value;
    const following = manualFollowing.value;
    const posts = manualPosts.value;
    
    if (!username) {
        showError('Please enter a username');
        return false;
    }
    
    if (!followers || !following || !posts) {
        showError('Please fill in all required fields');
        return false;
    }
    
    if (parseInt(followers) < 0 || parseInt(following) < 0 || parseInt(posts) < 0) {
        showError('Values cannot be negative');
        return false;
    }
    
    return true;
}

// Error Handling
function showError(message) {
    errorMessage.textContent = message;
    errorCard.style.display = 'flex';
    
    // Auto-hide error after 5 seconds
    setTimeout(() => {
        hideError();
    }, 5000);
}

function hideError() {
    errorCard.style.display = 'none';
}

// Loading Management
function showLoading() {
    loadingOverlay.style.display = 'flex';
    // Simulate loading progress
    simulateLoadingProgress();
}

function hideLoading() {
    loadingOverlay.style.display = 'none';
    document.getElementById('loadingProgressBar').style.width = '0%';
}

function simulateLoadingProgress() {
    const progressBar = document.getElementById('loadingProgressBar');
    let progress = 0;
    
    const interval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress >= 90) {
            progress = 90; // Hold at 90% until analysis completes
            clearInterval(interval);
        }
        progressBar.style.width = `${progress}%`;
    }, 200);
}

// Local Storage Management
function saveLastSearch(username) {
    localStorage.setItem('lastSearch', username);
}

function loadLastSearch() {
    const lastSearch = localStorage.getItem('lastSearch');
    if (lastSearch) {
        usernameInput.value = lastSearch;
        manualUsername.value = lastSearch.replace('@', '');
    }
}

// Mock ML Analysis Function
// Real ML Analysis Function (Replacing the Mock)
// =============================================
// UPDATED API FUNCTION (Replace in script.js)
// =============================================

async function analyzeInstagramAccount(username, manualData = null) {
    
    // 1. Prepare Payload
    let requestPayload = {};

    if (manualData) {
        // Manual Mode: We MUST send numbers, not strings
        requestPayload = {
            username: manualData.username || "unknown",
            followers: parseInt(manualData.followers) || 0,
            following: parseInt(manualData.following) || 0,
            posts: parseInt(manualData.posts) || 0,
            bio: manualData.bio || "",
            full_name: manualData.username, // Default
            has_profile_pic: 1,             // Default assumption
            is_private: 0                   // Default assumption
        };
    } else {
        // Auto Mode
        requestPayload = { username: username };
    }

    try {
        console.log("Sending Payload:", requestPayload);

        // 2. Send Request
        const response = await fetch(`${API_URL}/predict`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestPayload)
        });

        // 3. Handle Errors
        // We parse JSON even if response is not OK to get the error message
        const result = await response.json();

        if (!response.ok) {
            // Throw the specific message from the server (e.g., "Use Manual Mode")
            throw new Error(result.error || result.details || "Server error");
        }

        // 4. Process Success
        console.log("Analysis Result:", result);
        const riskScore = result.risk_score;

        // Generate Red Flags based on the returned data
        const preview = result.profile_preview || requestPayload;

        const redFlags = generateRealRedFlags(riskScore, preview);
        const authenticity = Math.max(5, 100 - riskScore);
        const isFake = result.is_fake === 1;

// Safe derived metrics
        const followers = preview.followers || 1;
        const following = preview.following || 1;
        const posts = preview.posts || 1;

        const ratio = (followers / Math.max(1, following)).toFixed(2);
        const engRate = ((posts / followers) * 100).toFixed(2) + '%';

        return {
            profile: {
            username: preview.username,
            displayName: preview.full_name || preview.username,
            profilePic: preview.profile_pic_url 
                ? `http://127.0.0.1:5000/profile-pic?url=${encodeURIComponent(preview.profile_pic_url)}`
                : `https://ui-avatars.com/api/?name=${preview.username}&background=random`,

            isVerified: false,
            followers,
            following,
            posts,
            accountAge: "Unknown",
            bioCompleteness: (preview.bio || "").length > 10 ? 'Complete' : 'Brief'
        },
        metrics: {
            riskScore,
            profileAuthenticity: authenticity,
            followerQuality: Math.max(5, authenticity - 10),
            contentConsistency: Math.max(10, authenticity - 5),
            activityPatterns: Math.max(10, authenticity - 15),
            engagementRate: engRate,
            followerRatio: ratio,
            followerGrowth: isFake ? 'Suspicious' : 'Organic',
            fakeFollowers: isFake ? 'High (>40%)' : 'Low (<5%)',
            usernamePattern: /^[a-zA-Z0-9._]+$/.test(preview.username)
                ? 'Normal'
                : 'Complex'
        },
        redFlags
    };


    } catch (error) {
        console.error("API Failure:", error);
        // Show the ACTUAL error message to the user
        showError(error.message);
        throw error; // Stop execution
    }
}
function generateRedFlags(riskScore, profile) {
    const flags = [
        'High follower-to-following ratio',
        'Low engagement rate',
        'Inconsistent posting pattern',
        'Generic profile bio',
        'Suspicious username pattern',
        'Recent massive follower growth',
        'Low post frequency for account age',
        'High percentage of inactive followers',
        'Unusual following patterns',
        'Limited profile information'
    ];
    
    const numFlags = Math.floor((riskScore / 100) * 6) + 1; // 1-7 flags based on risk
    return flags.slice(0, Math.min(numFlags, flags.length));
}

// Update UI with analysis results
function updateUIWithResults(data) {
    // Profile Information
    document.getElementById('profileName').textContent = `@${data.profile.username}`;
    document.getElementById('profileImg').src = data.profile.profilePic;
    document.getElementById('verificationBadge').style.display = data.profile.isVerified ? 'flex' : 'none';
    
    // Quick Stats
    document.getElementById('followersCount').textContent = data.profile.followers.toLocaleString();
    document.getElementById('followingCount').textContent = data.profile.following.toLocaleString();
    document.getElementById('postsCount').textContent = data.profile.posts.toLocaleString();
    document.getElementById('engagementRate').textContent = data.metrics.engagementRate;
    
    // Risk Score and Confidence Badge
    updateRiskDisplay(data.metrics.riskScore);
    
    // Progress Bars
    updateProgressBar('profileAuthBar', 'profileAuthValue', data.metrics.profileAuthenticity);
    updateProgressBar('followerQualityBar', 'followerQualityValue', data.metrics.followerQuality);
    updateProgressBar('contentConsistencyBar', 'contentConsistencyValue', data.metrics.contentConsistency);
    updateProgressBar('activityPatternsBar', 'activityPatternsValue', data.metrics.activityPatterns);
    
    // Profile Analysis Tab
    document.getElementById('accountAge').textContent = data.profile.accountAge;
    document.getElementById('usernamePattern').textContent = data.metrics.usernamePattern;
    document.getElementById('bioCompleteness').textContent = data.profile.bioCompleteness;
    document.getElementById('followerRatio').textContent = data.metrics.followerRatio;
    document.getElementById('followerGrowth').textContent = data.metrics.followerGrowth;
    document.getElementById('fakeFollowers').textContent = data.metrics.fakeFollowers;
    document.getElementById('detailedEngagement').textContent = data.metrics.engagementRate;
    document.getElementById('profilePicture').textContent = data.profile.profilePic ? 'Present' : 'Missing';
    
    // Red Flags
    const redFlagsList = document.getElementById('redFlagsList');
    redFlagsList.innerHTML = '';
    data.redFlags.forEach(flag => {
        const li = document.createElement('li');
        li.textContent = `❌ ${flag}`;
        redFlagsList.appendChild(li);
    });
    
    // Complete loading progress
    document.getElementById('loadingProgressBar').style.width = '100%';
}

function updateRiskDisplay(riskScore) {
    const riskScoreElement = document.getElementById('riskScore');
    const scoreValue = riskScoreElement.querySelector('.score-value');
    const confidenceBadge = document.getElementById('confidenceBadge');
    const badgeText = confidenceBadge.querySelector('.badge-text');
    
    scoreValue.textContent = `${riskScore}%`;
    
    let riskLevel, badgeClass;
    if (riskScore < 30) {
        riskLevel = 'Low Risk';
        badgeClass = 'low-risk';
    } else if (riskScore < 70) {
        riskLevel = 'Moderate Risk';
        badgeClass = 'moderate-risk';
    } else {
        riskLevel = 'High Risk';
        badgeClass = 'high-risk';
    }
    
    // Update score value
    scoreValue.className = 'score-value ' + badgeClass;
    
    // Update confidence badge
    badgeText.textContent = riskLevel;
    confidenceBadge.className = 'confidence-badge ' + badgeClass;
}

function updateProgressBar(barId, valueId, percentage) {
    const bar = document.getElementById(barId);
    const value = document.getElementById(valueId);
    
    // Determine color category
    let colorCategory;
    if (percentage < 30) {
        colorCategory = 'high';
    } else if (percentage < 70) {
        colorCategory = 'medium';
    } else {
        colorCategory = 'low';
    }
    
    // Set data attribute for CSS styling
    bar.setAttribute('data-percentage', colorCategory);
    
    // Animate progress bar
    setTimeout(() => {
        bar.style.width = `${percentage}%`;
        value.textContent = `${percentage}%`;
    }, 100);
}

// Export functionality
function exportToPDF() {
    showError('PDF export feature will be implemented with jsPDF + html2canvas');
}

// Global instances
let particleSystem;
let gradientOrbs;

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    // Initialize background systems FIRST
    particleSystem = new ParticleSystem();
    gradientOrbs = new GradientOrbs();
    
    // Then initialize your existing app
    initTheme();
    initInputMode();
    loadLastSearch();
    
    // Auto Analysis
    analyzeBtn.addEventListener('click', handleAutoAnalysis);
    
    // Manual Analysis
    analyzeManualBtn.addEventListener('click', handleManualAnalysis);
    
    // Input Mode Toggle
    modeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            modeBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            setInputMode(btn.getAttribute('data-mode'));
        });
    });
    
    // Theme Toggle
    themeToggle.addEventListener('click', toggleTheme);
    mobileThemeToggle.addEventListener('click', toggleTheme);
    
    // Mobile Menu
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            mobileMenu.classList.remove('active');
        }
    });
    
    // Error Handling
    errorClose.addEventListener('click', hideError);
    
    // Tab switching
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons and panes
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            // Add active class to clicked button and corresponding pane
            btn.classList.add('active');
            const tabId = btn.getAttribute('data-tab');
            document.getElementById(tabId).classList.add('active');
        });
    });
    
    // New Analysis button
    newAnalysisBtn.addEventListener('click', () => {
        resultsSection.style.display = 'none';
        usernameInput.value = '';
        manualUsername.value = '';
        manualFollowers.value = '';
        manualFollowing.value = '';
        manualPosts.value = '';
        manualBio.value = '';
        hideError();
        
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
    
    // Export Report button
    exportBtn.addEventListener('click', exportToPDF);
    
    // Enter key support for search
    usernameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleAutoAnalysis();
        }
    });
    
    // Enter key support for manual form
    [manualUsername, manualFollowers, manualFollowing, manualPosts, manualBio].forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleManualAnalysis();
            }
        });
    });
});

async function handleAutoAnalysis() {
    const username = usernameInput.value.trim();
    
    if (!validateUsername(username)) {
        return;
    }
    
    showLoading();
    saveLastSearch(username);
    
    try {
        const analysisResults = await analyzeInstagramAccount(username);
        updateUIWithResults(analysisResults);
        
        // Hide loading and show results
        setTimeout(() => {
            hideLoading();
            resultsSection.style.display = 'block';
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }, 500);
        
    } catch (error) {
        console.error('Analysis failed:', error);
        showError('Analysis failed. Please try again.');
        hideLoading();
    }
}

async function handleManualAnalysis() {
    if (!validateManualInput()) {
        return;
    }
    
    const manualData = {
        username: manualUsername.value.trim(),
        followers: manualFollowers.value,
        following: manualFollowing.value,
        posts: manualPosts.value,
        bio: manualBio.value.trim()
    };
    
    showLoading();
    saveLastSearch('@' + manualData.username);
    
    try {
        const analysisResults = await analyzeInstagramAccount(manualData.username, manualData);
        updateUIWithResults(analysisResults);
        
        // Hide loading and show results
        setTimeout(() => {
            hideLoading();
            resultsSection.style.display = 'block';
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        }, 500);
        
    } catch (error) {
        console.error('Analysis failed:', error);
        showError('Analysis failed. Please try again.');
        hideLoading();
    }
}

// Sample data for demonstration
usernameInput.value = '@example_user';
manualUsername.value = 'example_user';
manualFollowers.value = '15000';
manualFollowing.value = '3500';
manualPosts.value = '245';
manualBio.value = 'Digital creator | Photography enthusiast | Travel lover 🌍';

// Close error when clicking anywhere
document.addEventListener('click', (e) => {
    if (!errorCard.contains(e.target) && errorCard.style.display === 'flex') {
        hideError();
    }
});
// =============================================
// MISSING HELPER FUNCTIONS (PASTE AT BOTTOM OF SCRIPT.JS)
// =============================================

function generateRealRedFlags(riskScore, data) {
    const flags = [];
    
    if (riskScore > 65) flags.push("AI Model detected high probability of fake account");
    
    // Calculate ratio safely
    const followers = parseInt(data.followers) || 0;
    const following = parseInt(data.following) || 1; // Avoid divide by zero
    const ratio = followers / following;

    if (ratio < 0.5) flags.push("Following significantly more people than followers");
    if (ratio > 50 && riskScore > 30) flags.push("Suspiciously high follower count vs following");
    
    if (data.posts < 5) flags.push("Very low post count (Inactive)");
    if (data.bio && data.bio.length < 5) flags.push("Empty or very short bio");
    
    // Basic username checks
    if (data.username) {
        const digitCount = (data.username.match(/\d/g) || []).length;
        if (digitCount > 4) flags.push("Username contains many random digits");
    }

    return flags.length > 0 ? flags : ["No obvious red flags detected"];
}

function mockAutoAnalysis(username) {
    // Clean username just in case a URL was passed
    const cleanUsername = username
        .replace("https://www.instagram.com/", "")
        .replace("https://instagram.com/", "")
        .replace(/\/$/, "")
        .replace("@", "");

    let baseData = {
        profile: {
            username: cleanUsername,
            displayName: cleanUsername,
            profilePic: preview.profile_pic_url 
                ? preview.profile_pic_url
                : `https://ui-avatars.com/api/?name=${preview.username}&background=random`,
            isVerified: Math.random() > 0.9,
            followers: Math.floor(Math.random() * 50000) + 100,
            following: Math.floor(Math.random() * 2000) + 50,
            posts: Math.floor(Math.random() * 500) + 5,
            accountAge: 'Unknown',
            bioCompleteness: 'Complete'
        }
    };
    
    // Generate simulated risk score
    const riskScore = Math.floor(Math.random() * 60) + 20;
    const authenticity = Math.max(5, 100 - riskScore);
    
    return {
        profile: baseData.profile,

        metrics: {
            riskScore: riskScore,

            profileAuthenticity: authenticity,
            followerQuality: Math.max(5, authenticity - 10),

            contentConsistency: Math.max(10, authenticity - 5),
            activityPatterns: Math.max(10, authenticity - 15),

            engagementRate: engRate,
            followerRatio: ratio,
            followerGrowth: riskScore > 60 ? 'Suspicious' : 'Organic',
            fakeFollowers: riskScore > 70 ? 'High (>40%)' : 'Low (<5%)',
            usernamePattern: /^[a-zA-Z0-9._]+$/.test(requestPayload.username) ? 'Normal' : 'Complex'
        },

        redFlags: generateRealRedFlags(riskScore, {
            ...baseData.profile, 
            bio: "Simulated Bio" 
        })
    };
}