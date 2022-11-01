// (A) FILES TO CACHE
const cName = "JSLibMgr",
cFiles = [
  "favicon.png",
  "icon-512.png",
  "maticon.woff2",
  "1-js-lib.html",
  "2-js-lib.js",
  "2-js-lib.css"
];

// (B) CREATE/INSTALL CACHE
self.addEventListener("install", (evt) => {
  self.skipWaiting();
  evt.waitUntil(
    caches.open(cName)
    .then((cache) => { return cache.addAll(cFiles); })
    .catch((err) => { console.error(err) })
  );
});

// (C) LOAD FROM CACHE, FALLBACK TO NETWORK IF NOT FOUND
self.addEventListener("fetch", (evt) => {
  evt.respondWith(
    caches.match(evt.request)
    .then((res) => { return res || fetch(evt.request); })
  );
});
