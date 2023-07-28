export const environment = {
  production: true,
  enableServerLogs: true,
  PROD_NAME: 'https://www.moglix.com',
  BASE_URL: 'https://apinew.moglix.com/nodeApi/v1',
  BASE_URL_V2: 'https://apinew.moglix.com/nodeApi/v2',
  APP_BASE_URL: 'https://api.moglix.com',
  IMAGE_ASSET_URL: 'https://cdn.moglix.com/online/prod/pwa/bundles/',
  SOCKET_URL: "https://socket.moglix.com",
  IMAGE_BASE_URL: 'https://cdn.moglix.com/',
  DOCUMENT_URL: 'https://document.moglix.com/',
  CDN_IMAGE_URL: 'https://cdn.moglix.com/',
  GTM_ANALYTICS_CODE: 'GTM-PMPXQQ',
  ADOBE_ANALYTIC_SCRIPT: '//assets.adobedtm.com/055f91edd8ef/2cc21fe6ff8d/launch-fd00645b6c3b.min.js',
  buildVersion: '25.7',
  LOG_FILE_PATH: "/var/log/moglix/online/pwa/",
  SOCIAL_LOGIN: {
    "google": {
      "clientId": "218214169080-34r0q5pi8gkg1kmgl6ehpkicm7jhihau.apps.googleusercontent.com"
    },
    "facebook": {
      "clientId": "775243655917959",
      "apiVersion": "v2.5"
    }
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
  logger: false
};
