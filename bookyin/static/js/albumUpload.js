/*
画册-图片上传
*/ 
(function(){

//upload
var upload = {
    status: 'no-upload', //no-upload|uploading|uploaded
    stepDelay: 2000,
    pictureId: null,
    selectArr: [],
    init: function(){
        var me = this;
        me.initData();
        me.bindHandler();
    },
    initData: function(){
        var me = this;
        me.pictureId = $('#J_mainview').attr('data-id');
    },
    bindHandler: function(){
        var me = this;
        //addPic
        $('#J_addPic').uploadify({
            // 'uploader': 'http://static.chushuba.com/js/plugin/uploadify/v2.1/uploadify.swf',
            // 'script': 'http://www.chushuba.com/uploadPicture.htm',
            'uploader': '../../js/plugin/uploadify/v2.1/uploadify.swf',
            'script': '../../js/plugin/uploadify/v2.1/uploadify.php',
            'scriptData': {pictureId: me.pictureId},
            'fileDataName': 'pictureFile',
            'cancelImg': '../../img/cancel.png',
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
                me.setUploadTypeQueue('pic');
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
                console.log('err');
            },
            onComplete: function(event,id, file, response, data){
                var speed = data.speed*1024;
                var obj = {speed: speed, size:file.size};
                me.setUploadNum(false, obj);
            },
            onAllComplete: function(event,file){
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
            // 'uploader': 'http://static.chushuba.com/js/plugin/uploadify/v2.1/uploadify.swf',
            // 'script': 'http://www.chushuba.com/uploadCompressedFile.htm',
            'uploader': '../../js/plugin/uploadify/v2.1/uploadify.swf',
            'script': '../../js/plugin/uploadify/v2.1/uploadify.php',
            'scriptData': {pictureId: me.pictureId},
            'fileDataName': 'pictureFile',
            'cancelImg': '../../img/cancel.png',
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
                me.setUploadTypeQueue('zip');
                //
                me.status = 'uploading';
                me.changeStatus();
            },
            onProgress: function(event,file){
                // console.log();
            },
            onComplete: function(event,file){
                setTimeout(function(){
                    var me = upload;
                    me.cleanUploadTypeQueue();
                    me.cleanUploadNum();
                }, me.stepDelay);
                
            }
        });

        // upload-ok
        $('#J_uploadOk .pics-con ul').selectable({
            cancel: ".hd-item,i,.ui-selecting,.ui-selected",
            selected: function( event, ui ) {
                // var tagName = ui.selected.tagName.toLowerCase();
                // if(tagName == 'li'){
                //     // console.log('oooo')
                // }
                // console.log('fffff=',ui.selected)
                // console.log('ss',ui,ui.selected.tagName)
            },
            selecting: function(event, ui) {
                // console.log(',,,,,')
                
                // console.log(arr.length)
                // if(arr.length == 1){
                //     $( "#J_uploadOk .pics-con ul" ).selectable( "option", "cancel", '.ui-selecting' );
                // }
                // me.selectArr = [];
            },
            stop: function( event, ui ) {
                // console.log(ui)
                // console.log('bbb',event,ui);
            }
        })
        .draggable({
            cancel: ".hd-item",
            cursorAt: { left: 80, top: 80 },
            helper: function(){
                var str = '<div class="dragging-pic">'+
                        '<div></div>'+
                    '</div>';
                return '<div></div>';
                return $('<div id="J_a1" style="border: 1px solid; padding: 5px; width:150px; height:150px; text-align:center; background:#FFF;"><img src="../../img/demo/album1.jpg" alt="" /></div>');
            },
            start: function( event, ui ) {
                //render helper
                // console.log(ui.offset)
                var arr = $('#J_uploadOk li.ui-selected');
                arr = arr.filter('.pic-item');
                var item,imgItem,position;
                var container = $('<div class="clone-pic">');
                // console.log(arr.length);
                for(var i=0, len=arr.length; i<len; i++){
                    item = $(arr[i]);
                    imgItem = item.find('img').clone();
                    imgItem.css({
                        left: item.offset().left-ui.offset.left,
                        top: item.offset().top-ui.offset.top,
                        position: 'absolute',
                    });
                    console.log(item.offset())
                    container.append(imgItem);
                    // str += '<img style="left:'+item.+'" />';

                    // console.log(i,item.position())
                }
                ui.helper.html('');
                ui.helper.append(container);
                // console.log('ssss',ui.helper.position());
            },
            drag: function( event, ui ) {
                //test
                var arr = $('#J_uploadOk li.ui-selected');
                arr = arr.filter('.pic-item');
                // console.log($(arr[0]).offset())

                var item = $(event.toElement);
                // console.log(event.toElement)
                console.log('----',item.parents('li').offset())
                // console.log(ui.offset)
                ui.helper.find('.item').animate({
                    // x: 
                },300);
            }
        });
        $('#J_uploadOk .pics-con').delegate('li .del', 'click', function(e){
            // console.log('del');
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
    setUploadTypeQueue: function(type){
        var me = this;
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
    init: function(){

    }
}

//other
var otherOpt = {
    init: function(){
        var me = this;
        me.bindHandler();
    },
    bindHandler: function(){
        var me = this;
        
    }
};




//init
upload.init();
chapter.init();
otherOpt.init();


})();