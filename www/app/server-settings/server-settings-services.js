(function() {
    'use strict';

    angular
        .module('app')
        .factory('ServerSettingServices', ['MyHTTP', ServerSettingServices]);

    /* @ngInject */
    function ServerSettingServices(MyHTTP) {
        var settings = {

        };
        return settings;
        ////////////////
    }
})();