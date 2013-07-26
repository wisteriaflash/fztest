/*
 *拖动图片组件:
 * 1.拖动图片，以形成剪切图片。**
 * 2.图片缩放功能。
 *  
 */
(function($){
//private vars
var _stepScale = 0.1;

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
    var $this = this;
    var settings = _getSettings.call($this);
    var image = settings.image;
    var clipbox = settings.clipbox;
    //imgMask
    var str = '<div class="clipimg-mask">'+
                '<img src="'+image.source+'" width="'+image.width+'" height="'+image.height+'" />'+
            '</div>'+
            '<div class="clipimg-clipbox">'+
                '<span></span>'+
                '<img src="'+image.source+'" width="'+image.width+'" height="'+image.height+'" />'+
            '</div>'+
            '<div class="clipimg-scale-btn">'+
                '<span class="scale-big">+</span>'+
                '<span class="scale-small">-</span>'+
            '</div>';
    //main
    $this.css({
        width: image.width,
        height: image.height
    });

    $this.addClass('clipimg');
    $this.html(str);
    //init css set
    var clipboxBorder = $this.find('.clipimg-clipbox').css('border-left-width');
    // debugger;
    clipboxBorder = parseInt(clipboxBorder);
    $this.find('.clipimg-clipbox').css({
        width: clipbox.width-2*clipboxBorder,
        height: clipbox.height-2*clipboxBorder
    }).find('img').css({
        left: -image.x,
        top: -image.y
    });
    $this.find('.clipimg-mask').css({
        left: -image.x,
        top: -image.y
    });
};
var _bindHandler = function(){
    var $this = this;
    var item = $this.find('.clipimg-clipbox img');
    
    item.draggable({
        containment: _setImgLimit.call($this),
        scroll: false,
        // cursor: "crosshair",
        start: function() {
            // $this.addClass('clipimg-draging');
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
            $this.removeClass('clipimg-draging');
        }
    });
    //refresh opthion
    item.mousedown(function(){
        $this.addClass('clipimg-draging');
        item.draggable("option", "containment", _setImgLimit.call($this));
    });
    item.mouseup(function(){
        $this.removeClass('clipimg-draging');
    });
    //btns
    $this.find('.scale-big').click(function(e){
        var image = _getSettings.call($this).image;
        var scale = image.scale;
        if(scale>=3){
            return;
        }
        _scaleImg.call($this,'big',scale+_stepScale);
    });
    $this.find('.scale-small').click(function(e){
        var image = _getSettings.call($this).image;
        var scale = image.scale;
        if(scale<=1){
            return;
        }
        _scaleImg.call($this,'samll',scale-_stepScale);
    });
};
var _setImgLimit = function(){
    var $this = this;
    var settings = _getSettings.call($this);
    var image = settings.image;
    var clipbox = settings.clipbox;
    //
    var imgOffset = $this.offset();
    var borderLeft = parseInt($this.css('border-left-width'));
    borderLeft = borderLeft ? borderLeft : 0;
    var borderTop = parseInt($this.css('border-top-width'));
    borderTop = borderTop ? borderTop : 0;
    var offsetLeft = imgOffset.left + borderLeft;
    var offsetTop = imgOffset.top + borderTop;
    var swfix = clipbox.x+1, shfix = clipbox.y+1;
    //
    var x2 = offsetLeft + swfix;
    var y2 = offsetTop + shfix;
    var x1 = x2 - (image.width - clipbox.width);
    var y1 = y2 - (image.height - clipbox.height);
    var arr = [x1,y1,x2,y2];
    return arr;
};
var _scaleImg = function(type,scale){
    var $this = this;
    var settings = _getSettings.call($this);
    var image = settings.image;
    var oldScale = image.scale;
    image.scale = scale;
    if(typeof(image.orginalWidh) == 'undefined'){
        image.orginalWidh = image.width;
        image.orginalHeight = image.height;
    }
    var originW = image.orginalWidh,
        originH = image.orginalHeight;
    //
    var mask = $this.find('.clipimg-mask');
    var maskImg = mask.find('img');
    var clipboxImg = $this.find('.clipimg-clipbox img');
    var left = parseInt(mask.css('left'));
    var top = parseInt(mask.css('top'));
    scale -= 1;
    var sw = Math.round(originW*scale),
        sh = Math.round(originH*scale),
        sx = Math.round(originW*_stepScale*0.5), //以图片中心点来缩放
        sy = Math.round(originH*_stepScale*0.5);
    //以选取框的中心点来缩放
    var clipbox = settings.clipbox;
    var centerX = Math.abs(left)+clipbox.width/2,
        centerY = Math.abs(top)+clipbox.height/2;
    centerX = Math.round(centerX/(oldScale));
    centerY = Math.round(centerY/(oldScale));
    sx = centerX*_stepScale;
    sy = centerY*_stepScale;
    if(type == 'big'){
        left -= sx;
        top -= sy;
    }else if(type == 'samll'){
        left += sx;
        top += sy;
    }
    image.width = image.orginalWidh + sw;
    image.height = image.orginalHeight + sh;
    //set
    mask.css({
        left: left,
        top: top
    });
    maskImg.css({
        width: image.width,
        height: image.height
    });
    clipboxImg.css({
        left: left,
        top: top,
        width: image.width,
        height: image.height
    });
    //data
    _setSettings.call($this, settings);
};



//public fun
var methods = {
    init: function(options) {
        return this.each(function() {
            var $this = $(this);
            var settings = $this.data('clipimg');

            if(typeof(settings) == 'undefined') {
                settings = $.extend({}, $.fn.clipimg.defaults, options);
            } else {
                settings = $.extend({}, settings, options);
            }
            //set default data
            settings.image = $.extend({}, $.fn.clipimg.defaults.image, options.image);
            settings.clipbox = $.extend({}, $.fn.clipimg.defaults.clipbox, options.clipbox);
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
    },
    getData: function(){
        var data = {};
        return data;
    }
};
//construct
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
        height: 0,
        x: 0,
        y: 0,
        scale: 1
    }
}

})(jQuery);