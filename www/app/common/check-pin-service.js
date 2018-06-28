(function() {
    'use strict';

    angular
        .module('app')
        .factory('CHECKPIN', ['$ionicPopup', CHECKPIN]);

    /* @ngInject */
    function CHECKPIN($ionicPopup) {
        var service = {
            prompt: prompt
        };
        return service;
        var vm = this;


        function prompt() {
            // var myPopup;
            var data = {
                wifi: '1234'
            };
            var myPopup = $ionicPopup.show({
                template: '<input type="password" ng-model="data.wifi">',
                title: 'Enter Wi-Fi Password',
                subTitle: 'Please use normal things',
                // scope: $scope,
                buttons: [
                    { text: 'Cancel' },
                    {
                        text: '<b>Save</b>',
                        type: 'button-positive',
                        onTap: function(e) {
                            // if (!vm.data.wifi) {
                            //     //don't allow the user to close unless he enters wifi password
                            //     e.preventDefault();
                            // } else {
                            return data.wifi;
                            // }
                        }
                    }
                ]
            });
        }
    }
})();