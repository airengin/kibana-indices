define(function (require) {
  let _ = require('lodash');
  let Ipv4Address = require('ui/utils/Ipv4Address');

  require('ui/modules')
    .get('kibana')
    .directive('validateIp', function () {
      return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
          'ngModel': '=',
        },
        link: function ($scope, elem, attr, ngModel) {
          function validateIp(ipAddress) {
            if (ipAddress == null || ipAddress === '') {
              ngModel.$setValidity('ipInput', true);
              return null;
            }

            try {
              ipAddress = new Ipv4Address(ipAddress);
              ngModel.$setValidity('ipInput', true);
              return ipAddress.toString();
            } catch (e) {
              ngModel.$setValidity('ipInput', false);
            }
          }

          // From User
          ngModel.$parsers.unshift(validateIp);

          // To user
          ngModel.$formatters.unshift(validateIp);
        }
      };
    });
});
