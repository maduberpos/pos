(function() {
    'use strict';

    angular
        .module('app')
        .factory('notificationService', [notificationService]);

    function notificationService() {

        const notifier = require('node-notifier');
        const path = require('path');

        function OrderNotification() {
            // notifier.notify({
            //         title: "Order Notification alert",
            //         message: "You have new online order.",
            //         // icon: ('https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQfUPfdxYQ86K60b7zbZCz6pgjoobkXab0rul1lt4F_UEQIgTCvOA'), // Absolute path (doesn't work on balloons)
            //         sound: false, // Only Notification Center or Windows Toasters
            //         wait: true, // Wait with callback, until user action is taken against notification
            //         // backgroundcolor: '#fff'
            //     },
            //     function(err, response) {
            //         // Response is response from notification
            //     }
            // );

            // notifier.on('click', function(notifierObject, options) {
            //     // Triggers if `wait: true` and user clicks notification
            // });

            // notifier.on('timeout', function(notifierObject, options) {
            //     // Triggers if `wait: true` and notification closes
            // });
            var options = {
                title: 'title',
                // subtitle String (optional) macOS - A subtitle for the notification, which will be displayed below the title.
                body: 'body',
                silent: false,
                // icon (String | NativeImage) (optional) - An icon to use in the notification.
                hasReply: false
                    // replyPlaceholder String (optional) macOS - The placeholder to write in the inline reply input field.
                    // sound String (optional) macOS - The name of the sound file to play when the notification is shown.
                    // actions NotificationAction[] (optional) macOS - Actions to add to the notification. Please read the available actions and limitations in the NotificationAction documentation.
                    // closeButtonText String (optional) macOS - A custom title for the close button of an alert. An empty string will cause the default localized text to be used.
            }
            const myNotification = new Notification([options])

            myNotification.show = () => {
                console.log('show notification')
            };
            // Notification.isSupported()
            // myNotification.onshow();

            myNotification.onclick = () => {
                console.log('Notification clicked')
            }

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