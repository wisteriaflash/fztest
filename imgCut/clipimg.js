/*
 *拖动图片组件:
 * 1.
 *  
 */
(function($){

var conf = {x:150, y:85};
var container = {w: 202, h:202};


var dragImgaa = {
    box: {sw:202, sh:202},
    dragItem: null,
    init: function(){
    var me = this;
    dragItem = $("#draggable").draggable({
        containment: me.setImgLimit(500,370),
        scroll: false,
        start: function() {
          
        },
        drag: function(event, ui) {
        var top = ui.position.top,
            left = ui.position.left;
        me.setImgMask(left, top);
        },
        stop: function(event, ui) {

        }
        });
    },
    setImgLimit: function(sw,sh){
    var imgOffset = $('.img-con').offset();
    var offsetLeft = imgOffset.left + parseInt($('.img-con').css('border-left-width'));
    var offsetTop = imgOffset.top + parseInt($('.img-con').css('border-top-width'));
    var swfix = conf.x+1, shfix = conf.y+1;
    //
    var x2 = offsetLeft + swfix;
    var y2 = offsetTop + shfix;
    var x1 = x2 - (sw - container.w);
    var y1 = y2 - (sh - container.h);
    // var arr = [163,-66,461,101];
    var arr = [x1,y1,x2,y2];
    return arr;
    },
    setImgMask: function(left,top){
    left += conf.x;
    top += conf.y;
    // debugger;
    $('.img').css({
      'left': left,
      'top': top
    });
    }
}




dragImgaa.init()

//plugin start============

var privateFunction = function() {
    // 代码在这里运行
}

var methods = {
    init: function(options) {
        return this.each(function() {
            var $this = $(this);
            var settings = $this.data('clipimg');

            if(typeof(settings) == 'undefined') {

                var defaults = {
                    propertyName: 'value',
                    onSomeEvent: function() {}
                }

                settings = $.extend({}, defaults, options);

                $this.data('clipimg', settings);
            } else {
                settings = $.extend({}, settings, options);
            }

            // 代码在这里运行
            console.log('init');
        });
    },
    destroy: function(options) {
        return $(this).each(function() {
            var $this = $(this);

            $this.removeData('clipimg');
        });
    },
    val: function(options) {
        var someValue = this.eq(0).html();

        return someValue;
    }
};

$.fn.clipimg = function() {
    var method = arguments[0];

    if(methods[method]) {
        method = methods[method];
        arguments = Array.prototype.slice.call(arguments, 1);
    } else if( typeof(method) == 'object' || !method ) {
        method = methods.init;
    } else {
        $.error( 'Method ' +  method + ' does not exist on jQuery.clipimg' );
        return this;
    }

    return method.apply(this, arguments);

}


})(jQuery);