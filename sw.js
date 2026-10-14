// Offline cache so the installed card opens instantly, even without signal.
const CACHE = 'card-v1';
const ASSETS = [
    './',
    'index.html',
    'avatar.jpg',
    'qr.svg',
    'jim-steven-espelico.vcf',
    'manifest.webmanifest',
    'icon-192.png',
    'icon-512.png',
];

self.addEventListener('install', e => {
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
            .then(() => self.clients.claim())
    );
});

// Network first so edits show up right away; fall back to the cache offline.
self.addEventListener('fetch', e => {
    if (e.request.method !== 'GET') return;
    e.respondWith(
        fetch(e.request)
            .then(res => {
                if (res.ok || res.type === 'opaque') {
                    const copy = res.clone();
                    caches.open(CACHE).then(c => c.put(e.request, copy));
                }
                return res;
            })
            .catch(() => caches.match(e.request, { ignoreSearch: true }))
    );
});
