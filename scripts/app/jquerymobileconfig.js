define(["jquery"], function($) {
  $(document).bind("mobileinit", function () {
    $.mobile.linkBindingEnabled = false;
    $.mobile.hashListeningEnabled = false;
    //$.mobile.autoInitializePage = false;
    //$.mobile.defaultPageTransition = "none";
    
    // Remove page from DOM when hidden
    $('body').on('pagehide', 'div[data-role="page"]', function (event, ui) {
      $(event.currentTarget).remove();
    });
  });
});
