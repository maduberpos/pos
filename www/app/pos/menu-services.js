(function() {
    'use strict';

    angular
        .module('app')
        .factory('MenuServices', ['$window', 'LocalStorage', 'MyHTTP', MenuServices]);

    /* @ngInject */
    function MenuServices($window, LocalStorage, MyHTTP) {

        var store = $window.localStorage;

        return {
            categories: categories,
            menuByCat: menuByCat,
            MenuDetail: MenuDetail,
            handshake: handshake,
            get_venues: get_venues,
            update_menu: update_menu,
            delete_menu: delete_menu,
            menu_by_search: menu_by_search,
            getTables: getTables,
            setTables: setTables,
            placeOrder: placeOrder,
            search_customers: search_customers,
            get_current_venue_id: get_current_venue_id,
            set_current_venue_id: set_current_venue_id,
            get_order_types: get_order_types,
            get_servers: get_servers,
            save_customerAddress: save_customerAddress
        };

        var store = $window.localStorage;

        function get_current_venue_id() {
            var value = LocalStorage.get('CURRENT_VENUE_ID');

            if (value) {
                return value;
            } else {
                return 0;
            }
        }

        function set_current_venue_id(id) {
            LocalStorage.add('CURRENT_VENUE_ID', id);

        }

        function handshake() {
            return MyHTTP.get_by_one_params('handshake');
        }

        function get_venues() {
            return MyHTTP.get_by_no_params('get_venues');
        }

        function update_menu() {
            //  var defer = $q.defer();
            MyHTTP.get_by_one_params('get_menu_items')
                .then(function(response) {
                    LocalStorage.add("MENU", response.data.menu);
                    LocalStorage.add("CATEGORIES", response.data.categories);
                    return true;
                    //   defer.resolve(true);
                })
                .catch(function(response) {
                    return false;
                    // defer.reject(false);
                });

            //  return defer.promise;
        }

        function delete_menu() {
            LocalStorage.remove('MENU');
            LocalStorage.remove('CATEGORIES');
        }

        function categories() {
            return LocalStorage.get('CATEGORIES');
        }

        function menuByCat(category_id) {
            var MENU = LocalStorage.get('MENU');
            var menu = [];
            var category_name = '';
            var cat_type = '';
            angular.forEach(MENU, function(menuitem) {
                if (menuitem.category_id == category_id) {
                    menu.push(menuitem);
                    category_name = menuitem.category_name;
                    cat_type = menuitem.type;

                }
            });

            return {
                category_name: category_name,
                type: cat_type,
                menu: menu

            };

        }

        function MenuDetail(menu_id) {
            var MENU = LocalStorage.get('MENU');
            var menu = {};
            angular.forEach(MENU, function(menuitem) {
                if (menuitem.menu_item_id == menu_id) {
                    menu = menuitem;
                }
            });
            return menu;

        }

        function menu_by_search(query) {
            var MENU = LocalStorage.get('MENU');

            var result = [];

            angular.forEach(MENU, function(item) {
                if (item.menu_item_name.toLowerCase().match(query.toLowerCase())) {
                    result.push(item);
                }
            });

            return result;

        }

        function setTables() {
            return MyHTTP.get_by_one_params('get_tables');
        }

        function getTables() {
            return LocalStorage.get('TABLES');
        }

        function search_customers(name) {
            return MyHTTP.get_by_two_params('search_customers', name, 'search');
        }

        function placeOrder(data) {
            var venue_id = LocalStorage.get('VENUE').venue_id;
            return MyHTTP.post1(data, 'order?venue_id=' + venue_id + '&customer_id=' + data.customer_id);
        }

        function get_order_types() {
            return MyHTTP.get('get_order_types');
        }

        function get_servers() {
            return MyHTTP.get('get_servers');
        }

        function save_customerAddress(data) {
            return MyHTTP.post(data, 'save_customer_address');
        }
    }
})();