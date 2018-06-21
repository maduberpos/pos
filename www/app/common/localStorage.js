(function() {
  'use strict';

  angular
    .module('app')
    .factory('LocalStorage',['$window',LocalStorage]);

  function LocalStorage($window) {
    var store = $window.localStorage;
    return {
      add: add,
      get: get,
      remove: remove
    };

    function add(key, value) {
      value = angular.toJson(value);
      store.setItem('POS_'+key, value);
    }
    function get(key) {
      var value = store.getItem('POS_'+key);
      if (value) {
        value = angular.fromJson(value);
      }
      return value;
    }

    function remove(key) {
      store.removeItem('POS_'+key);
    }
  }

})();
