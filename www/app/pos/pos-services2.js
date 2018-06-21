(function() {
    'use strict';

    angular
        .module('app')
        .run(['PosServices','LocalStorage',function(PosServices ,LocalStorage){
// PosServices
	        if (angular.isObject(LocalStorage.get('pos'))) {
	            PosServices.restore(LocalStorage.get('pos'));
	        } else {
	            PosServices.init();
	        }
        }])
  .factory('PosServices', ['LocalStorage',PosServices]);

    
    function PosServices(LocalStorage) {
    	var _self = this;
      
        function init() {
        	 _self.pos = {
                shipping : null,
                shippingType : null,
                address_id : null,
                taxRate : null,
                tax : null,
                items : []
            };
          save();
        }

        function addItem(item) {

        	if(getItemById(item.item_id)){
                console.log('item exist');
        		 var pos = getPos();

	            angular.forEach(pos.items, function (itm) {
	                if(itm.item_id === item.item_id) {
	                    itm.prices = item.prices;
	                    itm.quantity = item.quantity;
	                }
	            });
	             setPos(pos);
	            
        	}else{
                console.log('item already not exist');
	        	_self.pos.items.push(item);
	        	save();
	        	
      	    }
        }
        /// take menu item and return selected price id
        function getDefaultSelectDeal(item){
            var selected_deal_id = false ;

            if(isItemExist(item.item_id)){ // if item exist in the pos

                 if(item.prices.default_price) {
                        selected_deal_id = item.prices.price_id;
                    }
            }else{ // item is not exist in the pos

               angular.forEach(item.prices, function (price) {
 
                    if(price.default_price) {
                        selected_deal_id = price.price_id;
                    }
                }); 
             // if by default price is not selected then return first item id
             if(selected_deal_id == false){ 
                    selected_deal_id = item.prices[0].price_id;
                }
            }
               
             return selected_deal_id;
        } 

        function getSelectDeal(item , deal_id){
            var selected_deal = {
                         default_price: null,
                         price:null,
                         price_id :null,
                         title:null
                };

             angular.forEach(item.prices, function (price) {
                    if(price.price_id == deal_id) {
                        selected_deal.price_id = parseInt(price.price_id);  
                        selected_deal.price = price.price;  
                        selected_deal.title = price.title;  
                        selected_deal.default_price = true;  
                    }
                });
             return selected_deal;
        }

         // return true if item exist in POS
        function isItemExist(id) {
            var items = getPos().items;
            var build = false;

            angular.forEach(items, function (item) {
                if  (item.item_id == id) {
                    build = true;
                }
            });
            return build;
        }
        

        function getItems() {
        	  return getPos().items;
        }

        function getItemById(id) {
            var items = getPos().items;
            var build = false;

            angular.forEach(items, function (item) {
                if  (item.item_id == id) {
                    build = item;
                }
            });
            return build;
        } 
       

        function removeItemById(id) {
            var pos = getPos();

            angular.forEach(pos.items, function (item, index) {
                if(item.item_id == id) {

                    pos.items.splice(index, 1);
                }
            });

           setPos(pos);
        }

        function QtyChange(item_id,qty){
        	 var pos = getPos();

            angular.forEach(pos.items, function (item) {
                if(item.item_id == item_id) {
                    item.quantity = qty;
                }
            });
             setPos(pos);
        }


        function getTotalItems() {
        	var count = 0;
            var items = getItems();
            angular.forEach(items, function (item) {
                count += item.quantity;
            });
            return count;
        }
        
        function getOrderItems() {
            var newItem = [];
            var items = getItems();
            angular.forEach(items, function (item,key) {
                newItem[key]= {
                        item_id: item.item_id,
                        price_id: item.price_id,
                        quantity: item.quantity,
                        special_instructions: ""
                     };
                 
            });
            return newItem;
        }

        function getTotalUniqueItems(){
        	return getPos().items.length;
        }

        function setShipping(shipping) {
        	_self.pos.shipping = shipping;
        	save();
            return getShipping();
        }  
        function getShipping() {
        	if (getPos().items.length == 0) return 0;
            return  getPos().shipping;
        } 

        function setShippingType(shippingType) {
            _self.pos.shippingType = shippingType;
            save();
            return getShippingType();
        }  
        function getShippingType() {
            if (getPos().shippingType == null) return 0;
            return  getPos().shippingType;
        } 

        function setShippingAddress(address_id) {
            _self.pos.address_id = address_id;
            save();
            return getShippingAddress();
        }  
        function getShippingAddress() {
            if (getPos().address_id == null) return 0;
            return  getPos().address_id;
        } 

        function setTaxRate(taxRate) {
        	_self.pos.taxRate = parseFloat(taxRate).toFixed(2);
        	save();
            return  getTaxRate();
        }   
        function getTaxRate() {
        	return _self.pos.taxRate;
        }   
        function getTax() {
        	var tax = +parseFloat(((getSubTotal()/100) * getPos().taxRate )).toFixed(2);
            _self.pos.tax = tax; 
        	save();
        	return tax;
        }   

        function getSubTotal(){
            var total = 0;
            angular.forEach(getPos().items, function (item) {
                total += parseFloat(Number(item.quantity) * Number(item.prices.price));
            });
            return +parseFloat(total).toFixed(2);
        }

        function totalCost() {
            return +parseFloat(getSubTotal() + getShipping() + getTax()).toFixed(2);
        }

        function restore(storedPos){
           
            init();
            _self.pos.shipping = storedPos.shipping;
            _self.pos.shippingType = storedPos.shippingType;
            _self.pos.address_id = storedPos.address_id;
            _self.pos.tax = storedPos.tax;
            _self.pos.taxRate = storedPos.taxRate;

            angular.forEach(storedPos.items, function (item) {
                _self.pos.items.push(item);
            });
            save();
        }

        function setPos(pos) {
           _self.pos = pos;
           save();
           return getPos();
        }

        function getPos() {
        	return LocalStorage.get('pos');
        }  
         
       
        function save() {
            return LocalStorage.add('pos',_self.pos);
        }

       function empty() {

           _self.pos = {
                shipping : null,
                shippingType : null,
                address_id : null,
                taxRate : null,
                tax : null,
                items : []
            };
          save();
        }

       return {
            init: init,
            addItem: addItem,
            getDefaultSelectDeal: getDefaultSelectDeal,
            getSelectDeal: getSelectDeal,
            isItemExist: isItemExist,
            getItemById: getItemById,
            removeItemById: removeItemById,
            getTotalUniqueItems: getTotalUniqueItems,
            setPos: setPos,
            getPos: getPos,
            getItems: getItems,
            restore: restore,
            save: save,
            setShipping: setShipping,
            getShipping: getShipping,
            setShippingType: setShippingType,
            getShippingType: getShippingType,
            setShippingAddress: setShippingAddress,
            getShippingAddress: getShippingAddress,
            setTaxRate: setTaxRate,
            getTaxRate: getTaxRate,
            getTax: getTax,
            getTotalItems: getTotalItems,
            getSubTotal: getSubTotal,
            totalCost: totalCost,
            QtyChange: QtyChange,
            empty: empty,
            getOrderItems: getOrderItems
            
        };
        
    }

})();