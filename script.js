// Review form handling (unified contact form)
const reviewForm = document.querySelector('#reviewForm');
if (reviewForm) {
    let selectedRating = 0;
    
    // Rating stars functionality
    const ratingStars = document.querySelectorAll('.rating-star');
    const ratingText = document.querySelector('.rating-text');
    
    ratingStars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            selectedRating = rating;
            
            // Update stars appearance
            ratingStars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
            
            // Update rating text
            const ratingMessages = {
                1: 'Poor',
                2: 'Fair',
                3: 'Good',
                4: 'Very Good',
                5: 'Excellent'
            };
            ratingText.textContent = ratingMessages[rating];
        });
    });
    
    // Review form submission
    reviewForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (selectedRating === 0) {
            showNotification('Please select a rating before submitting.', 'error');
            return;
        }
        
        const formData = new FormData(reviewForm);
        const reviewData = {
            name: formData.get('name'),
            email: formData.get('email'),
            company: formData.get('company'),
            rating: selectedRating,
            comment: formData.get('message'),
            date: new Date().toISOString()
        };
        
        // Store review in localStorage
        saveReview(reviewData);
        
        // Also send to Formspree for email notification
        fetch(reviewForm.action, {
            method: reviewForm.method,
            body: formData,
            headers: {
                'Accept': 'application/json'
            }
        }).then(response => {
            if (response.ok) {
                showNotification('Thank you for your review! It will be displayed on our website.', 'success');
                reviewForm.reset();
                selectedRating = 0;
                ratingStars.forEach(star => star.classList.remove('active'));
                ratingText.textContent = 'Click to rate';
            } else {
                response.json().then(data => {
                    if (Object.hasOwn(data, 'errors')) {
                        showNotification(data["errors"].map(error => error["message"]).join(", "), 'error');
                    } else {
                        showNotification('Oops! There was a problem submitting your review.', 'error');
                    }
                })
            }
        }).catch(error => {
            showNotification('Oops! There was a problem submitting your review.', 'error');
        });
    });
}

// Save review to localStorage
function saveReview(reviewData) {
    let reviews = JSON.parse(localStorage.getItem('snowDesignReviews') || '[]');
    reviews.push(reviewData);
    localStorage.setItem('snowDesignReviews', JSON.stringify(reviews));
}

// Delete review from localStorage
function deleteReview(reviewToDelete) {
    const reviews = JSON.parse(localStorage.getItem('snowDesignReviews') || '[]');
    const updatedReviews = reviews.filter(review => 
        review.name !== reviewToDelete.name || 
        review.email !== reviewToDelete.email || 
        review.comment !== reviewToDelete.comment ||
        review.date !== reviewToDelete.date
    );
    localStorage.setItem('snowDesignReviews', JSON.stringify(updatedReviews));
}

// Load and display reviews
function loadReviews() {
    const reviews = JSON.parse(localStorage.getItem('snowDesignReviews') || '[]');
    const testimonialsContainer = document.querySelector('#testimonialsContainer');
    
    if (testimonialsContainer && reviews.length > 0) {
        // Clear existing testimonials
        testimonialsContainer.innerHTML = '';
        
        // Add new reviews
        reviews.forEach(review => {
            const testimonialCard = createTestimonialCard(review);
            testimonialsContainer.appendChild(testimonialCard);
        });
    }
}

// Create testimonial card from review data
function createTestimonialCard(review) {
    const card = document.createElement('div');
    card.className = 'testimonial-card';
    
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    const initials = review.name.split(' ').map(n => n[0]).join('').toUpperCase();
    
    card.innerHTML = `
        <div class="testimonial-content">
            <div class="testimonial-header">
                <div class="stars">
                    ${stars.split('').map(star => `<i class="fas fa-star" style="color: ${star === '★' ? '#fbbf24' : '#d1d5db'}"></i>`).join('')}
                </div>
                <button class="delete-review-btn" title="Delete Review">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
            <p>"${review.comment}"</p>
            <div class="testimonial-author">
                <div class="author-avatar">
                    <span>${initials}</span>
                </div>
                <div class="author-info">
                    <h4>${review.name}</h4>
                    <span>${review.company || 'Client'}</span>
                </div>
            </div>
        </div>
    `;
    
    // Add delete functionality
    const deleteBtn = card.querySelector('.delete-review-btn');
    deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this review?')) {
            deleteReview(review);
            card.remove();
            updateHeroStats();
            showNotification('Review deleted successfully', 'success');
        }
    });
    
    return card;
}

