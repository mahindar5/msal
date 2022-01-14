const msalConfig = {
	auth: {
		clientId: 'db449c77-51e4-4b92-a816-6289af6eb193',
		authority: 'https://login.microsoftonline.com/72f988bf-86f1-41af-91ab-2d7cd011db47/'

	}
};

const msalInstance = new msal.PublicClientApplication(msalConfig);
msalInstance.handleRedirectPromise().then((resp) => {
	if (resp !== null) {
		console.log('LoggedIn')
	} else {
		console.log("acquiring token using redirect");
		msalInstance.acquireTokenRedirect({}).catch((err) => console.error(err));
	}
});
