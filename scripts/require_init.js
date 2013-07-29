requirejs.config({
  baseUrl: "scripts",
  paths: {
    app: "app/app",
    backbone: "libs/backbone-min",
    backbonecouch: "libs/backbone-couchdb",
    jquery: "libs/jquery-1.10.2.min",
    jquerycouch: "libs/jquery.couch",
    jquerycouchlogin: "app/jquery.couchLogin",
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
    backbonecouch: {
      deps: ["backbone", "jquerycouch"],
      exports: "Backbone.couch_connector"
    },
    jquerycouch: {
      deps: ["jquery"],
      exports: "$.couch"
    },
    jquerycouchlogin: {
      deps: ["jquerycouch"],
      exports: "$.couchLogin"
    },
    jquerymobileconfig: ["jquery"],
    jquerymobile: ["jquery", "jquerymobileconfig"],
  }
});

require(["app"]);
