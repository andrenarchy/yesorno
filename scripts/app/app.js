define(["jquery", "underscore", "backbone", "backbonecouch", "jquerymobile"],
  function($, _, Backbone, BackboneCouch, Mobile) {
    console.log("app running!");

    Backbone.couch_connector.config.base_url = 'http://yesorno.iriscouch.com';
    Backbone.couch_connector.config.db_name = 'yesorno';
    Backbone.couch_connector.config.ddoc_name = 'yesorno-api';
    Backbone.couch_connector.config.global_changes = true;

    var MnemeRouter = Backbone.Router.extend({
      initialize: function() {
        this.firstPage = true;
        $.mobile.initializePage();
      },
      routes: {
        "": "home",
      },
      home: function() {
        // TODO: get actual initial ID from domain
        // (e.g. istemmaschonda.yesorno.it)
        var id = 'istemmaschonda';

        showYesornoPage(id);
      },
      changePage: function(page) {
        console.log('change page');

        // prepare page
        $(page.el).attr('data-role', 'page');
        page.render();
        $('body').append($(page.el));

        // make transition / actually change page
        var transition = this.firstPage ? "none" : $.mobile.defaultPageTransition;
        this.firstPage = false;
        $.mobile.changePage($(page.el), { transition: transition, changeHash: false });
      }
    });

    var Yesorno = Backbone.Model.extend({
      // validate() should check the same fields as validate_doc_update()
      // in the CouchDB design document
      validate: function(attributes) {
        if (!attributes['question']) {
          return 'Model must have a question';
        }
        // TODO
      }
    });

    // dummy collection: we don't actually need it because we only
    // want to handle one Model at a time but the Backbone-couchdb
    // connector is based on collections :/
    var YesornoCollection = Backbone.Collection.extend({
      initialize: function(id) {
        this.db = {
          view: 'by_id',
          keys: [id],
          filter : Backbone.couch_connector.config.ddoc_name + "/by_id"
        };
        Backbone.Collection.prototype.initialize.call(this, arguments);
      }
    });

    var YesornoView = Backbone.View.extend({
      initialize: function() {
        this.listenTo(this.model, {
          'change': this.render,
          'destroy': this.remove
        });
      },
      template: _.template( $("#template_YesornoPage").html() ),
      render: function() {
        $(this.el).html( this.template( this.model.toJSON() ) );
      }
    });

    var router = new MnemeRouter();

    function showYesornoPage(id) {
      // TODO retrieve the actual yesorno doc here instead of creating a
      // fixed one.
      // TODO add 'var' once we leave debugging phase ;)
      yesorno = new Yesorno({
        question: 'Ist Emma schon da?',
        answer: 'Noooain!'
      });

      var coll = new YesornoCollection('istemmaschonda');
      coll.on('add', function(model) {
        // change page to fresh view associated with model 'yesorno'
        router.changePage(
          new YesornoView({
            model: model,
            el: $('<div></div>')
          })
        );
      });
      coll.fetch();

    }

    Backbone.history.start();
  }
);
