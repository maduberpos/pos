(function() {
    'use strict';

    angular
        .module('app')
        .factory('PosOrderService', PosOrderService)

    PosOrderService.$inject = ['LocalStorage', 'MyHTTP', '$q'];

    function PosOrderService(LocalStorage, MyHTTP, $q) {
        var service = {
            saveOrder: saveOrder,
            sendToServer: sendToServer
        };

        return service;

        function saveOrder(order) {
            var SAVED_ORDERS = [];
            if (LocalStorage.get('SAVED_ORDERS')) {
                SAVED_ORDERS = LocalStorage.get('SAVED_ORDERS');
                SAVED_ORDERS.push(order);
                LocalStorage.add('SAVED_ORDERS', SAVED_ORDERS);
            } else {
                SAVED_ORDERS.push(order);
                LocalStorage.add('SAVED_ORDERS', SAVED_ORDERS);
            }

        }

        function sendToServer() {

            var SAVED_ORDERS = LocalStorage.get('SAVED_ORDERS');
            if (SAVED_ORDERS.lenght !== 0) {
                sendOrderToServerOneByOne(SAVED_ORDERS)
                    .then(function(results) {
                        angular.forEach(results, function(order, index) {
                            SAVED_ORDERS = LocalStorage.get('SAVED_ORDERS');
                            // console.log(SAVED_ORDERS[index].kot_unique_id);
                            if (order.status && order.kot_unique_id) {
                                SAVED_ORDERS.splice(order.kot_unique_id, 1);
                                LocalStorage.add('SAVED_ORDERS', SAVED_ORDERS);
                            }
                        });
                    });
            }
        }

        function sendOrderToServerOneByOne(OrderArray) {

            //console.log(OrderArray);
            // Mark which request we're currently doing
            var currentRequest = 0;
            // Make this promise based.
            var deferred = $q.defer();
            // Set up a result array
            var results = [];
            var venue_id = LocalStorage.get('VENUE').venue_id;

            makeNextRequest();

            function makeNextRequest() {
                // Do whatever you need with the array item.
                var order = OrderArray[currentRequest];
                order.items = angular.toJson(order.items);
                MyHTTP.post1(order, 'order?venue_id=' + venue_id + '&customer_id=' + order.customer_id)
                    .then(function(data) {
                        // Save the result.
                        var order_status = {
                            order_id: data.data.data.order_id,
                            kot_unique_id: data.data.data.kot_unique_id,
                            status: data.data.status
                        };
                        results.push(order_status);

                        // Increment progress.
                        currentRequest++;
                        // Continue if there are more items.
                        if (currentRequest < OrderArray.length) {
                            makeNextRequest();
                        }
                        // Resolve the promise otherwise.
                        else {
                            deferred.resolve(results);
                        }
                    });

                // TODO handle errors appropriately.
            }
            // return a promise for the completed requests
            return deferred.promise;

        }

    }
})();