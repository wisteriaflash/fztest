/**
 * 功能：公共库
 * 作者：裴玲玲
 * 日期：2012-12-6
 */

/*
 * Banner图片切换
 */
(function($){
    $.fn.extend({
        banner:function(options){
            var settings={
                width:795,   //图片宽度
                height:300,  //图片高度
                autoRun: true,//是否自动播放
                delay:3000,  //播放间隔
                initIndex:0, //初始化索引
                tabCheckedClass:"bannerTabChecked", //选中序号样式
                bgColors:[]
            };
            if(options) {
                $.extend(settings, options);
            }
            var nodes=this.children();
            if(nodes.size()==2){
                var img=nodes.eq(0);
                var tab=nodes.eq(1);
                var time;
                var no=settings.initIndex+1;
                if((settings.width+"").indexOf("%")==-1){
                    if((settings.height+"").indexOf("%")==-1){
                        img.css({"width":settings.width+"px","height":settings.height+"px"});
                        tab.css("width",settings.width+"px");
                        this.find("a").css({"width":settings.width+"px","height":settings.height+"px"});
                    }else{
                        img.css({"width":settings.width+"px","height":settings.height});
                        tab.css("width",settings.width+"px");
                        this.find("a").css({"width":settings.width+"px","height":settings.height});
                    }
                }else{
                    if((settings.height+"").indexOf("%")==-1){
                        img.css({"width":settings.width,"height":settings.height+"px"});

                        this.find("a").css({"width":settings.width,"height":settings.height+"px"});
                    }else{
                        img.css({"width":settings.width,"height":settings.height});

                        this.find("a").css({"width":settings.width,"height":settings.height});
                    }
                }

                var imgs=img.children();
                var tabs=tab.children();
				tabs.eq(0).addClass(settings.tabCheckedClass).siblings().removeClass(settings.tabCheckedClass);
				imgs.eq(0).css("background",settings.bgColors[0]).fadeIn("fast").siblings().fadeOut("fast");
				function _runHander() {
					if(no==imgs.size()){
						no=0;
					}
					tabs.eq(no).addClass(settings.tabCheckedClass).siblings().removeClass(settings.tabCheckedClass);
					imgs.eq(no).fadeIn("slow").siblings().fadeOut("slow");
					if(settings.bgColors[no]){
						imgs.eq(no).css("background",settings.bgColors[no]);
					}else{
						imgs.eq(no).css("background","none");
					}
					no++;
				}
				if(settings.autoRun){
					var timer = setInterval(_runHander,settings.delay);
				}
                if(imgs.size()==tabs.size()){
					tabs.each(function(){
						$(this).hover(function(){
							clearInterval(timer);
							if(imgs.is(":animated")){
								imgs.stop(true, true);
							}
							var index=$(this).index();
							no=index;
							$(this).addClass(settings.tabCheckedClass).siblings().removeClass(settings.tabCheckedClass);
							imgs.eq(index).fadeIn("slow").siblings().fadeOut("slow");
							if(settings.bgColors[index]){
								imgs.eq(index).css("background",settings.bgColors[index]);
							}else{
								imgs.eq(index).css("background","none");
							}
						},function(){
							timer = setInterval(_runHander,settings.delay);
						});
                    });
                }
				
            }else{
                alert("页面结构有问题！");
            }
        }
    });
})(jQuery);

/*
 * Tab标签页
 */
(function($){
	$.fn.extend({
		tab:function(options){
			var settings={			
				checkedClass:"tabChecked",		//选中后的样式引用的类名
				no:0                            //默认显示的索引
			};				
			if(options) {
				$.extend(settings, options);
			}			
			this.each(function(){							
				var titlesUl=$(this).children(".tabTitles").eq(0);		
				titles=titlesUl.children('.tabTitleLi');				
				var as=titlesUl.find(".tabTitleA");	
				var cont=$(this).children(".tabContents");
				contents=cont.eq(0).children();							
				if(cont.size()>0&&(contents.size()==titles.size())){					
					titles.each(function(e){															
						$(this).click(function(){															
							$(this).addClass(settings.checkedClass).siblings().removeClass(settings.checkedClass);
							var index=$(this).index();
							contents.eq(index).show().siblings().hide();
							contNo=contents.size();	
						});						
					});		
				}		
				titles.eq(settings.no).trigger("click");
			});
			return this;
		}
	});
})(jQuery);
/*
 * 弹出层
 */
(function($){
	$.fn.extend({
		pop:function(){
			
		}	
	});
})(jQuery);
/*
 * 设置透明度
 */
