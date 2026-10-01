const CACHE = 'chemicolle-v279-image-auto-update-1';
const APP_CACHE_PREFIX = 'chemicolle-';
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(FILES))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key.startsWith(APP_CACHE_PREFIX) && key !== CACHE)
          .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const request = event.request;
  const url = new URL(request.url);
  const isNavigation = request.mode === 'navigate';
  const isIndex = url.origin === self.location.origin &&
    (url.pathname.endsWith('/') || url.pathname.endsWith('/index.html'));
  const isCharacterImage = url.origin === self.location.origin &&
    (url.pathname.includes('/character_icons/') ||
     url.pathname.includes('/character_select_icons/'));

  // HTMLとキャラクター画像はネットワーク優先。同名画像の差し替えも最新版を取得する。
  if (isNavigation || isIndex || isCharacterImage) {
    event.respondWith(
      fetch(request, { cache: 'no-store' })
        .then(response => {
          if (response && response.ok) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => {
              if (isNavigation || isIndex) cache.put('./index.html', copy);
              else cache.put(request, copy);
            });
          }
          return response;
        })
        .catch(() => {
          if (isNavigation || isIndex) return caches.match('./index.html');
          return caches.match(request);
        })
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response && response.ok && url.origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy));
        }
        return response;
      });
    })
  );
});
