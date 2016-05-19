chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
	if(tab.status != "complete") return;
	
	var host = tab.url.match(/^(https?):\/\/(?:www\.)?(.*?\.[A-Za-z]{2,10}|localhost)\//);
	if(!host || (host[1] == "http" && host[2] != "localhost")) return;
	host = host[2];
	var loadHost = loadConfig(host);

	var parentHost = host.match(/^.*?\.?([\w\-\_]+\.[A-Za-z]{2,10}|localhost)$/)[1];
	var loadParent = loadConfig(parentHost);
	
	var isEnabled = false;
	if( host != parentHost && host && parentHost )
	{
		if( loadParent.subdomains == 1 ) isEnabled = true;
	}
	if( loadHost ) isEnabled = true;
	
	if(isEnabled)
	{
		var currentCache = loadCache(host);
		chrome.pageAction.onClicked.removeListener();
		
		getStore(host, true, function(store) {
			if(!store)
			{
				chrome.pageAction.setIcon({"tabId":tabId, path:"/img/icon_grey.png"});
				chrome.pageAction.setTitle({"tabId":tabId, title:"Store unavailable"});
				chrome.pageAction.show(tabId);
			}
			else if( store.current.version.replace(/[^\d\.]/g,"") != currentCache.version )
			{
				getURL(buildRawURL(loadHost.repository, 'strict-script-security/current-release.js'), true, function(currentContainer) {
					if(!doVerify(currentCache.pubKey, currentContainer, store.current.hash))
					{
						chrome.pageAction.setIcon({"tabId":tabId, path:"/img/icon_red.png"});
						chrome.pageAction.setTitle({"tabId":tabId, title:"Unverified Update available"});
						chrome.pageAction.show(tabId);
					}
					else
					{
						chrome.pageAction.setIcon({"tabId":tabId, path:"/img/icon_yellow.png"});
						chrome.pageAction.setTitle({"tabId":tabId, title:"Verified Update available"});
						chrome.pageAction.show(tabId);
					}
				});
			}
			else
			{
				chrome.pageAction.setIcon({"tabId":tabId, path:"/img/icon_green.png"});
				chrome.pageAction.setTitle({"tabId":tabId, title:"Strict Script Security enabled"});
				chrome.pageAction.show(tabId);
			}
			chrome.tabs.executeScript(tabId, {"code":currentCache.content, "runAt":"document_end"});
			chrome.pageAction.setPopup({"tabId":tabId, popup:"/popup.html"});
		});
	}
	else chrome.pageAction.hide(tabId);
});

chrome.webRequest.onHeadersReceived.addListener(
	function(details) {
		var host = details.url.match(/^(https?):\/\/(?:www\.)?(.*?\.[A-Za-z]{2,10}|localhost)\//);
		if(!host || (host[1] == "http" && host[2] != "localhost")) return;
		host = host[2];
		var loadHost = loadConfig(host);

		var parentHost = host.match(/^.*?\.?([\w\-\_]+\.[A-Za-z]{2,10}|localhost)$/)[1];
		var loadParent = loadConfig(parentHost);
		
		if(details.type == "main_frame")
		{
			var headers = details.responseHeaders;
			var requestConfig = true;
			
			if( host != parentHost && host && parentHost)
			{
				if( loadParent.subdomains == 1 ) requestConfig = false;
			}
			if( loadHost ) requestConfig = false;
			
			if(requestConfig)
			{
				for(var i=0;i<headers.length;i++)
				{
					var header_row = headers[i].name.trim().toLowerCase();
					if( header_row == "strict-script-security" )
					{
						var saver = {};
						var hasRequired = 0;
						var setup = headers[i].value.split(";");

						for(var o=0;o<setup.length;o++)
						{
							var setup_row = setup[o].trim().toLowerCase();
							
							if( setup_row == "includesubdomains" ) saver.subdomains = 1;
							var maxAge = setup_row.match(/^max\-?age=(\d+)$/);
							if( maxAge )
							{
								saver.validTo = getTime() + parseInt(maxAge[1]);
								hasRequired++;
							}
							var gitRepo = setup_row.match(/^repository=(\w+?\/[\w\-]+)$/);
							if( gitRepo )
							{
								saver.repository = gitRepo[1];
								hasRequired++;
							}
							var signKey = setup_row.match(/^public\-?key=(\w+)$/);
							if( signKey )
							{
								saver.pubKey = signKey[1];
								hasRequired++;
							}
						}
						if(!("subdomains" in saver)) saver.subdomains = 0;
						
						if( hasRequired == 3 )
						{
							saveval(getStorage(host), JSON.stringify(saver));
							getStore(host, false, function(store) {
								if(!store || !("current" in store) || !("version" in store.current) || !("hash" in store.current) || !("changes" in store.current))
								{
									console.error("Invalid Store");
									return removeDomain(host);
								}
								requestConfig = false;
								
								getURL(buildRawURL(saver.repository, 'strict-script-security/current-release.js'), false, function(currentContainer) {
									if(!doVerify(saver.pubKey, currentContainer, store.current.hash))
									{
										console.error("Verification of current script failed");
										return removeDomain(host);
									}
									
									var cacheObj = { "version":store.current.version.replace(/[^\d\.]/g,""), "hash":sha256(currentContainer), "content":currentContainer };
									saveval(getStorage(host)+"-cache", JSON.stringify(cacheObj));
								});
							});
						}
						else console.error("Required fields missing");
					}
				}
			}
			
			if(!requestConfig)
			{
				var returnHeader = details.responseHeaders.filter(function(item) {
					return (item.name.trim().toLowerCase() != "content-security-policy");
				});
				returnHeader.push({name:"Content-Security-Policy",value:"default-src 'self'; script-src 'none';"});
				
				return {responseHeaders: returnHeader};
			}
		}
		else if(details.type == "script")
		{
			var check = false;
			if( host != parentHost && host && parentHost)
			{
				if( loadParent.subdomains == 1 ) check = true;
			}
			if( loadHost ) check = true;
			
			if(check) return {cancel: true};
		}
	}, {
		urls: ["<all_urls>"],
		types: ["main_frame","script"]
	}, ["blocking", "responseHeaders"]
);