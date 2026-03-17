const CACHE_NAME = 'chemicole-cache-v10';
const ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-180.png',
  './favicon-v2.png',
  './bgm.mp3',
  './se_menu_select.mp3',
  './se_menu_back.mp3',
  './se_atom_select.mp3',
  './se_atom_deselect.mp3',
  './se_action_button.mp3',
  './se_compound_success.mp3',
  './se_compound_nomatch.mp3',
  './se_draw.mp3',
  './se_skill_activate.mp3',
  './se_gameover.mp3',
  './se_gameclear.mp3'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
