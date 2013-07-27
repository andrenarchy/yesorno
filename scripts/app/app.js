define(["jquery", "underscore", "backbone", "jquerymobile"],
  function($, _, Backbone, Mobile) {
    console.log("app running!");

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

    this.router = new MnemeRouter();

    function showYesornoPage(id) {
      // TODO retrieve the actual yesorno doc here instead of creating a
      // fixed one.
      // TODO add 'var' once we leave debugging phase ;)
      yesorno = new Yesorno({
        question: 'Ist Emma schon da?',
        answer: 'Noooain!'
      });

      // change page to fresh view associated with model 'yesorno'
      this.router.changePage(
        new YesornoView({
          model: yesorno,
          el: $('<div></div>')
        })
      );
    }

    Backbone.history.start();
  }
);
