/*
 *拖动图片组件:
 * 1.
 *  
 */
(function($){

// var conf = {x:150, y:85};
// var container = {w: 202, h:202};


// var dragImgaa = {
//     box: {sw:202, sh:202},
//     dragItem: null,
//     init: function(){
//     var me = this;
//     dragItem = $("#draggable").draggable({
//         containment: me.setImgLimit(500,370),
//         scroll: false,
//         start: function() {
          
//         },
//         drag: function(event, ui) {
//         var top = ui.position.top,
//             left = ui.position.left;
//         me.setImgMask(left, top);
//         },
//         stop: function(event, ui) {

//         }
//         });
//     },
//     setImgLimit: function(sw,sh){
//     var imgOffset = $('.img-con').offset();
//     var offsetLeft = imgOffset.left + parseInt($('.img-con').css('border-left-width'));
//     var offsetTop = imgOffset.top + parseInt($('.img-con').css('border-top-width'));
//     var swfix = conf.x+1, shfix = conf.y+1;
//     // console.log(imgOffset)
//     //
//     var x2 = offsetLeft + swfix;
//     var y2 = offsetTop + shfix;
//     var x1 = x2 - (sw - container.w);
//     var y1 = y2 - (sh - container.h);
//     // var arr = [163,-66,461,101];
//     var arr = [x1,y1,x2,y2];
//     return arr;
//     },
//     setImgMask: function(left,top){
//         left += conf.x;
//         top += conf.y;
//         // debugger;
//         $('.img').css({
//           'left': left,
//           'top': top
//         });
//     }
// }
// dragImgaa.init()







//plugin start============
//private fun
var _getSettings = function(){
    var $this = $(this);
    return $this.data('clipimg');
}
var _setSettings = function(options){
    var $this = $(this);
    $this.data('clipimg', options);
}
var _renderHtml = function(){
    var $this = $(this);
    var settings = _getSettings.call($this);
    var image = settings.image;
    var clipbox = settings.clipbox;
    //imgMask
    var str = '<div class="clipimg-mask">'+
                '<img src="'+image.source+'" width="'+image.width+'" height="'+image.height+'" />'+
            '</div>'+
            '<div class="clipimg-clipbox">'+
                '<img src="'+image.source+'" width="'+image.width+'" height="'+image.height+'" />'+
            '</div>';
    //main
    $this.css({
        width: image.width,
        height: image.height
    });

    $this.addClass('clipimg');
    $this.html(str);
    //init css set
    var clipboxBorder = $this.find('.clipimg-clipbox').css('border-width');
    clipboxBorder = parseInt(clipboxBorder);
    $this.find('.clipimg-clipbox').css({
        width: clipbox.width-2*clipboxBorder,
        height: clipbox.height-2*clipboxBorder,
        left: clipbox.x,
        top: clipbox.y
    }).find('img').css({
        left: -clipbox.x,
        top: -clipbox.y
    })
};
var _bindHandler = function(){
    var $this = $(this);
    var item = $this.find('.clipimg-clipbox img');
    item.draggable({
        containment: _setImgLimit.call($this),
        // scroll: false,
        // cursor: "crosshair",
        start: function() {

        },
        drag: function(event, ui) {
            var settings = _getSettings.call($this);
            var clipbox = settings.clipbox;
            var top = ui.position.top,
                left = ui.position.left;
            left += clipbox.x;
            top += clipbox.y;
            $this.find('.clipimg-mask').css({
              'left': left,
              'top': top
            });
        },
        stop: function(event, ui) {
            
        }
    });
    //refresh opthion
    item.mousedown(function(){
        item.draggable("option", "containment", _setImgLimit.call($this));
    });
};
var _setImgLimit = function(){
    var $this = $(this);
    var settings = _getSettings.call($this);
    var image = settings.image;
    var clipbox = settings.clipbox;
    //
    var imgOffset = $this.offset();
    var offsetLeft = imgOffset.left + parseInt($this.css('border-left-width'));
    var offsetTop = imgOffset.top + parseInt($this.css('border-top-width'));
    var swfix = clipbox.x+1, shfix = clipbox.y+1;
    //
    var x2 = offsetLeft + swfix;
    var y2 = offsetTop + shfix;
    var x1 = x2 - (image.width - clipbox.width);
    var y1 = y2 - (image.height - clipbox.height);
    var arr = [x1,y1,x2,y2];
    return arr;
}



//public fun
var methods = {
    init: function(options) {
        return this.each(function() {
            var $this = $(this);
            var settings = $this.data('clipimg');

            if(typeof(settings) == 'undefined') {
                settings = $.extend(true, $.fn.clipimg.defaults, options);
            } else {
                settings = $.extend(true, settings, options);
            }
            //
            _setSettings.call($this, settings);
            _renderHtml.call($this);
            _bindHandler.call($this);
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

// defaults
$.fn.clipimg.defaults = {
    width: 500,
    height: 400,
    clipbox: {
        x: 0,
        y: 0,
        width: 200,
        height: 200
    },
    image: {
        source: '',
        width: 0,
        height: 0
    }
}

})(jQuery);