(function(){
//global
var svgNS = "http://www.w3.org/2000/svg";
window.$ = function(id){
  return document.getElementById(id);
}


//
var svgCharts = function(config){
  var me = this;
  me.config = config;
  me.colorArr = ['#FFD05E','#FEF8A2','#C3E189','#73CFA8','#23ADAF','#2F7E8D'];
  //init
  this.init();
}
svgCharts.prototype = {
  init: function(){
    var me = this;
    me.initData();
    me.initSvgElement();
    me.renderChart();
  },
  initData: function(){
    var me = this;
    var config = me.config;
    //merge default
    config.anim = config.anim != undefined ? config.anim : true;
    config.animPer = 0.08;
    config.animTime = 1;
  },
  initSvgElement: function(){
    var me = this;
    //svg element
    var wrapper = $('J_wrapper');
    svg = new SVGElement("svg");
    svg.attr({"version":"1.1", "width":800, "height":500, "xmlns":svgNS});
    wrapper.appendChild(svg.element);
    me.svg = svg;
    //group-series
    var seriesGroup = new SVGElement("g");
    seriesGroup.attr({'class':'chart-series-group'})
    me.svg.appendChild(seriesGroup);
    me.seriesGroup = seriesGroup;
    //group-txt
    var labelGroup = new SVGElement("g");
    labelGroup.attr({'class':'chart-label-group'})
    me.svg.appendChild(labelGroup);
    me.labelGroup = labelGroup;
  },
  renderChart: function(){
    var me = this;
    var config = me.config
    var typeObject = {'pie':me.renderPie};
    me.animFun = typeObject[me.config.type];
    me.animFun = me.renderPie;
    //
    if(config.anim){
      config.animId = setInterval(function(){
        me.animFun(me);
      }, 40);
    }
    me.animFun(me);
  },
  renderPie:function(me){
    var me = me ? me : this;
    var config = me.config;
    //
    me.initPieData();
    var data = me.config.series,
        config = me.config;
    var item;
    var percent = config.animPer*config.animTime;
    percent  = percent > 1 ? 1 : percent;
    for(var i=0,len=data.length; i<len; i++){
      item = data[i];
      //conf
      if(!item.startRadians){
        item.startRadians = (config.offsetDegrees || 0) * Math.PI/180;
        item.endDegrees = Number(item.data.replace('%',''))/100*360;
        item.endRadians = (item.endDegrees + config.offsetDegrees || 0) * Math.PI/180;
        item.innerRadius = config.innerRadius;
        item.outerRadius = config.outerRadius*(1-i*0.1);
        item.color = me.colorArr[i];
        item.centerX = config.centerX;
        item.centerY = config.centerY;
      }
      //
      if(me.config.anim){
        item.animEndRadians = (item.endDegrees*percent + config.offsetDegrees || 0) * Math.PI/180;
      }
      //draw
      me.renderPieShape(item);
      if(!config.anim || percent == 1){
        me.renderLabel(item);  
      }
    }
    //anim
    if(config.anim){
      config.animTime += 1;
      if(percent>=1){
        clearInterval(config.animId);
      }
    }
  },
  initPieData: function(){
    var me = this;
    //
    var config = me.config;
    var mergeConfig = {
      centerX : (config.center && config.center[0]) || 0,
      centerY : (config.center && config.center[1]) || 0,
      offsetDegrees: config.offsetDegrees || 90
    };
    var thick = config.thickness!==undefined ? config.thickness : 100;
    //innerRadius
    if (config.innerRadius!==undefined) {
      mergeConfig.innerRadius = config.innerRadius;
    }else if (config.outerRadius!==undefined) {
      mergeConfig.innerRadius = config.outerRadius - thick;
    }else{
      mergeConfig.innerRadius = 200 - t;
    }
    //outerRadius
    if (config.outerRadius!==undefined){
      mergeConfig.outerRadius = config.outerRadius;
    }else{
      mergeConfig.outerRadius = mergeConfig.innerRadius + thick;
    }
    //check limit
    if (mergeConfig.innerRadius<0){
      mergeConfig.innerRadius = 0;
    }
    if (mergeConfig.outerRadius<0){
      mergeConfig.r2 = 0;
    }
    for(item in mergeConfig){
      me.config[item] = mergeConfig[item];
    }
    me.initPieData = function(){};
  },
  renderPieShape: function(data){
    var me = this;
    var path;
    if(!data.path){
      path = new SVGElement("path");
      path.attr({"fill":data.color,"stroke-width":"0","stroke-linejoin":"round"});
      data.path = path;
    }else{
      path = data.path;
    }
    var pieStr = me.drawPiePiece(data);
    path.attr({"d": pieStr});
    me.seriesGroup.appendChild(path);
  },
  renderLabel: function(data){
    var me = this;
    //group
    var textGroup = new SVGElement('g');
    textGroup.attr({'class':'chart-text-group'})
    me.labelGroup.appendChild(textGroup);
    //line
    var line = new SVGElement("path");
    var lineStr = me.drawLableLine(data);
    line.attr({"fill":"none","stroke":"#949494","stroke-width":"1","stroke-linejoin":"round", "d": lineStr});
    textGroup.appendChild(line);
    //text
    var text = new SVGElement("text");
    var tleft = data.lineLeft;
    var tx = data.lineEndX, ty = data.lineEndY+5;
    var tpositon = tleft ? 'start' : 'end';
    text.attr({"font-family":"Arial", "font-size":"12", "y":ty,"text-anchor":tpositon})
    //
    var tspan = new SVGElement("tspan");
    tspan.attr({"fill":"#253131"});
    var labelStr = data.label+':'+data.data;
    tspan.appendChild(document.createTextNode(labelStr));
    text.appendChild(tspan);
    textGroup.appendChild(text);
    //reset
    var width = text.element.getBBox().width+5;
    tx = tleft ? tx - width : tx + width;
    //limit
    if(data.lineLimit){
      var limit = data.lineLimit;
      var limitOffset = 15;
      if(limit == 'y'){
        tpositon = 'middle';
        tx = data.lineEndX;
        ty = data.lineTop ? data.lineEndY - limitOffset: data.lineEndY + limitOffset;
      }
    }
    text.attr({"width":width,"x":tx,"y":ty,"text-anchor":tpositon})
  },
  drawPiePiece : function(opts){
    var me = this;
    var config = me.config;
    //
    var x = opts.centerX,
        y = opts.centerY,
        start = opts.startRadians,
        // end = opts.endRadians - 0.0001,
        end = config.anim ? opts.animEndRadians : opts.endRadians;
        end -= 0.0001,
        outerRadius = opts.outerRadius,
        innerRadius = opts.innerRadius,
        cosStart = Math.cos(start),
        sinStart = Math.sin(start),
        cosEnd = Math.cos(end),
        sinEnd = Math.sin(end),
        longArc = end - start < Math.PI ? 0 : 1;
    var cmds = [
      'M',
      x + outerRadius * cosStart,
      y + outerRadius * sinStart,
      'A', // arcTo
      outerRadius, // x outerRadius
      outerRadius, // y outerRadius
      0, // slanting
      longArc, // long or short arc
      1, // clockwise
      x + outerRadius * cosEnd,
      y + outerRadius * sinEnd,
      'L',
      x + innerRadius * cosEnd,
      y + innerRadius * sinEnd,
      'A', // arcTo
      innerRadius, // x outerRadius
      innerRadius, // y outerRadius
      0, // slanting
      longArc, // long or short arc
      0, // clockwise
      x + innerRadius * cosStart,
      y + innerRadius * sinStart,
      'Z' // close
    ];
    return cmds.join(' ');
  },
  drawLableLine: function(opts){
    var me = this;
    var defaultRadians = Math.PI/18;
    var defaultWidth = 15;
    var limitLong = 25;
    //
    var x = opts.centerX,
        y = opts.centerY,
        end = opts.endRadians - 0.001,
        outerRadius = opts.outerRadius,
        cosEnd = Math.cos(end),
        sinEnd = Math.sin(end);
    var point = {
      x : Math.round(x + outerRadius * cosEnd),
      y: Math.round(y + outerRadius * sinEnd)
    }
    point.x += 0.5, point.y += 0.5;
    var left = point.x<x ? true : false;
    var top = point.y<y ? true : false;
    //limit Line
    var checkX = Math.abs(point.x - x), checkY = Math.abs(point.y - y);
    var sign;
    if(checkX<1 || checkY<1){
      var toPoint;
      if(checkX<1){
        sign = 'y';
        toPoint = {
          x : point.x,
          y : top ? (y-outerRadius - limitLong) : 
                    (y+outerRadius + limitLong)
          }
      }else{
        sign = 'x';
        toPoint = {
          x : left ? (x-outerRadius - limitLong) : 
                    (x+outerRadius + limitLong),
          y : point.y
        }
      }
      var cmds = [
        'M',
        point.x,
        point.y,
        'L',
        toPoint.x,
        toPoint.y
      ];
      //data
      opts.lineLimit = sign;
      opts.lineLeft = left;
      opts.lineTop = top;
      opts.lineEndX = toPoint.x,
      opts.lineEndY = toPoint.y;
      return cmds.join(' ');
    }
    //normal line
    var offsetPoint = {
      x: Math.round(Math.tan(defaultRadians)*point.x),
      y: Math.round(Math.tan(defaultRadians)*point.y)
    }
    var toPoint = {
      x: left ? point.x - offsetPoint.x : point.x + offsetPoint.x,
      y: top ? point.y - offsetPoint.y : point.y + offsetPoint.y
    }
    var cmds = [
      'M',
      point.x,
      point.y,
      'L',
      toPoint.x,
      toPoint.y,
      'L',
      left ? toPoint.x-defaultWidth : toPoint.x+defaultWidth,
      toPoint.y
    ];
    //data
    opts.lineLeft = left;
    opts.lineEndX = left ? toPoint.x-defaultWidth : toPoint.x+defaultWidth,
    opts.lineEndY = toPoint.y;
    return cmds.join(' ');
  }
}
//SVG元素
var SVGElement = function(){
  //初始化操作
  this.test = true;
  this.element = null;
  this.shadows;
  this.init.apply(this, arguments);
}
SVGElement.prototype = {
  init: function(){
    var me = this;
    me.createElement(arguments[0]);
  },
  attr: function(setters){
    var me = this;
    for(var a in  setters){
      me.element.setAttribute(a,setters[a])
    }
  },
  createElement: function(tag){
    var me = this;
    me.element = document.createElementNS(svgNS,tag);
  },
  appendChild: function(child){
    var me = this;
    child instanceof SVGElement ? child = child.element : -1;
    me.element ? me.element.appendChild(child) : me.appendChild(child);
  }
}

//extend
window.svgCharts = svgCharts;

})();