const CACHE = 'poa-v5';
const CORE = ['./poa.html','./manifest.json','./icon-192.png','./icon-512.png'];
const CDN = [
  'https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@400;700&display=swap',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>{c.addAll(CORE);CDN.forEach(u=>c.add(u).catch(()=>{}));}));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request).then(c=>{if(c)return c;return fetch(e.request).then(r=>{if(r&&r.status===200&&r.type!=='opaque')caches.open(CACHE).then(ca=>ca.put(e.request,r.clone()));return r;}).catch(()=>c);}));});
