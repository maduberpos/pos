(function() {
    'use strict';

    angular
        .module('app')
        .controller('ProfileCtrl', ['UserServices', 'configuration', 'currentUser', 'setting', 'ionicToast', ProfileCtrl]);

    /* @ngInject */
    function ProfileCtrl(UserServices, configuration, currentUser, setting, ionicToast) {
        var vm = this;
        vm.venue_detail = setting.venue_setting();
        vm.user1 = {
            user_id: null,
            name: '',
            email: '',
            password: '',
        }

        function init() {
            if (currentUser.profile()) {
                vm.user = currentUser.profile();
                vm.user1 = {
                    user_id: vm.user.user_id,
                    name: vm.user.name,
                    email: vm.user.email,
                }
            }
        }
        init();




        vm.update = function(user) {
            vm.spinner = true;
            UserServices.update(user)
                .then(forgotSuccess)
                .catch(forgotError);
        };

        function forgotSuccess(response) {
            console.log(response.data.data);
            if (response.data.status) {
                var user = response.data.data
                user.is_logged_in = true;
                currentUser.save(user);
                vm.spinner = false;
                ionicToast.show(response.data.msg, 'top', false, 1000);
            } else {
                vm.spinner = false;
                ionicToast.show(response.data.error, 'top', false, 1000);
            }
        }

        function forgotError(response) {
            vm.spinner = false;
            ionicToast.show('Unable to connect to server', 'top', false, 1000);
        }

    }
})();