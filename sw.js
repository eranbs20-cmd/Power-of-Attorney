const CACHE = 'poa-v29';
const CORE = ['./poa.html','./index.html','./base.pdf','./manifest.json','./icon-192.png','./icon-512.png','./Heebo-Bold.ttf','./stamp.png',
  './lib/pdf-lib.min.js','./lib/fontkit.umd.min.js','./lib/pdf.min.js','./lib/pdf.worker.min.js'];
const CDN = ['https://fonts.googleapis.com/css2?family=David+Libre:wght@400;500;700&display=swap'];
// cache:'reload' bypasses the browser HTTP cache so an update never re-caches stale files
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>Promise.all([
  c.addAll(CORE.map(u=>new Request(u,{cache:'reload'}))),
  ...CDN.map(u=>c.add(u).catch(()=>{}))])));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  const isPage=e.request.mode==='navigate'||/\.(html|js)$/.test(new URL(e.request.url).pathname)&&new URL(e.request.url).origin===location.origin&&!/\/lib\//.test(e.request.url);
  if(isPage){ // network-first for app code: always the latest version, cache only offline
    e.respondWith(fetch(e.request,{cache:'no-cache'}).then(r=>{if(r&&r.ok){const cl=r.clone();caches.open(CACHE).then(ca=>ca.put(e.request,cl));}return r;})
      .catch(()=>caches.match(e.request,{ignoreSearch:true})));
    return;
  }
  e.respondWith(caches.match(e.request).then(c=>c||fetch(e.request).then(r=>{if(r&&r.status===200&&r.type!=='opaque'){const cl=r.clone();caches.open(CACHE).then(ca=>ca.put(e.request,cl));}return r;})));
});
