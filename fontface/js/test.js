/*
* TEST
*/

(function(win){

	var test = {
		a: 'aaa',

		init: function(){
			console.log('init');
			
		}
	};

	//
	win.TEST = test;
	test.init();
})(window);