/*
多个元素：理解Sizzle

jQuery使用的选择器引擎叫Sizzle，Sizzle可以为你的函数提供多元素操作（例如对所有类名相同的元素）。这是jQuery几个优秀的特性之一，但这也是你在开发插件过程中需要考虑的事情。即使你不准备为你的插件提供多元素支持，但为这做准备仍然是一个很好的实践。
*/

function($) {

    // 向jQuery中被保护的“fn”命名空间中添加你的插件代码，用“pluginName”作为插件的函数名称
    $.fn.pluginName = function(options) {

        // 返回“this”（函数each（）的返回值也是this），以便进行链式调用。
        return this.each(function() {

            // 此处运行代码，可以通过“this”来获得每个单独的元素
            // 例如： $(this).show()；
            var $this = $(this);
            
        });

    }

})(jQuery);

/*
在以上示例代码中，我并不是用 each（）在我的选择器中每个元素上运行代码。在那个被 each（）调用的函数的局部作用域中，你可以通过this来引用每个被单独处理的元素，也就是说你可以通过$(this)来引用它的jQuery对象。在局部作用域中，我用$this变量存储起jQuery对象，而不是每次调用函数的时候都使用$(this)，这会是个很好的实践。当然，这样做并不总是必要的；但我已经额外把它包含在我的代码中。还有要注意的是，我们将会对每个单独方法都使用 each（），这样到时我们就可以返回我们需要的值，而不是一个jQuery对象。
*/



// 下面是一个例子，假如我们的插件支持一个 val 的方法，它可以返回我们需要的值：
$('#element').pluginName('val');
// 会返回我们需要的值，而不是一个jQuery对象


//ex2

(function($) {
 
    // 在我们插件容器内，创造一个公共变量来构建一个私有方法
    var privateFunction = function() {
        // code here
    }
 
    // 通过字面量创造一个对象，存储我们需要的共有方法
    var methods = {
        // 在字面量对象中定义每个单独的方法
        init: function() {
 
            // 为了更好的灵活性，对来自主函数，并进入每个方法中的选择器其中的每个单独的元素都执行代码
            return this.each(function() {
                // 为每个独立的元素创建一个jQuery对象
                var $this = $(this);
 
                // 执行代码
                // 例如： privateFunction();
                // 创建一个默认设置对象
                var defaults = {
                    propertyName: 'value',
                    onSomeEvent: function() {}
                }
 
                // 使用extend方法从options和defaults对象中构造出一个settings对象
                var settings = $.extend({}, defaults, options);
 
                // 执行代码
            });
        },
        destroy: function() {
            // 对选择器每个元素都执行方法
            return this.each(function() {
                // 执行代码
            });
        }
    };
 
    $.fn.pluginName = function() {
        // 获取我们的方法，遗憾的是，如果我们用function(method){}来实现，这样会毁掉一切的
        var method = arguments[0];
 
        // 检验方法是否存在
        if(methods[method]) {
 
            // 如果方法存在，存储起来以便使用
            // 注意：我这样做是为了等下更方便地使用each（）
            method = methods[method];
 
        // 如果方法不存在，检验对象是否为一个对象（JSON对象）或者method方法没有被传入
        } else if( typeof(method) == 'object' || !method ) {
 
            // 如果我们传入的是一个对象参数，或者根本没有参数，init方法会被调用
            method = methods.init;
        } else {
 
            // 如果方法不存在或者参数没传入，则报出错误。需要调用的方法没有被正确调用
            $.error( 'Method ' +  method + ' does not exist on jQuery.pluginName' );
            return this;
        }
 
        // 调用我们选中的方法
        // 再一次注意我们是如何将each（）从这里转移到每个单独的方法上的
        return method.call(this);
 
    }
 
})(jQuery);


//完整ex：http://blog.jobbole.com/30550/
// Shawn Khameneh
// ExtraordinaryThoughts.com
 
(function($) {
    var privateFunction = function() {
        // 代码在这里运行
    }
 
    var methods = {
        init: function(options) {
            return this.each(function() {
                var $this = $(this);
                var settings = $this.data('pluginName');
 
                if(typeof(settings) == 'undefined') {
 
                    var defaults = {
                        propertyName: 'value',
                        onSomeEvent: function() {}
                    }
 
                    settings = $.extend({}, defaults, options);
 
                    $this.data('pluginName', settings);
                } else {
                    settings = $.extend({}, settings, options);
                }
 
                // 代码在这里运行
 
            });
        },
        destroy: function(options) {
            return $(this).each(function() {
                var $this = $(this);
 
                $this.removeData('pluginName');
            });
        },
        val: function(options) {
            var someValue = this.eq(0).html();
 
            return someValue;
        }
    };
 
    $.fn.pluginName = function() {
        var method = arguments[0];
 
        if(methods[method]) {
            method = methods[method];
            arguments = Array.prototype.slice.call(arguments, 1);
        } else if( typeof(method) == 'object' || !method ) {
            method = methods.init;
        } else {
            $.error( 'Method ' +  method + ' does not exist on jQuery.pluginName' );
            return this;
        }
 
        return method.apply(this, arguments);
 
    }
 
})(jQuery);