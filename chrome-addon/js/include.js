function getStore(host, async, onload)
{
	var config = loadConfig(host);
	if(config)
	{
		getURL(buildRawURL(config.repository, 'strict-script-security/store.json'), async, function(store) {
			if(!store) return onload(false);
			onload(JSON.parse(store));
		});
	}
	else onload(false);
}

function buildRawURL(repository, path)
{
	return 'https://raw.githubusercontent.com/'+repository+'/master/'+path;
}

function loadConfig(host)
{
	var dbName = getStorage(host);
	var loadHost = loadval(dbName, false);
	if(loadHost) 
	{
		tempLoadHost = JSON.parse(loadHost);
		if(getTime() > tempLoadHost.validTo)
		{
			console.warn(host+" expired");
			removeDomain(host);
			loadHost = false;
		}
		else loadHost = tempLoadHost;
	}
	return loadHost;
}

function loadCache(host)
{
	var dbName = getStorage(host);
	var loadHost = loadval(dbName+"-cache", false);
	if(loadHost) loadHost = JSON.parse(loadHost);
	return loadHost;
}

function doVerify(public_key, data, signed)
{
	var sig = new KJUR.crypto.Signature({"alg": "SHA256withECDSA", "prov": "cryptojs/jsrsa"});
	sig.initVerifyByPublicKey({'ecpubhex': public_key, 'eccurvename': "secp256r1"});
	sig.updateString(data);
	return sig.verify(signed);
}

function getURL(url, async, onload)
{
	var cacheKey = "sessionCache-"+sha256(url);
	var storeCache = sessionStorage.getItem(cacheKey);
	if(storeCache) return onload(storeCache);

	var xhr = new XMLHttpRequest();
	xhr.open("GET", url, async);
	if(async)
	{
		xhr.onload = function (e) {
			if (xhr.readyState === 4) 
			{
				if (xhr.status === 200) 
				{
					sessionStorage.setItem(cacheKey, xhr.responseText);
					onload(xhr.responseText);
				}
				else return onload(false);
			}
		};
		xhr.onerror = function (e) {
			return onload(false);
		};
		xhr.send();
	}
	else
	{
		xhr.send();
		sessionStorage.setItem(cacheKey, xhr.responseText);
		return onload(xhr.responseText);
	}
}

function getStorage(host)
{
	return "HSSS-"+host;
}

function getTime()
{
	return Math.floor(Date.now() / 1000);
}

function removeDomain(host)
{
	var dbName = getStorage(host);
	deleteval(dbName);
	deleteval(dbName+"-cache");
	return true;
}

function loadval(key, def)
{
	var retval = localStorage.getItem(key);
	if( retval == undefined ) retval = def;
	return retval;
}

function saveval(key, val)
{
	return localStorage.setItem(key, val);
}

function deleteval(key)
{
	return localStorage.removeItem(key);
}