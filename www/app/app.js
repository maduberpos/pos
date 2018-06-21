(function() {
    'use strict';
    angular.module("app", [
        "ionic",
        'btford.socket-io',
        "ngSQLite",
        'ngSanitize',
        "revolunet.stepper",
        "angular-electron",
        "ionic.rating",
        "ionic-toast",
        "ion-datetime-picker",
        "ngMap",
        // "monospaced.qrcode",
    ])

    .run(["$ionicPlatform", "currentUser", "configuration", "LocalStorage", "MenuServices", "UserServices", "notificationService", "$location", "loading", "Menu", "app", "$rootScope", "$timeout", "$document",
            function($ionicPlatform, currentUser, configuration, LocalStorage, MenuServices, UserServices, notificationService, $location, loading, Menu, app, $rootScope, $timeout, $document) {
                app.setBadgeCount(0);


                // app.getLoginItemSettings();

                var template = [{
                        label: 'View',
                        submenu: [
                            { role: 'reload' },
                            { role: 'forcereload' },
                            { role: 'toggledevtools' },
                            { type: 'separator' },
                            { role: 'resetzoom' },
                            { role: 'zoomin' },
                            { role: 'zoomout' },
                            { type: 'separator' },
                            { role: 'togglefullscreen' }
                        ]
                    },
                    {
                        role: 'window',
                        submenu: [
                            { role: 'minimize' },
                            { role: 'close' }
                        ]
                    }
                ];
                var menu = Menu.buildFromTemplate(template);
                Menu.setApplicationMenu(menu);


                if (!LocalStorage.get("TOTAL_SALE")) {
                    LocalStorage.add("TOTAL_SALE", 0);
                }
                require('dns').lookup(require('os').hostname(), function(err, add, fam) {
                    LocalStorage.add('ip_address', add);
                    // return 
                });
                $ionicPlatform.ready(function() {
                    if (!LocalStorage.get("MENU_VERSION")) {
                        LocalStorage.add("MENU_VERSION", 1);
                    }
                    if (!LocalStorage.get('CURRENT_VENUE_ID')) {
                        LocalStorage.add('CURRENT_VENUE_ID', 1);
                    }
                    if (!LocalStorage.get('isCashIn')) {
                        LocalStorage.add('isCashIn', false);
                    }
                    if (!LocalStorage.get('CHECKIN')) {
                        LocalStorage.add('CHECKIN', false);
                    }
                    if (!LocalStorage.get('kot_counter')) {
                        LocalStorage.add('kot_counter', 0);
                    }

                    if (window.navigator.onLine) {
                        if (currentUser.is_loggedin()) {
                            loading.show();
                            MenuServices.setTables().then(function(res) {
                                LocalStorage.add("TABLES", res.data.data);
                            }).catch().finally(function() {
                                // Hide loading spinner whether our call succeeded or failed.
                            });
                            MenuServices.get_order_types()
                                .then(function(response) {
                                    LocalStorage.add("Order_type", response.data.data);
                                })
                                .catch(function(response) {
                                    console.log(response);
                                });
                            MenuServices.get_servers()
                                .then(function(response) {
                                    LocalStorage.add("servers", response.data.data);
                                })
                                .catch(function(response) {
                                    console.log(response);
                                });
                            MenuServices.handshake()
                                .then(function(response) {
                                    LocalStorage.add("VENUE", response.data.data.venue);
                                    LocalStorage.add("SETTING", response.data.data.setting);
                                    LocalStorage.add("MENU_VERSION", response.data.data.venue.menu_version);
                                    MenuServices.update_menu();
                                    loading.hide();
                                })
                                .catch(function(response) {
                                    //   console.log(response);
                                    loading.hide();
                                });
                        }
                    }
                });

                // Timeout timer value
                var TimeOutTimerValue = 7200000;

                // Start a timeout
                var TimeOut_Thread = $timeout(function() { LogoutByTimer() }, TimeOutTimerValue);
                var bodyElement = angular.element($document);

                angular.forEach(['keydown', 'keyup', 'click', 'mousemove', 'DOMMouseScroll', 'mousewheel', 'mousedown', 'touchstart', 'touchmove', 'scroll', 'focus'],
                    function(EventName) {
                        bodyElement.bind(EventName, function(e) { TimeOut_Resetter(e) });
                    });

                function LogoutByTimer() {
                    UserServices.logout();
                    $location.path('unauth/login');
                }

                function TimeOut_Resetter(e) {
                    /// Stop the pending timeout
                    $timeout.cancel(TimeOut_Thread);
                    /// Reset the timeout
                    TimeOut_Thread = $timeout(function() { LogoutByTimer() }, TimeOutTimerValue);
                }

                const noise = new Audio('audio/notification.MP3');
                if (currentUser.profile()) {
                    if (configuration.env === 'pro') {
                        firebase.database()
                            .ref('pro/new-orders/' + currentUser.profile().venue_id)
                            .on('value', function(data) {
                                // console.log(data.val() + 'new' + Date.now());
                                if (LocalStorage.get('order_notification' + currentUser.profile().user_id)) {
                                    if (data.val() >= LocalStorage.get('order_notification')) {
                                        LocalStorage.add('order_notification', Date.now())
                                        notificationService.OrderNotification();

                                        noise.play()

                                    }
                                }
                            });
                    }
                    if (configuration.env === 'dev') {
                        firebase.database()
                            .ref('dev/new-orders/' + currentUser.profile().venue_id)
                            .on('value', function(data) {
                                // console.log(data.val() + 'new' + Date.now());
                                if (LocalStorage.get('order_notification' + currentUser.profile().user_id)) {
                                    if (data.val() >= LocalStorage.get('order_notification')) {
                                        LocalStorage.add('order_notification', Date.now())
                                        notificationService.OrderNotification();

                                        noise.play()

                                    }
                                }
                            });
                    }
                }
            }
        ])
        .config(["$stateProvider", "$urlRouterProvider", "currentUserProvider", "$ionicConfigProvider", function($stateProvider, $urlRouterProvider, currentUserProvider, $ionicConfigProvider) {
                $ionicConfigProvider.scrolling.jsScrolling(false);
                $stateProvider
                    .state('unauth', {
                        abstract: true,
                        url: "/unauth",
                        controller: function($scope, $location, currentUser) {
                            // console.log();
                            if (currentUser.is_loggedin()) {
                                $location.path('app/pos');
                            }
                        },
                        templateUrl: "app/layout/unauthorised.html",

                    })
                    .state('unauth.login', {
                        url: "/login",
                        views: {
                            'unauthorised': {
                                templateUrl: "app/user/login.html"
                            }
                        }
                    })

                .state('app', {
                    abstract: true,
                    url: "/app",
                    controller: function($scope, $location, currentUser) {
                        // console.log();
                        if (!currentUser.is_loggedin()) {
                            $location.path('unauth/login');
                        }
                    },
                    templateUrl: "app/layout/menu-layout.html"
                })

                .state('app.pos', {
                    url: "/pos",
                    cache: false,
                    views: {
                        'mainContent': {
                            templateUrl: "app/pos/pos.html"
                        }
                    }
                })

                .state('app.table', {
                        url: "/table",
                        views: {
                            'mainContent': {
                                templateUrl: "app/pos/table.html"
                            }
                        }
                    })
                    .state('app.history', {
                        url: "/history",
                        views: {
                            'mainContent': {
                                templateUrl: "app/pos/history.html"
                            }
                        }
                    })
                    .state('app.orders', {
                        url: "/orders",
                        views: {
                            'mainContent': {
                                templateUrl: "app/orders/orders.html",
                                controllers: "OrderCtrl"
                            }
                        }
                    })
                    .state('app.posorders', {
                        url: "/posorders",
                        views: {
                            'mainContent': {
                                templateUrl: "app/orders/posorders.html",
                                controllers: "PosOrderCtrl"
                            }
                        }
                    })
                    .state('app.payment', {
                        url: "/pos",
                        views: {
                            'mainContent': {
                                templateUrl: "app/pos/payment.html"
                            }
                        }
                    })
                    .state('app.kot-list', {
                        url: "/kot-list",
                        views: {
                            'mainContent': {
                                templateUrl: "app/pos/kot-list.html"
                            }
                        }
                    })
                    .state('app.profile', {
                        url: "/profile",
                        views: {
                            'mainContent': {
                                templateUrl: "app/user/profile.html",
                            }
                        }
                    })
                    .state('app.reservations', {
                        url: "/reservations",
                        views: {
                            'mainContent': {
                                templateUrl: "app/reservations/reservations.html",
                                controllers: "reservationsCtrl"
                            }
                        }
                    })
                    .state('app.customers', {
                        url: "/customers",
                        views: {
                            'mainContent': {
                                templateUrl: "app/customers/customers.html",
                                controllers: "customersCtrl"
                            }
                        }
                    })
                    .state('app.settings', {
                        url: "/settings",
                        views: {
                            'mainContent': {
                                templateUrl: "app/settings/settings.html",
                                controllers: "settingsCtrl"
                            }
                        }
                    })
                    .state('app.reports', {
                        url: "/reports",
                        views: {
                            'mainContent': {
                                templateUrl: "app/reports/reports.html",
                                controllers: "reportsCtrl"
                            }
                        }
                    })
                    .state('app.checkincheckout', {
                        url: "/checkincheckout",
                        views: {
                            'mainContent': {
                                templateUrl: "app/checkIn-checkOut/checkin-checkout.html"
                            }
                        }
                    })
                    .state('app.cashincashout', {
                        url: "/cashincashout",
                        views: {
                            'mainContent': {
                                templateUrl: "app/cashin-cashout/cashin-cashout.html"
                            }
                        }
                    })
                    .state('app.bussinessday', {
                        url: "/bussinessday",
                        views: {
                            'mainContent': {
                                templateUrl: "app/bussiness_day/bussiness_day.html"
                            }
                        }
                    })


                // if none of the above states are matched, use this as the fallback
                if (currentUserProvider.$get().is_loggedin()) {
                    $urlRouterProvider.otherwise('app/pos');
                } else {
                    $urlRouterProvider.otherwise('unauth/login');
                }

            }]

        )
        .factory('Socket', function(socketFactory, LocalStorage) {
            var vm = this;
            vm.ip = LocalStorage.get('ip_address');

            vm.ip = String(vm.ip);
            var myIoSocket = io.connect('http://' + vm.ip + ':3000');
            //https://mjachatapp-danial326.c9users.io (cloud9 server link)
            var mySocket = socketFactory({
                ioSocket: myIoSocket
            });
            return mySocket;
        });
})();