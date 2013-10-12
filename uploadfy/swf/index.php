<!DOCTYPE HTML>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>UploadiFive Test</title>
<script src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js" type="text/javascript"></script>
<!-- <script src="swfobject.js" type="text/javascript"></script> -->
<script src="jquery.uploadify.js" type="text/javascript"></script>
<link rel="stylesheet" type="text/css" href="uploadify.css">
<style type="text/css">
body {
	font: 13px Arial, Helvetica, Sans-serif;
}
</style>
</head>

<body>
	<h1>Uploadify Demo</h1>
	<form>
		<div id="queue"></div>
		<input id="file_upload" name="file_upload" type="file" multiple="true">
	</form>

	<script type="text/javascript">
		<?php $timestamp = time();?>
		// $(function() {
		// 	$('#file_upload').uploadify({
		// 		'formData'     : {
		// 			'timestamp' : '<?php echo $timestamp;?>',
		// 			'token'     : '<?php echo md5('unique_salt' . $timestamp);?>'
		// 		},
		// 		// auto: false,
		// 		method 				: 'get',
		// 		// debug		 			: true,
		// 		swf           : 'uploadify.swf',
  //       uploader      : 'uploadify.php',
  //       simUploadLimit: 2,
  //       'fileTypeDesc' : 'Image Files',
  //       'fileTypeExts' : '*.gif; *.jpg; *.png'
		// 		// 'auto': true,
		// 		// 'uploader'      : 'uploadify.allglyphs.swf',
		// 		// 'script' : 'uploadify.php',
		// 		// 'multi': true
		// 		// 'simUploadLimit': 2
		// 	});
		// });

$(function() {
	$("#file_upload").uploadify({
		height        : 30,
		swf           : 'uploadify.swf',
		uploader      : 'uploadify.php',
		width         : 120
	});
});
	</script>
</body>
</html>