// Update hero stats with real review data
function updateHeroStats() {
    const reviews = JSON.parse(localStorage.getItem('snowDesignReviews') || '[]');
    const statNumbers = document.querySelectorAll('.stat-number');
    
    if (reviews.length > 0) {
        // Calculate average rating
        const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = (totalRating / reviews.length).toFixed(1);
        
        // Update number of reviews
        if (statNumbers.length >= 2) {
            statNumbers[1].textContent = reviews.length;
        }
        
        // Update average rating
        if (statNumbers.length >= 3) {
            statNumbers[2].textContent = averageRating;
        }
    }
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`; // e.g., notification-success
    notification.textContent = message;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'notification-close';
    closeBtn.innerHTML = '&times;';
    notification.appendChild(closeBtn);
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    const removeNotification = () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 400);
    };

    // Close button functionality
    closeBtn.addEventListener('click', removeNotification);
    
    // Auto remove after 5 seconds
    setTimeout(removeNotification, 5000);
}

// Typing animation for hero title
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// Initialize typing animation when page loads
document.addEventListener('DOMContentLoaded', () => {
    // Load reviews if on testimonials page
    loadReviews();
    
    // Update hero stats with real data
    updateHeroStats();
    
    // --- Mobile Navigation ---
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
    }

    // Set active nav link based on current path
    const currentPath = window.location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('.nav-link').forEach(link => {
        const href = link.getAttribute('href');
        if (
            href === currentPath ||
            (currentPath === 'index.html' && (href === '/' || href === 'index.html'))
        ) {
            link.classList.add('active');
        }
    });

    // --- Fade-in on load ---
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);

    // --- Smooth Scrolling (only for same-page anchors) ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            const target = document.querySelector(targetId);
            if (target) {
                e.preventDefault();
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // --- Scroll Animations ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Stop observing after it's visible
            }
        });
    }, observerOptions);
    const animateElements = document.querySelectorAll('.project-card, .skill-item, .stat, .about-text, .process-step, .faq-item');
    animateElements.forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });

    // --- Typing Animation ---
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        const originalText = heroTitle.textContent;
        setTimeout(() => {
            typeWriter(heroTitle, originalText, 80);
        }, 500);
    }

    // --- FAQ Toggle ---
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        if (question) {
        question.addEventListener('click', function() {
            // Close other FAQ items
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // Toggle current item
            item.classList.toggle('active');
        });
        }
    });

    // --- Lazy loading for images ---
    const images = document.querySelectorAll('img[data-src]');
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.onload = () => img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        images.forEach(img => imageObserver.observe(img));
    } else {
        images.forEach(img => {
            img.src = img.dataset.src;
            img.onload = () => img.classList.remove('lazy');
        });
    }
});

// ---- Advanced Professional Features ----

// Advanced Loading System
function initLoadingSystem() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingBar = document.getElementById('loadingBar');
    const loadingText = document.getElementById('loadingText');
    
    if (!loadingOverlay) return;
    
    const loadingSteps = [
        'Initializing...',
        'Loading assets...',
        'Preparing content...',
        'Almost ready...',
        'Welcome to Snow Design!'
    ];
    
    let currentStep = 0;
    const totalSteps = loadingSteps.length;
    
    const updateLoading = () => {
        const progress = (currentStep / totalSteps) * 100;
        loadingBar.style.width = progress + '%';
        loadingText.textContent = loadingSteps[currentStep];
        
        if (currentStep < totalSteps - 1) {
            currentStep++;
            setTimeout(updateLoading, 800);
        } else {
            setTimeout(() => {
                loadingOverlay.classList.add('hidden');
                setTimeout(() => {
                    loadingOverlay.style.display = 'none';
                    initStatisticsCounters();
                }, 500);
            }, 1000);
        }
    };
    
    setTimeout(updateLoading, 500);
}

// Statistics Counters Animation
function initStatisticsCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const animateCounter = (counter) => {
        const target = parseInt(counter.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const updateCounter = () => {
            current += step;
            if (current < target) {
                counter.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                counter.textContent = target;
            }
        };
        
        updateCounter();
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    counters.forEach(counter => observer.observe(counter));
}

// Advanced Search Functionality
function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const query = searchInput.value.trim().toLowerCase();
    
    if (!query) {
        showNotification('Please enter a search term', 'info');
        return;
    }
    
    // Search through page content
    const searchableElements = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p, a, span');
    const results = [];
    
    searchableElements.forEach(element => {
        const text = element.textContent.toLowerCase();
        if (text.includes(query)) {
            const parent = element.closest('section') || element.closest('.card') || element;
            if (parent && !results.includes(parent)) {
                results.push(parent);
            }
        }
    });
    
    if (results.length > 0) {
        // Highlight results
        results.forEach(result => {
            result.style.backgroundColor = 'rgba(6, 182, 212, 0.1)';
            result.style.borderRadius = '8px';
            result.style.padding = '8px';
            result.style.margin = '4px 0';
            
            setTimeout(() => {
                result.style.backgroundColor = '';
                result.style.borderRadius = '';
                result.style.padding = '';
                result.style.margin = '';
            }, 3000);
        });
        
        showNotification(`Found ${results.length} results for "${query}"`, 'success');
        
        // Scroll to first result
        if (results[0]) {
            results[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    } else {
        showNotification(`No results found for "${query}"`, 'info');
    }
}

// Enhanced Search with Enter Key
document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
    }
});

// Advanced Animations
function initAdvancedAnimations() {
    const animatedElements = document.querySelectorAll('.why-card, .news-card, .client-logo');
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-fade-scale');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    
    animatedElements.forEach(el => observer.observe(el));
}

// Enhanced FAQ with Categories
function initEnhancedFAQ() {
    const categories = document.querySelectorAll('.faq-category');
    const faqItems = document.querySelectorAll('.faq-item');
    
    categories.forEach(category => {
        category.addEventListener('click', () => {
            // Remove active class from all categories
            categories.forEach(c => c.classList.remove('active'));
            category.classList.add('active');
            
            // Filter FAQ items based on category
            const categoryType = category.textContent.toLowerCase();
            
            faqItems.forEach(item => {
                if (categoryType === 'all' || item.dataset.category === categoryType) {
                    item.style.display = 'block';
                    item.classList.add('animate-slide-up');
                } else {
                    item.style.display = 'none';
                }
            });
        });
    });
}

// Interactive Rating System
function initRatingSystem() {
    const ratingContainers = document.querySelectorAll('.rating-system');
    
    ratingContainers.forEach(container => {
        const stars = container.querySelectorAll('.rating-star');
        
        stars.forEach((star, index) => {
            star.addEventListener('click', () => {
                // Reset all stars
                stars.forEach((s, i) => {
                    if (i <= index) {
                        s.classList.add('active');
                    } else {
                        s.classList.remove('active');
                    }
                });
                
                // Show rating confirmation
                const rating = index + 1;
                showNotification(`Thank you for your ${rating}-star rating!`, 'success');
            });
        });
    });
}

// Enhanced Mobile Navigation
function initEnhancedMobileNav() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            // Add smooth animation
            if (navMenu.classList.contains('active')) {
                navMenu.style.animation = 'slideDown 0.3s ease forwards';
            } else {
                navMenu.style.animation = 'slideUp 0.3s ease forwards';
            }
        });
        
        // Close menu when clicking on links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Performance Monitoring
function initPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.name === 'LCP') {
                    // LCP metric logged
                }
                if (entry.name === 'FID') {
                    // FID metric logged
                }
                if (entry.name === 'CLS') {
                    // CLS metric logged
                }
            });
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    }
}

// Initialize all advanced features
document.addEventListener('DOMContentLoaded', () => {
// --- Scroll-based effects ---
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;

    // Navbar background change
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        if (scrolled > 100) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    }

    // Parallax effect for hero
    const hero = document.querySelector('.hero');
    if (hero) {
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    }

        // Parallax for stats section
        const statsSection = document.querySelector('.stats-hero');
        if (statsSection) {
            const scrolled = window.pageYOffset;
            const rate = scrolled * -0.3;
            statsSection.style.transform = `translateY(${rate}px)`;
        }
        
        // Animate elements on scroll
        const animatedOnScroll = document.querySelectorAll('.stat-card, .why-card, .news-card');
        animatedOnScroll.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementVisible = 150;
            
            if (elementTop < window.innerHeight - elementVisible) {
                element.classList.add('animate-slide-up');
            }
        });
    });

    // --- Service Worker registration ---
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', function() {
            navigator.serviceWorker.register('/sw.js')
                .then(function() {})
                .catch(function() {});
        });
    }

    // ---- Theming from profile image ----
    (function setupDynamicTheme() {
        function rgbToHsl(r, g, b) {
            r /= 255; g /= 255; b /= 255;
            const max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            if (max === min) {
                h = s = 0;
            } else {
                const d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 1); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h *= 60;
            }
            return { h, s, l };
        }

        function hslToRgb(h, s, l) {
            h /= 360;
            let r, g, b;
            if (s === 0) {
                r = g = b = l;
            } else {
                const hue2rgb = function(p, q, t) {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                };
                const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                const p = 2 * l - q;
                r = hue2rgb(p, q, h + 1/3);
                g = hue2rgb(p, q, h);
                b = hue2rgb(p, q, h - 1/3);
            }
            return { r: Math.round(r * 255), g: Math.round(g * 255), b: Math.round(b * 255) };
        }

        function clamp01(x) { return Math.max(0, Math.min(1, x)); }

        function lightenDarkenHsl(hsl, delta) {
            return { h: hsl.h, s: hsl.s, l: clamp01(hsl.l + delta) };
        }

        function rotateHue(hsl, degrees) {
            let h = (hsl.h + degrees) % 360; if (h < 0) h += 360;
            return { h, s: hsl.s, l: hsl.l };
        }

        function toCssRgb(rgb) {
            return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
        }

        function extractDominantColorFromImage(img) {
            return new Promise((resolve, reject) => {
                if (!img) return reject('No image');
                const process = () => {
                    try {
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');
                        const w = 64, h = 64;
                        canvas.width = w; canvas.height = h;
                        ctx.drawImage(img, 0, 0, w, h);
                        const { data } = ctx.getImageData(0, 0, w, h);
                        let r = 0, g = 0, b = 0, count = 0;
                        for (let i = 0; i < data.length; i += 4 * 8) { // sample every 8px approx
                            const rr = data[i], gg = data[i + 1], bb = data[i + 2], aa = data[i + 3];
                            if (aa < 200) continue;
                            r += rr; g += gg; b += bb; count++;
                        }
                        if (count === 0) return reject('No pixels');
                        resolve({ r: Math.round(r / count), g: Math.round(g / count), b: Math.round(b / count) });
                    } catch (e) { reject(e); }
                };
                if (img.complete && img.naturalWidth > 0) process(); else img.addEventListener('load', process, { once: true });
            });
        }

        function applyThemeFromImage(img) {
            extractDominantColorFromImage(img).then(({ r, g, b }) => {
                const hsl = rgbToHsl(r, g, b);
                // primary
                const primaryRgb = { r, g, b };
                // hero gradient from lightened/darkened primary
                const heroStart = hslToRgb(hsl.h, Math.min(1, hsl.s * 1.05), clamp01(hsl.l + 0.10));
                const heroEnd = hslToRgb(hsl.h, Math.min(1, hsl.s * 1.10), clamp01(hsl.l - 0.10));
                // accent: rotate hue for contrast
                const accentHsl = rotateHue(hsl, 40);
                const accentRgb = hslToRgb(accentHsl.h, Math.min(1, accentHsl.s * 1.1), clamp01(accentHsl.l + 0.05));
                // primary hover
                const hoverHsl = lightenDarkenHsl(hsl, -0.12);
                const hoverRgb = hslToRgb(hoverHsl.h, hoverHsl.s, hoverHsl.l);

                const root = document.documentElement;
                root.style.setProperty('--color-primary', toCssRgb(primaryRgb));
                root.style.setProperty('--color-primary-hover', toCssRgb(hoverRgb));
                root.style.setProperty('--color-accent', toCssRgb(accentRgb));
                root.style.setProperty('--color-hero-start', toCssRgb(heroStart));
                root.style.setProperty('--color-hero-end', toCssRgb(heroEnd));
            }).catch(() => {
                // ignore failures, keep defaults
            });
        }

        document.addEventListener('DOMContentLoaded', () => {
            const profileImg = document.querySelector('.profile-img');
            if (profileImg) {
                applyThemeFromImage(profileImg);
            }
        });
    })();

    // Initialize advanced features
    initLoadingSystem();
    initAdvancedAnimations();
    initEnhancedFAQ();
    initRatingSystem();
    initEnhancedMobileNav();
    initPerformanceMonitoring();
});