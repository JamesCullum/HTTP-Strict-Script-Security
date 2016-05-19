 chrome.tabs.query({currentWindow: true, active: true}, function(tab) {
	tab = tab[0];
	var host = tab.url.match(/^.+?:\/\/(?:www\.)?(.*?\.[A-Za-z]{2,10}|localhost)\//)[1];
	var loadHost = loadConfig(host);
	if(!loadHost)
	{
		chrome.pageAction.setIcon({"tabId":tab.id, path:"/img/icon_grey.png"});
		chrome.pageAction.setTitle({"tabId":tab.id, title:"State expired"});
		chrome.pageAction.setPopup({tabId:tab.id, popup:""});
		return window.close();
	}
	var currentCache = loadCache(host);
	
	chrome.pageAction.getTitle({tabId:tab.id}, function(tabTitle) {
		if(tabTitle == "Store unavailable")
		{
			document.getElementById("info").innerHTML = "The HSSS Store is not available or invalid.";
		}
		else if(tabTitle == "Unverified Update available")
		{
			document.getElementById("info").innerHTML = "The parent certificate has changed and a security breach is likely.<br>Version: "+currentCache.version+" // Expires: "+getExpirationDate(loadHost);
			document.getElementsByTagName("body")[0].style.height = "35px;"
		}
		else if(tabTitle == "Verified Update available")
		{
			var store = JSON.parse(sessionStorage.getItem("store-checked-"+host));
			document.getElementById("info").innerHTML = "<h4>Update to "+store.current.version.replace(/[^\d\.]/g,"")+"</h4><p>"+store.current.changes.replace(/[^\w\,\-\.\!\/\"\'\: ]/g)+"</p>";
			document.getElementById("button").style.display = "block";
			document.getElementById("button").addEventListener('click', function() {
				removeDomain(host);
				chrome.tabs.reload(tab.id);
				window.close();
			});
		}
		else if(tabTitle == "Strict Script Security enabled")
		{
			document.getElementById("info").innerHTML = "Version: "+currentCache.version+" // Expires: "+getExpirationDate(loadHost);
		}
		else return;
	});
});

function getExpirationDate(loadHost)
{
	var expire = loadHost.validTo;
	var date = new Date(expire*1000);
	return formatDate(date);
}

function formatDate(date)
{
	return padNum(date.getDate())+"."+padNum(date.getMonth()+1)+"."+date.getFullYear()+" "+padNum(date.getHours())+":"+padNum(date.getMinutes());
}

function padNum(num)
{
	if(num < 9) return "0"+num;
	else return num;
}

