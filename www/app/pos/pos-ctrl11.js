(function() {
    'use strict';

    angular.module('app')
        .controller('pos', ['$rootScope', '$scope', 'MenuServices', 'PosServices', 'modalService', 'LocalStorage', 'setting', '$ionicScrollDelegate', '$ionicPopup', '$ionicModal', 'ionicToast', '$window', pos]);

    function pos($rootScope, $scope, MenuServices, PosServices, modalService, LocalStorage, setting, $ionicScrollDelegate, $ionicPopup, $ionicModal, ionicToast, $window) {
        var vm = this;
        vm.viewHight = $window.innerHeight;
        vm.title = 'POS';
        vm.categories = null;
        vm.scroll_width = 0;
        vm.menu = {};
        vm.menu_title = '';
        vm.cart = {};
        vm.items = {};
        vm.getTotalItems = 0;
        vm.getSubTotal = 0;
        vm.totalCost = 0;
        vm.discount = 0;
        vm.discountRate = 0;
        vm.searchQuary = '';
        vm.tax = 0;
        vm.TaxRate = 0;
        vm.table_is_active = false;
        // vm.kot = false;
        vm.additional_instruction = "";
        vm.note = "";
        vm.kot_time = 30;
        vm.save_kot = 'KOT';
        vm.venue_detail = setting.venue_setting();
        vm.selected_customer = {
            customer_id: 1,
            venue_id: 1,
            first_name: "Walking",
            last_name: "Customer",
            email: "walking_customer@chickenbroast.com",
            mobile_number: "923466039503",
            date_of_birth: " ",
            device: null,
            UUID: null,
            status: 0,
            is_delete: "N",
            customer_version: 1,
            image_name: null,
            image_ext: null,
            new: 1,
            is_guest: 0,
            platform: "maduber_pos",
            verification_code: null,
            is_login: null,
            last_activity: null,
            token_expire: 0,
            remember_token: "$2y$10$wNH3sXmOYcg80NXt5XxPVOmtAnWcvbh2NLYqhbx3ydwIQR8Kgwdyq",
            created_at: "2018-01-02 11:38:32",
            updated_at: "2018-01-02 11:38:32",
            count_customer_voucher: 0,
            count_customer_unused_voucher: 0,
            count_customer_used_voucher: 0,
            customer_booked_tables: [],
            customer_vouchers: [],
            customer_address: [],
            customer_feedback: [],
            customer_orders: [],
            customer_orders_count: 0
        };

        function activate() {
            // if tax applied then get tax rate and set to pos
            if (setting.venue_setting()) {
                if (Number(setting.venue_setting().tax) > 0) {
                    vm.TaxRate = Number(setting.venue_setting().tax);
                    PosServices.setTaxRate(vm.TaxRate);
                } else {
                    vm.TaxRate = 0;
                }
            } else {
                vm.TaxRate = 0;
            }

            if (LocalStorage.get('selected_customer')) {
                vm.selected_customer = LocalStorage.get('selected_customer');
            }
            vm.servers = PosServices.get_servers();
            if (angular.isDefined(vm.servers)) {
                vm.server_id = vm.servers[0].id;
            } else {
                vm.servers = [];
                vm.server_id = 0;
            }
            vm.available_table_list = PosServices.available_table_list();
            if (angular.isDefined(vm.available_table_list)) {
                vm.table_id = vm.available_table_list[0].id;
            } else {
                vm.available_table_list = [];
                vm.table_id = 0;
            }

            vm.OrderTypes = PosServices.getOrderTypes();
            if (angular.isDefined(vm.OrderTypes)) {
                vm.orderType = vm.OrderTypes[0].slug;
                if (vm.orderType === 'dine-in') {
                    vm.table_is_active = true;
                    vm.table_id = PosServices.get_table();
                } else {
                    vm.table_is_active = false;
                    vm.table_id = 0;
                }
            } else {
                vm.OrderTypes = [];
                vm.orderType = 'dine-in';
            }



            vm.categories = MenuServices.categories();
            if (vm.categories) {
                var menudata = MenuServices.menuByCat(vm.categories[0].category_id);
                vm.title = menudata.category_name;
                vm.menu = menudata.menu;
                vm.cat_type = menudata.type;
            } else {
                vm.title = '';
                vm.menu = [];
                vm.cat_type = '';
            }
            vm.cart = PosServices.getPos();
            vm.items = vm.cart.items;
            if (vm.cart.kot_unique_id != "") {
                vm.save_kot = 'UPDATE KOT';
            };
            vm.getTotalItems = PosServices.getTotalItems();
            vm.getSubTotal = PosServices.getSubTotal();
            vm.totalCost = PosServices.totalCost();
            vm.tax = PosServices.getTax();
            $scope.hold_order_list = PosServices.hold_order_list();
            if (vm.cart.items.length > 0) {
                vm.table_id = vm.cart.table_id;
                vm.server_id = vm.cart.server_id;
                vm.additional_instruction = vm.cart.additional_instruction;
                vm.note = vm.cart.additional_instruction;
                vm.note = vm.cart.additional_instruction;
            }
        }

        activate();
        $scope.$on('$stateChangeSuccess', function() {
            activate();
        });

        vm.menu_by_cat = function(category_id) {
            vm.searchQuary = '';
            var menudata = MenuServices.menuByCat(category_id);
            vm.title = menudata.category_name;
            vm.menu = menudata.menu;
            vm.cat_type = menudata.type;
            $ionicScrollDelegate.$getByHandle('MenuItems').scrollTop();
        };

        vm.add_item = function(item) {
            if (item.prices.length > 1 || item.menu_options.length > 0) {
                modalService.setData(item);
                modalService.showModal();
            } else {
                item.quantity = 1;
                PosServices.addItem(item);
                vm.cart = PosServices.getPos();
                vm.items = vm.cart.items;
                vm.getTotalItems = PosServices.getTotalItems();
                vm.getSubTotal = PosServices.getSubTotal();
                PosServices.setDiscountRate(vm.discountRate);
                vm.discount = PosServices.getDiscount();
                vm.tax = PosServices.getTax();
                vm.totalCost = PosServices.totalCost();
                $ionicScrollDelegate.$getByHandle('CartItems').scrollBottom();
                $scope.hold_order_list = PosServices.hold_order_list();
            }
        };

        $rootScope.$on('itemAdded', function(event, data) {
            vm.discount = PosServices.getDiscount();
            vm.cart = PosServices.getPos();
            vm.items = vm.cart.items;
            vm.getTotalItems = PosServices.getTotalItems();
            vm.tax = PosServices.getTax();
            vm.getSubTotal = PosServices.getSubTotal();
            PosServices.setDiscountRate(vm.discountRate);
            vm.discount = PosServices.getDiscount();
            vm.totalCost = PosServices.totalCost();
            $ionicScrollDelegate.$getByHandle('CartItems').scrollBottom();
        });

        vm.option_price_count = function(id) {
            return PosServices.option_sum(id);
        };

        vm.QtyChange = function(id, quantity) {

            PosServices.QtyChange(id, quantity);
            vm.getTotalItems = PosServices.getTotalItems();
            PosServices.setDiscountRate(vm.discountRate);
            vm.discount = PosServices.getDiscount();
            vm.getSubTotal = PosServices.getSubTotal();
            vm.tax = PosServices.getTax();
            vm.totalCost = PosServices.totalCost();
        };

        vm.remove = function(id) {
            PosServices.removeItemById(id);
            vm.cart = PosServices.getPos();
            vm.items = vm.cart.items;
            vm.getTotalItems = PosServices.getTotalItems();
            vm.getSubTotal = PosServices.getSubTotal();
            PosServices.setDiscountRate(vm.discountRate);
            vm.discount = PosServices.getDiscount();
            vm.tax = PosServices.getTax();
            vm.totalCost = PosServices.totalCost();
            $ionicScrollDelegate.$getByHandle('CartItems').scrollBottom();
        };

        vm.searchItem = function() {
            if (vm.searchQuary.length > 0) {
                vm.title = 'Search Result for \"' + vm.searchQuary + '\"';
            } else {
                vm.title = 'All menu items';
            }

            vm.menu = MenuServices.menu_by_search(vm.searchQuary);
            $ionicScrollDelegate.$getByHandle('MenuItems').scrollTop();

        };

        ///////////////////////// SET Orders Type ////////////////////
        vm.setOrderType = function() {
            PosServices.setOrderType(vm.orderType);
            PosServices.setShippingType(vm.orderType);
            if (vm.orderType === 'dine-in') {
                vm.table_is_active = true;
                vm.table_id = PosServices.get_table();
            } else {
                vm.table_is_active = false;
                vm.table_id = 0;
            }
        };

        vm.cancelConfirmation = function() {

            var confirmPopup = $ionicPopup.confirm({
                title: 'Order Cancel',
                template: 'Are you sure you want to cancel this order?',
                buttons: [
                    { text: 'No' },
                    {
                        text: '<b>Yes</b>',
                        type: 'button-positive',
                        onTap: function() {
                            return 1;
                        }
                    }
                ]
            });

            confirmPopup.then(function(res) {
                if (res) {
                    PosServices.empty();
                    vm.save_kot = 'KOT';
                    vm.cart = PosServices.getPos();
                    vm.items = vm.cart.items;
                    vm.getTotalItems = PosServices.getTotalItems();
                    vm.getSubTotal = PosServices.getSubTotal();
                    vm.tax = PosServices.getTax();
                    activate();
                    vm.discountRate = 0;
                    PosServices.setDiscountRate(vm.discountRate);
                    vm.discount = PosServices.getDiscount();
                    vm.totalCost = PosServices.totalCost();
                    PosServices.setOrderType(vm.orderType);
                    PosServices.set_server(vm.server_id);
                    $ionicScrollDelegate.$getByHandle('CartItems').scrollBottom();
                    $scope.hold_order_list = PosServices.hold_order_list();

                } else {

                }
            });
        };

        vm.applyDiscount = function() {
            PosServices.setDiscountRate(vm.discountRate);
            vm.discount = PosServices.getDiscount();
            vm.cart = PosServices.getPos();
            vm.items = vm.cart.items;
            vm.getTotalItems = PosServices.getTotalItems();
            vm.tax = PosServices.getTax();
            vm.getSubTotal = PosServices.getSubTotal();
            vm.totalCost = PosServices.totalCost();
        };

        vm.selectCustomer = function() {
            $ionicModal.fromTemplateUrl('app/pos/select_customer_modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                vm.modalCustomer = modal;
                $scope.customers = vm.selected_customer;
                $scope.search_customer_list = false;
                vm.modalCustomer.show();
            });
        };

        vm.hideCustomerModal = function() {
            vm.modalCustomer.hide();
        };

        vm.hold_bill = function() {
            var confirmPopup = $ionicPopup.confirm({
                title: 'Hold Order',
                template: 'Are you sure you want to Hold this order?',
                buttons: [
                    { text: 'No' },
                    {
                        text: '<b>Yes</b>',
                        type: 'button-positive',
                        onTap: function() {
                            return 1;
                        }
                    }
                ]
            });
            confirmPopup.then(function(res) {
                if (res) {
                    PosServices.hold_order();
                    PosServices.empty();
                    vm.save_kot = 'KOT';
                    vm.cart = PosServices.getPos();
                    vm.items = vm.cart.items;
                    vm.getTotalItems = PosServices.getTotalItems();
                    vm.getSubTotal = PosServices.getSubTotal();
                    vm.tax = PosServices.getTax();
                    activate();
                    hold_order_firebase();
                    vm.discount = PosServices.getDiscount();
                    vm.totalCost = PosServices.totalCost();
                    PosServices.setOrderType(vm.orderType);
                    PosServices.set_server(vm.server_id);
                    $scope.hold_order_list = PosServices.hold_order_list();
                    $ionicScrollDelegate.$getByHandle('CartItems').scrollBottom();
                }
            });
        };

        vm.showHoldOrderList = function(mode) {
            vm.mode = mode;
            $scope.hold_order_list = PosServices.hold_order_list();
            if (vm.mode === 'order_post') {

            } else if (vm.mode === 'order_list') {
                $ionicModal.fromTemplateUrl('app/pos/hold_order_list.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function(modal) {
                    vm.modal = modal;
                    vm.modal.show();
                });
            }
        };

        $scope.hold_order_back = function(id) {

            if (PosServices.getTotalItems() > 0) {
                var confirmEmptyCart = $ionicPopup.confirm({
                    title: 'Cart is not empty!',
                    template: 'Are you sure you want to cancel current cart order?',
                    buttons: [
                        { text: 'No' },
                        {
                            text: '<b>Yes</b>',
                            type: 'button-positive',
                            onTap: function() {
                                return 1;
                            }
                        }
                    ]
                });

                confirmEmptyCart.then(function(res) {
                    if (res) {
                        var order = PosServices.hold_order_back(id);
                        PosServices.restore(order);
                        vm.cart = PosServices.getPos();
                        vm.items = vm.cart.items;
                        vm.getTotalItems = PosServices.getTotalItems();
                        vm.getSubTotal = PosServices.getSubTotal();
                        vm.discount = PosServices.getDiscount();
                        vm.tax = PosServices.getTax();
                        vm.discountRate = vm.cart.discountRate;
                        vm.totalCost = PosServices.totalCost();
                        $ionicScrollDelegate.$getByHandle('CartItems').scrollBottom();
                        $scope.hold_order_list = PosServices.hold_order_list();
                        hold_order_firebase();
                        vm.modal.hide();
                    }
                });
            } else {
                var order = PosServices.hold_order_back(id);
                PosServices.restore(order);
                vm.cart = PosServices.getPos();
                vm.items = vm.cart.items;
                vm.getTotalItems = PosServices.getTotalItems();
                vm.getSubTotal = PosServices.getSubTotal();
                vm.discount = PosServices.getDiscount();
                vm.tax = PosServices.getTax();
                vm.discountRate = vm.cart.discountRate;
                vm.totalCost = PosServices.totalCost();
                $ionicScrollDelegate.$getByHandle('CartItems').scrollBottom();
                $scope.hold_order_list = PosServices.hold_order_list();
                vm.modal.hide();
            }
        };


        function hold_order_firebase() {
            var list = PosServices.hold_order_list();
            firebase.database()
                .ref('hold_order_list')
                .remove();
            angular.forEach(list, function(order) {
                console.log(JSON.stringify(order));
                firebase.database()
                    .ref('hold_order_list')
                    .push(JSON.stringify(order));
            });
        };

        ////////////////////////////////////////////////////////////////////
        vm.hold_table_order = function() {
            vm.table_id = PosServices.get_table();
            if (vm.table_id) {
                var confirmTablePopup = $ionicPopup.confirm({
                    title: 'Hold order on table # ' + vm.table_id,
                    template: 'Are you sure you want to hold this order on table # ' + vm.table_id + '?',
                    buttons: [
                        { text: 'No' },
                        {
                            text: '<b>Yes</b>',
                            type: 'button-positive',
                            onTap: function() {
                                return 1;
                            }
                        }
                    ]
                });


                ///////////////////////////// KOT///////////////////////////////

                $ionicModal.fromTemplateUrl('app/pos/kot-modal.html', {
                    scope: $scope,
                    animation: 'slide-in-up'
                }).then(function(modal) {
                    vm.kot_modal = modal;
                });

                vm.kot = function() {
                    $scope.cart = PosServices.getPos();
                    vm.kot_modal.show();
                };

                $scope.kotModalHide = function() {
                    vm.kot_modal.hide();
                };

                $scope.saveKOT = function() {
                    console.log(vm.kot_time);
                    console.log("hello");
                    var now = new Date();
                    // Sun Jan 22 2017 17:12:18 GMT+0200 ...
                    var olderDate = moment(now).add(vm.kot_time, 'minutes').toDate();
                    // console.log(olderDate);
                    PosServices.set_kot_time(olderDate);
                    // var printer_name = LocalStorage.get('kot_printer_detail').printer_name;
                    // var contents = currentWebContents;
                    // contents.print({ silent: true, deviceName: printer_name });
                    // vm.cart.kot_time = olderDate;
                    console.log(vm.cart);
                    PosServices.save_kot();
                    vm.kot_modal.hide();
                    PosServices.empty();
                    vm.save_kot = 'KOT';
                    vm.cart = PosServices.getPos();
                    vm.items = vm.cart.items;
                    vm.getTotalItems = PosServices.getTotalItems();
                    vm.getSubTotal = PosServices.getSubTotal();
                    vm.tax = PosServices.getTax();
                    activate();
                    vm.discountRate = 0;
                    PosServices.setDiscountRate(vm.discountRate);
                    vm.discount = PosServices.getDiscount();
                    vm.totalCost = PosServices.totalCost();
                    $ionicScrollDelegate.$getByHandle('CartItems').scrollBottom();
                    $scope.hold_order_list = PosServices.hold_order_list();
                    vm.table_id = 0;
                    vm.additional_instruction = '';
                    vm.note = '';
                    PosServices.setOrderType(vm.orderType);
                    PosServices.set_server(vm.server_id);
                    $scope.customers = {};

                };

                $rootScope.$on('kotBack', function(event, data) {
                    activate();
                    vm.discount = PosServices.getDiscount();
                    vm.cart = PosServices.getPos();
                    vm.table_id = vm.cart.table_id;
                    PosServices.set_table(vm.table_id);
                    vm.server_id = vm.cart.server_id;
                    vm.orderType = vm.cart.order_type;
                    PosServices.setOrderType(vm.orderType);
                    if (vm.orderType === 'dine-in') {
                        vm.table_is_active = true;
                        vm.table_id = PosServices.get_table();
                    } else {
                        vm.table_is_active = false;
                        vm.table_id = 0;
                    }
                    vm.additional_instruction = vm.cart.additional_instruction;
                    vm.note = vm.cart.additional_instruction;
                    $scope.customers = vm.cart.customers;
                    vm.items = vm.cart.items;
                    vm.getTotalItems = PosServices.getTotalItems();
                    vm.tax = PosServices.getTax();
                    vm.getSubTotal = PosServices.getSubTotal();
                    PosServices.setDiscountRate(vm.discountRate);
                    vm.discount = PosServices.getDiscount();
                    vm.totalCost = PosServices.totalCost();

                    $ionicScrollDelegate.$getByHandle('CartItems').scrollBottom();

                });

            } else {

            }
        };



        $rootScope.$on('kotBack', function(event, data) {
            activate();
            vm.discount = PosServices.getDiscount();
            vm.cart = PosServices.getPos();
            vm.table_id = vm.cart.table_id;
            PosServices.set_table(vm.table_id);
            vm.server_id = vm.cart.server_id;
            vm.orderType = vm.cart.order_type;
            PosServices.setOrderType(vm.orderType);
            if (vm.orderType === 'dine-in') {
                vm.table_is_active = true;
                vm.table_id = PosServices.get_table();
            } else {
                vm.table_is_active = false;
                vm.table_id = 0;
            }
            vm.additional_instruction = vm.cart.additional_instruction;
            vm.note = vm.cart.additional_instruction;
            $scope.customers = vm.cart.customers;
            vm.items = vm.cart.items;
            vm.getTotalItems = PosServices.getTotalItems();
            vm.tax = PosServices.getTax();
            vm.getSubTotal = PosServices.getSubTotal();
            PosServices.setDiscountRate(vm.discountRate);
            vm.discount = PosServices.getDiscount();
            vm.totalCost = PosServices.totalCost();

            $ionicScrollDelegate.$getByHandle('CartItems').scrollBottom();

        });

        ////////////////////// checkout ///////////////////////

        vm.checkoutModal = function() {
            $ionicModal.fromTemplateUrl('app/pos/payment_model.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                vm.modal = modal;
                vm.modal.show();
                $scope.cart_detail = PosServices.getPos();
            });
        }
        vm.payment_by = 'cash';
        vm.set_payment_method = function(payment_method) {
            vm.cart.payment_method = payment_method;
        }
        $scope.saveOrder = function() {

            vm.cart.items = JSON.stringify(vm.cart.items);
            vm.cart.is_payment_confirmed = 0;
            if (!vm.cart.payment_method) {
                vm.cart.payment_method = vm.payment_by;
            }
            MenuServices.placeOrder(vm.cart)
                .then(function(res) {
                    PosServices.empty();
                    vm.save_kot = 'KOT';
                    vm.cart = PosServices.getPos();
                    vm.items = vm.cart.items;
                    vm.getTotalItems = PosServices.getTotalItems();
                    vm.getSubTotal = PosServices.getSubTotal();
                    vm.tax = PosServices.getTax();
                    vm.discountRate = 0;
                    PosServices.setDiscountRate(vm.discountRate);
                    vm.discount = PosServices.getDiscount();
                    vm.totalCost = PosServices.totalCost();
                    PosServices.setOrderType(vm.orderType);
                    PosServices.set_server(vm.server_id);
                    $ionicScrollDelegate.$getByHandle('CartItems').scrollBottom();
                    $scope.hold_order_list = PosServices.hold_order_list();
                    vm.modal.hide();
                }).catch()
                .finally(function() {
                    // Hide loading spinner whether our call succeeded or failed.
                });
        }

        $scope.close = function() {
                vm.modal.hide();
            }
            ///////////////////// customer search ///////////////////
        $scope.search_customer_list = false;
        $scope.customer_name = '';
        $scope.customers_search = {};
        $scope.showVal = function(value) {
            $scope.spinner = true;
            MenuServices.search_customers(value).then(function(res) {
                $scope.spinner = false;
                $scope.customers_search = res.data.data;
                console.log($scope.customers_search);
                $scope.search_customer_list = true;
            })
        }

        $scope.setCustomer = function(customer) {
            vm.selected_customer = customer;
            LocalStorage.add('selected_customer', customer);
            //vm.modal.hide();
            $scope.search_customer_list = false;
        }


        vm.emptySearch = function() {
            vm.searchQuary = '';
            vm.searchItem();
        };

        ///////////// set Table //////////////
        vm.setTable = function() {
            PosServices.set_table(vm.table_id);
        };


        ////////////////// server ///////////////////////////
        vm.set_server = function(server_id) {
            PosServices.set_server(server_id);
        }

        vm.setAddressId = function(id) {
            PosServices.set_address_id(id);
            vm.modal.hide();
        }

        ////////////////////////// note or additional instruction /////////////////

        $ionicModal.fromTemplateUrl('app/pos/note-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            $scope.note_modal = modal;
        });

        vm.set_note = function() {
            $scope.note_modal.show();
        };

        vm.hideNoteModal = function() {
            $scope.note_modal.hide();
        };

        vm.CancelNote = function() {
            vm.additional_instruction = "";
            vm.note = "";
            PosServices.set_note('');
            vm.hideNoteModal();
        };
        vm.saveNote = function() {
            vm.additional_instruction = vm.note;
            PosServices.set_note(vm.note);
            vm.hideNoteModal();
        };

        vm.return_amount = 0;
        vm.exact_amount = 0;
        vm.total_amount = 0;
        vm.total_exact = function(amount) {
            $scope.cart_detail = PosServices.getPos();
            vm.exact_amount = $scope.cart_detail.total;

        }
        vm.calculateReturn = function(amount) {
            $scope.cart_detail = PosServices.getPos();
            vm.total_amount = $scope.cart_detail.total;
            vm.return_amount = vm.total_amount - amount;
        }


        vm.selected_area = {};

        // vm.address = {
        //   customer_id: vm.selected_customer.customer_id,
        //   title: null,
        //   addressLine1: '',
        //   addressLine2: '',
        //   city: vm.SETTING.city,
        //   postal_code: '54000',
        //   latitude: '',
        //   longitude: '',
        //   area_id: 0
        // };
        vm.getMapLocation = function() {
            loading.show()
            navigator.geolocation.getCurrentPosition(onMapSuccess, onMapError, { enableHighAccuracy: true });
        }

        var onMapSuccess = function(position) {
            console.log("getting loc succ");
            var Latitude = position.coords.latitude;
            var Longitude = position.coords.longitude;

            console.log(Latitude, Longitude);
            vm.address.latitude = Latitude;
            vm.address.longitude = Longitude;
            vm.map.center = vm.address.latitude + ", " + vm.address.longitude;
            vm.map.zoom = 16;
            loading.hide();
        }

        vm.map = {
            center: setting.venue_setting().city, //vm.address.latitude + ", " + vm.address.longitude
            zoom: 12
        };


        vm.markerPosition = function(event) {
            vm.address.latitude = event.latLng.lat();
            vm.address.longitude = event.latLng.lng();
            vm.map.center = vm.address.latitude + ", " + vm.address.longitude;
            vm.map.zoom = 18;
        };

        vm.selectd_area = function() {


            //var selected = '';
            //angular.forEach( vm.SETTING.delivery_areas, function (area) {
            //    if (area.area_name ==  vm.address.addressLine2) {
            //        selected = area;
            //    }
            //});
            vm.address.addressLine2 = vm.selected_area.area_name;
            vm.address.delivery_area_id = vm.selected_area.id;
            console.log(vm.address.delivery_area_id);
            vm.getLocation();
        };


        vm.getLocation = function() {
            var completeAddress = "";

            if (vm.address.addressLine1 != null) {
                completeAddress = vm.address.addressLine1;
            }
            if (vm.address.addressLine2 != null) {
                completeAddress += ", " + vm.address.addressLine2;
            }
            if (vm.address.city != null) {
                completeAddress += ", " + vm.address.city;
            }
            if (vm.address.postal_code != null) {
                completeAddress += ", Pakistan";
            }

            vm.map.center = completeAddress;
            vm.map.zoom = 17;

        };
        vm.removeAddressForm = false;
        vm.setfalse = true;

        vm.addNewAddress = function() {
            vm.newaddress = true;
            vm.removeAddressForm = true;
            vm.setfalse = false;


            ///empty customers fields
            vm.customer_address1 = '';
            vm.customer_city = '';
            vm.customer_postcode = '';
            vm.Addresstitle = '';


        };

        vm.moveback = function() {
            vm.newaddress = false;
            vm.removeAddressForm = false;
            vm.setfalse = true;

            ///empty customers fields
            vm.customer_address1 = '';
            vm.customer_city = '';
            vm.customer_postcode = '';
            vm.Addresstitle = '';


        };

        vm.customer_address1 = '';
        vm.customer_city = setting.venue_setting().city;
        vm.customer_postcode = setting.venue_setting().zip;
        vm.Addresstitle = '';
        vm.delivery_area_id = '';
        vm.customer_spinner = false;


        vm.addNewCustomer = function() {
            vm.customerdata = {
                addressLine1: vm.customer_address1,
                city: vm.customer_city,
                postal_code: vm.customer_postcode,
                Addresstitle: vm.title,
                delivery_area_id: vm.delivery_area_id,
                customer_id: vm.selected_customer.customer_id,
            };

            vm.customer_spinner = true;
            MenuServices.save_customerAddress(vm.customerdata).then(function(res) {
                vm.customer_spinner = false;
                vm.removeAddressForm = false;
                vm.newaddress = false;
                vm.setfalse = true;


                ///empty customers fields
                vm.customer_address1 = '';
                vm.customer_city = '';
                vm.customer_postcode = '';
                vm.Addresstitle = '';

            });
        }
    }


})();