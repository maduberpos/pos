(function() {
    'use strict';

    angular
        .module('app')
        .factory('ReportServices', ['MyHTTP', ReportServices]);

    /* @ngInject */
    function ReportServices(MyHTTP) {
        var posreports = {
            reports: reports,
            get_reports: get_reports,

        };
        return posreports;

        ////////////////

        function reports() {
            return MyHTTP.get_by_one_params('get_reports');
        }

        function get_reports(data) {
            return MyHTTP.post_by_three_params('get_reports',data);
        }

      
    }
})();