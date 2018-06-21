(function() {
    'use strict';

    angular
        .module('app')
        .factory('OrderServices', ['MyHTTP', 'LocalStorage', 'PosServices', OrdersServices]);

    /* @ngInject */
    function OrdersServices(MyHTTP, LocalStorage, PosServices) {
        var orders = {
            orders: orders,
            posorders: posorders,
            update_order_status: update_order_status,
            change_order_new_status: change_order_new_status,
            update_order_rider: update_order_rider,
            change_order_payment: change_order_payment,
            update_estimated_time: update_estimated_time,
            search_orders: search_orders,
            update_order_checkin_cashin_business_id: update_order_checkin_cashin_business_id,
            update_payment_method: update_payment_method,
            update_discount: update_discount
                // save_kot: save_kot
        };
        return orders;

        ////////////////

        function orders(platform, order_type, page) {
            return MyHTTP.get_by_three_params('get_orders', platform, order_type, page, 'page');
        }

        function posorders(order_type, page) {
            return MyHTTP.get_by_pos_history('get_pos_orders', order_type, page, 'page');
        }

        function update_order_status(data) {
            return MyHTTP.post1(data, 'update_order_status');
        }

        function update_order_rider(data) {
            return MyHTTP.post1(data, 'update_order_rider');
        }

        function change_order_payment(data) {
            return MyHTTP.post1(data, 'change_order_payment');
        }

        function update_estimated_time(data) {
            return MyHTTP.post1(data, 'update_estimated_time');
        }


        function change_order_new_status(data) {
            return MyHTTP.post1(data, 'change_order_new_status');
        }

        function search_orders(name) {
            return MyHTTP.get_by_two_params('search_orders', name, 'search');
        }


        function update_order_checkin_cashin_business_id(data) {
            return MyHTTP.post1(data, 'update_order_checkin_cashin_business_id');
        }

        function update_payment_method(data) {
            return MyHTTP.post1(data, 'update_payment_method');
        }

        function update_discount(data) {
            return MyHTTP.post1(data, 'update_discount');
        }

        // function save_kot(order) {
        //     var kot_list = [];
        //     if (LocalStorage.get('kot_list')) {
        //         kot_list = LocalStorage.get('kot_list');
        //     }
        //     var items = order.order_detail;
        //     console.log(order);
        //     if (items.length > 0) {
        //         var mypos = order;

        //         //mypos.selected_customer = LocalStorage.get('selected_customer');

        //         mypos.kot_status === 'new'
        //         mypos.kot_datetime = moment().format('D-MM-YYYY h:mm:ss a');
        //         if (mypos.kot_unique_id != '') {
        //             kot_list.push(mypos);
        //             LocalStorage.add('kot_list', kot_list);
        //         } else {
        //             mypos.kot_unique_id = PosServices.kot_unique_id();
        //             kot_list.push(mypos);
        //             LocalStorage.add('kot_list', kot_list);
        //         }

        //     } else {
        //         kot_list.push(mypos);
        //         LocalStorage.add('kot_list', kot_list);
        //     }

        // }

    }
})();