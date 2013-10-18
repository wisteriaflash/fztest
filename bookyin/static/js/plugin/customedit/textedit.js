/*
 *编辑文字组件:
 * 1.点击编辑文字。
 * 2.单行、多行文字。
 * 3.其他
 */
(function($){
//utils
$.fn.setCursorPosition = function(position){
    if(this.lengh == 0) return this;
    return $(this).setSelection(position, position);
}

$.fn.setSelection = function(selectionStart, selectionEnd) {
    if(this.lengh == 0) return this;
    input = this[0];

    if (input.createTextRange) {
        var range = input.createTextRange();
        range.collapse(true);
        range.moveEnd('character', selectionEnd);
        range.moveStart('character', selectionStart);
        range.select();
    } else if (input.setSelectionRange) {
        input.focus();
        input.setSelectionRange(selectionStart, selectionEnd);
    }

    return this;
}
$.fn.focusStart = function(){
    this.setCursorPosition(0);
}
$.fn.focusEnd = function(){
    this.setCursorPosition(this.val().length);
}
//private vars


//private fun
var _getSettings = function(){
    var $this = $(this);
    return $this.data('textedit');
}
var _setSettings = function(options){
    var $this = $(this);
    $this.data('textedit', options);
}
var _renderHtml = function(){
    var $this = this;
    var settings = _getSettings.call($this);
    var text = settings.text ? settings.text : settings.defaults;
    var inputStr = '';
    if(settings.type == 'single'){
        inputStr = '<input type="text" maxlength="'+settings.maxLen+'" value="'+text+'" />';
    }else if(settings.type == 'multi'){
        var txt = text.replace(/<br\/>/g,"\n");//将<br/>转为换行符
        inputStr = '<textarea maxlength="'+settings.maxLen+'">'+txt+'</textarea>';
    }
    var str = '<div class="com-edit-text-txt">'+
                text.replace(/\s/g,"&#160;")+
            '</div>'+
            '<div class="com-edit-text-input">'+
                inputStr+
            '</div>';
    //
    $this.html(str);
    $this.css({
        width: settings.width,
        height: settings.height,
        fontSize: settings.fontSize,
        lineHeight: settings.lineHeight,
        textAlign: settings.fontAlign,
        color: settings.fontColor
    });
    $this.find('.com-edit-text-input').children().css({
        width: settings.width,
        minWidth: settings.width,
        height: settings.height,
        minHeight: settings.height,        
        fontSize: settings.fontSize,
        lineHeight: settings.lineHeight,
        textAlign: settings.fontAlign,
        color: settings.fontColor
    });
};
var _bindHandler = function(){
    var $this = this;
    $this.click(function(e){
        var settings = _getSettings.call($this);
        settings.onSelect ? settings.onSelect(settings) : -1;
        //
        var inputCon = $(this).find('.com-edit-text-input');
        var input = inputCon.children();
        $this.addClass('selected');
        $(this).find('.com-edit-text-txt').css('display','none');
        if(inputCon.is(":visible")){
            return;
        }
        inputCon.css('display','block');
        if(settings.type == 'single'){
            input.focusEnd();
        }else{
            input.focusStart();
        }
    });
    $this.find('.com-edit-text-input').children().focus(function(e){
        var settings = _getSettings.call($this);
        var str = $(this).val().replace(/\n/g,"<br/>").replace(/\s/g,"&#160;");
        if(str == settings.defaults){
            $(this).val('');
        }
    });
    $this.find('.com-edit-text-input').children().blur(function(e){
        var txt = $this.find('.com-edit-text-txt');
        // $this.removeClass('selected');
        $this.find('.com-edit-text-input').css('display','none');
        txt.css('display','block');
        //data 转义&#160;=空格
        var settings = _getSettings.call($this);
        var str = $(this).val().replace(/\&/g,'&amp;').replace(/\</g,'&lt;').replace(/\>/g,'&gt;').replace(/\n/g,"<br/>").replace(/\s/g,"&#160;");
        if(str == ''){
            str = settings.defaults;
            $(this).val(str);
        }
        txt.html(str);
        settings.text = str;
        _setSettings.call($this);
    });
    //
    var settings = _getSettings.call($this);
    if(settings.type == 'multi' && $.browser.msie){//fix for ie
        $this.find('.com-edit-text-input').children().bind('input propertychange', function() {
            var val = $(this).val();
            var maxLen = settings.maxLen;
            if (val.length > maxLen){
                $(this).val(val.slice(0, maxLen));
            }
        });
    }

};
var _saveTextValue = function(){
    var $this = this;
    var settings = _getSettings.call($this);
    var input = $this.find('.com-edit-text-input').children();
    var str = input.val().replace(/\&/g,'&amp;').replace(/\</g,'&lt;').replace(/\>/g,'&gt;').replace(/\n/g,"<br/>").replace(/\s/g,"&#160;");
    if(str == settings.defaults){
        str = '';
    }
    settings.text = str;
    _setSettings.call($this);
}



//public fun
var methods = {
    init: function(options) {
        return this.each(function() {
            var $this = $(this);
            var settings = _getSettings.call($this);

            if(typeof(settings) == 'undefined') {
                settings = $.extend({}, $.fn.textedit.defaults, options);
            } else {
                settings = $.extend({}, settings, options);
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

            $this.removeData('textedit');
        });
    },
    setFontSize: function(size){
        var $this = $(this);
        var input = $this.find('.com-edit-text-input').children();
        $this.css('font-size',size);
        input.css('font-size',size);
        //data
        var settings = _getSettings.call($this);
        settings.fontSize = size;
        _setSettings.call($this, settings);
    },
    setLineHeight: function(line){
        var $this = $(this);
        var input = $this.find('.com-edit-text-input').children();
        $this.css('line-height',line);
        input.css('line-height',line);
        //data
        var settings = _getSettings.call($this);
        settings.lineHeight = line;
        _setSettings.call($this, settings);
    },
    setFontAlign: function(align){
        var $this = $(this);
        var input = $this.find('.com-edit-text-input').children();
        $this.css('text-align',align);
        input.css('text-align',align);
        //data
        var settings = _getSettings.call($this);
        settings.fontAlign = align;
        _setSettings.call($this, settings);
    },
    setColor: function(color) {
        var $this = $(this);
        var input = $this.find('.com-edit-text-input').children();
        $this.css('color',color);
        input.css('color',color);
        //data
        var settings = _getSettings.call($this);
        settings.fontColor = color;
        _setSettings.call($this, settings);  
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
    getData: function(){
        var data = {};
        $(this).each(function() {
            var $this = $(this);
            _saveTextValue.call($this);
            var settings = _getSettings.call($this);
            data[$this.attr('data-name')] = settings;
        });
        return data;
    }
};
//construct
$.fn.textedit = function() {
    var method = arguments[0];

    if(methods[method]) {
        method = methods[method];
        arguments = Array.prototype.slice.call(arguments, 1);
    } else if( typeof(method) == 'object' || !method ) {
        method = methods.init;
    } else {
        $.error( 'Method ' +  method + ' does not exist on jQuery.textedit' );
        return this;
    }

    return method.apply(this, arguments);

}

// defaults
$.fn.textedit.defaults = {
    type: 'single', //single|multi
    width: 200,
    height: 50,
    maxLen : 120,
    defaults: '可以在这里输入文字',
    fontSize: '12px',
    lineHeight: '16px',
    fontAlign: 'left',
    fontColor: '#757575',
    onSelect: null,
    onCancel: null
}

})(jQuery);