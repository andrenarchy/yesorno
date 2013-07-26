requirejs.config({
  baseUrl: "scripts",
  paths: {
    app: "app/app",
    backbone: "libs/backbone-min",
    jquery: "libs/jquery-1.10.2.min",
    jquerymobile: "libs/jquery.mobile-1.3.2.min",
    jquerymobileconfig: "app/jquerymobileconfig",
    underscore: "libs/underscore-min",
  },
  shim: {
    underscore: {
      exports: '_'
    },
    backbone: {
      deps: ["underscore", "jquery"],
      exports: "Backbone"
    },
    jquerymobileconfig: ["jquery"],
    jquerymobile: ["jquery", "jquerymobileconfig"],
  }
});

require(["app"]);
