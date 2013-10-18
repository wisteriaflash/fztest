// JavaScript Document
$(function () {
    var id = $(".draggable1").length - 1;
    $('#containment').click(function (ev) {
        id = id + 1;
        var mouseX = ev.pageX
        var containment_left = $('#containment').offset().left; //获取底层的相对位置
        var v = Math.round((mouseX - containment_left) / 20);
        var leftValue = (v * 20);
        var dragcount = $('#containment .draggable1').length;
        var left = new Array();
 
        for (var j = 0; j < dragcount; j++) {
            var currentLeft = parseInt($('#containment .draggable1').eq(j).css('left'));
            if (leftValue == currentLeft) {
                id = id - 1;
                return;
            }
        }
        $('#containment').append('<div class="draggable1" data-id="' + id + '" style="left:' + leftValue +
            'px; z-index:10"><span></span><em></em></div>');
        draggableCreate();
        var i = id - 1;
    });
 
});
 
function sortNumber(a, b) {
    return a - b;
}
 
//重置
$('#reset').click(function () {
    //
    $('.draggable1').remove();
    var str ='<div class="draggable1" data-id="0" style="left:0;  z-index:10; display:none "><span>0</span><em></em></div>';
    $('#containment').html(str);
	var totalwidth = parseInt($('#containment').css('width')); //containment的宽度
	var containment_left = $('#containment').offset().left; //获取底层的相对位
	var preleft=parseInt($('#containment .draggable1').eq(0).css('left'));
	var pages_left=totalwidth/2;
	var page=parseInt($('.separatTitle i').html());
	$('#pages').html(page);
	$('#pages').css('left',pages_left);
})
//确定分册
$('#separate').click(function () {
    $('.separation').css('display', 'none');
    $('.separate_success').css('display', 'block');
    separate();
})
//重新分册  
$('#back').click(function () {
 
    $('.separate_success').css('display', 'none');
    $('.separation').css('display', 'block');
})
//保存分册
$('#ok').click(function () {
    $('#J_Form').submit();
    $("#cancel").dialog("close");
})
 
//获取分册信息
 
