(function() {
    'use strict';

    angular
        .module('app')
        .factory('SettingServices', ['MyHTTP', SettingServices]);

    /* @ngInject */
    function SettingServices(MyHTTP) {
        var settings = {

        };
        return settings;
        ////////////////
    }
})();