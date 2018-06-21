(function() {
    'use strict';

    angular
        .module('app')
        .factory('currentUser', ['LocalStorage',currentUser]);

   function currentUser(LocalStorage) {

        var USERKEY = 'USER';
         
        function profile(){
            var localUser = LocalStorage.get(USERKEY);
            return localUser;
        }

        function saveUser(user) {
            
            LocalStorage.add(USERKEY, user);
        }

        function removeUser () {
            LocalStorage.remove(USERKEY);
        }
        function is_loggedin() {
            
            var localUser = LocalStorage.get(USERKEY);
            if (localUser && localUser.is_loggedin) {
                return true;
            }else{
                return false;
            }
        }
        return {
            save: saveUser,
            remove: removeUser,
            profile: profile,
            is_loggedin: is_loggedin
        };   
     
    }// currentUser

})();