/*
画册-预览
*/
(function(){
//edit
var editPage = {
    pictureId: null,
    infoNode: $('#J_pageInfo'),
    rightBarNode: $('#J_rightBar'),
    curPage: -1,
    nextPage: null,
    curPageType: '',
    curPageDir: '',
    contentTxtConf : {text:'',type:'single',width:166,height:26,maxLen:14, customEdit: false},
    pageTypeObj: {frontcover: 'front', backcover: 'back'},
    globalObj: {skin: 'Skin-00', color: '#757575', fontName: 'FONTS_YaHei'},
    thumbSuffix: '_300x333.jpg',
    init: function(){
        var me = this;
        me.initData();
        me.bindHandler();
    },
    initData: function(){		
        var me = this;
        me.pictureId = $('#J_mainEdit').attr('data-id');
        //
        var page = YS.hash();
        me.curPage = page.length>0 ? page : me.curPage;
        //data
        me.initGlobalData();
        me.initPage();
    },
    bindHandler: function(){
        var me = this;
        //cancel
        $('body').click(function(e){     
            var target = $(e.target);
            if(target.hasClass('web-font-loading-mask')){
                return;
            }
            var txt = target.parents('.com-textedit');
            txt = (target.hasClass('com-textedit') || txt.length>0);
            var img = target.parents('.com-clipimg');
            var rightBar = target.parents('.right-bar');
            if( txt || img.length>0 || rightBar.length>0){
                return;
            }
            //cancel
            $('#J_pageInfo').find('.com-textedit.selected').textedit('cancel');
            $('#J_pageInfo').find('.com-clipimg.selected').clipimg('cancel');
        });
        //img
        $('#J_photoList').delegate('li .imgbox','click', function(e){
            var item = $(this);
            if(item.hasClass('photo-add')){
                return;
            }else{
                var imgData = $(this).find('img');
                var imgUrl = imgData.attr('src').replace(me.thumbSuffix,'');
                var data = {
                    url: imgUrl,
                    width: imgData.attr('data-width'),
                    height: imgData.attr('data-height'),
                    wdpi: imgData.attr('data-wdpi'),
                    hdpi: imgData.attr('data-hdpi')
                };
                var imgCom = $('#J_pageInfo').find('.com-clipimg.selected');
                imgCom.clipimg('setImage',data);
            }
        });
        $('#J_photoList').delegate('li .del','click', function(e){
            var item = $(this);
            item.parents('li').css('display','none');
            item.parents('li').addClass('hide');
            me.setPhotoListScroll();
        });
        //add photo
        $('#fileupload').fileupload({
            dataType: 'json',
            url: '/uploadCoverPicture.htm',
            formData: {pictureId: me.pictureId},
            start: function(e, data){
                $('#fileupload').css('display','none');
                me.addPhoto();
            },
            progress: function(e, data){
              var progress = parseInt(data.loaded / data.total * 100, 10);
              me.uploadPhotoProgress(progress);
            },
            fail: function(e, data){
                $('#fileupload').css('display','block');
                me.uploadPhotoError('文件上传失败');
            },
            done: function (e, data) {
                var data = data.result;
                $('#fileupload').css('display','block');
                if(data.result == 'success'){
                    me.uploadPhotoSuccess(data.coverPicture);
                }else{
                    me.uploadPhotoError(data.reason);
                }
            }

        });
        //font
        $('#J_fontSize').change(function(e){
            var size = $(this).val();
            var txt = $('#J_pageInfo').find('.com-textedit.selected');
            txt.textedit('setFontSize',size);
            //check fontLine
            me.checkFontLine(txt);
        });
        $('#J_fontLine').change(function(e){
            var line = $(this).val();
            var txt = $('#J_pageInfo').find('.com-textedit.selected');
            txt.textedit('setLineHeight',line);
        });
        $('#J_fontAlign li').click(function(e){
            if($(this).hasClass('selected')){
                return;
            }
            var align = $(this).attr('class');
            var txt = $('#J_pageInfo').find('.com-textedit.selected');
            txt.textedit('setFontAlign',align);
            //
            $('#J_fontAlign li').removeClass('selected');
            $(this).addClass('selected');
        });
        $('#J_fontColor li').click(function(e){
            if($(this).hasClass('selected')){
                return;
            }
            var color = $(this).attr('data');
            var str = 'normal chapter';
            if(str.match(me.curPageType)){
                me.sendGlobalData('color',color);
            }else{
                var txt = $('#J_pageInfo').find('.com-textedit.selected');
                txt.textedit('setColor',color);    
            }
        });
        $('#J_webFont li').click(function(e){
            if($(this).hasClass('selected')){
                return;
            }
            $('#J_webFont li').removeClass('selected');
            $(this).addClass('selected');
            var fontName = $(this).attr('data-name');
            if(fontName != me.defaultFont){
                me.addWebFontLoading();
            }
            var top = $(e.target).position().top-15;
            $('#J_webFontLoading').css('top',top);
            //
            var str = 'normal chapter';
            if(str.match(me.curPageType)){
                var obj = {fontName: fontName, text:''};
                me.sendGlobalData('font',obj);
            }else{
                var txt = $('#J_pageItem').find('.com-textedit.selected');
                txt.textedit('setWebFont',fontName);
            }
        });
        //template
        $('#J_templateList').delegate('li', 'click', function(e){
            var data = me.getCurPageData();
            data = JSON.stringify(data);
            var method = 'POST';
            var url = '/updatePlate.htm';
            var param = {
                pictureId: me.pictureId,
                plateid: $(this).attr('tid'),
                page: me.curPage,
                config: data
            };
            var successFun = function(data){
                me.turnPageComHandler(data);
                // //clean
                // $('#J_templateList li').removeClass('selected');
                // $(this).addClass('selected');
            }
            YS.ajaxData(method,url,param,successFun);
        });
        //prev|next
        $('#J_pageItem .fliper a').click(function(e){
            var cls = $(this).attr('class');
            var page = me.curPage;
            if(cls == 'prev'){
                page -= 1;
            }else if(cls == 'next'){
                page += 1;
            }
            me.nextPage = page;
            me.turnPage();
            menuBar.selecteMenu();
        });
    },
    initGlobalData: function(){
        var me = this;
        //data
        var method = 'GET';
        var url = '/getGlobalStyle.htm';
        var param = {pictureId: me.pictureId};
        var successFun = function(data){
            var item;
            for(item in data){
                if(data[item]){
                    me.globalObj[item] = data[item];
                    me.setGlobalValue(item, data[item]);
                }
            }
        }
        YS.ajaxData(method,url,param,successFun);
    },
    initPage: function(){
        var me = this;
        //data		
        var method = 'GET';
        var url = '/initPlate.htm';
        var param = {pictureId: me.pictureId, page: me.curPage};
        var successFun = function(data){
            me.turnPageComHandler(data);
        }
        YS.ajaxData(method,url,param,successFun);
    },
    turnPage: function(){
        var me = this;
        //
        var data = me.getCurPageData();
        data = JSON.stringify(data);
        //data
        var method = 'POST';
        var url = '/turnPage.htm';
        var param = {
            pictureId: me.pictureId,
            nextPage: me.nextPage,
            currentPage: me.curPage,
            config: data
        };
        var successFun = function(data){
            me.turnPageComHandler(data);
        }
        YS.ajaxData(method,url,param,successFun);
    },
    turnPageComHandler: function(data){
        var me = this;
        me.curPage = data.curPage.pageNum;
        me.curPageType = data.curPage.pageType;
        YS.hash(me.curPage);
        me.renderPage(data.curPage);
        if(me.curPageType == 'normal'){
            me.renderTemplateList(data.plateList,data.curPage.plateid);
        }
        me.rightBarPageSwitch();
        menuBar.selecteMenu();
    },
    renderPage: function(data){
        var me = this;
        //bg
        var bgCls = '', dirPage = '';
        if(me.curPageType.match('cover')){
            bgCls = me.pageTypeObj[me.curPageType];    
        }else if(me.curPage%2 && me.curPageType != 'copyright'){
            bgCls = 'left';
        }else{
            bgCls = 'right';
            dirPage = 'Hor-R';
        }
        me.curPageDir = bgCls;
        bgCls += '-page';
        $('#J_pageItem').attr('class','item-page '+bgCls);
        //html
        var node = $(data.strhtml);
        node.addClass(dirPage);
        me.infoNode.html('');
        me.infoNode.append(node);
        //global
        node.addClass(me.globalObj.skin);
        node.css('color',me.globalObj.color);
        //com-img
        var imgArr = me.infoNode.find('.com-clipimg');
        me.renderComponent(imgArr, 'img', data);
        //com-txt
        var txtArr = me.infoNode.find('.com-textedit');
        me.renderComponent(txtArr, 'txt', data);
    },
    renderTemplateList: function(arr,selectID){
        var me = this;
        var item, cls;
        var str = '', scls='';
        for(var i=0, len=arr.length; i<len; i++){
            item = arr[i];
            scls = '';
            if(selectID == item.id){
                scls = 'selected';
            }
            str += '<li class="'+item.htmlclass+' '+scls+'" tid="'+item.id+'"></li>';
        }
        $('#J_templateList').html(str);
        //dir
        var cls = '';
        if(me.curPageDir == 'right'){
            cls = 'Hor-R';
        }
        $('#J_templateList').attr('class',cls);
        // console.log(me.curPageDir);
    },
    renderComponent: function(arr, type, data){
        var me = this;
        var item, customData, conf, dataConf;
        for(var i=0, len=arr.length; i<len; i++){
            item = $(arr[i]);
            if(data.config){
                dataConf = $.parseJSON(data.config);
                customData = dataConf[item.attr('data-name')];
                customData = customData ? customData : {};
            }
            conf = me.getConfigData(type, item, customData);
            conf.onSelect = function(data){
                me.cleanSelect();
                me.rightBarShow(type,data);
            };
            conf.onCancel = function(){
                me.rightBarPageSwitch();
            };
            if(type == 'img'){
                conf.thumbSuffix = me.thumbSuffix;
                item.clipimg(conf);
            }else if(type == 'txt'){
                //webfont-global
                var pageType = 'chapter normal';
                if(pageType.match(me.curPageType)){
                    conf.onBlur = function(obj){
                        if(obj.reload){
                            obj.fontName = me.globalObj.fontName;
                            me.sendGlobalData('font',obj);
                        }
                    }
                }
                //config
                var webFontConfig = {
                    url: '/updateCoverNameFont.htm',
                    param: {
                        pictureId: me.pictureId
                    }
                }
                conf.webFontLoad = webFontConfig;
                item.textedit(conf);
            }
        }
    },
    getConfigData: function(type,node,data){
        var me = this;
        var conf;
        if(me.curPageType == 'normal' && type=='txt'){
            conf = me.contentTxtConf;
            conf.text = node.text();
        }else{
            conf = node.attr('data-conf');
            conf = conf.replace(/\'/g, "\"");
            conf = $.parseJSON(conf);
        }
        if(data){
            conf = $.extend(true,{},conf,data);
        }
        return conf;
    },
    getCurPageData: function(){
        var me = this;
        var data = {};
        var typeStr = 'normal chapter frontcover';
        if(typeStr.match(me.curPageType)){
            var txtData = me.infoNode.find('.com-textedit').textedit('getData');
            var imgData = me.infoNode.find('.com-clipimg').clipimg('getData');
            var obj, item, arr = [];
            for(item in imgData){
                obj = {
                    img : imgData[item],
                    txt : txtData[item+'-txt']
                }
                arr.push(obj);
                // console.log(txtData[item],item);
            }
            
            data = $.extend({},txtData, imgData);
            // console.log(arr,data);
        }
        return data;
    },
    cleanSelect: function(){
        var me = this;
        me.infoNode.find('.com-textedit').removeClass('selected');
        me.infoNode.find('.com-clipimg').removeClass('selected');
    },
    rightBarPageSwitch: function(){
        var me = this;
        var cls = '';
        //
        if(me.curPageType == 'normal'){
            cls = 'template-bd';
        }else{
            me.rightBarHide();
        }
        if(cls){
            //init
            me.rightBarNode.css({
                width: 202
            });
            me.rightBarNode.addClass('selected');
            me.rightBarNode.find('.item-bd').removeClass('selected');
            me.rightBarNode.find('.'+cls).addClass('selected');
        }
    },
    rightBarShow: function(type,data){
        var me = this;
        var cls = '';
        var curBd;
        //txt
        if(type == 'txt'){
            cls = 'font-bd';
            curBd = me.rightBarNode.find('.'+cls);
            curBd.find('.font-base').show();
            if(me.curPageType == 'normal' || me.curPageType == 'chapter'){
                curBd.find('.font-base').hide();
                me.rightBarGloabalLoadData();
            }else if(me.curPageType == 'frontcover'){
                me.rightBarLoadData(data);
            }
        }else if(type == 'img'){//img
            if(me.curPageType == 'frontcover'){
                cls = 'photo-bd';
            }
        }
        //show
        if(cls){
            me.rightBarNode.find('.item-bd').removeClass('selected');
            curBd = me.rightBarNode.find('.'+cls);
            curBd.addClass('selected');
            //init show
            var animateTime = 300;
            if(!me.rightBarNode.hasClass('selected')){
                me.rightBarNode.css({
                    width: 0
                });
                me.rightBarNode.find('.item-bd').removeClass('selected');
                me.rightBarNode.addClass('selected');
                me.rightBarNode.animate({
                    width: 202
                },animateTime, function(){
                    curBd.addClass('selected');
                });
            }
        }
    },
    rightBarHide: function(){
        var me = this;
        var animateTime = 300;
        if(!me.rightBarNode.hasClass('selected')){
            return;
        }
        me.rightBarNode.find('.item-bd').removeClass('selected');
        me.rightBarNode.animate({
            width: 0
        },animateTime, function(){
            me.rightBarNode.removeClass('selected');
        });
    },
    rightBarLoadData: function(data){
        var me = this;
        var item = me.rightBarNode.find('.selected');
        //font
        $('#J_fontSize').val(data.fontSize);
        $('#J_fontLine').val(data.lineHeight);
        $('#J_fontAlign li').removeClass('selected');
        $('#J_fontAlign').find('.'+data.fontAlign).addClass('selected');
        $('#J_fontColor li').removeClass('selected');
        $('#J_fontColor li[data="'+data.fontColor+'"]').addClass('selected');
        $('#J_webFont li').removeClass('selected');
        $('#J_webFont li[data-name="'+data.fontName+'"]').addClass('selected');
    },
    rightBarGloabalLoadData: function(){
        var me = this;
        var obj = me.globalObj;
        //color
        $('#J_fontColor li').removeClass('selected');
        $('#J_fontColor li[data="'+obj.color+'"]').addClass('selected');
        //webfont
        $('#J_webFont li').removeClass('selected');
        $('#J_webFont li[data-name="'+obj.fontName+'"]').addClass('selected');
    },
    addPhoto: function(){
        var me = this;
        var addPhotoNode = $('#J_photoList').find('.photo-add');
        //render
        var str = '<li class="uploading">'+
                    '<div class="loading-info">'+
                        '<img src="'+YS.staticDomainbyJs+'/img/index-loading.gif" width="80" />'+
                        '<span class="percent">0%</span>'+
                        '<p class="tip">图片上传中，请稍后</p>'+
                    '</div>'+
                '</li>';
        $(str).insertAfter(addPhotoNode);
        me.setPhotoListScroll();
    },
    uploadPhotoProgress: function(percent){
        var str = percent + '%';
        var item = $('#J_photoList .uploading');
        item.find('.percent').text(str);
    },
    uploadPhotoSuccess: function(data){
        var me = this;
        var item = $('#J_photoList .uploading');
        item.removeClass('uploading');
        item.find('.loading-info').remove();
        //
        var sizeStr = '';
        if(Number(data.width)>Number(data.height)){
            sizeStr = 'width="130"';
        }else{
            sizeStr = 'height="130"';
        }
        //img
        var str = '<span class="del" title="删除"></span>'+
                '<div class="imgbox">'+
                    '<img src="'+data.webpath+me.thumbSuffix+'" '+sizeStr+' data-width="'+data.width+'" data-height="'+data.height+'" data-wdpi="'+data.widthDpi+'" data-hdpi="'+data.heightDpi+'" />'+
                '</div>';
        item.html(str);
    },
    uploadPhotoError: function(errTip){
        var item = $('#J_photoList .uploading');
        item.removeClass('uploading');
        item.addClass('uploaderr');
        var delStr = '<span class="del" title="删除"></span>';
        item.prepend(delStr);
        item.find('.tip').text(errTip);
    },
    setPhotoListScroll: function(){
        var list = $('#J_photoList').parent();
        //
        var hideArr = list.find('li.hide');
        var arr = list.find('li');
        var len = arr.length - hideArr.length;
        if(len==5){
            list.perfectScrollbar({
                wheelSpeed: 100
            });
        }else if(len>5){
            list.perfectScrollbar('update');
        }else{
            list.perfectScrollbar('destroy');
        }
    },
    sendGlobalData: function(type,value){
        var me = this;
        //data
        var method = 'POST';
        var url = '/updateGlobalStyle.htm';
        var param = {pictureId: me.pictureId};
        param[type] = value;
        //font
        if(type == 'font'){
            url = '/updateGlobalFont.htm';
            param.fontName = value.fontName;
            param.fontContent = value.text;
            delete param[type];
            $('#J_webFontLoading').trigger('show');
        }
        var successFun = function(data){
            if(data.result == 'success' || data.status == 'success'){
                if(type != 'font'){
                    me.setGlobalValue(type, value);
                }
            }
            if(type == 'font'){
                value = data;
                me.setGlobalValue(type, value);
            }
        }
        //data
        YS.ajaxData(method,url,param,successFun);
    },
    setGlobalValue: function(type,value){
        var me = this;
        me.globalObj[type] = value;
        var pageItem = $('#J_pageInfo').find('.huace-page');
        //
        if(type == 'skin'){
            if(pageItem.length>0){
                var cls = pageItem.attr('class');
                if(cls.match(/ Skin-\d*/)){
                    cls = cls.replace(/ Skin-\d*/,'');
                }
                cls += ' '+value;
                pageItem.attr('class',cls);    
            }
            //select
            var list = $('#J_leftBar .switch-skin li');
            list.removeClass('selected');
            list.filter('[data="'+value+'"]').addClass('selected');
        }else if(type == 'color'){
            if(pageItem.length>0){
                pageItem.css('color', value);
            }
            //select
            $('#J_fontColor li').removeClass('selected');
            $('#J_fontColor li[data="'+value+'"]').addClass('selected');
        }else if(type == 'font'){
            me.globalObj['fontName'] = value.fontName;
            var fontNames = value.fontName;
            var dataPath = value.eotFontsPath;
            if(fontNames!='FONTS_YaHei'){
                var dataArray=dataPath.split('/');
                    dataArray.pop();
                var Url=dataArray.join('/');
                var newUrl=Url+'/';
                 //fileName
                var filename=dataPath.split('/').pop();
                var filenameArray= filename.split('.');
                var fontFamilyName = fontNames+filenameArray[0].substr(0,15);
                $('#J_pageInfo').fontface({
                    fontName : fontFamilyName,
                    fontFamily : [ fontFamilyName, "Microsoft YaHei, SimSun, helvetica, clean, sans-serif"],
                    filePath : newUrl,
                    fileName : filenameArray[0]
                });
            }else{
                $('#J_pageInfo').css('font-family','Microsoft YaHei, SimSun, helvetica, clean, sans-serif');
            }
            $('#J_webFontLoading').trigger('close');
            //select
            $('#J_webFont li').removeClass('selected');
            $('#J_webFont li[data-name="'+fontNames+'"]').addClass('selected');
        }
    },
    addWebFontLoading: function(){
        var me = this;
        if($('#J_webFontLoading').length>0){
            return;
        }
        var loadingStr = '<div id="J_webFontLoading" class="web-font-loading">'+
                    '<img src="'+YS.staticDomainbyJs+'/img/index-loading.gif" width="30" height="30" />'+
                    '<span>字体加载中，请稍后</span>'+
                '</div>';
        $('#J_webFont').append(loadingStr);
        var maskStr = '<div id="J_webFontLoadingMask" class="web-font-loading-mask"></div>';
        $('body').append(maskStr);
        //bindHandler
        $('#J_webFontLoading').bind('show',function(){
            var mask = $('#J_webFontLoadingMask');
            $(this).show();
            mask.show();
        });
        $('#J_webFontLoading').bind('close',function(){
            var mask = $('#J_webFontLoadingMask');
            $(this).hide();
            mask.hide();
        });
    }
};


//menu
var menuBar = {
    curMenu: null,
    init: function(){
        var me = this;
        me.initData();
        me.bindHandler();
    },
    initData: function(){
        var me = this;
        //
        var method = 'GET';
        var url = '/getDirectory.htm';
        var param = {pictureId: editPage.pictureId};
        var successFun = function(data){
            me.renderMenuBar(data);
            me.selecteMenu();
        }
        YS.ajaxData(method,url,param,successFun);
    },
    bindHandler: function(){
        var me = this;
        $('#J_menuBar').delegate('dt', 'click', function(e){
            $('#J_menuBar dt:not(.selected)').next('dd').removeClass('selected');
            // $(this).next('dd').addClass('selected');
            $(this).next('dd').find('a:first').click();
        });
        $('#J_menuBar').delegate('a' ,'click', function(e){
            e.preventDefault();
            //
            if($(this).hasClass('selected')){
                return;
            }
            var num = $(this).attr('p');
            editPage.nextPage = num;
            editPage.turnPage();
        });
    },
    renderMenuBar: function(data){
        var me = this;
        var list, num;
        var str='';
        for(var i=0, len=data.length; i<len; i++){
            list = data[i].dirList;
            str += '<dt>章'+data[i].topicNum+'</dt>';
            str += '<dd>';
            for(var j=0, jlen=list.length; j<jlen; j++){
                num = list[j];
                str += '<a p="'+num+'"></a>';
            }
            str += '</dd>';
        }
        $('#J_menuBar .chapter-list').html(str);
        //backCover
        num = Number(num)+2;
        $('#J_menuBar .back-cover').attr('p',num);
    },
    selecteMenu: function(){
        var me = this;
        var num = editPage.curPage;
        var type = editPage.curPageType;
        var arr = $('#J_menuBar a');
        var item, curItem;
        for(var i=0, len=arr.length; i<len; i++){
            item = $(arr[i]);
            if(item.attr('p') == num){
                curItem = item;
                break;
            }
            if(type == 'directory'){
                curItem = $(arr[0]);
                break;
            }else if(type == 'copyright'){
                curItem = $(arr[len-2]);
                break;
            }
        }
        if(!curItem){
            return;
        }
        //clean
        arr.removeClass('selected');
        if(me.curMenu){
            me.curMenu.removeClass('selected');
            me.curMenu.parent().removeClass('selected').prev('dt').removeClass('selected');
        }
        curItem.addClass('selected');
        if(!curItem.hasClass('front-cover') || !curItem.hasClass('back-cover')){
            curItem.parent().addClass('selected').prev('dt').addClass('selected');
            me.curMenu = curItem;
        }else{
            me.curMenu = null;
        }
        
    }
};


//other
var otherOpt = {
    titleNode: $('#J_customTitle'),
    leftBar: $('#J_leftBar'),
    gobackURL: '/jumpSelectData.htm',
    loginUrl: '',
    loginStatus: '',
    isMinPage: true,
    isMakeBook: false,
    init: function(){
        var me = this;
        me.initData();
        me.bindHandler();
    },
    initData: function(){
        var me = this;
        me.loginUrl = $('#J_mainEdit').attr('data-login');
        me.loginStatus = $('#J_mainEdit').attr('data-loginStatus');
    },
    bindHandler: function(){
        var me = this;
        //header
        me.titleNode.find('.btns a').click(function(e){
            e.preventDefault();
            var cls = $(this).attr('class');
            var str = 'save close';
            if(!str.match(cls)){
                window.location.href = $(this).attr('href');
                return;
            }
            if(cls == 'save'){
                me.saveDataTipShow('loading');
                //check
                if(me.loginStatus == 'YES'){
                    me.saveDataOnce();
                    return;
                }
                var callbackFun = function(){
                    var obj = {fun: me.savePagesData, param: ''};
                    me.checkLogin(obj);    
                }
                me.saveCurPageData(callbackFun);
                // me.savePagesData();
            }else if(cls == 'close'){
                me.saveDataDialog('close');
            }
        });
        //leftBar
        me.leftBar.find('.opt-btns a').click(function(e){
            e.preventDefault();
            var cls = $(this).parent().attr('class');
            switch(cls){
                case 'edit-directory': me.editDirectory(); break;
                case 'auto-sort': me.autoSort(); break;
                case 'make-book': me.makeBook(); break;
            }
            me.leftBar.find('a')
        });
        me.leftBar.find('.switch-skin li').click(function(e){
            if($(this).hasClass('selected')){
                return;
            }
            var skin = $(this).attr('data');
            editPage.sendGlobalData('skin',skin);
        });
    },
    savePagesData: function(value){
        var me = otherOpt;
        var data = editPage.getCurPageData();
        data = JSON.stringify(data);
        var method = 'POST';
        var url = '/savePicture.htm';
        var param = {
            pictureId: editPage.pictureId
        };
        var successFun = function(data){
            if(data.result == 'success'){
                me.saveDataTipShow('success');
                if(value){
                    window.location.href = value;
                }
            }else{
                me.saveDataTipHide();
                me.saveDataDialog('err');
            }
        };
        YS.ajaxData(method, url, param, successFun);
    },
    saveDataTipShow: function(type){
        var me = this;
        var tip = $('#J_customTitle .tip-status');
        if(tip.length == 0){
            var tipStr = '<div class="tip-status">'+
                            '<i class="arrow"></i>'+
                            '<p><i class="icon"></i><em class="tip-info"></em></p>'+
                        '</div>';
            tip = $(tipStr)
            $('#J_customTitle').append(tip);
        }
        if(type == 'loading'){
            tip.css('display','block');
            tip.attr('class','tip-status loading');
            tip.find('.tip-info').text('正在保存中,请稍后...');
        }else if(type == 'success'){
            tip.attr('class','tip-status success');
            tip.find('.tip-info').text('保存成功');
            var delayTime = 1000;
            setTimeout(me.saveDataTipHide, delayTime);
        }else{
            me.saveDataTipHide();
        }
    },
    saveDataTipHide: function(){
        var tip = $('#J_customTitle .tip-status');
        tip.fadeOut();
    },
    saveDataDialog: function(type){
        var me = this;
        var conf = {cls: 'saveDataTip'};
        if(type == 'err'){//保存失败
            var errConf = {
                cls : conf.cls,
                btn: 'no',
                txt: {'tip-text': '保存失败！', 'tip-note': '请检查您的网路，并尝试重新保存', tips:''}
            }
            YS.tipConfirmDialog.show(errConf);
        }else if(type == 'close'){//关闭
            var closeConf = {
                cls: conf.cls,
                txt: {'tip-text': '确定返回流程页吗？',tips:'如果尚未保存到书架，那您当前编辑的内容会全部丢失。'},
                onsubmit: function(){
                    window.location.href = me.gobackURL;
                }
            }
            YS.tipConfirmDialog.show(closeConf);
        }
    },
    saveCurPageData: function(callback){
        var me = this;
        var data = editPage.getCurPageData();
        data = JSON.stringify(data);
        //data
        var method = 'POST';
        var url = '/savePageInfo.htm';
        var param = {
            pictureId: editPage.pictureId,
            currentPage: editPage.curPage,
            config: data
        };
        var successFun = function(data){
            if(data.result == 'success'){
                callback();    
            }else{
                alert('系统出错');
            }
        };
        YS.ajaxData(method, url, param,successFun);
    },
    editDirectory: function(){
        var me = this;
        var goURL = '/statusPicture.htm?pictureId='+editPage.pictureId;
        var callbackFun = function(){
            // console.log('跳转到目录页');
            window.location.href = goURL;
        };
        me.saveCurPageData(callbackFun);
    },
    autoSort: function(){
        var me = this;
        var checkedStr = me.isMinPage ? 'checked="checked"' : '';
        var minCheckbox = '<label class="agree">'+
                '<input id="J_minPage" type="checkbox" '+checkedStr+'>按最小页数进行重排</label>';
        var conf = {
            cls: 'autoSortDialog',
            txt: {
                title:'一键重排',
                'tip-text': '确定要一键重排吗？',
                tips:'重排后您对该书籍进行过的编辑将一并被重置哦！',
                'tip-note':minCheckbox
            },
            onsubmit: function(){
                var me = otherOpt;
                var signStr = '';
                me.isMinPage = $('#J_minPage').is(':checked');
                if(me.isMinPage){
                    signStr = 'yes';
                }
                //data
                var method = 'POST';
                var url = '/reOrderPlate.htm';
                var param = {
                    pictureId: editPage.pictureId,
                    isLeastOrder: signStr
                };
                var successFun = function(data){
                    editPage.turnPageComHandler(data.initPlate);
                    me.setAlbumPrice(data);
                    menuBar.initData();
                };
                YS.ajaxData(method,url,param,successFun);
            }
        };
        YS.tipConfirmDialog.show(conf);
    },
    makeBook: function(){
        var me = this;
        if(me.isMakeBook){
            return;
        }
        me.isMakeBook = true;
        //check
        var goURL = '/pictureBookDetail.htm?id='+editPage.pictureId;
        if(me.loginStatus == 'YES'){
            var oneceFun = function(){
                var obj = {goURL: goURL};
                me.checkLogin(obj);
            }
            me.saveDataOnce(oneceFun);
            return;
        }
        //data
        var callbackFun = function(){
            var obj = {fun: me.savePagesData, param: goURL};
            me.checkLogin(obj);
        };
        me.saveCurPageData(callbackFun);
    },
    saveDataOnce: function(callback){
        var me = this;
        if(me.loginStatus == 'NO'){
            return;
        }
        var data = editPage.getCurPageData();
        data = JSON.stringify(data);
        //data
        var method = 'POST';
        var url = '/buyPicture.htm';
        var param = {
            pictureId: editPage.pictureId,
            currentPage: editPage.curPage,
            config: data
        };
        var successFun = function(data){
            if(data.result == 'success'){
                me.saveDataTipShow('success');
                callback && callback();
            }
        }
        YS.ajaxData(method,url,param,successFun);
    },
    setAlbumPrice: function(data){
        var me = this;
        var info = me.leftBar.find('.info');
        info.find('.pagenum em').text(data.pageCount);
        info.find('.price em').text(data.price);
    },
    checkLogin: function(obj){
        var me = this;
        if(me.loginStatus == 'YES'){
            if(obj.goURL){
                //console.log('跳转页面');
                window.location.href = obj.goURL;
            }else if(obj.fun){
                //console.log('执行方法');
                obj.fun(obj.param);
            }
        }else{
            me.loginDialog.show();
        }
    },
    loginDialog: {
        isInit: false,
        dialogItem: null,
        html: '<div class="login-box"><h2>请使用以下账号登陆</h2><ul><li class="sina"><a href="/user!loginAction.htm?loginway=sina" title="新浪微博账号"><img src="'+YS.staticDomainbyJs+'/img/sina.jpg" alt="" /></a></li><li class="tencent"><a href="/user!loginAction.htm?loginway=ten" title="腾讯微博账号"><img src="'+YS.staticDomainbyJs+'/img/tencent.jpg" alt="" /></a></li></ul><p class="clearfix">开放端口安全登陆，请放心使用</p></div>',
        init: function(){
            var me = this;
            var closeHandler = function() {
                me.close();
            };
            var content = $(me.html);
            $("body").append(content);
            var dialog = content.dialog({
                autoOpen: false,
                draggable: false,
                modal: true,
                resizable: false,
                width: 440,
                dialogClass: "dialogStyle dialogLogin",
                closeOnEscape: false
            });
            //data
            var callbackStr = '&callBackUrl='+otherOpt.loginUrl;
            var sina = content.find('a:first').attr('href');
            sina += callbackStr;
            content.find('a:first').attr('href',sina);
            var tencent = content.find('a:last').attr('href');
            tencent += callbackStr;
            content.find('a:last').attr('href',tencent);
            //
            me.isInit = true;
            me.dialogItem = dialog;
            me.init = function(){};
        },
        show: function(){
            var me = this;
            if(!me.isInit){
                me.init();
            }
            me.dialogItem.dialog('open');
        },
        close: function(){
            var me = this;
            me.dialogItem.dialog('close');
        }
    }
};




//init
editPage.init();
menuBar.init();
otherOpt.init();


})();