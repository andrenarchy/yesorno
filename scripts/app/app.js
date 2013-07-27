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
        "": "home",
        "home": "home"
      },
      home: function() {
        this.changePage("#home");
      },
      changePage: function(pageid) {
        console.log('change to page '+pageid);
        var transition = this.firstPage ? "none" : $.mobile.defaultPageTransition;
        this.firstPage = false;
        $.mobile.changePage(pageid, { transition: transition, changeHash: false });
      }
    });

    var Yesorno = Backbone.model.extend({

      // validate() should check the same fields as validate_doc_update()
      // in the CouchDB design document
      validate: function(attributes) {
        if (!attributes['question']) {
          return 'Model must have a question';
        }
        // TODO
      }
    });

    this.router = new MnemeRouter();
  }
);
