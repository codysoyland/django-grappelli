/*  Author: Maxime Haineault <max@motion-m.ca>
*  widget:  gTimeField
 *  Package: Grappelli
 *
 *  jslinted - 8 Jan 2010
 */
(function($){

$.widget('ui.gTimeField', {

    options: {
        autoSelector: 'input.vTimeField',
        mask: '99:99:99', // set to false to disable
        buttons: [
            {label: gettext("Now"), callback: function(e, ui){ 
                return ui.element.val(new Date().getHourMinuteSecond()); 
            }},
            {label: gettext("Midnight"), callback: function(e, ui){ 
                return ui.element.val('00:00:00'); 
            }},
            {label: gettext("6 a.m."), callback: function(e, ui){ 
                return ui.element.val('06:00:00'); 
            }},
            {label: gettext("Noon"), callback: function(e, ui){ 
                return ui.element.val('12:00:00'); 
            }}
        ]
    },

    _init: function() {
        var ui = this;
        ui.dom = {
            picker: $('<div class="clockbox module"><h2 class="clock-title" /><ul class="timelist" /><p class="clock-cancel"><a /></p></div>'),
            button: $('<button class="ui-timepicker-trigger" type="button" />')
        };
        
        ui.dom.button
            .bind('click.grappelli', function(){
                ui.toggle(this);
            })
            .insertAfter(ui.element);

        ui.dom.picker.insertAfter(ui.dom.button)
            .find('h2').text(gettext('Choose a time')).end()
            .find('a').text(gettext('Cancel')).end()
            .css({position: 'absolute'}).hide();

        $.each(ui.options.buttons, function(){
            var button = this;
            $('<li><a /></li>').find('a')
                .attr('title', button.label)
                .text(button.label)
                .bind('click.grappelli', function(e){
                    button.callback.apply(this, [e, ui]);
                    ui.dom.picker.hide();
                    $('body').unbind('.gTimeField');
                    return false;
                }).end()
                .appendTo(ui.dom.picker.find('.timelist'));
        });

        $('input, textarea, select').bind('focus.gTimeField', function(){
            $('.clockbox.module:visible').hide();
        });
        
        if (ui.options.mask) {
            ui.element.mask(ui.options.mask);
        }
    },

    toggle: function(at) {
        var ui = this;
        if (ui.dom.picker.is(':visible')) {
            ui.hide();
        }
        else {
            ui.show(at);
        }
    },

    show: function(at) {
        var pos = $(at).offset();
        var ui = this;

        ui.dom.picker.css({
            top: pos.top - ui.dom.picker.height() / 2 - 13,
            left: pos.left - ui.dom.picker.width(),
            display: 'block'
        }).show();

        setTimeout(function(){ // weird google chrome fix .. but it works.
            $('body').one('click.gTimeField', function(e){
                var target = $(e.originalTarget);
                if (!target.hasClass('.clock-title') && !target.hasClass('ui-timepicker-trigger')) {
                   ui.hide(); 
                }
            });
        }, 1);
    },

    hide: function() {
        var ui = this;
        ui.dom.picker.hide();
    }
});
})(jQuery);
