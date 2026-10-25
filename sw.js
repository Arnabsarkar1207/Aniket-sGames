// Bump VERSION whenever you change files, so phones pick up the update.
const VERSION = 'v2';
const CACHE = 'toddler-games-' + VERSION;
const SOUNDS = [
  'cow', 'dog', 'cat', 'duck', 'sheep', 'pig', 'horse', 'lion', 'elephant', 'frog',
  'eng_car2', 'eng_cobra', 'eng_aston', 'eng_diesel', 'horn1', 'horn2', 'horn3', 'truckhorn'
].map(n => 'sounds/' + n + '.mp3');
const CORE = [
  './', 'index.html', 'cars.html', 'animals.html', 'shared.css', 'shared.js',
  'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/apple-touch-icon.png',
  ...SOUNDS
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('toddler-games-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Safari asks for audio with Range requests and refuses a plain 200 answer,
// so serve the requested slice of the cached file as a 206.
async function rangeResponse(req, res) {
  const m = /bytes=(\d*)-(\d*)/.exec(req.headers.get('range') || '');
  if (!m) return res;
  const buf = await res.arrayBuffer();
  const start = m[1] ? parseInt(m[1], 10) : 0;
  const end = m[2] ? Math.min(parseInt(m[2], 10), buf.byteLength - 1) : buf.byteLength - 1;
  return new Response(buf.slice(start, end + 1), {
    status: 206,
    statusText: 'Partial Content',
    headers: {
      'Content-Type': res.headers.get('Content-Type') || 'audio/mpeg',
      'Content-Range': `bytes ${start}-${end}/${buf.byteLength}`,
      'Content-Length': String(end - start + 1)
    }
  });
}

// Show the cached copy instantly (works offline), refresh it in the background.
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.open(CACHE).then(async cache => {
      const hit = await cache.match(req, { ignoreSearch: true });
      if (req.headers.has('range')) {
        if (hit) return rangeResponse(req, hit);
        return fetch(req);
      }
      const net = fetch(req).then(res => {
        if (res && (res.ok || res.type === 'opaque')) cache.put(req, res.clone());
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
