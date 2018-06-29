(function() {
    'use strict';
    angular.module('app')
        .controller("settingsCtrl", settingsCtrl);

    settingsCtrl.$inject = ["$scope", "LocalStorage", "currentWebContents", "setting"];

    function settingsCtrl($scope, LocalStorage, currentWebContents, setting) {
        var vm = this;
        vm.venue_detail = setting.venue_setting();
        const { exec } = require('child_process');
        vm.user_detail = LocalStorage.get('USER');
        vm.availablePrinter = currentWebContents.getPrinters();
        vm.printer_type = 'billing_printer';
        vm.billing_printer = {
            printer_name: '',
            no_of_prints: 2,
            printer_header: '',
            printer_footer: ''
        }
        vm.server_connection = false;
        vm.order_notification = true;
        vm.reservation_notification = true;
        vm.customer_notification = true;
        vm.kot_notification = true;
        vm.waiter_app_notification = true;
        vm.kot_printer = {
            printer_name: '',
            no_of_prints: 1,
            printer_header: '',
            printer_footer: ''
        }


        if (LocalStorage.get('billing_printer_detail')) {
            vm.billing_printer = LocalStorage.get('billing_printer_detail');
        }
        if (LocalStorage.get('kot_printer_detail')) {
            vm.kot_printer = LocalStorage.get('kot_printer_detail');
        }

        vm.printer_detail = function(printer_type) {
            vm.printer_type = printer_type;
            activate();
        }

        function activate() {
            if (LocalStorage.get('order_notification' + vm.user_detail.user_id) === false) {
                vm.order_notification = LocalStorage.get('order_notification' + vm.user_detail.user_id);
            } else {
                LocalStorage.add('order_notification' + vm.user_detail.user_id, vm.order_notification);
            }
            if (LocalStorage.get('reservation_notification' + vm.user_detail.user_id) === false) {
                vm.reservation_notification = LocalStorage.get('reservation_notification' + vm.user_detail.user_id);
            } else {
                LocalStorage.add('reservation_notification' + vm.user_detail.user_id, vm.reservation_notification);
            }
            if (LocalStorage.get('customer_notification' + vm.user_detail.user_id) === false) {
                vm.customer_notification = LocalStorage.get('customer_notification' + vm.user_detail.user_id);
            } else {
                LocalStorage.add('customer_notification' + vm.user_detail.user_id, vm.customer_notification);
            }
            if (LocalStorage.get('kot_notification' + vm.user_detail.user_id) === false) {
                vm.kot_notification = LocalStorage.get('kot_notification' + vm.user_detail.user_id);
            } else {
                LocalStorage.add('kot_notification' + vm.user_detail.user_id, vm.kot_notification);
            }
            if (LocalStorage.get('waiter_app_notification' + vm.user_detail.user_id) === false) {
                vm.waiter_app_notification = LocalStorage.get('waiter_app_notification' + vm.user_detail.user_id);
            } else {
                LocalStorage.add('waiter_app_notification' + vm.user_detail.user_id, vm.waiter_app_notification);
            }
        }
        activate();
        vm.save_printer_detail = function(printer) {
            if (printer === "billing_printer") {
                LocalStorage.add('billing_printer_detail', vm.billing_printer);
            }
            if (printer === "kot_printer") {
                LocalStorage.add('kot_printer_detail', vm.kot_printer);
            }
        }

        vm.startServer = function() {
            exec('node server', (function(err) {
                console.log(err);
                console.log('Error');
            }, function(stdout) {
                console.log('server is runing');
                console.log(stdout);
            }, function(stderr) {
                console.log('server is error');
                console.log(stderr);
            }));
        }
        vm.stopServer = function() {
                exec('taskkill /im node.exe /F', (function(err) {
                    console.log(err);
                }, function(stdout) {
                    console.log('server is stop');
                    console.log(stdout);
                }, function(stderr) {
                    console.log('server is error');
                    console.log(stderr);
                }));
            }
            // ;

        vm.ip = LocalStorage.get('ip_address');

        vm.checkConnection = function() {
            Socket.connect().id = "manager_app";
            console.log('check 1', Socket.connect());
            console.log('once', Socket.once);
            Socket.once("once", function(data) {
                console.log(data)
            })
        }

        vm.orderNotification = function(notification) {
            console.log(notification);
            LocalStorage.add('order_notification' + vm.user_detail.user_id, notification);
        }
        vm.reservationNotification = function(notification) {
            LocalStorage.add('reservation_notification' + vm.user_detail.user_id, notification);
        }
        vm.customerNotification = function(notification) {
            LocalStorage.add('customer_notification' + vm.user_detail.user_id, notification);
        }
        vm.kotNotification = function(notification) {
            LocalStorage.add('kot_notification' + vm.user_detail.user_id, notification);
        }
        vm.waiterAppNotification = function(notification) {
            LocalStorage.add('waiter_app_notification' + vm.user_detail.user_id, notification);
        }
    };
})();