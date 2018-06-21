(function() {
    'use strict';
    angular.module('app')
        .controller("customersCtrl", customersCtrl);

    customersCtrl.$inject = ["$scope", 'configuration', "$ionicModal", "CustomersServices", "MenuServices", "setting", "loading", "ionicToast", "LocalStorage"];

    function customersCtrl($scope, configuration, $ionicModal, CustomersServices, MenuServices, setting, loading, ionicToast, LocalStorage) {
        var vm = this;
        vm.venue_detail = setting.venue_setting();
        vm.noMoreItemsAvailable = true;
        vm.noMoreOrderAvailable = true;
        vm.numberOfItemsToDisplay = 12;
        vm.lengthOfItems = 20;
        vm.customer1 = {};
        vm.customerss;
        vm.customers = [];
        vm.page = 0;
        vm.tab = 1;
        $scope.chatMsgs = {};
        vm.customer_orders = [];
        vm.new_password = '';
        // vm.noMoreItemsAvailable = fa;
        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            if (toState.name == 'app.customers') {
                activate();
            }
        });

        function activate() {
            // loading.show();
            vm.page = 0;
            vm.tab = 1;
            if (LocalStorage.get('selected_customer')) {
                vm.selected_customer = LocalStorage.get('selected_customer');
            } else {
                LocalStorage.add('selected_customer', {});
            }

            CustomersServices.customers(vm.page).then(function(res) {
                vm.customers = res.data.data;
                vm.customerss = vm.customers;
                vm.customer1 = vm.customers[0];
            }).catch().finally(function() {
                // Hide loading spinner whether our call succeeded or failed.
                // loading.hide();
            });

        }

        vm.showCustomerDetail = function(customer) {
            vm.customer1 = customer;
            vm.tab = 1;
            vm.noMoreOrderAvailable = true;
        }

        vm.get_order = function() {
            vm.order_page = 0;
            loading.show();
            CustomersServices.get_orders_by_customer(vm.customer1.customer_id, vm.order_page).then(function(data) {
                vm.customer_orders = data.data.data;
                loading.hide();
            })
        }
        vm.showFilterBar = function() {
            var filterBarInstance = $ionicFilterBar.show({
                cancelText: "<i class='ion-ios-close-outline'></i>",
                items: vm.customers,
                update: function(filteredItems, filterText) {
                    vm.customers = filteredItems;
                }
            });
        };



        vm.loadMore = function() {
            vm.page += 1;
            CustomersServices.customers(vm.page).then(function(res) {
                var scrolCustomer = res.data.data;
                if (scrolCustomer.length) {
                    angular.forEach(scrolCustomer, function(itm) {
                        vm.customers.push(itm);

                    });
                    $scope.$broadcast('scroll.infiniteScrollComplete');


                    vm.noMoreItemsAvailable = true;
                } else {
                    vm.noMoreItemsAvailable = false;
                }
            }).catch().finally(function() {
                // vm.$broadcast('scroll.infiniteScrollComplete');

            });
        };

        vm.loadMoreOrders = function() {
            vm.order_page += 1;
            CustomersServices.get_orders_by_customer(vm.customer1.customer_id, vm.order_page).then(function(res) {
                var scrolCustomerOrder = res.data.data;
                if (scrolCustomerOrder.length) {
                    angular.forEach(scrolCustomerOrder, function(itm) {
                        vm.customer_orders.push(itm);
                    });
                    $scope.$broadcast('scroll.infiniteScrollComplete');


                    vm.noMoreOrderAvailable = true;
                } else {
                    vm.noMoreOrderAvailable = false;
                }
            }).catch().finally(function() {
                // vm.$broadcast('scroll.infiniteScrollComplete');

            });
        };


        vm.select_customer = function(customer) {
            if (customer) {
                LocalStorage.add('selected_customer', customer);
                vm.selected_customer = customer;
            } else {
                LocalStorage.add('selected_customer', {});
            }
        }





        vm.delete = function(customer) {
            vm.loading = true;
            var data = {
                id: customer.customer_id,
            }

            CustomersServices.delete_customer(data)
                .then(function(resp) {


                    CustomersServices.customers().then(function(res) {
                        vm.customers = res.data.data;
                    }).catch().finally(function() {
                        // Hide loading spinner whether our call succeeded or failed.
                        vm.loading = false;
                    });
                });

        }

        vm.updateCustomer = function(firstname, lastname, email, phone, id) {

            var data = {
                firstname: firstname,
                lastname: lastname,
                email: email,
                phone: phone,
                id: id,
            };
            vm.spinner = true;
            vm.spineerhide = true;
            CustomersServices.update_customer(data)
                .then(function(resp) {
                    vm.spinner = false;
                    vm.spineerhide = false;
                    if (resp) {

                        vm.loading = true;
                        CustomersServices.customers().then(function(res) {
                            vm.customers = res.data.data;
                        }).catch().finally(function() {
                            // Hide loading spinner whether our call succeeded or failed.
                            vm.loading = false;
                        });


                    }

                });

        }

        vm.customer_name = '';
        vm.customers_search = {};
        vm.noMoreItemsAvailable = true;
        vm.showVal = function(value) {
            if (value != '') {
                vm.spinner = true;
                CustomersServices.search_customers(value).then(function(res) {
                    vm.customers = res.data.data;
                    vm.customer1 = vm.customers[0];
                    vm.spinner = false;
                });
            }
        }

        vm.change_password = function(customer_id) {

            var data = {
                customer_id: customer_id,
                new_password: vm.new_password
            };
            vm.requestSent = true;
            CustomersServices.change_password(data).then(function(res) {
                vm.requestSent = false;
                vm.new_password = '';
                ionicToast.show(res.data.msg, 'bottom', false, 4000);
            });
        }

        vm.addCustomer = function() {
            $ionicModal.fromTemplateUrl('app/customers/addCustomer.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                vm.customerModal = modal;
                vm.customerModal.show();
            });
        };


        vm.customer = {
            first_name: '',
            last_name: '',
            email: '',
            mobile_number: '',
            password: ''
        };

        vm.addNewCustomer = function() {
            vm.customer.first_name = vm.customer_first_name;
            vm.customer.last_name = vm.customer_last_name;
            vm.customer.email = vm.customer_email;
            vm.customer.mobile_number = vm.customer_mobile_number;
            vm.customer.password = vm.customer_password;

            CustomersServices.save_customer(vm.customer).then(function(res) {
                vm.customerModal.hide();
                activate();

                vm.customer.first_name = '';
                vm.customer.last_name = '';
                vm.customer.email = '';
                vm.customer.mobile_number = '';
                vm.customer.password = '';
            });
        }

        vm.hideCustomerModal = function() {
            vm.customerModal.hide();
        };

        $ionicModal.fromTemplateUrl('app/customers/order-model.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.tab = 1;
            $scope.modal = modal;
        });

        vm.viewOrder = function(order) {
            $scope.order = order;
            $scope.tab = 1;
            console.log($scope.order);
            $scope.modal.show();
            $scope.tab = 1;
        }
        $scope.closeModal = function() {
            $scope.tab = 1;
            $scope.modal.hide();
        }
        $scope.statusClass = "";
        $scope.orderStatusData = {
            'order_placed': false,
            'reject': false,
            'accept': false,
            'preparing': false,
            'delivery': false,
            'delivered': false
        };


        $scope.OrderStatus = function(status) {

        };
        $scope.$watch(function() {
            return vm.order_id;
        }, function(newValue, oldValue) {
            if (configuration.env === 'pro') {
                firebase.database().ref('pro/chat/' + newValue)
                    .on('value', function(data) {
                        $scope.chatMsgs = data.val();
                        if ($scope.tab !== 5) {
                            angular.forEach($scope.chatMsgs, function(msgs) {
                                if (msgs.timestamp == Date.now()) {
                                    notificationService.msgNotifications();
                                }
                            });
                        }
                        if (!$scope.$$phase) {
                            $scope.$apply(function() {
                                $scope.chatMsgs = data.val();
                                angular.forEach($scope.chatMsgs, function(msgs) {


                                    // notificationService.msgNotifications();

                                });
                            });
                        }
                    });
            }
            if (configuration.env === 'dev') {
                firebase.database().ref('dev/chat/' + newValue)
                    .on('value', function(data) {
                        $scope.chatMsgs = data.val();
                        if ($scope.tab !== 5) {
                            angular.forEach($scope.chatMsgs, function(msgs) {
                                if (msgs.timestamp == Date.now()) {
                                    notificationService.msgNotifications();
                                }
                            });
                        }
                        if (!$scope.$$phase) {
                            $scope.$apply(function() {
                                $scope.chatMsgs = data.val();
                                angular.forEach($scope.chatMsgs, function(msgs) {


                                    // notificationService.msgNotifications();

                                });
                            });
                        }
                    });
            }
        });

        $scope.statusClass = function(status) {
            if (status == 0) {
                return "placed_status";
            } else if (status == 1) {
                return "reject_status";
            } else if (status == 2) {
                return "accept_status";
            } else if (status == 3) {
                return "preparing_status";
            } else if (status == 4) {
                return "delivering_status";
            } else if (status == 5) {
                return "delivered_status";
            }
        };
        $scope.OrderStatus = function(status) {
            if (status == 0) {
                $scope.NotallowFeedback = true;
                $scope.orderStatusData = {
                    'order_placed': true,
                    'reject': false,
                    'accept': false,
                    'preparing': false,
                    'delivery': false,
                    'delivered': false
                };
                $scope.statusClass = "placed_status";
                return "Order Placed";
            } else if (status == 1) {
                $scope.NotallowFeedback = true;
                $scope.orderStatusData = {
                    'order_placed': true,
                    'reject': true,
                    'accept': false,
                    'preparing': false,
                    'delivery': false,
                    'delivered': false
                };
                $scope.statusClass = "reject_status";
                return "Reject";
            } else if (status == 2) {
                $scope.NotallowFeedback = true;
                $scope.orderStatusData = {
                    'order_placed': true,
                    'reject': false,
                    'accept': true,
                    'preparing': false,
                    'delivery': false,
                    'delivered': false
                };
                $scope.statusClass = "accept_status";
                return "Accepted";
            } else if (status == 3) {
                $scope.NotallowFeedback = true;
                $scope.orderStatusData = {
                    'order_placed': true,
                    'reject': false,
                    'accept': true,
                    'preparing': true,
                    'delivery': false,
                    'delivered': false
                };
                $scope.statusClass = "preparing_status";
                return "Preparing";
            } else if (status == 4) {
                $scope.NotallowFeedback = true;
                $scope.orderStatusData = {
                    'order_placed': true,
                    'reject': false,
                    'accept': true,
                    'preparing': true,
                    'delivery': true,
                    'delivered': false
                };
                $scope.statusClass = "Delivery";
                return "Delivery";
            } else if (status == 5) {
                $scope.NotallowFeedback = false;
                $scope.orderStatusData = {
                    'order_placed': true,
                    'reject': false,
                    'accept': true,
                    'preparing': true,
                    'delivery': true,
                    'delivered': true
                };
                $scope.statusClass = "delivered";
                return "Delivered";
            }
        };
        $scope.OrderPayment = function(payment) {
            if (payment == 0) {
                return 'not paid';
            } else if (payment == 1) {
                return 'Paid';
            }
        };

        vm.initMap = function() {
            var venueLatLng = new google.maps.LatLng($scope.order.venue_address.venue_latitude, $scope.order.venue_address.venue_longitude);
            var mapOptions = {
                center: venueLatLng,
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
            };
            var map = new google.maps.Map(document.getElementById("map"), mapOptions);
            vm.map = map;

            vm.setDirections($scope.order);

            google.maps.event.addListener(map, 'bounds_changed', function() {
                vm.mapLoaded = true;
                google.maps.event.trigger(map, 'resize');
            });
        }


        vm.makeMarker = function(position, icon, title, map) {
            var marker = new google.maps.Marker({
                position: position,
                map: map,
                icon: icon,
                title: title
            });
            return marker;
        };



        vm.setDirections = function(order) {
            var start = null;
            var end = null;
            var icons = {
                start: new google.maps.MarkerImage(
                    // URL
                    'http://maps.google.com/mapfiles/ms/micons/blue.png',
                    // (width,height)
                    new google.maps.Size(44, 32),
                    // The origin point (x,y)
                    new google.maps.Point(0, 0),
                    // The anchor point (x,y)
                    new google.maps.Point(0, 0)),
                end: new google.maps.MarkerImage(
                    // URL
                    'http://maps.google.com/mapfiles/ms/micons/green.png',
                    // (width,height)
                    new google.maps.Size(44, 32),
                    // The origin point (x,y)
                    new google.maps.Point(0, 0),
                    // The anchor point (x,y)
                    new google.maps.Point(22, 32))
            };

            if ($scope.order.venue_address.venue_latitude !== '') {
                start = new google.maps.LatLng($scope.order.venue_address.venue_latitude, $scope.order.venue_address.venue_longitude);
            } else {
                start = $scope.order.venue_address.venue_address;
            }

            if ($scope.order.customer_address.latitude !== '' && $scope.order.customer_address.longitude !== '') {
                end = new google.maps.LatLng($scope.order.customer_address.latitude, $scope.order.customer_address.longitude);
            } else {
                end = $scope.order.customer_address.address;
            }

            //  end = new google.maps.LatLng(37.35728082 , -122.11715581)

            var rendererOptions = {
                map: vm.map,
                suppressMarkers: true
            };

            var directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);

            directionsDisplay.setMap(vm.map);
            var request = {
                origin: start,
                destination: end,
                travelMode: 'DRIVING'
            };
            var directionsService = new google.maps.DirectionsService();
            directionsService.route(request, function(response, status) {
                if (status === google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);

                    var leg = response.routes[0].legs[0];
                    vm.start_marker = vm.makeMarker(leg.start_location, icons.start, "title", vm.map);
                    vm.end_marker = vm.makeMarker(leg.end_location, icons.end, 'title', vm.map);

                }
            });

            if ($scope.order.status === 4 && vm.mapLoaded) {
                if (configuration.env === 'pro') {
                    firebase.database().ref('pro/rider_location/' + $scope.order.order_id)
                        .on('value', function(data) {
                            vm.rider_location = data.val();
                            if (vm.rider_location) {
                                var riderPosition = new google.maps.LatLng(vm.rider_location.latitude, vm.rider_location.longitude);

                                var riderIcon = {
                                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                    fillColor: '#e8202d',
                                    fillOpacity: 0.8,
                                    strokeColor: '#e8202d',
                                    strokeOpacity: 0.4,
                                    scale: 5
                                };
                                if (angular.isNumber(vm.rider_location.heading)) {
                                    riderIcon.rotation = vm.rider_location.heading;
                                    vm.map.setHeading(vm.rider_location.heading);
                                }
                                vm.start_marker.setIcon(riderIcon);

                                vm.start_marker.setPosition(riderPosition);

                                var request = {
                                    origin: riderPosition,
                                    destination: end,
                                    travelMode: 'DRIVING'
                                };
                                directionsService.route(request, function(response, status) {
                                    if (status === google.maps.DirectionsStatus.OK) {
                                        directionsDisplay.setDirections(response);

                                    }
                                });
                                // if(angular.isNumber(vm.rider_location.heading)){
                                //   vm.map.setHeading(vm.rider_location.heading);
                                // }
                            }
                        });
                }
                if (configuration.env === 'dev') {
                    firebase.database().ref('dev/rider_location/' + $scope.order.order_id)
                        .on('value', function(data) {
                            vm.rider_location = data.val();
                            if (vm.rider_location) {
                                var riderPosition = new google.maps.LatLng(vm.rider_location.latitude, vm.rider_location.longitude);

                                var riderIcon = {
                                    path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                                    fillColor: '#e8202d',
                                    fillOpacity: 0.8,
                                    strokeColor: '#e8202d',
                                    strokeOpacity: 0.4,
                                    scale: 5
                                };
                                if (angular.isNumber(vm.rider_location.heading)) {
                                    riderIcon.rotation = vm.rider_location.heading;
                                    vm.map.setHeading(vm.rider_location.heading);
                                }
                                vm.start_marker.setIcon(riderIcon);

                                vm.start_marker.setPosition(riderPosition);

                                var request = {
                                    origin: riderPosition,
                                    destination: end,
                                    travelMode: 'DRIVING'
                                };
                                directionsService.route(request, function(response, status) {
                                    if (status === google.maps.DirectionsStatus.OK) {
                                        directionsDisplay.setDirections(response);

                                    }
                                });
                                // if(angular.isNumber(vm.rider_location.heading)){
                                //   vm.map.setHeading(vm.rider_location.heading);
                                // }
                            }
                        });
                }
            }
        }

    };
})();