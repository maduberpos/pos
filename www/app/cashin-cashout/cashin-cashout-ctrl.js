(function() {
    'use strict';
    angular.module('app')
        .controller("cashin_outCtrl", cashin_outCtrl);

    cashin_outCtrl.$inject = ['$scope', 'PosServices', 'PrinterServices', '$timeout', 'setting', 'loading', '$ionicPopup', 'cashin_outService','LocalStorage','$location'];

    function cashin_outCtrl($scope, PosServices, PrinterServices, $timeout, setting, loading, $ionicPopup, cashin_outService, LocalStorage,$location) {
        var vm = this;
        vm.venue_detail = setting.venue_setting();
        vm.user = {};
        vm.cashin_data = {
            cash_type: 'cashin',
            user_id: null,
            venue_id: null,
            cashin_amount: 0,
            cashin_date: '',
            cashin_reason: ''
        }

        vm.cashout_data = {
            cashin_id: null,
            cashin_date: '',
            cashin_reason: '',
            cashin_amount: 0,
            cash_type: 'cashout',
            user_id: null,
            venue_id: null,
            cashout_date: '',
            cashout_amount: null,
            cashout_reason: ''
        }
        vm.noMoreItemsAvailable = true;
        vm.page = 0;
        vm.cashin = true;
        vm.cashout = false;
        vm.cashin_id = null;
        vm.total_sale = 0;
        vm.cashin_amount = 0;
        vm.cashin_date = '';
        vm.cashin_reason = '';
        vm.cashin_out_history = [];
        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            if (toState.name == 'app.cashincashout') {
                activate();
            }

        });
        vm.total_tax = 0;
        vm.sub_total = 0;
        vm.total_discount = 0;
        vm.total_sale = 0;
        vm.cashin_amount = 0;
        vm.sale_by_cash = 0;
        vm.sale_by_card = 0;
        vm.sale_by_complimentary = 0;


        function activate() {
            vm.page = 0;
            vm.noMoreItemsAvailable = true;
            if (LocalStorage.get('cashin_id')) {
                if (LocalStorage.get('cashin_id') != 0) {
                    LocalStorage.add('isCashIn', true);
                    vm.cashout_data.cashin_id = LocalStorage.get('cashin_id');
                    vm.cashin = false;
                    vm.cashout = true;
                }
            } else {
                LocalStorage.add('isCashIn', false);
                LocalStorage.add('cashin_id', 0);
            }
            vm.user = LocalStorage.get('USER');
            vm.cashin_data.user_id = vm.user.user_id;
            vm.cashin_data.venue_id = vm.user.venue_id;
            vm.cashout_data.user_id = vm.user.user_id;
            vm.cashout_data.venue_id = vm.user.venue_id;
            cashin_outService.history_cashin_cashout(vm.user.venue_id, vm.user.user_id, vm.page).then(function(res) {
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
            .catch()
            .finally(function() {
                var totalsale = 0;
                cashin_outService.cashout_amount(LocalStorage.get('cashin_id')).then(function(responce) {
                    totalsale = responce.data.data;
                    vm.total_tax = totalsale.tax;
                    vm.sub_total = totalsale.subtotal;
                    vm.total_discount = totalsale.discount;
                    vm.total_sale = totalsale.total;
                    console.log(vm.cashin_amount);
                    vm.total_cash = vm.total_sale + vm.cashin_amount;
                    angular.forEach(totalsale.sales_by_payment_method, function(methods) {
                        console.log(methods);
                        if (methods.payment_method === 'cash') {
                            vm.sale_by_cash = methods.sale;
                        }
                        if (methods.payment_method === 'card') {
                            vm.sale_by_card = methods.sale;
                        }
                        if (methods.payment_method === 'complimentary') {
                            vm.sale_by_complimentary = methods.sale;
                        }
                    });
                    console.log(vm.total_sale);
                    if (vm.total_sale === null) {
                        vm.total_sale = 0;
                    }

                });
                loading.hide();
            });;

            $scope.hold_order_list = PosServices.hold_order_list();

        }


        vm.onCashin = function() {

            loading.show();
            vm.cashin_data.cashin_date = moment().format("MM/DD/YYYY");
            cashin_outService.post_cashin_cashout(vm.cashin_data)
                .then(function(responce) {
                    vm.cashin_id = responce.data.cashin_id;
                    vm.cashin_date = responce.data.cashin;
                    vm.cashin_reason = responce.data.cashin_reason;
                    LocalStorage.add('cashin_id', vm.cashin_id);
                    LocalStorage.add('latest_cashin', responce.data);
                    LocalStorage.add('isCashIn', true);
                    vm.cashin = false;
                    vm.cashout = true;
                    vm.cashin_data = {
                        cash_type: 'cashin',
                        user_id: null,
                        venue_id: null,
                        cashin_amount: 0,
                        cashin_reason: ''
                    }
                    activate();
                    loading.hide();
                }).catch().finally(function() {
                    // Hide loading spinner whether our call succeeded or failed.
                    loading.hide();
                });
        }

        vm.onCashout = function() {
            if ($scope.hold_order_list.length <= 0) {
                if (vm.cashout_data.cashout_amount == vm.total_cash) {
                    vm.cashout_data.cashin_date = vm.cashin_date;
                    vm.cashout_data.cashin_reason = vm.cashin_reason;
                    vm.cashout_data.cashout_date = moment().format("MM/DD/YYYY");
                    loading.show();
                    cashin_outService.post_cashin_cashout(vm.cashout_data).then(function(responce) {
                        LocalStorage.add('cashin_id', 0);
                        LocalStorage.add('kot_counter', 0);
                        LocalStorage.add('isCashIn', false);
                        LocalStorage.add('TOTAL_SALE', 0);
                        vm.cashin = true;
                        vm.cashout = false;
                        vm.cashout_data = {
                            cashin_id: null,
                            cash_type: 'cashout',
                            user_id: null,
                            venue_id: null,
                            cashout_amount: 0,
                            cashout_reason: ''
                        }
                        vm.cashin_amount = 0;
                        vm.sale_by_cash = 0;
                        vm.sale_by_card = 0;
                        vm.sale_by_complimentary = 0;
                        activate();
                        loading.hide()
                    }).catch().finally(function() {
                        // Hide loading spinner whether our call succeeded or failed.
                        loading.hide();
                    });
                } else {
                    var isCashInPopup = $ionicPopup.alert({
                        title: 'Error',
                        template: 'Cash out amount should be equal to Total Cash'
                    });
                    isCashInPopup.then(function(res) {
                        $location.path('app/cashincashout');
                    });
                }

            } else {
                alert('Dear ' + vm.user.name + ' you must clear your hold list before cashout');
            }


        }

        vm.cashiinreports = function(cash_id) {
            loading.show();
            cashin_outService.reports_cashin_cashout(cash_id).then(function(response) {
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
                    var cashIncashOut = angular.element(document.querySelector('#cashIncashOut'));
                    PrinterServices.reportsPrint(cashIncashOut[0].innerHTML);
                }, 500);


                loading.hide();
            })
        }

        vm.loadMore = function() {
            vm.page += 1;
            cashin_outService.history_cashin_cashout(vm.user.venue_id, vm.user.user_id, vm.page).then(function(res) {

                var scroldata = res.data.data;
                if (scroldata.length > 0) {

                    angular.forEach(scroldata, function(itm) {
                        vm.cashin_out_history.push(itm);
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