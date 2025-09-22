// CraftConnect Marketplace JavaScript
class CraftMarketplace {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.displayedProducts = [];
        this.currentPage = 0;
        this.productsPerPage = 12;
        this.activeFilters = {
            search: '',
            category: '',
            region: '',
            priceRange: '',
            sustainability: [],
            sort: 'relevance'
        };
        
        this.init();
    }

    init() {
        this.loadSampleProducts();
        this.setupEventListeners();
        this.applyFilters();
    }

    loadSampleProducts() {
        // Sample Indian craft products with sustainability info
        this.products = [
            {
                id: 1,
                title: "Traditional Madhubani Painting - Peacock Dance",
                artisan: "Sita Devi",
                location: "Madhubani, Bihar",
                region: "bihar",
                price: 2500,
                category: "paintings",
                description: "Vibrant Madhubani painting depicting peacocks in traditional folk art style. Created using natural pigments on handmade paper.",
                materials: ["handmade paper", "natural pigments", "bamboo brush"],
                sustainabilityFeatures: ["organic", "handmade", "traditional", "natural-dyes"],
                ecoScore: 9.2,
                tags: ["madhubani", "folk art", "peacock"],
                featured: true,
                popularity: 95,
                dateAdded: "2024-01-15",
                image: "🎨"
            },
            {
                id: 2,
                title: "Pure Khadi Cotton Kurta with Chikankari Embroidery",
                artisan: "Lucknow Craft Collective",
                location: "Lucknow, Uttar Pradesh",
                region: "uttar pradesh",
                price: 1800,
                category: "textiles",
                description: "Hand-woven khadi cotton kurta featuring intricate chikankari embroidery. Made by women artisans using traditional techniques.",
                materials: ["khadi cotton", "silk thread"],
                sustainabilityFeatures: ["organic", "handmade", "traditional", "fair-trade"],
                ecoScore: 8.8,
                tags: ["chikankari", "khadi", "kurta"],
                featured: false,
                popularity: 87,
                dateAdded: "2024-02-01",
                image: "👕"
            },
            {
                id: 3,
                title: "Dhokra Brass Dancing Girl Sculpture",
                artisan: "Bastar Tribal Crafts",
                location: "Bastar, Chhattisgarh",
                region: "chhattisgarh",
                price: 3500,
                category: "metalwork",
                description: "Authentic dhokra art brass sculpture using traditional lost-wax casting technique. Supports tribal artisan communities.",
                materials: ["brass", "beeswax", "clay"],
                sustainabilityFeatures: ["handmade", "traditional", "fair-trade", "local"],
                ecoScore: 8.5,
                tags: ["dhokra", "tribal art", "brass"],
                featured: true,
                popularity: 78,
                dateAdded: "2024-01-20",
                image: "🗿"
            },
            {
                id: 4,
                title: "Bandhani Silk Dupatta with Mirror Work",
                artisan: "Gujarat Handicrafts",
                location: "Bhuj, Gujarat",
                region: "gujarat",
                price: 2200,
                category: "textiles",
                description: "Vibrant bandhani tie-dye silk dupatta with traditional mirror work. Created using natural dyes and age-old techniques.",
                materials: ["pure silk", "natural dyes", "mirrors"],
                sustainabilityFeatures: ["handmade", "natural-dyes", "traditional", "local"],
                ecoScore: 8.3,
                tags: ["bandhani", "tie-dye", "dupatta"],
                featured: false,
                popularity: 82,
                dateAdded: "2024-02-10",
                image: "🧣"
            },
            {
                id: 5,
                title: "Warli Painting on Recycled Canvas",
                artisan: "Mumbai Folk Artists",
                location: "Mumbai, Maharashtra",
                region: "maharashtra",
                price: 1500,
                category: "paintings",
                description: "Contemporary Warli tribal art painted on recycled canvas. Modern take on ancient storytelling traditions.",
                materials: ["recycled canvas", "natural pigments"],
                sustainabilityFeatures: ["recycled", "handmade", "traditional", "natural-dyes"],
                ecoScore: 8.7,
                tags: ["warli", "tribal", "recycled"],
                featured: false,
                popularity: 71,
                dateAdded: "2024-02-05",
                image: "🖼️"
            },
            {
                id: 6,
                title: "Blue Pottery Decorative Bowl Set",
                artisan: "Jaipur Blue Pottery",
                location: "Jaipur, Rajasthan",
                region: "rajasthan",
                price: 1200,
                category: "pottery",
                description: "Set of three decorative bowls in traditional Rajasthani blue pottery. Lead-free and eco-friendly glazing.",
                materials: ["clay", "natural glazes"],
                sustainabilityFeatures: ["handmade", "local", "traditional", "zero-waste"],
                ecoScore: 8.1,
                tags: ["blue pottery", "decorative", "bowl set"],
                featured: false,
                popularity: 65,
                dateAdded: "2024-01-25",
                image: "🏺"
            },
            {
                id: 7,
                title: "Kantha Embroidered Cotton Bedcover",
                artisan: "Bengal Artisan Guild",
                location: "Kolkata, West Bengal",
                region: "west bengal",
                price: 2800,
                category: "textiles",
                description: "Beautiful kantha embroidered bedcover made from recycled cotton saris. Each piece tells a unique story through stitches.",
                materials: ["recycled cotton", "colored threads"],
                sustainabilityFeatures: ["recycled", "handmade", "traditional", "zero-waste"],
                ecoScore: 9.0,
                tags: ["kantha", "embroidery", "bedcover"],
                featured: true,
                popularity: 89,
                dateAdded: "2024-02-15",
                image: "🛏️"
            },
            {
                id: 8,
                title: "Sandalwood Carved Ganesha Statue",
                artisan: "Mysore Wood Carvers",
                location: "Mysore, Karnataka",
                region: "karnataka",
                price: 4500,
                category: "woodwork",
                description: "Intricately carved Ganesha statue in aromatic sandalwood. Traditional Karnataka woodcarving craftsmanship.",
                materials: ["sandalwood", "natural finish"],
                sustainabilityFeatures: ["handmade", "traditional", "local"],
                ecoScore: 7.5,
                tags: ["sandalwood", "carving", "ganesha"],
                featured: false,
                popularity: 73,
                dateAdded: "2024-01-30",
                image: "🕉️"
            },
            {
                id: 9,
                title: "Organic Jute Shopping Bag with Block Print",
                artisan: "Eco Craft Studio",
                location: "Delhi",
                region: "delhi",
                price: 450,
                category: "fiber_arts",
                description: "Sturdy organic jute shopping bag with hand block printed designs. Perfect eco-friendly alternative to plastic bags.",
                materials: ["organic jute", "natural dyes"],
                sustainabilityFeatures: ["organic", "recycled", "handmade", "zero-waste", "natural-dyes"],
                ecoScore: 9.5,
                tags: ["jute", "eco-friendly", "shopping bag"],
                featured: false,
                popularity: 91,
                dateAdded: "2024-02-12",
                image: "👜"
            },
            {
                id: 10,
                title: "Silver Filigree Jewelry Box",
                artisan: "Cuttack Silver Works",
                location: "Cuttack, Odisha",
                region: "odisha",
                price: 3200,
                category: "jewelry",
                description: "Exquisite silver filigree jewelry box showcasing Odisha's traditional metalwork. Intricate wirework design.",
                materials: ["silver wire", "velvet lining"],
                sustainabilityFeatures: ["handmade", "traditional", "local"],
                ecoScore: 7.8,
                tags: ["filigree", "silver", "jewelry box"],
                featured: false,
                popularity: 69,
                dateAdded: "2024-01-28",
                image: "💍"
            },
            {
                id: 11,
                title: "Coconut Shell Decorative Lamp",
                artisan: "Kerala Coconut Crafts",
                location: "Kochi, Kerala",
                region: "kerala",
                price: 850,
                category: "woodwork",
                description: "Unique decorative lamp made from recycled coconut shells. Sustainable lighting solution with traditional Kerala aesthetics.",
                materials: ["coconut shell", "LED lights"],
                sustainabilityFeatures: ["recycled", "handmade", "local", "zero-waste"],
                ecoScore: 8.9,
                tags: ["coconut", "sustainable", "lamp"],
                featured: false,
                popularity: 76,
                dateAdded: "2024-02-08",
                image: "🥥"
            },
            {
                id: 12,
                title: "Pashmina Shawl with Natural Dyes",
                artisan: "Kashmir Valley Weavers",
                location: "Srinagar, Kashmir",
                region: "kashmir",
                price: 5500,
                category: "textiles",
                description: "Luxurious pashmina shawl hand-woven from finest cashmere wool. Colored with natural plant-based dyes.",
                materials: ["cashmere wool", "natural dyes"],
                sustainabilityFeatures: ["handmade", "natural-dyes", "traditional", "local"],
                ecoScore: 8.0,
                tags: ["pashmina", "cashmere", "luxury"],
                featured: true,
                popularity: 85,
                dateAdded: "2024-01-18",
                image: "🧶"
            }
        ];
    }

    setupEventListeners() {
        // Search input
        document.getElementById('search-input').addEventListener('input', (e) => {
            this.activeFilters.search = e.target.value.toLowerCase();
            this.applyFilters();
        });

        // Category filter
        document.getElementById('category-filter').addEventListener('change', (e) => {
            this.activeFilters.category = e.target.value;
            this.applyFilters();
        });

        // Region filter
        document.getElementById('region-filter').addEventListener('change', (e) => {
            this.activeFilters.region = e.target.value;
            this.applyFilters();
        });

        // Price filter
        document.getElementById('price-filter').addEventListener('change', (e) => {
            this.activeFilters.priceRange = e.target.value;
            this.applyFilters();
        });

        // Sort selector
        document.getElementById('sort-select').addEventListener('change', (e) => {
            this.activeFilters.sort = e.target.value;
            this.applyFilters();
        });

        // Sustainability filter tags
        document.querySelectorAll('.sustainability-tag').forEach(tag => {
            tag.addEventListener('click', (e) => {
                const filter = e.target.getAttribute('data-filter');
                this.toggleSustainabilityFilter(filter);
                this.applyFilters();
            });
        });
    }

    toggleSustainabilityFilter(filter) {
        const tag = document.querySelector(`[data-filter="${filter}"]`);
        const index = this.activeFilters.sustainability.indexOf(filter);

        if (index > -1) {
            // Remove filter
            this.activeFilters.sustainability.splice(index, 1);
            tag.classList.remove('active');
        } else {
            // Add filter
            this.activeFilters.sustainability.push(filter);
            tag.classList.add('active');
        }
    }

    applyFilters() {
        this.filteredProducts = this.products.filter(product => {
            // Search filter
            if (this.activeFilters.search) {
                const searchTerm = this.activeFilters.search;
                const searchableText = `${product.title} ${product.artisan} ${product.description} ${product.tags.join(' ')}`.toLowerCase();
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }

            // Category filter
            if (this.activeFilters.category && product.category !== this.activeFilters.category) {
                return false;
            }

            // Region filter
            if (this.activeFilters.region && product.region !== this.activeFilters.region) {
                return false;
            }

            // Price range filter
            if (this.activeFilters.priceRange) {
                const [min, max] = this.activeFilters.priceRange.split('-').map(Number);
                if (product.price < min || product.price > max) {
                    return false;
                }
            }

            // Sustainability filters
            if (this.activeFilters.sustainability.length > 0) {
                const hasAllFeatures = this.activeFilters.sustainability.every(feature => 
                    product.sustainabilityFeatures.includes(feature)
                );
                if (!hasAllFeatures) {
                    return false;
                }
            }

            return true;
        });

        this.sortProducts();
        this.currentPage = 0;
        this.displayProducts();
        this.updateResultsCount();
    }

    sortProducts() {
        switch (this.activeFilters.sort) {
            case 'price-low':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'eco-score':
                this.filteredProducts.sort((a, b) => b.ecoScore - a.ecoScore);
                break;
            case 'newest':
                this.filteredProducts.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));
                break;
            case 'popularity':
                this.filteredProducts.sort((a, b) => b.popularity - a.popularity);
                break;
            default: // relevance
                this.filteredProducts.sort((a, b) => {
                    // Sort by featured status first, then by popularity
                    if (a.featured && !b.featured) return -1;
                    if (!a.featured && b.featured) return 1;
                    return b.popularity - a.popularity;
                });
        }
    }

    displayProducts() {
        const grid = document.getElementById('products-grid');
        const noResults = document.getElementById('no-results');
        const loadMore = document.getElementById('load-more');

        if (this.filteredProducts.length === 0) {
            grid.innerHTML = '';
            noResults.style.display = 'block';
            loadMore.style.display = 'none';
            return;
        }

        noResults.style.display = 'none';

        // Calculate products to show
        const startIndex = 0;
        const endIndex = Math.min((this.currentPage + 1) * this.productsPerPage, this.filteredProducts.length);
        this.displayedProducts = this.filteredProducts.slice(startIndex, endIndex);

        // Generate HTML for products
        grid.innerHTML = this.displayedProducts.map(product => this.createProductCard(product)).join('');

        // Show/hide load more button
        loadMore.style.display = endIndex < this.filteredProducts.length ? 'block' : 'none';

        // Add click events to product cards
        this.setupProductCardEvents();
    }

    createProductCard(product) {
        const sustainabilityTags = product.sustainabilityFeatures.slice(0, 3); // Show first 3
        const materialTags = product.materials.slice(0, 2); // Show first 2
        
        return `
            <div class="product-card" data-product-id="${product.id}">
                <div class="product-image">
                    ${product.image}
                    ${product.featured ? '<div class="product-badge">Featured</div>' : ''}
                    <div class="eco-score-badge">${product.ecoScore}/10</div>
                </div>
                <div class="product-info">
                    <div class="product-title">${product.title}</div>
                    <div class="product-artisan">by ${product.artisan}</div>
                    <div class="product-location">📍 ${product.location}</div>
                    <div class="product-description">${product.description}</div>
                    
                    <div class="product-tags">
                        ${sustainabilityTags.map(tag => `<span class="product-tag sustainability">${this.getSustainabilityIcon(tag)} ${this.formatTag(tag)}</span>`).join('')}
                        ${materialTags.map(material => `<span class="product-tag material">${material}</span>`).join('')}
                    </div>
                    
                    <div class="product-footer">
                        <div class="product-price">₹${product.price.toLocaleString('en-IN')}</div>
                        <div class="product-actions">
                            <button class="btn-small btn-outline-small" onclick="viewProduct(${product.id})">
                                <i class="fas fa-eye"></i> View
                            </button>
                            <button class="btn-small btn-primary-small" onclick="contactArtisan(${product.id})">
                                <i class="fas fa-envelope"></i> Contact
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getSustainabilityIcon(tag) {
        const icons = {
            'organic': '🌱',
            'recycled': '♻️',
            'handmade': '🤲',
            'natural-dyes': '🎨',
            'fair-trade': '🤝',
            'zero-waste': '🌍',
            'traditional': '🏛️',
            'local': '📍'
        };
        return icons[tag] || '✨';
    }

    formatTag(tag) {
        return tag.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }

    setupProductCardEvents() {
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                // Don't trigger if clicking on buttons
                if (e.target.tagName === 'BUTTON' || e.target.closest('button')) {
                    return;
                }
                
                const productId = card.getAttribute('data-product-id');
                this.viewProduct(parseInt(productId));
            });
        });
    }

    viewProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            // For now, just show an alert. In a real app, this would open a detailed view
            alert(`Viewing: ${product.title}\n\nThis would open a detailed product view with:\n• More images\n• Full description\n• Artisan story\n• Reviews\n• Purchase options`);
        }
    }

    contactArtisan(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            alert(`Contact ${product.artisan}\n\nThis would open a contact form or messaging system to connect directly with the artisan.`);
        }
    }

    updateResultsCount() {
        document.getElementById('results-count').textContent = this.filteredProducts.length;
    }

    loadMoreProducts() {
        this.currentPage++;
        this.displayProducts();
    }

    clearAllFilters() {
        // Reset all filters
        this.activeFilters = {
            search: '',
            category: '',
            region: '',
            priceRange: '',
            sustainability: [],
            sort: 'relevance'
        };

        // Reset UI elements
        document.getElementById('search-input').value = '';
        document.getElementById('category-filter').value = '';
        document.getElementById('region-filter').value = '';
        document.getElementById('price-filter').value = '';
        document.getElementById('sort-select').value = 'relevance';

        // Clear sustainability tags
        document.querySelectorAll('.sustainability-tag.active').forEach(tag => {
            tag.classList.remove('active');
        });

        // Apply filters
        this.applyFilters();
    }
}

// Global functions for button clicks
function viewProduct(productId) {
    if (window.marketplace) {
        window.marketplace.viewProduct(productId);
    }
}

function contactArtisan(productId) {
    if (window.marketplace) {
        window.marketplace.contactArtisan(productId);
    }
}

function loadMoreProducts() {
    if (window.marketplace) {
        window.marketplace.loadMoreProducts();
    }
}

function clearAllFilters() {
    if (window.marketplace) {
        window.marketplace.clearAllFilters();
    }
}

// Initialize marketplace when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.marketplace = new CraftMarketplace();
});