(function() {
    'use strict';
    angular.module('app')
        .controller("reportsCtrl", reportsCtrl);

    reportsCtrl.$inject = ["$scope", "PrinterServices", "ReportServices", "currentWebContents", "LocalStorage"];

    function reportsCtrl($scope, PrinterServices, ReportServices, currentWebContents, LocalStorage) {
        var vm = this;
        vm.date = new Date();
        vm.dateto = new Date();
        vm.type = '';

        vm.data = {};
        vm.activebutton = 0;

        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            if (toState.name == 'app.reports') {
                activate();
            }
        });

        function activate() {
            vm.spinner = true;
            ReportServices.reports().then(function(res) {
                vm.spinner = false;
                vm.reports = res.data.data;
            }).catch().finally(function() {
                //Hide loading spinner whether our call succeeded or failed.
                vm.spinner = false;
            });
        }



        vm.datefrom = moment(vm.date).format('YYYY-M-D');
        vm.dateto = moment(vm.dateto).format('YYYY-M-D');

        vm.data = {
            type: '',
            date_from: '',
            date_to: '',

        }

        vm.set_datefrom = function(datefrom) {

            vm.data.date_from = moment(datefrom).format('YYYY-M-D');
            console.log(vm.data.date_from);
        }
        vm.set_dateto = function(dateto) {
            vm.data.date_to = moment(dateto).format('YYYY-M-D');
            console.log(vm.data.date_to);
        }

        vm.changeType = function(type) {
            vm.data.type = type;
        }
        vm.submit = function() {
            vm.requestsend = true;
            ReportServices.get_reports(vm.data)
                .then(dataSuccess);
        }

        function dataSuccess(response) {
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
            angular.forEach(vm.reports_details.sales_by_categories, function(value, key) {
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



        }

        vm.printByItem = function() {
            var printByItem = angular.element(document.querySelector('#print_by_item'));
            PrinterServices.reportsPrint(printByItem[0].innerHTML);
        }

        vm.printByCategoriesItem = function() {
            var printByCategoriesItem = angular.element(document.querySelector('#print_by_categories'));
            PrinterServices.reportsPrint(printByCategoriesItem[0].innerHTML);
        }

        vm.printBysummary = function() {
            var printBysummary = angular.element(document.querySelector('#print_by_summary'));
            PrinterServices.reportsPrint(printBysummary[0].innerHTML);
        }

        vm.printByDetail = function() {
            var printByDetail = angular.element(document.querySelector('#print_by_detail'));
            PrinterServices.reportsPrint(printByDetail[0].innerHTML);
        }

    };
})();