/*  Author: Maxime Haineault <max@motion-m.ca>
 *  widget:  gRelated
 *  Package: Grappelli
 *
 *  jslinted - 8 Jan 2010
 */
(function($){

// Abstract base class for gRelated and gGenericRelated

$.RelatedBase = {

    /* Returns the browse url
     * @k content type id (pk)
     * outputs: /admin/<app>/<model>/
     * */
    _url: function(k) {
        return $.grappelli.contentTypeExist(k) 
            && $.grappelli.contentTypeURL(k) +'?t=id' || '';
    },

    /* Called when the "Browse" button is clicked 
     * on Related and GenericRelated fields
     */
    browse: function(l, noFocus) {
        var ui, link, href, wm;
        link = $(l);
        href = link.attr('href') + ((link.attr('href').search(/\?/) >= 0) && '&' || '?') + 'pop=1&_popup=1';
        wm   = $.grappelli.window(href, {height: 600 , width: 980, resizable: true, scrollbars: true});
        wm._data('element', link.prevAll('input:first'));
        wm.open(!noFocus);
        return false;
    },
    
    /* Called when the object id field is changed/focused 
     * and it updates the label accordingly
     */
    _lookup: function(e){
        var ui, app_label, model_name, url, tl, txt, type;
        ui = this;
        if (ui.element.next('a').attr('href')) {
            app_label  = ui.element.next('a').attr('href').split('/').slice(-3,-2)[0];
            model_name = ui.element.next('a').attr('href').split('/').slice(-2,-1)[0];
            if (ui.dom.object_id.val() == '') {
                ui.dom.text.text('');
            }
            else {
                ui.dom.text.text('loading ...');

                type = ui.dom.object_id.hasClass('vManyToManyRawIdAdminField') && 'm2m_related' || 'related';
                url  = $.grappelli.conf.get(type + '_url');
                get  = {
                    object_id: ui.dom.object_id.val(), 
                    app_label: app_label, 
                    model_name: model_name
                };

                $.get(url, get, function(item, status) {
                    if (item && status == 'success') {
                        tl = (ui.option('maxTextLength') - ui.option('maxTextSuffix').length);
                        if (item.length > tl) {
                            txt = decodeURI(item.substr(0, tl) + ui.option('maxTextSuffix'));
                            ui.dom.text.text(txt);
                        } else {
                            ui.dom.text.text(decodeURI(item));
                        }
                    }
                });
            }
        }
    }
};

$.RelatedDefaultsBase = {
    maxTextLength: 32,
    maxTextSuffix: ' ...'
};

$.widget('ui.gRelated', $.extend($.RelatedBase, {

    options: $.extend($.RelatedDefaultsBase, {
        autoSelector: 'input.vForeignKeyRawIdAdminField, input.vManyToManyRawIdAdminField',
    }),

    _create: function() {
        var ui = this;
        ui.dom = { object_id: ui.element, text: $('<strong />') };

        // use existing <strong> element if present
        if (ui.element.nextAll('strong:first').get(0)) {
            ui.dom.text = ui.element.nextAll('strong:first');
        }
        else {
            ui.dom.text.insertAfter(ui.element.next('a'));
        }

        ui.dom.object_id.bind('keyup.gRelated focus.gRelated', function(e){
            ui._lookup(e);
        }).trigger($.Event({type: 'keyup'})); // load initial data
    }
}));

$.widget('ui.gGenericRelated', $.extend($.RelatedBase, {
    
    options: $.extend($.RelatedDefaultsBase, {
        autoSelector: 'input[name*="object_id"]'
    }),

    _create: function(){
        var ui = this;
        ui.dom = {
            object_id: ui.element,
            content_type: $('#'+ ui.element.attr('id').replace('object_id', 'content_type')),
            link: $('<a class="related-lookup" />'),
            text: $('<strong />')
        };

        ui._disable(!ui.dom.content_type.val());

        // Rebuild object ID (input, browse button and label) when content type select is changed
        ui.dom.content_type.bind('change.gGenericRelated, keyup.gGenericRelated', function(e) {
            var el = $(this);
            var href = ui._url(el.val());
            if (e.firstrun) {
                ui.dom.object_id.val('');
                ui.dom.text.text('');
            }
            ui._disable(!el.val());
            if (el.val()) {
                var link = ui.dom.object_id.next('.related-lookup');
                if (link.get(0)) {
                    link.attr('href', href);
                }
                else {ui.dom.link
                    ui.dom.link.insertAfter(ui.dom.object_id)
                        .after(ui.dom.text)
                        .bind('click.gGenericRelated', function(e){
                            e.preventDefault();
                            return ui.browse(this);
                        })
                        .data('id', ui.dom.object_id.attr('id'))
                        .attr({id: 'lookup_'+ ui.dom.object_id.attr('id'), href: href});
                }
            } 
            else {
                ui.dom.object_id.val('')
                    .parent().find('.related-lookup, strong').remove();
            }
        }).trigger($.Event({type: 'keyup', firstrun: true})); // load initial data

        // Update when object ID is changed
        ui.dom.object_id.bind('keyup.gGenericRelated focus.gGenericRelated', function(e){
            ui._lookup(e);
        }).trigger($.Event({type: 'keyup'})); // load initial data
    },

    // Disables the object ID input
    _disable: function(state) {
        this.dom.object_id.attr('disabled', state); 
    }
}));



$.widget('ui.gRelatedAddAnother', {
    
    options: {
        // Idealy this should really be something like 'a.add-another' 
        // Unfortunately this is hardcoded in Django
        autoSelector: 'a[onclick^=return\\ showAddAnotherPopup]',
        win: {
            height: 600, 
            width: 980, 
            resizable: true, 
            scrollbars: true
        }
    },

    /* Called when the "Add another" button is clicked 
     * on Related and GenericRelated fields
     */
    browse: function(l, noFocus) {
        var ui, link, href, wm;
        ui   = this;
        link = $(l);
        name = link.attr('id').replace(/^add_/, ''); // useful ?
        href = link.attr('href') + (/\?/.test(link.attr('href')) && '&' || '?') + 'pop=1&_popup=1';
        wm   = $.grappelli.window(href, ui.option('win'));
        wm._data('element', link.prevAll('input:first'));
        wm._data('id',      name);
        wm._data('link',    link);
        wm.open(!noFocus);
        return false;
    },

    _create: function(){
        var ui = this;
        ui.element
            .attr('onclick', false).unbind()
            .bind('click', function(e){
                ui.browse(this);
                return false;
            });

        if ($.grappelli.conf.get('isPopup')) {
        }
    }

});

// Window is a popup
// Used to disable default django behaviors
$(function(){
    if ($.grappelli.conf.get('isPopup')) {

        // get rid of actions
        if ($('#action-toggle').get(0)) {
            $('.result-list > table tr td:first-child, .result-list > table tr th:first-child, .actions').hide();
        }
        // small layout fix ..
        if ($.browser.mozilla) {
            $('a[onclick^=return\\ showRelatedObjectLookupPopup]').css('top', '-1px');
        }
        
        // Browse Related Popup
        $('a[onclick^=opener\\.dismissRelatedLookupPopup]')
            .attr('onclick', false)
            .bind('click', function(e){
                var wm = opener.jQuery.grappelli.window(window.name);
                wm._data('pk', $(this).parents('tr').find('input.action-select').val());
                wm._data('newRepr', $(this).text());
                e.preventDefault();
                return $.dismissRelatedLookupPopup(wm);
            });


        $.dismissRelatedLookupPopup = function (wm) {
            var el  = wm._data('element');
            var pk  = wm._data('pk');
            var lbl = wm._data('newRepr');
            if (el.hasClass('vManyToManyRawIdAdminField') && el.val().length) {
                el.val($.format('{0:s},{1:s}', el.val(), pk));
                el.focus();
            }
            else if (el.hasClass('vM2MAutocompleteSearchField')) {
                el.gFacelist('addVal', {id: pk, label: lbl});
            }
            else {
                el.val(pk);
                if (el.hasClass('vAutocompleteSearchField')) {
                    el.trigger($.Event({type: 'updated'}))
                      .parent().find('input.ui-gAutocomplete-autocomplete').val(lbl);
                }
                else {
                    el.focus();
                }
            }
            wm.close();
        };

        opener.dismissAddAnotherPopup = function (w, newId, newRepr) {
            var wm = opener.jQuery.grappelli.window(window.name);
            if (wm) {
                var el = wm._data('element');
                if (el.get(0)) {
                    var type = el.get(0).nodeName.toLowerCase();
                    if (type == 'select') {
                        var opt = $('<option />').val(newId).text($.unescapeHTML(newRepr));
                        opener.jQuery('a[href='+ el.nextAll('a.add-another').attr('href') + ']').each(function(){
                            var sel = $(this).parent().find('select');
                            var nop = opt.clone();
                            sel.append(nop);
                            if (el.attr('id') == sel.attr('id')) {
                                nop.attr('selected', true);
                            }
                            $.sortSelect(sel);
                        });
                    }
                    else if (type == 'input') {
                        if (el.hasClass('vM2MAutocompleteRawIdAdminField')) {
                            opener.jQuery('#'+ el.attr('id').replace('id_','')).gFacelist('addVal', {id: newId, label: newRepr});
                        }
                        else if (el.hasClass('vAutocompleteRawIdAdminField')) {
                            el.val(newId);
                            el.prevAll('input.ui-gAutocomplete-autocomplete').val($.unescapeHTML(newRepr));
                        }
                        else {
                            el.val(newId);
                        }
                    }
                    el.focus();
                }
                wm.close();
            }
            return false;
        };

    }
    // Not a popup
    else {
        // Related lookup button
        $('a[onclick^=return\\ showRelatedObjectLookupPopup]')
            .attr('onclick', false).unbind()
            .bind('click', function(e){
                $(this).prev('input').gRelated('browse', this);
                e.preventDefault();
                return false;
            });

        // Add popup
        /*
        $('a[onclick^=return\\ showAddAnotherPopup]')
            .attr('onclick', false).unbind()
            .bind('click', function(e){
                var name  = $(this).attr('id').replace(/^add_/, '');
                var input = $(this).parent().find('input[name="'+ name +'"]');
                .gRelated('browse', this);
                e.preventDefault();
                return false;
            });
        */
    }
});
})(jQuery);
