define("examples/aa/1.0.0/main1-debug", [ "jquery-debug", "./a1-debug" ], function(require, exports, module) {
    var $ = require("jquery-debug");
    // exports
    var str = $("#testp").text();
    $("#testp").html("bbbb &gt;");
    console.log(str);
    // debugger
    // console.log(module.uri)
    module.exports = {
        a: 1
    };
    var moduleA = require("./a1-debug");
});

define("examples/aa/1.0.0/a1-debug", [ "jquery-debug" ], function(require, exports, module) {
    var $ = require("jquery-debug");
    // exports
    // console.log('I am module A');
    var str = '<div style="color:red;">I am module A</div>';
    $("body").append(str);
});
