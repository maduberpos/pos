(function() {
    'use strict';

    angular
        .module('app')
        .factory('setting', ['LocalStorage',setting]);

    function setting(LocalStorage) {

        var KEY = 'SETTING';

        function venue_setting(){
            var setting = {};
            var setting =  LocalStorage.get(KEY);

            return setting;
        }

        return {
            venue_setting: venue_setting
        };

    }// currentUser

})();
