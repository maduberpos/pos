(function() {
    'use strict';
    angular.module('app')
        .controller('KotListCtrl', ["$rootScope", "$timeout", "PrinterServices", "$scope", "Socket", "PosServices", "setting", "$location", "$ionicPopup", "$ionicModal", "$interval", "LocalStorage", KotListCtrl]);

    function KotListCtrl($rootScope, $timeout, PrinterServices, $scope, Socket, PosServices, setting, $location, $ionicPopup, $ionicModal, $interval, LocalStorage) {
        var vm = this;
        vm.venue_detail = setting.venue_setting();

        function active() {
            if (PosServices.kot_list()) {
                vm.kot_list = PosServices.kot_list();
            } else {
                vm.kot_list = [];
            }
        }
        active();
        $scope.$on('$stateChangeSuccess', function() {
            active();
        });

        $interval(function() {
            active();
        }, 1000);

        vm.momentFromNow = function(datetime) {
            if (datetime) {
                vm.datetime = datetime;
                vm.datetime = vm.datetime.split(" ");
                vm.date = vm.datetime[0].split("-");
                var kotTime = moment(moment(vm.date[2] + "-" + vm.date[1] + "-" + vm.date[0] + " " + vm.datetime[1] + " " + vm.datetime[2]).toArray()).fromNow();
                return kotTime;
            } else {
                return '';
            }
        };

        Socket.on("kot_status_change", function(data) {
            if (data) {
                PosServices.change_kot_status(data);
            }
        });


        vm.kot_status = function(time) {
            var now = new Date();
            // console.log(moment.duration(moment(time).diff(moment(now))));
            var beginningTime = moment(now);
            if (beginningTime.isBefore(time)) {
                var status = true
            } else {
                var status = false
            }

            return status;

        }

        vm.remove = function() {
            PosServices.kot_remove();
        }
        vm.kot_time_left = function(time) {
            var now = new Date();
            var min = moment.duration(moment(time).diff(moment(now)))._data.minutes;
            var sec = moment.duration(moment(time).diff(moment(now)))._data.seconds;
            var time_left = min + ':' + sec;
            return time_left;
        }
        vm.backToCart = function(kot_unique_id) {
            if (PosServices.getPos().items.length <= 0) {
                var kot_order = PosServices.kot_remove(kot_unique_id);
                console.log(kot_order);
                kot_order.kot_status = 'back';
                console.log(kot_order);
                PosServices.setPos(kot_order);
                PosServices.setOrderType(kot_order.order_type);
                PosServices.set_table(kot_order.table_id);
                PosServices.set_note(kot_order.additional_instruction);
                PosServices.set_server(kot_order.server_id);
                LocalStorage.add('selected_customer', kot_order.customer_detail);
                PosServices.set_customer_detail(kot_order.customer_detail);
                $rootScope.$emit('kotBack', kot_unique_id);
                $location.path('app/pos');
            } else {
                var confirmPopup = $ionicPopup.confirm({
                    title: 'Back KOT',
                    template: 'Your cart is not empty. Are you sure want to empty your cart?',
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
                        var kot_order = PosServices.kot_remove(kot_unique_id);
                        PosServices.setPos(kot_order);
                        PosServices.setOrderType(kot_order.order_type);
                        PosServices.set_table(kot_order.table_id);
                        PosServices.set_note(kot_order.additional_instruction);
                        PosServices.set_server(kot_order.server_id);
                        PosServices.set_customer_detail(kot_order.customer_detail);
                        $rootScope.$emit('kotBack', kot_unique_id);
                        $location.path('app/pos');
                    }
                });
            }
        };
        vm.clear = function(kot_unique_id) {
            var kot_order = PosServices.kot_remove(kot_unique_id);
        }

        vm.printKOT = function(kot_unique_id) {
            var kot_order = PosServices.get_order_by_kot(kot_unique_id);
            PosServices.setPos(kot_order);
            // $rootScope.$emit('kotBack', true);
            // $location.path('app/pos');
        };

        $ionicModal.fromTemplateUrl('app/pos/view-kot-modal.html', {
            scope: $scope,
            animation: 'slide-in-up'
        }).then(function(modal) {
            vm.modal = modal;
        });

        vm.view_kot = function(kot) {
            $scope.cart = kot;
            vm.modal.show();
        };

        $scope.kotModalHide = function() {
            vm.modal.hide();
        };

        vm.printBill = function(kot) {
            vm.printkot = kot;
            $timeout(function() {
                var kotBillPrint = angular.element(document.querySelector('#kot-print'));
                PrinterServices.billPrint(kotBillPrint[0].innerHTML);
            }, 500);

        }

        vm.time = function(time) {
            if (time) {
                var r_time = time.split(' ');
                var h_m = r_time[1].split(':');

                return h_m[1] + ':' + h_m[1] + ' ' + r_time[2];
            } else {
                return '';
            }

        }

    }
})();