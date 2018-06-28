(function() {
    'use strict';

    angular
        .module('app')
        .run(['PosServices', 'LocalStorage', function(PosServices, LocalStorage, Socket) {
            // PosServices
            if (angular.isObject(LocalStorage.get('pos'))) {
                PosServices.restore(LocalStorage.get('pos'));
            } else {
                PosServices.init();
            }
        }])
        .factory('PosServices', ['LocalStorage', 'Socket', PosServices]);


    function PosServices(LocalStorage, Socket) {
        var _self = this;

        function init() {
            _self.pos = {
                order_id: 0,
                customer_id: 0,
                customer_detail: [],
                customer_adress: [],
                status: 0,
                platform: 'pos',
                shipping: 0,
                shippingType: 'dine-in',
                discount: 0,
                discountRate: 0,
                sub_total: 0,
                sub_total_after_dis: 0,
                total: 0,
                address_id: 0,
                taxRate: 0,
                tax: 0,
                order_type: 'dine-in',
                server_id: 0,
                table_id: 0,
                kot_unique_id: '',
                kot_time: '',
                kot_status: 'new',
                kot_del: '',
                additional_instruction: '',
                payment_method: 'cash',
                is_payment_confirmed: 0,
                items: []
            };
            save();
        }

        function addItem(item) {
            /// each time cart must be reload cart
            if (angular.isObject(LocalStorage.get('pos'))) {
                restore(LocalStorage.get('pos'));
            }
            var item_discount = (parseFloat(item.discount) / 100) * parseFloat(item.prices[0].price);

            if (isItemExist(item.menu_item_id)) { //if menu item already exist in the cart
                var pos = getPos();
                var exit = false;

                angular.forEach(pos.items, function(itm, index) {

                    // if item already exist in the cart
                    if (!exit) {
                        if (itm.menu_item_id === item.menu_item_id) {

                            // if option exist in the existing item
                            if (itm.menu_options.length > 0) {
                                // itm.item_sum = option_sum_by_option(itm.menu_options);
                                // if options  are same of already existing item and new item then change quantity
                                if (angular.equals(itm.menu_options, item.menu_options) && angular.equals(itm.prices, item.prices)) {
                                    item.option_sum = parseFloat(option_sum_by_option(item.menu_options));
                                    item.item_sum = parseFloat(option_sum_by_option(item.menu_options)) + parseFloat(item.prices[0].price);
                                    item.discounted_price = parseFloat(option_sum_by_option(item.menu_options)) + (parseFloat(item.prices[0].price) - parseFloat(item_discount));
                                    itm.quantity = (itm.quantity + item.quantity);

                                    setPos(pos);
                                    exit = true;
                                } else { // if options are not same of existing and new item then push new item into cart

                                    item.option_sum = parseFloat(option_sum_by_option(item.menu_options));
                                    item.item_sum = parseFloat(option_sum_by_option(item.menu_options)) + parseFloat(item.prices[0].price);
                                    item.discounted_price = parseFloat(option_sum_by_option(item.menu_options)) + (parseFloat(item.prices[0].price) - parseFloat(item_discount));
                                    _self.pos.items.push(item);
                                    save();
                                    exit = true;
                                }

                            } else { // if options are not available in item
                                // if price option is already exist in menu item
                                if (angular.equals(itm.prices, item.prices)) {
                                    item.option_sum = parseFloat(option_sum_by_option(item.menu_options));
                                    item.item_sum = parseFloat(option_sum_by_option(item.menu_options)) + parseFloat(item.prices[0].price);
                                    item.discounted_price = parseFloat(option_sum_by_option(item.menu_options)) + (parseFloat(item.prices[0].price) - parseFloat(item_discount));
                                    itm.quantity = (itm.quantity + item.quantity);
                                    setPos(pos);
                                    exit = true;
                                } else {
                                    var checkboxSum = 0;
                                    var radioSum = 0;
                                    if (item.menu_options.length > 0) {
                                        item.option_sum = parseFloat(option_sum_by_option(item.menu_options));
                                        item.item_sum = parseFloat(option_sum_by_option(item.menu_options)) + parseFloat(item.prices[0].price);
                                        item.discounted_price = parseFloat(option_sum_by_option(item.menu_options)) + (parseFloat(item.prices[0].price) - parseFloat(item_discount));
                                        _self.pos.items.push(item);
                                        save();
                                        exit = true;
                                    } else {
                                        item.option_sum = parseFloat(option_sum_by_option(item.menu_options));
                                        item.item_sum = parseFloat(option_sum_by_option(item.menu_options)) + parseFloat(item.prices[0].price);
                                        item.discounted_price = parseFloat(option_sum_by_option(item.menu_options)) + (parseFloat(item.prices[0].price) - parseFloat(item_discount));
                                        _self.pos.items.push(item);
                                        save();
                                        exit = true;
                                    }
                                }
                            }

                        }
                    }
                });

            } else { // if menu item not exist in the cart and new item push into cart
                item.option_sum = parseFloat(option_sum_by_option(item.menu_options));
                item.item_sum = parseFloat(option_sum_by_option(item.menu_options)) + parseFloat(item.prices[0].price);
                item.discounted_price = parseFloat(option_sum_by_option(item.menu_options)) + (parseFloat(item.prices[0].price) - parseFloat(item_discount));
                _self.pos.items.push(item);
                save();
            }

        }

        function option_sum_by_option(menu_options) {
            var sum = 0;

            if (menu_options.length > 0) {
                angular.forEach(menu_options, function(option) {
                    if (option.option_type == 'checkbox') {
                        angular.forEach(option.selectedItemPrice, function(option) {
                            sum += parseFloat(option);
                        });
                    }
                    if (option.option_type == 'radio') {
                        sum += parseFloat(option.selectedItemPrice);
                    }
                });
            }

            return sum;
        }

        function option_sum(id) {
            var sum = 0;
            var pos = getPos();
            angular.forEach(pos.items, function(itm, index) {
                if (index === id) {
                    if (itm.menu_options.length > 0) {
                        angular.forEach(itm.menu_options, function(option) {
                            if (option.option_type == 'checkbox') {
                                angular.forEach(option.selectedItemPrice, function(option) {
                                    sum += parseFloat(option);
                                });
                            }
                            if (option.option_type == 'radio') {
                                sum += parseFloat(option.selectedItemPrice);
                            }
                        });
                    }
                }
            });
            return sum;
        }

        function getServingSize(prices, id) {

            var serving_size = '';
            angular.forEach(prices, function(price, index) {
                if (price.price_id == id) {
                    serving_size = price.serving;
                }
            });
            return serving_size;
        }
        /// take menu item and return selected price id
        function getDefaultSelectDeal(item) {
            var selected_deal_id = false;

            // item is not exist in the pos
            angular.forEach(item.prices, function(price, index) {
                if (price.default_price) {
                    selected_deal_id = price.price_id;
                }
            });
            // if by default price is not selected then return first item id
            if (selected_deal_id == false) {
                selected_deal_id = item.prices[0].price_id;
            }

            return selected_deal_id;
        }


        function getSelectDeal(item, deal_id) {
            var selected_deal = {
                default_price: null,
                price: null,
                price_id: null,
                title: null,
                serving: null
            };

            angular.forEach(item.prices, function(price, index) {
                if (price.price_id == deal_id) {
                    selected_deal.price_id = parseInt(price.price_id);
                    selected_deal.price = Number(price.price);
                    selected_deal.title = price.title;
                    selected_deal.default_price = true;
                    selected_deal.serving = price.serving;
                }
            });
            return selected_deal;
        }


        // return true if item exist in POS
        function isItemExist(id) {
            var items = getPos().items;
            var build = false;
            angular.forEach(items, function(item, index) {
                if (item.menu_item_id == id) {
                    build = true;
                }
            });
            return build;
        }

        function getItems() {
            return getPos().items;
        }

        function getItemById(id) {
            var items = getPos().items;
            var build = false;

            angular.forEach(items, function(item, index) {
                if (item.menu_item_id == id) {
                    build = item;
                }
            });
            return build;
        }

        function removeItemById(id) {
            var pos = getPos();
            angular.forEach(pos.items, function(item, index) {
                if (index === id) {
                    pos.items.splice(index, 1);
                }
            });
            setPos(pos);
        }

        function QtyChange(id, qty) {
            var pos = getPos();
            angular.forEach(pos.items, function(item, index) {
                if (index === id) {
                    item.quantity = qty;
                }
            });
            setPos(pos);
        }

        function getTotalItems() {
            var count = 0;
            var items = getItems();
            angular.forEach(items, function(item, index) {
                count += item.quantity;
            });
            return count;
        }

        function getOrderItems() {
            var newItem = [];
            var items = getItems();
            angular.forEach(items, function(item, index) {
                newItem[index] = {
                    menu_item_id: item.menu_item_id,
                    price_id: item.price_id,
                    quantity: item.quantity,
                    special_instructions: ""
                };
            });
            return newItem;
        }

        function getTotalUniqueItems() {
            return getPos().items.length;
        }

        function setShipping(shipping) {
            _self.pos.shipping = shipping;
            save();
            return getShipping();
        }

        function getShipping() {
            if (getPos().items.length == 0) return 0;
            return getPos().shipping;
        }

        function setShippingType(shippingType) {
            _self.pos.shippingType = shippingType;
            save();
            return getShippingType();
        }

        function getShippingType() {
            if (getPos().shippingType == null) return 0;
            return getPos().shippingType;
        }


        function setShippingAddress(address_id) {
            _self.pos.address_id = address_id;
            save();
            return getShippingAddress();
        }

        function getShippingAddress() {
            if (getPos().address_id == null) return 0;
            return getPos().address_id;
        }

        function setPaymentMethod(payment_method) {
            _self.pos.payment_method = payment_method;
            save();
            return getPaymentMethod();
        }

        function getPaymentMethod() {
            return _self.pos.payment_method;
        }

        function setPaymentConfirmed(is_confirmed) {
            _self.pos.is_payment_confirmed = is_confirmed;
            save();
            return getPaymentConfirmed();
        }

        function getPaymentConfirmed() {
            return _self.pos.is_payment_confirmed;
        }

        function setTaxRate(taxRate) {
            _self.pos.taxRate = Number(parseFloat(taxRate).toFixed(2));
            save();
            return getTaxRate();
        }

        function getTaxRate() {
            return _self.pos.taxRate;
        }

        function getTax() {
            var tax = +parseFloat(((getSubTotalAfterDiscount() / 100) * getPos().taxRate)).toFixed(2);
            _self.pos.tax = tax;
            save();
            return tax;
        }

        function setDiscountRate(rate) {
            var discount = parseFloat(((getSubTotal() / 100) * rate)).toFixed(2);
            _self.pos.discount = Number(discount);
            _self.pos.discountRate = Number(rate);
            save();
            return getDiscount();
        }

        function setDiscount(discount) {
            _self.pos.discount = Number(discount);
            save();
            return getDiscount();
        }

        function getDiscount() {
            return getPos().discount;
        }

        function setCustomerID(id) {
            _self.pos.customer_id = id;
            save();
            return getCustomerID();
        }

        function getCustomerID() {
            return getPos().customer_id;
        }

        function getSubTotal() {
            var total = 0;
            var checkboxSum = 0;
            var radioSum = 0;
            angular.forEach(getPos().items, function(item, index) {
                total += parseFloat(item.quantity) * parseFloat(item.discounted_price)
            });
            _self.pos.sub_total = +parseFloat(total).toFixed(2);
            save();
            return +parseFloat(total).toFixed(2);
        }

        function getSubTotalAfterDiscount() {
            var sub_total_after_dis = 0;
            sub_total_after_dis = getSubTotal() - getDiscount();
            _self.pos.sub_total_after_dis = +parseFloat(sub_total_after_dis).toFixed(2);
            save();
            return +parseFloat(sub_total_after_dis).toFixed(2);
        }

        function totalCost() {
            var total = 0;
            if (getShippingType() == 'pickup') {
                total = (+parseFloat(getSubTotalAfterDiscount() + getTax()).toFixed(2));
            } else {
                total = +parseFloat(getSubTotalAfterDiscount() + getShipping() + getTax()).toFixed(2);
            }
            _self.pos.total = +parseFloat(total).toFixed(2);
            save();
            return total;
        }

        function restore(storedPos) {
            init();
            _self.pos.order_id = storedPos.order_id;
            _self.pos.status = storedPos.status;
            _self.pos.customer_id = storedPos.customer_id;
            _self.pos.shipping = storedPos.shipping;
            _self.pos.discount = storedPos.discount;
            _self.pos.discountRate = storedPos.discountRate;
            _self.pos.shippingType = storedPos.shippingType;
            _self.pos.address_id = storedPos.address_id;
            _self.pos.tax = storedPos.tax;
            _self.pos.taxRate = storedPos.taxRate;
            _self.pos.sub_total = storedPos.sub_total;
            _self.pos.sub_total_after_dis = storedPos.sub_total_after_dis;
            _self.pos.total = storedPos.total;
            _self.pos.order_type = storedPos.order_type;
            _self.pos.server_id = storedPos.server_id;
            _self.pos.table_id = storedPos.table_id;
            _self.pos.kot_unique_id = storedPos.kot_unique_id;
            _self.pos.kot_status = storedPos.kot_status;
            _self.pos.payment_method = storedPos.payment_method;
            _self.pos.is_payment_confirmed = storedPos.is_payment_confirmed;
            _self.pos.additional_instruction = storedPos.additional_instruction;
            angular.forEach(storedPos.items, function(item, key) {
                _self.pos.items[key] = item;
            });
            save();
        }

        function setPos(pos) {
            _self.pos = pos;
            save();
            return getPos();
        }

        function getPos() {
            if (LocalStorage.get('pos')) {
                return LocalStorage.get('pos');
            } else {
                return {
                    "order_id": 0,
                    "customer_id": 0,
                    "status": 0,
                    "platform": 'pos',
                    "shipping": 0,
                    "discount": 0,
                    "total": 0,
                    "sub_total": 0,
                    "sub_total_after_dis": 0,
                    "discountRate": 0,
                    "shippingType": 'dine-in',
                    "address_id": 0,
                    "taxRate": 0,
                    "tax": 0,
                    "order_type": 'dine-in',
                    "server_id": 0,
                    "table_id": 0,
                    "kot_unique_id": '',
                    "kot_status": 'new',
                    "payment_method": 'cash',
                    "is_payment_confirmed": 0,
                    "additional_instruction": '',
                    "items": []
                }
            }
        }

        function save() {
            return LocalStorage.add('pos', _self.pos);
        }

        function empty() {
            _self.pos = {
                order_id: 0,
                customer_id: 0,
                customer_detail: [],
                customer_adress: [],
                status: 0,
                platform: 'pos',
                shipping: 0,
                shippingType: 'dine-in',
                discount: 0,
                discountRate: 0,
                sub_total: 0,
                sub_total_after_dis: 0,
                total: 0,
                address_id: 0,
                taxRate: 0,
                tax: 0,
                order_type: "dine-in",
                server_id: 0,
                table_id: 0,
                kot_unique_id: '',
                kot_time: '',
                kot_status: 'new',
                kot_del: '',
                payment_method: 'cash',
                is_payment_confirmed: 0,
                additional_instruction: '',
                items: []
            };
            save();
        }

        function kot_unique_id() {
            var kot_unique_id = '';
            var cashin_id = LocalStorage.get('cashin_id');
            var CHECKIN_ID = LocalStorage.get('CHECKIN_ID');

            var kot_counter = 0;
            if (LocalStorage.get('kot_counter') > 0) {
                kot_counter = LocalStorage.get('kot_counter');
                LocalStorage.add('kot_counter', Number(kot_counter + 1));
                kot_counter = LocalStorage.get('kot_counter');
                kot_unique_id = kot_counter + '-' + CHECKIN_ID + '-' + cashin_id;
                return kot_unique_id;
            } else {
                LocalStorage.add('kot_counter', Number(kot_counter + 1));
                kot_counter = LocalStorage.get('kot_counter');
                kot_unique_id = kot_counter + '-' + CHECKIN_ID + '-' + cashin_id;
                return kot_unique_id;
            }
        }

        function save_kot() {
            var kot_list = [];
            if (LocalStorage.get('kot_list')) {
                kot_list = LocalStorage.get('kot_list');
            }
            var items = getItems();
            if (items.length > 0) {
                var mypos = getPos();
                console.log(mypos);
                //mypos.selected_customer = LocalStorage.get('selected_customer');

                if (mypos.kot_status === 'new') {
                    mypos.kot_datetime = moment().format('D-MM-YYYY h:mm:ss a');
                    if (mypos.kot_unique_id != '') {
                        kot_list.push(mypos);
                        Socket.emit("order", mypos);
                        LocalStorage.add('kot_list', kot_list);
                    } else {
                        mypos.kot_unique_id = kot_unique_id();
                        kot_list.push(mypos);
                        Socket.emit("order", mypos);
                        LocalStorage.add('kot_list', kot_list);
                    }

                } else {
                    kot_list.push(mypos);
                    Socket.emit("order", mypos);
                    LocalStorage.add('kot_list', kot_list);
                }

            }
        }

        function save_kot_online_order(order) {
            var kot_list = [];
            if (is_order_in_kot(order)) {
                if (LocalStorage.get('kot_list')) {
                    kot_list = LocalStorage.get('kot_list');
                }

                if (order.items.length > 0) {
                    var mypos = order;
                    mypos.type = 0;
                    //mypos.selected_customer = LocalStorage.get('selected_customer');


                    mypos.kot_datetime = moment().format('D-MM-YYYY h:mm:ss a');

                    mypos.kot_unique_id = order.order_id;
                    kot_list.push(mypos);
                    Socket.emit("order", mypos);
                    LocalStorage.add('kot_list', kot_list);
                }
            }
        }

        function is_order_in_kot(order) {
            var kot_list;
            var rtrn = true;
            if (LocalStorage.get('kot_list')) {
                kot_list = LocalStorage.get('kot_list');
                angular.forEach(kot_list, function(item) {
                    if (item.kot_unique_id === order.order_id) {

                        rtrn = false;
                    }
                });
                return rtrn;

            }
        }

        function kot_remove(kot_unique_id) {
            var order = get_order_by_kot(kot_unique_id);
            if (order) {
                var kotlist = [];
                if (kot_list()) {
                    kotlist = kot_list();
                    angular.forEach(kotlist, function(order, index) {
                        if (order.kot_unique_id === kot_unique_id) {
                            kotlist.splice(index, 1);
                        }
                    });
                    LocalStorage.add('kot_list', kotlist);
                    // console.log(order);
                    return order;
                } else {
                    return {};
                }
            }
        }

        function get_order_by_kot(kot_unique_id) {
            var result = false;
            var kot_list = LocalStorage.get('kot_list');
            console.log(kot_list);
            angular.forEach(kot_list, function(order, index) {
                if (order.kot_unique_id === kot_unique_id) {
                    result = order;
                    console.log(order);
                }
            });

            return result;
        }

        function kot_list() {
            var kot_list = [];
            kot_list = LocalStorage.get('kot_list');
            if (kot_list) {
                return kot_list;
            } else {
                return kot_list;
            }
        }

        function set_kot_time(time) {
            _self.pos.kot_time = time;
            save();
        }

        function kot_status(status) {
            _self.kot_status = status;
            save();
        }



        /////////////////////// order hold //////////////////////////
        function hold_order() {
            var hold_order_list = [];
            if (LocalStorage.get('hold_order_list')) {
                hold_order_list = LocalStorage.get('hold_order_list');
            }
            var items = getItems();
            if (items.length > 0) {
                var mypos = getPos();
                mypos.holding_date = moment().format('MMM Do YYYY, h:mm:ss a');
                hold_order_list.push(mypos);
                LocalStorage.add('hold_order_list', hold_order_list);
            }
        }

        function hold_order_list() {
            var hold_order_list = [];
            if (LocalStorage.get('hold_order_list')) {
                hold_order_list = LocalStorage.get('hold_order_list');
            }
            return hold_order_list;
        }

        function hold_order_back(id) {
            var hold_order_list = [];

            if (LocalStorage.get('hold_order_list')) {
                hold_order_list = LocalStorage.get('hold_order_list');
                var order = hold_order_list[id];
                hold_order_list.splice(id, 1);
                LocalStorage.add('hold_order_list', hold_order_list);
                return order;
            } else {
                return {};
            }

        }


        function hold_table_order() {
            var hold_table_order_list = [];
            if (LocalStorage.get('hold_table_order_list')) {
                hold_table_order_list = LocalStorage.get('hold_table_order_list');
            }
            var items = getItems();
            if (items.length > 0) {
                var mypos = getPos();
                mypos.holding_table_date = moment().format('YYYY MMM Do, h:mm:ss a');
                mypos.table_id = get_table();
                hold_table_order_list.push(mypos);
                LocalStorage.add('hold_table_order_list', hold_table_order_list);
                LocalStorage.add('selected_table', 0);
            }
        }

        function hold_table_order_list() {
            var hold_table_order_list = [];
            if (LocalStorage.get('hold_table_order_list')) {
                hold_table_order_list = LocalStorage.get('hold_table_order_list');
            }
            return hold_table_order_list;
        }

        function available_table_list() {
            var available_table_list = [];
            var table_list = LocalStorage.get('TABLES');
            angular.forEach(table_list, function(table) {
                if (!is_table_has_order(table.table_id)) {
                    available_table_list.push(table);
                }
            });
            if (table_list != null && table_list.length > 0) {
                return available_table_list;
            } else {
                return null;
            }

        }

        function hold_table_order_back(table_id) {
            var myorder = {};
            var hold_table_order_list = LocalStorage.get('hold_table_order_list');

            if (hold_table_order_list) {
                angular.forEach(hold_table_order_list, function(order, index) {
                    if (order.table_id == table_id) {
                        myorder = order;
                        hold_table_order_list.splice(index, 1);
                        LocalStorage.add('hold_table_order_list', hold_table_order_list);
                    }
                });
                // hold_table_order_list.splice(table_id, 1);

                return myorder;
            } else {
                return {};
            }

        }

        function table_order(table_id) {
            var hold_table_order_list = [];
            var myorder = {};
            if (LocalStorage.get('hold_table_order_list')) {
                hold_table_order_list = LocalStorage.get('hold_table_order_list');
                angular.forEach(hold_table_order_list, function(order, index) {
                    if (order.table_id == table_id) {
                        myorder = order;
                    }
                });
                return myorder;
            } else {
                return {};
            }
        }

        function is_table_has_order(table_id) {
            var hold_table_order_list = [];
            var has_order = false;
            if (LocalStorage.get('hold_table_order_list')) {
                hold_table_order_list = LocalStorage.get('hold_table_order_list');
                angular.forEach(hold_table_order_list, function(order, index) {
                    if (order.table_id == table_id) {
                        has_order = true;
                    }
                });
                return has_order;
            } else {
                return false;
            }

        }


        function setOrderType(type) {
            _self.pos.order_type = type;
            save();
            return getOrderType();
        }

        function getOrderType() {
            return getPos().order_type;
        }

        function getOrderTypes() {

            var Order_type = LocalStorage.get('Order_type');
            if (Order_type) {
                return Order_type;
            } else {
                return 0
            }

        }

        function set_table(table_id) {
            _self.pos.table_id = table_id;
            save();
            return get_table();
        }

        function get_table() {
            return getPos().table_id;
        }

        function set_note(note) {
            _self.pos.additional_instruction = note;
            save();
            return get_note();
        }

        function get_note() {
            return getPos().additional_instruction;
        }

        function get_servers() {
            var data = [];
            var servers = LocalStorage.get("servers");
            angular.forEach(servers, function(server, index) {
                data.push({
                    id: server.id.toString(),
                    name: server.name,
                    type: server.type
                })
            });
            if (data != null && data != []) {
                return data;
            } else {
                return null;
            }
        }

        function set_server(server_id) {
            _self.pos.server_id = server_id;
            save();
        }

        function set_customer_detail(detail) {
            _self.pos.customer_detail = detail;
            save();
        }

        function set_customer_address(detail) {
            _self.pos.customer_adress = detail;
            save();
        }

        return {
            init: init,
            addItem: addItem,
            getDefaultSelectDeal: getDefaultSelectDeal,
            getSelectDeal: getSelectDeal,
            isItemExist: isItemExist,
            getItemById: getItemById,
            removeItemById: removeItemById,
            getTotalUniqueItems: getTotalUniqueItems,
            setPos: setPos,
            getPos: getPos,
            getItems: getItems,
            restore: restore,
            save: save,
            setShipping: setShipping,
            getShipping: getShipping,
            setShippingType: setShippingType,
            getShippingType: getShippingType,
            setShippingAddress: setShippingAddress,
            getShippingAddress: getShippingAddress,
            setTaxRate: setTaxRate,
            getTaxRate: getTaxRate,
            getTax: getTax,
            getTotalItems: getTotalItems,
            getSubTotal: getSubTotal,
            totalCost: totalCost,
            QtyChange: QtyChange,
            empty: empty,
            getOrderItems: getOrderItems,
            setDiscount: setDiscount,
            setDiscountRate: setDiscountRate,
            getDiscount: getDiscount,
            getServingSize: getServingSize,
            option_sum: option_sum,
            save_kot: save_kot,
            get_order_by_kot: get_order_by_kot,
            kot_unique_id: kot_unique_id,
            kot_list: kot_list,
            setOrderType: setOrderType,
            getOrderType: getOrderType,
            getOrderTypes: getOrderTypes,
            hold_order: hold_order,
            hold_order_list: hold_order_list,
            hold_order_back: hold_order_back,
            hold_table_order: hold_table_order,
            hold_table_order_list: hold_table_order_list,
            available_table_list: available_table_list,
            hold_table_order_back: hold_table_order_back,
            table_order: table_order,
            set_table: set_table,
            get_table: get_table,
            is_table_has_order: is_table_has_order,
            get_servers: get_servers,
            set_server: set_server,
            setPaymentMethod: setPaymentMethod,
            getPaymentMethod: getPaymentMethod,
            getPaymentConfirmed: getPaymentConfirmed,
            setPaymentConfirmed: setPaymentConfirmed,
            setCustomerID: setCustomerID,
            getCustomerID: getCustomerID,
            set_note: set_note,
            get_note: get_note,
            set_kot_time: set_kot_time,
            kot_status: kot_status,
            kot_remove: kot_remove,
            set_customer_detail: set_customer_detail,
            set_customer_address: set_customer_address,
            save_kot_online_order: save_kot_online_order,
        };
    }

})();