(function($){
	$.fn.extend({
		opacity:function(value){
			this.css({"filter":"alpha(opacity="+value*100+")","-moz-opacity":value, "-khtml-opacity": value, "opacity": value});
			return this;	
		}		
	});
})(jQuery);
/*
 * 输入框
 */
(function($){
    $.fn.extend({
        textController:function(options){
            var settings={
                inputType:"text",		//默认普通文字输入框
                afterColor:"#000"       //默认改黑色
            },
            $this=this,
            $value=this.val(),
            $color=this.css('color'),
            $type=this.attr('type');
            if(options) {
                $.extend(settings, options);
            }
            return this.each(function(){
                if(settings.inputType=='password'){
                    $this.focusin(function(){
                         $this.addClass('hide').next('input').removeClass('hide').focus().css('color',settings.afterColor);
                    });
                    $this.eq(1).focusout(function(){
                        //alert($this.next().val());
                        if($this.next().val()==''){
                            $this.addClass('hide').prev('input').removeClass('hide');
                        }
                    });
                }else{
                    $this.focusin(function(){
                        if($this.val()==$value){
                            $this.val('').css('color',settings.afterColor);
                        }
                    });
                    $this.focusout(function(){
                        var _$value=$this.val();
                        if(_$value==''){
                            $this.val($value).css('color',$color);
                        }
                    });
                }
            });
        }
    });
})(jQuery);
/*
 * 上下滚动（公告，最新成交）
 */
(function($){
	$.fn.extend({
		roll:function(options){
			var settings={			
				number:1,  //一次切换数量
				delay:3000 //时间间隔
			};				
			if(options) {
				$.extend(settings, options);
			}
			var obj=this; 
			var timer = self.setInterval(_scrollNews,settings.delay);    
			function _scrollNews() {
				var lineHeight = obj.find("li:first").height(); //获取行高
				obj.animate({ "marginTop" : -lineHeight +"px" }, 2000 , function(){
					obj.clearQueue().stop().css('margin-top','0').find("li:lt("+settings.number+")").appendTo(obj); //appendTo能直接移动元素
				});
			}
			obj.hover(function() {
				timer = window.clearInterval(timer);
			}, function() {
				timer = self.setInterval(_scrollNews,settings.delay);
			});
			
		}	
	});
})(jQuery);
/*
 * 左右滚动（分享一刻）
 */
(function($){
	$.fn.extend({
		picture:function(options){
			var settings={
				outWidth:500,//外框宽度					
				eWidth:100,//图片宽度
				eHeight:100,//图片高度
				marg:0,//图片之间的右边距=边框线的宽度+两个图片之间的距离
				eCount:4,	//	显示的图片数量				
				autoPlay:false,//是否轮播
				delay:3000
			};				
			if(options) {
				$.extend(settings, options);
			}
			this.width(settings.outWidth).css("position","relative");
			var childs=this.children();
			var pic=childs.eq(1);
			var leftButton=childs.eq(0);
			var rightButton=childs.eq(2);
			var tempHeight=(settings.eHeight-leftButton.height())/2;
			leftButton.css("top",tempHeight+"px");
			rightButton.css("top",tempHeight+"px");
			var picUl=pic.children().eq(0);
			var size=picUl.children().size();
			var tempWidth=(settings.eWidth+settings.marg)*settings.eCount;
			var totalWidth=(settings.eWidth+settings.marg)*size;
			pic.width(tempWidth).height(settings.height);			
			picUl.width(totalWidth);
			var leftVal=parseInt(picUl.css("margin-left").split("px")[0]);
			var srcPos=leftVal;
            var pageCount = Math.ceil(size/settings.eCount);
            var page = 1;
            var totalMarg = -tempWidth*(pageCount-1);
			//向左
			var _turnLeft=function(){
                if(page >= pageCount) {
                    picUl.animate({'margin-left':'0'+'px'},'fast');
                    page = 1;
                    leftVal=0;
                } else {
                    leftVal =leftVal-tempWidth;
                    picUl.animate({"margin-left":leftVal+"px"},"slow");
                    page++;
                }
//				leftVal=leftVal-tempWidth;
//				if(leftVal<-totalWidth){
//					//leftVal=srcPos;
//
//					if(rightButton.hasClass("picRightValid")){
//						rightButton.removeClass("picRightValid");
//					}
//				}else{
//					picUl.animate({"margin-left":leftVal+"px"},"slow",function(){
//						if(leftVal-tempWidth<-totalWidth){
//							if(leftButton.hasClass("picLeftValid")){
//								leftButton.removeClass("picLeftValid");
//							}
//						}
//						if(leftVal<srcPos){
//							if(!rightButton.hasClass("picRightValid")){
//								rightButton.addClass("picRightValid");
//							}
//						}
//					});
//				}
			};
			//向右
			var _turnRight=function(){
                if(page == 1) {
                    picUl.animate({'margin-left':totalMarg+'px'},'fast');
                    page = pageCount;
                    leftVal=totalMarg;
                } else if(page <= pageCount) {
                    leftVal = leftVal+tempWidth;
                    picUl.animate({"margin-left":leftVal+"px"},"slow");
                    page--;
                }
//				leftVal=leftVal+tempWidth;
//				if(leftVal-tempWidth<-totalWidth){
//					//leftVal=totalWidth%tempWidth-totalWidth;
//				}else{
//					picUl.animate({"margin-left":leftVal+"px"},"slow",function(){
//					if(!leftVal>srcPos){
//						if(leftButton.hasClass("picLeftValid")){
//							//leftButton.removeClass("picLeftValid");
//						}
//						}
//						if(!leftVal>srcPos){
//							if(rightButton.hasClass("picRightValid")){
//								rightButton.removeClass("picRightValid");
//							}
//						}
//					});
//				}
            };
			leftButton.click(_turnLeft);
			rightButton.click(_turnRight);
		}		
	});
})(jQuery);

