(function() {
    'use strict';

    angular
        .module('app')
        .controller('ForgotPassCtrl',['$location','UserServices','configuration', ForgotPassCtrl]);

    /* @ngInject */
    function ForgotPassCtrl($location,UserServices ,configuration) {
        var vm = this;
       	vm.forgot = {
       		venue_id: configuration.VENUE_ID,
        	email: ""
       	};
       	
       	vm.msg = "";
        vm.alert = false;

       vm.hide_msg =function(){
          vm.alert = false;
       }

       vm.forgotPass = function(){
       		UserServices.forgotPass(vm.forgot)
       		 .then(forgotSuccess)
             .catch(forgotError);
       };

       function forgotSuccess(response) {
        if(response.data.status){
            
             vm.alert = true;
             vm.msg = "New password has been sent to your email address";
           }else{
            alert("Test 2");
             vm.alert = true;
             vm.msg = response.error;
           }
        }

        function forgotError(response) {
          vm.alert = true;
          vm.msg = "Unable to connect to the server";
        }  
      
    }
})();