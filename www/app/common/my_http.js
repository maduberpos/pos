(function() {
    'use strict';

    angular
        .module('app')
        .factory('MyHTTP', ['$http', 'configuration', 'formEncode', 'LocalStorage', MyHTTP]);

    /* @ngInject */
    function MyHTTP($http, configuration, formEncode, LocalStorage) {
        var service = {
            post: post,
            post1: post1,
            get: get,
            get_by_one_params: get_by_one_params,
            get_by_two_params: get_by_two_params,
            get_by_no_params: get_by_no_params,
            get_by_three_params: get_by_three_params,
            get_by_pos_history: get_by_pos_history,
            post_by_three_params: post_by_three_params
        };
        return service;

        ////////////////

        function post(data, url) {
           
            var VENUE_ID = LocalStorage.get('USER').venue_id;
            if (configuration.env === 'pro') {
                return $http({
                    method: 'POST',
                    url: configuration.PRO_API_URL + url + '?venue_id=' + VENUE_ID,
                    data: formEncode(data),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });

            }

            if (configuration.env === 'dev') {
                return $http({
                    method: 'POST',
                    url: configuration.DEV_API_URL + url + '?venue_id=' + VENUE_ID,
                    data: formEncode(data),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });

            }
        }

        function post1(data, url) {
            if (configuration.env === 'pro') {
                return $http({
                    method: 'POST',
                    url: configuration.PRO_API_URL + url,
                    data: formEncode(data),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
            }

            if (configuration.env === 'dev') {
                return $http({
                    method: 'POST',
                    url: configuration.DEV_API_URL + url,
                    data: formEncode(data),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                });
            }
        }

        function post_by_three_params(url, data) {
            var VENUE_ID = LocalStorage.get('USER').venue_id;
            if (configuration.env === 'pro') {
                return $http({
                    method: 'GET',
                    url: configuration.PRO_API_URL + url + '?venue_id=' + VENUE_ID + '&type=' + data.type + '&day=' + data.day + '&date_from=' + data.date_from + '&date_to=' + data.date_to,
                    data: formEncode(data),
                });
            }

            if (configuration.env === 'dev') {
                return $http({
                    method: 'GET',
                    url: configuration.DEV_API_URL + url + '?venue_id=' + VENUE_ID + '&type=' + data.type + '&day=' + data.day + '&date_from=' + data.date_from + '&date_to=' + data.date_to,
                    data: formEncode(data),
                });
            }
        }


        function get(url) {
            var VENUE_ID = LocalStorage.get('USER').venue_id;
            if (configuration.env === 'pro') {
                return $http({
                    method: 'GET',
                    url: configuration.PRO_API_URL + url + '?venue_id=' + VENUE_ID,

                });
            }

            if (configuration.env === 'dev') {
                return $http({
                    method: 'GET',
                    url: configuration.DEV_API_URL + url + '?venue_id=' + VENUE_ID,

                });
            }
        }

        function get_by_one_params(url) {
            var VENUE_ID = LocalStorage.get('USER').venue_id;
            if (configuration.env === 'pro') {
                return $http({
                    method: 'GET',
                    url: configuration.PRO_API_URL + url + '?venue_id=' + VENUE_ID
                });
            }

            if (configuration.env === 'dev') {
                return $http({
                    method: 'GET',
                    url: configuration.DEV_API_URL + url + '?venue_id=' + VENUE_ID
                });
            }
        }

        function get_by_no_params(url) {
            if (configuration.env === 'pro') {
                return $http({
                    method: 'GET',
                    url: configuration.PRO_API_URL + url
                });
            }

            if (configuration.env === 'dev') {
                return $http({
                    method: 'GET',
                    url: configuration.DEV_API_URL + url
                });
            }
        }

        function get_by_two_params(url, data, mode) {
            var VENUE_ID = LocalStorage.get('USER').venue_id;
            if (configuration.env === 'pro') {
                return $http({
                    method: 'GET',
                    url: configuration.PRO_API_URL + url + '?venue_id=' + VENUE_ID + '&' + mode + '=' + data
                });
            }

            if (configuration.env === 'dev') {
                return $http({
                    method: 'GET',
                    url: configuration.DEV_API_URL + url + '?venue_id=' + VENUE_ID + '&' + mode + '=' + data
                });
            }
        }

        function get_by_three_params(url, platform, order_type, data, mode) {
            var VENUE_ID = LocalStorage.get('USER').venue_id;
            if (configuration.env === 'pro') {
                return $http({
                    method: 'GET',
                    url: configuration.PRO_API_URL + url + '?venue_id=' + VENUE_ID + '&platform=' + platform + '&order_type=' + order_type + '&' + mode + '=' + data
                });
            }

            if (configuration.env === 'dev') {
                return $http({
                    method: 'GET',
                    url: configuration.DEV_API_URL + url + '?venue_id=' + VENUE_ID + '&platform=' + platform + '&order_type=' + order_type + '&' + mode + '=' + data
                });
            }
        }

        function get_by_pos_history(url, order_type, data, mode) {
            var VENUE_ID = LocalStorage.get('USER').venue_id;
            if (configuration.env === 'pro') {
                return $http({
                    method: 'GET',
                    url: configuration.PRO_API_URL + url + '?venue_id=' + VENUE_ID + '&order_type=' + order_type + '&' + mode + '=' + data
                });
            }

            if (configuration.env === 'dev') {
                return $http({
                    method: 'GET',
                    url: configuration.DEV_API_URL + url + '?venue_id=' + VENUE_ID + '&order_type=' + order_type + '&' + mode + '=' + data
                });
            }
        }
    }
})();