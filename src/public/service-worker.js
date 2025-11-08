const STATIC_CACHE = 'story-app-static-v2';
const DYNAMIC_CACHE = 'story-app-dynamic-v1';
const STATIC_FILES = [
  '/',
  '/favicon.png',
  '/manifest.json',
  '/images/logo.png',
];

self.addEventListener('install', (event) => {
  console.log('🛠️ Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_FILES);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activated');
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  if (requestUrl.origin.includes('chrome-extension') || requestUrl.pathname.includes('analytics')) return;

  if (requestUrl.pathname.startsWith('/v1/stories')) {
    event.respondWith(
      caches.open(DYNAMIC_CACHE).then((cache) =>
        fetch(event.request)
          .then((response) => {
            cache.put(event.request, response.clone());
            return response;
          })
          .catch(() => caches.match(event.request))
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});


self.addEventListener('push', (event) => {
  let data = {
    title: 'Notifikasi Dicoding',
    message: 'Ini adalah notifikasi basic dari service worker.',
    url: '/',
    icon: '/images/logo.png'
  };


  if (event.data) {
    try {
      data = event.data.json();
    } catch (err) {
      console.error('❌ Gagal parsing data push:', err);
    }
  }

  const options = {
    body: data.message,
    icon: data.icon,
    badge: '/favicon.png',
    data: {
      url: data.url 
    }
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});


self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
