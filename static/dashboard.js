// CraftConnect Dashboard JavaScript
class CraftConnectDashboard {
    constructor() {
        this.demoData = [
            {
                title: "Handcrafted Madhubani Painting",
                description: "Traditional Madhubani painting on handmade paper depicting nature and folklore. Created by skilled artisan using natural colors and traditional techniques.",
                price: 2500.00,
                artisan: "Sita Devi",
                location: "Madhubani, Bihar",
                materials: "handmade paper, natural pigments, bamboo brush"
            },
            {
                title: "Pure Khadi Cotton Kurta with Chikankari",
                description: "Hand-woven khadi cotton kurta with intricate chikankari embroidery. Made by women artisans using traditional techniques passed down generations.",
                price: 1800.00,
                artisan: "Lucknow Craft Collective",
                location: "Lucknow, Uttar Pradesh",
                materials: "pure khadi cotton, silk thread"
            },
            {
                title: "Dhokra Brass Dancing Girl Sculpture",
                description: "Beautiful dhokra art brass sculpture of dancing girl using traditional lost-wax casting technique. Eco-friendly and supports tribal artisans.",
                price: 3500.00,
                artisan: "Bastar Tribal Crafts",
                location: "Bastar, Chhattisgarh",
                materials: "brass, beeswax, clay"
            },
            {
                title: "Bandhani Silk Dupatta",
                description: "Vibrant bandhani tie-dye silk dupatta with mirror work. Handcrafted using traditional Gujarati techniques with natural dyes and sustainable practices.",
                price: 2200.00,
                artisan: "Gujarat Handicrafts",
                location: "Bhuj, Gujarat",
                materials: "pure silk, natural dyes, mirrors"
            }
        ];
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.showInitialMessage();
        this.animateStats();
    }

