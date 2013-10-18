/*
 *添加、删除、保存数据组件:
 * 1.与table表格结构无关
 * 2.数据接口：初始化、保存接口可自定义。
 * 3.使用的json数据格式，需要与tfoot中的标签对应，pic需要对应到a标签中，input标签需要对应到父标签中。(例如：tfoot中的data-name=com-tbopt-pic)之类的。
 * 4.传输的数据格式，属性名自定义，但必须与tfoot中的结构保持一致。
 * 5.验证数据格式的方法，可自定义。
 * 6.添加节点为：.addItem，保存数据节点为：.saveData
 * 7.其他默认属性，可以看defaults。
 */
(function($){

//TableOpt class
var TableOpt = function(tableItem, options){
    this.tableElement = tableItem;
    this.tableWhole = tableItem.parent().find('div');
    this._init(options);
};

//fun
TableOpt.prototype = {
    version: '1.0.0',
    _init: function(options){
        var tableItem = this.tableElement;
        var settings = this._getSettings(tableItem);
        var mergeData = settings ? settings : $.fn.tableOpt.defaults;
        settings = $.extend({}, mergeData, options);
        //tpl
        var tplStr = tableItem.find('tfoot').html(); 
        settings.tpl = settings.tpl ? settings.tpl : tplStr;
        this._setSettings(tableItem, settings);
        //
        this._initData();
        
    },
    _initData: function(){
        var me = this;
        var tableItem = me.tableElement;
        var settings = me._getSettings(tableItem);
        var method = 'GET';
        var url = settings.initDataUrl;
        var param = {};
        var successFun = function(data){
            var mergeData = settings = $.extend(true, {}, settings, data);
            me._setSettings(tableItem, mergeData);
            //render
            me._renderHandler();
            me._bindHandler();
        }
        utils.ajaxData(method,url,param,successFun);
    },
    _renderHandler: function(){
        var me = this;
        var tableItem = me.tableElement;
        var settings = me._getSettings(tableItem);
        var itemsArr = settings.items;
        var itemData, num, item = $('<div></div>');
        for(var i=0, len=itemsArr.length; i<len; i++){
            itemData = itemsArr[i];
            item.html($(settings.tpl));
            num = i+1;
            item.find('tr').attr('class','com-tbopt'+num);
            item.find('[data-name="com-tbopt-num"]').text(num);
            for(data in itemData){
                if(data.match('pic') && !data.match('txt')){//pic
                    if(itemData[data]){
                        item.find('[data-name="com-tbopt-'+data+'"] a').attr('href', itemData[data]).text('查看图片');    
                    }
                }else{
                    item.find('[data-name="com-tbopt-'+data+'"] input').attr('value',itemData[data]);
                }
            }
            tableItem.find('tbody').append(item.html());
        }
        var scrolltime = me.tableWhole.find('.scroll-time');
        if(settings.scrolltime && scrolltime.length>0){
            scrolltime.find('input').val(settings.scrolltime);
        }
        //data
        settings.totalNum = len;
        settings.lineNum = item.find('tr').length;
    },
    _bindHandler: function(){
        var me = this;
        var tableItem = this.tableElement;
        var settings = this._getSettings(tableItem);
        //item
        tableItem.delegate('.delButton', 'click', function(e){
            e.preventDefault();
            var tr = $(this).parents('tr');
            var cls = tr.attr('class');
            tableItem.find('.'+cls).remove();
            //refresh num
            var num = parseInt(cls.replace('com-tbopt',''));
            var item, curNum;
            for(var i=num+1; i<=settings.totalNum; i++){
                curNum = i-1;
                item = tableItem.find('.com-tbopt'+i);
                item.attr('class','com-tbopt'+curNum);
                item.find('[data-name="com-tbopt-num"]').text(curNum);
            }
            settings.totalNum--;
        });
        tableItem.delegate('.move-up', 'click', function(e){
            e.preventDefault();
            if(settings.totalNum <settings.lineNum){
                return;
            }
            var tableBody = tableItem.find('tbody');
            var curTr = $(this).parents('tr');
            var cls = curTr.attr('class');
            curTr = tableBody.find('.'+cls);
            var num = cls.replace('com-tbopt','');
            //limit
            if(num < settings.lineNum){
                return;
            }
            var prevNum = num-1;
            var prevCls = 'com-tbopt'+prevNum;
            var prevTr = tableBody.find('.'+prevCls);
            //switch
            prevTr.eq(0).before(curTr);
            //cur
            curTr.find('[data-name="com-tbopt-num"]').text(prevNum);
            curTr.attr('class',prevCls);
            //prev
            prevTr.find('[data-name="com-tbopt-num"]').text(num);
            prevTr.attr('class',cls);
        });
        tableItem.delegate('.move-down', 'click', function(e){
            e.preventDefault();
            if(settings.totalNum <settings.lineNum){
                return;
            }
            var tableBody = tableItem.find('tbody');
            var curTr = $(this).parents('tr');
            var cls = curTr.attr('class');
            curTr = tableBody.find('.'+cls);
            var num = parseInt(cls.replace('com-tbopt',''));
            //limit
            if(num == settings.totalNum){
                return;
            }
            var nextNum = num+1;
            var nextCls = 'com-tbopt'+nextNum;
            var nextTr = tableBody.find('.'+nextCls);
            //switch
            nextTr.eq(settings.lineNum-1).after(curTr);
            //cur
            curTr.find('[data-name="com-tbopt-num"]').text(nextNum);
            curTr.attr('class',nextCls);
            //prev
            nextTr.find('[data-name="com-tbopt-num"]').text(num);
            nextTr.attr('class',cls);
        });
        if(settings.hasFileUpload){//只支持html5的浏览器上传
            tableItem.delegate('.fileupload', 'change', function(e){
                var files = this.files;
                var config = {
                    url: settings.fileUploadUrl,
                    files: files,
                    name: $(this).attr('name'),
                    parent: $(this).parent(),
                    sucessFun: function(data){
                        if(data.result == 'success'){
                            var imgItem = this.parent.find('a');
                            imgItem.attr('href',data.url)
                                    .text('查看图片');
                        }else{
                            alert(data.reason);
                        }
                    }
                }
                utils.handleFiles(config);
            });
        }
        //main
        this.tableWhole.find('.addItem').click(function(e){
            e.preventDefault();
            var item = $('<div></div>');
            item.html($(settings.tpl));
            var num = ++settings.totalNum;
            item.find('tr').attr('class','com-tbopt'+num);
            item.find('[data-name="com-tbopt-num"]').text(num);
            //
            tableItem.find('tbody').append(item.html());
        });
         this.tableWhole.find('.saveData').click(function(e){
            e.preventDefault();
            var sign;
            if(settings.checkData){
                sign = settings.checkData();
            }else{
                sign = me.checkData();
            }
            if(!sign){
                return;
            }
            var strData = me.getData();
            if(!strData){
                return;
            }
            //send
            var method = 'POST';
            var url = settings.saveDataUrl;
            var param = {data: strData};
            var successFun = function(data){
                alert(data.reason);
            };
            utils.ajaxData(method,url,param,successFun);
         });
    },
    _getSettings: function(item){
        var tableItem = this.tableElement;
        return tableItem.data('tableOpt');
    },
    _setSettings: function(item,options){
        var tableItem = this.tableElement;
        tableItem.data('tableOpt', options);
    },
    checkData: function(){//验证数据
        var me = this;
        var sign = true;
        var settings = me._getSettings(tableItem);
        var tableItem = me.tableElement;
        var trArr = tableItem.find('tbody tr');
        var trItem, picArr, txtArr;
        if(trArr.length==0){
            alert('请至少添加一项');
            sign = false;
            return sign;
        }
        for(var i=0, len=trArr.length; i<len; i+=settings.lineNum){
            trItem = trArr.eq(i);
            picArr = trItem.find('a');
            sign = sign && me.checkPicData(picArr);
            txtArr = trItem.find('input[type="text"]');
            sign = sign && me.checkTxtData(txtArr);
            if(!sign){
                break;
            }
        }
        if(!sign){
            alert('请填写完整');
        }
        return sign;
    },
    checkPicData: function(arr){
        var sign = true;
        var item, pic;
        for(var i=0, len=arr.length; i<len; i++){
            item = arr.eq(i);
            pic = item.attr('href');
            if(pic.length == 0){
                sign = false;
                break;
            }
        }
        return sign;
    },
    checkTxtData: function(arr){
        var sign = true;
        var item;
        for(var i=0, len=arr.length; i<len; i++){
            item = arr.eq(i);
            if(item.val().length == 0){
                sign = false;
                break;
            }
        }
        return sign;
    },
    getData: function(){
        var me = this;
        var tableItem = me.tableElement;
        var settings = me._getSettings(tableItem);
        var tableItem = me.tableElement;
        var trArr = tableItem.find('tbody tr');
        var data = $.extend({},me._getSettings(tableItem));
        //items
        var items = [], itemData = settings.defaultItem;
        var idata, item, num;
        for(var i=0, len=trArr.length; i<len; i+=settings.lineNum){
            var obj = {};
            num = parseInt(i/settings.lineNum)+1;
            item = trArr.filter(".com-tbopt"+num);
            for(idata in itemData){
                if(idata.match('pic') && !idata.match('txt')){//pic
                     obj[idata] = item.find('[data-name="com-tbopt-'+idata+'"] a').attr('href');
                }else{
                    obj[idata] = item.find('[data-name="com-tbopt-'+idata+'"] input').val();
                }
            }
            items.push(obj);
        }
        data.items = items;
        //main
        var scrolltime = me.tableWhole.find('.scroll-time');
        if(settings.scrolltime && scrolltime.length>0){
            data.scrolltime = scrolltime.find('input').val();
        }
        delete data.tpl;
        var dataStr = '';
        if(JSON.stringify){
            dataStr = JSON.stringify(data);
        }else{
            alert('浏览器不支持，请更换Firefox或chrome再试试');
        }
        return dataStr;
    }
};

//utils
var utils = {
    ajaxData: function(method,url,param,successFun,errorFun){
        method = method ? method : 'GET';
        $.ajax({
            type: method,
            cache: false,
            dataType: "json",
            url: url,
            data: param,
            success: function(data, textStatus) {
                successFun && successFun(data);
            },
            error: function(XMLHttpRequest, textStatus) {
                errorFun && errorFun(textStatus)
            }
        });
    },
    handleFiles : function (config,e){
        var me = this;
        // alert(files);
        // Traverse throught all files and check if uploaded file type is image 
        var imageType = /image.*/; 
        var file = config.files ? config.files[0] : null;
        // check file type
        if (file && !file.type.match(imageType)) {  
          alert("File \""+file.name+"\" is not a valid image file, Are you trying to screw me :( :( ");
          return false; 
        } 
        // check file size
        // if (parseInt(file.size / 1024) > 2050) {  
        //   alert("File \""+file.name+"\" is too big. I am using shared server :P");
        //   return false; 
        // }
        me.uploadFile(file,config);
        
    },
    uploadFile: function(file,config){
        // check if browser supports file reader object 
        if (typeof FileReader !== "undefined"){
            //alert("uploading "+file.name);  
            reader = new FileReader();
            reader.onload = function(e){
                var imgData = e.target.result;
                config.startFun && config.startFun(imgData);
            }
            reader.readAsDataURL(file);

            xhr = new XMLHttpRequest();
            xhr.open("post", config.url, true);
            //addEventListener
            xhr.upload.addEventListener("progress", function (event) {
                if (event.lengthComputable) {
                    var percent = ((event.loaded / event.total) * 100).toFixed + "%";
                    config.progressFun && config.progressFun(percent);
                }
                else {
                    alert("Failed to compute file upload length");
                }
            }, false);

            xhr.onreadystatechange = function (oEvent) {  
              if (xhr.readyState === 4) {  
                if (xhr.status === 200) {
                  var result = JSON.parse(xhr.responseText);
                  config.sucessFun && config.sucessFun(result);
                } else {
                  alert("Error"+ xhr.statusText);
                }  
              }  
            };
            // Send the file (doh)
            var formData = new FormData();
            formData.append(config.name, file);
            // These extra params aren't necessary but show that you can include other data.
            // formData.append("username", "Groucho");
            xhr.send(formData);
            // xhr.send(file);
        }else{
            alert('浏览器不支持，请更换Firefox或chrome再试试^_^');
            // alert("Your browser doesnt support FileReader object");
        }       
    }
}


//public fun
var methods = {
    init: function(options){
        this.each(function() {
            var $this = $(this);
            if (!$this.data('tableOpt-instance')) {
                $this.data('tableOpt-instance', new TableOpt($this, options));
            }
        });
    },
    instance: function(){
        var arr = [];
        this.each(function() {
            var $this = $(this);
            arr.push($this.data('tableOpt-instance'));
        });
        return arr;
    },
    getData: function(){
        var arr = [];
        this.each(function() {
            var $this = $(this);
            var instance = $this.data('tableOpt-instance');
            if(instance){
                arr.push(instance.getData());
            }
        });
        return arr;
    }
}


//construct
$.fn.tableOpt = function() {
    var method = arguments[0];
    if(methods[method]) {
        if(!this.data('tableOpt-instance')){
            $.error('please init tableOpt first');
            return;
        }
        method = methods[method];
        arguments = Array.prototype.slice.call(arguments, 1);
    } else if( typeof(method) == 'object' || !method ) {
        method = methods.init;
    } else {
        $.error( 'Method ' +  method + ' does not exist on jQuery.tableOpt' );
        return this;
    }

    return method.apply(this, arguments);

}

// defaults
$.fn.tableOpt.defaults = {
    hasFileUpload: false,
    items: []
};

})(jQuery);