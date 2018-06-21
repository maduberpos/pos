(function() {
    'use strict';

    angular
        .module('app')
        .factory('checkin_checkoutService', ['MyHTTP', checkin_checkoutService]);

    /* @ngInject */
    function checkin_checkoutService(MyHTTP) {
        var status = {
            post_checkin_checkout: post_checkin_checkout,
            get_checkin_checkout: get_checkin_checkout,
            history_checkin_checkout: history_checkin_checkout,
            reports_checkin_checkout: reports_checkin_checkout
        };
        return status;

        function post_checkin_checkout(data) {
            return MyHTTP.post1(data, 'post_checkin_checkout');
        }

        function get_checkin_checkout(venue_id, user_id) {
            return MyHTTP.get_by_no_params('get_checkin_checkout?venue_id=' + venue_id + '&user_id=' + user_id);
        }

        function history_checkin_checkout(venue_id, user_id, page) {
            return MyHTTP.get_by_no_params('history_checkin_checkout?venue_id=' + venue_id + '&user_id=' + user_id + '&page=' + page);
        }

        function reports_checkin_checkout(id) {
            return MyHTTP.get_by_no_params('reports_checkin_checkout?checkin_id=' + id);
        }

    }
})();