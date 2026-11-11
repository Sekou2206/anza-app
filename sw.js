const CACHE = 'anza-v6';
const FILES = ['./', 'index.html', 'app.css', 'config.js', 'supabase.js', 'logo.js', 'data.js', 'content.js', 'core.js', 'store.js', 'ai.js', 'nia-rules.js', 'views.js', 'manifest.webmanifest', 'favicon.png', 'icon-192.png', 'icon-512.png', 'inter-400.woff2', 'inter-500.woff2', 'inter-600.woff2', 'inter-700.woff2', 'inter-800.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(e.request, c)); return r; }).catch(() => caches.match(e.request).then(r => r || caches.match('index.html'))));
});
