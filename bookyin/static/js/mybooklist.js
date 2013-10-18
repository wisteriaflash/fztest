(function(){
//
var myBookList = {
	loadingId: {},
	delayTime: 3000,
	init: function(){
		var me = this;
		me.bindHandler();
		me.getLoading();
	},
	bindHandler: function(){
		var me = this;
		$('#J_myBookList .book-item').find('.del').click(function(e){
			e.preventDefault();
			var id = $(this).attr('data-id');
			var config = {
				onsubmit: function(){
					me.delBookData(id);
				},
				txt : {title:'从书架上删除书籍', tips:'您对该书籍进行过的编辑一并被删除。'}
			}
			var textObj = 
			YS.tipConfirmDialog.show(config);
		});
		$('#J_myBookList .action .btn-normal').click(function(e){
			var status = $(this).attr('data-status');
			if(status != 'old'){
				return;
			}
			e.preventDefault();
			var tipTxt = '个性化定制';
			if($(this).hasClass('make-book')){
				tipTxt = '制作纸质书';
			}
			var id = $(this).attr('href').match(/bookId=\d*/)[0];
			id = id.replace('bookId=','');
			me.refreshTipDialog.show(id,tipTxt);
		});
		// $('#J_myBookList .book-item').find('.make-book').click(function(e){
		// 	var status = $(this).attr('data-status');
		// 	if(status != 'old'){
		// 		return;
		// 	}
		// 	e.preventDefault();
		// 	var id = $(this).attr('href').match(/bookId=\d*/)[0];
		// 	id = id.replace('bookId=','');
		// 	me.refreshTipDialog.show(id);
		// });
	},
	delBookData: function(id){
		var me = this;
		var method = 'GET';
		var url = '/delStatusBook.htm';
		var param = {bookId: id};
		var successFun = function(data){
			if(data.response == 'success'){
				me.delBookItem(id);
			}else{
				alert('删除失败');
			}
		};
		YS.ajaxData(method,url,param,successFun);
	},
	delBookItem: function(id){
		var item = $('#J_myBookList .book-item').find('a[data-id="'+id+'"]');
		item = item.parents('.book-item');
		item.slideUp();
	},
	getLoading: function(){
		var me = this;
		var arr = $('#J_myBookList .book-item .loading');
		for(var i=0, l=arr.length; i<l; i++){
			var item = $(arr[i]);
			var id = item.attr('data-id');
			me.loadingId[id] = setInterval(me.getBookProgress, me.delayTime, id);
			var btn = item.parents('.book-item').find('.make-book');
			me.makeBookDisable(btn);
		}
	},
	getBookProgress: function(id){
		var me = myBookList;
		var method = 'POST';
		var url = '/makeUpFinshedRate.htm';
		var param = {bookId: id};
		var successFun = function(data){
			var item = $('#J_myBookList .book-item .loading[data-id="'+id+'"]');
			if(data.isFinshed == 'yes'){
				clearInterval(me.loadingId[id]);
				item.text(data.totalPage+'页');
				var btn = item.parents('.book-item').find('.make-book');
				btn.removeClass('disable');
			}else{
				item.find('em').text(data.rate);
			}
		};
		YS.ajaxData(method,url,param,successFun);
	},
	makeBookDisable: function(item){
		item.click(function(e){
			if($(this).hasClass('disable')){
				return false;
			}
		});
	},
	refreshTipDialog: {
		isInit: false,
		dialogItem: null,
		html: '<div class="refresh-tip"><i class="icon"></i><div class="info"><p>我们最近<em>重新优化</em>了微博书排版。</p><p>您的这本书需要<em>重新排版</em>才能继续<span class="tip-txt">制作纸质书</span>哦~</p><div class="btn"><a class="btn-normal submit" href="#" target="_self">重新排版</a><a class="btn-normal cancel">取消</a></div></div></div>',
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
    			width : 590,
    			dialogClass: "dialogStyle dialogTipShow",
    			closeOnEscape: false
    		});
    		me.isInit = true;
    		me.dialogItem = dialog;
			me.init = function(){};
		},
		show: function(id,txt){
			var me = this;
			if(!me.isInit){
				me.init();
				me.bindHandler();
			}
			me.dialogItem.attr('data-id',id);
			me.dialogItem.find('.tip-txt').text(txt);
			me.dialogItem.dialog('open');
		},
		close: function(){
			var me = this;
			me.dialogItem.dialog('close');
		},
		bindHandler: function(){
			var me = this;
			$('.dialogTipShow .submit').click(function(e){
				e.preventDefault();
                me.close();
                var id = me.dialogItem.attr('data-id');
                var goURL = '/editStatusBook.htm?bookId='+id;
                $(this).attr('href',goURL);
                //
                var url = window.location.href;
                window.location.href = goURL;
            });
            $('.dialogTipShow .cancel').click(function(e){
                me.close();
            });
		}
	}
};

//init
myBookList.init();


})()