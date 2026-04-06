// ProduTrack Service Worker
// Estratégia: Network First (dados sempre frescos) com fallback para cache
const CACHE_NAME = 'produtrack-v1';
const OFFLINE_URL = '/';

const PRECACHE_URLS = [
  '/',
  '/manifest.json',
  '/icon-192x192.png',
  '/icon-512x512.png',
];

// Instalar e pré-cachear recursos estáticos essenciais
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
  );
  self.skipWaiting();
});

// Limpar caches antigos ao ativar
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Fetch: Network First com fallback para cache
self.addEventListener('fetch', (event) => {
  // Só interceptar requisições GET do mesmo origin
  if (
    event.request.method !== 'GET' ||
    !event.request.url.startsWith(self.location.origin)
  ) {
    return;
  }

  // Para navegação (páginas HTML), usar Network First
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() =>
        caches.match(OFFLINE_URL)
      )
    );
    return;
  }

  // Para outros recursos: Stale-While-Revalidate
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(event.request);
      const fetchPromise = fetch(event.request)
        .then((response) => {
          if (response.ok) {
            cache.put(event.request, response.clone());
          }
          return response;
        })
        .catch(() => null);

      return cached || fetchPromise;
    })
  );
});
