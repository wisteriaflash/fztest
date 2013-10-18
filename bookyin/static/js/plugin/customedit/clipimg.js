/*
 *拖动图片组件:
 * 1.拖动图片，以形成剪切图片。
 * 2.图片缩放功能。
 * 3.图片模糊提示。
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
    var imgurl = '', imgw = 0, imgh = 0;
    //
    if(image.type == 'normal'){
        imgurl = image.source;
        if(typeof(image.initWidth) == 'undefined'){
            var fixObj = _getImgAdjustSize(image.width, image.height, settings.width, settings.height);
            image.initWidth = parseInt(image.width);
            image.initHeight = parseInt(image.height);
            imgw = fixObj.width;
            imgh = fixObj.height;
        }else{
            imgw = image.width;
            imgh = image.height;
        }
    }else{
        imgurl = image.defaults;
        imgw = settings.width;
        imgh = settings.height;
    }
    //imgMask
    var str = '<div class="clipimg-mask">'+
                '<img src="'+imgurl+'" />'+
            '</div>'+
            '<div class="clipimg-clipbox">'+
                '<img src="'+imgurl+'" />'+
            '</div>'+
            '<div class="clipimg-opt">'+
                '<span class="scale-big" title="放大"></span>'+
                '<span class="scale-small" title="缩小"></span>'+
                '<span class="del" title="删除"></span>'
            '</div>';
    //main
    $this.css({
        width: settings.width,
        height: settings.height
    });    
    $this.addClass('clipimg clipimg-'+image.type);
    $this.html(str);
    //init css set
    var clipboxBorder = $this.find('.clipimg-clipbox').css('border-left-width');
    clipboxBorder = parseInt(clipboxBorder);
    $this.find('.clipimg-clipbox').css({
        width: settings.width-2*clipboxBorder,
        height: settings.height-2*clipboxBorder
    }).find('img').css({
        left: image.x,
        top: image.y,
        width: imgw,
        height: imgh
    });
    $this.find('.clipimg-mask').css({
        left: image.x,
        top: image.y
    }).find('img').css({
        width: imgw,
        height: imgh
    });
    //data
    image.width = parseInt(imgw);
    image.height = parseInt(imgh);
    _setSettings.call($this, settings);
    _setSettings($this, settings);
};
var _bindHandler = function(){
    var $this = this;
    _unbindHandler.call($this);
    //default
    var item = $this.find('.clipimg-clipbox img');
    item.click(function(e){
        var settings = _getSettings.call($this);
        settings.onSelect ? settings.onSelect() : -1;
        //
        $this.addClass('selected');
    });
    //type
    var image = _getSettings.call($this).image;
    if(image.type == 'default'){
        
        return;
    }
    //item
    item.draggable({
        containment: _setImgLimit.call($this),
        scroll: false,
        // cursor: "crosshair",
        start: function() {
            $this.addClass('clipimg-draging');
        },
        drag: function(event, ui) {
            var settings = _getSettings.call($this);
            var top = ui.position.top,
                left = ui.position.left;
            $this.find('.clipimg-mask').css({
              'left': left,
              'top': top
            });
        },
        stop: function(event, ui) {
            //data
            var settings = _getSettings.call($this);
            var image = settings.image;
            var left = -ui.position.left,
                top = -ui.position.top;
            var obj = _fixPostionVal(left,top,1,image.width, image.height,settings.width, settings.height);
            image.x = -obj.left;
            image.y = -obj.top;
            _setSettings($this, settings);
            //
            $this.removeClass('clipimg-draging');
            // $this.removeClass('nocursor');
        }
    });
    //refresh opthion
    item.mousedown(function(){
        item.draggable("option", "containment", _setImgLimit.call($this));
        _setImgCursor.call($this);
        $this.addClass('nocursor');
    });
    //btns
    $this.find('.scale-big').click(function(e){
        var image = _getSettings.call($this).image;
        var scale = Number(image.scale);
        if(scale>=3){
            return;
        }
        _scaleImg.call($this,'big',scale+_stepScale);
    });
    $this.find('.scale-small').click(function(e){
        var image = _getSettings.call($this).image;
        var scale = Number(image.scale);
        if(scale<=1){
            return;
        }
        _scaleImg.call($this,'samll',scale-_stepScale);
    });
    $this.find('.del').click(function(e){
        var obj = {url:''};
        methods.setImage.call($this, obj);
        _checkImgBlur.call($this);
    });
};
var _unbindHandler = function(){
    var $this = this;
    var item = $this.find('.clipimg-clipbox img');
    item.unbind();
    item.draggable()
    item.draggable('destroy');
};
var _getImgAdjustSize = function(imgw,imgh,sw,sh){
    var scaleX = imgw/sw;
    var scaleY = imgh/sh;
    var fixW = 0, fixH =0;
    if(scaleX<scaleY){
        fixW = sw;
        fixH = parseInt(imgh/scaleX);
    }else{
        fixW = parseInt(imgw/scaleY);
        fixH = sh;
    }
    var obj = {width:fixW, height: fixH};
    return obj;
};
var _setImgLimit = function(){
    var $this = this;
    var settings = _getSettings.call($this);
    var image = settings.image;
    //
    var imgOffset = $this.offset();
    var borderLeft = parseInt($this.css('border-left-width'));
    borderLeft = borderLeft ? borderLeft : 0;
    var borderTop = parseInt($this.css('border-top-width'));
    borderTop = borderTop ? borderTop : 0;
    var offsetLeft = imgOffset.left + borderLeft;
    var offsetTop = imgOffset.top + borderTop;
    var swfix = 1, shfix = 1;
    //
    var x2 = offsetLeft + swfix;
    var y2 = offsetTop + shfix;
    var x1 = x2 - (image.width - settings.width);
    var y1 = y2 - (image.height - settings.height);
    var arr = [x1,y1,x2,y2];
    return arr;
};
var _scaleImg = function(type,scale){
    var $this = this;
    var settings = _getSettings.call($this);
    var image = settings.image;
    var oldScale = Number(image.scale);
    image.scale = scale;
    if(typeof(image.originalWidth) == 'undefined'){
        image.originalWidth = image.width;
        image.originalHeight = image.height;
    }
    var originW = Number(image.originalWidth),
        originH = Number(image.originalHeight);
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
    var centerX = Math.abs(left)+settings.width/2,
        centerY = Math.abs(top)+settings.height/2;
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
    image.width = originW + sw;
    image.height = originH + sh;
    //check postion
    var checkLeft = Math.abs(left),
        checkTop = Math.abs(top);
    //min
    checkLeft = checkLeft<1 ? 0 : checkLeft;
    checkTop = checkTop<1 ? 0 : checkTop;
    //max
    checkLeft = checkLeft+settings.width>image.width ? image.width-settings.width : checkLeft;
    checkTop = checkTop+settings.height>image.height ? image.height-settings.height : checkTop;
    left = -checkLeft;
    top = -checkTop;
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
    image.x = parseInt(left);
    image.y = parseInt(top);
    _setSettings.call($this, settings);
    _checkImgBlur.call($this);
};
var _fixPostionVal = function(left, top, min, maxLeft, maxTop, sw,sh){
    var checkLeft = Math.abs(left),
        checkTop = Math.abs(top);
    //min
    checkLeft = checkLeft<min ? 0 : checkLeft;
    checkTop = checkTop<min ? 0 : checkTop;
    //max
    checkLeft = checkLeft+sw>maxLeft ? maxLeft-sw : checkLeft;
    checkTop = checkTop+sh>maxTop ? maxTop-sh : checkTop;
    var obj = {left: checkLeft, top: checkTop};
    return obj;
};
var _checkImgBlur = function(){
    var $this = this;
    var settings = _getSettings.call($this);
    var image = settings.image;
    var blurTip = $this.find('.blur-tip');
    if(blurTip.length == 0){
        var str = '<div class="blur-tip" title="此图像素过低，如果用于印刷可能会模糊"></div>';
        blurTip = $(str);
        $this.append(blurTip);
    }
    if(image.type == 'default'){
        blurTip.hide();
        return
    }
    if(image.wdpi == 0 || image.hdpi == 0){
        //旧数据兼容
        if(image.width>image.initWidth || image.height>image.initHeight){
            blurTip.show();
        }else{
            blurTip.hide();
        }
    }else{//new dpi
        var swdpi = image.initWidth/image.width*image.wdpi;
        var shdpi = image.initHeight/image.height*image.hdpi;
        var limitDpi = 120;
        // console.log(swdpi,shdpi);
        if(swdpi<limitDpi || shdpi<limitDpi){
            blurTip.show();
        }else{
            blurTip.hide();
        }
    }
    
};
var _setImgCursor = function(){
    var $this = this;
    var item = $this.find('.clipimg-clipbox img');
    var settings = _getSettings.call($this);
    var image = settings.image;
    var cursor = '';
    if(image.width>settings.width && image.height>settings.height){
        cursor = 'move';
    }else if(image.width-settings.width<=1){
        cursor = 's-resize';
    }else if(image.height-settings.height<=1){
        cursor = 'e-resize';
    }
    item.draggable('option', 'cursor', cursor);
};


//public fun
var methods = {
    init: function(options) {
        return this.each(function() {
            var $this = $(this);
            var settings = $this.data('clipimg');

            if(typeof(settings) == 'undefined') {
                settings = $.extend(true, {}, $.fn.clipimg.defaults, options);
            } else {
                settings = $.extend(true, {}, settings, options);
            }
            //set default data
            // settings.image = $.extend({}, $.fn.clipimg.defaults.image, options.image);
            // settings.clipbox = $.extend({}, $.fn.clipimg.defaults.clipbox, options.clipbox);
            if(settings.image.source){
                settings.image.type = 'normal';
            }
            //
            _setSettings.call($this, settings);
            _renderHtml.call($this);
            _bindHandler.call($this);
            _checkImgBlur.call($this);
        });
    },
    destroy: function(options) {
        return $(this).each(function() {
            var $this = $(this);

            $this.removeData('clipimg');
        });
    },
    cancel: function(){
        return $(this).each(function() {
            var $this = $(this);
            $this.removeClass('selected');
            //
            var settings = _getSettings.call($this);
            settings.onCancel ? settings.onCancel() : -1;
        });
    },
    setImage: function(obj){
        var $this = $(this);
        var settings = _getSettings.call($this);
        var image = settings.image;
        var imgUrl = '', imgw = 0, imgh = 0;
        $this.removeClass('clipimg-'+image.type);
        if(obj.url){
            imgUrl = obj.url;
            image.type = 'normal';
            image.source = imgUrl;
            var fixObj = _getImgAdjustSize(obj.width, obj.height, settings.width, settings.height);
            image.initWidth = parseInt(obj.width);
            image.initHeight = parseInt(obj.height);
            image.wdpi = parseInt(obj.wdpi);
            image.hdpi = parseInt(obj.hdpi);
            imgw = fixObj.width;
            imgh = fixObj.height;
        }else{
            imgUrl = image.defaults;
            image.type = 'default';
            image.source = '';
            imgw = settings.width;
            imgh = settings.height;
        }
        $this.addClass('clipimg-'+image.type);
        var mask = $this.find('.clipimg-mask');
        mask.css({
            left: 0,
            top: 0
        });
        mask.find('img').attr('src',imgUrl)
                        .css({
                            width: imgw,
                            height: imgh
                        });
        var clip = $this.find('.clipimg-clipbox');
        clip.find('img').attr('src',imgUrl)
                        .css({
                            left: 0,
                            top: 0,
                            width: imgw,
                            height: imgh
                        });
        //data
        delete image.originalWidth;
        delete image.originalHeight;
        image.width = parseInt(imgw);
        image.height = parseInt(imgh);
        image.x = 0;
        image.y = 0;
        image.scale = 1;
        _setSettings.call($this, settings);
        _bindHandler.call($this);
        _checkImgBlur.call($this);
    },
    getData: function(){
        var data = {};
        $(this).each(function() {
            var $this = $(this);
            var settings = _getSettings.call($this);
            data[$this.attr('data-name')] = settings;
        });
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
    width: 200,
    height: 200,
    image: {
        type: 'default',
        defaults: YS.staticDomainbyJs+'/img/default/img_default.jpg',
        source: '',
        width: 0,
        height: 0,
        wdpi: 0,
        hdpi: 0,
        x: 0,
        y: 0,
        scale: 1
    },
    onSelect: null,
    onCancel: null
}

})(jQuery);