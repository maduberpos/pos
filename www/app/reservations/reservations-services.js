(function() {
    'use strict';

    angular
        .module('app')
        .factory('reservationsServices', ['MyHTTP', reservationsServices]);

    /* @ngInject */
    function reservationsServices(MyHTTP) {
        var reservations = {
            reservations: reservations,
            status_new: status_new,
            change_emailstatus: change_emailstatus,
            get_booking_type : get_booking_type ,
            find_availability  : find_availability_post  ,
            book_table : book_table ,
        };
        return reservations;

        ////////////////

        function reservations() {

            return MyHTTP.get_by_one_params('get_reservations');
        }

        function status_new(data) {
            console.log(data);
            return MyHTTP.post1(data, 'change_reservation_new_status');
        }

        function change_emailstatus(data) {

            return MyHTTP.post1(data, 'update_reservation_status');
        }

         function find_availability_post(data){
               
             return MyHTTP.post(data, 'available_booking');
         }

         // get table booking types
          function get_booking_type() {
               return MyHTTP.get_by_one_params('booking_types');
          }

        
        // submit table data
        function book_table(data){
          return MyHTTP.post(data, 'book_a_table');
        }



    }
})();