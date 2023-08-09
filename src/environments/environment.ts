export const environment = {
  production: false,
  enableServerLitogs: false,
  PROD_NAME: 'https://www.moglix.com',

  // UNCOMMENT THIS FOR PROD ENV all 3 variables
  // BASE_URL: 'https://apinew.moglix.com/nodeApi/v1',
  // BASE_URL_V2: 'https://apinew.moglix.com/nodeApi/v2', 
  // APP_BASE_URL: 'https://api.moglix.com',
  
  // COMMENT THIS FOR QA ENV all 3 variables
  BASE_URL: 'https://nodeapiqa.moglilabs.com/nodeApi/v1',
  BASE_URL_V2: 'https://nodeapiqa.moglilabs.com/nodeApi/v2',
  APP_BASE_URL: 'https://apiqa.moglilabs.com',

  IMAGE_ASSET_URL: '/',
  SOCKET_URL: "https://socketqa.moglilabs.com",  
  IMAGE_BASE_URL: 'https://cdn.moglix.com/',
  DOCUMENT_URL: 'https://document.moglix.com/', 
  DEPLOY_URL: 'https://cdn.moglix.com/online/qa/pwa/bundles/',
  CDN_IMAGE_URL: 'https://cdn.moglix.com/',
  GTM_ANALYTICS_CODE: 'GTM-WW4R83Z',
  ADOBE_ANALYTIC_SCRIPT: '//assets.adobedtm.com/055f91edd8ef/2cc21fe6ff8d/launch-3511f938e1fe-staging.min.js',
  LOG_FILE_PATH: "/var/log/moglix/online/pwa/",
  buildVersion: '25.7',
  SOCIAL_LOGIN: {
    google: {
      clientId:
        "122641287206-9abv091pefhcp1dukt0qnjnncsckdt07.apps.googleusercontent.com",
    },
    facebook: {
      clientId: "775243655917959",
      apiVersion: "v2.4",
    },
  },
  AB_TESTING: {
    NAME: 'ENV_A',
    STATUS: false,
  },
  NEW_CMS_IDS: {
    // Use this with APInew
    PRIMARY_BANNER: "cm915657",
    SECONDARY_BANNER_ADS: "cm973381",
    FEATURE_BRANDS: "cm312585",
    BEST_SELLER: "cm136360",
    SAFETY: "cm325516",
    CAT_B: "cm814985",
    CAT_C: "cm196070",
    CAT_D: "cm454649",
    CAT_E: "cm358138",
    CAT_F: "cm933249",
    CAT_G: "cm416640",
    CAT_H: "cm814985",
    FEATURE_ARRIVAL: "cm976581",
    SECONDARY_CAROUSEL_DATA:"cm336308"
  },
  // NEW_CMS_IDS: {
  //    // Use this with nodeApiQA
  //   PRIMARY_BANNER: "cm915657",
  //   SECONDARY_BANNER_ADS: "cm973381",
  //   FEATURE_BRANDS: "cm312585",
  //   BEST_SELLER: "cm136360",
  //   SAFETY: "cm325516",
  //   CAT_B: "cm814985",
  //   CAT_C: "cm196070",
  //   CAT_D: "cm454649",
  //   CAT_E: "cm358138",
  //   CAT_F: "cm933249",
  //   CAT_G: "cm416640",
  //   CAT_H: "cm814985",
  //   FEATURE_ARRIVAL: "cm977811",
  // },
  logger:true
};
