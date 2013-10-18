(function(){

YS.sreenLoading = {
	isInit: false,
	dialogItem: null,
	textItem: null,
	html: '<div class="dialogScreenLoading"><div class="loadingImg"></div><p class="loadingText"></p></div>',
	init: function(){
		var me = this;
		var content = $(me.html);
		$("body").append(content);
		var dialog = content.dialog({
			autoOpen: false,
			draggable: false,
			modal: true,
			resizable: false,
			dialogClass: "dialogStyle dialogScreenLoading",
			closeOnEscape: false,
			position: { my: "center", at: "center", of: $('.wrapper') },
			width: 240
		});
		me.isInit = true;
		me.dialogItem = dialog;
		me.textItem = content.find('.loadingText');
		me.init = function(){};		//置空init function
	},
	show: function(text){
		var me = this;
		me.init();
		me.textItem.text(text);
		me.dialogItem.dialog('open');
	},
	close: function(){
		var me = this;
		if(!me.isInit){
			return;
		}
		me.dialogItem.dialog('close');
	}
};



var selectUI = {
	curType: 'weibo',
	init: function(){
		var me = this;
		// me.initPostion();
		me.bundleHandler();
		me.checkType();
		me.weiboInit();
		me.selfInit();
		YS.sreenLoading.init();
	},
	initPostion: function(){
		var mainHeight = 615;
		var headerHeight = 70;
		var winHeight = $(window).innerHeight();
		if(winHeight>mainHeight){
			var t = Math.floor((winHeight - mainHeight)/2);
			t>headerHeight ? t -= headerHeight : t = 0;
			$('#J_content').css('top',t);
		}
	},
	checkType: function(){
		var type = YS.hash();
		if(type == 'self'){
			$('#J_typeList .self').click();
		}else{
			$('#J_typeList .weibo').click();
		}
	},
	stepNumAnimate: function(){
		$('.step-bd').css({display: 'none'});
		//
		var me = this;
		var stepArr = $('#J_stepNum').find('.'+me.curType+'-step');
		var arr = $('#J_stepNum').find('.step');
		var colorArr = ['#7DA409','#EB6333'];
		var curColorIndex = me.curType == 'weibo' ? 0 : 1;
		var bdAnimate = false;
		var endHandler = function(clone,target){
			target.css('background-color','transparent');
			if(bdAnimate){
				me.stepBdAnimate();
				bdAnimate = false;	
			}
		}
		for(var i=0, len=stepArr.length; i<len; i++){
			var itemNum = $(arr[i]);
			i == 0 ? bdAnimate = true : -1;
			itemNum.flip({
                direction: 'bt',
                color: colorArr[curColorIndex],
                speed: 200,
                onEnd: endHandler
            });
		}
	},
	stepBdAnimate: function(){
		$('.step-bd').css({width: 0, display: 'block'});
		$('.step-bd').animate({
			width: 600
		},200);
	},
	bundleHandler: function(){
		var me = this;
		var typeList = $('#J_typeList');
		var stepList = $('#J_stepList');
		//weibo
		var weiboBtn = typeList.find('.weibo');
		weiboBtn.click(function(ev){
			if($(this).hasClass('selected')){
				return;
			}
			typeList.find('li').removeClass('selected');
			$(this).addClass('selected');
			stepList.removeClass('step-self').addClass('step-weibo');
			YS.hash('weibo');
			me.curType = 'weibo';
			//anim
			me.stepNumAnimate();
			
		});
		//self
		var selfBtn = typeList.find('.self');
		selfBtn.click(function(ev){
			if($(this).hasClass('selected')){
				return;
			}
			typeList.find('li').removeClass('selected');
			$(this).addClass('selected');
			stepList.removeClass('step-weibo').addClass('step-self');
			YS.hash('self');
			me.curType = 'self';
			//anim
			me.stepNumAnimate();
			// me.stepBdAnimate();
		});
		//step
		var stepNum = $('#J_stepNum');
		stepNum.find('.step').click(function(ev){
			var item = $(this).find('.'+me.curType+'-step');
			if($(item).hasClass('selected')){
				return;
			}
			var cls = $(this).attr('class');
			var index = parseInt(cls.replace(/step/g,''));
			var curTypeBd, curBtnArr;
			//type
			if(me.curType == 'weibo'){
				curTypeBd = $('#J_weiboBd');
				curBtnArr = stepNum.find('.weibo-step');
			}else if(me.curType == 'self'){
				curTypeBd = $('#J_selfBd');
				curBtnArr = stepNum.find('.self-step');
			}
			var stepBtnArr = stepList.find('.step');
			var len = curBtnArr.length;
			//
			if(index<len){
				curBtnArr.removeClass('selected');
				$(this).find('.'+me.curType+'-step').addClass('selected');
				//animate
				var lastTime = 200;
				var lastBd = curTypeBd.find('.step-info').filter('.selected');
				lastBd.addClass('moving');
				lastBd.animate({
					width: 0
				},lastTime,function(){
					lastBd.removeClass('selected').removeClass('moving');
				});
				//curTypeBd.find('.step-info').removeClass('selected');
				var curBd = curTypeBd.find('.step'+index);
				curBd.css({
					width: 0
				});
				curBd.addClass('selected').addClass('moving');
				curBd.animate({
					width: 600
				},lastTime,function(){
					curBd.removeClass('moving');
				});
				//curTypeBd.find('.step'+index).addClass('selected');
			}else if(index == len){//preview
				//submit
				var form = $('#J_'+me.curType+'Form');
				form.submit();
			}
		});
	},
	selecteNum: function(index){
		var stepNum = $('#J_stepNum');
		stepNum.find('.step').eq(index-1).click();
	},
	updateSelectTxt: function(index,txt){
		var me = this;
		var stepNum = $('#J_stepNum');
		var curBtnArr;
		if(me.curType == 'weibo'){
			curBtnArr = stepNum.find('.weibo-step')
		}else if(me.curType == 'self'){
			curBtnArr = stepNum.find('.self-step')
		}
		var item = $(curBtnArr[index-1]);
		txt = txt.length>9 ? txt.substr(0,9)+'..' : txt;
		item.find('.select-txt').text(txt);
	},
	getErrorTip: function(txt){
		var str = '<div class="tip err-tip">'+ txt +'</div>';
		return str;
	},
	checkNameLength: function(id, len, errTip){
		var name = $(id);
		var text = name.val();
		var parent = name.parent();
		if(text.length>len || text.length == 0){
			parent.addClass('err');
			if(parent.has('.err-tip').length==0){
				// var tip = this.getErrorTip('书名不能为空或超过15个字');
				var tip = this.getErrorTip(errTip);
				parent.append(tip);
			}
			return false;
		}else{
			parent.removeClass('err');
			return true;
		}
	},
	//weibo
	weiboInit: function(){
		var me = this;
		me.weiboHandler();
	},
	weiboHandler: function(){
		var me = this;
		//step1
		$('#J_weiboBd .myself').click(function(ev){
			$('#J_weiboBd .step1 li').removeClass('selected');
			$(this).addClass('selected');
			var txt = $(this).find('span').text();
			me.updateSelectTxt(1,txt);
			me.weiboBookName(txt);
			var dataName = $(this).attr('data-id');
			$('#J_weiboUser').val(dataName);
		});
		$('#J_weiboBd .myfriend').click(function(ev){
			me.myFriendDialog.show();
		});		
		var monthpickerConf = {
			dateFormat: "yy-mm",
			monthNamesShort: ['1月', '2月','3月', '4月','5月', '6月','7月', '8月','9月', '10月','11月', '12月'],
			onSelect : function(value,target){
				var valToID = $('#'+target.id).attr('valto');
				$('#'+valToID).val(value);
				//
				var sTxt = $('#J_sDateValue').val().replace('-','.');
				var eTxt = $('#J_eDateValue').val().replace('-','.');
				var txt = sTxt + '-' + eTxt;
				if(me.curType=='weibo'){
					me.updateSelectTxt(3,txt);	
				}
			}
		};
		//startDate
		var startDate = $("#J_startDate");
		startDate.monthpicker(monthpickerConf);
		var startYear = startDate.attr('year');
		var startMonth = startDate.attr('month') -1;
		$.monthpicker._selectMonth('#J_startDate',startYear,startMonth);
		//endDate
		var endDate = $("#J_endDate");
		endDate.monthpicker(monthpickerConf);
		var endYear = endDate.attr('year');
		var endMonth = endDate.attr('month');
		if(endYear && endMonth){
			endMonth -= 1;
		}else{
			var nowDate = new Date();
			endYear = nowDate.getFullYear();
			endMonth = nowDate.getMonth();	
		}
		$.monthpicker._selectMonth('#J_endDate', endYear, endMonth);

		//step4
		$('#J_bookName').blur(function(ev){
			var txt = $(this).val();
			txt = txt.length>9 ? txt.substr(0,9)+'..' : txt;
			me.updateSelectTxt(4,txt);
			me.checkWeiboBookName();
		});
		//step5
		$('#J_weiboForm').submit(function(){
			//check
			//step3
			if(!me.checkWeiboTimeRange()){
				me.selecteNum(3);
				return false;
			}
			//step4
			if(!me.checkWeiboBookName()){
				me.selecteNum(4);
				return false;
			}
			//add loading
			YS.sreenLoading.show('正在努力排版中...');

		});
	},
	checkWeiboTimeRange: function(){
		var me = this;
		var start = $('#J_sDateValue').val();
		var end = $('#J_eDateValue').val();
		var startArr = start.split('-');
		var endArr = end.split('-');
		var sign = true;
		//year|month
		var startYear = Number(startArr[0]);
		var endYear = Number(endArr[0]);
		var startMonth = Number(startArr[1]);
		var endMonth = Number(endArr[1]);
		if(startYear>endYear){
			sign = false;
		}
		if(startYear == endYear && startMonth>endMonth){
			sign = false;
		}
		//show error
		var parent = $('#J_startDate').parents('li');
		if(sign){
			parent.removeClass('err');
		}else{
			parent.addClass('err');
			if(parent.has('.err-tip').length==0){
				var tip = this.getErrorTip('开始时间不能大于结束时间');
				parent.append(tip);
			}
		}
		//
		return sign;
	},
	checkWeiboBookName: function(){
		var me = this;
		return me.checkNameLength('#J_bookName', 15, '书名不能为空或超过15个字');
	},
	myFriendAuthor: function(item){
		var me = this;
		var myfriend = $('#J_weiboBd .myfriend');
		var str = item.html();
		var dataName = item.attr('data-id');
			
		myfriend.html(str);
		myfriend.attr('data-id',dataName);
		//myfriend.attr('data-id',dataId);
		//
		$('#J_weiboBd .step1 li').removeClass('selected');
		myfriend.addClass('selected');
		//
		var txt = myfriend.find('span').text();
		me.updateSelectTxt(1,txt);
		$('#J_weiboUser').val(dataName);
		me.weiboBookName(txt);
	},
	weiboBookName: function(nickName){
		var me = this;
		var str = nickName + '的微博书';
		$('#J_bookName').val(str);
		me.updateSelectTxt(4,str);
	},
	myFriendDialog: {
		isInit: false,
		dialogItem: null,
		isPlaying: false,
		curTab: 'myfollow',
		dataMethod: {
			myfollow: 'initPage!getUserFriendships.htm',
			eachfollow: 'initPage!getBilateralUsers.htm',
			myfans: 'initPage!getfollowersUsers.htm'
		},
		maxPage: {
			myfollow: null,
			eachfollow: null,
			myfans: null
		},
		nextIndex: {
			myfollow: 0,
			eachfollow: 0,
			myfans: 0	
		},
		html: '<div>aaaaa</div>',
		init: function(){
			var me = this;
			var closeHandler = function() {
	            me.close();
	        };
			// var content = $(me.html);
			var content = $('.myfriend-list');
    		$("body").append(content);
    		var dialog = content.dialog({
    			autoOpen: false,
    			draggable: false,
    			modal: true,
    			resizable: false,
				show: {
					effect: "slide",
					direction:"up",
					duration: 200
				},
    			width: 990,
				height:530,
				position: ['top',70],
    			dialogClass: "dialogStyle dialogMyFriend",
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
				me.initData();
				me.bindHandler();			
			}	
				me.getCookie();
			me.dialogItem.dialog('open');
		},
		close: function(){
			var me = this;
			me.dialogItem.dialog('close');
		},
		bindHandler:function(){
			var me = this;
			var tabHd = $('#J_myFriendTab');
			var tabBd = $('#J_myFriendBd');
			var checkbtn=$('#J_checkbtn');
			var getImg=$('#J_getImg');
			var recentChoose=$('.recentChoose');			
			
			tabHd.click(function(ev){
				var target = $(ev.target);
				if(target.is('li')){
					if(target.hasClass('selected')){
						return;
					}
					var cls = target.attr('class');
					me.curTab = cls;
					cls = '.'+ cls + '-bd';
					//
					tabHd.find('li').removeClass('selected');
					target.addClass('selected');
					tabBd.find('.item-bd').removeClass('selected');
					$(cls).addClass('selected');
				}
			});
			tabBd.find('.prev').click(function(ev){
				//debugger;
				var list = $(this).parent().next();
				var userList = list.find('.user-list');
				var mleft = userList.css('margin-left');
				mleft = YS.pixelToInt(mleft);
				if(mleft == 0){
					return;
				}
				mleft = mleft + 850;
				userList.css('margin-left', mleft+'px');
				// userList.animate({marginLeft:mleft},300);
			});
			tabBd.find('.next').click(function(ev){
				if(me.isPlaying){
					return;
				}
				var list = $(this).parent().next();
				var userList = list.find('.user-list');
				var sw = userList.css('width');
				sw = YS.pixelToInt(sw);
				var mleft = userList.css('margin-left');
				mleft = YS.pixelToInt(mleft);
				mleft = mleft - 850;
				if(mleft <= (-sw)){					
					return;
				}
				userList.css('margin-left', mleft+'px');
				//get next data
				var bdCls = '.'+me.curTab+'-bd';
				var page = $(bdCls).find('.user-list ul').length+1;
				if(me.maxPage[me.curTab] == 0){
					me.getData(me.curTab,page)
				}
			});
			//data
			tabBd.delegate('.user-list li','click', function(ev){
				var agree = $('#J_agree');
				if(!agree.is(':checked')){
					return;
				}
				//get id
				selectUI.myFriendAuthor($(this));
				me.setCookies($(this));	
				me.close();
			});		
			//enter搜索	
			
			$('#J_search').keydown(function(event){
				  if(event.keyCode ==13){
					  checkbtn.click();		
					  event.preventDefault();//fix ie8 bug			
				  }			
				});		
			//点击搜索			
			checkbtn.click(function(ev){					
			  var textStr=$('.search input:first').val();
			  var J_getImg=$('.search div');
				if(textStr==""){
					 $('.emptyInfo').css('display','block');
					 return;
				 }
				if(!textStr==""){
					  me.checkData(textStr);
				}
				 tabHd.find('li').removeClass('selected');  
				 tabBd.find('.item-bd').removeClass('selected');
				 tabBd.find('.search-bd').addClass('selected');
				 $('.emptyInfo').css('display','none');
				});	
				me.bindHandler = function(){};
		},
		
		initData: function(){
			var me = this;
			for(var item in me.dataMethod){
				me.getData(item,1,true);
			}
		},
		checkData:function(name){
			var me = this;
			var method = 'POST';
			var url = '/user!getSearchUsers.htm';	
			var param={reqnum:5,q:name};
			var successFun = function(data){
				if(data.searchUsers.length>0){
					me.renderImg(data);
					$('.loading-search').remove();
				}
				if(data.searchUsers==""){
					$('.loading-search').remove();
					//YS.staticDomainbyJs+'/img/sdsfs'
					//$('#J_getImg').find('#J_img').css('display','block');		
                    $('#J_getImg').html('<img  src="'+YS.staticDomainbyJs+'/img/sorry.jpg" id="J_img" width="82" height="35"><span class="span-center">抱歉！未搜索到您要的好友信息，非认证用户或粉丝数太少的用户可能搜索不到。</span>');
                    $('.Init-info').css("display","none")		
				}
			}
			YS.ajaxData(method,url,param,successFun);
		},
	   	 getData: function(item,page,getNext){
			var me = this;
			me.isPlaying = true;
			var method = 'GET';
			var url = '/'+me.dataMethod[item];
			var param = {currPage: page, nextIndex: me.nextIndex[item]};
			var successFun = function(data){
				me.isPlaying = false;
				if(data.followersUsers.length == 0){
					me.maxPage[item] = 1;
					return;
				}
				me.maxPage[item] = data.followersUsers[0].hasnext;
				me.nextIndex[item] = data.followersUsers[0].nextIndex;
				me.renderHtml(item,data);
				if(me.maxPage[item] == 0 && getNext){
					me.getData(item, page+1, false);
				}
			};
			YS.ajaxData(method,url,param,successFun)
		},
		 //搜索渲染
		renderImg:function(data){
			//debugger;
			var getImg=$('#J_getImg');
			var str = '<ul>';
			var k=0; 
			var len=data.searchUsers.length;
			if(len>=5){
				k=5;
				}else{
					 k=len;
					}
			for(var i=0; i<k; i++){
				var user = data.searchUsers[i];
				str += '<li data-id='+user.screen_name+'>'+
  					   '<div class="list_img">'+
					   '<img src="'+user.profile_image_url+'" width="120px" height="120px" title="'+user.screen_name+'" />'+
					   '<span>'+user.screen_name+'</span>'+
					   '</div>'+
					   '<div class="info"><ul>'+
					   '<li>'+user.location+'</li>'+
					   '<li>关注：'+user.friends_count+'</li>'+
					   '<li>粉丝：'+user.followers_count+'</li>'+
					   '<li>微博：'+user.statuses_count+'</li>'+
					   '</ul></div></li>';
				}
			str +='</ul>';	
			getImg.attr('data-id',user.id);
			getImg.html(str);
			$('.Init-info').css('display','block');	
				
		},
		//通用渲染
		renderHtml: function(item,data){
			data = data.followersUsers;
			if(!data || data.length==0){
				return;
			}
			var list = $('.'+item+'-bd').find('.user-list');
			var str = '<ul>';
			
			for(var i=0, len=data.length; i<len; i++){
				var user = data[i];
				// var img = user.imagePath ? user.imagePath : YS.staticDomainbyJs+'/img/default_avatar.jpg';
				var img = user.imagePath ? user.imagePath : user.imagePath;
				str += '<li data-id="'+user.name+'"><div class="list_img">'+
						'<img src="'+img+'" title="'+user.nickName+'" />'+
						'<span>'+user.nickName+'</span>'+
						'</div></li>';				
			}
			str += '</ul>';
			list.append(str);
			var sw = list.find('ul').length*850;
			list.css('width',sw);	
			
		},
		//保存到cookie
		setCookies:function(item){
			var me = this;
			var listImg = $('.list_img');
			var userId=$('#J_weiboBd .myself').attr('data-id');
			var dataid=item.attr('data-id');
			var txt=item.find('span').text();
			var img=item.find('img').attr('src');
			
			var oldstr=$.cookie('strHtml');
			var newstr=dataid+'|'+txt+'|'+img+';';
			//debugger;
			if(oldstr==""||oldstr==null){
				var str=newstr;
			}else{	
				  if(oldstr.match(newstr)){
					  return;
				  }
				  else{
					 var str=newstr+oldstr;
				  }
			}
			$.cookie('strHtml',userId+'|'+str);
		},
		//显示cookie
		getCookie:function(){
			var userId=$('#J_weiboBd .myself').attr('data-id');
			var getCookie=	$.cookie('strHtml');
			if(getCookie==""||!getCookie){
				return
				}
			var strhtml=getCookie.split(';');
			var list=$('.recentChoose-bd').find('.user-list ul');
			var str="";
				for(var i=0;i<strhtml.length-1; i++){
					var string=strhtml[i].split('|');		
					 str +='<li data-id="'+string[1]+'"><div class="list_img">'+
						'<img src="'+string[3]+'" title="'+string[2]+'" />'+
						'<span>'+string[2]+'</span>'+
						'</div></li>';
				}
			if(!getCookie.match(userId)){
				str="";
				$.cookie('strHtml','');
			}	
				list.html(str);
		}
	},


	//selfBook
	slefFileUpload: false,
	selfInit: function(){
		var me = this;
		me.selfHandler();
	},
	selfHandler: function(){
		var me = this;
		//step1|step2
		$('#J_selfForm .select-type li').click(function(e){
			if($(this).hasClass('selected')){
				return;
			}
			var cls = $(this).attr('class').match(/type\-\w*/)[0];
			cls = cls.replace('type-','');
			var parent = $(this).parent();
			parent.find('li').removeClass('selected');
			$(this).addClass('selected');
			//data
			var txt = $(this).find('h4').text();
			me.updateSelectTxt(1,txt);
			var data = parent.parent().find('.input-data input');
			data.val(cls)
		});
		//step3
		$('#J_selfBookName').blur(function(ev){
			var txt = $(this).val();
			txt = txt.length>9 ? txt.substr(0,9)+'..' : txt;
			me.updateSelectTxt(3,txt);
			me.checkSelfBookName();
		});
		//step4
		$('#J_selfForm').submit(function(){
			// console.log($(this).serialize());
			//check
			if(!me.checkSelfBookName()){
				me.selecteNum(3);
				return false;
			}
		});
	},
	checkSelfBookName: function(){
		var me = this;
		return me.checkNameLength('#J_selfBookName', 15, '画册命名不能为空或超过15个字');
	}
};

//init
selectUI.init();

})();