define(["jquery"], function($) {
  $(document).bind("mobileinit", function () {
    $.mobile.linkBindingEnabled = false;
    $.mobile.hashListeningEnabled = false;
    $.mobile.autoInitializePage = false;
    //$.mobile.defaultPageTransition = "none";
    
    // Remove page from DOM when hidden
    //$('div[data-role="page"]').on('pagehide', function (event, ui) {
    //  $(event.currentTarget).remove();
    //});
  });
});
