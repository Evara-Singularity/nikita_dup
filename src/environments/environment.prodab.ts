export const environment = {
  production: true,
  PROD_NAME: 'https://www.moglix.com',
  BASE_URL: 'https://apinew.moglix.com/nodeApi/v1',
  //BASE_URL: 'https://nodeapiqa.moglilabs.com/nodeApi/v1',
  IMAGE_ASSET_URL: 'https://cdn.moglix.com/online/prod/pwa-ab/bundles/',
  SOCKET_URL: "https://socketqa.moglilabs.com",
  IMAGE_BASE_URL: 'https://cdn.moglix.com/',
  DOCUMENT_URL: 'https://document.moglix.com/',
  CDN_IMAGE_URL: 'https://cdn.moglix.com/',
  GTM_ANALYTICS_CODE: 'GTM-PKRGCH2',
  ADOBE_ANALYTIC_SCRIPT: '//assets.adobedtm.com/055f91edd8ef/2cc21fe6ff8d/launch-fd00645b6c3b.min.js',
  buildVersion: '10.1',
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
    NAME: 'ENV_B',
    STATUS: true,
  },
  IDS_MAP: {
    //new ids for mobile

    cm136360: "BEST_SELLER",
    cm915657: "BANNER",
    //'CM881267':'FANS_BLOWER',
    cm325516: "SAFETY",
    cm889618: "FLY_OUT",
    cm814985: "CAT_B",
    cm196070: "CAT_C",
    cm454649: "CAT_D",
    cm358138: "CAT_E",
    cm933249: "CAT_F",
    cm416640: "CAT_G",
    cm973381: "MIDDLE_BANNER_ADS",
    cm312585: "FEATURE_BRANDS",
    cm976581: "FEATURE_ARRIVAL",
  },
  CMS_IDS: {
    // new layout ids for mobile
    BEST_SELLER: "id=cm136360",
    BANNER: "id=cm915657",
    //FANS_BLOWER :'id=cm881267',
    SAFETY: "id=cm325516",
    FLY_OUT: "id=cm889618",
    CAT_A: "id=cm325516",
    CAT_B: "id=cm814985",
    CAT_C: "id=cm196070",
    CAT_D: "id=cm454649",
    CAT_E: "id=cm358138",
    CAT_F: "id=cm933249",
    CAT_G: "id=cm416640",
    CAT_H: "id=cm814985",
    MIDDLE_BANNER_ADS: "cm973381",
    CATEGORY_EXTRAS: "cm867481",
    FEATURE_BRANDS: "cm312585",
    FEATURE_ARRIVAL: "cm976581",
    MANUFACTURER_STORE: "macizo_m",
    MANUFACTURER_STORE_BRAND: "macizo",
  },
  logger: false
};
