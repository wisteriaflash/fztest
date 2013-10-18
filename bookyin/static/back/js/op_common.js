/**
 * 功能：公共库
 * 作者：裴玲玲
 * 日期：2013-1-10
 */

/*
 * 表格样式
 */
(function($){
	$.fn.extend({
		table:function(options){
			var settings={			
				odd:"tableOdd",		          //单行样式类名
				even:"tableEven" ,           //双行样式类名
				th:"tableTh",              	 //表头样式类名
				hover:"tableHover",     	 //hover行样式类名
				checked:"tableChecked"	, //选中行样式类名			
				hasClick:true,					//是否有点击单选、复选事件
				radio:false,					 //每行可单选/复选
				hasCheckbox:false,		//是否有复选框控件
				checkboxName:"selectbox"//如果有复选框控件，复选框的名称
			};				
			if(options) {
				$.extend(settings, options);
			}
			var trs=this.find("tr");
			this.find("th").addClass("tableTh");
			this.find("tr:odd").addClass(settings.odd).end().find("tr:even").addClass(settings.even);			
			trs.each(function(){
				$(this).hover(function(){
					$(this).addClass(settings.hover);					
				},function(){
					$(this).removeClass(settings.hover);
				});			
			});	
			//会员管理页面全选复选框开始
			/*if(settings.hasCheckbox){
				settings.hasClick=false;
				trs.each(function(i){
					var idValue=$(this).attr("id");
					if($(this).children("th").size()>0){
						$(this).prepend('<th><input type="checkbox" name="'+settings.checkboxName+'" value="'+idValue+'" class="tableCheckbox" id="'+settings.checkboxName+'"/>&nbsp;&nbsp;全选</th>');
					}else{
						$(this).prepend('<td><input type="checkbox" name="'+settings.checkboxName+'" value="'+idValue+'" class="tableCheckbox"/>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</td>');
					}					
				});
				checkbox(settings.checkboxName,settings.checkboxName);
			}	
			if(settings.hasClick){
				trs.click(function(e){							
					if(settings.radio){
						if($(this).hasClass(settings.checked)){
							$(this).removeClass(settings.checked).siblings().removeClass(settings.checked);
						}else{
							$(this).addClass(settings.checked).siblings().removeClass(settings.checked);
							$(this).children("td:last").addClass("tableCheckedOk");
						}
					}else{
						if($(this).hasClass(settings.checked)){
							$(this).removeClass(settings.checked);
						}else{
							$(this).addClass(settings.checked);
							$(this).children("td:last").addClass("tableCheckedOk");
						}
					}
				});	
			}			*/
			//会员管理页面全选复选框结束
			return this;		
		}		
	});
})(jQuery);

/*
 * 树
 */
