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
    			position: { my: "center", at: "center", of: $('.pages-wrapper') },
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
var imgDialog = {
	html: '<div class="dialogImgContent"><img src="" alt="" /></div>',
	isInit: false,
	isShowing: false,
	dialogItem: null,
	imgItem: null,
	imgSrc: '',
	initDialog: function(url){
		var me = this;
		var content = $(me.html);		
		$("body").append(content);
		var closeHandler = function() {
            me.close();
        };
		var dialog = content.dialog({
            autoOpen: false,
            modal: true,
            resizable: false,
            closeOnEscape: false,
            dialogClass: "dialogStyle dialogImg",
            width: "auto",
            height: "auto",
            close: function() {
                me.isShowing = false;
                $(".ui-widget-overlay").unbind("click", closeHandler);
            },
            open: function() {
                $(".ui-widget-overlay").bind("click", closeHandler);
            }
        });
        me.dialogItem = dialog;
        me.imgItem = content.find('img');
        me.isInit = true;
        me.initDialog = function(){};	//将init置空
	},
	show: function(url, alt){
		var me = this;
		if (url == undefined || url == "") {
            return false;
        }
		me.initDialog();
		var img = me.imgItem[0];
		if(me.dialogItem){
			if(me.imgSrc == url){
				me.dialogItem.dialog('open');
				me.isShowing = true;
			}else{
				img.onload = function(){
					me.dialogItem.dialog('open');
					me.isShowing = true;
				}
				img.src = url;
				me.imgSrc = url;
			}
			if(alt){
				img.alt = alt;
			}
		}else{
			console.log('dialog生成出错');
		}
	},
	close: function(){
		var me = this;
		if(!me.isInit){
			return;
		}
		me.dialogItem.dialog('close');
	}
};
//
var book = {
	//utils
	mainHost: '/',
	methodName: {
        get: "toPage.htm",			//获取页面数据
        del: "deleteStatus.htm" 	//删除某条微博
        // SetHeight: "SetHeight",		//拉伸
        // Undo: "Undo",				//撤销
    },
	//init vars
	pageDatas: [],
	imgDefaultSize: 215,
	mainContent: $('.pages-wrapper'),
	min: -3,
	max: null,
    maxFirst: 0,
	curPage: 1,
	totalNum: null,
	isTurning: false,
    turningId: null,
    turningDelay: 1000,
    dateObj: {bookId: bookId},
    dateType: ['first','title','second','content','copyright','end'],
    customTip: 'customTip',
    curUserID: '',
	//init
	bookInit: function(){
		var me = this;
		YS.sreenLoading.show('正在读取数据...');
		var initPage = YS.hash();
        var arr = initPage.split('!');
        var index = 0;
        if(arr.length>1){
            var type = arr[0];
            me.dateObj.type = arr[0];
            me.dateObj.index = arr[1];
            if(type == 'content'){
                me.dateObj.year = arr[1];
                me.dateObj.month = arr[2];
                me.dateObj.index = arr[3];
                if(arr[4]){
                    // me.dateObj.twoMonthFlag = arr[4];
                }
            }
            index = me.dateObj.index;
        }else if(initPage.length==0){
			me.dateObj.type = 'first';
		}
        me.customEditTipInit();
        me.turnPage(index);
		me.bookHandle();
		me.pageHandle();
	},
	bookHandle: function(){
		var me = this;
		$('.prev').click(function(e){
			me.prev();
			return false;
		});
		$('.next').click(function(e){
			me.next();
			return false;
		});
    	$('.prev').mouseenter(function(ev){
    		$(this).css('display','block');
    	});
    	$('.next').mouseenter(function(ev){
    		$(this).css('display','block');
    	});
		$('.pages-odd').mouseenter(function(ev){
			$('.fliper').find('.prev').css('display','block');
		});
		$('.pages-odd').mouseleave(function(ev){
			$('.fliper').find('.prev').css('display','none');
		});
		$('.pages-even').mouseenter(function(ev){
			$('.fliper').find('.next').css('display','block');
		});
		$('.pages-even').mouseleave(function(ev){
			$('.fliper').find('.next').css('display','none');
		});
		$('.pages-wrapper').mouseleave(function(ev){
			$('.fliper').find('.prev').css('display','none');
			$('.fliper').find('.next').css('display','none');
		});
		//放入书架
		$('#J_putMyBookShelf').click(function(ev){
			if(!menuBar.isDataOk){
				return false
			}
		});
        //custom-edit
        $('#J_customEdit').click(function(e){
            $(this).find('.tip').hide();
            YS.setTipCookie(me.customTip, me.curUserID);
        });
	},
    customEditTipInit: function(){
        var me = this;
        var method = 'GET';
        var url = '/getUserInfo.htm';
        var param = {};
        var successFun = function(data){
            me.curUserID = data.id;
            var sign = YS.getTipCookie(me.customTip, me.curUserID);
            if(!sign){
                var tip = $('#J_customEdit .tip');
                tip.show();
                me.customEditTip();
            }
        };
        YS.ajaxData(method, url, param, successFun);
    },
    customEditTip: function(){
        var me = this;
        var lastTime = 200;
        var tip = $('#J_customEdit .tip');
        if(!tip.is(":visible")){
            tip.stop();
            return;
        }
        tip.animate({right: -83}, lastTime)
        .animate({right:-78}, lastTime, function(){
            me.customEditTip();
        });
    },
	maxTran: function(p) {
		var me = this;
		p = parseInt(p);
        // $("#pageNum").text(p + "页");
        p = p & 1 ? p : p - 1;
        me.max = p + 2;
    },
	checkPageBtn: function(){
		var me = this;
		var prevBtn = $('.prev'),
			nextBtn = $('.next'),
			pageWrapper = me.mainContent;
		prevBtn.removeClass('disabled');
		nextBtn.removeClass('disabled');
		var color = pageWrapper.find('.pages').attr('class');
		color = color.match(/color\d/);
        color = color ? color : initColor;
        var type = me.dateObj.type;
		if(type == 'first'){
			pageWrapper.attr('class','pages-wrapper page0-rightcover');
			pageWrapper.find('.pages').eq(0).attr('class','pages none '+color);
			pageWrapper.find('.pages').eq(1).attr('class','pages pages-even frontCover '+color);
			prevBtn.addClass('disabled');
		}else{
			if(type == 'end'){
				pageWrapper.attr('class','pages-wrapper page0-leftcover');
				pageWrapper.find('.pages').eq(0).attr('class','pages pages-odd backCover '+color);
				pageWrapper.find('.pages').eq(1).attr('class','pages none '+color);
				nextBtn.addClass('disabled');
			}else{
				pageWrapper.removeClass('page0-rightcover').removeClass('page0-leftcover');
				pageWrapper.find('.pages').removeClass('none').removeClass('frontCover').removeClass('backCover');
				pageWrapper.find('.pages').eq(0).addClass('pages-odd');
				pageWrapper.find('.pages').eq(1).addClass('pages-even');
			}
		}
	},
	pageHandle: function(){//bind event
		var me = this;
		//del
		me.mainContent.delegate('.del','click', function(e){

			var i = this.getAttribute("data");
            var g = me.curPage;
            var pageIndex = parseInt($(this).parents(".pages").find('.pn').attr('data-index'));
	        me.deleteItem({
	            id: i,
                bookId: bookId,
                year: me.dateObj.year,
                month: me.dateObj.month,
                index: pageIndex,
				leftIndex:me.dateObj.index,
                twoMonthFlag: me.dateObj.twoMonthFlag && me.dateObj.twoMonthFlag
	        });
		});
		//img
		me.mainContent.delegate('.img img', 'click', function(e){
			imgDialog.show(this.src, this.alt);
		});
	},
	prev: function(){
		var me = this;
        var type = me.dateObj.type;
        var prevType = type;
        var index = me.dateObj.index;
        if(type == 'content' || type == 'title'){
            index -= 2;
        }else{
            index = 0;
            prevType = me.getDateType('prev',type);
            //title
            if(prevType == 'title'){
                index = me.maxFirst-2;
            }
        }
		if(index<0){
            var sign = menuBar.checkCatalogLimit('first',me.dateObj);
            if(!(type == 'content' && !sign)){
                index = 0;
                prevType = me.getDateType('prev',type);
            }
        }
        if(prevType != 'content'){
            delete me.dateObj.year;
            delete me.dateObj.month;
        }
        if(type == 'copyright' && prevType == 'content'){
            var obj = menuBar.getCatalogLimit('last');
            if(obj.year){
                me.dateObj.year = obj.year;
                me.dateObj.month = obj.month;
                index = 'lastMonth'; //特殊处理    
            }else{
                prevType = me.getDateType('prev',prevType);
            }
            
        }
        me.dateObj.type = prevType;
		me.turnPage(index);
	},
	next: function(){
		var me = this;
        var type = me.dateObj.type;
        var nextType = type;
        var index = me.dateObj.index;
        if(type == 'content' || type == 'title'){
            index += 2;
        }else{
            index = 0;
            nextType = me.getDateType('next',type);
        }
        //title
        if(type == 'title' && index>=me.maxFirst){
            index = 0;
            nextType = me.getDateType('next',type);
        }
        if(nextType != 'content'){
            delete me.dateObj.year;
            delete me.dateObj.month;
        }
        me.dateObj.type = nextType;
        me.turnPage(index);
	},
	turnPage: function(index){
		var me = this;
		if(me.isTurning){
			return;
		}
        var screenload = YS.sreenLoading;
		var url = me.mainHost+me.methodName.get;
        var param = {}, item;
        for(item in me.dateObj){
            param[item] = me.dateObj[item];
        };
        param.index = index;
		var successFun = function(data){
            //clean
            clearTimeout(me.turningId);
            screenload.close();
            me.isTurning = false;
			if(!data){
				alert('数据出错');
				return;
			}
			me.updatePageData(data);
			me.maxTran(data.totalPage);
			me.showPage(data);
			me.checkPageBtn();
            //hashurl
            var type = me.dateObj.type;
            var hashURL = '';
            if(type == 'content'){
                hashURL = type+'!'+me.dateObj.year+'!'+me.dateObj.month+'!'+me.dateObj.index;
                if(me.dateObj.twoMonthFlag){
                    hashURL += '!'+me.dateObj.twoMonthFlag;
                }
            }else{
                hashURL = type+'!'+me.dateObj.index;
            }
            YS.hash(hashURL);
		}
		me.isTurning = true;
        me.turningId = setTimeout(function(){
            screenload.show('正在读取数据...');    
        },me.turningDelay);
		YS.ajaxPost(url,param,successFun);
	},
	updatePageData: function(data){
		var me = this;
		me.curPage = parseInt(data.leftPage);
		// me.max = data.totalPage;
		//cache
		me.pageDatas[me.curPage]  = {
			leftContent1: data.leftContent1,
			leftContent2: data.leftContent2
		};
		me.pageDatas[me.curPage+1]  = {
			rightContent1: data.rightContent1,
			rightContent2: data.rightContent2
		};
        //dateObj
        me.dateObj.type = data.type;
        me.dateObj.index = parseInt(data.leftIndex);
        if(data.type == 'content'){
            me.dateObj.year = data.year;
            me.dateObj.month = data.month;
        }
		me.dateObj.twoMonthFlag = data.twoMonthFlag ? data.twoMonthFlag : '';
	},
	cutPageData: function(data){
		var me = this;
		me.curPage = data.leftPage;
		var len = (me.curPage && me.curPage>0) ? me.curPage : 0;
		me.pageDatas.length = len;
	},
	//showPage
	showPage: function(data){
		var me = this;
		//left
		var leftPage = $('#J_pageLeft');
		var page = data.leftContent;
		var pageNo = data.leftPage;
        pageNo = me.getPageNo(data.leftPage,data.leftIndex);
		page = page + pageNo;
		leftPage.html(page);
		//right
		var rightPage = $('#J_pageRight');
		var page = data.rightContent;
		pageNo = data.rightPage;
        pageNo = me.getPageNo(data.rightPage,data.rightIndex);
		page = page + pageNo;
		rightPage.html(page);
	},
	getPageNo: function(num,index){
        if(!Number(num)){
            num = '';
        }
		var str = '<div class="pn" data-index="'+index+'"><span>'+num+'</span></div>';
		return str;
	},
	imgShow: function(el, p){
		var me = this;
		var sw = el.clientWidth, 
			sh = el.clientHeight,
			curEl = $(el);
        var d = YS.pixelToInt(p.css("maxHeight"));
        if (sw < sh) {
            if (sh > sw + 10) {
                p.addClass("hasExpand");
                p.addClass("cutItem")
            }
        } else {
            curEl.css({
                width: "auto",
                maxWidth: me.imgDefaultSize,
                maxHeight: sw
            })
        }
	},
	deleteItem: function(param){
		var me = this;
		var url = me.mainHost+me.methodName.del;
		var successFun = function(data){
			me.cutPageData(data);
			me.updatePageData(data);
			//updat page
			me.showPage(data);
			me.isTurning = false;
			screenload.close();
			menuBar.refresh(data.catalog);
		};
		var errorFun = function(msg){
			// console.log('del error=='+msg);
		}
		var screenload = YS.sreenLoading;
		me.isTurning = true;
		screenload.show('正在努力排版中...');
		YS.ajaxPost(url,param,successFun, errorFun);
	},
    getDateType: function(direction,type){
        var me = this;
        var dirIndex, item;
        for(var i=0, l= me.dateType.length; i<l; i++){
            item = me.dateType[i];
            if(item == type){
                break;
            }
        }
        if(direction == 'prev'){
            dirIndex = i-1;
            if(me.dateType[dirIndex] == 'title' && me.maxFirst == 0){
                dirIndex -= 1;
            }
        }else{
            dirIndex = i+1;
            if(me.dateType[dirIndex] == 'title' && me.maxFirst == 0){
                dirIndex += 1;
            }
        }
        return me.dateType[dirIndex];
    }
};
var menuBar = {
	triggerBtn: $('#J_catalog'),
	mainContent: $(".catbar"),
	mainList: $(".year-list"),
    catalogData: {},
	currentDt: null,
	currentMonth: null,
	isShowed: false,
	isInit: false,
	isDataOk: false,
	intervalID: -1,
	intervalTime: 3000,
	init: function(data){
		var me = this;
		me.isInit = true;
		me.getData();
		me.bindHandler();
		me.init = function(){};
	},
	getData: function(){
		var me = this;
		var url = "/catalogInfo.htm";
		var param = {bookId: bookId};
		var successFun = function(data){
			var me = menuBar;
			if(data){
				clearInterval(me.intervalID);
				me.isDataOk = true;
				me.refresh(data);	//init data
			}
			// me.triggerBtnDisable();
		};
		var errorFun = function(data){
			var me = menuBar;
			me.isDataOk = false;
			clearInterval(me.intervalID);
			//me.intervalID = setInterval(me.getData, me.intervalTime);
			// me.triggerBtnDisable();
		};
		YS.ajaxPost(url, param, successFun, errorFun);
	},
	bindHandler: function(){
		var me = this;
		$(".catbar-list").delegate('a', "click", function(ev) {
			var item = $(this);
			if(me.currentMonth && me.currentMonth == item){
				return false;
			}
            var dataType = item.attr('data-type');
            var index = parseInt(item.attr('p'));
            book.dateObj.type = dataType;
            if(dataType == 'content'){
                book.dateObj.year = item.attr('y');
                book.dateObj.month = item.attr('m');    
            }else{
                delete book.dateObj.year;
                delete book.dateObj.month;
            }
			//book.turnPage(index);
			book.turnPage(-99);
			me.currentMonth.removeClass('on');
			item.addClass('on');
			me.currentMonth = item;
			me.close();
			return false;
        });
        me.mainContent.find(".year-prev").click(function() {
            me.move(true);
            return false;
        });
        me.mainContent.find(".year-next").click(function() {
            me.move();
            return false;
        });
        me.triggerBtn.click(function() {
            if (me.isShowed) {
                me.close();
            } else {
                me.show();
            }
            return false;
        });
        $('body').click(function(ev) {
        	var curTarget = me.mainContent.find(ev.target);
        	var catalogID = curTarget.parent().attr('id');
        	if(curTarget.length == 0 && me.isShowed){
        		me.close();
        	}
            if(catalogID && catalogID != 'J_catalog'){
                me.close();
            }
        });
	},
	triggerBtnDisable: function(){
		var me = this;
        me.isDataOk = true;
		if(me.isDataOk){
			me.triggerBtn.removeClass('disabled');
            var txt = me.triggerBtn.text();
			me.triggerBtn.attr('title',txt);
		}else{
			me.triggerBtn.addClass('disabled');
			me.triggerBtn.attr('title','玩命排版中，目录稍后即可使用');
		}
	},
	move: function(isPrev){
		var me = this;
		var dt = me.currentDt;
		var yearItem = isPrev ? dt.prev('dd').prev('dt') : dt.next('dd').next('dt');
		if(yearItem.length>0){
			me.selectYear(yearItem);
		}
	},
	selectYear: function(item){
		var me = this;
		var curDt = me.currentDt;
		if(curDt){
			if(curDt == item){
				return;
			}else{
				curDt.removeClass('on').next('dd').removeClass('on');
			}
		}
		item.addClass('on').next('dd').addClass('on');
		me.currentDt = item;
	},
	selectCurrentPage: function(){
		var me = this;
		var selectPage = book.curPage;
		var maxPage = book.max;
		selectPage = (selectPage&1) ? selectPage : selectPage-1;
		var menuArr = me.mainList.parent().find('a');
		var oldMenu = menuArr.filter('.on');
		var curMenuArr = menuArr.filter('[p=' + selectPage + ']');
		if(curMenuArr.length == 0){
			curMenuArr = menuArr.filter('[p=' + (selectPage+1) + ']');
		}
		if(curMenuArr.length == 0){
			var index = 0, curIndex = -1;
			menuArr.each(function(){
				var p = parseInt($(this).attr('p'));
				if(p>selectPage){
					curIndex = index;
					return false;
				}
				index = p;
			});
			if(curIndex == -1){
				curIndex = index;
			}
			curMenuArr = menuArr.filter('[p=' + curIndex + ']');
		}
		var monthItem = null;
		if(curMenuArr.hasClass('front-cover')){
			monthItem = me.mainList.find('dd').first();
		}else if(curMenuArr.hasClass('back-cover')){
			monthItem = me.mainList.find('dd').last();
		}else {
			monthItem = curMenuArr.parents('dd');
		}
		var yearItem = monthItem.prev('dt');
		oldMenu.removeClass('on');
		curMenuArr.addClass('on');
        me.currentMonth = curMenuArr;
        me.selectYear(yearItem);
	},
    selectCurrentDate: function(){
        var me = this;
        var selectDate = book.dateObj;
        var type = selectDate.type;
        var year = selectDate.year,
            month = selectDate.month;
        var menuArr = me.mainList.parent().find('a');
        var oldMenu = menuArr.filter('.on');
        //select
        var yearItem = me.mainList.find('dt').filter('.'+year);
        var monthArr = yearItem.next('dd');
        var monthItem = monthArr.find('a').filter('[m=' + month + ']');
        //front|back cover
        if(type == 'first' || type == 'end' || type == 'copyright'){
            monthItem = menuArr.filter('a[data-type="'+type+'"]');
            if(type == 'first'){
                monthArr = me.mainList.find('dd').first();
            }else{
                monthArr = me.mainList.find('dd').last();
            }
        }else if(type != 'content'){
            monthArr = me.mainList.find('dd').first();
        }
        yearItem = monthArr.prev('dt');
        //
        oldMenu.removeClass('on');
        monthItem.addClass('on');
        me.currentMonth = monthItem;
        me.selectYear(yearItem);
    },
	show: function(fun){
		var me = this;
		if(!me.isDataOk){
			return;
		}
		me.init();
        me.selectCurrentDate();
        me.mainContent.css('display', 'block');
        me.triggerBtn.addClass('cur');
        changeColor.close();
        me.isShowed = true;
        fun && fun();
        $('.book-opt-right-bd').show();
	},
	close: function(fun){
		var me = this;
		me.mainContent.css('display', 'none');
		me.triggerBtn.removeClass('cur');
        me.isShowed = false;
		fun && fun();
        $('.book-opt-right-bd').hide();
	},
	renderHtml: function(data){
		var me = this;
		var teplArr = ['<dd><ul>','</ul></dd>'];
		var str = '';
		var year = null;
        me.catalogData = {years:[]};
        if(data.length == 0){
            $('.catbar-tool').hide();
            return;
        }
		for(var i=0,len=data.length; i<len; i++){
			var item = data[i];
			if(!parseInt(item.year)){
				var cover = item.year;
				if(cover == 'startPage'){
					me.mainList.prev('a').attr('p', item.indexPage);
				}else if(cover == 'endPage'){
					me.mainList.next('a').attr('p', item.indexPage);
				};
				continue;
			}
			if(year != item.year){
				year != null ? str+= teplArr[1] : -1;
				year = item.year;
				str += '<dt class="'+year+'">'+ year + '</dt>';
				str += teplArr[0];
                me.catalogData[year] = [];
                me.catalogData.years.push(year);
			}
			var month = Number(item.month);
			var title = year + '年' + month + '月';
			var page = item.indexPage;
			str += '<li><a href="#" title="'+title+'" data-type="content" y="'+year+'" m="'+item.month+'" p="'+page+'">'+month+'月</a></li>';
            me.catalogData[year].push(item.month);
		}
		str += teplArr[1];
		return str;
	},
	refresh: function(data){
		var me = this;
        var catalogData = data.catalog;
		var htmlStr = me.renderHtml(catalogData);
		me.mainList.html(htmlStr);
        book.maxFirst = data.titleNum;
	},
    getCatalogPrev: function(year,month){
        var me = this;
        var monthArr = me.catalogData[year];
        var curDate = {};
        for(var i=0, len= monthArr.length; i<len; i++){
            var item = monthArr[i];
            if(item == month){
                break;
            }
        }
        var prev = i-1;
        if(prev<0){
            var yearArr = me.catalogData.years;
            for(j=0, jlen = yearArr.length; j<jlen; j++){
                var item = yearArr[j];
                if(item == year){
                    break;
                }
            }
            curDate.year = yearArr[j-1];
            var preMonthArr = me.catalogData[curDate.year];
            curDate.month = preMonthArr[preMonthArr.length-1];
        }else{
            curDate.year = year;
            curDate.month = monthArr[prev];
        }
        return curDate;
    },
    getCatalogLimit: function(type){
        var me = this;
        var yearArr = me.catalogData.years;
        var monthArr;
        var year, month, obj = {};
        if(yearArr.length == 0){
            return obj;
        }
        if(type == 'first'){
            year = yearArr[0];
            monthArr = me.catalogData[year];
            month = monthArr[0];
        }else if(type == 'last'){
            year = yearArr[yearArr.length-1];
            monthArr = me.catalogData[year];
            month = monthArr[monthArr.length-1];
        }
        obj.year = year;
        obj.month = month;
        return obj;
    },
    checkCatalogLimit: function(type,data){//是否为首月|尾月
        var me = this;
        var yearArr = me.catalogData.years;
        var monthArr;
        var year, month;
        var sign = false;
        if(type == 'first'){
			var index = data.twoMonthFlag && data.twoMonthFlag == 'two' ? 1 : 0;
            year = yearArr[0];
            monthArr = me.catalogData[year];
            month = monthArr[index];
            if(data.year == year && data.month == month){
                sign = true;
            }
            return sign;
        }else if(type == 'last'){
            year = yearArr[yearArr.length-1];
            monthArr = me.catalogData[year];
            month = monthArr[monthArr.length-1];
            if(data.year == year && data.month == month){
                sign = true;
            }
            return sign;
        }
    }
};
var changeColor = {
	triggerBtn: $('#J_setColor'),
	listCon: $('.color-list'),
	isShowed: false,
	curColor: '',
	init: function(){
		var me = this;
		me.bindHandler();
		var color = 'color1';
		var color = initColor != 'null' ? initColor : 'color1';
		me.selectItem(color);
	},
	bindHandler: function(){
		var me = this;
		me.triggerBtn.click(function(ev){
			if(me.isShowed){
				me.close();
			}else{
				me.show();
			}
			return false;
		});
		$('body').click(function(ev) {
        	var curTarget = me.listCon.find(ev.target);
        	var colorID = curTarget.parent().attr('id');
        	if(curTarget.length == 0 && me.isShowed){
        		me.close();
        	}
            if(colorID && colorID !='J_setColor'){
                me.close();
            }
        });
        me.listCon.delegate('li', 'click', function(ev){
        	var item = $(this);
        	if(item.hasClass('cur')){
        		return;
        	}
        	var itemCls = item.attr('class');
        	me.selectItem(itemCls);
        });
	},
	selectItem: function(colorCls){
		var me = this;
		var colorArr = me.listCon.find('li');
		colorArr.removeClass('cur');
		colorArr.filter('.'+colorCls).addClass('cur');
		//page
		$('.pages').removeClass(me.curColor).addClass(colorCls);
		me.curColor = colorCls;
	},
	show: function(colorCls){
		var me = this;
        menuBar.close();
		me.isShowed = true;
		me.listCon.css('display','block');
		me.triggerBtn.addClass('cur');
        $('.book-opt-right-bd').show();
	},
	close: function(){
		var me = this;
		if(!me.isShowed){
			return;
		}
		me.isShowed = false;
		me.listCon.css('display','none');
		me.triggerBtn.removeClass('cur');
        $('.book-opt-right-bd').hide();
		//send data
		var itemCls = me.listCon.find('li').filter('.cur').attr('class');
		itemCls = itemCls.match(/color\d/)[0];
    	var url = '/changeColor.htm';
    	var param = {color: itemCls, bookId: bookId};
    	var successFun = function(data){
    		if(data.response == 'success'){
    			// console.log('setColor ok');
    		}else{
                // console.log('setColor fail')
            }
    	};
    	YS.ajaxPost(url, param, successFun);
	}
};

//init
book.bookInit();
menuBar.init();
changeColor.init();

//bind in html
imageShow = function(el){
	var curEl = $(el);
    var parent = curEl.parent();
    parent.removeClass("imgLoading");
    el.style.display = "block";
    // book.imgShow(el, parent);
}
imageError = function(el){
	console.log('img error'+el);
}
})();

