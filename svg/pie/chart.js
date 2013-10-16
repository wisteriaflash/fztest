(function(){
//公共变量
// var data;
var svgNS = "http://www.w3.org/2000/svg";
var wrapper, 
  svg,

  UNDEFINED,

  math = Math,
  mathRound = math.round,
  mathFloor = math.floor,
  mathCeil = math.ceil,
  mathMax = math.max,
  mathMin = math.min,
  mathAbs = math.abs,
  mathCos = math.cos,
  mathSin = math.sin,
  mathPI = math.PI,
  deg2rad = mathPI * 2 / 360,
  PX = 'px',
  NONE = 'none',
  M = 'M',
  L = 'L';
//render 所需变量
var svgw = 1200, svgh = 420;
var gridBBox = {width:1000, height:320, x:100, y:20};
var defaultOptions = {
  colors: ['#4572A7', '#AA4643', '#89A54E', '#80699B', '#3D96AE',
    '#DB843D', '#92A8CD', '#A47D7C', '#B5CA92'],
  symbols: ['circle', 'diamond', 'square', 'triangle', 'triangle-down']
}



//公共方法
/**
 * Check for string
 * @param {Object} s
 */
function isString(s) {
  return typeof s === 'string';
}

/**
 * Check for object
 * @param {Object} obj
 */
function isObject(obj) {
  return typeof obj === 'object';
}

/**
 * Extend an object with the members of another
 * @param {Object} a The object to be extended
 * @param {Object} b The object to add to the first one
 */
function extend(a, b) {
  var n;
  if (!a) {
    a = {};
  }
  for (n in b) {
    a[n] = b[n];
  }
  return a;
}

/**
 * Set or get an attribute or an object of attributes. Can't use jQuery attr because
 * it attempts to set expando properties on the SVG element, which is not allowed.
 *
 * @param {Object} elem The DOM element to receive the attribute(s)
 * @param {String|Object} prop The property or an abject of key-value pairs
 * @param {String} value The value if a single property is set
 */
function attr(elem, prop, value) {
  var key,
    setAttribute = 'setAttribute',
    ret;

  // if the prop is a string
  if (isString(prop)) {
    // set the value
    if (defined(value)) {

      elem[setAttribute](prop, value);

    // get the value
    } else if (elem && elem.getAttribute) { // elem not defined when printing pie demo...
      ret = elem.getAttribute(prop);
    }

  // else if prop is defined, it is a hash of key/value pairs
  } else if (defined(prop) && isObject(prop)) {
    for (key in prop) {
      elem[setAttribute](key, prop[key]);
    }
  }
  return ret;
}

/**
 * Returns true if the object is not null or undefined. Like MooTools' $.defined.
 * @param {Object} obj
 */
function defined(obj) {
  return obj !== UNDEFINED && obj !== null;
}


//渲染类
//图表
var Chart = function(config){
  //gloable vars
  // data = config;
  //private vars
  var chart = this;
  var axis, series, render;
  var pixX, pixY;
  chart.config = config;
  //init
  this.init();
}
Chart.prototype = {
  init: function(){
    var chart = this,
      config = chart.config;
    wrapper = document.getElementById("J_wrapper");
    //svg element
    svg = new SVGElement("svg");
    svg.attr({"version":"1.1", "width":svgw, "height":svgh, "xmlns":svgNS});
    wrapper.appendChild(svg.element);
    // createGraph();

    //axis

    chart.render = new SVGRenderer();
    chart.axis = new Axis(chart, config);
    chart.series = new Series(chart, config); 

  }
}


//坐标轴
var Axis = function(chart,config){
  //vars
  var axis = this;
  axis.config = config;
  axis.chart = chart;
  //vars
  var maxY = null, minY = null;
  var sumY, xlen, ylen;
  //init
  this.init();
}
Axis.prototype = {
  init: function(){
    var axis = this;

    //render
    axis.renderGrid();
    axis.renderAxis();
  },
  renderGrid: function(){
    var axis = this,
      chart = axis.chart;
    //get max|min value
    var maxItem, minItem, itemDataArr;
    for(item in axis.config.series){
      itemDataArr = axis.config.series[item].data;
      //max
      maxItem = Math.max.apply(null,itemDataArr); 
      axis.maxY ? -1 : axis.maxY = maxItem;
      axis.maxY = axis.maxY<maxItem ? maxItem : axis.maxY;
      //min
      minItem = Math.min.apply(null,itemDataArr); 
      axis.minY ? -1 : axis.minY = minItem;
      axis.minY = axis.minY>minItem ? minItem : axis.minY;
    }
    //取整
    axis.maxY = axis.maxY%5!=0 ? Math.ceil(axis.maxY/5)*5 : axis.maxY;
    axis.minY = axis.minY%5!=0 ? Math.floor(axis.minY/5)*5 : axis.minY;
    axis.sumY = axis.maxY - axis.minY;
    chart.pixY = parseInt(gridBBox.height/axis.sumY);
    axis.ylen = axis.sumY/5;
    //修正
    gridBBox.width = parseInt(gridBBox.width/(chart.config.xAxis.categories.length))*chart.config.xAxis.categories.length;
    gridBBox.height = chart.pixY*axis.sumY;
    gridBBox.x2 = gridBBox.x + gridBBox.width;
    gridBBox.y2 = gridBBox.y + gridBBox.height;
    // console.log(gridBBox);

    //grid draw
    var gridG = new SVGElement("g");
    gridG.attr({"class":"svg-grid","id":"J_gridGroup"});
    for(var i=0, node; i<=axis.ylen; i++){
      sy = i*chart.pixY*5+0.5+gridBBox.y;
      dstr = "M "+gridBBox.x+" "+sy+" L "+(gridBBox.width+gridBBox.x)+" "+sy;
      node = new SVGElement("path");
      node.attr({"fill":"red","stroke":"#C0C0C0","stroke-width":"1","z-index":"1","d":dstr})
      gridG.appendChild(node);
    }
    svg.appendChild(gridG);
  },
  //渲染坐标值
  renderAxis: function(){
    var axis = this,
      chart = axis.chart;
    //AxisX draw
    var axisG = new SVGElement("g");
    axisG.attr({"id":"J_axisGroup","class":"svg-axis"});
    axis.xlen = chart.config.xAxis.categories.length;
    chart.pixX = parseInt(gridBBox.width/axis.xlen);
    var tx, ty;
    //
    for(var i=0; i<axis.xlen; i++){
      //text
      tx = gridBBox.x+i*chart.pixX+chart.pixX/2;
      ty = gridBBox.y2+20;
      var text = new SVGElement("text");
      text.attr({"font-family":"Arial", "font-size":"14", "x":tx, "y":ty,"width":chart.pixX, "text-anchor":"middle"})
      
      var tspan = new SVGElement("tspan");
      tspan.attr({"x":tx});
      tspan.appendChild(document.createTextNode(chart.config.xAxis.categories[i]));
      text.appendChild(tspan);
      axisG.appendChild(text);
      
      //line
      var line = new SVGElement("path");
      lx = gridBBox.x+(i+1)*(chart.pixX)-0.5;
      lineDstr = "M"+lx+" "+gridBBox.y2+" L "+lx+" "+(gridBBox.y2+5);
      line.attr({"fill":"none","stroke":"#C0C0C0","z-index":"1","x":lx, "y":gridBBox.y2,"width":1, "height":"5", "d":lineDstr});
      axisG.appendChild(line);
    }
    svg.appendChild(axisG);

    //AxisY draw
    axisG = new SVGElement("g");
    axisG.attr({"class":"svg-axis"});
    // axisG
    for(var i=0, l=axis.sumY/5, node; i<=l; i++){
      var text = new SVGElement("text");
      sy = i*chart.pixY*5+((chart.pixY*5)/2)+5;
      text.attr({"x":gridBBox.x-15, "y":sy, "width":gridBBox.x, "text-anchor":"end"});
      
      var tspan = new SVGElement("tspan");
      tspan.attr({"x":text.element.getAttribute("x")});
      tspan.appendChild(document.createTextNode(axis.maxY-5*i));
      text.appendChild(tspan);
      axisG.appendChild(text);
    }
    svg.appendChild(axisG);
  }
}
//数据点
var Series = function(chart,config){
  var series = this;
  series.chart = chart;
  series.dataArr = config.series;
  //vars
  var perX, 
    seriesGroup;
  this.xlen = config.xAxis.categories.length;
  //init
  this.init();
}
Series.prototype = {
  init: function(){
    var series = this;
    series.perX = gridBBox.width/series.xlen;
    
    var seriesGroup = new SVGElement("g");
    seriesGroup.attr({'class':'chart-series-group'})
    series.seriesGroup = seriesGroup;
    //render
    series.rederSeries();
    svg.appendChild(seriesGroup);
  },
  rederSeries: function(){
    var series = this,
      dataArr = series.dataArr,
      chart = series.chart;
    
    var l = dataArr.length;
    for(var i=0; i<l; i++){
      var seriesG = new SVGElement("g");
      seriesG.attr({'class':'chart-series'});
      series.renderSeriesItem(dataArr[i],seriesG,defaultOptions.colors[i],defaultOptions.symbols[i]);
      series.seriesGroup.appendChild(seriesG);
    }
  },
  renderSeriesItem: function(idata,group,color,symbol){
    var series = this,
      chart = series.chart;
    // group.appendChild(line);
    var lineArr = [];
    var l = idata.data.length, lineStr;
    for(var i=0; i<l; i++){
      var p = new SVGElement("path");
      var ppx = series.perX*(1/2+i)+gridBBox.x;
      var ppy = (gridBBox.height-chart.pixY*idata.data[i])-gridBBox.y;
      var pstr = chart.render.symbol(symbol,ppx-4,ppy-4,8,8)
      pstr = pstr.join(' ');

      p.attr({"fill":color,"d":pstr,"stroke":"none","stroke-width":"1"});
      group.appendChild(p);
      
      //line vars
      ppx = mathRound(ppx*10)/10, ppy = mathRound(ppy*10)/10; //保留一位小数
      i==0 ? lineArr.push(M,ppx,ppy) : lineArr.push(L,ppx,ppy);
    }
    
    var line = new SVGElement("path");
    line.attr({"d":lineArr.join(" "),"fill":"none","stroke-width":"2","stroke":color});
    group.element.insertBefore(line.element,group.element.firstChild);
    line.shadow(true);  //add shadow
  }
}
//提示框
var ToolTip = function(){

};
ToolTip.prototype = {
  init: function(){

  }
}

//事件跟踪
var MouseTracker = function(){

};
MouseTracker.prototype = {
  init: function(){

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
    // this.createElement(arguments)
    this.createElement(arguments[0]);
  },
  attr: function(setters){
    for(var a in  setters){
      this.element.setAttribute(a,setters[a])
    }
  },
  createElement: function(tag){
    var svgNS = "http://www.w3.org/2000/svg";
    this.element = document.createElementNS(svgNS,tag);
  },
  appendChild: function(child){
    child instanceof SVGElement ? child = child.element : -1;
    this.element ? this.element.appendChild(child) : this.appendChild(child);
  },

  /*
  * add a shadow to elment. The elment must be in the DOM if want to add a shadow
  * @param{Boolean}apply
  */
  shadow: function(apply,group){
    var shadows = [],
      i,
      shadow,
      element = this.element,

      // compensate for inverted plot area
      // transform = this.parentInverted ? '(-1,-1)' : '(1,1)';
      transform = '(-1,-1)';


    if (apply) {
      for (i = 1; i <= 3; i++) {
        shadow = element.cloneNode(0);
        attr(shadow, {
          'isShadow': 'true',
          'stroke': 'rgb(0, 0, 0)',
          'stroke-opacity': 0.05 * i,
          'stroke-width': 7 - 2 * i,
          'transform': 'translate' + transform,
          'fill': NONE
        });

        if (group) {
          group.element.appendChild(shadow);
        } else {
          element.parentNode.insertBefore(shadow, element);
        }

        shadows.push(shadow);
      }

      this.shadows = shadows;
    }
    return this;
  }
}

//SVG渲染
var SVGRenderer = function () {
  this.init.apply(this, arguments);
};
SVGRenderer.prototype = {
  init: function (){

  },
  /**
   * Draw a symbol out of pre-defined shape paths from the namespace 'symbol' object.
   *
   * @param {Object} symbol
   * @param {Object} x
   * @param {Object} y
   * @param {Object} radius
   * @param {Object} options
   */
  symbol: function (symbol, x, y, width, height, options) {

    var obj,

      // get the symbol definition function
      symbolFn = this.symbols[symbol],

      // check if there's a path defined for this symbol
      path = symbolFn && symbolFn(
        mathRound(x),
        mathRound(y),
        width,
        height,
        options
      );
      return path;
  },
  /**
   * An extendable collection of functions for defining symbol paths.
   */
  symbols: {
    'circle': function (x, y, w, h) {
      var cpw = 0.166 * w;
      return [
        M, x + w / 2, y,
        'C', x + w + cpw, y, x + w + cpw, y + h, x + w / 2, y + h,
        'C', x - cpw, y + h, x - cpw, y, x + w / 2, y,
        'Z'
      ];
    },

    'square': function (x, y, w, h) {
      return [
        M, x, y,
        L, x + w, y,
        x + w, y + h,
        x, y + h,
        'Z'
      ];
    },

    'triangle': function (x, y, w, h) {
      return [
        M, x + w / 2, y,
        L, x + w, y + h,
        x, y + h,
        'Z'
      ];
    },

    'triangle-down': function (x, y, w, h) {
      return [
        M, x, y,
        L, x + w, y,
        x + w / 2, y + h,
        'Z'
      ];
    },
    'diamond': function (x, y, w, h) {
      return [
        M, x + w / 2, y,
        L, x + w, y + h / 2,
        x + w / 2, y + h,
        x, y + h / 2,
        'Z'
      ];
    },
    'arc': function (x, y, w, h, options) {
      var start = options.start,
        radius = options.r || w || h,
        end = options.end - 0.000001, // to prevent cos and sin of start and end from becoming equal on 360 arcs
        innerRadius = options.innerR,
        open = options.open,
        cosStart = mathCos(start),
        sinStart = mathSin(start),
        cosEnd = mathCos(end),
        sinEnd = mathSin(end),
        longArc = options.end - start < mathPI ? 0 : 1;

      return [
        M,
        x + radius * cosStart,
        y + radius * sinStart,
        'A', // arcTo
        radius, // x radius
        radius, // y radius
        0, // slanting
        longArc, // long or short arc
        1, // clockwise
        x + radius * cosEnd,
        y + radius * sinEnd,
        open ? M : L,
        x + innerRadius * cosEnd,
        y + innerRadius * sinEnd,
        'A', // arcTo
        innerRadius, // x radius
        innerRadius, // y radius
        0, // slanting
        longArc, // long or short arc
        0, // clockwise
        x + innerRadius * cosStart,
        y + innerRadius * sinStart,

        open ? '' : 'Z' // close
      ];
    }
  },
}



//init vars
window.Svgcharts = {};
extend(Svgcharts,{
  Chart: Chart,
  Axis: Axis,
  Series: Series,
  SVGRenderer: SVGRenderer
});


})();