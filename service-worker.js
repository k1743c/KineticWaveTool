const CACHE_NAME = 'kinetic-wave-v2'; // Змінено версію кешу
const urlsToCache = [
  '/',
  'index.html',
  'manifest.json',
  'service-worker.js',
  'icon.png'
];

// Встановлення сервіс-воркера та кешування файлів
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Caching files');
        return cache.addAll(urlsToCache);
      })
  );
  // Примусово активувати новий сервіс-воркер
  self.skipWaiting();
});

// Очищення старих кешів
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Примусово взяти контроль над сторінкою
  self.clients.claim();
});

// Обробка запитів (використовувати кеш, якщо офлайн)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Якщо є відповідь у кеші, повертаємо її
        if (response) {
          return response;
        }
        // Інакше робимо запит до мережі
        return fetch(event.request).then((networkResponse) => {
          // Кешуємо нові ресурси
          if (networkResponse && networkResponse.status === 200) {
            return caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse.clone());
              return networkResponse;
            });
          }
          return networkResponse;
        });
      }).catch(() => {
        // Якщо немає ні кешу, ні мережі, можна показати резервну сторінку (опціонально)
        return caches.match('index.html');
      })
  );
});