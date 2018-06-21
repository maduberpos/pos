angular.module('app')
    .factory('OpenUrlService', ['$log', '$location', '$rootScope', '$ionicHistory', function ($log, $location, $rootScope, $ionicHistory) {

        var openUrl = function (url) {

            $log.debug('Handling open URL ' + url);

            // Stop it from caching the first view as one to return when the app opens
            $ionicHistory.nextViewOptions({
                historyRoot: true,
                disableBack: true,
                disableAnimation: true
            });

            if (url) {
                window.location.hash = url.substr(5);
                $rootScope.$broadcast('handleopenurl', url);

                window.cordova.removeDocumentEventHandler('handleopenurl');
                window.cordova.addStickyDocumentEventHandler('handleopenurl');
                document.removeEventListener('handleopenurl', handleOpenUrl);
            }
        };

        var handleOpenUrl = function (e) {
            openUrl(e.url);
        };

        var onResume = function () {
            document.addEventListener('handleopenurl', handleOpenUrl, false);
        };

        return {
            handleOpenUrl: handleOpenUrl,
            onResume: onResume
        };

    }]);

