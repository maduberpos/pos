(function() {
    'use strict';

    angular
        .module('app')
        .factory('UserServices', ['MyHTTP','$http', 'configuration', 'formEncode', 'currentUser', "LocalStorage", "checkin_checkoutService", UserServices]);


    function UserServices(MyHTTP,$http, configuration, formEncode, currentUser, LocalStorage, checkin_checkoutService) {

        return {
            login: login,
            register: register,
            logout: logout,
            forgotPass: forgotPass,
            update: update

        };

        function login(user) {
            return  MyHTTP.post1(user,'login');
        }

        function update(user) {
            return  MyHTTP.post1(user,'update_user_profile?user_id=' + currentUser.profile().user_id);
        }

        function register(user) {
            return  MyHTTP.post1(user,'customer/register');

        }

        function forgotPass(user) {
            return  MyHTTP.post1(user,'customer/forgot_password');

        }

        function logout() {
            var user = LocalStorage.get('USER');
            var checkin_id = LocalStorage.get('CHECKIN_ID');
            var checkoutdata = {
                checkin_id: null,
                check_type: 'checkout',
                user_id: null,
                venue_id: null
            };
            checkoutdata.user_id = user.user_id;
            checkoutdata.venue_id = user.venue_id;
            currentUser.profile.customer_id = "";
            currentUser.profile.email = "";
            currentUser.profile.Name = "";
            currentUser.profile.mobile = "";
            currentUser.profile.is_loggedin = "";
            LocalStorage.remove("MENU");
            LocalStorage.remove("CATEGORIES");
            LocalStorage.add('isCashIn', false);
            LocalStorage.add('cashin_id', 0);
            LocalStorage.add("ISDAYSTARTED", false);
            LocalStorage.add("DAYSTART_ID", 0);
            checkoutdata.checkin_id = checkin_id;
            if (checkin_id) {
                checkin_checkoutService.post_checkin_checkout(checkoutdata).then(function(res) {
                    LocalStorage.add("CHECKIN", false);
                    LocalStorage.add("LAST_CHECKIN", {});
                    LocalStorage.add("CHECKIN_ID", 0);

                }).catch().finally(function() {

                });
            }

            currentUser.remove();
        }

    } // 
})();