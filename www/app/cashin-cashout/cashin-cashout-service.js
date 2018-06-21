(function() {
    'use strict';

    angular
        .module('app')
        .factory('cashin_outService', ['MyHTTP', cashin_outService]);

    /* @ngInject */
    function cashin_outService(MyHTTP) {
        var status = {
            post_cashin_cashout: post_cashin_cashout,
            history_cashin_cashout: history_cashin_cashout,
            reports_cashin_cashout: reports_cashin_cashout,
            cashout_amount: cashout_amount,
        };
        return status;

        function post_cashin_cashout(data) {
            return MyHTTP.post1(data, 'post_cashin_cashout');
        }

        function history_cashin_cashout(venue_id, user_id, page) {
            return MyHTTP.get_by_no_params('history_cashin_cashout?venue_id=' + venue_id + '&user_id=' + user_id + '&page=' + page);
        }

        function reports_cashin_cashout(cashin_id) {
            return MyHTTP.get_by_no_params('reports_cashin_cashout?cashin_id=' + cashin_id);
        }

        function cashout_amount(cashin_id) {
            return MyHTTP.get_by_no_params('cashout_amount?cashin_id=' + cashin_id);
        }
    }
})();