const CACHE_NAME = 'clicker-v2';
const urlsToCache = [
    './',
    './index.html',
    './styles.css',
    './game.js',
    './manifest.json'
];

// Установка Service Worker
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
    self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Перехват запросов
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') {
        return;
    }

    // Пропускаем запросы с неподдерживаемыми схемами
    const url = new URL(event.request.url);
    if (url.protocol !== 'http:' && url.protocol !== 'https:' && url.protocol !== 'file:') {
        return;
    }

    event.respondWith(
        caches.match(event.request).then(response => {
            if (response) {
                return response;
            }

            return fetch(event.request).then(response => {
                // Не кешируем запросы если они не успешны
                if (!response || response.status !== 200 || response.type === 'error') {
                    return response;
                }

                // Кешируем успешные ответы
                try {
                    const responseToCache = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, responseToCache);
                    });
                } catch (e) {
                    console.log('Cache error:', e);
                }

                return response;
            }).catch(() => {
                // Если нет интернета, возвращаем кешированную версию
                return caches.match(event.request);
            });
        })
    );
});
