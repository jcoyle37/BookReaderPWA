var CACHE_PREFIX = 'bookreader-pwa-cache';
var CACHE_VERSION = 2;
var CACHE_NAME = CACHE_PREFIX + '-v' + CACHE_VERSION;

var urlsToCache = [
  'brview.html',
  'index.html',
  'js/general.js',
  'BookReader/jquery-1.10.1.js',
  'BookReader/jquery-ui-1.12.0.min.js',
  'BookReader/jquery.browser.min.js',
  'BookReader/dragscrollable-br.js',
  'BookReader/jquery.colorbox-min.js',
  'BookReader/jquery.bt.min.js',
  'BookReader/soundmanager/script/soundmanager2-jsmin.js',
  'BookReader/mmenu/dist/js/jquery.mmenu.min.js',
  'BookReader/mmenu/dist/addons/navbars/jquery.mmenu.navbars.min.js',
  'BookReader/mmenu/dist/css/jquery.mmenu.css',
  'BookReader/mmenu/dist/addons/navbars/jquery.mmenu.navbars.css',
  'BookReader/BookReader.js',
  'BookReader/BookReader.css',
  'BookReader/plugins/plugin.url.js',
  'BookReader/plugins/plugin.resume.js',
  'BookReader/plugins/plugin.chapters.js',
  'BookReader/plugins/plugin.tts.js',
  'BookReader/plugins/plugin.search.js'
];

self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // IMPORTANT: Clone the request. A request is a stream and
        // can only be consumed once. Since we are consuming this
        // once by cache and once by the browser for fetch, we need
        // to clone the response.
        var fetchRequest = event.request.clone();

        return fetch(fetchRequest).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        );
      })
    );
});

//when a new service worker becomes active, delete all other caches created
//by past service workers
self.addEventListener("activate", function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (CACHE_NAME !== cacheName &&  cacheName.startsWith(CACHE_PREFIX)) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});