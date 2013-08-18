define(["jquery", "underscore", "backbone", "backbonecouch", "jquerycouchlogin", "jquerymobile"],
  function($, _, Backbone, BackboneCouch, jquerycouchlogin, Mobile) {
    console.log("app running!");

    var couchDbServer = 'http://yesorno.it';
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
        $.mobile.initializePage();
        $.mobile.changePage($(page.el), { transition: transition, changeHash: false });
      }
    });

    var CouchUser = Backbone.Model.extend({
      initialize: function() {
        console.log('bla')
        this.set('name', null);
        this.set('mail', null);
        this.session_update();
      },
      login: function(name, pass, success, error) {
        $.couch.login({
            name: name,
            password: pass,
            success: function() {
              this.session_update();
              if (success) { success(); }
            }.bind(this),
            error: function(stat, err, reas) {
              if (error) { error(stat, err, reas); }
            }
          });
      },
      logout: function() {
        $.couch.logout({success: this.session_update.bind(this)});
      },
      register: function(name, mail, pass, success, error) {
        $.couch.signup({
            name: name,
            mail: mail
          }, pass, {
            success: function() {
              this.session_update();
              if (success) { success(); }
              this.login(name, pass);
            }.bind(this),
            error: function(stat, err, reas) {
              if (error) { error(stat, err, reas); }
            }
          });
      },
      session_update: function() {
        $.couch.session({ success: function(r) {
          var userCtx = r.userCtx;
          if (userCtx.name) {
            this.set('name', userCtx.name);
            this.set('mail', userCtx.mail);
            this.trigger('loggedin');
          } else {
            this.set('name', null);
            this.set('mail', null);
            this.trigger('loggedout')
          }
        }.bind(this) });
      }
    });

    // there'll only be one user model!
    var user = new CouchUser();

    var CouchUserView = Backbone.View.extend({
      initialize: function() {
        this.listenTo(this.model, {
          'loggedin': this.render,
          'loggedout': this.render
        });
        this.render();
      },
      template_loggedin: _.template($('#template_loggedin').html()),
      template_loggedout: $('#template_loggedout').html(),
      render: function() {
        var name = this.model.get('name');
        if (name) {
          $(this.el).html(this.template_loggedin(this.model.toJSON()));
          $(this.el).find('#btn_logout').on('click', function() {
            $(this.el).find('#btn_logout').button('disable');
            this.model.logout();
          }.bind(this));
          $(this.el).trigger('create');
        } else {
          $(this.el).html(this.template_loggedout);
          var popup_login = $(this.el).find('#popup_login');
          var popup_register = $(this.el).find('#popup_register');
          $(this.el).trigger('create');

          // prepare login popup
          popup_login.find('form').submit(false);
          popup_login.find('input[type=submit]').on('click', function() {
            var name = popup_login.find('input[name=name]').val(),
                pass = popup_login.find('input[name=pass]').val();
            popup_login.find('input[type=submit]').button('disable');
            popup_login.find('#status').removeClass('error').html('Logging in...');
            this.model.login(name, pass, function() {
                popup_login.popup('close');
              },
              function(stat, err, reason) {
                popup_login.find('#status').addClass('error').html(reason);
                popup_login.find('input[type=submit]').button('enable');
              }
            );
          }.bind(this));
          $(this.el).find('#btn_login').on('click', function() {
            popup_login.popup('open', {positionTo: 'window', transition: 'fade'});
          }.bind(this));

          // prepare register popup
          popup_register.find('form').submit(false);
          popup_register.find('input[type=submit]').on('click', function() {
            var name = popup_register.find('input[name=name]').val(),
                mail = popup_register.find('input[name=mail]').val(),
                pass = popup_register.find('input[name=pass]').val();
            popup_register.find('input[type=submit]').button('disable');
            popup_register.find('#status').removeClass('error').html('Registering...');
            this.model.register(name, mail, pass, function() {
                popup_register.popup('close');
              },
              function(stat, err, reason) {
                popup_register.find('#status').addClass('error').html(reason);
                popup_register.find('input[type=submit]').button('enable');
              }
            );
          }.bind(this));
          $(this.el).find('#btn_register').on('click', function() {
            popup_register.popup('open', {positionTo: 'window', transition: 'fade'});
          }.bind(this));
        }
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
        $(this.el).html( this.template( this.model.toJSON() ) );

        var att = this.model.get('_attachments');
        function get_fname(name) {
          var extensions = ['png', 'jpg'];
          if (!att) {
            return null;
          }
          for (var i=0, ext; ext=extensions[i++];) {
            var fname = name + '.' + ext;
            if (fname in att && att[fname].length<1e6) {
              return fname;
            }
          }
          return null;
        }

        var bgimage_fname = get_fname(this.model.get('answer') ? 'true' : 'false');
        if (bgimage_fname) {
          $(this.el).first().css('background-image', 'url(/yesorno/'+this.model.get('_id')+'/'+bgimage_fname+')');
        }

        var userviewdiv = $('<div></div>').prependTo($(this.el));
        var userview = new CouchUserView({
          model: user,
          el: userviewdiv
        });
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
