(function() {
    'use strict';
    angular.module('app')
        .controller("PosOrderCtrl", PosOrderCtrl);

    PosOrderCtrl.$inject = ["$scope", '$window', "configuration", "CHECKPIN", "PrinterServices", "setting", "OrderServices", "$ionicModal", "loading", 'LocalStorage', '$ionicPopup', '$ionicTabsDelegate', '$ionicScrollDelegate', 'currentUser'];

    function PosOrderCtrl($scope, $window, configuration, CHECKPIN, PrinterServices, setting, OrderServices, $ionicModal, loading, LocalStorage, $ionicPopup, $ionicTabsDelegate, $ionicScrollDelegate, currentUser) {
        var vm = this;

        vm.venue_detail = setting.venue_setting();
        vm.checked = true;
        vm.order = [];
        vm.orders = [];
        vm.viewHight = $window.innerHeight;
        vm.noMoreItemsAvailable = true;
        vm.numberOfItemsToDisplay = 12;
        vm.lengthOfItems = 20;
        vm.chatMsgs = {};
        vm.order_id = 0;
        vm.rider_id = 1;
        vm.tab = 1;
        vm.page = 0;
        vm.order_type = [{
            id: 0,
            type: "Filter by type",
            slug: '',
            created_at: "2017-12-19 06:54:38",
            updated_at: "-0001-11-30 00:00:00"
        }];
        angular.forEach(LocalStorage.get("Order_type"), function(type) {
            vm.order_type.push(type);
        });

        vm.orderType = vm.order_type[0].slug;
        vm.platforms = [{
            id: 1,
            value: 'pos',
            name: 'POS'
        }];
        vm.platform = vm.platforms[0].value;
        vm.feedbackdata = {
            "isFeedback": false,
            "quality": 1,
            "service": 1,
            "value": 1,
            "feedback": ""
        };
        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            if (toState.name == 'app.posorders') {
                activate();
            }

        });

        if (configuration.env === 'pro') {
            firebase.database()
                .ref('pro/orders')
                .on('value', function(data) {
                    // changeorder();
                });
            firebase.database().ref('pro/venueorderupdate/' + currentUser.profile().venue_id)
                .on('value', function(data) {
                    // changeorder();
                });
        }

        if (configuration.env === 'dev') {
            firebase.database()
                .ref('dev/orders')
                .on('value', function(data) {
                    // changeorder();
                });
            firebase.database().ref('dev/venueorderupdate/' + currentUser.profile().venue_id)
                .on('value', function(data) {
                    // changeorder();
                });
        }

        function activate() {
            vm.page = 0;
            if (LocalStorage.get("kot_printer_detail")) {
                vm.kot_print_header = LocalStorage.get("kot_printer_detail").printer_header;
                vm.kot_print_footer = LocalStorage.get("kot_printer_detail").printer_footer;
            }
            if (LocalStorage.get("billing_printer_detail")) {
                vm.bill_print_header = LocalStorage.get("billing_printer_detail").printer_header;
                vm.bill_print_footer = LocalStorage.get("billing_printer_detail").printer_footer;
            }
            loading.show();
            OrderServices.posorders(vm.orderType, vm.page).then(function(res) {
                vm.orders = res.data.data;
                vm.orders_list = vm.orders;

                vm.lengthOfItems = vm.orders.length;
                for (var i = 0; i < vm.orders.length; i++) {
                    if (vm.orders[i].status != 1) {
                        console.log(vm.orders[i]);
                        vm.order = vm.orders[i];
                        i = vm.lengthOfItems + 1;
                    }
                }

                for (var i = 0; i < vm.order.order_detail.length; i++) {
                    if (vm.order.order_detail[i].menu_options_object != null)
                        vm.order.order_detail[i].menu_options_object = JSON.parse(vm.order.order_detail[i].menu_options_object);
                }
                vm.order_id = vm.order.order_id;
                loading.hide();
            }).catch().finally(function() {
                // Hide loading spinner whether our call succeeded or failed.
                loading.hide();
            });
        }



        vm.showFilterBar = function() {
            var filterBarInstance = $ionicFilterBar.show({
                cancelText: "<i class='ion-ios-close-outline'></i>",
                items: vm.orders,
                update: function(filteredItems, filterText) {
                    vm.orders = filteredItems;
                }
            });
        };

        function change_order_new_status(id) {
            var data = {
                order_id: id
            }
            OrderServices.change_order_new_status(data).then(function(res) {
                loading.hide();
            }).catch().finally(function() {
                // Hide loading spinner whether our call succeeded or failed.
                loading.hide();
            });
        }

        vm.viewOrderDetail = function(order, tab) {
            vm.tab = 1;
            vm.checked = false;
            vm.order = order;
            for (var i = 0; i < vm.order.order_detail.length; i++) {
                if (vm.order.order_detail[i].menu_options_object != null)
                    vm.order.order_detail[i].menu_options_object = JSON.parse(vm.order.order_detail[i].menu_options_object);
            }
            vm.order_id = order.order_id;
            // change_order_new_status(order.order_id);
        };

        vm.changOrder = function() {
            if (vm.tab = 1) {
                return true;
            } else {
                return false;
            }
        }



        vm.statusClass = "";
        vm.orderStatusData = {
            'order_placed': false,
            'reject': false,
            'accept': false,
            'preparing': false,
            'delivery': false,
            'delivered': false
        };

        vm.OrderStatus = function(status) {

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
            loading.show();
            var data = {
                order_id: order_id,
                status: status
            };

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

            // firebase.database()
            //     .ref('venueorderupdate')
            //     .child(currentUser.profile().venue_id)
            //     .update({ 'id': guid() });


            OrderServices.update_order_status(data).then(function(res) {
                loading.hide();
                if (res.data) {
                    // firebase.database()
                    //     .ref('orders/' + data.order_id)
                    //     .set({ 'order_id': data.order_id, 'status': data.status });
                    vm.checked = false;
                    activate();
                }
            }).catch().finally(function() {
                loading.hide();
            });
        }

        // update rider 
        vm.updaterider = function(rider_id) {
            loading.show();
            var data = {
                order_id: vm.order_id,
                rider_id: rider_id
            };
            OrderServices.update_order_rider(data).then(function(res) {
                if (res.data) {
                    activate();
                }
            }).catch().finally(function() {
                loading.hide();
            });
        }

        // update payment status 
        vm.updaterider = function(rider_id) {
            loading.show();
            var data = {
                order_id: vm.order_id,
                rider_id: rider_id
            };
            OrderServices.update_order_rider(data).then(function(res) {
                if (res.data) {
                    activate();
                }
            }).catch().finally(function() {
                loading.hide();
            });
        }

        // update payment status 
        vm.change_order_payment = function(payment_status) {
            loading.show();
            var data = {
                order_id: vm.order_id,
                payment_status: payment_status
            };
            OrderServices.change_order_payment(data).then(function(res) {
                if (res.data) {
                    activate();
                }
            }).catch().finally(function() {
                loading.hide();
            });
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
                    activate();
                }
            }).catch().finally(function() {
                loading.hide();
            });
        }
        vm.doRefresh = function() {
            OrderServices.posorders(vm.page).then(function(res) {
                vm.orders = res.data.data;
                vm.numberOfItemsToDisplay = 12;
            }).catch().finally(function() {
                vm.$broadcast('scroll.refreshComplete');
            });
        };

        vm.loadMore = function() {
            vm.page += 1;
            OrderServices.posorders(vm.orderType, vm.page).then(function(res) {

                var scrolOrder = res.data.data;
                if (scrolOrder.length) {
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
                // firebase.database().ref('rider_location/' + vm.order_id)
                //     .on('value', function(data) {
                //         vm.rider_location = data.val();
                //         if (vm.rider_location) {
                //             var riderPosition = new google.maps.LatLng(vm.rider_location.latitude, vm.rider_location.longitude);

                //             var riderIcon = {
                //                 path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
                //                 fillColor: '#e8202d',
                //                 fillOpacity: 0.8,
                //                 strokeColor: '#e8202d',
                //                 strokeOpacity: 0.4,
                //                 scale: 5
                //             };
                //             if (angular.isNumber(vm.rider_location.heading)) {
                //                 riderIcon.rotation = vm.rider_location.heading;
                //                 vm.map.setHeading(vm.rider_location.heading);
                //             }
                //             vm.start_marker.setIcon(riderIcon);

                //             vm.start_marker.setPosition(riderPosition);

                //             var request = {
                //                 origin: riderPosition,
                //                 destination: end,
                //                 travelMode: 'DRIVING'
                //             };
                //             directionsService.route(request, function(response, status) {
                //                 if (status === google.maps.DirectionsStatus.OK) {
                //                     directionsDisplay.setDirections(response);

                //                 }
                //             });
                // if(angular.isNumber(vm.rider_location.heading)){
                //   vm.map.setHeading(vm.rider_location.heading);
                // }
                //     }
                // });
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
            // firebase.database()
            //     .ref('chat')
            //     .child(vm.order_id)
            //     .push(vm.chatmsg);
            vm.chatmsg.msg = '';
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
            if (value === '') {
                OrderServices.posorders(vm.orderType, vm.page).then(function(res) {
                    vm.orders = res.data.data;
                    vm.orders_list = vm.orders;

                    vm.lengthOfItems = vm.orders.length;
                    for (var i = 1; i < vm.orders.length; i++) {
                        if (vm.orders[i].status != 1) {
                            console.log(vm.orders[i]);
                            vm.order = vm.orders[i];
                            i = vm.lengthOfItems + 1;
                        }
                    }

                    for (var i = 0; i < vm.order.order_detail.length; i++) {
                        if (vm.order.order_detail[i].menu_options_object != null)
                            vm.order.order_detail[i].menu_options_object = JSON.parse(vm.order.order_detail[i].menu_options_object);
                    }
                    vm.order_id = vm.order.order_id;
                }).catch().finally(function() {
                    // Hide loading spinner whether our call succeeded or failed.
                });
            }
        }
        vm.onSel = function(orderType) {
            vm.page = 0;
            vm.orderType = orderType;
            OrderServices.posorders(vm.orderType, vm.page).then(function(res) {
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

        vm.onSelectServer = function(platform) {
            vm.page = 1;
            vm.platform = platform;
            OrderServices.posorders(vm.orderType, vm.page).then(function(res) {
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
        vm.cancelOrder = function(order_id) {
            var data = {
                    order_id: order_id,
                    status: 1,
                    user_id: LocalStorage.get('USER').user_id,
                    business_day_id: LocalStorage.get('DAYSTART').id,
                    cashin_id: LocalStorage.get('cashin_id')
                }
                // $ionicPopup.prompt({
                //     title: 'Enter your secret PIN',
                //     subTitle: '',
                //     inputType: 'password',
                //     inputPlaceholder: 'Your password'
                // }).then(function(res) {
                //     console.log(res);
                //     if (parseInt(res) === LocalStorage.get('USER').pin) {
                //         OrderServices.update_order_status(data).then(function(res) {
                //             // alert('Order has been cancelld');
                //             activate();
                //         });
                //     } else {

            //         // alert('wrong PIN');
            //     }

            // });

            console.log(CHECKPIN.prompt());

        }

        vm.printBill = function() {
            $ionicPopup.prompt({
                title: 'Enter your secret PIN',
                subTitle: '',
                inputType: 'password',
                inputPlaceholder: 'Your password'
            }).then(function(res) {
                if (parseInt(res) === currentUser.profile().pin) {
                    var posOrderBillPrint = angular.element(document.querySelector('#posOrder-bill-print'));
                    PrinterServices.reportsPrint(posOrderBillPrint[0].innerHTML).then(function() {});
                } else {

                    alert('wrong PIN');
                }
            });

        }
    };
})();