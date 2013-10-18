(function(win){

var YS = {
    staticDomainbyJs: 'http://static.chushuba.com',
    init: function(){
        var me = this;
        me.JQplugin();
        me.isie6();
    },
    JQplugin: function(){
        //version
        jQuery.browser={};(function(){jQuery.browser.msie=false;
        jQuery.browser.version=0;if(navigator.userAgent.match(/MSIE ([0-9]+)\./)){
        jQuery.browser.msie=true;jQuery.browser.version=RegExp.$1;}})();
        //cookie
        jQuery.cookie = function(name, value, options) {  
            if (typeof value != 'undefined') { // name and value given, set cookie  
                options = options || {};  
                if (value === null) {  
                    value = '';  
                    options.expires = -1;  
                }  
                var expires = '';  
                if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {  
                    var date;  
                    if (typeof options.expires == 'number') {  
                        date = new Date();  
                        date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));  
                    } else {  
                        date = options.expires;  
                    }  
                    expires = '; expires=' + date.toUTCString();  
                }  
                var path = options.path ? '; path=' + (options.path) : '';  
                var domain = options.domain ? '; domain=' + (options.domain) : '';  
                var secure = options.secure ? '; secure' : '';  
                document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');  
            } else {  
                var cookieValue = null;  
                if (document.cookie && document.cookie != '') {  
                    var cookies = document.cookie.split(';');  
                    for (var i = 0; i < cookies.length; i++) {  
                        var cookie = jQuery.trim(cookies[i]);  
                        if (cookie.substring(0, name.length + 1) == (name + '=')) {  
                            cookieValue = decodeURIComponent(cookie.substring(name.length + 1));  
                            break;  
                        }  
                    }  
                }  
                return cookieValue;  
            }  
        };
    },
	hash: function(data){
		if (data === undefined) {
            return location.hash.replace("#", "")
        } else {
            var reg = new RegExp("#");
            var hashStr = reg.test(data) ? data : "#" + data;
            location.hash = data === "" ? "" : hashStr;
        }
	},
	pixelToInt: function(str) {
        if (!str) {
            return 0
        }
        return parseInt(str.replace(/px/i, ""))
    },
    ajaxPost: function(url,param,successFun, errorFun){
        $.ajax({
            type: "POST",
            cache: false,
            dataType: "json",
            url: url,
            data: param,
            success: function(data, textStatus) {
                successFun && successFun(data);
            },
            error: function(XMLHttpRequest, textStatus) {
                errorFun && errorFun(textStatus)
            }
        });
    },
    ajaxData: function(method,url,param,successFun,errorFun){
        method = method ? method : 'GET';
        $.ajax({
            type: method,
            cache: false,
            dataType: "json",
            url: url,
            data: param,
            success: function(data, textStatus) {
                successFun && successFun(data);
            },
            error: function(XMLHttpRequest, textStatus) {
                errorFun && errorFun(textStatus)
            }
        });
    },
    isie6: function(){
        if ($.browser.msie) {
            if ($.browser.version == 6){
                window.location.href = YS.staticDomainbyJs+"/const/ie6.html";
            }
        }
    },
    tipConfirmDialog: {
        isInit: false,
        dialogItem: null,
        contentItem: null,
        textItem: null,
        submitFun: null,
        show: {
            effect: "blind",
            duration: 1000
        },
        hide: {
            effect: "explode",
            duration: 1000
        },
        html: '<div class="dialogTip"><div class="title">删除收货地址</div><div class="bd"><i></i><div class="opt"><p class="tip-text">确定删除吗？</p><a class="tipbtn submit" type="submit">确定</a><a class="tipbtn cancel" type="reset">取消</a></div><p class="tips-con">Tips:<em class="tips">地址写错了可以进行修改，并不需要删除重写哦。</em></p></div></div>',
        init: function(cls){
            var me = this;
            var closeHandler = function() {
                me.close();
            };
            cls = cls ? cls : '';
            var content = $(me.html);
            $("body").append(content);
            var dialog = content.dialog({
                autoOpen: false,
                draggable: false,
                close: false,
                modal: true,
                resizable: false,
                dialogClass: "dialogStyle dialogTipShow "+cls,
                width: 400,
                open: function(){
                    $(".ui-widget-overlay").bind("click", closeHandler);
                },
                close: function(){
                    $(".ui-widget-overlay").unbind("click", closeHandler);
                }
            });
            me.isInit = true;
            me.dialogItem = dialog;
            me.contentItem = content;
            me.init = function(){};
        },
        bindlerHandler: function(){
            var me = this;
            $('.dialogTipShow .submit').click(function(e){
                me.close();
                me.submitFun ? me.submitFun() : -1;
            });
            $('.dialogTipShow .cancel').click(function(e){
                me.close();
            });
        },
        show: function(config){
            var me = this;
            if(!me.isInit){
                me.init(config.cls);
                me.bindlerHandler();
            }
            me.setItemShow(config);
            me.setText(config.txt);
            me.submitFun = config.onsubmit ? config.onsubmit : null;
            me.dialogItem.dialog('open');
        },
        setItemShow: function(config){
            //btn
            if(config.btn && config.btn == 'no'){
                $('.dialogTipShow .tipbtn').hide();
            }else{
                $('.dialogTipShow .tipbtn').show();
            }
            //tips
            var txt = config.txt;
            if(txt && txt.tips == ''){
                $('.dialogTipShow .tips-con').hide();
            }else{
                $('.dialogTipShow .tips-con').show();
            }
            if(txt && txt['tip-note']){
                if($('.dialogTipShow .tip-note').length==0){
                    var str = '<p class="tip-note"></p>';
                    $('.dialogTipShow .opt').append(str);
                }
                $('.dialogTipShow .tip-note').text(txt['tip-note']);
                $('.dialogTipShow .tip-note').show();
            }else{
                $('.dialogTipShow .tip-note').text('');
                $('.dialogTipShow .tip-note').show();
            }
        },
        close: function(){
            var me = this;
            if(!me.isInit){
                return;
            }
            me.dialogItem.dialog('close');
        },
        setText: function(obj){
            var me = this;
            var content = me.contentItem;
            if(!obj){
                return;
            }
            //
            for(var item in obj){
                var valueItem = content.find('.'+item);
                var value = valueItem.text();
                value = obj[item] ? obj[item] : value;
                valueItem.text(value);
            }
        }
    }
};
//
win.YS = YS;
YS.init();

})(window);