function separate() {
    var draggable = $('#containment .draggable1');
    var len = draggable.length;
    var year = new Array();
    var month = new Array();
    var pages = new Array();
    var nextmonth = new Array();
    var tatlepages = 0;
    var firstYear = $('.con li:first i').attr('data-id');
    var firstMonth = $('.con li:first em').html();
    var lastYear = $('.con li:last i').attr('data-id');
    var lastMonth = $('.con li:last em').html();
    //遍历年月页保存为数组
    for (var k = 0; k < len - 1; k++) {
 
        var page = parseInt($($('.draggable1 span')[k + 1]).text());
        var left = parseInt($($('.draggable1')[k + 1]).css('left'));
        var index = Math.round(left / 20);
        var Year = $($('.con li i')[index]).attr('data-id');
        var Month = $($('.con li em')[index]).text();
        var nextMonth = $($('.con li em')[index + 1]).text();
        pages[k] = page;
        year[k] = Year;
        month[k] = Month;
        nextmonth[k] = nextMonth;
        tatlepages += pages[k];
    }
 
    var totalPage = parseInt($('.separatTitle span i').html());
    pages[k] = totalPage - tatlepages;
    year[k] = lastYear;
    month[k] = lastMonth;
    //分册显示
    if (pages.length <= 1) {
        str = '<li><span><i>第' + 1 + '册</i><em>' + totalPage + '</em>页</span><div class="time">' + firstYear + '/' +
            firstMonth + '--' + lastYear + '/' + lastMonth + '</div></li>'
    } 
	if (pages.length == 2&&pages[1]==0) {
        str = '<li><span><i>第' + 1 + '册</i><em>' + totalPage + '</em>页</span><div class="time">' + firstYear + '/' +
            firstMonth + '--' + lastYear + '/' + lastMonth + '</div></li>'
    }else {
 
        var str = '<li><span><i>第' + 1 + '册</i><em>' + pages[0] + '</em>页</span><div class="time">' + firstYear + '/' +
            firstMonth + '--' + year[0] + '/' + month[0] + '</div></li>';
        for (var i = 0; i < year.length - 2; i++) {
            str += '<li><span><i>第' + (i + 2) + '册</i><em>' + pages[i + 1] + '</em>页</span><div class="time">' + year[i] +
                '/' + nextmonth[i] + '--' + year[i + 1] + '/' + month[i + 1] + '</div></li>';
        }
        str += '<li><span><i>第' + (i + 2) + '册</i><em>' + pages[i + 1] + '</em>页</span><div class="time">' + year[i] +
            '/' + nextmonth[i] + '--' + lastYear + '/' + lastMonth + '</div></li>';
    }
    //获取地址栏的id值
    $.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
    var Id = $.getUrlParam('id');
    var orderId = parseInt(Id);
    var bookId = $('.separatTitle').attr('data-id');
 
    var allLi = pages.length;
    var firstTime = firstYear + '/' + firstMonth + '--' + year[0] + '/' + month[0];
    var bookSeparate = new Array(); //分册数组
    //第一册
    bookSeparate[0] = {
        bookIndex: 1,
        totalPage: pages[0],
        timeInterval: firstTime
    };
    var m = 0
    if (allLi == 1) {
        bookSeparate[m] = bookSeparate[0] //第一册
    } else {
        //遍历保存第2至倒数第二册
        for (var m = 1; m < allLi - 1; m++) {
            var index = m + 1;
            var page = pages[m];
            var time = year[m - 1] + '/' + nextmonth[m - 1] + '--' + year[m] + '/' + month[m];
            bookSeparate[m] = {
                bookIndex: index,
                totalPage: page,
                timeInterval: time
            };
        }
        //保存最后一册
        var lastTime = year[m - 1] + '/' + nextmonth[m - 1] + '--' + lastYear + '/' + lastMonth;
        bookSeparate[m] = {
            bookIndex: index + 1,
            totalPage: pages[m],
            timeInterval: lastTime
        };
    }
    var bookSeparateObject = JSON.stringify(bookSeparate);
    str += "<form action='/order!saveVolume.htm' method='post'  id='J_Form'>" +
        "<input name='id' type='hidden' value='" + orderId + "' />" +
        "<input name='bookId' type='hidden' value='" + bookId + "' />" +
        "<input name='bookSeparateObject' type='hidden' value='" + bookSeparateObject + "' />" +
        "</form>"
    $('.success ul').html(str);
}
//分册滑动过程
 
function draggableStop(uiItem) {    
    var draggable = uiItem;
    var containment_left = $('#containment').offset().left; //获取底层的相对位置
    var totalwidth = parseInt($('#containment').css('width')); //containment的宽度
    var currentLeft = parseInt(draggable.css('left')); //当前滑块的left值    
    var dragcount = $('#containment .draggable1').length;
    var preLeft = containment_left + parseInt(uiItem.prev().css('left')) + 20;
    var nextLeft = totalwidth + containment_left - 20;
    if (uiItem.next().length == 1) {
        nextLeft = containment_left + parseInt(uiItem.next().css('left')) - 20;
    }
    $('.draggable1').draggable('option', 'containment', [preLeft, 0, nextLeft, 0]);
    var number = currentLeft / 20;
    var left = -(currentLeft - parseInt(uiItem.prev().css('left'))) / 2;
    var countstr = 0;
    var parnum = parseInt(uiItem.prev().css('left')) / 20+1;
	if(uiItem.attr('data-id')==1){
		parnum=parnum-1;
		}
    for (var i = parnum; i <= number; i++) {
        countstr += parseInt($($('.con li span')[i]).text());
    }
    uiItem.find('span').html(countstr);
    uiItem.find('span').css('left', left);
 
    var nextstr = 0;
    var cunnumber = parseInt(uiItem.css('left')) / 20 + 1;
    var nextnumber = parseInt(uiItem.next().css('left')) / 20 ;
    for (var i = cunnumber; i <= nextnumber; i++) {
        nextstr += parseInt($($('.con li span')[i]).text());
    }
    var nextleft = -(parseInt(uiItem.next().css('left')) - currentLeft) / 2;
    (uiItem.next()).find('span').html(nextstr);
    (uiItem.next()).find('span').css('left', nextleft);
    var time = $($('.con li i').eq(cunnumber)).attr('data-id') + '/' + $($('.con li em').eq(cunnumber - 1)).text();
    uiItem.find('em').text(time);
	var pagestotals=0;
	for(var m=1;m<$('#containment .draggable1').length;m++){
		pagestotals += parseInt($('#containment .draggable1').eq(m).find('span').html());
		}
	var prepage=parseInt($('#containment .draggable1').eq(dragcount-1).css('left'));
	var page_left=(totalwidth-prepage)/2+prepage;
	var tpage=parseInt($('.separatTitle i').html());
	$('#pages').html(tpage-pagestotals);
	$('#pages').css('left',page_left);
};
 
 //分册创建过程
 
