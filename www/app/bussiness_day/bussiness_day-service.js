(function() {
    'use strict';

    angular
        .module('app')
        .factory('bussinessdayService', ['MyHTTP', bussinessdayService]);

    /* @ngInject */
    function bussinessdayService(MyHTTP) {
        var services = {
            business_day: business_day,
            reports_business_day: reports_business_day,
            history_business_day: history_business_day,
            check_valid_business_day: check_valid_business_day
        };
        return services;

        function business_day(data) {
            return MyHTTP.post(data,'business_day');
           
        }

        function reports_business_day(business_day_id) {
            return MyHTTP.get('reports_business_day?business_day_id=' + business_day_id);
        }

        function history_business_day(data, page) {
            return MyHTTP.get('history_business_day?user_id=' + data.user_id + '&venue_id=' + data.venue_id + '&page=' + page);
        }

        function check_valid_business_day(venue_id) {
            return MyHTTP.get('check_valid_business_day?venue_id=' + venue_id);
        }
    }
})();