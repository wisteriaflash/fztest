// JavaScript Document
var gloableWidth = 2000;
var gloableWidthf = -2000;
//banner缩放
 
function show() {
    var height = parseInt($(document).height());
    var H = height - 150;
    var W = parseInt($(document).width());
    $('.loading-login').hide();
    $("#index_b_hero").height(H);
    $(".heros").height(H);
    $(".hero").height(H);
    $(".hot-event").height(H);
    $(".hero").height(H);
    $(".hero").width(W);
    gloableWidth = W;
    gloableWidthf = ~W;
    $('.switch-tab a').eq(0).addClass('current')
}
$(window).load(show);
$(window).resize(show);
//banner切换
(function ($) {
    $.extend({
        'foucs': function (con) {
            var $container = $('#index_b_hero'),
                $nav = $container.find('.switch-tab'),
                $imgs = $container.find('li.hero'),
                $leftBtn = $container.find('a.prev'),
                $rightBtn = $container.find('a.next'),
                times = $('.banner ').attr('data-scrolltime'),
                time = times ? times : 3500,
                config = {
                    interval: con && con.interval || time,
                    animateTime: con && con.animateTime || 500,
                    direction: con && (con.direction === 'right'),
                    _imgLen: $imgs.length
                }, i = 0,
                m = $imgs.length,
                getNextIndex = function (y) {
                    return i + y >= config._imgLen ? i + y - config._imgLen : i + y;
                }, getPrevIndex = function (y) {
                    return i - y < 0 ? i - y + config._imgLen : i - y;
                }, silde = function (d) {
                    $nav.find('a:eq(' + (i + 1 === m ? 0 : i + 1) + ')').addClass('current').siblings().removeClass(
                        'current');
                    $imgs.eq((d ? getPrevIndex(1) : getNextIndex(1))).css('left', (d ? gloableWidthf : gloableWidth))
                    $imgs.animate({
                        'left': (d ? '+' : '-') + '=' + gloableWidth
                    }, config.animateTime);
                    i = d ? getPrevIndex(1) : getNextIndex(1);
                }, s = setInterval(function () {
                    silde(config.direction);
                }, config.interval);
            for (var j = 0; j < m; j++) {
                $imgs.eq(j).css('left', j * gloableWidth);
                $nav.append('<a href="#" onclick="return false;" data-slide-index="' + j + '"></a> ')
            };
            $container.find('.hero-wrap').add($leftBtn).add($rightBtn).add($nav).hover(function () {
                clearInterval(s);
            }, function () {
                s = setInterval(function () {
                    silde(config.direction);
                }, config.interval);
            });
            $leftBtn.click(function (e) {
                silde(true);
            });
            $rightBtn.click(function (e) {
                silde(false);
            });
            if (m === 1) {
                $leftBtn.unbind('click');
                $rightBtn.unbind('click')
            }
            $('.switch-tab>a').click(function (e) {
                var pagerLink = $(e.currentTarget);
                var pagerIndex = parseInt(pagerLink.attr('data-slide-index'));
                $nav.find('a:eq(' + pagerIndex + ')').addClass('current').siblings().removeClass('current');
                for (var j = 0; j < m; j++) {
                    var left = (j - pagerIndex) * gloableWidth;
                    if (j - pagerIndex == 0) {
                        $imgs.eq(j).animate({
                            'left': 0
                        }, config.animateTime);
                    }
                    $imgs.eq(j).animate({
                        'left': left
                    }, config.animateTime);
                }
 
                i = pagerIndex;
            });
        }
    });
}(jQuery));
$.foucs({
    direction: 'left'
});