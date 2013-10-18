$(function() {
  //预览弹出层
  $("#preview").dialog({
	title:"预览作品",
	autoOpen:false,
	width:800,
	modal: true
  });
  //预览弹出层
  $(".preview").click(function(){
	$("#preview").dialog("open");
  });
  
  //发货弹出层
  $("#returns").dialog({
	title:"发货设置",
	autoOpen:false,
	width:490,
	modal:true,
	buttons:{
	  "确定":function(){
		var item=validation();
		if(item){
		 $('#formsavePostInfo').submit();
		 alert('操作成功')	
		 $(this).dialog("close");
		} else{
			alert('发货设置失败，信息未填写完整')
			}		
	  },
	  "取消":function(){
		$(this).dialog("close");
	  }
	}
  });
  $("#J_delivery").click(function(){
	$.getUrlParam = function(name){
	var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");   
	var r = window.location.search.substr(1).match(reg);    
	if (r!=null) return unescape(r[2]); return null;    
	}
	 var ID=$.getUrlParam('id');
	$("#returns").dialog("open");
	$("#J_orderid").val(ID);
	
  });
  //查看弹出层
  $("#cancel").dialog({
	title:"发货查看",
	autoOpen:false,
	width:490,
	modal:true,
	buttons:{
	  "确定":function(){
		  $('#formsavePostInfo2').submit();
		$(this).dialog("close");
	  }
	}
  });
  $("#J_cancel").click(function(){
	$.getUrlParam = function(name){
	var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");   
	var r = window.location.search.substr(1).match(reg);    
	if (r!=null) return unescape(r[2]); return null;    
	}
	 var ID=$.getUrlParam('id');
	$("#returns").dialog("open");
	$("#J_orderid").val(ID);
//	$("#cancel").dialog("open");
	getDataInfo();
  });
});
//查看数据绑定
function getDataInfo(){
  $.getUrlParam = function(name){
	var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");   
	var r = window.location.search.substr(1).match(reg);    
	if (r!=null) return unescape(r[2]); return null;    
	}
  var ID=$.getUrlParam('id');

  var me = this;
  me.isPlaying = true;
  var method = 'GET';
  var url = '/delivery!lookOver.htm';
  var param = {id:ID};
  var successFun = function(data){
	if(data.postinfo){
	  me.renderData(data);
	}
  };
  YS.ajaxData(method,url,param,successFun)
}
//查看渲染
function renderData(data){
	
  var mapList=data.list;
  var data=data.postinfo.deliveryInfoList;

  for (var i=0;i<data.length;i++ ){	 
	 
	  $('.deliveryCode')[i].value=data[i].deliveryCode;
	  $('.realdeliveryFee')[i].value=data[i].realDeliveryFee;
	  $('.remark1')[i].value=data[i].remark;
	 
	  var count=$('.realExpressCompany')[i].options.length;
for(var j=0;j<count;j++){
if($('.realExpressCompany')[i].options[j].text == data[i].realExpressCompany)  
{
$('.realExpressCompany')[i].options[j].selected = true;          
break;  
} 
}
	  
  }
  
}
//发货设置验证为空
			
	 var tablelen=$('#formsavePostInfo table').length;	
function Empty(){
	
	  for(var i=0;i<tablelen;i++){	
		  if($($('#formsavePostInfo .realExpressCompany')[i]).find('option:selected').text()=='请选择'){
			  $($('#formsavePostInfo .chooseExpress')[i]).html('请选择快递公司');
			  break;
		  }else{
		  $($('#formsavePostInfo .chooseExpress')[i]).html('');
		  }	
	  
		  if($($('#formsavePostInfo .deliveryCode')[i]).val()==''){
			  $($('#formsavePostInfo .code')[i]).css('display','block');
			  break;
		  }else{
			  $($('#formsavePostInfo .code')[i]).css('display','none');
			  }
			  
		  if($($('#formsavePostInfo .realdeliveryFee')[i]).val()==''){
			  $($('#formsavePostInfo .fee')[i]).css('display','block');
			  break;
		  }else{
			  $($('#formsavePostInfo .fee')[i]).css('display','none');
			  }
		}
	}
	
	function parcel(){
		var item
		for(var i=0;i<tablelen;i++){	
			  var wlgs=$($('#formsavePostInfo .realExpressCompany')[i]).find('option:selected').text();
			  var ydh=$($('#formsavePostInfo .deliveryCode')[i]).val();
			  var yf=$($('#formsavePostInfo .realdeliveryFee')[i]).val();
			  if(wlgs!='请选择'&&ydh!=''&&yf!=''){
				  item=true
			  }else{
				  item=false
			 	  Empty();
			  }
		}
		return item;
	}
function validation(){
	var parameter=true;
	for(var i=0;i<tablelen;i++){ 
	 var item=parcel() 
	 parameter=parameter&&item		  	
		if(!parameter){				  
			break;
			}
		}	
	return parameter;
}
