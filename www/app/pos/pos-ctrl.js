(function() {
    'use strict';

    angular.module('app')
        .controller('pos', ['$rootScope', "$http", 'configuration', 'CHECKPIN', 'CustomersServices', 'currentUser', '$scope', 'webFrame', 'MenuServices', 'PosServices', 'modalService', 'LocalStorage', 'setting', '$ionicScrollDelegate', '$ionicPopup', '$ionicModal', 'ionicToast', '$window', 'PrinterServices', 'PosOrderService', '$location', 'NgMap', pos]);

    function pos($rootScope, $http, configuration, CHECKPIN, CustomersServices, currentUser, $scope, webFrame, MenuServices, PosServices, modalService, LocalStorage, setting, $ionicScrollDelegate, $ionicPopup, $ionicModal, ionicToast, $window, PrinterServices, PosOrderService, $location, NgMap) {

        /*-------------------------------
         * Initializing POS
         * -------------------------------
         * */



        var vm = this;
        vm.viewHight = $window.innerHeight;
        vm.title = 'POS';
        vm.hideOrderSubmitButton = false;
        vm.categories = null;
        vm.customer_address = [];
        vm.delivery_areas = [];
        vm.scroll_width = 0;
        vm.customer_id = 0;
        vm.selected_customer = {};
        vm.menu = {};
        vm.menu_title = '';
        vm.cart = {};
        vm.items = {};
        vm.getTotalItems = 0;
        vm.address_id = 0;
        vm.getSubTotal = 0;
        vm.totalCost = 0;
        vm.discount = 0;
        vm.discountRate = 0;
        vm.searchQuary = '';
        vm.tax = 0;
        vm.TaxRate = 0;
        vm.table_is_active = false;
        vm.kot = false;
        vm.additional_instruction = "";
        vm.note = "";
        vm.save_kot = 'KOT';
        vm.server_name = '';
        $scope.payment_method = 'cash';
        vm.BillReceipt = true;
        vm.KotReceipt = true;
        vm.sendToKitchen = true;
        vm.is_payment_confirmed = 0;
        vm.kot_time = 10;
        vm.venue_detail = setting.venue_setting();
        vm.date = new Date();




        function init() {

            if (LocalStorage.get('selected_customer') && angular.isObject(LocalStorage.get('selected_customer'))) {
                // console.log(LocalStorage.get('selected_customer'));
                vm.selected_customer = LocalStorage.get('selected_customer');
                PosServices.setCustomerID(vm.selected_customer.customer_id);
                PosServices.set_customer_detail(vm.selected_customer);
            } else {
                vm.selected_customer = setWalkingCustomer();
                PosServices.setCustomerID(vm.selected_customer.customer_id);
                // PosServices.set_customer_detail(vm.selected_customer);
            }
            //console.log(vm.venue_detail.delivery_areas);
            if (vm.venue_detail.delivery_areas) {
                vm.delivery_areas = vm.venue_detail.delivery_areas;
            }

            if (PosServices.getCustomerID()) {
                vm.customer_id = PosServices.getCustomerID();
            }
            if (LocalStorage.get("kot_printer_detail")) {
                vm.kot_print_header = LocalStorage.get("kot_printer_detail").printer_header;
                vm.kot_print_footer = LocalStorage.get("kot_printer_detail").printer_footer;
            }
            if (LocalStorage.get("billing_printer_detail")) {
                vm.bill_print_header = LocalStorage.get("billing_printer_detail").printer_header;
                vm.bill_print_footer = LocalStorage.get("billing_printer_detail").printer_footer;
            }
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

            vm.servers = PosServices.get_servers();
            if (angular.isDefined(vm.servers) && vm.servers.length != []) {
                vm.server_name = vm.servers[0].name;
                vm.server_id = vm.servers[0].id;
            } else {
                vm.servers = [];
                vm.server_id = 0;
            }
            vm.available_table_list = PosServices.available_table_list();
            if (angular.isDefined(vm.available_table_list) && vm.available_table_list != null) {
                vm.table_id = vm.available_table_list[0].id;
            } else {
                // vm.available_table_list = [];
                vm.table_id = 0;
            }

            vm.OrderTypes = PosServices.getOrderTypes();
            if (angular.isDefined(vm.OrderTypes) && vm.OrderTypes != 0) {
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
            PosServices.setShippingType(vm.orderType);

            if (!$scope.payment_method) {
                $scope.payment_method = $scope.payment_method;
            } else {
                $scope.payment_method = 'cash';
                vm.is_payment_confirmed = 0;
            }

            vm.additional_instruction = PosServices.get_note();
            //vm.set_note = PosServices.get_note();


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
            if (vm.cart.kot_status === "back") {
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
            }


        }

        init();

        function setWalkingCustomer() {
            var customer = {
                customer_id: 1,
                email: "walk_in_customer@maduber.pk",
                first_name: "Walk-in",
                last_name: "Customer",
                mobile_number: ""
            }
            LocalStorage.add('selected_customer', customer);
            PosServices.set_customer_detail(customer);
            return customer;
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

        $scope.$on('$stateChangeSuccess', function() {
            init();

        });
        /* -------------------END Initializing POS------------------------*/

        /*
         *----------------------------------------
         *Set filters
         * ---------------------------------------
         * */

        ///////////////////////// SET Orders Type ////////////////////
        vm.setOrderType = function() {
            PosServices.setOrderType(vm.orderType);
            PosServices.setShippingType(vm.orderType);

            if (vm.orderType === 'dine-in') {
                vm.table_is_active = true;
                vm.table_id = PosServices.get_table();
            } else if (vm.orderType === 'delivery') {
                vm.table_is_active = false;
                vm.table_id = 0;
                vm.selectCustomer();
            } else {
                vm.table_is_active = false;
                vm.table_id = 0;
            }
        };

        ////////////// set table //////////////////////
        vm.setTable = function() {
            PosServices.set_table(vm.table_id);
        };


        //////////////////set server ///////////////////////////
        vm.set_server = function(server_id) {
            angular.forEach(vm.servers, function(server) {
                if (server.id === server_id) {
                    vm.server_name = server.name;
                }
            });
            PosServices.set_server(server_id);
        }


        /* -------------------END Set filters------------------------*/


        /*
         * Operations
         * */

        vm.menu_by_cat = function(category_id) {
            vm.searchQuary = '';
            var menudata = MenuServices.menuByCat(category_id);
            vm.title = menudata.category_name;
            vm.menu = menudata.menu;
            vm.cat_type = menudata.type;
            $ionicScrollDelegate.$getByHandle('MenuItems').scrollTop();
        };

        vm.add_item = function(item) {

            vm.isDayStart();

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
            console.log(PosServices.getTotalItems());
        };


        $rootScope.$on('itemAdded', function(event, data) {
            vm.isDayStart();
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

            console.log(PosServices.getTotalItems());
        });

        $scope.close = function() {
            vm.modal.hide();
        }
        vm.option_price_count = function(id) {
            var sum = PosServices.option_sum(id);
            if (sum > 0) {
                return sum;
            } else {
                return '';
            }
        };

        vm.QtyChange = function(id, quantity) {

            if (vm.cart.kot_unique_id != "" && LocalStorage.get('pin') === false) {
                $ionicPopup.prompt({
                    title: 'Enter your secret PIN',
                    subTitle: '',
                    inputType: 'password',
                    inputPlaceholder: 'Your password'
                }).then(function(res) {
                    if (res) {
                        if (parseInt(res) === currentUser.profile().pin) {
                            PosServices.QtyChange(id, quantity);
                            vm.getTotalItems = PosServices.getTotalItems();
                            PosServices.setDiscountRate(vm.discountRate);
                            vm.discount = PosServices.getDiscount();
                            vm.getSubTotal = PosServices.getSubTotal();
                            vm.tax = PosServices.getTax();
                            vm.totalCost = PosServices.totalCost();
                            LocalStorage.add('pin', true);
                        } else {

                            alert('wrong PIN');
                        }

                    } else {
                        LocalStorage.add('pin', false);
                        vm.cart = PosServices.getPos();
                        vm.items = vm.cart.items;
                    }
                });
            } else {
                PosServices.QtyChange(id, quantity);
                vm.getTotalItems = PosServices.getTotalItems();
                PosServices.setDiscountRate(vm.discountRate);
                vm.discount = PosServices.getDiscount();
                vm.getSubTotal = PosServices.getSubTotal();
                vm.tax = PosServices.getTax();
                vm.totalCost = PosServices.totalCost();
            }

        };

        vm.remove = function(id) {

            if (vm.cart.kot_unique_id != "" && LocalStorage.get('pin') === false) {
                $ionicPopup.prompt({
                    title: 'Enter your secret PIN',
                    subTitle: '',
                    inputType: 'password',
                    inputPlaceholder: 'Your password'
                }).then(function(res) {
                    if (res) {
                        if (parseInt(res) === currentUser.profile().pin) {
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
                            LocalStorage.add('pin', true);
                        } else {
                            alert('wrong PIN');
                            LocalStorage.add('pin', false);
                        }

                    } else {
                        LocalStorage.add('pin', false);
                    }
                });
            } else {

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
            }

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
                    if (vm.cart.kot_unique_id != "" && LocalStorage.get('pin') === false) {
                        $ionicPopup.prompt({
                            title: 'Enter your secret PIN',
                            subTitle: '',
                            inputType: 'password',
                            inputPlaceholder: 'Your password'
                        }).then(function(res) {
                            if (res) {
                                if (parseInt(res) === currentUser.profile().pin) {
                                    LocalStorage.add('pin', false);
                                    PosServices.empty();
                                    vm.save_kot = 'KOT';
                                    vm.cart = PosServices.getPos();
                                    vm.items = vm.cart.items;
                                    vm.getTotalItems = PosServices.getTotalItems();
                                    vm.getSubTotal = PosServices.getSubTotal();
                                    vm.tax = PosServices.getTax();
                                    init();
                                    vm.discountRate = 0;
                                    PosServices.setDiscountRate(vm.discountRate);
                                    vm.discount = PosServices.getDiscount();
                                    vm.totalCost = PosServices.totalCost();
                                    PosServices.setOrderType(vm.orderType);
                                    PosServices.set_server(vm.server_id);
                                    $ionicScrollDelegate.$getByHandle('CartItems').scrollBottom();
                                    $scope.hold_order_list = PosServices.hold_order_list();
                                    vm.checkoutModalHide();
                                    LocalStorage.add('pin', true);
                                } else {
                                    alert('wrong PIN');
                                    LocalStorage.add('pin', false);
                                }
                            }

                        });
                    } else {
                        LocalStorage.add('pin', false);
                        PosServices.empty();
                        vm.save_kot = 'KOT';
                        vm.cart = PosServices.getPos();
                        vm.items = vm.cart.items;
                        vm.getTotalItems = PosServices.getTotalItems();
                        vm.getSubTotal = PosServices.getSubTotal();
                        vm.tax = PosServices.getTax();
                        init();
                        vm.discountRate = 0;
                        PosServices.setDiscountRate(vm.discountRate);
                        vm.discount = PosServices.getDiscount();
                        vm.totalCost = PosServices.totalCost();
                        PosServices.setOrderType(vm.orderType);
                        PosServices.set_server(vm.server_id);
                        $ionicScrollDelegate.$getByHandle('CartItems').scrollBottom();
                        $scope.hold_order_list = PosServices.hold_order_list();
                        vm.checkoutModalHide();
                    }
                }
            });
        };

        vm.applyDiscount = function() {
            if (vm.discountRate < 0) {
                vm.discountRate = 0;
            }
            if (vm.discountRate > 100) {
                vm.discountRate = 100;
            }

            PosServices.setDiscountRate(vm.discountRate);
            vm.discount = PosServices.getDiscount();
            vm.cart = PosServices.getPos();
            vm.items = vm.cart.items;
            vm.getTotalItems = PosServices.getTotalItems();
            vm.tax = PosServices.getTax();
            vm.getSubTotal = PosServices.getSubTotal();
            vm.totalCost = PosServices.totalCost();
            $scope.cart_detail = PosServices.getPos();
            vm.exact_amount = 0;
        };

        ///////////////////// customer search ///////////////////


        vm.selectCustomer = function() {
            $ionicModal.fromTemplateUrl('app/pos/select_customer_modal.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                vm.customerModal = modal;
                $scope.customers = vm.selected_customer;
                $scope.search_customer_list = false;
                vm.customerModal.show();
                vm.address_id = PosServices.getShippingAddress();
            });
        };
        vm.hideCustomerModal = function() {
            vm.customerModal.hide();
        };

        $scope.search_customer_list = false;
        $scope.customer_name = '';
        $scope.customers_search = {};
        $scope.showVal = function(value) {

            if (value != '') {
                $scope.spinner = true;
                MenuServices.search_customers(value).then(function(res) {
                    $scope.spinner = false;
                    $scope.customers_search = res.data.data;
                    $scope.search_customer_list = true;
                });
            }
            if (value === '') {
                $scope.search_customer_list = false;
            }
        }

        $scope.setCustomer = function(customer) {

            vm.selected_customer = customer;
            LocalStorage.add('selected_customer', vm.selected_customer);
            PosServices.setCustomerID(vm.selected_customer.customer_id);
            PosServices.set_customer_detail(customer);
            $scope.search_customer_list = false;
        };

        vm.emptySearch = function() {
            vm.searchQuary = '';
            vm.searchItem();
        };


        /////////////// hold bill ////////////////////////

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
                    vm.selected_customer = setWalkingCustomer();
                    vm.save_kot = 'KOT';
                    vm.cart = PosServices.getPos();
                    vm.items = vm.cart.items;
                    vm.getTotalItems = PosServices.getTotalItems();
                    vm.getSubTotal = PosServices.getSubTotal();
                    vm.tax = PosServices.getTax();
                    init();
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
            if (vm.mode === 'order_post') {} else if (vm.mode === 'order_list') {
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
                        console.log(order);
                        PosServices.restore(order);
                        vm.cart = PosServices.getPos();
                        vm.items = vm.cart.items;
                        vm.cart.customer_detail = order.customer_detail;
                        vm.getTotalItems = PosServices.getTotalItems();
                        vm.getSubTotal = PosServices.getSubTotal();
                        vm.discount = PosServices.getDiscount();
                        vm.tax = PosServices.getTax();
                        vm.discountRate = vm.cart.discountRate;
                        vm.totalCost = PosServices.totalCost();
                        PosServices.set_customer_detail(order.customer_detail);
                        vm.table_id = vm.cart.table_id;
                        PosServices.set_table(vm.table_id);
                        vm.server_id = vm.cart.server_id;
                        vm.orderType = vm.cart.order_type;
                        vm.selected_customer = order.customer_detail;
                        LocalStorage.add('selected_customer', vm.selected_customer);

                        vm.additional_instruction = order.additional_instruction;
                        vm.note = order.additional_instruction;
                        PosServices.set_note(order.additional_instruction);

                        $ionicScrollDelegate.$getByHandle('CartItems').scrollBottom();
                        $scope.hold_order_list = PosServices.hold_order_list();
                        vm.modal.hide();
                    }
                });
            } else {
                var order = PosServices.hold_order_back(id);
                console.log(order);
                PosServices.restore(order);
                vm.cart = PosServices.getPos();
                vm.items = vm.cart.items;
                vm.cart.customer_detail = order.customer_detail;
                vm.getTotalItems = PosServices.getTotalItems();
                vm.getSubTotal = PosServices.getSubTotal();
                vm.discount = PosServices.getDiscount();
                vm.tax = PosServices.getTax();
                vm.discountRate = vm.cart.discountRate;
                vm.totalCost = PosServices.totalCost();
                PosServices.set_customer_detail(order.customer_detail);
                vm.table_id = vm.cart.table_id;
                PosServices.set_table(vm.table_id);
                vm.server_id = vm.cart.server_id;
                vm.orderType = vm.cart.order_type;
                vm.selected_customer = order.customer_detail;
                LocalStorage.add('selected_customer', vm.selected_customer);

                vm.additional_instruction = order.additional_instruction;
                vm.note = order.additional_instruction;
                PosServices.set_note(order.additional_instruction);

                $ionicScrollDelegate.$getByHandle('CartItems').scrollBottom();
                $scope.hold_order_list = PosServices.hold_order_list();
                vm.modal.hide();
            }
        };



        function hold_order_firebase() {
            var list = PosServices.hold_order_list();
            if (configuration.env === 'pro') {
                firebase.database()
                    .ref('pro')
                    .child('hold_order_list')
                    .remove();
                angular.forEach(list, function(order) {
                    firebase.database()
                        .ref('pro')
                        .child('hold_order_list')
                        .push(JSON.stringify(order));
                });
            }
            if (configuration.env === 'dev') {
                firebase.database()
                    .ref('dev')
                    .child('hold_order_list')
                    .remove();
                angular.forEach(list, function(order) {
                    firebase.database()
                        .ref('dev')
                        .child('hold_order_list')
                        .push(JSON.stringify(order));
                });
            }
        }


        ///////////////////////////// KOT///////////////////////////////

        $ionicModal.fromTemplateUrl('app/pos/kot-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            vm.kot_time = '30';
            vm.kot_modal = modal;
        });

        vm.kot = function() {
            $scope.cart = PosServices.getPos();
            vm.kot_modal.show();
        };

        $scope.kotModalHide = function() {
            vm.kot_modal.hide();
        };

        $scope.set_setkottime = function() {
            // console.log(vm.kot_time);
        }

        $scope.saveKOT = function() {
            vm.isDayStart();
            console.log(PosServices.getPos());
            if (vm.kot_time != 0) {
                var now = new Date();
                var olderDate = moment(now).add(vm.kot_time, 'minutes').toDate();
                PosServices.set_kot_time(olderDate);
                PosServices.save_kot();
                var order = PosServices.getPos();
                var cashin_id = LocalStorage.get('cashin_id');
                var CHECKIN_ID = LocalStorage.get('CHECKIN_ID');
                var business_day = LocalStorage.get('DAYSTART').id;
                // PosServices.set_customer_detail(LocalStorage.get('selected_customer'));
                var total_order_cost = 0;
                // total_order_cost = parseInt(order.total) + LocalStorage.get('TOTAL_SALE');
                // LocalStorage.add('TOTAL_SALE', parseInt(total_order_cost));
                order.checkin_id = CHECKIN_ID;
                order.cashin_id = cashin_id;
                order.business_day_id = business_day;
                order.status = 3;
                order.is_payment_confirmed = 1;
                console.log(LocalStorage.get('selected_customer'));
                order.customer_detail = LocalStorage.get('selected_customer');
                PosServices.setPos(order);
                // console.log(order);
                PosOrderService.saveOrder(order);

                // PosServices.save_kot();

                var kotBillPrint = angular.element(document.querySelector('#kot-bill-print'));
                PrinterServices.kotPrint(kotBillPrint[0].innerHTML)
                    .then(function() {
                        vm.kot_modal.hide();
                        PosServices.empty();

                        vm.save_kot = 'KOT';
                        vm.cart = PosServices.getPos();
                        vm.items = vm.cart.items;
                        vm.getTotalItems = PosServices.getTotalItems();
                        vm.getSubTotal = PosServices.getSubTotal();
                        vm.tax = PosServices.getTax();
                        init();
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
                        vm.selected_customer = setWalkingCustomer();
                    });
            }
        };
        $rootScope.$on('kotBack', function(event, data) {
            init();
            vm.discount = PosServices.getDiscount();
            vm.cart = PosServices.getPos();
            console.log(vm.cart);
            vm.table_id = vm.cart.table_id;
            PosServices.set_table(vm.table_id);
            vm.server_id = vm.cart.server_id;
            vm.orderType = vm.cart.order_type;
            vm.additional_instruction = vm.cart.additional_instruction;
            vm.selected_customer = vm.cart.customer_detail;
            console.log(vm.selected_customer);
            LocalStorage.add('selected_customer', vm.selected_customer);
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
            vm.hideNoteModal();
        };

        /* -------------------END Operations------------------------*/



        /*
         * -------------------------------------------------------
         *                   Payment Operation
         * -------------------------------------------------------
         * */

        ////////////////////// pay ///////////////////////

        vm.checkoutModal = function() {
            vm.isDayStart();
            vm.kot_time = '30';
            vm.return_amount = 0;
            vm.exact_amount = 0;
            vm.total_amount = 0;
            vm.discountRate = 0;
            PosServices.setDiscountRate(vm.discountRate);
            $scope.cart_detail = PosServices.getPos();
            vm.applyDiscount();
            vm.hideOrderSubmitButton = false;
            if (vm.cart.kot_unique_id === '') {
                vm.cart.kot_unique_id = PosServices.kot_unique_id();
                PosServices.setPos(vm.cart);
            }
            console.log($scope.cart_detail.kot_status);
            if ($scope.cart_detail.kot_status === 'back') {
                vm.sendToKitchen = false;
                vm.KotReceipt = false;
            } else if ($scope.cart_detail.kot_status === 'new') {
                vm.sendToKitchen = true;
                vm.KotReceipt = true;
            }
            $ionicModal.fromTemplateUrl('app/pos/payment_model.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {

                vm.modalcheckout = modal;
                vm.modalcheckout.show();
                $scope.cart_detail = PosServices.getPos();
            });
        };

        vm.checkoutModalHide = function() {
            $scope.payment_method = 'cash';
            vm.discountRate = 0;
            PosServices.setDiscountRate(vm.discountRate);
            vm.applyDiscount();
            $scope.cart_detail = PosServices.getPos();
            vm.modalcheckout.hide();
        }

        vm.total_exact = function(amount) {
            $scope.cart_detail = PosServices.getPos();
            vm.exact_amount = $scope.cart_detail.total;
            vm.calculateReturn(vm.exact_amount);
        }
        vm.calculateReturn = function(amount) {
            $scope.cart_detail = PosServices.getPos();
            vm.total_amount = $scope.cart_detail.total;
            vm.return_amount = vm.total_amount - amount;
        }

        vm.set_payment_method = function(payment_method) {
            $scope.payment_method = payment_method;
            PosServices.setPaymentMethod(payment_method);
            if (payment_method === 'complimentary') {
                PosServices.setTaxRate(0);
                vm.discountRate = 100;
                vm.applyDiscount();
                $scope.cart_detail = PosServices.getPos();
                vm.total_exact(vm.exact_amount);
            } else {


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

                vm.discountRate = 0;
                vm.applyDiscount();
            }

            $scope.cart_detail = PosServices.getPos();
        };

        $scope.saveOrder = function() {
            vm.hideOrderSubmitButton = true;
            vm.isDayStart();
            LocalStorage.add('pin', false);
            var order = PosServices.getPos();
            var cashin_id = LocalStorage.get('cashin_id');
            var CHECKIN_ID = LocalStorage.get('CHECKIN_ID');
            var business_day = LocalStorage.get('DAYSTART').id;
            // PosServices.set_customer_detail(LocalStorage.get('selected_customer'));
            var total_order_cost = 0;
            // total_order_cost = parseInt(order.total) + LocalStorage.get('TOTAL_SALE');
            // LocalStorage.add('TOTAL_SALE', parseInt(total_order_cost));
            order.checkin_id = CHECKIN_ID;
            order.cashin_id = cashin_id;
            order.business_day_id = business_day;
            order.status = 3;
            order.is_payment_confirmed = 1;
            console.log(LocalStorage.get('selected_customer'));
            order.customer_detail = LocalStorage.get('selected_customer');
            PosServices.setPos(order);
            // console.log(order);
            PosOrderService.saveOrder(order);
            if (vm.sendToKitchen) {
                var now = new Date();
                var olderDate = moment(now).add(vm.kot_time, 'minutes').toDate();
                PosServices.set_kot_time(olderDate);
                PosServices.save_kot();
            }
            vm.modalcheckout.hide();
            vm.printBill();
            PosOrderService.sendToServer();
        }

        /**----------------Bill and KOT Print--------------------**/
        vm.printBill = function() {

            if (vm.BillReceipt) {
                var posBillPrint = angular.element(document.querySelector('#pos-bill-print'));
                PrinterServices.billPrint(posBillPrint[0].innerHTML)
                    .then(function() {
                        if (vm.KotReceipt) {
                            var kotBillPrint = angular.element(document.querySelector('#kot-bill-print'));
                            PrinterServices.kotPrint(kotBillPrint[0].innerHTML)
                                .then(function() {
                                    PosServices.empty();
                                    vm.selected_customer = setWalkingCustomer();
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
                                    vm.additional_instruction = "";
                                    vm.note = "";
                                });
                        } else {
                            PosServices.empty();
                            vm.selected_customer = setWalkingCustomer();
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
                            vm.additional_instruction = "";
                            vm.note = "";
                        }

                    })

            }
        };



        /* -------------------END Checkout operation------------------------*/

        /*
         * -----------------------------------------------------
         *                     Address
         * -----------------------------------------------------
         *
         * */

        vm.setAddressId = function(adress) {
            console.log(adress);
            angular.forEach(vm.delivery_areas, function(area) {
                if (adress.delivery_area_id === area.id) {
                    console.log(area);
                    PosServices.setShipping(parseInt(area.delivery_charges));
                }
            });
            PosServices.setShippingAddress(adress.address_id);
            PosServices.set_customer_address(adress);
            vm.address_id = adress.address_id;
            vm.customer_address = adress;
            console.log(vm.customer_address);
            vm.hideCustomerModal();
        };

        vm.SETTING = LocalStorage.get('SETTING');

        vm.map = {
            center: vm.SETTING.address1 + ", " + vm.SETTING.address2 + ", " + vm.SETTING.city_name, //vm.address.latitude + ", " + vm.address.longitude
            zoom: 12
        };

        vm.address = {
            customer_id: vm.selected_customer.customer_id,
            Addresstitle: '',
            addressLine1: '',
            addressLine2: '',
            city: '',
            postal_code: '',
            latitude: '',
            longitude: '',
            delivery_area_id: 0
        };

        vm.selected_area = {};
        vm.select_area = function() {
            angular.forEach(vm.SETTING.delivery_areas, function(area) {
                if (area.id == vm.delivery_area_id) {
                    vm.selected_area = area;
                    vm.address.addressLine2 = vm.selected_area.area_name;
                    vm.address.city = vm.selected_area.city_name;
                    vm.address.delivery_area_id = vm.selected_area.id;
                    vm.getLocation();
                }
            });
        };

        vm.getLocation = function() {
            var completeAddress = "";

            if (vm.address.addressLine1 != '') {
                completeAddress = vm.address.addressLine1;
            }
            if (vm.selected_area != '') {
                completeAddress += ", " + vm.selected_area.area_name;
            }
            if (vm.address.city != '') {
                completeAddress += ", " + vm.selected_area.city_name;
            }
            if (vm.address.latitude != '' && vm.address.longitude != '') {
                completeAddress = [vm.address.latitude, vm.address.longitude];
            }

            vm.map.center = completeAddress;
            vm.map.zoom = 17;
        };

        vm.addressLine1Change = function() {
            vm.getLocation();
        }

        vm.getMapLocation = function() {
            navigator.geolocation.getCurrentPosition(onMapSuccess, onMapError, { enableHighAccuracy: true });
        }

        var onMapSuccess = function(position) {
            var Latitude = position.coords.latitude;
            var Longitude = position.coords.longitude;
            vm.address.latitude = Latitude;
            vm.address.longitude = Longitude;
            vm.map.center = vm.address.latitude + ", " + vm.address.longitude;
            vm.map.zoom = 15;

        }

        function onMapError(error) {
            console.log('code: ' + error.code + '\n' +
                'message: ' + error.message + '\n');
            loading.hide();
        }




        vm.markerPosition = function(event) {
            vm.address.latitude = event.latLng.lat();
            vm.address.longitude = event.latLng.lng();
            vm.map.center = vm.address.latitude + ", " + vm.address.longitude;
            vm.map.zoom = 18;
        };

        // vm.addAddress = function() {
        //     loading.show();
        //     addressServices.addAddress(vm.address)
        //         .then(function(response) {
        //             loading.hide()
        //             ionicToast.show(response.data.msg, 'top', false, 4000);

        //         })
        //         .catch(function(response) {
        //             loading.hide();
        //             ionicToast.show(response.data.msg, 'top', false, 4000);
        //         });
        // };






        vm.removeAddressForm = false;
        vm.setfalse = true;
        vm.setCutomerfalse = true;

        vm.addNewAddress = function() {
            vm.newaddress = true;
            vm.removeAddressForm = true;
            vm.setfalse = false;
            vm.alert = false;
            vm.setCutomerfalse = true;
        }

        vm.addNewCustomer = function() {
            vm.newcustomer = true;
            vm.removeCustomerForm = true;
            vm.setfalse = false;
            vm.alert = false;
            vm.setCutomerfalse = false;
        }

        vm.cancelAddCustomer = function(argument) {
            vm.newcustomer = false;
            vm.removeCustomerForm = false;
            vm.setfalse = true;
            vm.setCutomerfalse = true;
        }


        vm.customer = {
            first_name: '',
            last_name: '',
            email: '',
            mobile_number: '',
            password: ''
        };
        vm.customer_first_name = '';
        vm.customer_last_name = '';
        vm.customer_email = '';
        vm.customer_mobile_number = '';
        vm.customer_password = '';
        vm.alert = false;
        vm.addCustomer = function() {
            if (vm.customer_first_name === '' || vm.customer_last_name === '' || vm.customer_email === '' || vm.customer_mobile_number === '' || vm.customer_password === '') {
                vm.alert = true;
                vm.msg = "Please fill all the requirement!";
            } else {
                vm.customer.first_name = vm.customer_first_name;
                vm.customer.last_name = vm.customer_last_name;
                vm.customer.email = vm.customer_email;
                vm.customer.mobile_number = vm.customer_mobile_number;
                vm.customer.password = vm.customer_password;

                vm.customer_spinner = true;
                CustomersServices.save_customer(vm.customer).then(function(res) {
                    vm.customer_spinner = false;
                    vm.removeCustomerForm = false;
                    vm.newcustomer = false;
                    vm.setfalse = true;
                    vm.alert = true;
                    vm.msg = res.data.msg;
                    vm.setCutomerfalse = true;
                });
            }
        }

        vm.hide_msg = function() {
            vm.alert = false;
        }

        vm.saveNewAddress = function() {
            if (vm.address.Addresstitle === '') {
                vm.alert = true;
                vm.msg = "Please fill all the requirement!";
            }
            vm.customer_spinner = true;
            MenuServices.save_customerAddress(vm.address).then(function(res) {
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

        vm.cancelAddress = function() {
            vm.newaddress = false;
            vm.removeAddressForm = false;
            vm.setfalse = true;

            ///empty customers fields
            vm.customer_address1 = '';
            vm.customer_city = '';
            vm.customer_postcode = '';
            vm.Addresstitle = '';


        }

        vm.customer_address1 = '';
        vm.customer_city = setting.venue_setting().city;
        vm.customer_postcode = setting.venue_setting().zip;
        vm.Addresstitle = '';
        vm.delivery_area_id = '';
        vm.customer_spinner = false;



        /*------------------ END Address -------------------------*/
    }

})();