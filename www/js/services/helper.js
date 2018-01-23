var Helper = {};

var LOADING = '<ion-spinner class="spinner-positive" icon="bubbles">' +
              '</ion-spinner><br/>';

Helper.loading = function(msg) {
  this.closeAll();
  if (msg) this.$loading.show({template: LOADING + msg});
};

Helper.yesOrNo = function(title, msg) {
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
    ' onClick="Helper.closeAll()">close</button>'
  ].join(''));

Helper.closeAll = function() {
  this.$loading.hide();
};

Helper.error = function(title, msg) {
  this.closeAll();
  this.$loading.show({
    template: ALERT({
      icon: 'ion-ios-close-outline',
      title: title,
      msg: msg || 'Unknown Error...'
    }),
  });
};

Helper.ok = function(title, msg) {
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
  Helper.$popup = $popup;
  Helper.$loading = $loading;
  return Helper;
}]);
