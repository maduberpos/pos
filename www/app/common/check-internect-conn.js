(function() {
    'use strict';

    angular
        .module('app')
        .factory('checkInternet', checkInternet);

    function checkInternet() {

        function check_conn() {
            if (window.navigator.onLine) {
                return true;
            } else {
                return false;
            }
        }

        return {
            check_conn: check_conn
        };
    }
})();