(function(){
	$.fn.extend({
		limit:function(options){
			var settings={
				startTime:1111,
				lastTime:20,
				hasMs:false
			};				
			if(options) {
				$.extend(settings, options);
			}
			var hour=document.getElementById("hour");
			var minute=document.getElementById("minute");
			var second=document.getElementById("second");
			var qiangDesc=document.getElementById("qiangDesc");
			var desc="";
			var isStart=false;
			var timerId=null;
			function showtime(){
				var now=new Date();		
				var minseconds=now.getTime();				
				var total=lasttime-	minseconds;
				var leftHour,leftMin,leftSec;	
				if(starttime&&lasttime&&starttime<lasttime&&starttime<minseconds){
					leftHour=Math.floor(total/(1000*60*60));
					var totalMinits=total%(1000*60*60);	
					leftMin=Math.floor(totalMinits/(1000*60));
					leftSec=Math.floor((totalMinits%(1000*60))/1000);
					if(leftHour<10){
						leftHour="0"+leftHour;
					}
					if(leftMin<10){
						leftMin="0"+leftMin;
					}
					if(leftSec<10){
						leftSec="0"+leftSec;
					}
					if(total<0||leftSec<0){
						stopClock();
						hour.innerHTML="00";
						minute.innerHTML="00";
						second.innerHTML="00";
						qiangDesc.innerHTML="限时抢购活动已经结束！";
						qiangDesc.style.visibility="visible";
					}else{
						qiangDesc.style.visibility="hidden";
						hour.innerHTML=leftHour;
						minute.innerHTML=leftMin;
						second.innerHTML=leftSec;
						timerId=setTimeout(showtime,1000);
						isStart=true;	
					}		
				}else{
					stopClock();
					hour.innerHTML="00";
					minute.innerHTML="00";
					second.innerHTML="00";
					qiangDesc.innerHTML="抢购活动还没有开始！";
					qiangDesc.style.visibility="visible";
				}	
			}
			function startClock(){
				stopClock();
				showtime();	
			}
			function stopClock(){
				if(isStart){
					clearTimeout(timerId);
					isStart=false;
				}	
			}
			startClock();	
		}
	});
})(jQuery);

