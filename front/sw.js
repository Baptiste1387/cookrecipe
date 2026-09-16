const CACHE_NAME = 'cookmate-shell-v1';
const SHELL_URLS = [
    './',
    './index.html',
    './js/app.js',
    './js/config.js',
    './js/store.js',
    './js/utils.js'
];

self.addEventListener('install', event => {
    event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(SHELL_URLS)));
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => Promise.all(
            keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
        ))
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    const requestUrl = new URL(event.request.url);
    if (requestUrl.pathname.startsWith('/api/') || requestUrl.pathname.startsWith('/uploads/')) return;

    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (event.request.method === 'GET' && response.ok) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                }
                return response;
            })
            .catch(() => caches.match(event.request).then(response => response || caches.match('./index.html')))
    );
});