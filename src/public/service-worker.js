const CACHE_NAME = 'story-app-cache-v3';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/app.bundle.js',
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// Install SW & cache static assets
self.addEventListener('install', (event) => {
  console.log('🟢 [ServiceWorker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate SW & clean old caches
self.addEventListener('activate', (event) => {
  console.log('🟣 [ServiceWorker] Activated');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => key !== CACHE_NAME && caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch handler: offline-first
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return (
        cachedResponse ||
        fetch(event.request)
          .then((networkResponse) => {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          })
          .catch(() => {
            // fallback ke index.html untuk SPA
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          })
      );
    })
  );
});

// Push Notification
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'Cerita Baru!';
  const options = {
    body: data.body || 'Ada cerita baru yang menunggumu!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      if (clientList.length > 0) clientList[0].focus();
      else clients.openWindow('/');
    })
  );
});

// Mock push lokal (tanpa API)
self.addEventListener('message', (event) => {
  if (event.data?.type === 'push-mock') {
    const { title, body } = event.data.data;
    self.registration.showNotification(title, {
      body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
    });
    console.log('🔔 [ServiceWorker] Mock push received');
  }
});