function draggableCreate() {
    //初始化draggable
    $(".draggable1").draggable({
        // containment: "#containment",     //限制在父系框架中
        scroll: false, //不出现滚动条
        axis: 'x', //限制x轴
        grid: [20, 20], //以一定距离移动
        cursor: 'pointer',
        snap: ".con ul li",
        start: function (event, ui) {
            var uiItem = ui.helper;
            //uiItem.find('span').css('display',none)
        },
        stop: function (event, ui) {
            var uiItem = ui.helper;
            draggableStop(uiItem);
            //uiItem.find('span').css('display',block)         
        }
    });
    var preLeft = 0
    var countstr = 0;
	var draggable=$('#containment .draggable1');
    var dragcount = $('#containment .draggable1').length; //滑块总数
    var totalwidth = parseInt($('#containment').css('width')); //containment的宽度
    var containment_left = $('#containment').offset().left; //滑块能滑到的最左端，也是获取底层的相对位置  
    var rightVlaue = totalwidth + containment_left - 10; //滑块能滑到的最右端
    var tpage=parseInt($('.separatTitle i').html());//总页数
	//debugger;
	var mycars = new Array();
	var myId = new Array()
        //left排序
        for (var i = 0; i < dragcount; i++) {
            var Left = parseInt($('#containment .draggable1').eq(i).css('left'));
            mycars[i] = Left;
            mycars.sort(sortNumber);
        }
		for (var i = 0; i <= dragcount; i++) {
			var id = $('#containment .draggable1').eq(i).attr('data-id');           
			myId[i]=id;
			myId.sort(sortNumber);
        }
		//debugger;
        //排序后的left和id对应
		if($('#containment .draggable1').eq(1).attr('data-id')!=1){
			$('#containment .draggable1').eq(1).attr('data-id',1);			 
		}
		
		 for (var i = 1; i < dragcount; i++) {
			 $('#containment .draggable1').eq(i).attr('data-id',i);
			 $('#containment .draggable1').eq(i).css('left', mycars[i]);
		}			
		
        var leftArray = new Array()
		var prepages=0;
		var a=0;
        for (var i = 1; i < dragcount; i++) {
            var lastLeft = parseInt(draggable.eq(i - 1).css('left'));
            var currentLeft = parseInt(draggable.eq(i).css('left')); 
            var spanLeft = -((currentLeft - lastLeft) / 2);
			if(i==1){
				 a = Math.round(lastLeft / 20)
			}else{
				 a = Math.round(lastLeft / 20) + 1;
				}
            
            var b = Math.round(currentLeft / 20);           
            var aboveTotle = 0;
            for (var j = a; j <= b; j++) {
                aboveTotle += parseInt($($('.con li')[j]).find('span').text());
            }
            $('#containment .draggable1').eq(i).find('span').html(aboveTotle);
            var time = $($('.con li i').eq(b)).attr('data-id') + '/' + $($('.con li em').eq(j - 1)).text();
            $('#containment .draggable1').eq(i).find('em').html(time);
            $('#containment .draggable1').eq(i).find('span').css('left', spanLeft);
			prepages+=aboveTotle;
 
        }
		
		var preleft=parseInt($('#containment .draggable1').eq(i-1).css('left'));
		var pages_left=(totalwidth-preleft)/2+preleft;
		if(tpage==prepages){
			$('#pages').html('');
		}else{
			$('#pages').html(tpage-prepages);
			$('#pages').css('left',pages_left);
		}
		
        //大于两个滑块时设定滑块初始范围区域
		
        for (var i = 1; i < dragcount; i++) {            
            var leftVlaue = containment_left + parseInt($('#containment .draggable1').eq(i - 1).css('left')) + 20;
            var leftdraggable = parseInt($('#containment .draggable1').eq(i).prev().css('left'));
            var lastdraggable = parseInt($('#containment .draggable1').eq(i - 1).css('left'));
            if ($('#containment .draggable1').eq(i).next().length != 0) {
                rightVlaue = containment_left + parseInt($('#containment .draggable1').eq(i + 1).css('left')) - 20;
            }
            $($('.draggable1').eq(i)).draggable("option", "containment", [leftVlaue, 0, rightVlaue, 0]);
            rightVlaue = totalwidth + containment_left - 10;
        }
}
 
