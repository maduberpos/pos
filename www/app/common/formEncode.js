
(function() {
    'use strict';

    angular
        .module('app')
        .factory('formEncode', formEncode);

    function formEncode() {
          return function(data) {
            var pairs = [];
            for (var name in data) {
                pairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
            }
            return pairs.join('&').replace(/%20/g, '+');
        };
    }
})();