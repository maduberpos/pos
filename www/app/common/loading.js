(function() {
    'use strict';

    angular
        .module('app')
        .factory('loading', ['$ionicLoading',loading]);

    /* @ngInject */
    function loading($ionicLoading) {
        var service = {
            show: show,
            hide: hide
        };
        return service;

        ////////////////

        function show() {
         	$ionicLoading.show({
			      template: '<img id="loader" src="img/app/loader.gif" />'
			    });
        }

        function hide() {
        	 $ionicLoading.hide();
        }
    }
})();