    setupEventListeners() {
        const form = document.getElementById('craft-form');
        form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    showInitialMessage() {
        document.getElementById('initial-message').style.display = 'block';
        document.getElementById('results-container').style.display = 'none';
    }

    animateStats() {
        // Animate stat numbers
        this.animateNumber('crafts-analyzed', 1247, 2000);
        this.animateNumber('sustainability-score', 0.87, 2000, 2);
        this.animateNumber('categories-detected', 8, 2000);
        this.animateNumber('artisans-helped', 156, 2000);
    }

    animateNumber(elementId, targetValue, duration, decimals = 0) {
        const element = document.getElementById(elementId);
        const startValue = 0;
        const increment = targetValue / (duration / 16); // 60 FPS
        let currentValue = startValue;

        const timer = setInterval(() => {
            currentValue += increment;
            if (currentValue >= targetValue) {
                currentValue = targetValue;
                clearInterval(timer);
            }
            
            if (decimals > 0) {
                element.textContent = currentValue.toFixed(decimals);
            } else {
                element.textContent = Math.floor(currentValue).toLocaleString();
            }
        }, 16);
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('title', document.getElementById('title').value);
        formData.append('description', document.getElementById('description').value);
        formData.append('price', document.getElementById('price').value);
        formData.append('artisan', document.getElementById('artisan').value);
        formData.append('location', document.getElementById('location').value);
        formData.append('materials', document.getElementById('materials').value);
        
        const imageFile = document.getElementById('image').files[0];
        if (imageFile) {
            formData.append('image', imageFile);
        }

        await this.submitCraft(formData);
    }

    async submitCraft(formData) {
        this.showLoading(true);
        this.showStatus('info', 'Analyzing craft with AI...');

        try {
            const response = await fetch('/api/products/upload/form', {
                method: 'POST',
                body: formData
            });

            const result = await response.json();
            
            if (result.success) {
                this.showStatus('success', '✨ Analysis complete! Check the results panel.');
                this.displayResults(result.tags);
                this.updateStats();
            } else {
                this.showStatus('error', `❌ Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error:', error);
            this.showStatus('error', '❌ Network error. Please try again.');
        } finally {
            this.showLoading(false);
        }
    }

    displayResults(tags) {
        document.getElementById('initial-message').style.display = 'none';
        document.getElementById('results-container').style.display = 'block';

        // Categories
        this.displayTags('categories-tags', tags.categories, 'category');
        this.updateConfidenceBar('categories-confidence', tags.confidence_scores.overall);

        // Materials
        this.displayTags('materials-tags', tags.materials, 'material');

        // Sustainability tags
        this.displayTags('sustainability-tags', tags.sustainability_tags, 'sustainability');

        // Eco score
        const ecoScore = (tags.eco_impact_score * 100).toFixed(0);
        document.getElementById('eco-score').textContent = `${ecoScore}/100`;

        // Price category
        document.getElementById('price-category').textContent = tags.price_category;

        // Insights
        document.getElementById('word-count').textContent = tags.extracted_features.word_count;
        document.getElementById('material-count').textContent = tags.extracted_features.material_count;
        document.getElementById('overall-confidence').textContent = Math.round(tags.confidence_scores.overall * 100);

        // Animate results
        this.animateResults();
    }

    displayTags(containerId, tags, type) {
        const container = document.getElementById(containerId);
        container.innerHTML = '';
        
        if (tags.length === 0) {
            container.innerHTML = '<span style="color: var(--text-secondary); font-style: italic;">None detected</span>';
            return;
        }

        tags.forEach(tag => {
            const tagElement = document.createElement('span');
            tagElement.className = `tag ${type}`;
            tagElement.textContent = tag;
            container.appendChild(tagElement);
        });
    }

    updateConfidenceBar(barId, confidence) {
        const bar = document.getElementById(barId);
        const percentage = Math.max(10, confidence * 100); // Minimum 10% for visibility
        bar.style.width = `${percentage}%`;
    }

    animateResults() {
        const resultCards = document.querySelectorAll('.result-card');
        resultCards.forEach((card, index) => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                card.style.transition = 'all 0.5s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }

    showLoading(show) {
        const loading = document.querySelector('.loading');
        const form = document.getElementById('craft-form');
        const submitBtn = document.querySelector('.btn-primary');
        
        if (show) {
            loading.style.display = 'block';
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analyzing...';
        } else {
            loading.style.display = 'none';
            submitBtn.disabled = false;
            submitBtn.innerHTML = '<i class="fas fa-sparkles"></i> Analyze with AI';
        }
    }

    showStatus(type, message) {
        const statusElement = document.getElementById('status-message');
        statusElement.className = `status-message ${type}`;
        statusElement.textContent = message;
        statusElement.style.display = 'block';
        
        // Hide after 5 seconds
        setTimeout(() => {
            statusElement.style.display = 'none';
        }, 5000);
    }

    updateStats() {
        // Increment crafts analyzed
        const craftsElement = document.getElementById('crafts-analyzed');
        const currentValue = parseInt(craftsElement.textContent.replace(',', ''));
        craftsElement.textContent = (currentValue + 1).toLocaleString();
    }

    // Demo functionality
    loadDemo(index) {
        if (index < 0 || index >= this.demoData.length) return;
        
        const demo = this.demoData[index];
        
        // Fill form with demo data
        document.getElementById('title').value = demo.title;
        document.getElementById('description').value = demo.description;
        document.getElementById('price').value = demo.price || '';
        document.getElementById('artisan').value = demo.artisan || '';
        document.getElementById('location').value = demo.location || '';
        document.getElementById('materials').value = demo.materials || '';

        // Scroll to form
        document.querySelector('.upload-section').scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        });

        // Highlight the form briefly
        const form = document.getElementById('craft-form');
        form.style.boxShadow = '0 0 20px rgba(46, 139, 87, 0.3)';
        setTimeout(() => {
            form.style.boxShadow = '';
        }, 2000);

        this.showStatus('info', `📝 Loaded demo: ${demo.title}`);
    }
}

// Global function for demo buttons
function loadDemo(index) {
    if (window.craftConnect) {
        window.craftConnect.loadDemo(index);
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.craftConnect = new CraftConnectDashboard();
    
    // Add some extra interactivity
    addInteractiveFeatures();
});

function addInteractiveFeatures() {
    // Add hover effects to demo cards
    const demoCards = document.querySelectorAll('.demo-card');
    demoCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });

    // Add typing effect to tagline
    addTypingEffect();
    
    // Add particle effect (optional visual enhancement)
    addParticleEffect();
}

function addTypingEffect() {
    const tagline = document.querySelector('.tagline');
    const originalText = tagline.textContent;
    tagline.textContent = '';
    
    let i = 0;
    const typeWriter = () => {
        if (i < originalText.length) {
            tagline.textContent += originalText.charAt(i);
            i++;
            setTimeout(typeWriter, 50);
        }
    };
    
    // Start typing after a short delay
    setTimeout(typeWriter, 1000);
}

function addParticleEffect() {
    // Simple floating dots animation
    const header = document.querySelector('.header');
    
    for (let i = 0; i < 5; i++) {
        const dot = document.createElement('div');
        dot.style.cssText = `
            position: absolute;
            width: 6px;
            height: 6px;
            background: var(--primary-color);
            border-radius: 50%;
            opacity: 0.3;
            animation: float ${3 + Math.random() * 2}s ease-in-out infinite;
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
        `;
        header.style.position = 'relative';
        header.appendChild(dot);
    }
    
    // Add CSS for float animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }
    `;
    document.head.appendChild(style);
}