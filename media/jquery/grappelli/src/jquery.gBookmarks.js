/*  Author:  Maxime Haineault <max@motion-m.ca>
 *  widget:  gBookmarks
 *  Package: Grappelli
 *
 *  jslinted - 8 Jan 2010
 */
(function($){

$.widget('ui.gBookmarks', {
         
    _init: function() {
        var ui  = this;
        var url = ui.options.url +'?path='+ window.location.pathname +' #bookmarks > li';
        
        this.showMethod = this.options.effects && 'slideDown' || 'show';
        this.hideMethod = this.options.effects && 'slideUp' || 'hide';

        $("li#toggle-bookmarks-listing.enabled")
            .live("mouseover", function(){ ui.show("#bookmarks-listing:hidden"); });
        
        $('#toggle-bookmark-add').live("click", function() { return ui.add(); });
        $('#bookmark-add-cancel').live("click", function() { return ui.cancel(); });
        ui.element.load(url);
    },

    show: function(el) {
        var ui = this;
        $(el)[ui.showMethod]();
        $("#bookmarks").one("mouseleave", function(){ 
            ui.hide("#bookmarks-listing:visible"); 
        });
    },

    hide: function(el) {
        $(el)[this.hideMethod]();
    },

    cancel: function() {
        this.hide("#bookmark-add");
        $("#toggle-bookmarks-listing").toggleClass('enabled');
        return false;
    },
    
    add: function() {
        $("#bookmark-title").val($('h1').text());
        $("#bookmark-path").val(window.location.pathname);
        $("#toggle-bookmarks-listing").removeClass('enabled');
        this.show("#bookmark-add");
        return false;
    }
});

$.ui.gBookmarks.defaults = {
    url: BOOKMARKS_URL,
    effects: false
};

})(jQuery);
