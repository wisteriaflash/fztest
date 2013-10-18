function login(url){
	var back = window.location.href;
	window.location.href = url + "callBackUrl=" + encodeURIComponent(back);
}

function logout(url){
	var back = window.location.href;
	window.location.href = url + "callBackUrl=" + encodeURIComponent(back);
}

function toCart(url){
	window.location.href = url + "/cart!cartListPubAction.htm";
}

function getuserinfo(){
	$.ajax({
		url: "/getuserhead.htm?t=" + new Date().getTime(),
		success:function(data){
			if(data!=""){
				var info = eval ("(" + data + ")");
				$("#userinfo").html(info.head);
				cart();//购物车
			}
		}
	});
}

function getproinfo(){
	$.ajax({
		url: "/getprohead.htm?t=" + new Date().getTime(),
		success:function(data){
			if(data!=""){
				var info = eval ("(" + data + ")");
				$("#proinfo").html(info.pro);
				nav();//网站主导航，全部商品
				
			}
		}
	});
}