// Recovery service worker: network-first for navigation, no hard dependency on missing PWA icons.
const CACHE = 'chemicolle-recovery-20261122';
self.addEventListener('install', event => { event.waitUntil(self.skipWaiting()); });
self.addEventListener('activate', event => {
 event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('chemicolle-')).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
 if (event.request.method !== 'GET') return;
 if (event.request.mode === 'navigate') {
  event.respondWith(fetch(event.request, {cache:'no-store'}).catch(() => caches.match(event.request)));
 }
});
