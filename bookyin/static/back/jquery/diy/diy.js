//热卖推荐部分
function hotSale() {
	$('#js_hsl').addClass('hsl_selected').children('.tag').addClass('tag_selected');
	$('#js_pic').show();
	$('.hsl').each(function() {
		$(this).click(function() {
			$(this).addClass('hsl_selected').children('.tag').addClass('tag_selected').end().next(".hsl_goods").slideToggle().siblings('.hsl_goods').hide().end().prev('.hsl').siblings('.hsl').removeClass('hsl_selected').children('.tag').removeClass('tag_selected');
		});
	});
}


//个性列表页的tab标签
function tabClick() {
	$('.tab_name').each(function() {
		$(this).click(function() {
			$(this).addClass('tab_checked').siblings('.tab_name').removeClass('tab_checked');
		})
	})
}
//图片浏览按钮效果
function btnClick() {
	$('.picLeft').click(function() {
if(!$(this).hasClass('picLeftValid')) {
            $(this).removeClass('picLeft_bg').addClass('picLeft_checkedbg');
        } else {
            $(this).removeClass('picLeft_checkedbg').addClass('picLeft_bg');
        }
		});
    $('.picRight').click(function() {
        if(!$(this).hasClass('picLeftValid')) {
            $(this).removeClass('picRight_bg').addClass('picRight_checkedbg');
        } else {
            $(this).removeClass('picRight_checkedbg').addClass('picRight_bg');
        }
    });

}
