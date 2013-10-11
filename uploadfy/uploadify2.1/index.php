<!DOCTYPE HTML>
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<title>UploadiFive Test</title>
<script src="http://localhost:8086/js/plugin/jquery/jquery-1.9.1.min.js" type="text/javascript"></script>
<!-- <script src="swfobject.js" type="text/javascript"></script> -->
<script src="jquery.uploadify.v2.1.0.js" type="text/javascript"></script>
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
		<!-- <a href="javascript:$('#file_upload').uploadify('upload','*')">Upload Files</a> -->
	</form>

	<script type="text/javascript">
		<?php $timestamp = time();?>
		$(function() {
			$('#file_upload').uploadify({
				'formData'     : {
					'timestamp' : '<?php echo $timestamp;?>',
					'token'     : '<?php echo md5('unique_salt' . $timestamp);?>'
				},
				// swf           : 'uploadify.swf',
    //     uploader      : 'uploadify.php',
        'simUploadLimit': 2,
				'auto': true,
				'uploader'      : 'uploadify.swf',
				'script' : 'uploadify.php',
				'multi':true,
				onSelect: function(){
					// console.log('ooooo')

				},
				onUpload: function(){
					console.log('aaaaa')
				},
				onProgress: function(file,event){
					// console.log();
				}
				// 'multi': true,
				// 'simUploadLimit': 2
			});
		});
	</script>
</body>
</html>