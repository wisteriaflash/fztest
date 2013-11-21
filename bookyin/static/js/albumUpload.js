/*
画册-图片上传
//test
http://www.chushuba.com/statusPicture.htm?pictureId=1000010342k
*/ 
(function(){

//upload
var upload = {
    status: 'no-upload', //no-upload|uploading|upload-ok
    uploadType: 'pic', //pic|zip
    stepDelay: 2000,
    pictureId: null,
    bookinToken: null,
    selectArr: [],
    init: function(){
        var me = this;
        me.initData();
        me.bindHandler();
    },
    initData: function(){
        var me = this;
        me.pictureId = $('#J_mainview').attr('data-id');
        me.bookinToken = $.cookie('BOOKYIN_TOKEN');
        //data
        var method = 'GET';
        var url = '/initPicture.htm';
        var param = {pictureId: me.pictureId};
        var successFun = function(data){
            chapter.picTotalNum = data.pictureSum;
            chapter.initRender(data);
            //
            if(data.pictureSum>0){
                me.status = 'upload-ok';
            }else{
                me.status = 'no-upload';
            }
            me.changeStatus();
        }
        YS.ajaxData(method,url,param,successFun);
    },
    bindHandler: function(){
        var me = this;
        //addPic
        $('#J_addPic').uploadify({
            'uploader': 'http://static.chushuba.com/js/plugin/uploadify/v2.1/uploadify.swf',
            'script': 'http://www.chushuba.com/uploadPicture.htm',
            'scriptData': {pictureId: me.pictureId, BOOKYIN_TOKEN:  me.bookinToken},
            'fileDataName': 'pictureFile',
            'fileDesc': 'Image Files',//对话框的文件类型描述
            'fileExt': '*.jpg;*.jpeg;*.gif;*.png',//可上传的文件类型
            'auto': true,
            // 'auto': false,
            'multi': true,
            'folder': '/uploads',
            'simUploadLimit': 3,
            'width': 190,
            'height': 57,
            'hideButton': true,
            'wmode': 'transparent',
            'scriptAccess': 'always',
            'queueID': 'J_picUploadQueue',
            'sizeLimit': '10485760',//10MB,上传文件的大小，单位byte
            onSelect: function(event, id, file){
                // console.log(file);
            },
            onSelectOnce: function(event, file, data){
                me.uploadType = 'pic';
                me.setUploadTypeQueue();
                //
                me.status = 'uploading';
                me.changeStatus();
                var obj = {count: file.fileCount, size: file.allBytesTotal};
                me.setUploadNum(true,obj);
            },
            onProgress: function(event, id, file, data){
                // console.log(data);
            },
            onError: function(event, file){
                // console.log(event,file);
                alert('err');
            },
            onComplete: function(event,id, file, response, data){
                var speed = data.speed*1024;
                var obj = {speed: speed, size:file.size};
                me.setUploadNum(false, obj);
            },
            onAllComplete: function(event,file){
                chapter.getPicData();
                //
                setTimeout(function(){
                    var me = upload;
                    me.status = 'upload-ok';
                    me.changeStatus();
                    me.cleanUploadTypeQueue();
                    me.cleanUploadNum();
                }, me.stepDelay);
            }
        });
        //addZip
        $('#J_addZip').uploadify({
            'uploader': 'http://static.chushuba.com/js/plugin/uploadify/v2.1/uploadify.swf',
            'script': 'http://www.chushuba.com/uploadCompressedFile.htm',
            'scriptData': {pictureId: me.pictureId,BOOKYIN_TOKEN:  me.bookinToken},
            'fileDataName': 'pictureFile',
            'fileDesc': 'Image Files',
            'fileExt': '*.zip;*.rar',
            'auto': true,
            'width': 190,
            'height': 57,
            'hideButton': true,
            'wmode': 'transparent',
            'scriptAccess': 'always',
            'queueID': 'J_zipUploadQueue',
            'sizeLimit': '209715200',//200MB,上传文件的大小，单位byte
            onSelect: function(event, id, file){
                me.uploadType = 'zip';
                me.setUploadTypeQueue();
                //
                me.status = 'uploading';
                me.changeStatus();
            },
            onProgress: function(event,file){
                // console.log();
            },
            onComplete: function(event, id, file, response){
                var data = jQuery.parseJSON(response);
                chapter.picTotalNum = data.sum;
                chapter.renderChapterList(data.tplist);
                //limit
                if(chapter.picTotalNum<chapter.picMaxNum){
                    me.disableUpload(false);
                }
                //
                setTimeout(function(){
                    var me = upload;
                    me.status = 'upload-ok';
                    me.changeStatus();
                    me.cleanUploadTypeQueue();
                    me.cleanUploadNum();
                }, me.stepDelay);
                
            }
        });
    },
    changeStatus: function(){
        var me = this;
        var mainview = $('#J_mainview');
        var items = mainview.find('.upload-item');
        items.removeClass('selected');
        var curItem = mainview.find('.'+me.status);
        curItem.css('opacity',0);
        curItem.addClass('selected');
        curItem.animate({
            opacity: 1
        },500);
        if(me.status == 'uploading'){
            me.disableUpload(true);
        }else{
            me.disableUpload(false);
            
        }
    },
    disableUpload: function(disable){
        var me = this;
        var style = disable ? '-9999px' : '0';
        $('#J_addPicUploader').css('left', style);
    },
    setUploadNum: function(totalNumSign,obj){
        var me = this;
        var tips = $('#J_uploading .tips');
        if(totalNumSign){
            tips.find('.totle-num').text(obj.count);
            tips.attr('data-size',obj.size);
            var time = (obj.count*30)/60;//默认初始用30s/图来计算
            tips.find('.time').text(time);
        }else{
            var num = Number(tips.find('.uploaded-num').text())+1;
            tips.find('.uploaded-num').text(num);
            var totleSize = Number(tips.attr('data-size'));
            totleSize -= obj.size;
            tips.attr('data-size', totleSize);
            var time = totleSize/obj.speed;
            time = Math.ceil(time/60);
            tips.find('.time').text(time);
        }
    },
    cleanUploadNum: function(){
        var me = this;
        var tips = $('#J_uploading .tips');
        tips.find('.uploaded-num').text(0);
        tips.find('.totle-num').text(0);
        tips.find('.time').text('XX');
        tips.attr('data-size', 0);
    },
    setUploadTypeQueue: function(){
        var me = this;
        var type = me.uploadType;
        //switch
        $('#J_uploading .uploading-item').removeClass('selected');
        $('#J_uploading .uploadify-'+type).addClass('selected');
    },
    cleanUploadTypeQueue: function(){
        var me = this;
        $('#J_uploading .uploadify-queue').html('');
    }
    
}
//chapter
var chapter = {
    pictureId: null,
    picTotalNum: 0,
    picMinNum: 20,
    picMaxNum: 200,
    curChapterNum: 0,
    chapterMaxNum: 15,
    chapterData: {},
    thumbSuffix: '_134x134.jpg',
    init: function(){
        var me = this;
        me.bindHandler();
        me.initData();
    },
    initData: function(){
        var me = this;
        me.pictureId = $('#J_mainview').attr('data-id');
    },
    initSelect: function(){
        var me = this;
        $('#J_picListCon .pics-list:first').addClass('selected');
        $('#J_chapterHdList li:not(.add-chapter)').eq(0).addClass('selected');
    },
    initRender: function(data){
        var me = this;
        me.picTotalNum = data.pictureSum;
        me.renderChapterList(data.piclistbytopic);
        me.checkChapterDel();
        me.checkChapterHdNum();
    },
    bindHandler: function(){
        var me = this;
        //droppable
        me.dropBindHandler($('#J_chapterHdList li:not(.add-chapter)'));
        //chapter
        $('#J_chapterHdList').delegate('li:not(.add-chapter)', 'click', function(e) {
            var target = $(e.target);
            if($(this).hasClass('selected')){
                return;
            }
            var item = $(this);
            me.switchChapter(item);
        });
        $('#J_chapterHdList').delegate('.del', 'click', function(e) {
            e.stopPropagation();
            var item = $(this).parents('li');
            var config = {
                cls: 'deletChapter',
                onsubmit: function(){
                    me.delChapter(item);
                },
                txt : {title:'删除章节', 'tip-text': '确定删除该章节吗？', tips:'章节中的图片和文字信息将会被一并删除。'}
            }
            YS.tipConfirmDialog.show(config);
        });
        $('#J_chapterHdList .add-chapter').click(function(e){
            var conf = {sign: 'add'};
            me.chapterNameDialog.show(conf);
        });
        $('#J_chapterHdList').delegate('.title', 'click', function(e){
            e.stopPropagation();
            var conf = {
                sign: 'edit',
                txt: $(this).text(),
                item: $(this)
            };
            me.chapterNameDialog.show(conf);
        });
        $('#J_chapterHdList').sortable({
            items: "li:not(.add-chapter)",
            revert: true,
            scroll: false,
            appendTo: '#J_chapterList',
            stop: function(event, ui){
                // console.log('aaa');
            }
        });
        //piclist
        $('#J_picListCon').delegate('li .del', 'click', function(e){
            //delPic
            var target = $(this).parents('li');
            var data = target.data();
            var method = 'POST';
            var url = '/deletePic.htm';
            var param = {
                pictureId: me.pictureId,
                path: data.webpath,
                date: data.lastTime
            };
            var successFun = function(data){
                if(data.result == 'success'){
                    var chapter = $('#J_chapterHdList .selected');
                    me.picTotalNum = data.sum;
                    me.setChapterNum(chapter, 1, 'del');
                    target.remove();
                    me.setChapterCover();
                    me.checkPicsHd();
                    //limit
                    if(me.picTotalNum<me.picMaxNum){
                        upload.disableUpload(false);
                    }
                }else{
                    alert('删除图片失败');
                }
            };
            YS.ajaxData(method,url,param,successFun);
        });

        $('#J_picListCon').delegate('li .set-chapter-cover', 'click', function(e){
            var item = $(this).parents('li');
            me.setChapterCover(item);
        });
    },
    dropBindHandler: function(els){
        var me = this;
        els.droppable({
            accept: '#J_picListCon li',
            hoverClass: 'drop-pic-hover',
            drop: function(event, ui){
                if($(this).hasClass('selected')){
                    return
                }
                var arr = me.getSelectedPics();
                me.addPicToChapter($(this),arr,'node');
                me.setChapterCover();
            }
        });
    },
    picListBindHandler: function(){
        var me = this;
        // upload-ok
        $('#J_picListCon ul').selectable({
            cancel: ".hd-item,i,.ui-selecting,.ui-selected",
            selected: function( event, ui ) {
            },
            selecting: function(event, ui) {
            },
            stop: function( event, ui ) {
            }
        });
        me.dragBindHandler($('#J_picListCon ul li'));
    },
    dragBindHandler: function(els){
        els.draggable({//这种selector无法点击选取元素，暂不修复
            cancel: ".hd-item",
            scroll: false,
            cursorAt: { left: 60, top: 60 },
            helper: function(){
                return '<div></div>';
            },
            start: function( event, ui ) {
                //render helper
                var arr = $('#J_picListCon .selected li.ui-selected:not(.hd-item)');
                if(arr.length == 0 || !$(this).hasClass('ui-selected')){
                    ui.helper.html('');
                    return;
                }
                var item,imgItem,position;
                var container = $('<div class="clone-pic"></div>');
                var num = $('<i class="num">'+arr.length+'</i>');
                var coverbg = $('<div class="coverbg"><span></span></div>');
                container.append(num);
                container.append(coverbg);
                var target = $(this);
                var topCon = $.browser.msie ?  $(document).scrollTop() : 0;
                for(var i=0, len=arr.length; i<len; i++){
                    item = $(arr[i]);
                    imgItem = item.find('img').clone();
                    imgItem.css({
                        left: item.offset().left-target.offset().left,
                        top: item.offset().top-target.offset().top,
                        position: 'absolute',
                        'z-index': 5
                    });
                    //target
                    if(item.offset().left == target.offset().left && item.offset().top == target.offset().top){
                        imgItem.css({
                            'z-index':99
                        });
                        imgItem.addClass('targetImg');
                    }
                    //add
                    container.append(imgItem);
                }
                var targetImg = target.find('img');
                //num
                num.css({
                    left : targetImg.width()-15
                });
                //cover
                coverbg.css({
                    width: targetImg.width()+4,
                    height: targetImg.height()+4
                });
                coverbg.find('span').css({
                    width: targetImg.width()+2,
                    height: targetImg.height()+2
                });
                //container
                container.css({
                    position: 'relative',
                    top: -topCon
                })
                //data
                ui.helper.data.animMove = false;
                ui.helper.html('');
                ui.helper.css({'z-index': 99});
                ui.helper.append(container);
            },
            drag: function( event, ui ) {
                var helper = ui.helper;
                if(!helper.data.animMove){
                    helper.data.animMove = true;
                    ui.helper.find('img').animate({
                        left: 0,
                        top: 0
                    },300, function(){
                        helper.find('img:not(.targetImg)').remove();
                    });
                }
            }
        });
    },
    getDateObj: function(str){
        var obj;
        //ex:2013.09.22
        if(str.length>8){
            var arr = str.split('.');
            obj = {
                year: Number(arr[0]),
                month: Number(arr[1]),
                day: Number(arr[2])
            }
        }else{//ex:20130922
            obj = {
                year: Number(str.substr(0,4)),
                month: Number(str.substr(4,2)),
                day: Number(str.substr(6,2))
            };
        }
        return obj;
    },
    getDateStr: function(str){//ex:20130922
        var arr = [
            str.substr(0,4),
            str.substr(4,2),
            str.substr(6,2)
        ];
        return arr.join('.');
    },
    getPicData: function(){
        var me = this;
        var method = 'GET';
        var url = '/getAllPictureInfo.htm';
        var param = {pictureId: me.pictureId};
        var successFun = function(data){
            var chapter = $('#J_chapterHdList .selected');
            if(chapter.length == 0){//无章节时
                var conf = {
                    sign: 'add',
                    txt: '默认章节'
                }
                me.renderChapterItem(conf);
                me.initSelect();
                chapter = $('#J_chapterHdList .selected');
            }
            var arr = data.piclist;
            me.addPicToChapter(chapter,arr,'data');
            me.picTotalNum = data.sum;
            me.setChapterNum(chapter,arr.length,'add');
            me.setChapterCover();
            //limit
            if(me.picTotalNum>=me.picMaxNum){
                upload.disableUpload(true);
            }
        };
        YS.ajaxData(method, url, param, successFun);
    },
    insertPicToDate: function(list, node){
        var me = this;
        var dateArr = list.find('.hd-item');
        var data = node.data();
        var picDate = data.lastTime.replace('/\./g','');
        var item,itemDateObj;
        var curDate;
        //
        for(var i=0, len=dateArr.length; i<len; i++){
            item = $(dateArr[i]);
            itemDate = item.find('h4').text().replace('/\./g','');
            if(picDate<itemDate){//prev
                curDate = {sign: 'prev',node:item};
                break;
            }else if(picDate==itemDate){//now
                curDate = {sign:'now',node:item}
                break;
            }else if(i==len-1){//next
                curDate = {sign: 'next', node:item}
            }
        }
        if(len == 0){
            curDate = {sign: 'null', node:list};
        }
        //render
        var curHdNode = curDate.node;
        var cls = curHdNode.attr('class').match(/hd-date\d{8}/);
        var lastNode = curHdNode.parent().find('.'+cls+':last');
        //
        if(curDate.sign == 'now'){
            node.insertAfter(lastNode);
        }else{
            var hdNode = me.getDateItemNode(data.lastTime);
            if(curDate.sign == 'prev'){
                hdNode.insertBefore(curHdNode);
                node.insertBefore(curHdNode);
            }else if(curDate.sign == 'next'){
                node.insertAfter(lastNode);
                hdNode.insertAfter(lastNode);
            }else if(curDate.sign == 'null'){
                var listUL = $('<ul class="cf"></ul>');
                list.append(listUL);
                listUL.append(hdNode);
                listUL.append(node);
            }
        }
    },
    renderChapterList: function(arr,init){
        var me = this;
        var picListNode = $('#J_picListCon');
        var item, itemData, cid;
        for(var i=0,len=arr.length; i<len; i++){
            cid = me.curChapterNum+1;
            me.curChapterNum = cid;
            item = me.getChapterBdItem(cid);
            picListNode.append(item);
            //piclist
            itemData = arr[i];
            me.renderPicList(itemData, item);
            me.renderChapterHd(itemData,cid);
        }
        //
        me.initSelect();
        me.picListBindHandler();
    },
    renderChapterHd: function(data,cid){
        var me = this;
        var num = me.getChapterBd(cid).find('.pic-item').length;
        var node = me.getChapterHdItem(cid, num, data.topicName);
        var addNode = $('#J_chapterHdList .add-chapter');
        node.insertBefore(addNode);
        me.dropBindHandler(node);
    },
    renderPicList: function(data,list){
        var me = this;
        var dateArr = data.piclistbydate;
        var listCon = $('<ul class="cf"></ul>');
        var cover = data.topicPicture.webpath;
        var itemData, itemNode, picData, picNode, picArr;
        //render
        for(var i=0, len=dateArr.length; i<len; i++){
            itemData = dateArr[i];
            itemNode = me.getDateItemNode(itemData.date);
            listCon.append(itemNode);
            //picList
            picArr = itemData.piclist;
            for(var j=0, jlen=picArr.length; j<jlen; j++){
                picData = picArr[j];
                picNode = me.getPicItemNode(picData);
                //cover
                if(cover && picData.webpath == cover){
                    picNode.addClass('chapter-cover');
                    cover = '';
                }
                listCon.append(picNode);
            }
        }
        //add
        list.append(listCon);
    },
    getChapterHdItem: function(cid, num, name){
        var node = $('<li data-chapter="'+cid+'"><i class="num">'+num+'</i><span class="del"><i></i></span><h5 class="title">'+name+'</h5></li>');
        return node;
    },
    getChapterBdItem: function(cid){
        var node = $('<div data-chapter="'+cid+'" class="pics-list"></div>');
        return node;
    },
    getDateItemNode: function(date){
        var dateCls = date.replace(/\./g,'');
        var node = $('<li class="hd-item hd-date'+dateCls+'"><h4>'+date+'</h4><span class="line"></span></li>');
        return node;
    },
    getPicItemNode: function(data){
        var me = this;
        var node='', sizeStr='', limitSize = 130;
        var dateCls = data.lastTime.replace(/\./g,'');
        if(data.width>data.height){
            sizeStr = 'width="'+limitSize+'"';
        }else{
            sizeStr = 'height="'+limitSize+'"';
        }
        node = $('<li class="pic-item hd-date'+dateCls+'"><i class="choose"></i><i class="del"></i>'+
                '<div class="imgbox">'+
                    '<i class="icon-chapter-cover">本章封面</i>'+
                    '<img src="'+data.webpath+me.thumbSuffix+'" alt="'+data.fileName+'" '+sizeStr+' />'+
                '</div>'+
                '<span class="set-chapter-cover">设为章节封面</span>'+
            '</li>');
        node.data(data);
        return node;
    },
    getSelectedPics: function(){
        var me = this;
        var arr = $('#J_picListCon li.ui-selected:not(.hd-item)');
        return arr;
    },
    setChapterCover: function(item){
        var me = this;
        var list = $('#J_picListCon .pics-list').filter('.selected');
        if(!item && list.find('.chapter-cover').length>0){
            return;
        }
        list.find('.pic-item').removeClass('chapter-cover');
        if(!item){
            item = list.find('.pic-item:first');
        }
        item.addClass('chapter-cover');
    },
    setChapterNum: function(chapterItem,num,sign){
        var numItem = chapterItem.find('.num');
        var curNum = parseInt(numItem.text());
        if(sign == 'add'){
            num = curNum + num;
        }else{
            num = curNum - num;
        }
        numItem.text(num);
    },
    getChapterBd: function(chapter){
        var cid;
        if(chapter.attr){
            cid = chapter.attr('data-chapter');
        }else{
            cid = chapter;
        }
        var bd = $('#J_picListCon .pics-list[data-chapter="'+cid+'"]');
        return bd;
    },
    addPicToChapter: function(moveChapter, arr, sign){
        var me = this;
        var curChapter = $('#J_chapterHdList .selected');
        var chapter;
        if(sign == 'node'){
            var num = arr.length;
            me.setChapterNum(curChapter, num, 'del');
            //move
            me.setChapterNum(moveChapter, num, 'add');
            chapter = moveChapter;
        }else if(sign == 'data'){
            chapter = curChapter;
        }
        var list = me.getChapterBd(chapter);
        me.mergePicsData(list, arr, sign);
        me.checkPicsHd();
    },
    mergePicsData: function(list, arr, sign){
        var me = this;
        //
        var item,node;
        for(var i=0, len=arr.length; i<len; i++){
            item = arr[i];
            if(sign == 'node'){
                var data = $(item).data();
                data = me.cleanPicData(data);
                node = me.getPicItemNode(data);
                $(item).remove();
            }else{
                node = me.getPicItemNode(item);
                node.data(item);
            }
            me.insertPicToDate(list, node);
        }
        me.picListBindHandler();
    },
    renderChapterItem: function(obj){
        var me = this;
        var hd,bd;
        //
        if(obj.sign == 'add'){
            //hd
            me.curChapterNum += 1;
            hd = me.getChapterHdItem(me.curChapterNum, 0, obj.txt);
            var addChapter = $('#J_chapterHdList .add-chapter');
            hd.insertBefore(addChapter);
            me.dropBindHandler(hd);
            //bd
            bd = me.getChapterBdItem(me.curChapterNum);
            $('#J_picListCon').append(bd);
            //check
            me.checkChapterHdNum();
        }else if(obj.sign == 'edit'){
            obj.item.text(obj.txt);
        }
    },
    checkChapterHdNum: function(){
        var me = this;
        var chapterNum = $('#J_chapterHdList li').length;
        var addChapter = $('#J_chapterHdList .add-chapter');
        if(chapterNum>me.chapterMaxNum){
            addChapter.hide();
        }else{
            addChapter.show();
        }
        //setWidth
        me.setChapterHdHeight();
    },
    setChapterHdHeight: function(){
        var me = this;
        var chapterNum = $('#J_chapterHdList li').length;
        var itemW = 147, itemH = 110;
        var lineItemNum = parseInt($('body').width()/itemW);
        var lineNum = Math.ceil(chapterNum/lineItemNum);
        var sh = (lineNum)*itemH;
        //
        var chapterBar = $('#J_chapterHdList ul');
        chapterBar.css('height',sh);
        //scroll
        me.setChapterHdWidthScroll();
    },
    setChapterHdWidthScroll: function(){
        var me = this;
        var itemH = 110;
        var chapterHdList = $('#J_chapterHdList');
        var chapterCon = $('#J_chapterHdList ul');
        //
        if(chapterCon.height()>110){
            chapterHdList.perfectScrollbar('destroy');
            chapterHdList.perfectScrollbar({
                wheelSpeed: 110
            });
        }
        else{
            chapterHdList.perfectScrollbar('destroy');
        }
    },
    delChapter: function(item){
        var  me = this;
        var bd = me.getChapterBd(item);
        //data
        var picList = bd.find('.pic-item');
        if(picList.length == 0){
            me.delChapterItem(item, bd);
            return;
        }
        //
        var list = [], picItem;
        for(var i=0, len=picList.length; i<len; i++){
            picItem = $(picList[i]);
            list.push(picItem.data().webpath);
        }
        var listData = JSON.stringify(list);
        //del
        var method = 'POST';
        var url = '/batchDeletePic.htm';
        var param = {pictureId: me.pictureId, pathList: listData};
        var successFun = function(data){
            if(data.result != 'success'){
                alert('删除章节失败');
            }
            me.picTotalNum = data.sum;
            me.delChapterItem(item, bd);
        }
        YS.ajaxData(method, url, param, successFun);
    },
    delChapterItem: function(item, bd){
        var me = this;
        if(item.hasClass('selected')){
            var selectNode = item.next(':not(.add-chapter)');
            if(selectNode.length == 0){
                selectNode = item.prev();
            }
            selectNode.click();
        }
        item.remove();
        bd.remove();
        //check
        me.checkChapterDel();
        me.checkChapterHdNum();
    },
    switchChapter: function(item){
        var me = this;
        var bd = me.getChapterBd(item);
        //clean
        $('#J_chapterHdList li').removeClass('selected');
        $('#J_picListCon .pics-list').removeClass('selected');
        //
        item.addClass('selected');
        bd.addClass('selected');
    },
    checkPicsHd: function(){
        var me = this;
        var curBd = $('#J_picListCon .selected');
        var arr = curBd.find('.hd-item');
        var item,list,cls;
        for(var i=0, len=arr.length; i<len; i++){
            item = $(arr[i])
            cls = item.attr('class');
            cls = cls.match(/hd-date\d{8}/)[0];
            list = curBd.find('.'+cls+':not(.hd-item)');
            if(list.length==0){
                item.remove();
            }
        }
    },
    checkChapterDel: function(){
        var me = this;
        $('#J_chapterHdList li .del').css('visibility','visible');
        var arr = $('#J_chapterHdList li');
        if(arr.length == 2){
            $(arr[0]).find('.del').css('visibility','hidden')
        }
    },
    chapterNameDialog: {
        isInit: false,
        dialogItem: null,
        mainContent: $('#J_chaperNameDialog'),
        typeObj: null,
        init: function(){
            var me = this;
            var closeHandler = function() {
                me.close();
            };
            var content = me.mainContent;
            $("body").append(content);
            var dialog = content.dialog({
                autoOpen: false,
                draggable: false,
                modal: true,
                resizable: false,
                width : 400,
                dialogClass: "dialogStyle dialogTipShow chaperNameDialog",
                open: function(){
                    $(".ui-widget-overlay").bind("click", closeHandler);
                },
                close: function(){
                    $(".ui-widget-overlay").unbind("click", closeHandler);
                }
            });
            me.isInit = true;
            me.dialogItem = dialog;
            me.init = function(){};
        },
        show: function(obj){
            var me = this;
            if(!me.isInit){
                me.init();
                me.bindHandler();
            }
            me.mainContent.find('.err').hide();
            me.typeSign = obj;
            if(me.typeSign.sign == 'add'){
                me.mainContent.find('.title').text('新增章节');
                $('#J_chapterName').val('');
            }else{
                me.mainContent.find('.title').text('编辑章节');
                $('#J_chapterName').val(me.typeSign.txt);
            }
            me.dialogItem.dialog('open');
        },
        close: function(){
            var me = this;
            me.dialogItem.dialog('close');
        },
        bindHandler: function(){
            var me = this;
            $('#J_chapterName').blur(function(e){
                me.checkName();
            });
            $('.dialogTipShow .submit').click(function(e){
                if(me.checkName()){
                    me.close();
                    me.typeSign.txt = $('#J_chapterName').val();
                    chapter.renderChapterItem(me.typeSign);
                }
            });
            $('.dialogTipShow .cancel').click(function(e){
                me.close();
            });
        },
        checkName: function(){
            var me = this;
            var limit = 15;
            var txt = $('#J_chapterName').val();
            txt = txt.replace(/\s/g,'');//filter blank
            $('#J_chapterName').val(txt);
            var errTip = me.mainContent.find('.err');
            var sign = true;
            if(txt.length == 0 || txt.length>limit){
                errTip.show();
                sign = false;
            }else{
                errTip.hide();
            }
            return sign;
        }
    },
    getChapterData: function(){
        var me = this;
        var arr = $('#J_chapterHdList li:not(.add-chapter)');
        var item, obj, name, bd, cid, listData;
        var dataArr = [];
        for(var i=0, ilen=arr.length; i<ilen; i++){
            item = $(arr[i]);
            name = item.find('h5').text();
            obj = {topicName: name};
            //picList
            bd = me.getChapterBd(item);
            listData = me.getPicListData(bd);
            if(listData.arr.length>0){
                obj.piclistbydate = listData.arr;
                obj.topicPicture = listData.cover;
                dataArr.push(obj);    
            }
        }
        return dataArr;
    },
    getPicListData: function(list){
        var me = this;
        var arr = list.find('li:not(.hd-item)');
        var item, obj, cls, dateObj, coverItem;
        var dateArr = [], listArr, dateStr='';
        for(var i=0, len=arr.length; i<len; i++){
            item = $(arr[i]);
            cls = item.attr('class').match(/hd-date\d{8}/)[0];
            cls = cls.replace('hd-date','');
            //cover
            if(!coverItem && item.hasClass('chapter-cover')){
                coverItem = me.cleanPicData(item.data());
            }
            //
            if(cls != dateStr){
                listArr = [];
                dateObj = {
                    date: me.getDateStr(cls),
                    piclist: listArr
                };
                dateArr.push(dateObj);
                dateStr = cls;
            }
            obj = item.data();
            obj = me.cleanPicData(obj);
            listArr.push(obj);
        }
        var dateObj = {arr: dateArr, cover: coverItem};
        return dateObj;
    },
    cleanPicData: function(data){
        delete data.selectableItem;
        delete data.uiDraggable;
        return data;
    }
}

//other
var otherOpt = {
    previewURL: '/jumpToEdit.htm',
    init: function(){
        var me = this;
        me.initData();
        me.bindHandler();
    },
    initData: function(){
        var me = this;
        me.previewURL += '?pictureId='+chapter.pictureId;
    },
    bindHandler: function(){
        var me = this;
        $('#J_priveiw').click(function(e){
            //check
            if(chapter.picTotalNum<chapter.picMinNum){
                alert('请至少上传'+chapter.picMinNum+'张图片');
                return;
            }else if(chapter.picTotalNum>chapter.picMaxNum){
                alert('上传超过了'+chapter.picMaxNum+'张图片');
                return;
            }
            //save data
            me.saveData();
        });
    },
    saveData: function(){
        var me = this;
        var data = chapter.getChapterData();
        // console.log(data);
        data = JSON.stringify(data);
        //
        var method = 'POST';
        var url = '/orderPlate.htm';
        var param = {
            pictureId: chapter.pictureId,
            piclistbytopic: data
        }
        var successFun = function(data){
            if(data.result == 'success'){
                window.location.href = me.previewURL;
            }else{
                alert('出错啦，请重试');
            }
        }
        YS.ajaxData(method,url,param,successFun);
    }
};



//init
upload.init();
chapter.init();
otherOpt.init();

})();