var HelperService = {};

var LOADING = '<ion-spinner class="spinner-positive" icon="bubbles">' +
              '</ion-spinner><br/>';

HelperService.loading = function(msg) {
  this.closeAll();
  if (msg) this.$loading.show({template: LOADING + msg});
};

HelperService.yesOrNo = function(title, msg) {
  return this.$popup.confirm({
    title: title || 'Please confirm?',
    template: msg
  });
};

var ALERT = _.template([
    '<i class="<%=icon%> text-big"></i>',
    '<p class="badge-line"><%=title%></p>',
    '<p><%=msg%></p>',
    '<button class="button button-small button-outline button-light"',
    ' onClick="HelperService.closeAll()">close</button>'
  ].join(''));

HelperService.closeAll = function() {
  this.$loading.hide();
};

HelperService.error = function(title, msg) {
  this.closeAll();
  this.$loading.show({
    template: ALERT({
      icon: 'ion-ios-close-outline',
      title: title,
      msg: msg || 'Unknown Error...'
    }),
  });
};

HelperService.ok = function(title, msg) {
  this.closeAll();
  this.$loading.show({
    template: ALERT({
      icon: 'ion-ios-checkmark-outline',
      title: title,
      msg: msg || ''
    }),
  });
};

angular.module('Services')
.service('H', ['$ionicLoading', '$ionicPopup',
    function($loading, $popup) {
  HelperService.$popup = $popup;
  HelperService.$loading = $loading;
  return HelperService;
}]);
