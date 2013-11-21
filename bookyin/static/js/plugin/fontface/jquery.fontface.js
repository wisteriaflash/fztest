/*
 * FontFace - jQuery Plugin
 * Helps you face up to the battlefield of @font-face challenges
 *
 * Copyright (c) 2010 Craig Sharkie
 *
 * Version: 1.3 (11/11/2010)
 *
 * Dual licensed under the MIT and GPL licenses:
 *   http://www.opensource.org/licenses/mit-license.php
 *   http://www.gnu.org/licenses/gpl.html
 */

;(function($){
 	$.fn.fontface = function(options) {
		var stacks = {
				serif : ", Times New Roman , serif",
				sansserif : ", Helvetica, Arial, sans-serif"
			},
			 defaults = {
				filePath: "/_fonts/",//change this to your font directory location
				fontFamily: "sans-serif",
				fontStack: false,
				fontStretch: "normal",
				fontStyle: "normal",
				fontVariant: "normal",
				fontWeight: "normal"
			},
			options = $.extend(defaults, options);

		options.fontFile = options.filePath + options.fileName;

		if (options.fontStack || options.fontFamily === "sans-serif") {
			if (options.fontStack && options.fontStack.indexOf(", ") === -1) {
				options.fontFamily = options.fontName + stacks[options.fontStack];
			}
			else if (options.fontStack && options.fontStack.indexOf(", ") !== -1) {
				var concat = (options.fontStack.substring(0,2) !== ", ") ? "" : ", ";
				options.fontFamily = options.fontName + concat + options.fontStack;
			}
			else {
				options.fontFamily = options.fontName + stacks.sansserif
			}
		}

		if (typeof options.fontFamily === "object") {
			options.fontFamily = options.fontFamily.join(", ");
		}

		if ($("#jQueryFontFace").length === 0) {//haven't already made one
			$("head").append($("<style type=\"text/css\" id=\"jQueryFontFace\"/>"));
		}

		var FF = {
			selector: function (obj) {
				var tag = obj.tagName,
					className = (obj.className) ? "." + obj.className.split(" ").join(".") : "",
					id = ($(obj).attr("id")) ? "#" + $(obj).attr("id") : "";
					
				return tag + id + className;
			},
			create: function (obj) {
				var fontFace = "",
					rule = "",
					fontfamily = options.fontFamily.replace(/\s/g,"").replace(/,/g,""),
					fontfamilyStyleWeight = fontfamily + options.fontStyle + options.fontWeight,
					selector = FF.selector(obj);

				if (!$("#jQueryFontFace").data(fontfamilyStyleWeight)) {
					fontFace = [
						"@font-face {",
							"\tfont-family: \"" + options.fontName + "\";",
							"\tsrc: url('" + options.fontFile + ".eot');",
							"\tsrc: local('☺'), url('" + options.fontFile + ".eot?#iefix') format('embedded-opentype'), url('" + options.fontFile + ".woff') format('woff'), url('" + options.fontFile + ".ttf') format('truetype'), url('" + options.fontFile + ".svg#" + fontfamily + "') format('svg');",
							"\tfont-stretch: " + options.fontStretch + ";",
							"\tfont-style: " + options.fontStyle + ";",
							"\tfont-variant: " + options.fontVariant + ";",
							"\tfont-weight: " + options.fontWeight + ";",
						"}"
					].join("\n");
					$("#jQueryFontFace").data(fontfamilyStyleWeight, true);
				}
				$(obj).css('font-family',FF.quote(options.fontFamily));
				// if (!$("#jQueryFontFace").data(selector)) {
				// 	rule = [
				// 		selector + " {",
				// 			"\tfont-family: " + FF.quote(options.fontFamily) + " !important;",
				// 		"}"
				// 	].join("\n");
				// 	$("#jQueryFontFace").data(selector, selector);
				// }

				return (fontFace.length || rule.length) ? fontFace + "\n" + rule + "\n" : "";
			},
			quote: function (string) {
				var split = string.split(", "),
					length = split.length;
				for (var i = 0; i < length; i += 1) {
					if (split[i].indexOf(" ") !== -1) {
						split[i] = '"' + split[i] + '"';
					}
				}
				return split.join(", ");
			}
		};

		return this.each(function() {
			var str = $("#jQueryFontFace").text() + FF.create(this);
			try {
			   $("#jQueryFontFace").text(str);
			 } 
			catch (e) {//fix IE
				var str1 = String($("#jQueryFontFace").get(0).styleSheet.cssText);
				$("#jQueryFontFace").get(0).styleSheet.cssText = str+str1;
			 }
		});
	};
})(jQuery);