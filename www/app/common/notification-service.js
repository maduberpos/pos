(function() {
    'use strict';

    angular
        .module('app')
        .factory('notificationService', [notificationService]);

    function notificationService() {

        const notifier = require('node-notifier');
        const path = require('path');

        function OrderNotification() {
            notifier.notify({
                    title: "Order Notification alert",
                    message: "You have new online order.",
                    // icon: ('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfUPfdxYQ86K60b7zbZCz6pgjoobkXab0rul1lt4F_UEQIgTCvOA'), // Absolute path (doesn't work on balloons)
                    sound: false, // Only Notification Center or Windows Toasters
                    wait: true, // Wait with callback, until user action is taken against notification
                    // backgroundcolor: '#fff'
                },
                function(err, response) {
                    // Response is response from notification
                }
            );

            notifier.on('click', function(notifierObject, options) {
                // Triggers if `wait: true` and user clicks notification
            });

            notifier.on('timeout', function(notifierObject, options) {
                // Triggers if `wait: true` and notification closes
            });

            // end node notification
        }

        function msgNotifications(title, msg) {
            notifier.notify({
                    title: 'Msg Notification alert',
                    message: 'New msg from customer',
                    // icon: path.join(__dirname, '../../img/app/logo.png'), // Absolute path (doesn't work on balloons)
                    sound: true, // Only Notification Center or Windows Toasters
                    wait: true // Wait with callback, until user action is taken against notification
                },
                function(err, response) {
                    // Response is response from notification
                }
            );

            notifier.on('click', function(notifierObject, options) {
                // Triggers if `wait: true` and user clicks notification
            });

            notifier.on('timeout', function(notifierObject, options) {
                // Triggers if `wait: true` and notification closes
            });

            // end node notification
        }

        return {
            OrderNotification: OrderNotification,
            msgNotifications: msgNotifications
        }

    }
})();