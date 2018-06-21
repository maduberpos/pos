(function() {
    'use strict';
    angular.module('app').controller('TableCtrl', ['$scope', 'MenuServices', 'PosServices', 'loading', 'LocalStorage', '$location', TableCtrl]);

    function TableCtrl($scope, MenuServices, PosServices, loading, LocalStorage, $location) {
        var vm = this;
        vm.tables = {};
        function getTables() {
            if (MenuServices.getTables().length) {
                vm.tables = MenuServices.getTables();
            } else {
                loading.show();
                MenuServices.setTables().then(function(res) {
                    vm.tables = res.data.data;
                    loading.hide();
                    LocalStorage.add('TABLES',vm.tables);
                });
            }
        }

        getTables();

        vm.select_table = function(table_id) {
            if (PosServices.is_table_has_order(table_id)) {
                var table_order = PosServices.hold_table_order_back(table_id);
                PosServices.setPos(table_order);
                PosServices.unset_table();
            } else {
                PosServices.set_table(table_id);
            }
            $location.path('app/pos');
        };

        vm.table_order = function(id) {
            return PosServices.table_order(id);
        };

    }
})();
