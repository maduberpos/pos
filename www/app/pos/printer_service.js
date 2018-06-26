(function() {
    'use strict';

    angular
        .module('app')
        .factory('PrinterServices', ['LocalStorage', 'currentWebContents', '$timeout', '$q', PrinterServices]);

    function PrinterServices(LocalStorage, currentWebContents, $timeout, $q) {

        return {
            billPrint: function(billHTML) {
                var deferred = $q.defer();
                var myElement = angular.element(document.querySelector('#printWrapper'));
                myElement.html(billHTML);
                var printer_name = '';
                var number_of_prints = 1;
                if (LocalStorage.get('billing_printer_detail')) {
                    printer_name = LocalStorage.get('billing_printer_detail').printer_name;
                    number_of_prints = LocalStorage.get('billing_printer_detail').no_of_prints;
                }
                if (LocalStorage.get('billing_printer_detail')) {
                    for (var i = 1; i <= number_of_prints; i++) {
                        currentWebContents.print({
                            silent: false,
                            deviceName: printer_name,
                            printBackground: false,
                        });
                    }
                } else {
                    currentWebContents.print({
                        silent: false,
                        deviceName: printer_name,
                        printBackground: false,
                    });
                }
                $timeout(function() {
                    deferred.resolve(true);
                }, 500);

                return deferred.promise;

            },
            kotPrint: function(billHTML) {
                var deferred = $q.defer();
                var myElement = angular.element(document.querySelector('#printWrapper'));
                myElement.html(billHTML);
                var printer_name = '';
                var number_of_prints = 1;
                if (LocalStorage.get('kot_printer_detail')) {
                    printer_name = LocalStorage.get('kot_printer_detail').printer_name;
                    number_of_prints = LocalStorage.get('kot_printer_detail').no_of_prints
                }
                    for (var j = 1; j <= number_of_prints; j++) {
                        currentWebContents.print({ silent: true, deviceName: printer_name, printBackground: true });
                    }
                
                $timeout(function() {
                    deferred.resolve(true);
                }, 1000);

                return deferred.promise;
            },

            reportsPrint: function(billHTML) {
                var myElement = angular.element(document.querySelector('#printWrapper'));
                myElement.html(billHTML);
                var printer_name = '';
                if (LocalStorage.get('billing_printer_detail')) {
                    printer_name = LocalStorage.get('billing_printer_detail').printer_name;
                }
                currentWebContents.print({ silent: true, deviceName: printer_name, page: false, printBackground: true });

                return 0;

            }
        };
    }

})();