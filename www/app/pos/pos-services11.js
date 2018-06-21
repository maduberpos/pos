(function() {
    'use strict';

    angular
        .module('app')
        .run(['PosServices', 'LocalStorage', function(PosServices, LocalStorage) {
            // PosServices
            if (angular.isObject(LocalStorage.get('pos'))) {
                PosServices.restore(LocalStorage.get('pos'));
            } else {
                PosServices.init();
            }
        }])
        .factory('PosServices', ['LocalStorage', PosServices]);


    function PosServices(LocalStorage) {
        var _self = this;

        function init() {
            _self.pos = {
                pos_id: 0,
                shipping: 0,
                shippingType: null,
                discount: 0,
                discountRate: 0,
                sub_total: 0,
                total: 0,
                address_id: 0,
                taxRate: 0,
                tax: 0,
                items: []
            };
            save();
        }

        function addItem(item) {
            if (isItemExist(item.menu_item_id)) {
                var pos = getPos();
                angular.forEach(pos.items, function(itm) {
                    if (itm.menu_item_id === item.menu_item_id) {
                        itm.quantity = (itm.quantity + 1);
                    }
                });
                setPos(pos);
            } else {
                item.quantity = 1;
                _self.pos.items.push(item);
                save();
            }
        }

        function option_sum(item_id) {
            var sum = 0;
            if (isItemExist(item_id)) {
                var pos = getPos();
                angular.forEach(pos.items, function(itm) {
                    if (itm.menu_item_id === item_id) {
                        if (itm.menu_options.length > 0) {
                            angular.forEach(itm.menu_options, function(option) {
                                if (option.option_type == 'checkbox') {
                                    angular.forEach(option.selectedItemPrice, function(option) {
                                        sum += option;
                                    });
                                }
                                if (option.option_type == 'radio') {
                                    sum += option.selectedItemPrice;
                                }
                            });
                        }
                    }
                });

            }
            return sum;
        }

        function getServingSize(prices, id) {

            var serving_size = '';
            angular.forEach(prices, function(price) {
                if (price.price_id == id) {
                    serving_size = price.serving;
                }
            });
            return serving_size;
        }

        /// take menu item and return selected price id
        function getDefaultSelectDeal(item) {
            var selected_deal_id = false;
            if (isItemExist(item.menu_item_id)) {
                // if item exist in the pos
                if (item.prices.default_price) {
                    selected_deal_id = item.prices.price_id;
                }
            } else {
                // item is not exist in the pos
                angular.forEach(item.prices, function(price) {
                    if (price.default_price) {
                        selected_deal_id = price.price_id;
                    }
                });
                // if by default price is not selected then return first item id
                if (selected_deal_id == false) {
                    selected_deal_id = item.prices[0].price_id;
                }
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

            angular.forEach(item.prices, function(price) {
                if (price.price_id == deal_id) {
                    console.log(price);
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

            angular.forEach(items, function(item) {
                if (item.menu_item_id == id && item.menu_options.length === 0) {
                    build = true;
                }
                if (item.menu_item_id == id && item.menu_options.length > 0) {
                    build = false;
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

            angular.forEach(items, function(item) {
                if (item.menu_item_id == id) {
                    build = item;
                }
            });
            return build;
        }

        function removeItemById(id) {
            var pos = getPos();
            angular.forEach(pos.items, function(item, index) {
                if (item.menu_item_id == id) {
                    pos.items.splice(index, 1);
                }
            });
            setPos(pos);
        }

        function QtyChange(id, qty) {
            var pos = getPos();
            angular.forEach(pos.items, function(item) {
                console.log(item);
                if (Number(item.menu_item_id) == id) {
                    item.quantity = qty;
                }
            });
            setPos(pos);
            //save();
        }


        function getTotalItems() {
            var count = 0;
            var items = getItems();
            angular.forEach(items, function(item) {
                count += item.quantity;
            });
            return count;
        }

        function getOrderItems() {
            var newItem = [];
            var items = getItems();
            angular.forEach(items, function(item, key) {
                newItem[key] = {
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

        function setTaxRate(taxRate) {
            _self.pos.taxRate = Number(parseFloat(taxRate).toFixed(2));
            save();
            return getTaxRate();
        }

        function getTaxRate() {
            return _self.pos.taxRate;
        }

        function getTax() {
            var tax = +parseFloat(((getSubTotal() / 100) * getPos().taxRate)).toFixed(2);
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

        function getSubTotal() {
            var total = 0;
            var checkboxSum = 0;
            var radioSum = 0;
            angular.forEach(getPos().items, function(item) {
                if (item.menu_options != null) {
                    angular.forEach(item.menu_options, function(option) {
                        if (option.option_type == 'checkbox') {
                            angular.forEach(option.selectedItemPrice, function(option) {
                                checkboxSum = checkboxSum + option;
                            });
                        }
                        if (option.option_type == 'radio') {
                            radioSum = radioSum + option.selectedItemPrice;
                        }
                    });
                    total += (radioSum + checkboxSum + item.prices[0].price) * item.quantity;
                    radioSum = 0;
                    checkboxSum = 0;
                } else {
                    total += item.quantity * item.prices[0].price

                }
            });
            _self.pos.sub_total = +parseFloat(total).toFixed(2);
            save();
            return +parseFloat(total).toFixed(2);


        }

        function totalCost() {
            var total = 0;
            if (getShippingType() == 'pickup') {
                total = (+parseFloat(getSubTotal() + getTax() - getDiscount()).toFixed(2));
            } else {
                total = +parseFloat(getSubTotal() + getShipping() + getTax() - getDiscount()).toFixed(2);
            }
            _self.pos.total = +parseFloat(total).toFixed(2);
            save();
            return total;

        }

        function restore(storedPos) {
            init();
            _self.pos.shipping = storedPos.shipping;
            _self.pos.discount = storedPos.discount;
            _self.pos.discountRate = storedPos.discountRate;
            _self.pos.shippingType = storedPos.shippingType;
            _self.pos.address_id = storedPos.address_id;
            _self.pos.tax = storedPos.tax;
            _self.pos.taxRate = storedPos.taxRate;
            _self.pos.sub_total = storedPos.sub_total;
            _self.pos.total = storedPos.total;

            angular.forEach(storedPos.items, function(item) {
                _self.pos.items.push(item);
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
                    "shipping": 0,
                    "discount": 0,
                    "total": 0,
                    "sub_total": 0,
                    "discountRate": 0,
                    "shippingType": 'delivery',
                    "address_id": 0,
                    "taxRate": 0,
                    "tax": 0,
                    "items": []
                }
            }

        }

        function save() {
            return LocalStorage.add('pos', _self.pos);
        }

        function empty() {
            _self.pos = {
                shipping: 0,
                shippingType: null,
                discount: 0,
                discountRate: 0,
                sub_total: 0,
                total: 0,
                address_id: 0,
                taxRate: 0,
                tax: 0,
                items: []
            };
            save();
        }

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
                mypos.holding_table_date = moment().format('MMM Do YYYY, h:mm:ss a');
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

        function set_table(table_id) {
            LocalStorage.add('selected_table', table_id);
        }

        function unset_table() {
            LocalStorage.add('selected_table', null);
        }

        function get_table() {
            if (LocalStorage.get('selected_table')) {
                return LocalStorage.get('selected_table');
            } else {
                return 0;
            }

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
            hold_order: hold_order,
            hold_order_list: hold_order_list,
            hold_order_back: hold_order_back,
            hold_table_order: hold_table_order,
            hold_table_order_list: hold_table_order_list,
            hold_table_order_back: hold_table_order_back,
            table_order: table_order,
            set_table: set_table,
            get_table: get_table,
            unset_table: unset_table,
            is_table_has_order: is_table_has_order
        };
    }

})();