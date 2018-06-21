(function() {
    'use strict';

    angular
        .module('app')
        .factory('CustomersServices', ['MyHTTP', 'setting', CustomersServices]);

    /* @ngInject */
    function CustomersServices(MyHTTP, setting) {
        var customers = {
            customers: customers,
            delete_customer: delete_customer,
            update_customer: update_customer,
            change_customer_status: change_customer_status,
            change_password: change_password,
            save_customer: save_customer,
            get_orders_by_customer: get_orders_by_customer,
            search_customers: search_customers
        };
        return customers;

        ////////////////

        function customers(page) {
            return MyHTTP.get_by_two_params('get_customers', page, 'page');
        }

        function delete_customer(data) {
            //console.log(data);
            return MyHTTP.post(data, 'admin/delete_customer');
        }

        function update_customer(data) {
            //console.log(data);
            return MyHTTP.post(data, 'admin/update_customer');
        }

        function save_customer(data) {

            return MyHTTP.post(data, 'save_customer');
        }



        function change_customer_status(customer_id) {
            var data = {
                customer_id: customer_id
            };

            return MyHTTP.post1(data, 'change_customer_new_status');
        }

        function change_password(data) {
            return MyHTTP.post(data, 'change_password');
        }

        function get_orders_by_customer(customer_id, page) {
            var venue_id = setting.venue_setting().venue_id;
            return MyHTTP.get_by_no_params('get_orders_by_customer?venue_id=' + venue_id + '&customer_id=' + customer_id + '&page=' + page);
        }

        function search_customers(name) {
            var venue_id = setting.venue_setting().venue_id;
            return MyHTTP.get_by_no_params('search_customers_by_venue_id?venue_id=' + venue_id + '&search=' + name);
        }
    }
})();