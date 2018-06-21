// REQUIRES:
// moment.js - http://momentjs.com/
 
// USAGE:
// {{ someDate | moment: [any moment function] : [param1] : [param2] : [param n] 
 
// EXAMPLES:
// {{ someDate | moment: 'format': 'MMM DD, YYYY' }}
// {{ someDate | moment: 'fromNow' }}
 
// To call multiple moment functions, you can chain them.
// For example, this converts to UTC and then formats...
// {{ someDate | moment: 'utc' | moment: 'format': 'MMM DD, YYYY' }}
 
angular.module('app').filter('moment', function () {
  return function (input, momentFn /*, param1, param2, ...param n */) {
    var args = Array.prototype.slice.call(arguments, 2),
        momentObj = moment(input);
    return momentObj[momentFn].apply(momentObj, args);
  };
});