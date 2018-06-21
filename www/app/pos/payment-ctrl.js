

(function (){
    'use strict';
    angular.module('app').controller('PaymentCtrl', ['$scope', PaymentCtrl]);
    function PaymentCtrl($scope)
    {
        var vm = this;
        $scope.display = "0";
        var memory  = "0";      // initialise memory variable
        var operation = 0;      // Records code for eg * / etc.
        var MAXLENGTH = 20;     // maximum number of digits before decimal!

        $scope.numbers = function(digit)
        {
            if($scope.display.length > MAXLENGTH)
            {
                $scope.display = "Too long"; //limit length
            }
            else
            {
                if((eval($scope.display) == 0) && ($scope.display.indexOf(".") == -1))
                {
                    $scope.display = digit;
                }
                else
                {
                    $scope.display = $scope.display +""+ digit;
                }
            }
        };

        $scope.backspace = function()
        {
            $scope.display = $scope.display.substring(0, $scope.display.length - 1);
        };

        $scope.dot = function()
        {
            if($scope.display == 0)
            {
                $scope.display = "0.";
            }
            else
            {
                if($scope.display.indexOf(".") == -1)
                {
                    $scope.display = $scope.display + ".";
                }
            }
        };

        $scope.clearAll = function ()
        {
            memory = "0";
            $scope.display = "0";
            operation = 0;
        };

        $scope.operators = function(op)
        {
            if (op.indexOf("*") > -1) 
            { 
                operation = 1; 
            }       //  multiply
            if(op.indexOf("/") > -1) 
            { 
                operation = 2; 
            }       // divide
            if(op.indexOf("+") > -1) 
            { 
                operation = 3; 
            }       // sum
            if(op.indexOf("-") > -1) 
            {
                alert("-");
                operation = 4;
            }       // difference
            if(op.indexOf("-") > -1)
            {
                operation = 5;
            }       // remainder

            memory = $scope.display;
            $scope.display = "0";
        };

        $scope.equals = function ()
        {
            if(operation == 1)
            {
                $scope.display = eval(memory) * eval($scope.display);
            }
            if(operation == 2)
            {
                $scope.display = eval(memory) / eval($scope.display);
            }
            if(operation == 3)
            {
                $scope.display = eval(memory) + eval($scope.display);
            }
            if(operation == 4)
            {
                console.log(memory-$scope.display);
                $scope.display = eval(memory) - eval($scope.display);
            }
            if(operation == 5)
            {
                $scope.display = eval(memory) % eval($scope.display);
            }
            operation = 0;                //clear operation
            memory    = "0";              //clear memory
        }
    }
})();
