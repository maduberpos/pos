(function() {
    'use strict';
    angular.module('app')
        .controller("serverSettingsCtrl", serverSettingsCtrl);

    serverSettingsCtrl.$inject = ["$scope", "LocalStorage", "Socket"];

    function serverSettingsCtrl($scope, LocalStorage, Socket) {

        var vm = this;


    };
})();