let uiModules = require('ui/modules');
let uiRoutes = require('ui/routes');
var React = require('react');
var ReactDOM = require('react-dom');
var HomePage = require('./src/js/HomePage.jsx');
const chrome = require('ui/chrome');

window.BRANCH=chrome.getInjected('BRANCH', 'master');


require('./less/main.less');
let overviewTemplate = require('./templates/index1.html');
let detailTemplate = require('./templates/detail.html');

//var logo = require('./icon.svg');
document.title = 'elasticsearchStatus - Kibana';
//require('ui/chrome')
//  .setBrand({
//    'logo': 'url(' + logo + ') left no-repeat #e8488b',
//    'smallLogo': 'url(' + logo + ') left no-repeat #e8488b'
//  });

let app = uiModules
  .get('app/elasticsearch_status');


uiRoutes.enable();

uiRoutes
  .when('/', {
    template: overviewTemplate,
    controller: 'mycontroller'
  })
  .when('/index/:name', {
    template: detailTemplate,
    controller: 'elasticsearchDetailController',
    controllerAs: 'ctrl'
  });

app.controller('elasticsearchStatusController', function ($http) {
    $http.get('../api/elasticsearch_status/indices').then((response) => {
      this.indices = response.data;
    });
  })
  .controller('elasticsearchDetailController', function ($routeParams, $http) {
    this.index = $routeParams.name;

    $http.get(`../api/elasticsearch_status/index/${this.index}`).then((response) => {
      this.status = response.data;
    });
  });

app.controller('mycontroller', ['$scope', function ($scope) {
}]).directive("dejavuContent", function () {
  return {
    restrict: 'E',
    scope: {
      framework: '='
    },
    link: function (scope, el, attrs) {
      scope.$watch('framework', function (newValue, oldValue) {
        $(el[0]).hide();
        React.render(React.createElement(
          HomePage, {
            framework: newValue
          }),
          el[0]
        );
      })
    }
  }
});
