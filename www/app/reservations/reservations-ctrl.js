(function() {
    'use strict';
    angular.module('app')
        .controller("reservationsCtrl", reservationsCtrl);

    reservationsCtrl.$inject = ["$scope", "reservationsServices", '$location', 'loading','$ionicModal','LocalStorage'];

    function reservationsCtrl($scope, reservationsServices, $location, loading,$ionicModal,LocalStorage) {
        var vm = this;

        vm.booking_types = {};
        vm.booking_data = {};
        vm.stepOne = true
        vm.stepTwo = false;
        vm.stepThree = false;
        vm.stepNotFound = false;
        vm.is_show_timing_list = false;
        vm.is_show_timing = false;
        vm.buffet_timing = '';

        vm.booking_date = moment().add(0, 'days').format('dddd DD MMM YYYY');
        vm.booking_type = '';
        vm.covers = '1';
        vm.booking_timing = '';
        vm.category = '';
        vm.first_name = '';
        vm.last_name = '';
        vm.email = '';
        vm.mobile = '';
        vm.customer_id = 0;




        vm.reservasionDetail = {
            id: null,
            booking_date: '',
            booking_type: '',
            name: '',
            mobile: '',
            persons: '',
            timing: '',
            email: ''
        };

        function activate() {
            loading.show();
            reservationsServices.reservations().then(function(res) {
                vm.reservations = res.data.data;
                console.log()
                if (vm.reservations.length > 0) {
                    vm.reservasionDetail.id = vm.reservations[0].id;
                    vm.reservasionDetail.booking_type = vm.reservations[0].booking_type;
                    vm.reservasionDetail.name = vm.reservations[0].name;
                    vm.reservasionDetail.booking_date = vm.reservations[0].booking_date;
                    vm.reservasionDetail.timing = vm.reservations[0].timing;
                    vm.reservasionDetail.mobile = vm.reservations[0].mobile
                    vm.reservasionDetail.persons = vm.reservations[0].covers;
                    vm.reservasionDetail.email = vm.reservations[0].email;
                }
            }).catch().finally(function() {
                loading.hide();
            });

            //get bookings type 
             reservationsServices.get_booking_type()
                .then(function (resp) {
                    vm.booking_types = resp.data.data;
                    LocalStorage.add('BOOKING_TYPE', resp.data.data);

                    vm.booking_type = resp.data.data[0].booking_type_id;
                    vm.category = resp.data.data[0].category;
                    if (resp.data.data[0].category == 'buffet') {
                        vm.is_show_timing_list = false;
                        vm.is_show_timing = true;

                        vm.buffet_timing = '<strong> From: </strong> ' + resp.data.data[0].starting_time + '<strong>  To: </strong>' + resp.data.data[0].closing_time;
                        vm.booking_timing = resp.data.data[0].starting_time;
                    } else {
                        vm.is_show_timing_list = true;
                        vm.is_show_timing = false;
                        vm.booking_timing = '5:00 PM';
                    }

                    loading.hide();
                })
                .catch(function (resp) {
                    loading.hide();

                });


        }


        vm.showFilterBar = function() {
            var filterBarInstance = $ionicFilterBar.show({
                cancelText: "<i class='ion-ios-close-outline'></i>",
                items: vm.reservations,
                update: function(filteredItems, filterText) {
                    vm.reservations = filteredItems;
                }
            });
        };

        $scope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            if (toState.name == 'app.reservations') {
                activate();
                vm.stepOne = true
                vm.stepTwo = false;
                vm.stepThree = false;

            }
        });


        vm.showReservationDetail = function(reservation) {
            // vm.change_status(reservation.id);
            vm.reservasionDetail.id = reservation.id;
            vm.reservasionDetail.booking_type = reservation.booking_type;
            vm.reservasionDetail.booking_date = reservation.booking_date;
            vm.reservasionDetail.mobile = reservation.mobile
            vm.reservasionDetail.persons = reservation.covers;
            vm.reservasionDetail.email = reservation.email;


        };


        vm.change_status = function(id) {
            var data = {
                id: id,
            }
            reservationsServices.status_new(data)
                .then(function(resp) {
                    // vm.reservations = res.data.data;
                });
        }

        vm.emailstatus = function(data) {
            var data = {
                id: data.id,
                verify_booking: data.verify_booking,
            }

            vm.emailstausloading = true;
            reservationsServices.change_emailstatus(data)
                .then(function(resp) {
                    1
                    vm.emailstausloading = false;
                    if (resp.data.data) {
                        vm.loading = true;
                        reservationsServices.reservations().then(function(res) {
                            vm.reservations = res.data.data;
                        }).catch().finally(function() {
                            vm.loading = false;
                        });

                    }
                });
        }
        vm.doRefresh = function() {
            reservationsServices.reservations().then(function(res) {
                vm.reservations = res.data.data;
                vm.numberOfItemsToDisplay = 12;
            }).catch().finally(function() {
                $scope.$broadcast('scroll.refreshComplete');
            });
        };


         vm.addReservation = function() {
            $ionicModal.fromTemplateUrl('app/reservations/addReservation.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal) {
                vm.customerModal = modal;
                vm.customerModal.show();
                 vm.stepOne = true
                vm.stepTwo = false;
                vm.stepThree = false;
                vm.stepNotFound = false;
            });
        };



        //reservation form 

             vm.nextSevenDays = function () {
            var range = [];

            for (var i = 0; i < 7; i++) {
                range[i] = moment().add(i, 'days').format('dddd DD MMM YYYY');
            }
            return range;
        };

        vm.numberOfPerson = function () {
            var persons = [];
            var p = 1;
            for (var i = 0; i < 20; i++) {
                persons[i] = p++;
            }
            return persons;
        };

        vm.type_time_list = function () {

            var types = LocalStorage.get('BOOKING_TYPE');


            var selected_type = '';
            angular.forEach(types, function (type) {
                if (type.booking_type_id == vm.booking_type) {
                    selected_type = type;
                    vm.category = selected_type.category
                }
            });

            if (selected_type.category == 'buffet') {
                vm.is_show_timing_list = false;
                vm.is_show_timing = true;

                vm.buffet_timing = '<strong> From: </strong> ' + selected_type.starting_time + '<strong>  To: </strong>' + selected_type.closing_time;
                vm.booking_timing = selected_type.starting_time;

            } else {
                vm.is_show_timing_list = true;
                vm.is_show_timing = false;
                vm.booking_timing = '5:00 PM';
                var starting_time = selected_type.starting_time;
                var closing_time = selected_type.closing_time;

                console.log(starting_time, closing_time)
            }

        };

        vm.find_availability = function () {
            var data = {
                booking_date: vm.booking_date,
                covers: vm.covers,
                type_id: vm.booking_type,
                timing: vm.booking_timing,
            };
            loading.show();
            reservationsServices.find_availability(data)
                .then(function (resp) {
                    loading.hide();

                    if(resp.data.booking_available){
                        vm.stepTwo = true;
                        vm.stepNotFound = false;
                      
                    }else{
                        vm.stepNotFound = true;
                        vm.stepTwo = false;
                    }
                })
                .catch(function (resp) {
                    loading.hide();
                    console.log(resp);
                    vm.stepNotFound = true;

                });

        };

        vm.book_table = function(){
            
           vm.booking_data = {
                booking_date:vm.booking_date,
                timing:vm.booking_timing,
                covers:vm.covers,
                booking_type_id: vm.booking_type,
                name: vm.first_name +' '+ vm.last_name,
                mobile:vm.mobile,
                email: vm.email,
                //venue_id:venue.venue_id,
                customer_id: vm.customer_id,
            };

            loading.show();
            reservationsServices.book_table( vm.booking_data)
                .then(function (resp) {
                    loading.hide();
                    vm.stepOne = false;
                    vm.stepTwo = false;
                    vm.stepThree = true;
                    vm.customerModal.hide();
                    activate();

                })
                .catch(function (resp) {
                    loading.hide();
                    console.log(resp);

                });


        }

        vm.hideCustomerModal = function() {
            vm.customerModal.hide();
        };



    };
})();