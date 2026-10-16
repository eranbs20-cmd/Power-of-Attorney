const CACHE = 'poa-v27';
const CORE = ['./poa.html','./base.pdf','./manifest.json','./icon-192.png','./icon-512.png','./Heebo-Bold.ttf','./stamp.png',
  './lib/pdf-lib.min.js','./lib/fontkit.umd.min.js','./lib/pdf.min.js','./lib/pdf.worker.min.js'];
const CDN = [
  'https://fonts.googleapis.com/css2?family=David+Libre:wght@400;500;700&display=swap',
];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>{c.addAll(CORE);CDN.forEach(u=>c.add(u).catch(()=>{}));}));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(caches.match(e.request,{ignoreSearch:e.request.mode==='navigate'}).then(c=>{if(c)return c;return fetch(e.request).then(r=>{if(r&&r.status===200&&r.type!=='opaque')caches.open(CACHE).then(ca=>ca.put(e.request,r.clone()));return r;}).catch(()=>c);}));});
