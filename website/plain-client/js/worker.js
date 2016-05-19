var loginForm = document.getElementById("loginForm");
var bookName = document.getElementById("bookName");
var editorForm = document.getElementById("editorForm");
var editor = document.getElementById("editor");

loginForm.addEventListener("submit", function(event) {
	event.preventDefault();
	
	var request = new XMLHttpRequest();
	request.open('POST', 'storage.php', true);
	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	
	request.onload = function() {
		if (request.status == 200) 
		{
			var readData = request.responseText;
			if(readData.length)
			{
				var password = prompt("Gib das Passwort ein:","");
				try {
					readData = sjcl.decrypt(password, request.responseText);
				} catch(err) {
					alert("Passwort falsch");
					readData = "";
				}
			}
			editor.value = readData;
			editorForm.style.display = 'block';
		}
	};
	
	request.send("action=read&book="+bookName.value);
});

editorForm.addEventListener("submit", function(event) {
	event.preventDefault();
	
	var saveData = editor.value;
	if(saveData.length)
	{
		var password = prompt("Gib ein Zugangspasswort ein:","");
		saveData = sjcl.encrypt(password, saveData);
	}
	
	var request = new XMLHttpRequest();
	request.open('POST', 'storage.php', true);
	request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
	request.send("action=write&book="+bookName.value+"&data="+encodeURIComponent(saveData));
});