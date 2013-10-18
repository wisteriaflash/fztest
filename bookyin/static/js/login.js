/*
功能&效果：
登陆微博
*/
(function(){

var login = {
	editURL: '/initPage.htm',
	redirectURL: '',
	init: function(){
		var me = this;
		me.bindHandler();
	},
	bindHandler: function(){
		var me = this;
		$('#J_listBtn .navBtnlink').click(function(ev){
			var cls = $(this).parent().attr('class');
			me.redirectURL = '#'+cls;
			me.checkLogin();
			return false;
		});
	},
	checkLogin: function(){
		var me = this;
		var url = '/user!validateIsLogion.htm';
		var param = {};
		var successFun = function(data){
			if(data){
				window.location.href = me.editURL+me.redirectURL;
			}else{
				me.loginDialog.show();
			}
		}
		// me.loginDialog.show();
		YS.ajaxPost(url,param,successFun);
	},
	loginDialog: {
		isInit: false,
		dialogItem: null,
		html: '<div class="login-box"><h2>请使用以下账号登陆</h2><ul><li class="sina"><a href="/user!loginAction.htm?loginway=sina" title="新浪微博账号"><img src="'+YS.staticDomainbyJs+'/img/sina.jpg" alt="" /></a></li><li class="tencent"><a href="/user!loginAction.htm?loginway=ten" title="腾讯微博账号"><img src="'+YS.staticDomainbyJs+'/img/tencent.jpg" alt="" /></a></li></ul><p class="clearfix">开放端口安全登陆，请放心使用</p></div>',
		init: function(){
			var me = this;
			var closeHandler = function() {
	            me.close();
	        };
			var content = $(me.html);
    		$("body").append(content);
    		var dialog = content.dialog({
    			autoOpen: false,
    			draggable: false,
    			modal: true,
    			resizable: false,
    			width: 440,
    			dialogClass: "dialogStyle dialogLogin",
    			closeOnEscape: false,
    			open: function(){
    				$(".ui-widget-overlay").bind("click", closeHandler);
    			},
    			close: function(){
    				$(".ui-widget-overlay").unbind("click", closeHandler);
    			}
    		});
    		me.isInit = true;
    		me.dialogItem = dialog;
			me.init = function(){};
		},
		show: function(){
			var me = this;
			if(!me.isInit){
				me.init();
			}
			me.dialogItem.dialog('open');
		},
		close: function(){
			var me = this;
			me.dialogItem.dialog('close');
		}
	}
};


//init
login.init();


})();