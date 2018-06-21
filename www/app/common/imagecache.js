angular.module('app', [
        'ImgCache'
    ])
    .config(['ImgCacheProvider', function(ImgCacheProvider) {
        // set single options
        ImgCacheProvider.setOption('debug', true);
        ImgCacheProvider.setOption('usePersistentCache', true);

        // or more options at once
        ImgCacheProvider.setOptions({
            debug: true,
            usePersistentCache: true
        });

        // ImgCache library is initialized automatically,
        // but set this option if you are using platform like Ionic -
        // in this case we need init imgcache.js manually after device is ready
        ImgCacheProvider.manualInit = true;

        // If you want to, you can disable the cache.
        // This might be useful to disable it to get rid of CORS issues when
        // developing cordova Applications using a browser.
        ImgCacheProvider.disableCache(true);

    }]);