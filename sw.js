const CACHE_NAME = 'snow-design-v5';
const urlsToCache = [
    '/',
    'index.html',
    'about.html',
    'services.html',
    'company.html',
    'why-us.html',
    'contact.html',
    'styles.css',
    'script.js',
    '404.html',
    'manifest.json',
    'images/profile-photo.jpg',
    'images/profile-photo.jpg',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
    'images/project-1.jpg',
    'images/project-2.jpg',
    'images/project-3.jpg',
    'images/project-4.jpg',
    'images/project-5.jpg',
    'images/project-6.jpg'
];

// Install event
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.match(event.request).then(function(response) {
                const fetchPromise = fetch(event.request).then(function(networkResponse) {
                    if (networkResponse && networkResponse.status === 200 && event.request.url.startsWith(self.location.origin)) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(error => {
                    // Silent fail for better performance
                });
                return response || fetchPromise;
            });
        })
    );
});

// Activate event
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
}); 