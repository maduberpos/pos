(function() {
    'use strict';

    angular.module('app').controller('LoginCtrl', ['$scope', 'Socket', '$location', 'UserServices', 'MenuServices', 'currentUser', 'PosServices', 'LocalStorage', 'loading', 'checkin_checkoutService', '$window', LoginCtrl]);

    function LoginCtrl($scope, Socket, $location, UserServices, MenuServices, currentUser, PosServices, LocalStorage, loading, checkin_checkoutService, $window) {
        var vm = this;
        vm.user = {
            email: '',
            password: ''
        };
        vm.msg = "";
        vm.alert = false;

        vm.login = function() {
            loading.show()
            UserServices.login(vm.user)
                .then(LoginSuccess)
                .catch(LoginError);
        };
        vm.hide_msg = function() {
            vm.alert = false;
        };
        vm.checkindata = {
            check_type: 'checkin',
            user_id: null,
            venue_id: null
        };

        function LoginSuccess(response) {
            if (response.data.status) {
                PosServices.empty();
                currentUser.save(response.data.data);

                Socket.on("connect", function() {
                    var data = response.data.data;
                    $scope.socketId = this.id;
                });
                MenuServices.handshake()
                    .then(function(response) {
                        LocalStorage.add("VENUE", response.data.data.venue);
                        LocalStorage.add("SETTING", response.data.data.setting);
                        LocalStorage.add("MENU_VERSION", response.data.data.venue.menu_version);
                        LocalStorage.add('pin', false);
                        if (MenuServices.update_menu()) {
                            loading.hide();
                            $location.path('app/pos');
                        } else {
                            loading.hide();
                            $location.path('app/pos');
                            $window.location.reload();
                        }
                    })
                    .catch(function(response) {
                        console.log(response);
                        loading.hide();
                    });
                vm.checkindata.user_id = response.data.data.user_id;
                vm.checkindata.venue_id = response.data.data.venue_id;
                checkin_checkoutService.post_checkin_checkout(vm.checkindata).then(function(res) {
                    LocalStorage.add("CHECKIN", true);
                    vm.checkin = false;
                    vm.lastcheckin = res.data.data;
                    LocalStorage.add("LAST_CHECKIN", vm.lastcheckin);
                    LocalStorage.add("CHECKIN_ID", vm.lastcheckin.id);

                    vm.checks_data = {
                        day: '',
                        clock_in: '',
                        clock_out: '',
                        paid_hour: ''
                    };

                    // activate();


                }).catch().finally(function() {
                    // Hide loading spinner whether our call succeeded or failed.

                });

                MenuServices.setTables().then(function(res) {
                    LocalStorage.add("TABLES", res.data.data);
                }).catch().finally(function() {
                    // Hide loading spinner whether our call succeeded or failed.
                });
                MenuServices.get_order_types()
                    .then(function(response) {
                        LocalStorage.add("Order_type", response.data.data);
                    })
                    .catch(function(response) {
                        loading.hide();
                        console.log(response);
                    });
                MenuServices.get_servers()
                    .then(function(response) {
                        LocalStorage.add("servers", response.data.data);
                    })
                    .catch(function(response) {
                        loading.hide();
                        console.log(response);
                    });

                vm.alert = false;
                vm.msg = "";
                vm.user = {
                    email: '',
                    password: ''
                };



            } else {
                loading.hide();
                vm.alert = true;
                vm.msg = "Email or Password is Incorrect";
            }
        }

        function LoginError(errorMessage) {
            vm.alert = true;
            loading.hide();
            vm.msg = "Unable to connect to the server";
        }
    }

})();