(function() {

    angular.module('app')
        .constant('configuration', {
            BUILD: 'desktop-win',
            PRO_API_URL: 'https://www.maduber.pk/admin-panel/api/pos/',
            DEV_API_URL: 'http://maduber-pk-new-maduber.c9users.io/maduberpkadminnew/api/pos/',
            Secret_Key: "bBSUGJGKL4XXQgFc9pZ8DOKYRZke54dSqA2cL2TCu1lDx7obzsNBGpHQ6Psm8sVeO6nwsdqHZpjxT0Jn",
            Private_Key: "u1lDx7obzsNBGpHQ6Psm8sVeO6nwsdqHZpjxT0Jn",
            env: 'pro',
        });
}());
