// Healthcare Platform Main JavaScript

// DOM Content Loaded Event
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

// Initialize Application
function initializeApp() {
    initializeTooltips();
    initializeModals();
    initializeFormValidation();
    initializeSearchEnhancements();
    initializeCartFunctionality();
    initializeProductInteractions();
    initializeAccessibility();
}

// Initialize Bootstrap Tooltips
function initializeTooltips() {
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function(tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

// Initialize Modals
function initializeModals() {
    // Auto-dismiss alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert:not(.alert-danger)');
    alerts.forEach(alert => {
        if (!alert.querySelector('.btn-close')) return;
        
        setTimeout(() => {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
        }, 5000);
    });
}

// Form Validation
function initializeFormValidation() {
    const forms = document.querySelectorAll('.needs-validation');
    
    Array.from(forms).forEach(form => {
        form.addEventListener('submit', event => {
            if (!form.checkValidity()) {
                event.preventDefault();
                event.stopPropagation();
            }
            
            form.classList.add('was-validated');
        }, false);
    });
}

// Search Enhancements
function initializeSearchEnhancements() {
    const searchInput = document.querySelector('input[name="q"]');
    
    if (searchInput) {
        // Add search suggestions
        searchInput.addEventListener('input', debounce(function(e) {
            const query = e.target.value.trim();
            if (query.length >= 2) {
                showSearchSuggestions(query);
            } else {
                hideSearchSuggestions();
            }
        }, 300));
        
        // Clear suggestions when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.search-container')) {
                hideSearchSuggestions();
            }
        });
    }
}

// Search Suggestions
function showSearchSuggestions(query) {
    const suggestions = [
        'headache', 'fever', 'cough', 'allergies', 'pain relief',
        'cold medicine', 'stomach ache', 'insomnia', 'acid reflux'
    ];
    
    const filteredSuggestions = suggestions.filter(s => 
        s.toLowerCase().includes(query.toLowerCase())
    );
    
    if (filteredSuggestions.length === 0) return;
    
    const searchContainer = document.querySelector('.search-container') || 
                           document.querySelector('input[name="q"]').parentElement;
    
    let suggestionBox = document.querySelector('.search-suggestions');
    if (!suggestionBox) {
        suggestionBox = document.createElement('div');
        suggestionBox.className = 'search-suggestions position-absolute bg-white border rounded shadow-sm';
        suggestionBox.style.cssText = 'top: 100%; left: 0; right: 0; z-index: 1000; max-height: 200px; overflow-y: auto;';
        searchContainer.style.position = 'relative';
        searchContainer.appendChild(suggestionBox);
    }
    
    suggestionBox.innerHTML = filteredSuggestions.map(suggestion => 
        `<div class="suggestion-item p-2 cursor-pointer hover:bg-light" data-suggestion="${suggestion}">
            <i class="fas fa-search me-2 text-muted"></i>${suggestion}
         </div>`
    ).join('');
    
    // Add click events to suggestions
    suggestionBox.querySelectorAll('.suggestion-item').forEach(item => {
        item.addEventListener('click', function() {
            const suggestion = this.dataset.suggestion;
            document.querySelector('input[name="q"]').value = suggestion;
            hideSearchSuggestions();
            // Submit search
            this.closest('form').submit();
        });
    });
}

function hideSearchSuggestions() {
    const suggestionBox = document.querySelector('.search-suggestions');
    if (suggestionBox) {
        suggestionBox.remove();
    }
}

// Cart Functionality
function initializeCartFunctionality() {
    // Update cart count in real-time
    updateCartDisplay();
    
    // Add to cart form enhancements
    const addToCartForms = document.querySelectorAll('form[action*="add_to_cart"]');
    addToCartForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const button = form.querySelector('button[type="submit"]');
            if (button) {
                button.disabled = true;
                button.innerHTML = '<i class="fas fa-spinner fa-spin me-2"></i>Adding...';
                
                // Re-enable button after form submission
                setTimeout(() => {
                    button.disabled = false;
                    button.innerHTML = '<i class="fas fa-cart-plus me-2"></i>Add to Cart';
                }, 2000);
            }
        });
    });
}

// Product Interactions
function initializeProductInteractions() {
    // Product card hover effects
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
            this.style.boxShadow = '0 10px 25px rgba(0,123,255,0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '';
        });
    });
    
    // Image lazy loading
    const images = document.querySelectorAll('img[data-src]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    imageObserver.unobserve(img);
                }
            });
        });
        
        images.forEach(img => imageObserver.observe(img));
    }
}

// Accessibility Enhancements
function initializeAccessibility() {
    // Keyboard navigation for product cards
    const productCards = document.querySelectorAll('.product-card');
    productCards.forEach(card => {
        card.setAttribute('tabindex', '0');
        card.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                const link = this.querySelector('a');
                if (link) link.click();
            }
        });
    });
    
    // Skip to main content link
    if (!document.querySelector('.skip-link')) {
        const skipLink = document.createElement('a');
        skipLink.href = '#main';
        skipLink.className = 'skip-link sr-only';
        skipLink.textContent = 'Skip to main content';
        skipLink.addEventListener('focus', function() {
            this.classList.remove('sr-only');
        });
        skipLink.addEventListener('blur', function() {
            this.classList.add('sr-only');
        });
        document.body.insertBefore(skipLink, document.body.firstChild);
    }
}

// Utility Functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function updateCartDisplay() {
    // This would typically fetch from the server
    // For now, we'll update based on localStorage or session
    const cartBadge = document.querySelector('.badge');
    if (cartBadge && cartBadge.textContent === '0') {
        cartBadge.style.display = 'none';
    }
}

// Notification System
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show notification`;
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; z-index: 9999; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Emergency Functions
function callEmergency() {
    if (confirm('This will call emergency services. Continue?')) {
        window.location.href = 'tel:911';
    }
}

function callAmbulance() {
    if (confirm('This will call ambulance services. Continue?')) {
        window.location.href = 'tel:1-800-AMBULANCE';
    }
}

// Search Functionality
function searchProducts(query) {
    if (!query || query.trim().length < 2) {
        showNotification('Please enter at least 2 characters to search', 'warning');
        return;
    }
    
    window.location.href = `/search?q=${encodeURIComponent(query.trim())}`;
}

// Product Filtering
function filterProducts(category) {
    const url = new URL(window.location.href);
    if (category) {
        url.searchParams.set('category', category);
    } else {
        url.searchParams.delete('category');
    }
    window.location.href = url.toString();
}

// Theme Toggle (if needed)
function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-bs-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-bs-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// Load saved theme
function loadSavedTheme() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-bs-theme', savedTheme);
    }
}

// Price Formatting
function formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(price);
}

// Error Handling
window.addEventListener('error', function(e) {
    console.error('JavaScript Error:', e.error);
    // In production, you might want to send this to an error tracking service
});

// Page Visibility API for performance
document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
        // Page is hidden, pause unnecessary operations
        clearInterval(window.chatbotTypingInterval);
    } else {
        // Page is visible, resume operations
        updateCartDisplay();
    }
});

// Export functions for global use
window.HealthCarePlatform = {
    showNotification,
    callEmergency,
    callAmbulance,
    searchProducts,
    filterProducts,
    toggleTheme,
    formatPrice
};

// Service Worker Registration (if available)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/static/js/sw.js')
            .then(function(registration) {
                console.log('ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}
