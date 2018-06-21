(function() {
    'use strict';
    angular.module('app')
        .controller("OrderCtrl", OrderCtrl);

    OrderCtrl.$inject = ["$scope", "configuration", "PrinterServices", "OrderServices", "PosServices", "$ionicPopup", "$location", "ionicToast", "$ionicModal", "loading", 'LocalStorage', 'setting', '$ionicTabsDelegate', '$ionicScrollDelegate', 'currentUser', 'notificationService'];

    function OrderCtrl($scope, configuration, PrinterServices, OrderServices, PosServices, $ionicPopup, $location, ionicToast, $ionicModal, loading, LocalStorage, setting, $ionicTabsDelegate, $ionicScrollDelegate, currentUser, notificationService) {
        var vm = this;
        vm.disablekotbtn = false;
        vm.checked = false;
        vm.order = [];
        vm.noMoreItemsAvailable = true;
        vm.numberOfItemsToDisplay = 12;
        vm.lengthOfItems = 20;
        vm.orders = [];
        vm.chatMsgs = {};
        vm.order_id = 0;
        vm.order_kot = [];
        vm.rider_id = 1;
        vm.tab = 1;
        vm.venue_detail = setting.venue_setting();
        vm.page = 0;
        vm.order_type = [{
            id: 0,
            type: "Filter by type",
            slug: '',

        }];

        vm.order_counter = 0;
        vm.riders = [];
        angular.forEach(LocalStorage.get("Order_type"), function(type) {
            vm.order_type.push(type);
        });

        vm.orderType = vm.order_type[0].slug;
        vm.platforms = [{
                id: 1,
                value: '',
                name: 'Filter by plateform'
            },
            {
                id: 2,
                value: 'web',
                name: 'web'
            },
            {
                id: 2,
                value: 'android',
                name: 'Android'
            }, {
                id: 3,
                value: 'ios',
                name: 'IOS'
            }
        ];
        vm.platform = vm.platforms[0].value;
        vm.feedbackdata = {
            "isFeedback": false,
            "quality": 1,
            "service": 1,
            "value": 1,
            "feedback": ""
        };
        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            if (toState.name == 'app.orders') {
                vm.isDayStart();
                activate();
            }

        });
        if (configuration.env === 'pro') {
            firebase.database()
                .ref('pro/orders')
                .on('value', function(data) {
                    changeorder();
                });
            firebase.database().ref('pro/venueorderupdate/' + currentUser.profile().venue_id)
                .on('value', function(data) {
                    changeorder();
                });
        }

        if (configuration.env === 'dev') {
            firebase.database()
                .ref('dev/orders')
                .on('value', function(data) {
                    changeorder();
                });
            firebase.database().ref('dev/venueorderupdate/' + currentUser.profile().venue_id)
                .on('value', function(data) {
                    changeorder();
                });
        }

        function activate() {

            vm.page = 0;
            vm.kot_time = '30';
            if (PosServices.kot_list()) {
                vm.kot_list = PosServices.kot_list();
            } else {
                vm.kot_list = [];
            }
            OrderServices.orders(vm.platform, vm.orderType, vm.page).then(function(res) {
                vm.orders = res.data.data;
                //   console.log(vm.orders);
                vm.orders_list = vm.orders;
                vm.lengthOfItems = vm.orders.length;
                vm.order = vm.orders[0];
                angular.forEach(vm.kot_list, function(data) {
                    if (data.kot_unique_id === vm.order.order_id) {
                        vm.disablekotbtn = true;
                    }
                });
                vm.paid_by = vm.order.payment_method;
                vm.rider_id = vm.order.server_id;
                vm.estimated_time = vm.order.estimated_time;
                vm.discountRate = vm.order.discountRate;
                if (vm.order.is_payment_confirmed === 0) {
                    vm.payment_status = false;
                } else if (vm.order.is_payment_confirmed === 0) {
                    vm.payment_status == true;
                }
                vm.estimated_time = vm.order.estimated_time;
                vm.riders = vm.order.riders;
                if (vm.order) {
                    vm.order_id = vm.order.order_id;
                }

                // loading.hide()
            }).catch().finally(function() {
                // Hide loading spinner whether our call succeeded or failed.
                // loading.hide();
            });
        }

        function changeorder() {
            if (vm.page != 0) {
                vm.page = vm.page - 1;
            }
            vm.order_counter = 0;
            if (LocalStorage.get("order_notification")) {} else {
                LocalStorage.add("order_notification", Date.now());
            }
            if (PosServices.kot_list()) {
                vm.kot_list = PosServices.kot_list();
            } else {
                vm.kot_list = [];
            }
            OrderServices.orders(vm.platform, vm.orderType, vm.page).then(function(res) {
                vm.orders = res.data.data;
                // console.log(vm.orders);
                vm.orders_list = vm.orders;
                vm.lengthOfItems = vm.orders.length;
                vm.order_counter = 0;
                angular.forEach(vm.orders, function(ordr) {
                    LocalStorage.add('new_order_count', 0);
                    if (ordr.order_id === vm.order.order_id) {
                        vm.order = ordr;
                    }
                    if (ordr.status === 0) {
                        vm.order_counter += 1;
                    }
                });
                LocalStorage.add('new_order_count', vm.order_counter);


                if (vm.order) {
                    vm.order_id = vm.order.order_id;
                }

                // loading.hide()
            }).catch().finally(function() {
                // Hide loading spinner whether our call succeeded or failed.
                // loading.hide();
            });
        }

        $scope.$watch(function() {
            return vm.order_id;
        }, function(newValue, oldValue) {
            vm.unreadCount = 0;
            if (configuration.env === 'pro') {
                firebase.database().ref('pro/chat/' + newValue)
                    .on('value', function(data) {
                        vm.chatMsgs = data.val();
                        if (vm.tab !== 5) {
                            angular.forEach(vm.chatMsgs, function(msgs) {
                                if (msgs.timestamp == Date.now()) {
                                    notificationService.msgNotifications();
                                }
                            });
                        }
                        if (!$scope.$$phase) {
                            $scope.$apply(function() {
                                vm.chatMsgs = data.val();
                                angular.forEach(vm.chatMsgs, function(msgs) {


                                    // notificationService.msgNotifications();

                                });
                            });
                        }

                        $ionicScrollDelegate.$getByHandle('chatScroll').scrollBottom(true);
                    });
            }

            if (configuration.env === 'dev') {
                firebase.database().ref('dev/chat/' + newValue)
                    .on('value', function(data) {
                        vm.chatMsgs = data.val();
                        if (vm.tab !== 5) {
                            angular.forEach(vm.chatMsgs, function(msgs) {
                                if (msgs.timestamp == Date.now()) {
                                    notificationService.msgNotifications();
                                }
                            });
                        }
                        if (!$scope.$$phase) {
                            $scope.$apply(function() {
                                vm.chatMsgs = data.val();
                                angular.forEach(vm.chatMsgs, function(msgs) {


                                    // notificationService.msgNotifications();

                                });
                            });
                        }

                        $ionicScrollDelegate.$getByHandle('chatScroll').scrollBottom(true);
                    });
            }

        });

        vm.showFilterBar = function() {
            var filterBarInstance = $ionicFilterBar.show({
                cancelText: "<i class='ion-ios-close-outline'></i>",
                items: vm.orders,
                update: function(filteredItems, filterText) {
                    vm.orders = filteredItems;
                }
            });
        };

        // function change_order_new_status(id) {
        //     var data = {
        //         order_id: id
        //     }
        //     OrderServices.change_order_new_status(data).then(function(res) {
        //         loading.hide();
        //         changeorder();
        //     }).catch().finally(function() {
        //         // Hide loading spinner whether our call succeeded or failed.
        //         loading.hide();
        //     });
        // }

        vm.viewOrderDetail = function(order, tab) {
            vm.tab = 1;
            vm.disablekotbtn = false;
            vm.riders = [];
            vm.checked = false;
            vm.order = order;
            angular.forEach(vm.kot_list, function(data) {
                if (data.kot_unique_id === vm.order.order_id) {
                    vm.disablekotbtn = true;
                }
            });
            vm.riders = vm.order.riders;
            vm.paid_by = vm.order.payment_method;
            vm.rider_id = vm.order.server_id;
            vm.estimated_time = vm.order.estimated_time;
            vm.discountRate = vm.order.discountRate;
            if (vm.order.is_payment_confirmed === 0) {
                vm.payment_status = false;
            } else if (vm.order.is_payment_confirmed === 0) {
                vm.payment_status == true;
            }
            vm.order_id = order.order_id;
            // change_order_new_status(order.order_id);
        };

        // vm.changOrder = function() {
        //     if (vm.tab = 1) {
        //         return true;
        //     } else {
        //         return false;
        //     }
        // }



        vm.statusClass = "";
        vm.orderStatusData = {
            'order_placed': false,
            'reject': false,
            'accept': false,
            'preparing': false,
            'delivery': false,
            'delivered': false
        };



        vm.statusClass = function(status) {
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
        vm.OrderStatus = function(status) {
            if (status == 0) {
                vm.NotallowFeedback = true;
                vm.orderStatusData = {
                    'order_placed': true,
                    'reject': false,
                    'accept': false,
                    'preparing': false,
                    'delivery': false,
                    'delivered': false
                };
                vm.statusClass = "placed_status";
                return "Order Placed";
            } else if (status == 1) {
                vm.NotallowFeedback = true;
                vm.orderStatusData = {
                    'order_placed': true,
                    'reject': true,
                    'accept': false,
                    'preparing': false,
                    'delivery': false,
                    'delivered': false
                };
                vm.statusClass = "reject_status";
                return "Reject";
            } else if (status == 2) {
                vm.NotallowFeedback = true;
                vm.orderStatusData = {
                    'order_placed': true,
                    'reject': false,
                    'accept': true,
                    'preparing': false,
                    'delivery': false,
                    'delivered': false
                };
                vm.statusClass = "accept_status";
                return "Accepted";
            } else if (status == 3) {
                vm.NotallowFeedback = true;
                vm.orderStatusData = {
                    'order_placed': true,
                    'reject': false,
                    'accept': true,
                    'preparing': true,
                    'delivery': false,
                    'delivered': false
                };
                vm.statusClass = "preparing_status";
                return "Preparing";
            } else if (status == 4) {
                vm.NotallowFeedback = true;
                vm.orderStatusData = {
                    'order_placed': true,
                    'reject': false,
                    'accept': true,
                    'preparing': true,
                    'delivery': true,
                    'delivered': false
                };
                vm.statusClass = "Delivery";
                return "Delivery";
            } else if (status == 5) {
                vm.NotallowFeedback = false;
                vm.orderStatusData = {
                    'order_placed': true,
                    'reject': false,
                    'accept': true,
                    'preparing': true,
                    'delivery': true,
                    'delivered': true
                };
                vm.statusClass = "delivered";
                return "Delivered";
            }
        };
        vm.OrderPayment = function(payment) {
            if (payment == 0) {
                return 'not paid';
            } else if (payment == 1) {
                return 'Paid';
            }
        };
        vm.onclickstatus = function(order_id, status) {


            var data = {
                order_id: order_id,
                status: status
            };
            if (vm.order.order_status <= data.status) {
                loading.show();
                vm.checked = false;
                if (vm.order.cashin_id === null || vm.order.checkin_id === 1 || vm.order.business_day_id === null) {
                    var order_status = {
                        order_id: order_id,
                        checkin_id: LocalStorage.get('CHECKIN_ID'),
                        cashin_id: LocalStorage.get('cashin_id'),
                        business_day_id: LocalStorage.get('DAYSTART').id
                    };
                    OrderServices.update_order_checkin_cashin_business_id(order_status).then(function(res) {
                        // changeorder();
                    });
                }

                //live updates
                function guid() {
                    function s4() {
                        return Math.floor((1 + Math.random()) * 0x10000)
                            .toString(16)
                            .substring(1);
                    }
                    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                        s4() + '-' + s4() + s4() + s4();
                }
                if (configuration.env === 'pro') {
                    firebase.database()
                        .ref('pro')
                        .child('venueorderupdate')
                        .child(currentUser.profile().venue_id)
                        .update({ 'id': guid() });
                }
                if (configuration.env === 'dev') {
                    firebase.database()
                        .ref('dev')
                        .child('venueorderupdate')
                        .child(currentUser.profile().venue_id)
                        .update({ 'id': guid() });
                }

                OrderServices.update_order_status(data).then(function(res) {
                    loading.hide();
                    if (res.data) {
                        if (configuration.env === 'pro') {
                            firebase.database()
                                .ref('pro')
                                .child('orders/' + data.order_id)
                                .set({ 'order_id': data.order_id, 'status': data.status });
                        }
                        if (configuration.env === 'dev') {
                            firebase.database()
                                .ref('dev')
                                .child('orders/' + data.order_id)
                                .set({ 'order_id': data.order_id, 'status': data.status });
                        }
                        // changeorder();
                    }
                }).catch().finally(function() {
                    loading.hide();
                });
            } else {
                vm.checked = false;
            }
        }

        //update Rider
        vm.updaterider = function(rider_id) {
                loading.show();

                var data = {
                    order_id: vm.order_id,
                    server_id: Number(rider_id)
                };
                // console.log(data);
                OrderServices.update_order_rider(data).then(function(res) {
                    if (res.data) {
                        // changeorder();
                    }
                }).catch().finally(function() {
                    loading.hide();
                });
            }
            // update payment status 
        vm.change_order_payment = function() {
            if (vm.payment_status === true) {
                loading.show();
                var data = {
                    order_id: vm.order_id,
                    payment_status: 1
                };
                OrderServices.change_order_payment(data).then(function(res) {
                    if (res.data) {
                        vm.order.is_payment_confirmed = 1;
                        //live updates
                        function guid() {
                            function s4() {
                                return Math.floor((1 + Math.random()) * 0x10000)
                                    .toString(16)
                                    .substring(1);
                            }
                            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                                s4() + '-' + s4() + s4() + s4();
                        }
                        if (configuration.env === 'pro') {
                            firebase.database()
                                .ref('pro')
                                .child('venueorderupdate')
                                .child(currentUser.profile().venue_id)
                                .update({ 'id': guid() });
                            changeorder();
                        }

                        if (configuration.env === 'dev') {
                            firebase.database()
                                .ref('dev')
                                .child('venueorderupdate')
                                .child(currentUser.profile().venue_id)
                                .update({ 'id': guid() });
                            changeorder();
                        }
                    }
                }).catch().finally(function() {
                    loading.hide();
                });
            }
        }

        // update estimated Time 
        vm.update_estimated_time = function(estimated_time) {
            loading.show();
            var data = {
                order_id: vm.order_id,
                estimated_time: estimated_time
            };
            OrderServices.update_estimated_time(data).then(function(res) {
                if (res.data) {
                    changeorder();
                }
            }).catch().finally(function() {
                loading.hide();
            });
        }

        vm.doRefresh = function() {
            OrderServices.orders(vm.page).then(function(res) {
                vm.orders = res.data.data;
                vm.numberOfItemsToDisplay = 12;
            }).catch().finally(function() {
                vm.$broadcast('scroll.refreshComplete');
            });
        };

        vm.loadMore = function() {
            vm.page += 1;
            OrderServices.orders(vm.platform, vm.orderType, vm.page).then(function(res) {

                var scrolOrder = res.data.data;
                if (scrolOrder.length > 0) {

                    angular.forEach(scrolOrder, function(itm) {
                        vm.orders.push(itm);
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

        vm.initMap = function() {
            var venueLatLng = new google.maps.LatLng(vm.order.venue_address.venue_latitude, vm.order.venue_address.venue_longitude);
            var mapOptions = {
                center: venueLatLng,
                zoom: 15,
                mapTypeId: google.maps.MapTypeId.ROADMAP,
            };
            var map = new google.maps.Map(document.getElementById("map"), mapOptions);
            vm.map = map;

            vm.setDirections(vm.order);

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

            if (vm.order.venue_address.venue_latitude !== '') {
                start = new google.maps.LatLng(vm.order.venue_address.venue_latitude, vm.order.venue_address.venue_longitude);
            } else {
                start = vm.order.venue_address.venue_address;
            }

            if (vm.order.customer_address.latitude !== '' && vm.order.customer_address.longitude !== '') {
                end = new google.maps.LatLng(vm.order.customer_address.latitude, vm.order.customer_address.longitude);
            } else {
                end = vm.order.customer_address.address;
            }
            var distance = google.maps.geometry.spherical.computeDistanceBetween(start, end);
            console.log(distance);
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

            if (vm.order.status === 4 && vm.mapLoaded) {
                if (configuration.env === 'pro') {
                    firebase.database().ref('pro/rider_location/' + vm.order_id)
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
                    firebase.database().ref('dev/rider_location/' + vm.order_id)
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

        vm.unreadCount = 0;
        vm.chatmsg = {
            'name': currentUser.profile().name + " - Manager",
            'type': 1,
            'msg': '',
            'timestamp': Date.now()
        };
        vm.chatMsgSend = function() {

            vm.chatmsg.timestamp = Date.now();
            if (vm.chatmsg.msg !== '') {
                if (configuration.env === 'pro') {
                    firebase.database()
                        .ref('pro')
                        .child('chat')
                        .child(vm.order_id)
                        .push(vm.chatmsg);
                }
                if (configuration.env === 'dev') {
                    firebase.database()
                        .ref('dev')
                        .child('chat')
                        .child(vm.order_id)
                        .push(vm.chatmsg);
                }
                vm.chatmsg.msg = '';

            }
        }



        vm.clearMsgcount = function() {
            vm.unreadCount = 0;
        }


        vm.order_search = '';
        vm.order_search_list = {};
        vm.showVal = function(value) {
            vm.spinner = true;
            if (value != '') {
                OrderServices.search_orders(value).then(function(res) {
                    vm.orders = res.data.data;
                    // vm.lengthOfItems = vm.orders.length;
                    vm.order = vm.orders[0];
                    vm.spinner = false;
                });
            }
        }
        vm.onSel = function(orderType) {
            vm.page = 0;
            vm.orderType = orderType;
            OrderServices.orders(vm.platform, vm.orderType, vm.page).then(function(res) {
                vm.orders = res.data.data;
                vm.orders_list = vm.orders;
                vm.lengthOfItems = vm.orders.length;
                vm.order = vm.orders[0];
                //vm.order_id = vm.order.order_id;
                // loading.hide();
            }).catch().finally(function() {
                // Hide loading spinner whether our call succeeded or failed.
                // loading.hide();
            });
        }

        vm.update_payment_method = function(payment_method) {
            loading.show();
            var data = {
                order_id: vm.order.order_id,
                payment_method: payment_method
            }
            OrderServices.update_payment_method(data).then(function(data) {
                loading.hide();
                changeorder();
            }, function(error) {
                loading.hide();
            });
        }
        vm.discountRate = 0;

        vm.applyDiscount = function() {
            var data = {
                order_id: vm.order.order_id,
                discountRate: vm.discountRate,
            };
            loading.show();
            OrderServices.update_discount(data).then(function(data) {
                // vm.order.amount = vm.order.amount - discount;
                if (data.data.status === false) {
                    ionicToast.show(data.data.msg, 'middle', false, 90000);
                }
                vm.order.discountRate = vm.discountRate;
                // vm.order.discount = discount;
                loading.hide();
                changeorder();
            }, function(error) {
                loading.hide();
            })
        }

        vm.onSelectPlatform = function(platform) {
            vm.page = 0;
            vm.platform = platform;
            OrderServices.orders(platform, vm.orderType, vm.page).then(function(res) {
                vm.orders = res.data.data;
                vm.orders_list = vm.orders;
                vm.lengthOfItems = vm.orders.length;
                vm.order = vm.orders[0];

                //vm.order_id = vm.order.order_id;
                // loading.hide();
            }).catch().finally(function() {
                // Hide loading spinner whether our call succeeded or failed.
                // loading.hide();
                changeorder();
            });
        }

        vm.sendToKitchen = function() {
            vm.order_kot = vm.order;
            var now = new Date();
            var olderDate = moment(now).add(vm.kot_time, 'minutes').toDate();
            vm.order_kot.kot_time = olderDate;
            vm.order_kot.items = vm.order_kot.items;
            PosServices.save_kot_online_order(vm.order);
            vm.disablekotbtn = true;
            if (PosServices.kot_list()) {
                vm.kot_list = PosServices.kot_list();
            } else {
                vm.kot_list = [];
            }
        }

        function calculateDistance(pointA, pointB) {
            // console.log(pointA.lat());
            // console.log(pointB);
            // http://www.movable-type.co.uk/scripts/latlong.html
            const lat1 = pointA.lat();
            const lon1 = pointA.lng();

            const lat2 = pointB.lat();
            const lon2 = pointB.lng();

            const R = 6371e3; // earth radius in meters
            const φ1 = lat1 * (Math.PI / 180);
            const φ2 = lat2 * (Math.PI / 180);
            const Δφ = (lat2 - lat1) * (Math.PI / 180);
            const Δλ = (lon2 - lon1) * (Math.PI / 180);

            const a = (Math.sin(Δφ / 2) * Math.sin(Δφ / 2)) +
                ((Math.cos(φ1) * Math.cos(φ2)) * (Math.sin(Δλ / 2) * Math.sin(Δλ / 2)));

            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

            const distance = R * c;
            return distance; // in meters
        }


        vm.printkot = function() {
            var onlineOrderBillPrint = angular.element(document.querySelector('#kot-bill-print-online-order'));
            PrinterServices.billPrint(onlineOrderBillPrint[0].innerHTML);
        }
        vm.printbill = function() {
            var onlineOrderBillPrint = angular.element(document.querySelector('#online-bill-print'));
            PrinterServices.billPrint(onlineOrderBillPrint[0].innerHTML);
        }


        vm.isCashIn = function() {

            if (!LocalStorage.get('isCashIn')) {
                var isCashInPopup = $ionicPopup.alert({
                    title: 'Cash-in is required!',
                    template: 'You must cash-in before starting sale'
                });
                isCashInPopup.then(function(res) {
                    $location.path('app/cashincashout');
                });
            }
        };
        vm.isDayStart = function() {
            if (!LocalStorage.get('ISDAYSTARTED')) {
                var isCashInPopup = $ionicPopup.alert({
                    title: 'Day Start is required!',
                    template: 'You must start business day before starting sale'
                });
                isCashInPopup.then(function(res) {
                    $location.path('app/bussinessday');
                });
            } else {
                vm.isCheckedIn();
            }
        }

        vm.isCheckedIn = function() {
            vm.check_in = LocalStorage.get('LAST_CHECKIN');
            if (LocalStorage.get('CHECKIN')) {
                vm.isCashIn();
            } else {
                var isCheckedInPopup = $ionicPopup.alert({
                    title: 'Check-in required!',
                    template: 'You must check-in before starting sale'
                });
                isCheckedInPopup.then(function(res) {
                    $location.path('app/checkincheckout');
                });
            }
        };

        vm.isDayStart();


    };
})();