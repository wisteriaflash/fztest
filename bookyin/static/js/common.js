$(function(){

	//img expand demo
	$('.item').hover(function (){
	    $(this).addClass("hover");
	},function () {
	    $(this).removeClass("hover");
	});

	$('.exp').click(function (e){
		e.preventDefault();
		var _this = $(this),
			thisImg = _this.siblings('img');
		var imgh = thisImg.height();
		var imgw = thisImg.width();
		//console.log(imgh,imgw);
		thisImg.parent().css('max-height',imgh);
		_this.prev().hide();
		var item0 = _this.parents('.item');
		var item1h = item0.siblings('.item').eq(0).height();
		var item2h = item0.siblings('.item').eq(1).height();
		var item0h = item0.height();
		var itemsh = item0h + item1h + item2h;
		var nextul = item0.parents('.pages').next().find('ul').eq(0);
		//console.log(itemsh);
		if (itemsh > 690){
			item0.prependTo(nextul);
		}
		_this.remove();
	})

	//catalog
	$('.catswitch a').click(function (e){
		e.preventDefault();
		$('.catbar').show();
	});

	var myOrder = {
		init: function(){
			var me = this;
			var list = $('#myorderlist li');
			if(list.length>0){
				me.bindHandler();	
			}
		},
		bindHandler: function(){
			var me = this;
			//myorder in header
			$('.myorderlink').hover(function() {
				$(this).addClass('hover');
				$('.myorderbox').css({
					right:'0',
					left:'auto'
				})
			}, function() {
				$(this).removeClass('hover');
				$('.myorderbox').css({
					right:'auto',
					left:'-9999px'
				})
			});
			//scrollbar
			$('#myorderlist').perfectScrollbar({
				wheelSpeed: 100
			});
			//del
			$('.btn-delsamll').click(function (e) {
				e.preventDefault();
				//clean
				$('#myorderlist .order-del').hide();
				$(this).parent().next().toggle();
			});
			$('.btn-deltorder').click(function (e){
				e.preventDefault();
				var parent = $(this).parents('li');
				var id = parent.find('.btn-delsamll').attr('data-id');
				me.delItemOrder(id);
			});
			$('.btn-canceldelt').click(function (e){
				e.preventDefault();
				$(this).parent().hide();
			});
			//receipt-good
			$('#myorderlist').find('.receipt-good').click(function(e){
				e.preventDefault();
				var id = $(this).attr('data-id');
				me.confirmItemOrder(id);
			});
		},
		delItemOrder: function(id){
			var me = this;
			var method = 'POST';
			var url = '/order!deleteOrderById.htm';
			var param = {orderId: id};
			var successFun = function(data){
				if(data.error){
					alert(data.error);
					return;
				}
				var item = $('#myorderlist').find('.btn-delsamll[data-id="'+id+'"]');
				item.parents('li').remove();
			}
			YS.ajaxData(method,url,param,successFun);
		},
		confirmItemOrder: function(id){
			var me = this;
			var method = 'POST';
			var url = '/order!updateOrderById.htm';
			var param = {orderId: id};
			var successFun = function(data){
				if(data.error){
					alert(data.error);
					return;
				}
				var item = $('#myorderlist').find('.receipt-good[data-id="'+id+'"]');
				item.parents('.orderstep').addClass('step5');
			}
			YS.ajaxData(method,url,param,successFun);
		}
	};
	//init
	myOrder.init();






	//star rate
	$.fn.extend({
		initRate:function(){
			this.each(function(){
				var str="";
				var value;
				for(var i=1;i<6;i++){
					str=str+"<span class='starItem' title='"+i+"分' value='"+i+"'>"+i+"</span>";
				}
				$(this).prepend(str);
				var $items=$(this).children(".starItem");
				var $input=$(this).children("input:hidden").eq(0);
				if($input){
					value=$input.val();
					$items.each(function(i){
						$(this).mouseover(function(){
							for(var j=0;j<6;j++){
								var temp=$items.eq(j);
								if(j<i+1){
									if(i<2){
										if(temp.hasClass("starChecked2")){
											temp.removeClass("starChecked2");
										}
										temp.addClass("starChecked1");
									}else{
										temp.addClass("starChecked2");
									}
								}else{
									temp.removeClass("starChecked1").removeClass("starChecked2");
								}
							}
						}).mouseout(function(){
							var no=value-1;
							for(var j=0;j<5;j++){
								var temp=$items.eq(j);
								if(j<value){
									if(no<2){
										if(temp.hasClass("starChecked2")){
											temp.removeClass("starChecked2");
										}
										if(!temp.hasClass("starChecked1")){
											temp.addClass("starChecked1");
										}
									}else{
										if(!temp.hasClass("starChecked2")){
											temp.addClass("starChecked2");
										}
									}
								}else{
									temp.removeClass("starChecked1").removeClass("starChecked2");
								}
							}
						}).click(function(){
							value=i+1;
							$input.val(value);
						});
					});
				}
			});
		},
		getRate:function(){
			this.each(function(i){
				var str="";
				$label=$(this).children("label").eq(0);
				if($label){
					var value=parseFloat($label.html());
					str="<span class='starDisplay' title='"+value+"分'><span class='realStar'></span></span>";
					$(this).prepend(str);
					$tmp=$(this).find(".realStar").eq(0);
					if(value<0||value>5){
						alert("请输入0-5之间的数值！");
					}else{
						wid=(value/5)*100;
						if(value>2){
							$tmp.addClass("starChecked2").width(wid+"%");
						}else{
							$tmp.addClass("starChecked1").width(wid+"%");
						}
					}
				}
			});
		}
	});
	$(".star").initRate();
	$(".starGrade").getRate();

	$('.torate').click(function (e) {
		e.preventDefault();
		$(".excontent").animate({left: "-590px"},100);
	})
	$('.backmyorder').click(function (e) {
		e.preventDefault();
		$(".excontent").animate({left: "10px"},100);
	});



	//订单详情页图片carousel
	var pdimgLength = $('.pimglist .plist li').length,
		pdtprev = $('.pimglist .pprev'),
		pdtnext = $('.pimglist .pnext'),
		_pdplist = $('.pimglist .plist');
	var pdrollNum = Math.ceil(pdimgLength/3);
	var pdtwid = pdimgLength*300;
	_pdplist.width(pdtwid);
	_pdplist.css('left','0');
	var pdcssLeftPx = parseInt(_pdplist.css('left'));
	var pdcpageNum = Math.floor(pdcssLeftPx/900);

	pdtnext.click(function(e){
		e.preventDefault();
		if(pdcpageNum+1<pdrollNum){
			pdcpageNum++;
			var leftValue = -pdcpageNum*900;
			_pdplist.animate({left: leftValue+'px'}, "fast");
		}else{
			return false;
		}
	});

	pdtprev.click(function(e){
		e.preventDefault();
		if(pdcpageNum+1 >1){
			pdcpageNum--;
			var backValue = -(pdcpageNum)*900;
			_pdplist.animate({left: backValue+'px'}, "fast");
		}else{
			return false;
		}
	});

});