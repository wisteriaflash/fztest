(function(){
var utils = {
	formatPrice: function(price){
		var p = price.replace('¥','');
		p = Number(p);
		return p;
	},
	getFormatPrice: function(price){
		var str = String(parseInt(price*100));
		var len = str.length;
		var intStr = str.substr(0,len-2);
		intStr = intStr.length==0 ? '0' : intStr;
		decimalStr = str.substr(len-2,2);
		if(decimalStr.length<2){
			decimalStr = '0'+decimalStr;
		}
		str = intStr+'.'+decimalStr;
		// if(price == 0){
		// 	str = '0.00';
		// }
		if(price == 0){
			str = '0.00';
		}
		return str;
	},
	addItemErrorTip: function(parent,item,text){
		parent.addClass('err');
		if(parent.has('.err-tip').length != 0){
			var tip = parent.find('.err-tip');
			tip.text(text);
			return;
		}
		var str = '<p class="err-tip">'+text+'</p>';
		parent.append(str);
		
	},
	removeItemErrorTip: function(parent, item){
		parent.removeClass('err');
	}
}

var bookList = {
	bookTotalPrice: 0,
	bookNumReadonly: false,
	bookList: $('#J_bookOrderList'),
	init: function(){
		var me = this;		
		me.bindHandler();
		me.setBookListHeight();
	},
	bindHandler: function(){
		var me = this;
		//bookOrderList
		var bookOrderList = $('#J_bookOrderList');
		bookOrderList.delegate('.book-num','blur',function(e){
			e.preventDefault();
			var $this = $(this);
			var num = Number($this.val());
			if(!num || num <= 0){
				$this.val(1);
			}
		});
		bookOrderList.delegate('.num-left','click',function(e){
			e.preventDefault();
			if(me.bookNumReadonly){
				return;
			}
			var $this = $(this);
			var input = $this.next();
			var num = parseInt(input.val()) - 1;
			if(num <= 0){
				return;
			}
			input.val(num);
		});
		bookOrderList.delegate('.num-right','click', function(e){
			e.preventDefault();
			if(me.bookNumReadonly){
				return;
			}
			var $this = $(this);
			var input = $this.prev();
			var num = parseInt(input.val()) + 1;
			if(num>999){
				return;
			}
			input.val(num);
		});
		//scroll bar
		$('#J_bookOrderList').perfectScrollbar({
			wheelSpeed: 175
		});
		//add book
		$('#J_addBookBtn').click(function(e){
			e.preventDefault();
			me.addBookDialog.show();
		});
		//del book
		bookOrderList.delegate('.del', 'click', function(e){
			var len = $('#J_bookOrderList').find('.abook').length;
			if(len<2){
				return;
			}
			var id = $(this).attr('data-id');
			me.delBook(id);
		});
	},
	getSelectBook: function(){
		var me = this;
		var arr = me.bookList.find('.abook');
		var selectArr = [];
		for(var i=0, len=arr.length; i<len; i++){
			var item = $(arr[i]);
			selectArr[i] = item.attr('data-id');
		}
		return selectArr;
	},
	bookListPrice: function(){
		var me = this;
		var bookOrderList = $('#J_bookOrderList');
		var listArr = $('#J_bookOrderList').find('.bookinfo');
		var totalPrice = 0;
		for(var i=0, len = listArr.length; i<len; i++){
			var item = $(listArr[i]);
			var num = parseInt(item.find('.book-num').val());
			var price = item.find('.sprice').text();
			price = utils.formatPrice(price);
			totalPrice += num * price;
		}
		me.bookTotalPrice = totalPrice;
	},
	addBook: function(item){
		var me = this;
		var id = item.attr('data-id');
		var title = item.find('.title').text();
		var page = item.find('.page').text();
		var coverImg = item.find('.cover-img').attr('src');
		var firstPage = item.find('.page').attr('data-first');
		var totalPage = item.find('.page').attr('data-total');
		var price = item.attr('data-price');
		price = utils.getFormatPrice(price);
		price = price.split('.');
		var firstStr = '';
		if(firstPage>0){
			firstStr = '<div class="addinfo">(其中包含：扉页¥'+firstPage+'.00)</div>';
		}
		//
		var str = '<div class="abook" data-id="'+id+'">'+
					'<div class="img"><img src="'+coverImg+'" alt="'+title+'" width="94" height="133" /></div>'+
					'<div class="bookinfo">'+
						'<h3>'+title+'</h3>'+
						'<p class="page" data-first="'+firstPage+'" data-total="'+totalPage+'">'+page+'</p>'+
						'<div class="del" title="删除" data-id="'+id+'"></div>'+
						'<div class="sprice">单册价格：<em>¥'+price[0]+'</em>.'+price[1]+'</div>'+
						firstStr+
						'<div class="opt">'+
							'<div class="book-num-con cf">'+
								'<a class="num-left" href="#"><span>-</span></a>'+
								'<input class="book-num" name="num" type="text" value="1" maxlength="3" />'+
								'<a class="num-right" href="#"><span>+</span></a>'+
								'<input type="hidden" name="bookId" value="'+id+'">'+
							'</div>'+
						'</div>'+
					'</div>'+
				  '</div>';
		$(str).insertBefore('#J_addBookBtn');
		me.setBookListHeight();
	},
	delBook: function(id){
		var me = this;
		var bookItem = $('#J_bookOrderList').find('.abook[data-id="'+id+'"]');		
		bookItem.remove();
	},
	setBookListHeight: function(){
		var num  = parseInt($('.bookgoodslist .abook').size())+1;
		num = Math.ceil(num/3);
		var sh = num * 175;
		$('.bookgoodslist').css('height',sh);
	},
	resetBookNum: function(){
		var me = this;
		var bookOrderList = $('#J_bookOrderList');
		var inputArr = bookOrderList.find('.book-num');
		inputArr.val(1);
	},
	readOnlyBookNum: function(readonly){
		var me = this;
		var bookOrderList = $('#J_bookOrderList');
		var inputArr = bookOrderList.find('.book-num');
		if(readonly){
			inputArr.attr('readonly','readonly');
		}else{
			inputArr.removeAttr('readonly');
		}
		me.bookNumReadonly = readonly;
	},
	addBookDialog : {
		isInit: false,
		dialogItem: null,
		mainContent: $('#J_addBook'),
		curNum: 0,
		maxNum: 0,
		itemWidth: 153,
		perLen: 3,
		isPlaying: false,
		isGetingData: false,
		init: function(){
			var me = this;
			var closeHandler = function() {
	            me.close();
	        };
			var content = me.mainContent;
    		$("body").append(content);
    		var dialog = content.dialog({
    			autoOpen: false,
    			draggable: false,
    			modal: true,
    			resizable: false,
    			width : 650,
    			dialogClass: "dialogStyle dialogMyBook",
    			closeOnEscape: false
    		});
    		me.isInit = true;
    		me.dialogItem = dialog;
			me.init = function(){};
		},
		show: function(){
			var me = this;
			if(!me.isInit){
				me.init();
				me.initData();
				me.bindHandler();
			}
			me.selecteBook();
			me.dialogItem.dialog('open');
		},
		close: function(){
			var me = this;
			me.dialogItem.dialog('close');
		},
		bindHandler: function(){
			var me = this;
			var imgLength = me.mainContent.find('.plist li').length,
				tprev = me.mainContent.find('.pprev'),
				tnext = me.mainContent.find('.pnext'),
				_plist = me.mainContent.find('.plist');
			var pwidth = me.itemWidth*me.perLen;
			var rollNum = Math.ceil(imgLength/me.perLen);
			me.setListWidth();

			//prev
			tprev.click(function(e){
				e.preventDefault();
				if(me.isPlaying){
					return;
				}
				if(me.curNum+1 >1){
					me.curNum--;
					me.curNum = me.curNum;
					var backValue = -(me.curNum)*pwidth;
					me.isPlaying = true;
					_plist.animate({left: backValue+'px'}, "fast", function(){
						me.isPlaying = false;
					});
					me.checkPageBtn();
					me.setPageNum();
				}else{
					return false;
				}
			});
			//next
			tnext.click(function(e){
				e.preventDefault();
				if(me.isPlaying){
					return;
				}
				var imgLength = me.mainContent.find('.plist li').length;
				var rollNum = Math.ceil(imgLength/me.perLen);
				//
				if(me.curNum+1<rollNum){
					me.curNum++;
					me.curNum = me.curNum;
					var leftValue = -me.curNum*pwidth;
					me.isPlaying = true;
					_plist.animate({left: leftValue+'px'}, "fast", function(){
						me.isPlaying = false;
					});
					me.checkPageBtn();
					me.setPageNum();
					//getData
					if((rollNum+1) <= me.maxNum){
						me.getData(rollNum+1, false);
					}
				}else{
					return false;
				}
			});
			//select
			var addBookList = me.mainContent.find('.plist');
			addBookList.delegate('li', 'click', function(e){
				var $this = $(this);
				if($this.hasClass('selected')){
					return;
				}
				bookList.addBook($this);
				me.close();
			});
		},
		setPageNum: function(){
			var me = this;
			me.mainContent.find('.cur-page').text(me.curNum+1);
			me.mainContent.find('.total-page').text(me.maxNum);
		},
		setListWidth: function(){
			var me = this;
			var imgLength = me.mainContent.find('.plist li').length;
			var plist = me.mainContent.find('.plist');
			//
			var twid = imgLength*me.itemWidth;
			plist.width(twid);
		},
		checkPageBtn: function(){
			var me = this;
			var tprev = me.mainContent.find('.pprev'),
				tnext = me.mainContent.find('.pnext');
			tprev.removeClass('disabled');
			tnext.removeClass('disabled');
			if(me.curNum == 0){
				tprev.addClass('disabled');
			}
			if(me.curNum == me.maxNum-1){
				tnext.addClass('disabled');
			}
		},
		initData: function(){
			var me = this;
			var page = me.curNum + 1;
			me.getData(page,true);
		},
		getData: function(page,getNext){
			var me = this;
			var method = 'POST';
			var url = '/order!findUserBookByPage.htm';
			var param = {currPage: page};
			var successFun = function(data){
				data = data.userBookDOList;
				if(!data){
					return;
				}
				me.maxNum = Math.ceil(data[0].count/me.perLen);
				me.renderHtml(data);
				me.setListWidth();
				me.setPageNum();
				me.selecteBook();
				if(getNext){
					me.getData(page+1, false);
				}
				me.checkPageBtn();
			};
			var errorFun = function(){
				alert('数据出错');
			};
			YS.ajaxData(method,url,param,successFun,errorFun);
		},
		renderHtml: function(data){
			var me = this;
			var str = '';
			for(var i=0, len=data.length; i<len; i++){
				var item = data[i];
				var bookInfo = item.statusBookInfo;
				var pages = bookInfo.totalPages + bookInfo.firstPages;
				var price = item.price + item.firstPrice;
				var itemStr='<li data-id="'+item.id+'" data-price="'+price+'">'+
								'<a>'+
									'<div class="detail">'+
										'<span class="title">'+bookInfo.bookName+'</span>'+
										'<span class="page" data-first="'+bookInfo.firstPages+'" data-total="'+bookInfo.totalPages+'">'+pages+'页</span>'+
										'<span class="last-time">最后编辑：<em>'+item.updateTimeBys+'</em></span>'+
									'</div>'+
									'<span class="icon-selected"></span>'+
									'<img class="cover-img" src="'+item.bookCoverUrl+'" width="118" height="167" />'+
								'</a>'+
							'</li>';
				str += itemStr;
				
			}
			var plist = me.mainContent.find('.plist');
			plist.append(str);
		},
		selecteBook: function(){
			var me = this;
			var arr = bookList.getSelectBook();
			var list = me.mainContent.find('.plist');
			list.find('li').removeClass('selected');
			for(var i=0, len=arr.length; i<len; i++){
				var id = arr[i];
				var item = list.find('li[data-id="'+id+'"]');
				if(item){
					item.addClass('selected');
				}
			}
		}
	}
};

//address
var address = {
	listNode: $('#J_addressList'),
	curType: 'one',
	addressPrice: 0,
	itemHeight: 40,
	bookSeriesArr: [],
	bookSeriesNum: 1,
	init: function(){
		var me = this;
		me.initData();
		me.setConHeight();
		me.bindHandler();
		me.checkDisable();
	},
	initData: function(){
		var me = this;
		// var numArr = me.listNode.find('.opt');
	},
	bindHandler: function(){
		var me = this;
		//set one or more
		$('#J_address .eye a').click(function(e){
			e.preventDefault();
			var targetId = $(this).attr('id');
			if(targetId == 'ton'){
				$(this).prev().toggle();
				me.curType = 'more';
			}else if(targetId == 'to1'){
				$(this).next().toggle();
				me.curType = 'one';
			}
			$(this).toggle();
			$('#J_address .addrlist').slideToggle();
			$('#J_address .addrlistn').slideToggle();
			me.checkDisable();
			otherOpt.checkeInvoice();
		});
		//one person
		$("#J_address .addrlist").delegate("input[type='radio']", 'change', function(){
			var arr = me.listNode.find(".addrlist li");
			arr.removeClass('selected');
			arr.find('input[name="cityId"]').prop('disabled',true);
			var parent = $(this).parents('li');
			parent.addClass('selected');
			parent.find('input').prop('disabled',false);
			//check trans
			var transSelectSign = otherOpt.transSelectSign;
			transSelectSign.fromAddressStore = false;
			//addressStore
			$('#J_isPickUp').val('false');
			if($(this).attr('id') == 'addressStore'){
				$('#J_isPickUp').val('true');
				me.showAddressStore();
				transSelectSign.fromAddressStore = true;
			}
			//
			otherOpt.setTransSelect();
		});
		//more person
		$("#J_address .addrlistn").delegate("input[type='checkbox']", 'change', function(){
			var arr = me.listNode.find(".addrlistn li").filter('.selected');
			var checked = $(this).prop('checked');
			if( !checked && arr.length == 1){
				$(this).prop('checked',true);
				return;
			}
			$(this).parent().toggleClass('selected');
			var checked = $(this).prop('checked');
			var parent = $(this).parent();
			parent.find('.book-num').prop('disabled', !checked);
			parent.find('input[name="cityId"]').prop('disabled', !checked);
			//
			var numValue = $(this).parent().find('.book-num').val();
			numValue = Number(numValue);
			var num = me.bookSeriesNum;
			if(checked){
				num += numValue;
			}else{
				num -= numValue;
			}
			me.setBookSeriesNum(num);
		});
		//set default addr
		$("#J_address").delegate('.addr-setd','click', function(e){
			e.preventDefault();
			var id = $(this).parents('li').find('label').attr('for');
			if(me.curType == 'one'){
				id = id.replace('address','');
			}else if(me.curType == 'more'){
				id = id.replace('addressN','');
			}
			me.setDefaultAdrress(id);
		});
		//more person num
		$("#J_address").delegate('.book-num','blur',function(e){
			e.preventDefault();
			var $this = $(this);
			var num = Number($this.val());
			if(!num || num <= 0){
				$this.val(1);
			}
		});
		$("#J_address").delegate('.num-left', 'click', function(e){
			e.preventDefault();
			var $this = $(this);
			var input = $this.next();
			var num = parseInt(input.val()) - 1;
			if(num <=0 || input.prop('disabled')){
				return;
			}
			input.val(num);
			//
			var parent = $this.parents('.selected');
			if(parent.length>0){
				me.setBookSeriesNum(me.bookSeriesNum-1);
			}
		});
		$("#J_address").delegate('.num-right', 'click', function(e){
			e.preventDefault();
			var $this = $(this);
			var input = $this.prev();
			var num = parseInt(input.val()) + 1;
			if(input.prop('disabled') || num>999){
				return;
			}
			input.val(num);
			//
			var parent = $this.parents('.selected');
			if(parent.length>0){
				me.setBookSeriesNum(me.bookSeriesNum+1);
			}
		});
		//add address
		$("#J_addAddr").click(function(e){
			e.preventDefault();
			me.addAddressDialog.show('add');
		});
		//edit address
		me.listNode.delegate('.addr-modify', 'click', function(e) {
			e.preventDefault();
			var id = $(this).parents('li').find('label').attr('for');
			if(me.curType == 'one'){
				id = id.replace('address','');
			}else if(me.curType == 'more'){
				id = id.replace('addressN','');
			}
			me.editAddress(id);
		});
		//del address
		me.listNode.delegate('.addr-del', 'click', function(e) {
			e.preventDefault();
			var id = $(this).parents('li').find('label').attr('for');
			if(me.curType == 'one'){
				id = id.replace('address','');
			}else if(me.curType == 'more'){
				id = id.replace('addressN','');
			}
			var config = {
				onsubmit: function(){
					me.delAddress(id);
				}
			}
			YS.tipConfirmDialog.show(config);
		});
		//reselectStore
		$('#J_reselectStore').click(function(e){
			me.addressStoreDialog.show();
		});
	},
	setBookSeriesNum: function(num){
		var me = this;
		me.bookSeriesNum = num;
	},
	setConHeight: function(){
		var me = this;
		var num = me.listNode.find('.addrlist li').length;
		var height = num * me.itemHeight;
		me.listNode.find('.addrbox-con').css('height', height);
	},
	checkDisable: function(){
		var me = this;
		var arr = [];
		var readonly = false;
		if(me.curType == 'one'){
			arr = me.listNode.find('.addrlistn input');
		}else if(me.curType == 'more'){
			arr = me.listNode.find('.addrlist input');
			readonly = true;
			bookList.resetBookNum();
		}
		me.listNode.find('input').removeAttr('disabled');
		arr.prop('disabled',true);
		var curList = me.getCurList();
		curList.find('li .book-num').prop('disabled',true);
		curList.find('li input[name=cityId]').prop('disabled',true);
		curList.find('li.selected input').prop('disabled', false);
		curList.find('li.selected input[type="checkbox"]').prop('checked',true);	//IE fix
		//
		bookList.readOnlyBookNum(readonly);
	},
	getCurList: function(){
		var me = this;
		var list = null;
		if(me.curType == 'one'){
			list = $('#J_address .addrlist');
		}else if(me.curType == 'more'){
			list = $('#J_address .addrlistn');
		}
		return list;
	},
	getAddressPrice: function(){
		var me = this;
		if(me.curType == 'one'){

		}else if(me.curType == 'more'){

		}
	},
	setDefaultAdrress: function(id){
		var me = this;
		var method = 'POST';
		var url = '/order!updateIsDefaultAddress.htm';
		var param = {isdefault: 1, addressId: id};
		var successFun = function(data){
			if(data.error){
				alert(data.error);
				return;
			}
			me.updateDefaultAdrress(id);
		}
		YS.ajaxData(method,url, param, successFun);
	},
	updateDefaultAdrress: function(id){
		var me = this;
		me.cleanDefaultAddress();
		var defaultCls = 'addr-default';
		var setDefaultCls = 'addr-setd';
		//
		var oneItem = $('#address'+id).parent();
		oneItem = oneItem.find('.addr-setd');
		oneItem.removeClass(setDefaultCls).addClass(defaultCls);
		oneItem.text('默认地址');
		var moreItem = $('#addressN'+id).parent();
		moreItem = moreItem.find('.addr-setd');
		moreItem.removeClass(setDefaultCls).addClass(defaultCls);
		moreItem.text('默认地址');
	},
	addAddress: function(data){
		var me = this;
		me.cleanSelectAddress();
		if(data.isdefault == '1'){
			me.cleanDefaultAddress();
		}
		//one
		var oneStr = me.getAddressHtml(data,'radio');
		var oneList = me.listNode.find('.addrlist');
		var oneStroe = oneList.find('.address-store');
		$(oneStr).insertAfter(oneStroe);
		// oneList.prepend(oneStr);
		//more
		var moreStr = me.getAddressHtml(data,'checkbox');
		var moreList = me.listNode.find('.addrlistn');
		moreList.prepend(moreStr);
		me.checkDisable();
		//
		me.setConHeight();
	},
	updateAddress: function(data){
		var me = this;
		var id = data.id;
		var title = data.provinceName + data.cityName + data.areaName + ' ' + data.address+'('+data.receiver+' 收) '+data.phone;
		var cityid = data.cityid;
		//one
		var oneItem = $('#address'+id).parents('li');
		oneItem.find('label').text(title);
		oneItem.find('input[type="hidden"]').val(cityid);
		//more
		var moreitem = $('#addressN'+id).parents('li');
		moreitem.find('label').text(title);
		moreitem.find('input[type="hidden"]').val(cityid);
		if(data.isdefault == '1'){
			me.updateDefaultAdrress(data.id);
		}
	},
	editAddress: function(id){
		var me = this;
		var method = 'POST';
		var url = '/order!updateMailingAddress.htm';
		var param = {addressId: id};
		var successFun = function(data){
			if(data.error){
				alert(data.error);
				return;
			}
			data = data.postaddress;
			me.addAddressDialog.editDataFun(data);
			me.addAddressDialog.show('edit');
		};
		YS.ajaxData(method,url,param,successFun);
	},
	delAddress: function(id){
		var me = this;
		var method = 'POST';
		var url = '/order!delMailingAddress.htm';
		var param = {addressId: id};
		var successFun = function(data){
			if(data.success == 'true'){
				var oneItem = $('#address'+id).parent();
				oneItem.remove();
				var moreItem = $('#addressN'+id).parent();
				moreItem.remove();	
			}else if(data.error){
				alert(data.error)
			}
			me.setConHeight();
		};
		YS.ajaxData(method,url,param,successFun);
	},
	getAddressHtml: function(data,type){
		var me = this;
		var item = data;
		var title = item.provinceName + item.cityName + item.areaName + ' ' + item.address+'('+data.receiver+' 收) '+data.phone;
		var bookNumStr = '';
		var defaultStr = '<a class="addr-setd">设为默认地址</a>';
		var select = '', checked = '', prefix = 'address';
		if(type == 'checkbox'){
			bookNumStr = '<div class="book-num-con book-series">'+
							'<a class="num-left" href="#"><span>-</span></a>'+
							'<input class="book-num" name="tnum" type="text" value="1" maxlength="3" />'+
							'<a class="num-right" href="#"><span>+</span></a>'+
						'</div>';
			prefix = 'addressN';
		}
		if(item.isdefault=='1'){
			defaultStr = '<a class="addr-default">默认地址</a>';
		}
		if(me.addAddressDialog.status == 'add'){
			select = 'selected';
			checked = 'checked';
		}
		var str = '<li class="'+select+'">'+
						'<input type="hidden" name="cityId" value="'+data.cityid+'" />'+
						'<input id="'+prefix+item.id+'" name="addressId" value="'+item.id+'" type="'+type+'" checked="'+checked+'" />'+
						'<label for="'+prefix+item.id+'" title="'+title+'">'+title+'</label>'+
						'<div class="opt">'+
							defaultStr+
							'<a class="addr-modify" href="#" title="修改本地址"></a>'+
							'<a class="addr-del" href="#" title="删除本地址"></a>'+
							bookNumStr+
						'</div>'+
					'</li>';
		return str;
	},
	cleanSelectAddress: function(){
		var me = this;
		var list = null;
		//one
		list = $('#J_address .addrlist');
		list.find('li').removeClass('selected');
		list.find('li input[type="radio"]').prop('checked',false);
		//more
		list = $('#J_address .addrlistn');
		list.find('li').removeClass('selected');
		list.find('li input[type="checkbox"]').prop('checked',false);
		list.find('li input[type="text"]').prop('disabled',true);
	},
	cleanDefaultAddress: function(){
		var me = this;
		var list ,defaultAdr;
		var defaultCls = 'addr-default';
		var setDefaultCls = 'addr-setd';
		//one
		list = $('#J_address .addrlist');
		defaultAdr = list.find('.'+defaultCls);
		defaultAdr.removeClass(defaultCls).addClass(setDefaultCls);
		defaultAdr.text('设为默认地址');
		//more
		list = $('#J_address .addrlistn');		
		defaultAdr = list.find('.'+defaultCls);
		defaultAdr.removeClass(defaultCls).addClass(setDefaultCls);
		defaultAdr.text('设为默认地址');
	},
	addAddressDialog : {
		isInit: false,
		dialogItem: null,
		contentItem: null,
		selecteRegion: null,
		status: '',
		editData: null,
		mainContent: $('#J_addressDialog'),
		init: function(){
			var me = this;
			var closeHandler = function() {
	            me.close();
	        };
			var content = me.mainContent;
    		$("body").append(content);
    		var dialog = content.dialog({
    			autoOpen: false,
    			draggable: false,
    			modal: true,
    			resizable: false,
    			width : 650,
    			dialogClass: "dialogStyle dialogAddress",
    			closeOnEscape: false
    		});
    		me.isInit = true;
    		me.dialogItem = dialog;
    		me.contentItem = content;
			me.init = function(){};
		},
		show: function(status){
			var me = this;
			if(!me.isInit){
				me.init();
				me.bindHandler();
			}
			me.status = status;
			if(status == 'add'){
				me.editData = null;
				$('#J_addAddrForm')[0].reset();
				$("#J_province").get(0).selectedIndex=0;
			}
			$('#J_province').change();
			$('#J_addAddrForm td').removeClass('err');
			me.dialogItem.dialog('open');
		},
		close: function(){
			var me = this;
			me.dialogItem.dialog('close');
		},
		bindHandler: function(){
			var me = this;			
			//province
			$('#J_province').change(function(e){
				var id = $(this).find('option:selected').attr('value');
				me.getRegionData('city',id);
				me.checkItemSelect($(this));
			});
			//city
			$('#J_city').change(function(e){
				var id = $(this).find('option:selected').attr('value');
				me.getRegionData('area',id);
			});
			
			//form
			$('#J_addAddrForm').submit(function(e){
				if(me.checkAllValue()){
					me.close();
					var url = '/order!addMailingAddress.htm';
					var param = $(this).serialize();
					var successFun = function(data){
						if(data.error){
							alert(data.error);
							return;
						}
						//
						data = data.postaddress;
						if(me.status == 'add'){
							address.addAddress(data);
						}else if(me.status == 'edit'){
							address.updateAddress(data);
						}
					};
					var errorFun = function(data){
						alert('添加地址失败');
					};
					if(me.status == 'edit'){
						param += '&addressId='+me.editData.id;
					}
					YS.ajaxPost(url,param,successFun, errorFun);
				}
				return false;
			});
			//save
			me.mainContent.find('.btn-addr').click(function(e){
				e.preventDefault();
				var form = $('#J_addAddrForm');
				form.submit();
			});
			//blur
			$('#J_addAddrForm').find('input').blur(function(e){
				var id = $(this).attr('id');
				if(id == 'J_telphoneNum'){
					//check
					var value = Number($(this).val());
					if(!value){
						$(this).val('');
						// alert('请输入正确的邮编');
					}
					return;
				}
				me.checkItemValue($(this));
			});
			$('#J_telphoneNum').bind('keyup', function(e){
				var value = Number($(this).val());
				if(!value){
					$(this).val('');
					// alert('请输入正确的邮编');
				}
			});
		},
		checkItemSelect: function(item){
			var me = this;
			var value = item.find('option:selected').attr('value');
			if(!value){
				item.addClass('err');
				me.addErrorTip(item,'请填写所在地区');
				return false;
			}
			me.removeErrorTip(item);
			return true;
		},
		checkItemValue: function(item){
			var me = this;
			var id = item.attr('id');
			var value = item.val();
			if(value.length == 0){
				me.addErrorTip(item,'该项为必填项');
				return false;
			}
			if(id == 'J_mobileNum'){
				if(!Number(value) || value.length!=11){
					me.addErrorTip(item,'请填写11位手机号');
					return false;	
				}
			}
			me.removeErrorTip(item);
			return true;
		},
		checkAllValue: function(){
			var me = this;
			var sign = true, tempSign = null;
			//select
			var selectArr = ['J_province'];
			for(var j=0, jlen=selectArr.length; j<jlen; j++){
				var item = $('#'+selectArr[j]);
				tempSign = me.checkItemSelect(item);
				if(sign){
					sign = tempSign;
				}
			}
			//input
			var valueArr = $('#J_addAddrForm').find('input[type="text"]');
			for(var i=0, len=valueArr.length; i<len-1; i++){
				var item = $(valueArr[i]);
				tempSign = me.checkItemValue(item);
				if(sign){
					sign = tempSign;
				}
			}
			return sign;
		},
		removeErrorTip: function(item){
			item.removeClass('err');
			var parent = item.parent();
			if(parent.find('.err').length==0){
				parent.removeClass('err');
			}
		},
		addErrorTip: function(item,text){
			var parent = item.parent();
			parent.addClass('err');
			if(parent.has('.err-tip').length != 0){
				var tip = parent.find('.err-tip');
				tip.text(text);
				return;
			}
			var tip = '<span class="err-tip">'+text+'</span>';
			parent.append(tip);
		},
		getRegionData: function(type,id){
			var me = this;
			var method = 'POST';
			var url = '/order!getAreabyParentId.htm';
			var param = {parentId: id};
			var successFun = function(data){
				data = data.childAreaDOList;
				var str = me.getRegionHtml(data);
				var item = $('#J_'+type);
				me.removeErrorTip(item);
				item.html(str);
				if(me.status == 'edit'){
					var value = me.editData[type+'id'];
					item.val(value);
				}
				item.change();
			}
			YS.ajaxData(method,url,param,successFun);
		},
		getRegionHtml: function(data){
			var len = data.length;
			var str = '';
			for(var i=0; i<len; i++){
				var item = data[i];
				str += '<option value="'+item.id+'">'+item.name+'</option>';
			}
			return str;
		},
		editDataFun: function(data){
			var me = this;
			var content = me.contentItem;
			var id = data.provinceid;
			$('#J_province').val(id);
			me.editData = data;
			//input
			var arr = [data.address,data.receiver,data.phone,data.postcode];
			var inputArr = $('#J_addAddrForm').find('input[type="text"]');
			for(var i=0, len=arr.length; i<len; i++){
				$(inputArr[i]).val(arr[i]);
			}
			if(data.isdefault == '1'){
				$('#J_setDefaultAddr').prop('checked',true);
			}else{
				$('#J_setDefaultAddr').prop('checked',false);
			}
		}
	},
	showAddressStore: function(){
		var me = this;
		var store = $('#J_addressList .address-store');
		var detailsAddrTxt = store.find('.details-addr').text();
		if(!detailsAddrTxt){
			me.addressStoreDialog.show();
			store.find('.details').css('display','none');
		}
	},
	showAddressStoreDetails: function(txt){
		var store = $('#J_addressList .address-store');
		var detailsAddr = store.find('.details-addr');
		if(txt){
			detailsAddr.text(txt);
			detailsAddr.attr('title',txt);
		}
		store.find('.details').css('display','');
	},
	selectStoreDetails: function(){
		var me = this;
		var store = $('#J_addressList .address-store');
		var detailsAddr = store.find('.details-addr');
		var txt = detailsAddr.text();
		var transSelectSign = otherOpt.transSelectSign;
		if(txt.length == 0){
			var listArr = $('#J_addressList .addrlist li');
			listArr.removeClass('selected');
			if(listArr.length>1){
				var first = $(listArr[1]).find('input[type="radio"]');
				first.prop('checked',true);
				first.change();
			}else{//clean store
				var store = $('#addressStore');
				store.prop('checked',false);
				$('#J_isPickUp').val('false');
				listArr.find('input[name="cityId"]').prop('disabled',true);
			}
			//check trans
			transSelectSign.fromAddressStore = false;
		}else{
			//check trans
			transSelectSign.fromAddressStore = true;
		}
		otherOpt.setTransSelect();
	},
	addressStoreDialog: {
		isInit: false,
		dialogItem: null,
		mainContent: $('#J_storesCon'),
		isGetingData: false,
		init: function(){
			var me = this;
			var closeHandler = function() {
	            me.close();
	        };
			var content = me.mainContent;
    		$("body").append(content);
    		var dialog = content.dialog({
    			autoOpen: false,
    			draggable: false,
    			modal: true,
    			resizable: false,
    			width : 610,
    			dialogClass: "dialogStyle dialogBlack dialogAddressStroe",
    			closeOnEscape: false,
    			close: function(){
    				me.close();
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
				me.initData();
				me.bindHandler();
			}
			me.dialogItem.dialog('open');
		},
		close: function(){
			var me = this;
			me.dialogItem.dialog('close');
			//show
			address.selectStoreDetails();
		},
		initData: function(){
			var me = this;
			var method = 'GET';
			var url = 'b.php';
			var param = {};
			var successFun = function(data){
				
			};
			me.renderHtml();
			// YS.ajaxData(method,url,param,successFun);
		},
		renderHtml: function(data){
			var me = this;
			//
		},
		bindHandler: function(){
			var me = this;
			me.mainContent.delegate('.bd li', 'click', function(e){
				if($(this).hasClass('selected')){
					return;
				}
				var list = me.mainContent.find('.bd li');
				list.removeClass('selected');
				$(this).addClass('selected');
			});
			me.mainContent.find('.user-store-form input').blur(function(e){
				me.checkUserStore($(this));
			});
			me.mainContent.find('.submit').click(function(e){
				e.preventDefault();
				$('#J_storesForm').submit();
			});
			me.mainContent.find('.cancel').click(function(e){
				e.preventDefault();
				me.close();
			});
			$('#J_storesForm').submit(function(e){
				if(me.checkUserStoreForm()){
					me.setAddressStoreTxt();
					me.close();
				}
				return false;
			});
		},
		setAddressStoreTxt: function(){
			var me = this;
			var item = me.mainContent.find('.bd li.selected');
			var provinces = item.find('.provinces').text();
			var details = ' '+item.find('.details').attr('title');
			var receiver = '('+$('#J_userStoreName').val()+' 收)';
			var tel = ' '+$('#J_userStoreTelphone').val();
			//txt
			var txt = provinces + details + receiver + tel;

			var cityId = item.find('.cityId').val();
			var storeId = item.find('.storeId').val();
			$('#J_cityId').val(cityId);
			$('#J_storeId').val(storeId);
			address.showAddressStoreDetails(txt);
		},
		checkUserStore: function(item){
			var me = this;
			var value = item.val();
			var parent = item.parents('p');
			if(value.length == 0){
				utils.addItemErrorTip(parent, item, '该项为必填项');
				return false;
			}
			if(item.attr('id') == 'J_userStoreTelphone'){
				if(value.length != 11 || !Number(value)){
					utils.addItemErrorTip(parent, item, '请填写11位的手机号码');
					return false;
				}
			}
			utils.removeItemErrorTip(parent, item);
			return true;
		},
		checkUserStoreForm: function(){
			var me = this;
			var sign = true;
			var tempSign = null;
			var checkArr = ['J_userStoreName','J_userStoreTelphone'];
			for(var i=0, len=checkArr.length; i<len; i++){
				var item = $('#'+checkArr[i]);
				tempSign = me.checkUserStore(item);
				if(sign){
					sign = tempSign;
				}
			}
			return sign;
		}
	}
};

var otherOpt = {
	transSelectSign:{
		fromAddressStore: false,
		founderStaff: false
	},
	init: function(){
		var me = this;
		me.bindHandler();
	},
	bindHandler: function(){
		var me = this;
		//exprice
		$('#J_getPrice').click(function(e){
			e.preventDefault();
			e.stopPropagation();
			//check
			if(!me.orderAddressCheck()){
				return;
			}
			//
			$(this).css('display','none');
			$('#J_otherOpt').slideDown(300);
			$('#J_otherOpt').addClass('loading');
			me.getTtotalPrice();
			// $('#J_otherOpt').css('display','block');
		});
		$('#J_orderCon').click(function(e){
			var target = $(e.target);
			var parent = target.parents('#J_otherOpt');
			var otherOpt = $('#J_otherOpt');
			if(target.hasClass('other-opt')){
				return;
			}
			if(!parent.hasClass('other-opt') && otherOpt.css('display') == 'block'){
				$('#J_getPrice').css('display','block');
				otherOpt.slideUp(300);
			}
		});
		//invoice
		$("#J_invoice input[name='invoice']").change(function(e){
			$('#J_invoiceTitle').toggle();
			var itemId = $(this).attr('id');
			var disabled = false;
			if(itemId == 'nInvoice'){
				disabled = true;
			}
			$('#J_invoiceTitle').prop('disabled',disabled);
		});
		//preferential
		$('#J_preferentialBtn').click(function(e){
			e.preventDefault();
			if(me.preferentialDialog.isGetingData){
				return;
			}
			me.preferentialDialog.show();
		});
		//tips
		$('#J_remark').bind('input propertychange', function() {
       		// Store the maxlength and value of the field.
	        var maxlength = $(this).attr('maxlength');
	        var val = $(this).val();
	        // Trim the field if it has content over the maxlength.
	        if (val.length > maxlength) {
	            $(this).val(val.slice(0, maxlength));
	        }
	    });
		//submit
		$('#J_orderForm').submit(function(e){
			//check
			if(!me.orderFormCheck()){
				return false;
			}
			//
			var method = 'POST';
			var url = '/order!addOrder.htm';
			var param = $(this).serialize()
			var successFun = function(data){
				if(data.error){
					alert(data.error);
					return;
				}
				var url = '/order!alipayInit.htm?orderId='+data.orderId;
				window.location.href = url;
			};
			//allTNum
			var list = address.getCurList();
			var listArr = list.find('li').filter('.selected');
			var totalNum = 0;
			//
			for(var j=0, jlen=listArr.length; j<jlen; j++){
				var item = $(listArr[j]);
				//more
				if(address.curType == 'more'){
					var tnum = item.find('.book-num').val();
					totalNum += Number(tnum);
				}
			}
			param += '&allTNum='+totalNum;
			//more form
			if($('#addressStore').prop('checked')){
				var formStoreStr = $('#J_storesForm').serialize();
				param += '&'+formStoreStr;
			}
			if($('#J_isFounder').val() == 'true'){
				var formAccountStr = $('#J_accountForm').serialize();
				param += '&'+formAccountStr;
			}
			//
			YS.ajaxData(method,url,param,successFun);
			return false;
		});
		$('#J_submitOrder').click(function(e){
			e.preventDefault();
			$('#J_orderForm').submit();
		});
	},
	orderAddressCheck: function(){
		var addr = address.getCurList().find('li.selected');
		if(addr.length<1){
			alert('收货地址不能为空或没有选中');
			return false;
		}
		return true;
	},
	orderFormCheck: function(){
		var me = this;
		var sign = true;
		//address
		if(!me.orderAddressCheck()){
			sign = false;
			return sign;
		}
		//other
		return sign;
	},
	setTransSelect: function(){
		var me = this;
		var sign = me.transSelectSign;
		var setSelectId = '1000000003';//有优惠信息时，只能选择中通快递
		var transSelect = $('#transSelect');
		if(sign.fromAddressStore || sign.founderStaff){
			transSelect.val(setSelectId);
			transSelect.find('option').css('display','none');
			transSelect.find('option:selected').css('display','');
		}else{
			transSelect.find('option').css('display','');
		}
	},
	checkeInvoice: function(){
		var type = address.curType;
		var invoice = $('#J_invoice');
		if(type == 'more'){
			invoice.find('input').prop('disabled',true);
			$('#nInvoice').prop('checked', true);
			$('#nInvoice').prop('disabled',false);
			$('#J_invoiceTitle').hide();
		}else{
			invoice.find('input').prop('disabled',false);
		}
	},
	getTtotalPriceParam: function(){
		var str = '';
		//trans
		var transStr = $('#transSelect option:selected').val();
		str += 'logisticsCompanyID='+transStr;
		//book
		var bookArr = $('#J_bookOrderList .abook');
		for(var i=0, len=bookArr.length; i<len; i++){
			var item = $(bookArr[i]);
			var num = item.find('.book-num').val();
			// var page = item.find('.page').text();
			// page = page.replace('页','');
			var firstPage = item.find('.page').attr('data-first');
			var totalPage = item.find('.page').attr('data-total');
			
			//
			var bookStr = '&num='+num + '&bookTotalPage='+totalPage+ '&bookFirstPage='+firstPage;
			str += bookStr;
		}
		//address
		var list = address.getCurList();
		var listArr = list.find('li').filter('.selected');
		var totalNum = 0;
		//
		for(var j=0, jlen=listArr.length; j<jlen; j++){
			var item = $(listArr[j]);
			var city = item.find('input[name="cityId"]').val();
			var addrStr = '&cityId='+city;
			//more
			if(address.curType == 'more'){
				var tnum = item.find('.book-num').val();
				totalNum += Number(tnum);
				addrStr += '&tnum='+tnum;
			}
			str += addrStr;
		}
		str += '&allTNum='+totalNum;
		str += '&isPickUp='+$('#J_isPickUp').val();
		str += '&isFounder='+$('#J_isFounder').val();
		return str;
	},
	getTtotalPrice: function(){
		var me = this;
		var method = 'POST';
		var url = '/order!calculatePrice.htm';
		var param =me.getTtotalPriceParam();
		var otherOpt = $('#J_otherOpt');
		var successFun = function(data){
			if(data.error){
				alert(data.error);
				$('#J_getPrice').css('display','block');
				otherOpt.slideUp(300);
				return;
			}
			//
			var goodPrice = utils.getFormatPrice(data.bookPrice);
			otherOpt.find('.good-price em').text(goodPrice);
			var exPrice = utils.getFormatPrice(data.feightPrice);
			otherOpt.find('.ex-price em').text(exPrice);
			var cutPrice = utils.getFormatPrice(data.rebatePrice);
			otherOpt.find('.cut-price em').text(cutPrice);
			var totalPrice = utils.getFormatPrice(data.allPrice);
			otherOpt.find('.total-price em').text(totalPrice);
			//
			otherOpt.removeClass('loading');
		}
		YS.ajaxData(method,url,param,successFun);
	},
	preferentialTips: function(type,data){
		var typeCls = type;
		var text = '';
		var tipCon = $('#J_preferentialTip');
		tipCon.attr('class','tip');
		var transSelectSign = otherOpt.transSelectSign;
		if(type == 'success'){
			var txt = '亲爱的方正同事，您的邮箱('+$('#J_accoutEmail').val()+'@founder.com)已通过认证，内测期间享受免邮特权';
			tipCon.find('.success-tip').text(txt);
			$('#J_isFounder').val('true');
			$('#J_preferentialBtn').css('display','none');
			//
			transSelectSign.founderStaff = true;
		}else if(type == 'err'){
			var txt = data.error+"，认证失败！"
			tipCon.find('.err-tip').text(txt);
			$('#J_isFounder').val('fasle');
			$('#J_preferentialBtn').css('display','');
			transSelectSign.founderStaff = false;
		}
		//show
		tipCon.addClass(type);
		//check transSelect
		otherOpt.setTransSelect();
	},
	preferentialDialog: {
		isInit: false,
		dialogItem: null,
		mainContent: $('#J_preferentialCon'),
		isGetingData: false,
		init: function(){
			var me = this;
			var closeHandler = function() {
	            me.close();
	        };
			var content = me.mainContent;
    		$("body").append(content);
    		var dialog = content.dialog({
    			autoOpen: false,
    			draggable: false,
    			modal: true,
    			resizable: false,
    			width : 400,
    			dialogClass: "dialogStyle dialogBlack dialogPreferential",
    			closeOnEscape: false
    		});
    		me.isInit = true;
    		me.dialogItem = dialog;
			me.init = function(){};
		},
		show: function(){
			var me = this;
			if(!me.isInit){
				me.init();
				me.bindHandler();
			}
			$('#J_accountForm')[0].reset();
			$('#J_accountForm li').removeClass('err');
			me.dialogItem.dialog('open');
		},
		close: function(){
			var me = this;
			me.dialogItem.dialog('close');
		},
		bindHandler: function(){
			var me = this;
			//form
			$('#J_accoutEmail').blur(function(e){
				me.checkAccount($(this));
			});
			$('#J_accoutPassword').blur(function(e){
				me.checkAccount($(this));
			});
			$('#J_accountForm').submit(function(e){
				if(me.checkAccountForm()){
					//send data
					var method = 'POST';
					var url = '/order!validateFounderMailCallBack.htm';
					var param = $(this).serialize();
					var successFun = function(data){
						me.isGetingData = false;
						if(data.error){
							otherOpt.preferentialTips('err', data);
							return;
						}
						otherOpt.preferentialTips('success');
					};
					me.isGetingData = true;
					YS.ajaxData(method,url, param,successFun);
					//
					me.close();
					otherOpt.preferentialTips('loading');
				}
				return false;
			});
			//btns
			me.mainContent.find('.submit').click(function(e){
				e.preventDefault();
				$('#J_accountForm').submit();
			});	
			me.mainContent.find('.cancel').click(function(e){
				e.preventDefault();
				me.close();
			});
		},
		checkAccount: function(item){
			var me = this;
			var value = item.val();
			var parent = item.parents('li');
			if(value.length == 0){
				utils.addItemErrorTip(parent, item, '该项为必填项');
				return false;
			}
			// if(item.attr('id') == 'J_accoutEmail'){
			// 	if(!value.match('@founder.com') && !value.match('@founder.com.cn')){
			// 		utils.addItemErrorTip(parent, item, '请填写格式正确的邮箱');
			// 		return false;
			// 	}
			// }
			utils.removeItemErrorTip(parent, item);
			return true;
		},
		checkAccountForm: function(){
			var me = this;
			var sign = true;
			var tempSign = null;
			var checkArr = ['J_accoutEmail','J_accoutPassword'];
			for(var i=0, len=checkArr.length; i<len; i++){
				var item = $('#'+checkArr[i]);
				tempSign = me.checkAccount(item);
				if(sign){
					sign = tempSign;
				}
			}
			return sign;
		}
	}
};



//init
bookList.init();
address.init();
otherOpt.init();
})();