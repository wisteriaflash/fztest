var CENTERX = 155;      
var CENTERY = 87;      
var RX = 75;     
var RY = 75;      
var DROP = 8;      
var STARTANGLE = 0;
var testhand=0;     
var COLORS = new Array( "green","blue", "red", "orange", "yellow" );      
var VALUES = {"正常":1,"警告":1,"次要":0,"主要":0,"严重":1};      
function init()
{         
           getValues( continueWithValues );     
}  
function continueWithValues( values )
{         //drawPieChart( values, COLORS );
      test(); 
}     
function getValues( continuation ) {
 
   continuation( VALUES );
 } 
 var testCount=0;
 //var alarmvalues=new Array(0,0,0,0,0);
 function test()
 {
    if(testhand)
 {
    window.clearTimeout(testhand);
 }
 testhand=window.setTimeout('test()',10000);
  for ( var i in VALUES )
  {
 if((testCount%2==0)&&(i=='正常'))
 {
    VALUES[i]=testCount
 }
 if((testCount%3==0)&&(i=='警告'))
 {
    VALUES[i]=testCount
 }
 if((testCount%4==0)&&(i=='次要'))
 {
    VALUES[i]=testCount
 }
 if((testCount%5==0)&&(i=='主要'))
 {
    VALUES[i]=testCount
 }
 if((testCount%6==0)&&(i=='严重'))
 {
    VALUES[i]=testCount
 }
 }
 testCount++;
  var elem = svgdocument.getElementByIdx("canvas");//根据id找到节点对象
  try{
     elem.removeChild(svgdocument.getElementByIdx("chartpie"));
  elem.removeChild(svgdocument.getElementByIdx("legendlable"));
  }
  catch( e)
  {
  }
 drawPieChart(VALUES, COLORS );
 //getValues( continueWithValues );
 }
function drawPieChart( values, colors ) {
   var canvas = document.getElementByIdx("canvas");
   var normValues = normalizeValues( values );
 
   var lastAngle = STARTANGLE;
   var count = 0;
 
   var chart = document.createElement_xNS("http://www.w3.org/2000/svg", "g");
   chart.setAttribute( "id", "chartpie");
   canvas.appendChild( chart );
 
   var legend = document.createElement_xNS("http://www.w3.org/2000/svg", "g");
   legend.setAttribute( "id", "legendlable");
   canvas.appendChild( legend );
 
   for ( var i in values ) {
    if(normValues[i]>0)
    {
   addWedge( chart, 0, CENTERX, CENTERY, RX, RY,
       lastAngle, lastAngle + 360*normValues[ i ], colors[count] );
    }
   var label = createLabel( 2, (20+20*count), colors[ count ], i, values[ i ] );
   legend.appendChild( label );
  
   lastAngle += 360*normValues[i];
   count++;
    
   }
 
   chart.setAttribute( "transform", "scale(1,.8)" );
 }
 
 function normalizeValues( values ) {
   var total = 0;
   var ret = new Object();
   for ( var i in values ) {
     total += values[ i ];
   }
   for ( var i in values ) {
     ret[ i ] = values[ i ] / total;
   }
   return ret;
 }
 
 function addWedge( chart, phi, x, y, rx, ry, start, stop, color ) {
   var degPerRad = Math.PI/180.0;
   var e1x = rx*Math.cos((phi+start)*degPerRad);
   var e1y = rx*Math.sin((phi+start)*degPerRad);
   var e2x;
   var e2y;
   var e3x;
   var e3y;
   if ( stop - start < 180 ) {
     e2x = ry*Math.cos((phi+stop)*degPerRad);
     e2y = ry*Math.sin((phi+stop)*degPerRad);
     e3x = e2x;
     e3y = e2y;
   } else {
     e2x = ry*Math.cos((phi+180)*degPerRad);
     e2y = ry*Math.sin((phi+180)*degPerRad);
     e3x = ry*Math.cos((phi+stop)*degPerRad);
     e3y = ry*Math.sin((phi+stop)*degPerRad);
   }
 
   var wedge = document.createElement_xNS("http://www.w3.org/2000/svg", "path");
   wedge.setAttribute("class", "wedge");
   wedge.setAttribute("stroke", color);
   wedge.setAttribute("fill", color);
   wedge.setAttribute("fill-opacity", 1);
   wedge.setAttribute("d", "M" + x+","+y+" "+ (x+e1x) + "," + (y+e1y) +
                      "A" + rx + "," + ry + " " + phi + " 0,1 " + (x+e2x) + "," + (y+e2y) +
                      "A" + rx + "," + ry + " " + phi + " 0,1 " + (x+e3x) + "," + (y+e3y) +"z" );
 
   var dropLine = document.createElement_xNS("http://www.w3.org/2000/svg", "path");
   dropLine.setAttribute("stroke", color);
   dropLine.setAttribute("stroke-width", 2);
   dropLine.setAttribute("fill", color);
   dropLine.setAttribute("fill-opacity", 0.7);
   if ( start < 180 ) {
     if ( stop >= 180 ) {
       e2x = ry*Math.cos((phi+180)*degPerRad);
       e2y = ry*Math.sin((phi+180)*degPerRad);
     }
     dropLine.setAttribute("d", "M" + (x+e1x) + "," + (y+e1y) +" "+ (x+e1x) + "," + (y+e1y+DROP) +
                           "A" + rx + "," + ry + " " + phi + " 0,1 " + (x+e2x) + "," + (y+e2y+DROP) +
                           "l" + "0,-" + DROP +"z" );
     chart.appendChild( dropLine );
   }
   chart.appendChild( wedge );
 }
 
 function createLabel( x, y, color, name, value ) {
   var label = document.createElement_xNS("http://www.w3.org/2000/svg", "g");
   var text = document.createElement_xNS("http://www.w3.org/2000/svg", "text");
   var box = document.createElement_xNS("http://www.w3.org/2000/svg", "rect");
 
   box.setAttribute( "x", x );
   box.setAttribute( "y", y );
   box.setAttribute( "height", 20 );
   box.setAttribute( "width", 10 );
   box.setAttribute( "stroke", color );
   box.setAttribute( "fill", color );
   box.setAttribute( "fill-opacity", 1 );
 
   text.setAttribute( "x", x + 15 );
   text.setAttribute( "y", y + 12 );
   text.appendChild( document.createTextNode( name +","+value+"个" ) );
  label.setAttribute( "id", "pielabel");
   label.appendChild( box );
   label.appendChild( text );
 
   return label;
 } 