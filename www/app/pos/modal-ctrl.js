(function() {
    'use strict';

    angular
        .module('app')
        .controller('ModalCtrl', ['$rootScope','modalService', 'PosServices', ModalCtrl]);

    /* @ngInject */
    function ModalCtrl($rootScope,modalService, PosServices) {
        var vm = this;
        vm.init =  function () {
          vm.current_option = {};
          vm.current_option_id = 0;
          vm.selected_options = {};
          vm.final_option = {};
          vm.optionsid = 0;
          vm.selected_price = {};
          vm.menu = modalService.getData();
          vm.selected_deal = 0;
          vm.item = {};
          vm.item.quantity = 1;
          vm.selected_deal = PosServices.getDefaultSelectDeal(vm.menu); // selected deal
        }

        vm.init();

        vm.hide = function() {
             modalService.hideModal();
        };

        vm.selected_option = function(id) {
            var selected = vm.selected_options;
            var curOption = {};
            angular.forEach(vm.menu.menu_options, function(option) {
                if (option.id === id) {
                    curOption = option;
                }
            });
            curOption.selectedByID = selected[id];

            if (curOption.option_type === 'radio') {
                curOption.selectedByName = '';
                angular.forEach(curOption.items, function(item) {
                    if (item.id === curOption.selectedByID) {
                        curOption.selectedByName = item.item_name;
                        curOption.selectedItemPrice = item.item_price;
                    }
                });
            } else if (curOption.option_type === 'checkbox') {
                curOption.selectedByName = {};
                curOption.selectedItemPrice = {};
                curOption.fulla = [];
                angular.forEach(curOption.selectedByID, function(value, key) {
                   if(value){
                    var myItem = {};
                    myItem = option_item_by_id(curOption.items, key);
                    curOption.selectedByName[myItem.item_name] = value;
                    curOption.selectedItemPrice[key] = myItem.item_price;
                    curOption.fulla.push(myItem);
                   }
                });
            }

            vm.final_option[id] = curOption;
        };

        function option_item_by_id(items, item_id) {
            var myItem = {};
            angular.forEach(items, function(item) {
                if (item.id == item_id) {
                    myItem = item
                }
            });
            return myItem;
        };

      vm.ServingSize = function(prices) {
        vm.item.serving_size = PosServices.getServingSize(prices, parseInt(vm.selected_deal));
      };

      vm.changeQuantity = function(qty) {
        vm.item.quantity = qty;
      }

      vm.add_item = function() {
          vm.item.menu_options = vm.menu.menu_options;
          vm.item.selected_options = vm.selected_options;
          vm.item.menu_item_id = vm.menu.menu_item_id;
          vm.item.menu_item_name = vm.menu.menu_item_name;
          vm.item.category_id = vm.menu.category_id;
          vm.item.category_name = vm.menu.category_name;
          vm.item.image = vm.menu.image;
          vm.item.image_key = vm.menu.image_key;
          vm.item.image_url = vm.menu.image_url;
          vm.item.description = vm.menu.description;
          vm.item.prices = [PosServices.getSelectDeal(vm.menu, vm.selected_deal)];
          vm.item.price_id = vm.item.prices[0].price_id;
          vm.item.discount = vm.menu.discount;

          PosServices.addItem(vm.item);
          $rootScope.$emit('itemAdded',true);
          modalService.setData({});
          modalService.hideModal();
        }
    }
})();
