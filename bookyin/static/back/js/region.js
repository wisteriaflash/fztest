 // JavaScript Document
//province
$('#J_province').change(function (e) {
    var id = $(this).find('option:selected').attr('value');
    getRegionData('city', id);
});
$('#J_province').change(); 
//提交按钮
$('.btn2').click(function () {	
	 $.getUrlParam = function(name){
		var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");		
		var r = window.location.search.substr(1).match(reg);		
		if (r!=null) return unescape(r[2]); return null;		
		}
	 var expressId=$.getUrlParam('expressId');
	 var cityId=$('#J_city option:selected').val();
    getInfoData(cityId,expressId);
})
//获取地区
 
function getRegionData(type, id) {
    var method = 'POST';
    var url = '/delivery!getAreabyParentId.htm';
    var param = {
        parentId: id
    };
    var successFun = function (data) {
        data = data.childAreaDOList;
        var str = getRegionHtml(data);
        var item = $('#J_' + type);
        item.html(str);
    }
    YS.ajaxData(method, url, param, successFun);
}
//渲染地区
 
function getRegionHtml(data) {
    var len = data.length;
    var str = '';
    for (var i = 0; i < len; i++) {
        var item = data[i];
        str += '<option value="' + item.id + '">' + item.name + '</option>';
    }
    return str;
}
//获取信息
function getInfoData(cityId,expressId){
	 var method = 'POST';
     var url = '/delivery!serachCostExpress.htm';
     var param = {
        cityId: cityId,	
		expressId:expressId		
     };
    var successFun = function (data) {
        data = data.costExpressList;
        var str = getInfoHtml(data);
        var content =$('#J_logistics').find('#J_body');
        content.html(str);
		
    }
    YS.ajaxData(method, url, param, successFun);
	
}
function getInfoHtml(data){
	 var len = data.length;
    var str = '';
    for (var i = 0; i < len; i++) {
        var List = data[i];
        str += '<tr><td>'+List.areaname+'</td><td>'+List.weight+'</td><td>'+List.price+'</td><td>'+List.nextweight+'</td><td>'+List.nextprice+'</td></tr>';
    }
    return str;
}