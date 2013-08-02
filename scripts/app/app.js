define(["jquery", "underscore", "backbone", "backbonecouch", "jquerycouchlogin", "jquerymobile"],
  function($, _, Backbone, BackboneCouch, jquerycouchlogin, Mobile) {
    console.log("app running!");

    var couchDbServer = 'http://yesorno.iriscouch.com';
    var couchDbName = 'yesorno';

    Backbone.couch_connector.config.base_url = couchDbServer;
    Backbone.couch_connector.config.db_name = couchDbName;
    Backbone.couch_connector.config.ddoc_name = 'yesorno-api';
    Backbone.couch_connector.config.global_changes = true;

    $.couch.urlPrefix = couchDbServer;

    var MnemeRouter = Backbone.Router.extend({
      initialize: function() {
        this.firstPage = false;
        $.mobile.initializePage();
      },
      routes: {
        "": showHomePage,
        ":id": showYesornoPage
      },
      home: function(id) {
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
        $(page.el).trigger('create');

        // make transition / actually change page
        var transition = this.firstPage ? "none" : $.mobile.defaultPageTransition;
        this.firstPage = false;
        console.log($(page.el))
        $.mobile.initializePage();
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
          //'destroy': this.remove
        });
      },
      template: _.template( $("#template_YesornoPage").html() ),
      render: function() {
        this.$el.html( this.template( this.model.toJSON() ) );
				this.input = this.$('.edit');
				return this;
        //$(this.el).find('#logindiv').couchLogin();
      },

		  // change data on double click
		events: {
        'dblclick h1.yon_question' : 'edit',
        'keypress .edit' : 'updateOnEnter',
        'blur .edit' : 'close'
			},

      edit: function(){
				console.log("double click, wa?")
        this.$el.addClass('editing');
        this.input.focus();
      },

      close: function(){
        var value = this.input.val().trim();
        if(value) {
          this.model.save({question: value});
        }
        this.$el.removeClass('editing');
      },

      updateOnEnter: function(e){
        if(e.which == 13){
          this.close();
        }
       }
	
    });

    var router = new MnemeRouter();

    function showHomePage() {
      showYesornoPage('istemmaschonda');
    }

    function showLoading(id) {
      // show a fancy 'loading' message while fetching data
      $.mobile.loading( 'show', {
        text: 'Fetching '+id+'...',
        textVisible: true
      });
    }

    function showNoDoc(id){
      // show a fancy 'loading' message while fetching data
      $.mobile.loading( 'show', {
        text: 'No '+id+' document. Waiting for it...',
        textVisible: true
      });
    }

    function showYesornoPage(id) {
      var coll = new YesornoCollection(id);
      coll.on('add', function(model) {
        console.log('collection add event');
        console.log(model);
        // change page to fresh view associated with model 'yesorno'
        var yesorno_view = new YesornoView({
          model: model,
          el: $('<div></div>')
        });
        coll.on('remove', function() {
          console.log('collection remove event');
          var empty=$('<div data-role="page"></div>');
          $('body').append(empty);
          $.mobile.changePage(empty, { transition: 'fade', changeHash: false });
          showNoDoc(id);

          console.log('change to ', empty);
          //yesorno_view.remove();
        });
        router.changePage(yesorno_view);

      });
      showLoading(id);

      // go for the data
      coll.fetch({
        success: function() {
          if (!coll.length) {
            showNoDoc(id);
          }
        }
      });
    }

    Backbone.history.start();
  }
);
