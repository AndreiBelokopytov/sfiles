module.exports = function (app) {
  var config = this;

  app.set('appName', 'sfiles');

  app.set('quality', 1);

  app.configure(function () { 
    app.set('publicUrl', '/public');
  });

  app.configure('development', function () {
    app.set('hostName', 'http://localhost');
    app.set('port', 7000);
  });

  app.configure('production', function () {
    app.set('hostName', 'http://localhost');
    app.set('port', 7000);
  });

  return config;
};