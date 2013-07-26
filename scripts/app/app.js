define(["jquery", "underscore", "backbone", "jquerymobile"],
  function($, _, Backbone, Mobile) {
    console.log("app running!");

    var MnemeRouter = Backbone.Router.extend({
      initialize: function() {
        this.firstPage = true;
        $.mobile.initializePage();
        Backbone.history.start();
        // display page when JQM finished its magic.
        $(document.body).css('visibility','');
      },
      routes: {
        "": "list",
        "list": "list",
        "show/:id": "show"
      },
      list: function() {
        this.changePage("#list");
      },
      show: function(id) {
        this.changePage('#show')
      },
      changePage: function(pageid) {
        console.log('change to page '+pageid);
        var transition = this.firstPage ? "none" : $.mobile.defaultPageTransition;
        this.firstPage = false;
        $.mobile.changePage(pageid, { transition: transition, changeHash: false });
      }
    });

    this.router = new MnemeRouter();
  }
);
