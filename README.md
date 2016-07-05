# HTTP-Strict-Script-Security
This concept and example is the result of a scientific paper i made for University, DHBW Stuttgart, Germany. The german paper will be linked here after its grading. The goal of the project is to allow website owners securing the javascript code on their website by enabling signed versioning on GitHub. This repository contains the prototype of implementation as a Chrome browser extension and an example web application to show the necessary changes for implementing HSSS.

## Basic Concept
One of the main weaknesses of clientside cryptographic web applications is that application code can be manipulated by the owner of the server infrastructure or a government even if HTTPS is enabled. The concept is similiar to HSTS (HTTP Strict Transport Security) - at the first visit of the website, the browser is told to cache the javascript files. As soon as the code on the website changes, the user gets notified about the new version but keeps running on the old code until the user has explicitly chosen to update. This way changes have to be announced and can not be enabled for certain users or for a short time only. HSSS has more security features as well - all javascript files need to be hosted on GitHub.com and all changes need to be published there, and all files need to be cryptographically signed.

## How to use HSSS as a user?
Currently there is only an implementation for Chrome due to its high market share. You need to install a browser extension to enable HSSS on your computer. [Download the content of this folder](https://github.com/JamesCullum/HTTP-Strict-Script-Security/tree/master/chrome-addon) and unpack it on your disk. In Chrome, go to Settings > Browser Extensions, tick "Developer mode" and click on "Load unpacked extension" to choose the folder of the extension.

HSSS will be automatically activated on websites and visible on the top right hand site of the browser. A gray icon means that the current website doesnt support HSSS, a green icon indicates that you are running the newest version of the application, a yellow one means that an update is available and a red one means that the security of the current website may have been breached (invalid signatures). You can click on the icon to get more informations and update to the current version.

## How to use HSSS on my website?
![Infographic](https://raw.githubusercontent.com/JamesCullum/HTTP-Strict-Script-Security/master/infographic.jpg)

#### Initial Setup
- If you dont have already, create a public GitHub repository for your application
- Create a secp256r1 key pair and keep your private key at a safe place ([Generate online here](http://kjur.github.io/jsrsasign/sample-ecdsa.html))
- Pack all javascript files into a single file called current-release.js ([Example](https://github.com/JamesCullum/HTTP-Strict-Script-Security/blob/master/strict-script-security/current-release.js))
- Hash & sign this file with your private key using SHA256 with ECDSA
  - [You can use the example from above](http://kjur.github.io/jsrsasign/sample-ecdsa.html) if you use the browser developer tools to make the single-line input to a textarea
- Create a file called store.json that contains the current version number, a change description and the signed hash ([Example](https://github.com/JamesCullum/HTTP-Strict-Script-Security/blob/master/strict-script-security/store.json))
- Create a folder called "strict-script-security" in the root directory of your repository and upload current-release.js and store.json to it
- Set up your server to broadcast the following header on **every** page load (see infgraphic as example above)
  > Strict-Script-Security: Max-Age=[Caching Time In Seconds]; Repository=[Username slash Name of Repository on Github]; Public-Key=[secp256r1 public key]
#### Updating the application
- Update the current-release.js on your repository to contain the current code
- Hash & sign the file as done before
- Update the store.json with the new version, hash and a description of what has been changed

## F.A.Q
- Shall i enable HSSS even if only a few people use it?
  - Yes you should, theres no drawback from enabling this additional feature. You can still embed all scripts into the website as before and it will run for all visitors as you know.
- My website doesnt work for everyone using HSSS
  - If a website provides a HSSS header and the users browser can understand it, it will cancel loading any kind of scripts on your website, both inline javascript and embedded files. Make sure to have all code necessary for running the application in your current-release.js
- How can i help the project?
  - Implementations for other browsers and code auditing are especially welcome. Please create issues if you find problems and create a pull request for implementations for other browsers.
- Are there any weak points?
  - A decentralized approach instead of using GitHub would be better for load balancing
  - The local storage in Chrome is limited to 5MB. This limit goes per "domain" and a browser extension is a single domain, thus all domains have a joint storage of 5MB.
  - The javascript library jsrsa is being used for signatures & verifications and could contain backdoors (unlikely) or security issues
  - The initial loading of a HSSS enabled website is synchronous and therefore slow
  - It is currently incompatible to other browsers