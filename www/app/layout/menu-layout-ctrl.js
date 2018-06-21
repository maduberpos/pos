(function() {
    'use strict';

    angular
        .module('app')
        .controller('MenuLayoutCtrl', ['$scope', 'MyHTTP', 'UserServices', 'currentUser', 'setting', '$ionicModal', '$ionicPopup', '$location', 'MenuServices', 'LocalStorage', 'loading', '$window', 'PosServices', '$ionicPopover', 'checkin_checkoutService', MenuLayoutCtrl]);

    /* @ngInject */
    function MenuLayoutCtrl($scope, MyHTTP, UserServices, currentUser, setting, $ionicModal, $ionicPopup, $location, MenuServices, LocalStorage, loading, $window, PosServices, $ionicPopover, checkin_checkoutService) {
        var vm = this;
        vm.user = {};
        vm.totalItems = 0;
        vm.tables = [];
        profile();
        vm.order_count = 0;
        vm.setting = setting.venue_setting();
        $scope.hold_order_list = PosServices.hold_order_list();

        function profile() {
            vm.tables = LocalStorage.get('TABLES');
            vm.user = currentUser.profile();
            vm.current_venue = LocalStorage.get('SETTING');

            // console.log(vm.current_venue);
            MyHTTP.get_by_three_params('get_orders', '', '', 0, 'page').then(function(response) {
                var order = response.data.data;
                angular.forEach(order, function(ordr) {
                    if (ordr.status === 0) {
                        vm.order_count += 1;
                    }
                });
                LocalStorage.add('new_order_count', vm.order_count);
            });
        }
        //set permission  for dashboard
        vm.dashbord_permision = function() {

                if (vm.user.user_permissions.pos_dashboard) {
                    return true;
                } else {
                    return false;
                }
            }
            //set permission  for orders
        vm.order_permision = function() {
                if (vm.user.user_permissions.pos_orders) {
                    return true;
                } else {
                    return false;
                }
            }
            //set permission  for customers
        vm.customer_permision = function() {
            if (vm.user.user_permissions.pos_customers) {
                return true;
            } else {
                return false;
            }
        }

        //set permission  for reports
        vm.report_permision = function() {
                if (vm.user.user_permissions.pos_reports === '1') {
                    return true;
                } else {
                    return false;
                }
            }
            //set permission  for reservations
        vm.reservation_permision = function() {
                if (vm.user.user_permissions.pos_reservations === '1') {
                    return true;
                } else {
                    return false;
                }
            }
            //set permission  for settigs
        vm.setting_permision = function() {
            if (vm.user.user_permissions.pos_settings === '1') {
                return true;
            } else {
                return false;
            }
        }


        vm.logout = function() {

            if (LocalStorage.get('isCashIn')) {
                vm.isCashIn();
            } else {
                vm.user = LocalStorage.get('USER');
                vm.checkin_id = LocalStorage.get('CHECKIN_ID');
                if ($scope.hold_order_list.length <= 0) {
                    UserServices.logout();
                    $location.path('unauth/login');
                } else {
                    alert('Dear ' + vm.user.name + ' you  must clear your hold list before checkout');
                }
            }
        };

        vm.isCashIn = function() {

            if (LocalStorage.get('isCashIn')) {
                // var isCashInPopup = $ionicPopup.alert({
                //     title: 'Cash-out is required!',
                //     template: 'You must cash-out before logout'
                // });
                // isCashInPopup.then(function(res) {
                //     // $location.path('app/cashincashout');
                // });
                alert('You must cash-out before logout');
            }
        };



        vm.kot_counter = function() {
            if (LocalStorage.get('kot_list')) {
                var kot_counter = LocalStorage.get('kot_list');
                return kot_counter.length;
            } else {
                return 0;
            }
        }
        vm.order_counter = function() {
            if (LocalStorage.get('new_order_count')) {
                var order_counter = LocalStorage.get('new_order_count');
                return order_counter;
            } else {
                return 0;
            }
        }
        MenuServices.get_venues().then(function(res) {
                vm.venues = res.data.data;
            }).catch()
            .finally(function() {

            });

        $scope.changeVenue = function(venue_id) {
            MenuServices.set_current_venue_id(venue_id);
            if (!LocalStorage.get("MENU_VERSION")) {
                LocalStorage.add("MENU_VERSION", false);
            }
            loading.show();
            MenuServices.handshake()
                .then(function(response) {
                    LocalStorage.add("VENUE", response.data.data.venue);
                    LocalStorage.add("CURRENT_VENUE_ID", response.data.data.setting.venue_id);
                    LocalStorage.add("SETTING", response.data.data.setting);
                    LocalStorage.add("MENU_VERSION", response.data.data.venue.menu_version);
                    MenuServices.update_menu();
                    PosServices.empty();
                    loading.hide();
                    vm.modal.hide();
                    $window.location.reload();
                })
                .catch(function(response) {
                    loading.hide();
                });
        }

        $scope.close = function() {
            vm.modal.hide();
        }


        $ionicPopover.fromTemplateUrl('templates/popover.html', {
            scope: $scope,
        }).then(function(popover) {
            $scope.popover = popover;
        });





    }
})();