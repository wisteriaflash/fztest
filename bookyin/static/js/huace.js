// JavaScript Document

(function(){
	var layer = {
		fontNode:$('.font li'),
		
		init: function(){
			var me = this;
			me.bindHandler();
			//me.getLayersData();//初始化获取图片和名称
		},
		//初始化获取图片和名称
		/*getLayersData：function(){
			var me = this;
			var method = 'GET';
			var url = '/.htm';
			var param = {bookId: otherOpt.bookId};
			var successFun = function(data){
				//data:版式id，图片id 名字id
				//object={data.id,data.phoneId,data.nameID}
				me.renderLayer(object);
			};
			YS.ajaxData(method,url,param,successFun);
		},
		//渲染页面
		renderLayer:function(object){

		}*/
		bindHandler: function(){
			var me = this;
			//页面操作	
			$('.switch-bar li').hover(function(e){
				$(this).css('background-position-y',-2);
			});
			$('.switch-bar li').mouseleave(function(e){
				$(this).css('background-position-y',-44);
			});
			$('.skin1').hover(function(e){
				$(this).css('background-position-y', -57);
				$(this).css('color','#7fa94f');
			});
			$('.skin2').hover(function(e){
				$(this).css('background-position-y', -90);
				$(this).css('color','#000');
			});
			$('.skin1').mouseleave(function(e){
				$(this).css('background-position-y', 5);
				$(this).css('color','#999');
			});
			$('.skin2').mouseleave(function(e){
				$(this).css('background-position-y', -25);
				$(this).css('color','#999');
			})
			//编辑字体
			me.fontNode.click(function(e){
				//debugger;
				var item=$(this).find('span');
				$('.format-bd ').css('display','none');
				$('.font-bd').css('display','block');
				$('.font').find('input').css('display','none');
				$('.font').find('span').css('display','block');
				item.css('display','none');
				$(this).find('input').css('display','block');
			});
			

		},
	};	
	
	layer.init();
})();

	