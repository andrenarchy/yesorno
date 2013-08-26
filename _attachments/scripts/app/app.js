define(["jquery", "underscore", "backbone", "backbonecouch", "jquerymobile"],
  function($, _, Backbone, BackboneCouch, Mobile) {
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
      },
      routes: {
        "": showHomePage,
        ":id": showYesorno
      },
    });

    var CouchUser = Backbone.Model.extend({
      initialize: function() {
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
            this.trigger('loggedin', userCtx.name);
          } else {
            var name = this.get('name');
            this.set('name', null);
            this.set('mail', null);
            this.trigger('loggedout', name)
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
            popup_login.popup({dismissible: false});
            popup_login.find('#status').removeClass('error').html('Logging in...');
            this.model.login(name, pass, function() {
                popup_login.popup('close');
              },
              function(stat, err, reason) {
                popup_login.find('#status').addClass('error').html(reason);
                popup_login.find('input[type=submit]').button('enable');
                popup_login.popup({dismissible: true});
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
            popup_register.popup({dismissible: false});
            popup_register.find('#status').removeClass('error').html('Registering...');
            this.model.register(name, mail, pass, function() {
                popup_register.popup('close');
              },
              function(stat, err, reason) {
                popup_register.find('#status').addClass('error').html(reason);
                popup_register.find('input[type=submit]').button('enable');
                popup_register.popup({dismissible: true});
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

    // view for editable text
    var TextView = Backbone.View.extend({
      initialize: function() {
        console.log('text init');
        this.mode = user.get('name')==this.model.get('user') ? 'editable' : 'view';
        this.property = this.options.property;
        this.classes = this.options.classes ? this.options.classes : 'yon_small';
        this.listenTo(this.model, 'change:'+this.property, this.render);
        this.render();
      },
      templates: {
        editable: _.template( $("#template_text_editable").html() ),
        edit: _.template( $("#template_text_editable").html() )
      },
      render: function() {
        $(this.el).html( this.templates[this.mode]({
          text: this.model.get(this.property),
          classes: this.classes
        }) ).trigger('create');
        if (this.mode=='edit') {
          //$(this.el).find('input').
        } else {
          console.log($(this.el).find('#text'));
        }
        return this;
      }
    });

    var YesornoView = Backbone.View.extend({
      initialize: function() {
        this.listenTo(this.model, 'change:_attachments', this.render_attachments);
        this.render_attachments();
        this.render();
      },
      template: _.template( $("#template_view").html() ),
      render: function() {
        $(this.el).html( this.template( this.model.toJSON() ) );
      },
      render_attachments: function() {
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
          $.mobile.activePage.css('background-image', 'url(/yesorno/'+this.model.get('_id')+'/'+bgimage_fname+')');
        }
      }
      });

    // view for yesorno page
    var YesornoEditView = Backbone.View.extend({
      initialize: function() {
        /*this.listenTo(this.model, {
          'change': this.render,
          //'destroy': this.remove
        });*/

        $(this.el).append( $('<div class="yon_row"></div>').append(new TextView({
          model: this.model,
          property: 'question',
          classes: 'yon_big'
        }).$el) );
        
        $(this.el).append( $('<div class="yon_row"></div>').append(new TextView({
          model: this.model,
          property: 'answer',
          classes: 'yon_big'
        }).$el) );
      },
      render: function() {

      },
    });

    var YesornoCollView = Backbone.View.extend({
      initialize: function() {
        this.views = [];
        this.collection.on('add remove', this.render, this);
      },
      render: function() {
        console.log('coll render')
        this.destroyViews();
        console.log(this.collection);
        if (this.collection.length) {
          this.collection.each( function(model) {
            var view =  new YesornoView({model: model});
            this.views.push(view);
            $(this.el).append(view.$el);
          }, this);
        } else {
          $(this.el).append('No model in collection!');
        }
      },
      destroyViews: function() {
        _.each(this.views, function(view) {
          view.remove();
        });
        this.views = [];
        $(this.el).empty();
      }
    });

    function showHomePage() {
      showYesorno('istemmaschonda');
    }

    var yesornocoll_view = null;
    function showYesorno(id) {
      console.log('show yesorno: '+id);
      var coll = new YesornoCollection(id);
      if (yesornocoll_view) {
        yesornocoll_view.remove();
      }
      yesornocoll_view = new YesornoCollView({
        collection: coll
      });
      $.mobile.activePage.append(yesornocoll_view.$el);
      coll.fetch();
    }

    $(document).ready(function(){
      $.mobile.activePage.append( new CouchUserView({model: user}).$el );

      var router = new MnemeRouter();
      Backbone.history.start();
    });
  }
);
