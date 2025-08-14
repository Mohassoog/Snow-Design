// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded - initializing all features...');
    
    // Initialize all features
    initReviewSystem();
    initMobileNavigation();
    initLoadingSystem();
    initAdvancedAnimations();
    initEnhancedFAQ();
    initRatingSystem();
    initPerformanceMonitoring();
    initScrollEffects();
    initThemeSystem();
});

// Review form handling (unified contact form)
function initReviewSystem() {
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
    const testimonialsContainer = document.querySelector('#testimonialsContainer');
    if (testimonialsContainer) {
        const reviews = JSON.parse(localStorage.getItem('snowDesignReviews') || '[]');
        
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

// Enhanced Mobile Navigation
function initMobileNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const body = document.body;
    
    console.log('Initializing mobile navigation...'); // Debug log
    console.log('Hamburger found:', !!hamburger); // Debug log
    console.log('Nav menu found:', !!navMenu); // Debug log
    
    if (hamburger && navMenu) {
        console.log('Mobile navigation initialized successfully'); // Debug log
        
        // Simple click handler
        hamburger.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            console.log('Hamburger clicked!'); // Debug log
            
            // Toggle classes
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
            
            console.log('Hamburger active:', hamburger.classList.contains('active')); // Debug log
            console.log('Nav menu active:', navMenu.classList.contains('active')); // Debug log
            
            // Prevent body scroll when menu is open
            if (navMenu.classList.contains('active')) {
                body.style.overflow = 'hidden';
                console.log('Menu opened - body scroll disabled'); // Debug log
            } else {
                body.style.overflow = '';
                console.log('Menu closed - body scroll enabled'); // Debug log
            }
        };
        
        // Close menu when clicking on links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                body.style.overflow = '';
                console.log('Link clicked, menu closed'); // Debug log
            });
        });
        
        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                body.style.overflow = '';
            }
        });
        
        // Close menu on window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
                body.style.overflow = '';
            }
        });
        
        // Touch events for better mobile experience
        hamburger.addEventListener('touchstart', (e) => {
            e.preventDefault();
        });
        
        // Force CSS properties
        navMenu.style.position = 'fixed';
        navMenu.style.top = '70px';
        navMenu.style.left = '-100%';
        navMenu.style.width = '100%';
        navMenu.style.zIndex = '1000';
        navMenu.style.display = 'flex';
        navMenu.style.flexDirection = 'column';
        navMenu.style.backgroundColor = 'white';
        navMenu.style.transition = 'all 0.3s ease';
        
        console.log('Mobile navigation setup complete'); // Debug log
    } else {
        console.error('Hamburger or nav menu not found!'); // Debug log
        console.error('Hamburger element:', hamburger); // Debug log
        console.error('Nav menu element:', navMenu); // Debug log
    }
}

// Loading System
function initLoadingSystem() {
    const loadingOverlay = document.getElementById('loadingOverlay');
    const loadingBar = document.getElementById('loadingBar');
    const loadingText = document.getElementById('loadingText');
    
    if (loadingOverlay && loadingBar && loadingText) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            loadingBar.style.width = progress + '%';
            
            if (progress < 30) {
                loadingText.textContent = 'Loading Snow Design...';
            } else if (progress < 60) {
                loadingText.textContent = 'Preparing your experience...';
            } else if (progress < 90) {
                loadingText.textContent = 'Almost ready...';
            } else {
                loadingText.textContent = 'Welcome to Snow Design!';
            }
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    loadingOverlay.classList.add('hidden');
                    setTimeout(() => {
                        loadingOverlay.style.display = 'none';
                    }, 500);
                }, 500);
            }
        }, 100);
    }
}

// Advanced Animations
function initAdvancedAnimations() {
    // Animate numbers on scroll
    const statNumbers = document.querySelectorAll('.stat-number[data-target]');
    
    const animateNumber = (element) => {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const step = target / (duration / 16);
        let current = 0;
        
        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = Math.floor(current);
        }, 16);
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateNumber(entry.target);
                observer.unobserve(entry.target);
            }
        });
    });
    
    statNumbers.forEach(number => {
        observer.observe(number);
    });
}

// Enhanced FAQ
function initEnhancedFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        if (question && answer) {
            question.addEventListener('click', () => {
                const isOpen = item.classList.contains('active');
                
                // Close all other items
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                });
                
                // Toggle current item
                if (!isOpen) {
                    item.classList.add('active');
                }
            });
        }
    });
}

// Rating System
function initRatingSystem() {
    const ratingStars = document.querySelectorAll('.rating-star');
    
    ratingStars.forEach(star => {
        star.addEventListener('mouseenter', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            highlightStars(rating);
        });
        
        star.addEventListener('mouseleave', function() {
            const selectedRating = document.querySelector('.rating-star.selected');
            if (selectedRating) {
                const rating = parseInt(selectedRating.getAttribute('data-rating'));
                highlightStars(rating);
            } else {
                highlightStars(0);
            }
        });
    });
}

function highlightStars(rating) {
    const stars = document.querySelectorAll('.rating-star');
    stars.forEach((star, index) => {
        if (index < rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
}

// Performance Monitoring
function initPerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
        const observer = new PerformanceObserver((list) => {
            list.getEntries().forEach((entry) => {
                if (entry.name === 'LCP') {
                    console.log('LCP:', entry.startTime);
                }
                if (entry.name === 'FID') {
                    console.log('FID:', entry.processingStart - entry.startTime);
                }
                if (entry.name === 'CLS') {
                    console.log('CLS:', entry.value);
                }
            });
        });
        
        observer.observe({ entryTypes: ['largest-contentful-paint', 'first-input', 'layout-shift'] });
    }
}

// Scroll Effects
function initScrollEffects() {
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
}

// Theme System
function initThemeSystem() {
    (function() {
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
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
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
                        for (let i = 0; i < data.length; i += 4 * 8) {
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
                const primaryRgb = { r, g, b };
                const heroStart = hslToRgb(hsl.h, Math.min(1, hsl.s * 1.05), clamp01(hsl.l + 0.10));
                const heroEnd = hslToRgb(hsl.h, Math.min(1, hsl.s * 1.10), clamp01(hsl.l - 0.10));
                const accentHsl = rotateHue(hsl, 40);
                const accentRgb = hslToRgb(accentHsl.h, Math.min(1, accentHsl.s * 1.1), clamp01(accentHsl.l + 0.05));
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

        const profileImg = document.querySelector('.profile-img');
        if (profileImg) {
            applyThemeFromImage(profileImg);
        }
    })();
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
    notification.className = `notification notification-${type}`;
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

// Service Worker registration
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function() {
                console.log('Service Worker registered successfully');
            })
            .catch(function(error) {
                console.log('Service Worker registration failed:', error);
            });
    });
}

// Load reviews and update stats when page loads
document.addEventListener('DOMContentLoaded', () => {
    loadReviews();
    updateHeroStats();
});