(function(){
//
var payBook = {
	curType: 'online',
	init: function(){
		var me = this;
		me.bindHandler();
	},
	bindHandler: function(){
		var me = this;
		$('#J_payType input').change(function(e){
			if(!$(this).prop('checked')){
				return;
			}
			var id = $(this).attr('id');
			if(id == 'J_payOnline'){
				$('#J_payOnlineCon').css('display','block');
				$('#J_storePayCon').css('display','none');
				me.curType = 'online';
			}else if(id == 'J_payStore'){
				$('#J_payOnlineCon').css('display','none');
				$('#J_storePayCon').css('display','block');
				me.curType = 'store';
			}
		});
		//form
		$('#J_payBtn').click(function(e){
			e.preventDefault();
			if(me.curType == 'online'){
				$('#J_payOnlineForm').submit();
			}else if(me.curType == 'store'){
				$('#J_storePayform').submit();
			}
		});
	}
};

//init
payBook.init();

})()
//dialog弹框
$("#dialog").dialog({
      autoOpen: false,
	  title:"输入提示",
	  //model:true,
	  modal: true,
	  width: 450,
	  height: 200,
	  center:true,
	  bgiframe:false,
	  draggable: false,
	  resizable: false,
	  closeOnEscape: false,
	  zIndex: "11"
    });
$("#close").click( function(e){e.preventDefault();$(this).dialog("close");});
var curType = 'online';
	function pay_show(){
		if (pay.pay_way[1].checked) {
				zt.style.display = "";
				zx.style.display = "none";
   			 } else {
				zt.style.display = "none";
				zx.style.display = "";
   			 }
		}
		
	function info(){		
		var way=$('#J_pay input:checked');
		var bank=$('#J_bank input:checked');
		var offline=$('#J_offline input:checked');
		var bankname="";
		var address="";
		var typeCheckedID =$('#J_pay input:checked').attr('id');//获取已经选择项的id
		//debugger;
		
		if (typeCheckedID=='pay_way_0') {
				wayname="在线支付";
				bankname=bank.val();
				//$('#J_bank').submit();
				$('#dialog_con').empty();
				$('#dialog_con').append('<p><span>'+"您选择的支付方式是："+'</span>'+wayname+'<br />'+"付款类型："+bankname+'</p>');
   			 } else {
				address=offline.parent().find('span').text();	
				wayname="门店支付";
				//$('#J_offline').submit();
				$('#dialog_con').empty();
				$('#dialog_con').append('<p><span>'+"您选择的支付方式是："+'</span>'+wayname+'<br />'+"提货地址："+address+'</p>');
   			 }
		}
	$('#J_pay input').change(function(e){
		pay_show();
	});
	$('#submits').click(function(e) {
		e.preventDefault();
		 $("#dialog").dialog("open");
        info();
		
    });