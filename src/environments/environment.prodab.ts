export const environment = {
  production: true,
  PROD_NAME: 'https://www.moglix.com', 
  BASE_URL: 'https://apinew.moglix.com/nodeApi/v1',
  //BASE_URL: 'https://nodeapiqa.moglilabs.com/nodeApi/v1',
  IMAGE_ASSET_URL: 'https://cdn.moglix.com/online/prod/pwa-ab/bundles/',
  SOCKET_URL: "https://socket.moglix.com",
  IMAGE_BASE_URL: 'https://cdn.moglix.com/',
  DOCUMENT_URL: 'https://document.moglix.com/',
  SOCIAL_LOGIN: {
    "google": {
      "clientId": "122641287206-9abv091pefhcp1dukt0qnjnncsckdt07.apps.googleusercontent.com"
    },
    "facebook": {
      "clientId": "775243655917959",
      "apiVersion": "v2.4"
    }
  },
  AB_TESTING: {
		NAME: 'ENV_B',
		STATUS: true,
	}
};
