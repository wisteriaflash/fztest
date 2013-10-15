var svgNS = "http://www.w3.org/2000/svg";

function init(evt){
  svgdoc = evt.target.ownerDocument;
  rootdoc = svgdoc.rootElement;
  // console.log(evt.getTarget())
  // console.log(svgdoc.rootElement) ;
  // console.log(svgdoc+"::"+rootdoc.nodeName)

  circle = svgdoc.getElementById("e1")
  c2 = circle.cloneNode(true)
  c2.setAttribute("cx","200")
  c2.setAttribute("fill","blue")
  //console.log(circle)
  // console.log(rootdoc.removeChild(circle))
  // rootdoc.removeChild(circle)

  node = svgdoc.createElementNS(svgNS,"rect");
  node.setAttribute("x","100");
  node.setAttribute("y","50");
  node.setAttribute("width","100");
  node.setAttribute("height","250");
  node.setAttribute("style","fill:yellow");
  // console.log(node)
  group = svgdoc.getElementById("group");
  group.insertBefore(node,circle); //在某元素前插入

  // group.appendChild(node);  //添加元素
  group.appendChild(c2);

  // rootdoc.removeChild(group) //移除某元素(一定是父元素才可以移除其下的子元素)
  // group.removeChild(circle)
  // console.log(group.firstChild.nodeType) //节点类型
  // console.log(group.childNodes[1].nodeName) //节点名称
  // console.log(rootdoc.firstChild.nodeName)

  //创建文字节点
  textNode = svgdoc.createElementNS(svgNS,"text");
  textNode.setAttribute("x","400");
  textNode.setAttribute("y","100");
  textNode.setAttribute("style","fill:green;font-size:25px;");
  text = svgdoc.createTextNode("SVG test");
  textNode.appendChild(text);
  // group.appendChild(textNode);

  //getBBox 方法，可得到x,y,width,height四个值
  // textBox = textNode.getBBox();

  g = document.createElementNS(svgNS,"g");
  g.appendChild(textNode);
  rootdoc.appendChild(g);
  // alert(g.getBBox().width)
  // alert(group.getBBox().width)

  // console.log(rootdoc.currentScale);


  // console.log(textBox.x,textBox.y,textBox.width,textBox.height);
  // console.log(group.getBBox());
  // console.log(textNode.length)

  //addEvent
  addEvent();
  //test animation
  // dragText();   //文字拖动效果测试

  //序列化测试
  //printNode,parseXML浏览器不支持，无此方法，但是svg viewer支持。

}

function remove(evt){
  // console.log(rootdoc)
  // console.log(evt.target)
  // rootdoc.removeChild(evt.target);
}
//addEvent
function addEvent(){
  svgdoc.onclick = function(evt){
    // console.log(evt.detail)
    return;
    console.log(evt.clientX,evt.screenX,evt.clientY,evt.screenY);
    console.log(evt);
  }
  svgdoc.onkeypress = function(evt){
    return;
    console.log(evt.charCode);
  }
}
//J_dragElement-->文字拖动效果
function dragText(){
  var isMove = false, cible = "", xt1 = 0, yt1 = 0;
  //group
  var dragG = svgdoc.getElementById("J_dragElement")
  dragG.onmouseup = function(evt){
    isMove = false;
  }
  //drag
  var drag = svgdoc.getElementById("J_dragElement");
  drag.onmousemove = function(evt){
    // return;
    var xm = evt.clientX, ym = evt.clientY;
    if((cible="rectBox") && (isMove==true)){
      obj = svgdoc.getElementById("mtext");
      var xt2 = parseInt(obj.getAttribute("x")), yt2 = parseInt(obj.getAttribute("y"));
      var depx = xt2+xm-xt1, depy = yt2+ym-yt1;
      obj.setAttribute("x",depx);
      obj.setAttribute("y",depy);
      var objBox = obj.getBBox();
      var target = svgdoc.getElementById(cible);
      var objTrace = "M "+objBox.x+" "+objBox.y+" l "+objBox.width+" 0 0 "+objBox.height+" -"+objBox.width+" 0z";
      target.setAttribute("d",objTrace);
      xt1 = xm, yt1 = ym;
    }
  }
  drag.onmousedown = function(evt){
    cible = evt.target.getAttribute("id");
    if(cible=="rectBox"){
      isMove = true;
      xt1 = parseInt(evt.clientX);
      yt1 = parseInt(evt.clientY);

    }
    //txt
    var txt = svgdoc.getElementById("mtext");
    txtBox = txt.getBBox();
    console.log(txtBox);
    txtTrace = "M "+txtBox.x+" "+txtBox.y+" l "+txtBox.width+" 0 0 "+txtBox.height+" -"+txtBox.width+" 0z";
    //rectBox
    var rect = svgdoc.getElementById("rectBox");
    rect.setAttribute("d",txtTrace);
  }
}