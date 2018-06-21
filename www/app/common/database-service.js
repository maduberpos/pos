(function() {
    'use strict';

    angular
        .module('app')

    .constant('DB_CONFIG', {
        orders: {
            id: 'key',
            order_id: { type: 'integer' },
            additional_instruction: { type: 'text' },
            address_id: { type: 'integer' },
            business_day_id: { type: 'integer' },
            cashin_id: { type: 'integer' },
            checkin_id: { type: 'integer' },
            customer_adress: { type: 'text' },
            customer_detail: { type: 'text' },
            customer_id: { type: 'integer' },
            discount: { type: 'integer' },
            discountRate: { type: 'integer' },
            is_payment_confirmed: { type: 'integer' },
            items: { type: 'text' },
            kot_del: { type: 'text' },
            kot_status: { type: 'text' },
            kot_time: { type: 'text' },
            kot_unique_id: { type: 'text' },
            order_type: { type: 'text' },
            payment_method: { type: 'text' },
            platform: { type: 'text' },
            server_id: { type: 'integer' },
            shipping: { type: 'integer' },
            shippingType: { type: 'integer' },
            status: { type: 'integer' },
            sub_total: { type: 'integer' },
            table_id: { type: 'integer' },
            tax: { type: 'integer' },
            taxRate: { type: 'integer' },
            total: { type: 'integer' }
        }
    })

    .run(function($SQLite) {
        $SQLite.dbConfig({
            name: 'fri-chicks-db',
            description: 'Test DB',
            version: '1.0'
        });
    })

    .run(function($SQLite, DB_CONFIG) {
            $SQLite.init(function(init) {
                angular.forEach(DB_CONFIG, function(config, name) {
                    init.step();
                    $SQLite.createTable(name, config).then(init.done);

                });
                init.finish();
            });

        })
        .factory('databaseService', function($SQLite) {

            function insertIntoOrderstable(data) {
                console.log(data);
                data.items = JSON.stringify(data.items);
                data.customer_adress = JSON.stringify(data.customer_adress);
                data.customer_detail = JSON.stringify(data.customer_detail);
                $SQLite.ready(function() {
                    this.insert('orders', data) // this.replace 
                        //.then(onResult, onError) 
                });
            }

            return {
                insertIntoOrderstable: insertIntoOrderstable
            };
        });
})();