/* 全部商品 */
function nav(){		
	var $ul=$("#js_pros .prosUl").eq(0);	
	if($ul&&$ul.size()>0){
		$("#js_pros").hover(function(){
			if($ul.hasClass("hide")){
				$ul.removeClass("hide");
			}
		},function(){
			if(!$ul.hasClass("hide")){
				$ul.addClass("hide");
			}
		});	
		var $div,$a;	
		var lis=$("#js_pros li");
		var $h2=$("#js_pros h2");
		lis.each(function(){
			var temp=$(this).children("table.prosTable");
			if(temp.size()==0){
				$(this).addClass("noChildren");
			}
		});
		lis.hover(function(){
			if(!$(this).hasClass("noChildren")){
				$temp=$(this).children();
				$a=$temp.eq(0);
				$a.addClass("prosAHover");
				$div=$temp.eq(1);
				if($div.size()>0){
					$div.show();
				}
			}
			
		},function(){
			if(!$(this).hasClass("noChildren")){
				if($a.hasClass("prosAHover")){
					$a.removeClass("prosAHover");
				}		
				if($div.size()>0){
					$div.hide();
				}
			}			
		});
	}
	/* 全部商品默认展开 */
	var $ulnohover=$("#js_pross .prosUlnohover").eq(0);	
	if($ulnohover&&$ulnohover.size()>0){
		var $div,$a;	
		var lis=$("#js_pross li");
		var $h2=$("#js_pross h2");
		lis.each(function(){
			var temp=$(this).children("table.prosTable");
			if(temp.size()==0){
				$(this).addClass("noChildren");
			}
		});
		lis.hover(function(){
			if(!$(this).hasClass("noChildren")){
				$temp=$(this).children();
				$a=$temp.eq(0);
				$a.addClass("prosAHover");
				$div=$temp.eq(1);
				if($div.size()>0){
					$div.show();
				}
			}
			
		},function(){
			if(!$(this).hasClass("noChildren")){
				if($a.hasClass("prosAHover")){
					$a.removeClass("prosAHover");
				}		
				if($div.size()>0){
					$div.hide();
				}
			}			
		});
	}
}



//进度条
(function($){
    $.fn.extend({
        uploading:function(options){
            var settings={
                    widths:"145",		//默认宽度
                    sch:"75%"       //默认进度
                },
                $this=$(this);
            if(options) {
                $.extend(settings, options);
            }
            var _relWidth=parseFloat(settings.widths)*parseFloat(settings.sch)/100;
            return this.each(function(){
                $this.find('.sch').css('width',_relWidth+'px');
            });
        }
    });
})(jQuery);
//取消冒泡事件
function stopBubble(e){
    //一般用在鼠标或键盘事件上
    if(e && e.stopPropagation){
        //W3C取消冒泡事件
        e.stopPropagation();
    }else{
        //IE取消冒泡事件
        window.event.cancelBubble = true;
    }
}
/**
 * 评分评价
 */
(function($){
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
})(jQuery);
function cart(){	
	$("#cartInfo").hover(function(){		
		if(!$(this).hasClass("cartHover")){
			$(this).addClass("cartHover");
		}
	},function(){
		if($(this).hasClass("cartHover")){
			$(this).removeClass("cartHover");
		}
	});
}

/**
 * 功能：输入框默认文字
 */
function inputDefault(id){
	var obj=$("#"+id);	
	obj.attr("autocomplete","off");
	var text=$("#"+id).val();			
	obj.focus(function(){				
		if($(this).val()==text){					
			$(this).css("color","#333");			
			$(this).val("");	
		}
			
	});
	obj.blur(function(){			
		if($(this).val()==""){		
			$(this).css("color","#ccc");			
			$(this).val(text);	
		}			
	});
}
/**
 * 功能：输入框label默认文字
 */
function inputLabel(id){
	var obj=$("#"+id);
	var text=$("#"+id).val();			
	obj.focus(function(){				
		$(this).css("color","#333");			
		$(this).prev().hide();
	});
	obj.blur(function(){			
		if($(this).val()==""){		
			$(this).prev().show();	
		}			
	});
}



/*datepicker zh-cn*/
jQuery(function($){
 $.datepicker.regional['zh-CN'] = {
    clearText: '清除',
    clearStatus: '清除已选日期',
    closeText: '关闭',
    closeStatus: '不改变当前选择',
    prevText: '<上月',
    prevStatus: '显示上月',
    prevBigText: '<<',
    prevBigStatus: '显示上一年',
    nextText: '下月>',
    nextStatus: '显示下月',
    nextBigText: '>>',
    nextBigStatus: '显示下一年',
    currentText: '今天',
    currentStatus: '显示本月',
    monthNames: ['一月','二月','三月','四月','五月','六月', '七月','八月','九月','十月','十一月','十二月'],
    monthNamesShort: ['一','二','三','四','五','六', '七','八','九','十','十一','十二'],
    monthStatus: '选择月份',
    yearStatus: '选择年份',
    weekHeader: '周',
    weekStatus: '年内周次',
    dayNames: ['星期日','星期一','星期二','星期三','星期四','星期五','星期六'],
    dayNamesShort: ['周日','周一','周二','周三','周四','周五','周六'],
    dayNamesMin: ['日','一','二','三','四','五','六'],
    dayStatus: '设置 DD 为一周起始',
    dateStatus: '选择 m月 d日, DD',
    dateFormat: 'yy-mm-dd',
    firstDay: 1,
    initStatus: '请选择日期',
    isRTL: false};
    $.datepicker.setDefaults($.datepicker.regional['zh-CN']);
});