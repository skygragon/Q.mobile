var FS = {};

FS.init = function() {
  var dir;
  try {
    dir = cordova.file.externalRootDirectory ||
          cordova.file.externalDataDirectory ||
          cordova.file.dataDirectory;
  } catch (e) {
    // FIXME: hack web test where no cordova defined...
    console.log(e.message);
  }
  this.dir = dir || './';
  this.filename = this.Config.name + '.json';
  this.filepath = this.dir + this.filename;
};

FS.save = function(questions, cb) {
  var data = JSON.stringify(questions);
  this.$cordovaFile.writeFile(this.dir, this.filename, data, true)
    .then(function(ok) {
      return cb(null, FS.filepath);
    }, function(e) {
      return cb(e);
    });
};

FS.load = function(cb) {
  this.$cordovaFile.readAsText(this.dir, this.filename)
    .then(function(text) {
      return cb(null, JSON.parse(text));
    }, function(e) {
      return cb(e);
    });
};

angular.module('Services')
  .service('FS', ['$cordovaFile', 'Config', function($cordovaFile, Config) {
    FS.$cordovaFile = $cordovaFile;
    FS.Config = Config;
    FS.init();
    return FS;
  }]);
