(function() {
    'use strict';
    angular.module('app')
        .controller("bussinessdayCtrl", bussinessdayCtrl);

    bussinessdayCtrl.$inject = ["$scope", 'bussinessdayService', 'currentUser', 'setting', 'loading', '$location', 'LocalStorage', 'PrinterServices', '$timeout', '$interval', '$ionicPopup'];

    function bussinessdayCtrl($scope, bussinessdayService, currentUser, setting, loading, $location, LocalStorage, PrinterServices, $timeout, $interval, $ionicPopup) {
        var vm = this;
        vm.venue_detail = setting.venue_setting();
        vm.history = [];
        vm.week_days = [
            'sunday',
            'monday',
            'tuesday',
            'wednesday',
            'thursday',
            'friday',
            'saturday'
        ]
        vm.isDayStarted = false;
        vm.dayStartedDateTime = '';
        vm.dayStart = {
            daytype: '',
            user_id: '',
            venue_id: ''
        };
        vm.hide_day == true;
        vm.noMoreItemsAvailable = true;
        vm.page = 0;

        function activate() {
            vm.page = 0;
            vm.noMoreItemsAvailable = true;
            vm.user = LocalStorage.get('USER');
            if (LocalStorage.get('ISDAYSTARTED') === true) {
                vm.isDayStarted = LocalStorage.get('ISDAYSTARTED');
                vm.dayStartedDateTime = LocalStorage.get('DAYSTART').day_start;

            }
            var d = new Date();
            console.log(vm.week_days[d.getDay()])
                // console.log(JSON.parse(vm.venue_detail.timing))
            var data = {
                    user_id: vm.user.user_id,
                    venue_id: vm.user.venue_id
                }
                // loading.show();
            bussinessdayService.history_business_day(data, vm.page).then(function(res) {
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

                // today = moment(vm.history[0].day_close).format("MM/DD/YYYY");


            });
        }
        activate();

        // $interval(function() {
        //     activate();
        // }, 1000);

        vm.dayStart = function() {
            vm.dayStart.business_day_type = 'daystart';
            vm.dayStart.user_id = currentUser.profile().user_id;
            vm.dayStart.venue_id = currentUser.profile().venue_id;

            bussinessdayService.business_day(vm.dayStart).then(function(res) {
                console.log(res.data.data);
                if (res.data.status == false) {
                    LocalStorage.add("ISDAYSTARTED", true);
                    activate();
                    vm.isDayStarted = true;
                } else {
                    LocalStorage.add("DAYSTART", res.data.data);
                    LocalStorage.add("ISDAYSTARTED", true);
                    vm.isDayStarted = true;
                    activate();
                }
            });

        }

        vm.dayClose = {
            daytype: '',
            business_day_id: null,
            user_id: '',
            venue_id: ''
        };

        vm.dayClose = function() {

            if (LocalStorage.get('isCashIn')) {
                var isCashInPopup = $ionicPopup.alert({
                    title: 'Cash-out is required!',
                    template: 'You must cash-out before closing the bussiness day'
                });
                isCashInPopup.then(function(res) {
                    $location.path('app/cashincashout');
                });

            } else {

                vm.dayClose.business_day_type = 'dayclose';
                vm.dayClose.user_id = currentUser.profile().user_id;
                vm.dayClose.venue_id = currentUser.profile().venue_id;
                vm.dayClose.business_day_id = LocalStorage.get("DAYSTART_ID");

                var alert = $ionicPopup.alert({
                    title: 'Alert!',
                    template: 'Are you sure want to close bussiness day?',
                    buttons: [{
                            text: 'Yes',
                            onTap: function() {
                                return 1;
                            }
                        },
                        {
                            text: '<b>No</b>',
                            type: 'button-positive'
                        }
                    ]

                });
                alert.then(function(res) {
                    if (res) {
                        bussinessdayService.business_day(vm.dayClose).then(function(res) {
                            LocalStorage.add("DAYCLOSE", res.data);
                            LocalStorage.add("ISDAYSTARTED", false);
                            LocalStorage.add("DAYSTART_ID", 0);
                            vm.isDayStarted = false;
                            vm.hide_day = true;

                        });
                    }
                });


            }
        }

        vm.reports_business_day = function(id) {
            var business_day_id = id;
            bussinessdayService.reports_business_day(business_day_id).then(function(res) {
                console.log(res);
                vm.bussiness_report = res.data.data;
                vm.salesByOrderType_discount_sum = 0;
                vm.salesByOrderType_sale_sum = 0;
                vm.salesByOrderType_netsale_sum = 0;
                vm.SaleByPaymentType_discount_sum = 0;
                vm.SaleByPaymentType_sale_sum = 0;
                vm.SaleByPaymentType_netsale_sum = 0;
                angular.forEach(vm.bussiness_report.sales_by_order_type, function(discount) {
                    vm.salesByOrderType_discount_sum += parseInt(discount.discount);
                });
                angular.forEach(vm.bussiness_report.sales_by_order_type, function(sale) {
                    vm.salesByOrderType_sale_sum += parseInt(sale.sale);
                });
                angular.forEach(vm.bussiness_report.sales_by_order_type, function(netsale) {
                    vm.salesByOrderType_netsale_sum += parseInt(netsale.netsale);
                });
                angular.forEach(vm.bussiness_report.sales_by_payment_type, function(discount) {
                    vm.SaleByPaymentType_discount_sum += parseInt(discount.discount);
                });
                angular.forEach(vm.bussiness_report.sales_by_payment_type, function(sale) {
                    vm.SaleByPaymentType_sale_sum += parseInt(sale.sale);
                });
                angular.forEach(vm.bussiness_report.sales_by_payment_type, function(netsale) {
                    vm.SaleByPaymentType_netsale_sum += parseInt(netsale.netsale);
                });
                $timeout(function() {
                    var businessDay = angular.element(document.querySelector('#businessDay'));
                    PrinterServices.reportsPrint(businessDay[0].innerHTML);
                }, 500);



            });
        }
        vm.isCashIn = function() {

            if (LocalStorage.get('isCashIn')) {

            } else {
                return 0;
            }
        };
        vm.loadMore = function() {
            vm.page += 1;
            var data = {
                user_id: vm.user.user_id,
                venue_id: vm.user.venue_id
            }
            bussinessdayService.history_business_day(data, vm.page).then(function(res) {

                var scroldata = res.data.data;
                if (scroldata.length > 0) {

                    angular.forEach(scroldata, function(itm) {
                        vm.history.push(itm);
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