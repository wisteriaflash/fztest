define(function(require, exports, module){
    var $ = require('jquery');
    // exports
    // console.log('I am module A');
    var str = '<div style="color:red;">I am module A&amp;</div><p>a&#32;a&#32;a&#32;&lt;</p>';
    $('body').append(str);

    //test array unique
    var arr = [2,9,10,2,7,9,'a','bbb','a','bc'];
    var temp =[], result = [], item;
    for(var i=0, len=arr.length; i<len; i++){
        item = arr[i];
        if(!temp[item]){
            temp[item] = 1;
            result.push(item);
        }
    }
    console.log(result);

    var arr2 = [{left:120,id:'a11'},{left:100,id:'a22'},{left:9,id:'a33'}];
    function sortNumber(a,b){
        return a.left-b.left;
    }
    var result2 = arr2.sort(sortNumber);
    // console.log(result2);
});