//获取书籍页数
 
function getBookpage(e) {
 
    $.getUrlParam = function (name) {
        var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r != null) return unescape(r[2]);
        return null;
    }
    var orderid = $.getUrlParam('id');
    var bookObjet = {};
    bookObjet.bookid = $(e).parents('tr').find('.bookid').text();
    bookObjet.bookname = $(e).parents('tr').find('.bookname').text();
    bookObjet.Time = $(e).parents('tr').find('.bookid').attr('data-id');
    bookObjet.totalPage = $(e).find('em').text();
    var method = 'POST';
    var url = '/order!getBookCatlog.htm';
    var param = {
        bookId: bookObjet.bookid,
        id: orderid
 
    };
    var successFun = function (data) {
        var dataCatlog = data.catlog;
        var dataVolume = data.volume;
        renderTitle(bookObjet);
 
        if (dataVolume.length == 1) {
            var pageStr = getBookpageHtml(dataCatlog);
            var pageItem = $('#J_page ul');
            pageItem.html(pageStr);
        } else {
            var successStr = getBookListHtml(dataVolume);
            var successItem = $('.success ul');
            successItem.html(successStr);
            var pageStr = getBookpageHtml(dataCatlog);
            var pageItem = $('#J_page ul');
            pageItem.html(pageStr);
            $('.separation').css('display', 'none');
            $('.separate_success').css('display', 'block');
        }
 
    }
    YS.ajaxData(method, url, param, successFun);
}
//渲染微博书名字总页数和日期
 
function renderTitle(bookObjet) {
    var html = '<span>书名：' + bookObjet.bookname + '</span><span>总页数：<i>' + bookObjet.totalPage +
        '</i></span><span>日期：<i>' + bookObjet.Time + '</i></span>' +
        '<em>TIPS:  一本书最多装订320页，建议不超过300页。</em>'
    $('.separatTitle').html('');
    $('#containment .draggable1').remove();
    $('#containment').append(
        '<div class="draggable1" data-id="0" style="left:0; z-index:10; display:none "><span></span><em></em></div>');
    $('.separatTitle').html(html);
    $('.separatTitle').attr('data-id', bookObjet.bookid);
	$('#pages').html(bookObjet.totalPage);
}
//渲染书籍页数目录
 
function getBookpageHtml(data) {
    $('.separation').css('display', 'block');
    $('.separate_success').css('display', 'none');
 
    var len = data.length;
    var width = len * 20;
    var str = '';
    var year = 2008;
    $('#containment').css('width', width - 10);
    $('.separat').css('width', width);	
	$('#pages').css('left',width/2);
    for (var i = 0; i < len; i++) {
        var item = data[i];
        var dataYear = data[i].year;
        if (dataYear == year) {
            str += '<li><i data-id="' + item.year + '"></i><em>' + item.month + '</em><span>' + item.totalPage +
                '</span></li>';
        } else {
            str += '<li><i data-id="' + item.year + '">' + item.year + '</i><em>' + item.month + '</em><span>' + item.totalPage +
                '</span></li>';
        }
        year = data[i].year;
    }
    return str;
}
//初始化渲染分册
 
function getBookListHtml(datas) {
    //;
    var str = '';
    var len = datas.length;
    for (var i = 0; i < len; i++) {
        var data = datas[i]
        str += '<li><span><i>第' + data.bookIndex + '册</i><em>' + data.totalPage + '</em>页</span><div class="time">' +
            data.timeInterval + '</div></li>';
    }
    return str;
}