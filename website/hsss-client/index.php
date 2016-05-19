<?php 
header('Strict-Script-Security: Max-Age=600; Repository=JamesCullum/HTTP-Strict-Script-Security; Public-Key=04f267b25d83736759ea145986df02eda6bc682f5c5fc9fe5b53d6d22089ab0ec5728c489897ef3fc3bfac0dd7056760ceed884a80461b9f29b3686738e94ae720');
?>
<!DOCTYPE html>
<html>
	<head>
		<title>Notizbuch</title>
		<link rel="stylesheet" href="style.css">
	</head>
	<body>
		<form class="formContainer" id="loginForm">
			<input type="text" id="bookName" placeholder="Name des Notizbuches" title="Gib einen Namen ohne Sonderzeichen ein" pattern="^\w+$" required>
			<input type="submit" id="doLogin" value="Notizbuch öffnen">
		</form>
		<form class="formContainer" id="editorForm">
			<textarea id="editor" placeholder="Inhalt des Notizbuches..."></textarea>
			<input type="submit" id="doSave" value="Notizbuch speichern">
		</form>
		
		<script type="text/javascript" src="js/container.js"></script>
	</body>
</html>