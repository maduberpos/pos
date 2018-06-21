(function () {
    'use strict';

    angular.module('app').controller('RegistrationCtrl', RegistrationCtrl);

    RegistrationCtrl.$inject = ['$location','UserServices','currentUser','configuration'];

    function RegistrationCtrl($location,UserServices , currentUser,configuration) {
        var vm = this;
        vm.msg = "";
        vm.alert = false;

        vm.customer = {
        	venue_id: configuration.VENUE_ID,
        	name: "",
        	mobile_number: "",
        	email: "",
        	password: "",
        };
        
       vm.hide_msg =function(){
          vm.alert = false;
       }

       vm.register = function(){
       		UserServices.register(vm.customer)
       		   .then(RegisterSuccess)
             .catch(RegisterError);
       };

       function RegisterSuccess(response) {
        if(response.data.status){
            currentUser.save(response.data.data);
             $location.path('app/categories');
           }else{
             vm.alert = true;
             vm.msg = response.error;
           }
        }

        function RegisterError(response) {
          vm.alert = true;
          vm.msg = "Unable to connect to the server";
        }  
      
    }

})();

