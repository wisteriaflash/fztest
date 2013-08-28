define(function(require, exports, module){
    var $ = require('jquery');
    // exports
    var str = $('#testp').text();
    $('#testp').html('bbbb &gt;');
    console.log(str);
    // debugger
    // console.log(module.uri)
    module.exports = {a:1};

    var moduleA = require('./a1');
    // console.log(exports == module.exports)
});