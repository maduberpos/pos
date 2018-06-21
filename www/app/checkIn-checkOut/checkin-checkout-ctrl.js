(function() {
    'use strict';
    angular.module('app')
        .controller("checkin_checkoutCtrl", checkin_checkoutCtrl);

    checkin_checkoutCtrl.$inject = ["$scope", "PosServices", 'PrinterServices', '$timeout', 'setting', 'loading', 'checkin_checkoutService', 'LocalStorage', '$interval'];

    function checkin_checkoutCtrl($scope, PosServices, PrinterServices, $timeout, setting, loading, checkin_checkoutService, LocalStorage, $interval) {
        var vm = this;
        vm.venue_detail = setting.venue_setting();
        vm.user = [];
        vm.today_checkin = {};
        vm.checkin = true;
        vm.checkindata = {
            check_type: 'checkin',
            user_id: null,
            venue_id: null
        };
        vm.noMoreItemsAvailable = true;
        vm.page = 0;
        vm.checkoutdata = {
            checkin_id: null,
            check_type: 'checkout',
            user_id: null,
            venue_id: null
        };
        vm.date = '';
        vm.date = new Date();
        vm.hour = 0;
        vm.min = 0;
        vm.sec = 0;
        vm.checked_in_time = '0' + vm.hour + ':0' + vm.min + ':0' + vm.sec;
        vm.checkin_Checkout_history = [];
        vm.checks_data = {
            id: null,
            day: '',
            checkin_date: '',
            checkout_date: '',
            clock_in: '',
            clock_out: '',
            paid_hour: ''
        };
        vm.lastcheckin = [];

        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            if (toState.name == 'app.checkincheckout') {
                activate();
            }

        });

        function activate() {
            vm.noMoreItemsAvailable = true;
            if (LocalStorage.get("CHECKIN")) {
                vm.checkin = false;
                if (LocalStorage.get("LAST_CHECKIN")) {
                    checksintime();
                }
            }
            vm.page = 0;
            vm.user = LocalStorage.get('USER');
            loading.show();
            vm.checkindata.user_id = vm.user.user_id;
            vm.checkindata.venue_id = vm.user.venue_id;
            vm.checkoutdata.user_id = vm.user.user_id;
            vm.checkoutdata.venue_id = vm.user.venue_id;
            checkin_checkoutService.history_checkin_checkout(vm.user.venue_id, vm.user.user_id, vm.page).then(function(res) {
                vm.checkin_Checkout_history = [];
                var data = res.data.data;
                // var checkin_time = true;
                angular.forEach(data, function(element) {
                    vm.checks_data.id = element.id;
                    vm.checks_data.day = moment(element.checkin).format("MM/DD/YYYY");
                    vm.checks_data.clock_in = moment(element.checkin).format("h:mm A");
                    vm.checks_data.checkin_date = moment(element.checkin).format("MM/DD/YYYY h:mm A");
                    if (element.checkout != "") {
                        vm.checks_data.clock_out = moment(element.checkout).format("h:mm A");
                        vm.checks_data.checkout_date = moment(element.checkout).format("MM/DD/YYYY h:mm A");
                        // checkin_time = true;
                    } else {
                        vm.checks_data.clock_out = '';
                        LocalStorage.add("LAST_CHECKIN", element);
                        LocalStorage.add("CHECKIN", true);
                        vm.checkin = false;
                        vm.lastcheckin = element;
                        LocalStorage.add("CHECKIN_ID", vm.lastcheckin.id);
                        checksintime();
                        // checkin_time = false;
                    }
                    var hours = moment.duration(moment(element.checkout).diff(moment(element.checkin)))._data.hours;
                    var minuts = moment.duration(moment(element.checkout).diff(moment(element.checkin)))._data.minutes;
                    if (hours <= 9) {
                        hours = '0' + hours;
                    }
                    if (minuts <= 9) {
                        minuts = '0' + minuts;
                    }
                    vm.checks_data.paid_hour = hours + ':' + minuts;
                    vm.checkin_Checkout_history.push(vm.checks_data);
                    vm.checks_data = {
                        day: '',
                        clock_in: '',
                        clock_out: '',
                        paid_hour: ''
                    };
                });
                loading.hide()
            }).catch().finally(function() {
                // Hide loading spinner whether our call succeeded or failed.
                loading.hide();
            });;
            $scope.hold_order_list = PosServices.hold_order_list();
        }

        function checksintime() {
            vm.lastcheckin = LocalStorage.get("LAST_CHECKIN");
            var current_time = new Date();
            vm.today_checkin.day = moment(vm.lastcheckin.checkin).format("MM/DD/YYYY");
            vm.today_checkin.clock_in = moment(vm.lastcheckin.checkin).format("h:mm A");
            vm.hour = moment.duration(moment(current_time).diff(moment(vm.lastcheckin.checkin)))._data.hours;
            vm.min = moment.duration(moment(current_time).diff(moment(vm.lastcheckin.checkin)))._data.minutes;
            vm.sec = moment.duration(moment(current_time).diff(moment(vm.lastcheckin.checkin)))._data.seconds;
        }

        function checked_in_time() {
            if (LocalStorage.get("CHECKIN") === true) {
                vm.sec = vm.sec + 1;
                if (vm.sec > 60) {
                    vm.min++;
                    vm.sec = 0;
                }
                if (vm.min > 60) {
                    vm.hour++;
                    vm.min = 0;
                }
            } else {
                vm.min = 0;
                vm.hour = 0;
                vm.sec = 0;
            }


            vm.checked_in_time = '' + vm.hour + ':' + vm.min + ':' + vm.sec;

        }
        $interval(function() {
            checked_in_time();
        }, 1000);

        vm.chekin = function() {
            loading.show();
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

                loading.hide()
            }).catch().finally(function() {
                // Hide loading spinner whether our call succeeded or failed.
                loading.hide();
            });
        }

        vm.checkout = function() {
            if ($scope.hold_order_list.length <= 0) {
                vm.checkoutdata.checkin_id = vm.lastcheckin.id;
                checkin_checkoutService.post_checkin_checkout(vm.checkoutdata).then(function(res) {
                    LocalStorage.add("CHECKIN", false);
                    LocalStorage.get("LAST_CHECKIN", {});
                    LocalStorage.add("CHECKIN_ID", 0);
                    vm.checkin = true;
                    activate();
                    loading.hide()

                }).catch().finally(function() {
                    // Hide loading spinner whether our call succeeded or failed.
                    loading.hide();
                });
            } else {
                alert('Dear ' + vm.user.name + ' you  must clear your hold list before checkout');
            }

        }

        vm.reports_checkin_checkout = function(id) {
            loading.show();
            checkin_checkoutService.reports_checkin_checkout(id).then(function(response) {
                vm.reports_details = response.data.data;
                vm.requestsend = false;
                //variable declear for sale by item foreach
                vm.totalsale = 0;
                vm.total_items_count = 0;

                //variable declear for salve by category foreach
                vm.cattotalamount_count = 0;
                vm.cattotal_items_count = 0;

                //variable declear for salve by summery foreach
                vm.summery_total_sales = 0
                vm.summery_total_sales_discount = 0
                vm.summery_total_sales_shipping_charges = 0
                vm.summery_total_sales_tax = 0

                //make total amount for sale by item 
                angular.forEach(vm.reports_details.sales_by_items, function(value, key) {
                    vm.totalsale = vm.totalsale + parseInt(value.menu_items_total);
                    vm.total_items_count = vm.total_items_count + parseInt(value.items_count);
                });

                //make total amount for sale by category
                angular.forEach(vm.reports_details.sales_by_category, function(value, key) {
                    vm.cattotalamount_count = vm.cattotalamount_count + parseInt(value.category_total);
                    vm.cattotal_items_count = vm.cattotal_items_count + parseInt(value.items_count);
                });

                //make total amount for sale by summery
                angular.forEach(vm.reports_details.sales_by_summary, function(value, key) {
                    vm.summery_total_sales = vm.summery_total_sales + parseInt(value.total_sales);
                    vm.summery_total_sales_discount = vm.summery_total_sales_discount + parseInt(value.total_sales_discount);
                    vm.summery_total_sales_shipping_charges = vm.summery_total_sales_shipping_charges + parseInt(value.total_sales_shipping_charges);
                    vm.summery_total_sales_tax = vm.summery_total_sales_tax + parseInt(value.total_sales_tax);
                });


                $timeout(function() {
                    var checkIncheckOut = angular.element(document.querySelector('#checkIncheckOut'));
                    PrinterServices.reportsPrint(checkIncheckOut[0].innerHTML);
                }, 500);


                loading.hide();
            }).catch().finally(function() {
                // Hide loading spinner whether our call succeeded or failed.
                loading.hide();
            });;
        }

        vm.loadMore = function() {
            vm.page += 1;
            checkin_checkoutService.history_checkin_checkout(vm.user.venue_id, vm.user.user_id, vm.page).then(function(res) {

                var data = res.data.data;
                // var checkin_time = true;
                if (data.length) {
                    angular.forEach(data, function(element) {
                        vm.checks_data.id = element.id;
                        vm.checks_data.day = moment(element.checkin).format("MM/DD/YYYY");
                        vm.checks_data.clock_in = moment(element.checkin).format("h:mm A");
                        vm.checks_data.checkin_date = moment(element.checkin).format("MM/DD/YYYY h:mm A");

                        vm.checks_data.clock_out = moment(element.checkout).format("h:mm A");
                        vm.checks_data.checkout_date = moment(element.checkout).format("MM/DD/YYYY h:mm A");
                        // checkin_time = true;

                        var hours = moment.duration(moment(element.checkout).diff(moment(element.checkin)))._data.hours;
                        var minuts = moment.duration(moment(element.checkout).diff(moment(element.checkin)))._data.minutes;
                        if (hours <= 9) {
                            hours = '0' + hours;
                        }
                        if (minuts <= 9) {
                            minuts = '0' + minuts;
                        }
                        vm.checks_data.paid_hour = hours + ':' + minuts;
                        vm.checkin_Checkout_history.push(vm.checks_data);
                        vm.checks_data = {
                            day: '',
                            clock_in: '',
                            clock_out: '',
                            paid_hour: ''
                        };
                    });
                    $scope.$broadcast('scroll.infiniteScrollComplete');
                    vm.noMoreItemsAvailable = true;
                } else {
                    vm.noMoreItemsAvailable = false;
                }
            }).catch().finally(function() {
                // vm.$broadcast('scroll.infiniteScrollComplete');

            });

        }
    };
})();