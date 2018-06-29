(function() {
    'use strict';

    angular.module('app').controller('LoginCtrl', ['$scope', 'Socket', '$location', 'UserServices', 'MenuServices', 'currentUser', 'PosServices', 'LocalStorage', 'loading', 'checkin_checkoutService', 'bussinessdayService', 'cashin_outService', '$window', LoginCtrl]);

    function LoginCtrl($scope, Socket, $location, UserServices, MenuServices, currentUser, PosServices, LocalStorage, loading, checkin_checkoutService, bussinessdayService, cashin_outService, $window) {
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
                            // $location.path('app/pos');
                        } else {
                            loading.hide();
                            // $window.location.reload();
                        }
                    })
                    .catch(function(response) {
                        console.log(response);
                        loading.hide();
                    });
                var data = {
                    user_id: response.data.data.user_id,
                    venue_id: response.data.data.venue_id
                }
                vm.checkindata.user_id = response.data.data.user_id;
                vm.checkindata.venue_id = response.data.data.venue_id;
                bussinessdayService.history_business_day(data, 0).then(function(res) {
                    vm.history = res.data.data;
                    var today = moment().format("MM/DD/YYYY");
                    var start_day = moment(vm.history[0].day_start).format("MM/DD/YYYY");
                    var start_close = moment(vm.history[0].day_close).format("MM/DD/YYYY");

                    if (vm.history[0].day_close === '') {
                        LocalStorage.add('ISDAYSTARTED', true);
                        LocalStorage.add("DAYSTART", vm.history[0]);
                        LocalStorage.add("DAYSTART_ID", vm.history[0].id);
                        vm.isDayStarted = LocalStorage.get('ISDAYSTARTED');
                        vm.dayStartedDateTime = LocalStorage.get('DAYSTART').day_start;
                        vm.hide_day = false;
                    } else if (today === start_close && start_close === start_day) {
                        LocalStorage.add("DAYSTART", vm.history[0]);
                        vm.dayStartedDateTime = vm.history[0].day_start;
                        LocalStorage.add("DAYCLOSE", vm.history[0]);
                        vm.dayCloseDateTime = vm.history[0].day_close;
                        vm.hide_day = true;
                    } else {
                        vm.hide_day = false;
                    }
                    // loading.hide();
                    $location.path('app/pos');
                    // today = moment(vm.history[0].day_close).format("MM/DD/YYYY");


                });
                cashin_outService.history_cashin_cashout(data.venue_id, data.user_id, 0).then(function(res) {
                        vm.cashin_out_history = res.data.data;
                        if (vm.cashin_out_history.length > 0) {
                            angular.forEach(vm.cashin_out_history, function(cashin) {

                                if (cashin.cashout === "") {
                                    console.log(cashin);
                                    console.log(cashin);
                                    LocalStorage.add('isCashIn', true);
                                    LocalStorage.add('cashin_id', cashin.id);
                                    vm.cashin_amount = parseInt(cashin.cashin_amount);
                                    vm.cashin_date = cashin.cashin;
                                    vm.cashin_reason = cashin.cashin_reason;
                                    vm.cashout_data.cashin_id = LocalStorage.get('cashin_id');
                                    vm.cashin = false;
                                    vm.cashout = true;
                                }
                            })
                        } else {
                            LocalStorage.add('isCashIn', false);
                            LocalStorage.add('cashin_id', 0);
                        }
                        loading.hide()
                    })
                    .catch(function(response) {
                        console.log(response);
                        loading.hide();
                    });
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