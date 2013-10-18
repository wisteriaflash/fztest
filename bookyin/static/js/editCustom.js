/*
个性化编辑
*/
(function(){
var templateDefaultData = {
	frontLayer: {
		textLine1: {
			text: '',
			type: 'single',
			width: 200,
			height: 30,
			maxLen: 15,
			lineHeight: '30px',
			fontSize: '12px',
			fontColor: '#757575'
		},
		textLine2: {
			text: '',
			type: 'single',
			width: 380,
			height: 30,
			maxLen: 15,
			lineHeight: '30px',
			fontSize: '24px',
			fontColor: '#000000'
		},
		textLine3: {
			text: '',
			type: 'single',
			width: 200,
			height: 30,
			maxLen: 10,
			lineHeight: '30px',
			fontSize: '12px',
			fontColor: '#000000'
		},
		clipimg: {
			width: 120,
			height: 92,
			image: {
				defaults: YS.staticDomainbyJs+'/img/default/img_default380x250.jpg'	
			}
		}
		
	},
	backLayer: {
		barcode: '',
		clipimg: {
			width: 380,
			height: 250,
			image: {
				defaults: YS.staticDomainbyJs+'/img/default/img_default380x250.jpg'	
			}
		}
	},
	firstLayers: function(type){
		var config = {};
		switch(type){
			case 'imgText': 
					'上图下文';
					config = {
						template: type,
						clipimg: {
							width: 390,
							height: 300
						},
						textLine: {
							text: '',
							type: 'multi',
							width: 250,
							height: 100
						}
					};
					break;
			case 'textImg': 
					'上文下图';
					config = {
						template: type,
						textLine: {
							text: '',
							type: 'multi',
							width: 250,
							height: 100
						},
						clipimg: {
							width: 390,
							height: 300
						}
					}
					break;
			case 'img': 
					'整图';
					config = {
						template: type,
						clipimg: {
							width: 390,
							height: 585,
							image: {
								defaults: YS.staticDomainbyJs+'/img/default/img_big_default.jpg'	
							}
						}
					}
					break;
			case 'text': 
					'整文字';
					config = {
						template: type,
						textLine: {
							text: '',
							type: 'multi',
							width: 390,
							height: 585,
							maxLen: 1000
						}	
					};
					break;
		}
		return config;
	}
};

var utils = {
	RGB2Color: function(r,g,b){
	  return '#' + this.byte2Hex(r) + this.byte2Hex(g) + this.byte2Hex(b);
	},
	byte2Hex: function(n){
	  var nybHexString = "0123456789ABCDEF";
	  return String(nybHexString.substr((n >> 4) & 0x0F,1)) + nybHexString.substr(n & 0x0F,1);
	}
};

//layer|template
var layer = {
	leftBarNode: $('#J_leftBar'),
	layersData: null,
	curLayer: 'front',
	maxLayers: 8,
	maxTipId: null,
	maxTipTime: 3000,
	newLayerTip: 'newLayerTip',
	curUserID: '',

	init: function(){
		var me = this;
		me.newLayerTipInit();
		me.bindHandler();
		me.getLayersData();
	},
	bindHandler: function(){
		var me = this;
		var animateTime = 300;
		me.leftBarNode.find('.tab-hd li').click(function(e){
			var tabHd = me.leftBarNode.find('.tab-hd');
			var tabBd = me.leftBarNode.find('.tab-bd');
			//tip
			tabHd.find('.tip').hide();
			YS.setTipCookie(me.newLayerTip, me.curUserID);
			//hd
			tabHd.find('li').removeClass('selected');
			$(this).addClass('selected');
			//bd
			var curTab = $(this).attr('class');
			curTab = curTab.replace('selected','').replace(' ','');
			tabBd.find('.item-bd').removeClass('selected');
			$('.'+curTab+'-bd').addClass('selected');
			//init show
			if(!tabBd.hasClass('selected')){
				tabHd.animate({
					right: '168px'
				},animateTime);
				tabBd.css({
					width: 0
				});
				tabBd.addClass('selected');
				tabBd.animate({
					width: '156px'
				},animateTime);
			}
		});
		//layers
		$('#J_layerBd').delegate('li', 'click', function(e){
			var target = $(e.target);
			if($(this).hasClass('selected') || $(this).hasClass('line') || target.hasClass('del')){
				return;
			}
			var cls = $(this).attr('class');
			if(cls == 'first-add'){
				me.addFirstLayer();
			}else{
				$('#J_layerBd li').removeClass('selected');
				$(this).addClass('selected');
				//data
				if(me.curLayer){
					me.saveCurLayerData();	
				}
				me.curLayer = cls;
				me.changeTemplateType();				
				var data = me.getCurLayerData(me.curLayer, me.layersData);
				editLayer.rightBarHide();
				editLayer.renderLayer(me.curLayer,data);
				otherOpt.setTitle(me.curLayer);
			}
		});
		$('#J_layerBd .first').delegate('.del', 'click', function(e){
			me.delFirstLayer($(this));
		});
		//template
		$('#J_templateBd li').click(function(e){
			if($(this).hasClass('selected')){
				return;
			}
			var type = $(this).attr('data');
			$(this).parent().find('li').removeClass('selected');
			$(this).addClass('selected');
			var layerItem = $('#J_layerBd li.selected');
			var imgurl = YS.staticDomainbyJs+'/img/default/first_'+type+'.jpg';
			layerItem.find('img').attr('src',imgurl);
			//
			me.saveCurLayerData();
			var typeData = templateDefaultData.firstLayers(type);
			var index = parseInt(me.curLayer.replace('first-',''))-1;
			var curLayerData = me.layersData.firsts[index];
			//save data
			var imgObj = curLayerData.clipimg ? curLayerData.clipimg.image : {};
			var txt = curLayerData.textLine ? curLayerData.textLine.text : '可以在这里输入文字';
			if(typeData.clipimg){
				typeData.clipimg.image = typeData.clipimg.image ? typeData.clipimg.image : {};
				typeData.clipimg.image.source = imgObj.source ? imgObj.source : '';
				typeData.clipimg.image.width = imgObj.initWidth ? imgObj.initWidth : 0;
				typeData.clipimg.image.height = imgObj.initHeight ? imgObj.initHeight : 0;
			}
			if(typeData.textLine){
				typeData.textLine.text = txt;
			}
			me.layersData.firsts[index] = typeData;
			editLayer.renderLayer(me.curLayer, typeData);
		});
		//sort
		$('#J_fristLayer').sortable({
			items: "li:not(.first-add)",
			revert: true,
			appendTo: '#J_fristLayer',
			stop: function(event, ui){
				me.refreshFistLayer();
				//data
				var oldIndex = ui.placeholder.attr('class').match(/first\-\d*/)[0];
				oldIndex = parseInt(oldIndex.replace('first-',''))-1;
				var newIndex = ui.item.attr('class');
				newIndex = parseInt(newIndex.replace('first-',''))-1;
				if(oldIndex == newIndex){
					return;
				}
				var curCls = $('#J_layerBd li.selected').attr('class');
				if(curCls.match('first')){
					me.curLayer = curCls.match(/first-\d*/)[0];
				}
				//swap data
				var firstsData = me.layersData.firsts;
				var temp = firstsData[oldIndex];
				firstsData[oldIndex] = firstsData[newIndex];
				firstsData[newIndex] = temp;
				// console.log(oldIndex,newIndex,firstsData);
			}
		});
	},
	changeTemplateType: function(){
		var me = this;
		var type = me.curLayer;
		if(type.match('first')){
			type = 'first';
			var data = me.getCurLayerData(me.curLayer, me.layersData);
			var firstCon = $('#J_templateBd').find('.'+type);
			firstCon.find('li').removeClass('selected');
			firstCon.find('li[data="'+data.template+'"]').addClass('selected');
		}
		$('#J_templateBd ul').removeClass('selected');
		$('#J_templateBd').find('.'+type).addClass('selected');
	},
	getLayersData: function(){
		var me = this;
		var method = 'GET';
		var url = '/edit!getBookInfo.htm';
		var param = {bookId: otherOpt.bookId};
		var successFun = function(data){
			var mergeData = me.mergeLayersData(data);
			me.layersData = mergeData;
			me.renderLayersList();
			var layerdata = me.getCurLayerData(me.curLayer, me.layersData);
			editLayer.renderLayer(me.curLayer,layerdata);
		};
		YS.ajaxData(method,url,param,successFun);
	},
	mergeLayersData: function(data){
		// delete data.init;
		var obj = {};
		obj.front = $.extend(true,{},templateDefaultData.frontLayer,data.front);
		obj.back = $.extend(true,{},templateDefaultData.backLayer,data.back);
		//firsts
		var firstsArr = [], item;
		if(data.firsts){
			for(var i=0, len= data.firsts.length; i<len; i+=2){
				item = data.firsts[i]
				firstsArr.push(item);
			}
		}
		obj.firsts = firstsArr;
		return obj;
	},
	renderLayersList: function(){
		var me = this;
		var dataArr = me.layersData.firsts;
		var leftBarFirst = $('#J_layerBd .first');
		var str = '', item;
		for(var i=0, l=dataArr.length; i<l; i++){
			item = dataArr[i];
			str += me.renderOneLayer(i+1,item.template);
		}
		$(str).insertBefore(leftBarFirst.find('.first-add'));
		me.setFirstLayerHeight();
	},
	renderOneLayer: function(num, type){
		var str = '<li class="first-'+num+'">'+
				'<span class="del" title="删除"></span>'+
				'<img src="'+YS.staticDomainbyJs+'/img/default/first_'+type+'.jpg" />'+
				'<span class="title">扉页'+num+'</span>'+
			'</li>';
		return str;
	},
	getCurLayerData: function(type, data){
		var layerData = data[type];
		if(type.match('first')){
			var index = parseInt(type.replace('first-',''));
			index -= 1;
			// debugger;
			layerData = data.firsts[index];
		}
		return layerData;
	},
	saveCurLayerData: function(){
		var me = this;
		var layerdata = me.getCurLayerData(me.curLayer, me.layersData);
		var data = editLayer.getEditLayerData();
		$.extend(true, layerdata, data);
	},
	addFirstLayer: function(){
		var me = this;
		if(me.maxFistLayer()){
			return;
		}
		var data = templateDefaultData.firstLayers('imgText');
		//data
		var firstsData = me.layersData.firsts;
		firstsData.push(data);
		//leftbar
		var leftBarFirst = $('#J_layerBd .first');
		var str = me.renderOneLayer(firstsData.length, 'imgText');
		var addNode = $(str);
		addNode.insertBefore(leftBarFirst.find('.first-add'));
		addNode.click();
		//srcoll
		me.setFirstLayerHeight();
	},
	delFirstLayer: function(item){
		var me = this;
		var parent = item.parents('li');
		var itemIndex = parent.attr('class').replace('first-','');
		itemIndex = parseInt(itemIndex);
		itemIndex -= 1;
		var firstsData = me.layersData.firsts;
		firstsData.splice(itemIndex,1);
		if(parent.hasClass('selected')){
			var selectItem = parent.next(':not(.first-add)');
			if(selectItem.length == 0){
				var prevItem = parent.prev();
				var back = $('#J_layerBd .cover .back');
				selectItem = prevItem.length==0 ? back : prevItem;
			}
		}
		// parent.slideUp(200, function(){
		// })
		parent.remove();
		me.refreshFistLayer();
		if(selectItem){
			me.curLayer = '';
			selectItem.click();
		}
		me.setFirstLayerHeight();
		
		
	},
	refreshFistLayer: function(){
		var leftBarFirst = $('#J_layerBd .first');
		var arr = leftBarFirst.find('li');
		var index = 0, cls= '', item;
		for(var i=0,l=arr.length-1; i<l; i++){
			item = $(arr[i]);
			index = i+1;
			cls = item.attr('class');
			cls = cls.replace(/first-\d*/,'first-'+index);
			item.attr('class',cls);
			item.find('.title').text('扉页'+index);
		}
	},
	maxFistLayer: function(){
		var me = this;
		var maxSign = false;
		var firstsData = me.layersData.firsts;
		if(firstsData.length+1>me.maxLayers){
			maxSign = true;
		}
		me.maxFistTip(maxSign);
		return maxSign;
	},
	maxFistTip: function(sign){
		var me = this;
		var firstTip = $('#J_layerBd .first-add .tip-status');
		firstTip.hide();
		clearTimeout(me.maxTipId);
		if(sign){
			firstTip.show();
			me.maxTipId = setTimeout(me.maxFistTipHide,me.maxTipTime);
		}
	},
	maxFistTipHide: function(){
		var me = layer;
		var firstTip = $('#J_layerBd .first-add .tip-status');
		firstTip.fadeOut();
	},
	setFirstLayerHeight: function(){
		var me = this;
		var firstsData = me.layersData.firsts;
		var sh = (firstsData.length+1) *126;
		//
		var leftBarFirst = $('#J_layerBd .first');
		leftBarFirst.css('height',sh);
		//scroll
		me.setFirstLayerScroll();
	},
	setFirstLayerScroll: function(){
		var me = this;
		var firstsData = me.layersData.firsts;
		var leftBarFirstCon = $('#J_layerBd .first-con');
		if(firstsData.length>=3){
			leftBarFirstCon.perfectScrollbar('destroy');
			leftBarFirstCon.perfectScrollbar({
				wheelSpeed: 100
			});
		}else{
			leftBarFirstCon.perfectScrollbar('destroy');
		}
	},
	newLayerTipInit: function(){
		var me = this;
		var method = 'GET';
        var url = '/getUserInfo.htm';
        var param = {};
        var successFun = function(data){
            me.curUserID = data.id;
            var sign = YS.getTipCookie(me.newLayerTip, me.curUserID);
            if(!sign){
                var tip = $('#J_newLayerTip');
                tip.show();
                me.newLayerTipAnimate();
            }
        };
        YS.ajaxData(method, url, param, successFun);
	},
	newLayerTipAnimate: function(){
		var me = this;
		var lastTime = 200;
		var tip = $('#J_newLayerTip');
		if(!tip.is(":visible")){
			tip.stop();
			return;
		}
		tip.animate({left: -73}, lastTime)
		.animate({left:-68}, lastTime, function(){
			me.newLayerTipAnimate();
		});
	}
};

//editLayer
var editLayer = {
	infoNode: $('#J_layerInfo'),
	rightBarNode: $('#J_rightBar'),
	layerData: null,
	isUploading: false,
	init: function(){
		var me = this;
		me.bindHandler();
	},
	bindHandler: function(){
		var me = this;
		//cancel
		$('body').click(function(e){			
			var target = $(e.target);
			var txt = target.parents('.com-edit-text');
			txt = (target.hasClass('com-edit-text') || txt.length>0);
			var img = target.parents('.com-clipimg');
			var rightBar = target.parents('.right-bar');
			if( txt || img.length>0 || rightBar.length>0){
				return;
			}
			$('#J_layerInfo').find('.com-edit-text.selected').textedit('cancel');
			$('#J_layerInfo').find('.com-clipimg.selected').clipimg('cancel');
		});
		//img
		$('#J_photoList').delegate('li .imgbox','click', function(e){
			var item = $(this);
			if(item.hasClass('photo-add')){
				
			}else{
				var imgData = $(this).find('img')
				var data = {
					url: imgData.attr('src'),
					width: imgData.attr('data-width'),
					height: imgData.attr('data-height'),
					wdpi: imgData.attr('data-wdpi'),
					hdpi: imgData.attr('data-hdpi')
				};
				var imgCom = $('#J_layerInfo').find('.com-clipimg.selected');
				imgCom.clipimg('setImage',data);
			}
		});
		$('#J_photoList').delegate('li .del','click', function(e){
			var item = $(this);
			item.parents('li').css('display','none');
			item.parents('li').addClass('hide');
			me.setPhotoListScroll();
		});
		//add photo
		$('#fileupload').fileupload({
	        dataType: 'json',
	        url: '/edit!uploadFile.htm',
	        // url: 'a.php',
	        start: function(e, data){
	        	// me.isUploading = true;
	        	$('#fileupload').css('display','none');
	        	me.addPhoto();
	        	// console.log('start',e,data);
	        },
	        progress: function(e, data){
	          var progress = parseInt(data.loaded / data.total * 100, 10);
	          me.uploadPhotoProgress(progress);
	          // console.log(progress,data);
	        },
	        fail: function(e, data){
	        	// me.isUploading = false;
	        	$('#fileupload').css('display','block');
	          	me.uploadPhotoError('文件上传失败');
	          	// console.log('fail',e,data);
	        },
	        done: function (e, data) {
	        	var data = data.result;
	        	// debugger;
	        	// me.isUploading = false;
	        	$('#fileupload').css('display','block');
	        	if(data.result == 'success'){
	        		me.uploadPhotoSuccess(data);	
	        	}else{
	        		me.uploadPhotoError(data.reason);
	        	}
	            // console.log('done',data);
	        }

	    });
		//font
		$('#J_fontSize').change(function(e){
			var size = $(this).val();
			var txt = $('#J_layerInfo').find('.com-edit-text.selected');
			txt.textedit('setFontSize',size);
			//check fontLine
			me.checkFontLine(txt);
		});
		$('#J_fontLine').change(function(e){
			var line = $(this).val();
			var txt = $('#J_layerInfo').find('.com-edit-text.selected');
			txt.textedit('setLineHeight',line);
		});
		$('#J_fontAlign li').click(function(e){
			if($(this).hasClass('selected')){
				return;
			}
			var align = $(this).attr('class');
			var txt = $('#J_layerInfo').find('.com-edit-text.selected');
			txt.textedit('setFontAlign',align);
			//
			$('#J_fontAlign li').removeClass('selected');
			$(this).addClass('selected');
		});
		$('#J_fontColor li').click(function(e){
			if($(this).hasClass('selected')){
				return;
			}
			var color = $(this).attr('data');
			var txt = $('#J_layerInfo').find('.com-edit-text.selected');
			txt.textedit('setColor',color);
		});
	},
	checkFontLine: function(txt){
		var fontSizeStr = txt.css('font-size');
		var fontSize = YS.pixelToInt(fontSizeStr);
		var fontLine = YS.pixelToInt(txt.css('line-height'));
		var curFontLine = $('#J_fontLine option[value="'+fontSizeStr+'"]');
		var curFontLineIndex = curFontLine.index();
		if(fontSize>fontLine){
			$('#J_fontLine option').prop('selected',false);
			curFontLine.prop('selected',true);
			$('#J_fontLine').change();
		}
		var lineOptionArr = $('#J_fontLine option:lt('+curFontLineIndex+')');
		$('#J_fontLine option').prop('disabled',false);
		lineOptionArr.prop('disabled',true);
	},
	renderLayer: function(type,data){
		var me = this;
		//bg
		var bgCls = type, infoCls = 'info';
		if(type.match('first')){
			bgCls = 'first';
			infoCls += ' '+data.template;
		}
		bgCls += '-page';
		$('#J_layerItem').attr('class','item-page '+bgCls);
		me.infoNode.attr('class', infoCls);
		//info
		me.infoNode.html('');
		for(var item in data){
			var itemConf = data[item];
			if(item.match('text')){
				//conf
				itemConf.onSelect = function(data){
					me.cleanSelect();
					me.rightBarShow('txt',data);
				};
				itemConf.onCancel = function(){
					me.rightBarHide();
				};
				//render
				var txt = '<div class="com-edit-text" data-name="'+item+'"></div>';
				var textNode = $(txt);
				if(data.template == 'textImg'){//上文下图fix
					me.infoNode.prepend(textNode);
				}else{
					me.infoNode.append(textNode);
				}
				textNode.textedit(itemConf);
			}else if(item.match('img')){
				//conf
				itemConf.onSelect = function(){
					me.cleanSelect();
					me.rightBarShow('img');
				};
				itemConf.onCancel = function(){
					me.rightBarHide();
				};
				//render
				var clipimg = '<div class="com-clipimg" data-name="'+item+'"></div>';
				var clipimgNode = $(clipimg);
				me.infoNode.append(clipimgNode);
				clipimgNode.clipimg(itemConf);
			}else if(item == 'barcode'){
				var barcode = '<div class="barcode"><img src="'+itemConf+'" width="125" /></div>';
				me.infoNode.prepend(barcode);
			}
		}
	},
	getEditLayerData: function(){
		var me = this;
		var data = {};
		var txtData = me.infoNode.find('.com-edit-text').textedit('getData');
		var imgData = me.infoNode.find('.com-clipimg').clipimg('getData');
		data = $.extend({},txtData, imgData);
		return data;
	},
	cleanSelect: function(){
		var me = this;
		me.infoNode.find('.com-edit-text').removeClass('selected');
		me.infoNode.find('.com-clipimg').removeClass('selected');
	},
	rightBarShow: function(type,data){
		var me = this;
		var right = '';
		if(type == 'txt'){
			right = 'font';
		}else if(type == 'img'){
			right = 'photo';
		}
		//show
		var curBd = me.rightBarNode.find('.'+right+'-bd');
		me.rightBarNode.find('.item-bd').removeClass('selected');
		curBd.addClass('selected');
		me.rightBarLoadData(data);
		//init show
		var animateTime = 300;
		if(!me.rightBarNode.hasClass('selected')){
			me.rightBarNode.css({
				width: 0
			});
			me.rightBarNode.find('.item-bd').removeClass('selected');
			me.rightBarNode.addClass('selected');
			me.rightBarNode.animate({
				width: 226
			},animateTime, function(){
				curBd.addClass('selected');
			});
		}
	},
	rightBarHide: function(){
		var me = this;
		var animateTime = 300;
		if(!me.rightBarNode.hasClass('selected')){
			return;
		}
		me.rightBarNode.find('.item-bd').removeClass('selected');
		me.rightBarNode.animate({
			width: 0
		},animateTime, function(){
			me.rightBarNode.removeClass('selected');
		});
	},
	rightBarLoadData: function(data){
		var me = this;
		var item = me.rightBarNode.find('.selected');
		//font
		if(item.hasClass('font-bd')){
			$('#J_fontSize').val(data.fontSize);
			$('#J_fontLine').val(data.lineHeight);
			$('#J_fontAlign li').removeClass('selected');
			$('#J_fontAlign').find('.'+data.fontAlign).addClass('selected');
			$('#J_fontColor li').removeClass('selected');
			$('#J_fontColor li[data="'+data.fontColor+'"]').addClass('selected');
		}
	},
	addPhoto: function(){
		var me = this;
		var addPhotoNode = $('#J_photoList').find('.photo-add');
		//render
		var str = '<li class="uploading">'+
					'<div class="loading-info">'+
						'<img src="'+YS.staticDomainbyJs+'/img/index-loading.gif" width="80" />'+
						'<span class="percent">0%</span>'+
						'<p class="tip">图片上传中，请稍后</p>'+
					'</div>'+
				'</li>';
		$(str).insertAfter(addPhotoNode);
		me.setPhotoListScroll();
	},
	uploadPhotoProgress: function(percent){
		var str = percent + '%';
		var item = $('#J_photoList .uploading');
		item.find('.percent').text(str);
	},
	uploadPhotoSuccess: function(data){
		var item = $('#J_photoList .uploading');
		item.removeClass('uploading');
		item.find('.loading-info').remove();
		//
		var sizeStr = ';'
		if(Number(data.width)>Number(data.height)){
			// sw = 144;
			sizeStr = 'width="144"';
		}else{
			// sh = 120;
			sizeStr = 'height="120"';
		}
		//img
		var str = '<span class="del" title="删除"></span>'+
				'<div class="imgbox">'+
					'<img src="'+data.filePath+'" '+sizeStr+' data-width="'+data.width+'" data-height="'+data.height+'" data-wdpi="'+data.widthdpi+'" data-hdpi="'+data.heightdpi+'" />'+
				'</div>';
		item.html(str);
	},
	uploadPhotoError: function(errTip){
		var item = $('#J_photoList .uploading');
		item.removeClass('uploading');
		item.addClass('uploaderr');
		var delStr = '<span class="del" title="删除"></span>';
		item.prepend(delStr);
		item.find('.tip').text(errTip);
	},
	setPhotoListScroll: function(){
		var list = $('#J_photoList').parent();
		//
		var hideArr = list.find('li.hide');
		var arr = list.find('li');
		var len = arr.length - hideArr.length;
		if(len==5){
			list.perfectScrollbar({
				wheelSpeed: 100
			});
		}else if(len>5){
			list.perfectScrollbar('update');
		}else{
			list.perfectScrollbar('destroy');
		}
	}
};


//other
var otherOpt = {
	titleNode: $('#J_customTitle'),
	titleObj : {front: '封面', back: '封底', first: '扉页'},
	bookId: '',
	previewURL: '/editStatusBook.htm',
	init: function(){
		var me = this;
		me.initData();
		me.bindHandler();
	},
	initData: function(){
		var me = this;
		me.bookId = me.titleNode.attr('data-id');
		me.previewURL += '?bookId='+me.bookId;
	},
	bindHandler: function(){
		var me = this;
		me.titleNode.find('.btns a').click(function(e){
			e.preventDefault();
			var cls = $(this).attr('class');
			if(cls == 'save'){
				layer.saveCurLayerData();
				me.saveDataTipShow('loading');
				me.saveLayersData();
			}else if(cls == 'close'){
				// console.log('close');
				me.saveDataDialog('close');
			}
		});
	},
	setTitle: function(type){
		var me = this;
		var txt = me.titleObj[type];
		if(type.match('first')){
			var index = type.replace('first-','');
			txt = me.titleObj.first+index;
		}
		me.titleNode.find('.title em').text(txt);
	},
	saveLayersData: function(){
		var me = this;
		var data = layer.layersData;
		var dataStr = JSON.stringify(data);
		var method = 'POST';
		var url = '/edit!save.htm';
		var param = {
			bookId: me.bookId,
			head: dataStr
		};
		var successFun = function(data){
			if(data.result == 'success'){
				me.saveDataTipShow('success');
			}else{
				me.saveDataTipHide();
				me.saveDataDialog('err');
			}
		};
		YS.ajaxData(method, url, param, successFun);
	},
	saveDataTipShow: function(type){
		var me = this;
		var tip = $('#J_customTitle .tip-status');
		if(tip.length == 0){
			var tipStr = '<div class="tip-status">'+
							'<i class="arrow"></i>'+
							'<p><i class="icon"></i><em class="tip-info"></em></p>'+
						'</div>';
			tip = $(tipStr)
			$('#J_customTitle').append(tip);
		}
		if(type == 'loading'){
			tip.css('display','block');
			tip.attr('class','tip-status loading');
			tip.find('.tip-info').text('正在保存中,请稍后...');
		}else if(type == 'success'){
			tip.attr('class','tip-status success');
			tip.find('.tip-info').text('保存成功');
			var delayTime = 1000;
			setTimeout(me.saveDataTipHide, delayTime);
		}else{
			me.saveDataTipHide();
		}
	},
	saveDataTipHide: function(){
		var tip = $('#J_customTitle .tip-status');
		tip.fadeOut();
		// tip.css('display','none');
	},
	saveDataDialog: function(type){
		var me = this;
		var conf = {cls: 'saveDataTip'};
		if(type == 'err'){//保存失败
			var errConf = {
				cls : conf.cls,
				btn: 'no',
				txt: {'tip-text': '保存失败！', 'tip-note': '请检查您的网路，并尝试重新保存', tips:''}
			}
			YS.tipConfirmDialog.show(errConf);
		}else if(type == 'close'){//关闭
			var closeConf = {
				cls: conf.cls,
				txt: {'tip-text': '确定关闭当前编辑吗？',tips:'请确认之前的操作是否保存。'},
				onsubmit: function(){
					window.location.href = me.previewURL;
				}
			}
			YS.tipConfirmDialog.show(closeConf);
		}
	}
};


//init
otherOpt.init();
layer.init();
editLayer.init();

})();