function Tree(options){
	var settings={
		id:'',			
		data:{} , //json数据
		onlyRead:false,	//是否可新增编辑	
		hasSort:true,//是否有参数
		lastAdd:false		//最后一级是否可再增加	
	};	
	if(options) {
		$.extend(settings, options);
	}
	var obj=$.parseJSON(settings.data);
	var rootId=obj.id;	
	//获取层级
	var leval=0;
	this.getLeval=function(obj,no){
		var list=obj.sonList;			
		if(leval<no){
			leval=no;
		}						
		if(list.length>0){
			for(var i=0;i<list.length;i++){				
				temp=list[i];						
				this.getLeval(temp,no+1);
			}	
			return leval;					
		}			
	}
	leval=this.getLeval(obj,0);
	
	this.reset=function(){
		window.location.reload();
	};
	//保存返回JSON字符串
	this.submitData=function(){		
		var rootObj=_save($("#"+settings.id));	
		function _save($obj){	
			var tempObj={};		
			var $sons=[];
			tempObj.id=$obj.attr("id");							
			if(tempObj.id==settings.id)	{
				tempObj.parentId=obj.id;
				tempObj={"id":obj.id,"parentId":obj.parentId,"name":obj.name,"idx":obj.idx};
				$sons=$obj.children();				
			}else{	
				tempObj.parentId=$obj.attr("parentId");			
				tempObj.name=$obj.find(".treeText").val();
				tempObj.idx=$obj.find(".sortNo").val();
				var $conts=$obj.children();
				if($conts.size()==2)	{
					$sons=$conts.eq(1).children();
				}
			}
			tempObj.sonList=[];	
			for(var i=0;i<$sons.length-1;i++){
				var $son=$sons.eq(i);
				var sonObj={};				
				sonObj=_save($son);				
				tempObj.sonList.push(sonObj);				
			}		
			return tempObj;
		}
		return $.toJSON(rootObj);
	}
	//解析json字符串
	function _analize(obj,no){
		var id,parentId,name,idx,list;			
		id=obj.id;	
		parentId=obj.parentId;
		name=obj.name;
		idx=obj.idx;						
		list=obj.sonList;	
		
		var strArr=[];
		strArr.push('<div class="treeItem" leval="'+no+'" id="'+id+'" parentId="'+parentId+'">');
		strArr.push('<div class="treeTitle">');
		for(var i=0;i<no-1;i++){
			strArr.push('<span class="levalBorder"></span>');
		}			
		//if(no!=leval){
			if(no==1&&idx==1){
				strArr.push('<a class="levalIco levTop" href="javascript:;"> </a>');
			}else{
				strArr.push('<a class="levalIco" href="javascript:;"> </a>');
			}			
			strArr.push('<label class="folderIco"> </label>');
		//}else{
		//	strArr.push('<label class="levalIco" href="javascript:;"> </label>');
		//}			
		strArr.push('<div class="treeDesc" leval="'+no+'">');
		if(no==1){
				strArr.push('<input type="text" class="treeText levalAText" value="'+name+'" readonly/> ');
		}else{
			strArr.push('<input type="text" class="treeText" value="'+name+'" readonly/> ');
		}
		if(settings.hasSort){
			strArr.push('<label class="sortLabel">排序</label>');
			strArr.push('<input class="sortNo" type="text" value="'+idx+'"/> ');
		}			
		strArr.push('</div>');
		strArr.push('</div>');
		strArr.push('<div class="treeInfo">');		
		strArr.push('</div>');
		strArr.push('</div>');	
		var str=strArr.join("");
		if(no==1){
			$("#"+settings.id).append(str);
		}else{
			$("#"+parentId).find(".treeInfo").eq(0).append(str);
		}								
		if(list.length>0){
			for(var i=0;i<list.length;i++){				
				temp=list[i];						
				_analize(temp,no+1);
			}					
		}
					
	}	
	
	this.init=function(){		
		if(obj.sonList.length==0){
			var tempStr='<div class="treeItem" leval="1">'+
			            			'<div class="treeTitle">'+
			            				'<a class="levalIco levOne" href="javascript:;"> </a>'+
			            				'<label class="folderIco"> </label>'+
			            				'<div class="treeDesc" leval="1">'+
			            					'<a href="#" class="treeText levalAText">新增本类</a>    '   +     					    					      						
			            				'</div>'+
			            			'</div> '  +         		
			            		'</div>';
			$("#"+settings.id).append(tempStr);
			return;
		}
		_analize(obj,0);		
		if(!settings.onlyRead){			
			$(".treeItem").each(function(){
				var no=parseInt($(this).attr("leval"))+1;						
				//if(no-1!=leval){
				if(no-1!=leval||(no-1==leval&&settings.lastAdd)){
					var tempStr=_str2(no);
					$(this).children(".treeInfo").append(tempStr);
				}				
			});
			$("#"+settings.id).append(_str2(1));
		}else{
			
		}
		function _str2(no){		
			var tempArr=[];
			tempArr.push('<div class="treeItem" leval="'+no+'">');
			tempArr.push('<div class="treeTitle">');
			for(var i=0;i<no-1;i++){
				tempArr.push('<span class="levalBorder"></span>');
			}			
			//if(no!=leval){				
				tempArr.push('<a class="levalIco levBottom" href="javascript:;"> </a>');					
				tempArr.push('<label class="folderIco"> </label>');
			//}else{
			//	tempArr.push('<label class="levalIco  levBottom" > </label>');
			//}			
			tempArr.push('<div class="treeDesc" leval="'+no+'">');
			if(no==1){
				tempArr.push('<a href="#" class="treeText levalAText">新增本类</a> ');
			}else{
				tempArr.push('<a href="#" class="treeText">新增本类</a>');
			}			
			tempArr.push('</div>');
			tempArr.push('</div>');		
			tempArr.push('</div>');	
			var tempStr=tempArr.join("");
			return tempStr;
		}
	}
	this.init();
	//树形结构的打开关闭事件	
	$(".levalIco").live("click",function(){		
		var $parent=$(this).parent().parent();
		var $levals=$parent.find(".treeItem");		
		//if($parent.attr("leval")!=leval){
			if($parent.hasClass("levalClose")){
				$parent.removeClass("levalClose");
				$levals.each(function(){
					if($(this).attr("leval")!=leval){
						if(!$(this).hasClass("levalClose")){
							$(this).addClass("levalClose");
						}
					}					
				});				
			}else{
				$parent.addClass("levalClose");
			}
		//}		
		
	});	
	//hover事件
	if(!settings.onlyRead){
		$(".treeDesc").live({
			mouseenter:function(){
				if($(this).find("a.treeText").size()==0){
					var str="";
					//if($(this).attr("leval")!=leval){
					if($(this).attr("leval")==leval&&!settings.lastAdd){
						str='<a class="treeEdit">修改</a>' +
					          '<a class="treeDel">删除</a>' ;	
					}else{
						str='<a class="treeEdit">修改</a>' +
					          '<a class="treeDel">删除</a>' +  
					          '<a class="treeAdd">新增子类</a>' ;
					}					            	
				    $(this).append(str);
				    if(!$(this).hasClass("treeBg")){
						$(this).addClass("treeBg");
					}
				}			
			},
			mouseleave:function(){			
				if($(this).hasClass("treeBg")){
					$(this).removeClass("treeBg");
				}
				$(this).find("a:not('.treeText')").remove();
				
			}
		});
	}
	
	//修改
	$(".treeEdit").live("click",function(){
		var $text=$(this).siblings("input.treeText").eq(0);
		$text.removeAttr("readonly").focus();
		if(!$text.hasClass("editTreeTitle")){
			$text.addClass("editTreeTitle");
		}
	});
/*	$(".treeDel").live("click",function(){
		$(this).parent().parent().parent().remove();
	});*/
	//修改名称输入框enter事件
	$("input.treeText").live("keydown",function(e){		
		if(e.which==13){
			$(this).attr("readonly","readonly");
			if($(this).hasClass("editTreeTitle")){
				$(this).removeClass("editTreeTitle");
			}
		}
	});
	//新增子类
	$(".treeAdd").live("click",function(){		
		var $p=$(this).parent().parent().parent();
		var levalNo=parseInt($p.attr("leval"));		
		var str=_str(levalNo,$p);			
		$p.find(".treeItem:last").before(str);
	});
	//新增本类
	$("a.treeText").live("click",function(){
		var $p=$(this).parent().parent().parent();
		var levalNo=parseInt($p.attr("leval"))-1;	
		var str=_str(levalNo,$p);
		$p.before(str);
	});
	//新增子类、本类的字符串
	function _str(levalNo,$obj){
		var strArr=[];
		var newLeval=levalNo+1;
		strArr.push('<div class="treeItem" leval="'+newLeval+'" id="" parentId="'+$obj.attr("id")+'">');
		strArr.push('<div class="treeTitle">');		
		for(var i=0;i<levalNo;i++){
			strArr.push('<span class="levalBorder"></span>');
		}
		//if(newLeval==leval){
		//	strArr.push('<label class="levalIco"> </label>');
		//}else{
			strArr.push('<a class="levalIco" href="javascript:;"> </a>');
			strArr.push('<label class="folderIco"> </label>');
		//}		
		strArr.push('<div class="treeDesc" leval="'+newLeval+'">');
		strArr.push('<input type="text" class="treeText editTreeTitle" value=""/>');							 
		if(settings.hasSort){
			strArr.push('<label class="sortLabel">排序</label>');
			strArr.push('<input class="sortNo" type="text" value=""/>');
		}					
		strArr.push('</div></div>');			
		strArr.push('<div class="treeInfo">');
		//if(newLeval!=leval){
		if(newLeval!=leval||(newLeval==leval)&&settings.lastAdd){
			newLeval++;
			strArr.push('<div class="treeItem" leval="'+newLeval+'">');		
			strArr.push('<div class="treeTitle">');
			for(var i=0;i<levalNo+1;i++){
				strArr.push('<span class="levalBorder"></span>');
			}
			strArr.push('<a class="levalIco levBottom" href="javascript:;"> </a>');
			strArr.push('<label class="folderIco"> </label>');		
			strArr.push('<div class="treeDesc">');	
			strArr.push('<a href="#" class="treeText">新增本类</a>');	
			strArr.push('</div></div></div>');
		}
				
		strArr.push('</div>');						
		strArr.push('</div>');	
		var str=strArr.join('');
		return str;
	}	
}
/*
 * 复选框全选
 * 参数说明：
 * 				id--全选标签的id值
 * 				name--checkbox的name属性值
 */
function checkbox(id,name){
	var button=document.getElementById(id);
	var items=$("input[name='"+name+"']:not('#"+id+"')");	
	button.onclick=function(){				
		if(button.checked==true){
			 items.each(function(){
			 	this.checked=true;
			 });
		}else{
			  items.each(function(){
			 	this.checked=false;
			 });
		}		
	}
	items.click(function(){
		var flag=true;
		items.each(function(){
			if(this.checked==false){
				flag=false;
				return;
			}
		});
		if(flag){
			button.checked=true;
		}else{
			button.checked=false;
		}
	});	
}