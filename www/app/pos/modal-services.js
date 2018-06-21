 (function() {
    'use strict';

    angular
        .module('app')
        .service('modalService', ['$ionicModal',modalService]);

    /* @ngInject */
    function modalService($ionicModal) {

        this.data = {};

        this.showModal = function() {

            var service = this;

            $ionicModal.fromTemplateUrl('app/pos/modal-service.html', {
              scope: null,
              animation: 'slide-in-up'

            }).then(function(modal) {
                service.modal = modal;
                service.modal.show();
            });
        };

        this.hideModal = function() {
            this.modal.hide();
        };

        this.setData = function(data){
            this.data = data;
        };
        this.getData = function(){
           return this.data;
        };
    }
})();
