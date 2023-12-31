import { InjectionToken } from "@angular/core";
import { environment } from "environments/environment";

let siemaOptionsObject: {
  outerWrapperClass: ['product_block_container'],
  innerWrapperClass: ['product_block']
};

export const CONSTANTS = {
  PROD: environment.PROD_NAME,
  GATEWAY_API: environment.BASE_URL_V3,
  NEW_MOGLIX_API: environment.BASE_URL,
  NEW_MOGLIX_API_V2: environment.BASE_URL_V2,
  NEW_MOGLIX_API_V3: environment.BASE_URL_V3,
  APP_BASE_URL: environment.APP_BASE_URL,
  IMAGE_ASSET_URL: environment.IMAGE_ASSET_URL,
  SOCKET_URL: environment.SOCKET_URL,
  IMAGE_BASE_URL: environment.IMAGE_BASE_URL,
  DOCUMENT_URL: environment.DOCUMENT_URL,
  SECRET_KEY: 'moglix@4241',
  SEND_OTP_PRIVATE_KEY: environment.SEND_OTP_PRIVATE_KEY,
  SOCIAL_LOGIN: environment.SOCIAL_LOGIN,
  AB_TESTING: environment.AB_TESTING,
  CDN_IMAGE_PATH: environment.CDN_IMAGE_URL,
  LANGUAGE_EN: 'ENGLISH',
  LANGUAGE_HI: 'HINDI',
  COUNTRY_NAME: 'india',
  BROWSER_AGENT_TOKEN: new InjectionToken<string>('browserName'),
  LOG_TOKEN_SERVER: new InjectionToken<string>('logTokenServer'),
  LOG_TOKEN_MAIN: new InjectionToken<string>('logTokenMain'),
  SERVER_CLIENT_IP: new InjectionToken<string>('serverClientIp'),
  SPEED_TEST_IMAGE: 'https://cdn.moglix.com/cms/flyout/Images_2021-09-15_15-45-36_Images_2020-06-03_16-42-50_SafetyImage-min.png', // ~500 KB image
  CDN_LOTTIE_PATH:'https://unpkg.com/@lottiefiles/lottie-player@latest/dist/lottie-player.js',
  MODEL_JS_CDN_PATH: "https://ajax.googleapis.com/ajax/libs/model-viewer/3.1.1/model-viewer.min.js",
  pwaImages: {
    imgFolder: 'b/I/P/B/d'
  },
  DEVICE: {
    device: 'mobile'
  },
  PRODUCT_CARD_MODULE_NAMES: {
    PLP: 'plp',
    PDP: 'pdp',
    SEARCH: 'search',
  },
  META: {
    ROBOT: 'index,follow',
    ROBOT1: 'noindex,follow',
    ROBOT2: 'noindex,nofollow'
  },
  CMS_TEXT: {
    HEADER_TOP_TEXT: "Flat Rs.100 OFF on First Order Above Rs.499 | USE CODE: WELCOME100",
    CART_PAYMENT_METHOD_TEXT: "Flat Rs.100 OFF on First Order Above Rs.499 | USE CODE: WELCOME100"
  },
  FILTER_GA_ID: [114000000, 116111700, 211000000],
  CONST_VAR: {
    shippingcharge: '99',
    FreeShippingMinAmount: '999',
  },
  GLOBAL: {
    PLP_PAGE_COUNT: 20,
    loginByEmail: 1,
    loginByPhone: 2,
    newAddress: 9999,
    created: 1,
    updated: 2,
    creditDebitCard: 1,
    netBanking: 2,
    wallet: 3,
    emi: 4,
    bnpl : 12, 
    cashOnDelivery: 5,
    neftRtgs: 6,
    savedCard: 7,
    upi: 8,
    paytmUpi: 9,
    bnplMap: 
    {
      retail :{
        LAZYPAY :{
          mode: "BNPL",
          type: 'LazyPay',
          active : false,
          bankcode : 'LAZYPAY',
          paymentId: 300,
          imgUrl: "lazypay.png"  
        },
        ICICIPL :{
          mode: "BNPL",
          type: 'ICICI Pay Later',
          active : false,
          bankcode : 'ICICIPL',
          paymentId: 301,
          imgUrl: "icicipl.png"  
        }

      }

    },
    walletMap: {
      tax: {
        walletPaytm: {
          mode: "PAYTM",
          type: 'PAYTM',
          bankcode: null,
          paymentId: 53,
          imgUrl: "paytm-wallet.png"
        },
        // walletFreecharge: {
        //   mode: "WALLET",
        //   type: "freecharge",
        //   bankcode: "FREC",
        //   paymentId: 66,
        //   imgUrl: "freecharge-wallet.png"
        // },
        // walletMobikwik: {
        //   mode: "WALLET",
        //   type: "mobikwik",
        //   bankcode: null,
        //   paymentId: 67,
        //   imgUrl: "mobikwik-wallet.png"
        // },
        walletAirtel: {
          mode: "WALLET",
          type: "airtelmoney",
          bankcode: "AMON",
          paymentId: 68,
          imgUrl: "airtel-wallet.png"
        },
        // walletOlamoney: {
        //   mode: "WALLET",
        //   type: "olamoney",
        //   bankcode: "OLAM",
        //   paymentId: 65,
        //   imgUrl: "ola-wallet.png"
        // },
        walletJio: {
          mode: "WALLET",
          type: 'jiomoney',
          bankcode: "FREC",
          paymentId: 69,
          imgUrl: "jiomoney-wallet.png"
        },
        walletMpesa: {
          mode: "WALLET",
          type: 'mpesa',
          bankcode: "FREC",
          paymentId: 70,
          imgUrl: "vodafonempesa-wallet.png"
        },
        walletPayZap: {
          mode: "WALLET",
          type: "payzapp",
          bankcode: "FREC",
          paymentId: 64,
          imgUrl: "payzapp-wallet.png"
        },
      },
      retail: {
        walletPaytm: {
          mode: "PAYTM",
          type: "PAYTM",
          bankcode: null,
          paymentId: 53,
          imgUrl: "paytm-wallet.png"
        },
        // walletFreecharge: {
        //   mode: "FREECHARGE",
        //   type: 'FREECHARGE',
        //   bankcode: "FREC",
        //   paymentId: 59,
        //   imgUrl: "freecharge-wallet.png"
        // },
        // walletMobikwik: {
        //   mode: "MOBIKWIK",
        //   type: "MOBIKWIK",
        //   bankcode: null,
        //   paymentId: 52,
        //   imgUrl: "mobikwik-wallet.png"
        // },
        walletAirtel: {
          mode: "AIRTEL",
          type: "AIRTEL",
          bankcode: "AMON",
          paymentId: 56,
          imgUrl: "airtel-wallet.png"
        },
        // walletOxigen: {
        //   mode: "OXIGEN",
        //   type: "OXIGEN",
        //   bankcode: "OXICASH",
        //   paymentId: 57,
        //   imgUrl: "oxigen-wallet.png"
        // },
        // walletOlamoney: {
        //   mode: "OLAMONEY",
        //   type: "OLAMONEY",
        //   bankcode: "OLAM",
        //   paymentId: 58,
        //   imgUrl: "ola-wallet.png"
        // },
        walletHdfcpay: {
          mode: "HDFCPAYZAPP",
          type: "HDFCPAYZAPP",
          bankcode: "PAYZ",
          paymentId: 61,
          imgUrl: "payzapp-wallet.png"
        }
      }
    },
    upiTez: 10,
    razorPay: 11,
    headerType: {
      default: 1,
      assist: 2,
    },
    expMons: [
      { key: "01", value: "JAN" },
      { key: "02", value: "FEB" },
      { key: "03", value: "MAR" },
      { key: "04", value: "APR" },
      { key: "05", value: "MAY" },
      { key: "06", value: "JUN" },
      { key: "07", value: "JUL" },
      { key: "08", value: "AUG" },
      { key: "09", value: "SEP" },
      { key: "10", value: "OCT" },
      { key: "11", value: "NOV" },
      { key: "12", value: "DEC" },
    ],
    default: {
      pageSize: 20,
      categoryListingPageSize: 20
    },
    codMin: 300,
    codMax: 30000,
    easyEMILimit: 3000,
    userType: {
      business: "business",
      online: "online",
    },
    auos: ["/dashboard", "/login", "/order-confirmation", "/search"],
  },
  clusterCategories: [
    {
      idCategory: "116000000",
      CategoryName: "Safety & PPE Supplies",
      category_image: "safety_ppe_supplies.png",
      category_url: "store/safety-ppe-supplies",
    },
    {
      idCategory: "116000000",
      CategoryName: "Office Stationery & Supplies",
      category_image: "office_stationery_supplies.png",
      category_url: "store/office-stationery-supplies",
    },
    {
      idCategory: "116000000",
      CategoryName: "Electrical Tools & Equipment",
      category_image: "electrical_tools_equipment.png",
      category_url: "store/electrical-tools-equipment",
    },
    {
      idCategory: "116000000",
      CategoryName: "Industrial Tools & Equipment",
      category_image: "industrial_tools_equipment.png",
      category_url: "store/industrial-tools-equipment",
    },
    {
      idCategory: "116000000",
      CategoryName: "Lab & Scientific Equipment",
      category_image: "medical_equipment_hospital_supplies.png",
      category_url: "store/lab-scientific-equipment",
    },
    {
      idCategory: "116000000",
      CategoryName: "Medical Care & Hospital Supplies",
      category_image: "medical_equipment_hospital_supplies.png",
      category_url: "store/medical-equipment-hospital-supplies",
    },
    {
      idCategory: "116000000",
      CategoryName: "Hardware & Plumbing Supplies",
      category_image: "plumbing-materials.png",
      category_url: "store/hardware-plumbing-supplies",
    },
  ],
  siemaCategories: [
    {
      label: "Bestsellers",
      dataKey: "bestSellerData",
      options: { selector: ".best-seller-siema", ...siemaOptionsObject },
    },
    {
      label: "SAFETY",
      dataKey: "safetyData",
      options: { selector: ".safety-siema", ...siemaOptionsObject },
      viewAllLink: ["/medical-supplies/215000000"],
    },
    {
      label: "Power Tools",
      dataKey: "powerData",
      options: { selector: ".power-siema", ...siemaOptionsObject },
      viewAllLink: [
        "/medical-supplies/diagnostic-instruments/thermometers/115251300",
      ],
    },
    {
      label: "Pumps & motors",
      dataKey: "pumpData",
      options: { selector: ".pump-siema", ...siemaOptionsObject },
      viewAllLink: [
        "/medical-supplies/diagnostic-instruments/respiratory-care-products/115251700",
      ],
    },
    {
      label: "ELECTRICALS",
      dataKey: "electricalData",
      options: { selector: ".electrical-siema", ...siemaOptionsObject },
      viewAllLink: ["/safety-and-security/respiratory-masks/116111600"],
    },
    {
      label: "OFFICE STATIONERY & SUPPLIES",
      dataKey: "officeData",
      options: { selector: ".office-siema", ...siemaOptionsObject },
      viewAllLink: ["/office-supplies/214000000"],
    },
    {
      label: "Medical Supplies",
      dataKey: "medicalData",
      options: { selector: ".medical-siema", ...siemaOptionsObject },
      viewAllLink: ["/medical-supplies/215000000"],
    },
    {
      label: "LED & LIGHTING",
      dataKey: "lightData",
      options: { selector: ".light-siema", ...siemaOptionsObject },
      viewAllLink: ["/lighting-luminaries/212000000"],
    },
  ],
  alphabet_arr: [
    "0-9",
    "A",
    "B",
    "C",
    "D",
    "E",
    "F",
    "G",
    "H",
    "I",
    "J",
    "K",
    "L",
    "M",
    "N",
    "O",
    "P",
    "Q",
    "R",
    "S",
    "T",
    "U",
    "V",
    "W",
    "X",
    "Y",
    "Z",
  ],
  NOT_FOUND_CATEGORY: [
    {
      "categoryCode": "116000000",
      "categoryName": "Safety",
      "link": "safety-and-security/116000000",
      "imageUrl": "https://img.moglimg.com/assets/img/safety.png"
    },
    {
      "categoryCode": "211000000",
      "categoryName": "Electricals",
      "link": "electricals/211000000",
      "imageUrl": "https://img.moglimg.com/assets/img/electricals.png"
    },
    {
      "categoryCode": "114000000",
      "categoryName": "Power Tools",
      "link": "power-tools/114000000",
      "imageUrl": "https://img.moglimg.com/assets/img/power_tool.png"
    },
    {
      "categoryCode": "128000000",
      "categoryName": "Pumps & Motors",
      "link": "pumps-motors/128000000",
      "imageUrl": "https://img.moglimg.com/assets/img/pump_motors.png"
    },
    {
      "categoryCode": "214000000",
      "categoryName": "Office Stationery & Supplies",
      "link": "office-supplies/214000000",
      "imageUrl": "https://img.moglimg.com/assets/img/office_supplies.png"
    },
    {
      "categoryCode": "215000000",
      "categoryName": "Medical Supplies",
      "link": "medical-supplies/215000000",
      "imageUrl": "https://img.moglimg.com/assets/img/medical.png"
    },
  ],
  ASSET_IMG: "assets/img/home_card.webp",
  SCHEMA: "https://schema.org",
  RAZORPAY: {
    CHECKOUT: "https://checkout.razorpay.com/v1/razorpay.js",
    IMAGE: "https://i.imgur.com/n5tjHFD.png",
    SUCCESS: "/paymentRazorPayWallet/success",
  },
  SL: {
    API: "/login/sociallogin",
    LINKEDIN_OAUTH:
      "https://www.linkedin.com/oauth/v2/authorization?client_id=",
    FB_OAUTH: "https://www.facebook.com/v2.8/dialog/oauth?client_id=",
    GOOGLE_OAUTH:
      "https://accounts.google.com/o/oauth2/v2/auth?response_type=token&client_id=",
  },
  MOGLIX_HAINA_LOGO: "https://statics.moglix.com/img/newsletter/int/2021/january/210121/moglixhaina_logo.png",
  GET_LAYOUT: "/cmsapi/getLayoutJsonByRequestParam?requestParam=",
  MOGLIX_HAINA_VIDEO: {
    url1: "https://www.youtube.com/embed/rc2J19iHhmA", 
    url2: "https://www.youtube.com/embed/1d-sZmcyOnc",
    url3: "https://www.youtube.com/embed/V7vw4qFHp0E",
    url4: "https://www.youtube.com/embed/6trNPkCGejc",
    url5: "https://www.youtube.com/embed/yyVtU7wsqtQ",
  },
  GET_PARENT_CAT: "/category/getparentcategoryjsonbody?requestType=",
  FB_URL: "https://www.facebook.com/dialog/share?app_id=775243655917959%20&display=popup&href=",
  TWITTER_URL: "https://twitter.com/intent/tweet?url=",
  LINKEDIN_URL: "https://www.linkedin.com/shareArticle?url=",
  ByBankTransferInAdvance: "http://purl.org/goodrelations/v1#ByBankTransferInAdvance",
  ByCOD: "http://purl.org/goodrelations/v1#COD",
  ByPaymentMethodCreditCard: "http://purl.org/goodrelations/v1#PaymentMethodCreditCard",
  ByMasterCard: "http://purl.org/goodrelations/v1#MasterCard",
  ByVISA: "http://purl.org/goodrelations/v1#VISA",
  TEST_API: "https://newmoglix.moglix.com/test/testgetresponse",
  WHATS_APP_API: "https://api.whatsapp.com/send?phone=",
  SEO_HOME_ACCORDIANS: ['powerData', 'officeData', 'safetyData', 'pumpData', 'electricalData', 'medicalData'],
  IMAGE_SIZES_TYPE: ['xlarge', 'large', 'medium', 'small', 'thumbnail', 'icon'],
  NETWORK_SPEED_THRESHOD_LIMIT: 2,
  IMAGE_SIZES_REPLACE_DATA: {
    'icon': 'small',
    'thumbnail': 'medium',
    'small': 'large',
    'medium': 'xlarge',
    'large': 'xxlarge',
    'xlarge': 'xxlarge',
  },
  NEFT_AMOUNT_LMIT: 2000,
  EMI_MINIMUM_AMOUNT: 3000,
  CUSTOMER_CARE_TIME:{
    'call_timing_text': 'Call Timings: 9:00 AM - 6:00 PM (Monday to Saturday)'
  },
  DEFAULT_USER_NAME_PLACE_HOLDER:'User',
  SEARCH_ABT_FLAG: 'y',
  SEARCH_ONLINE_ABT_FLAG: 'y',
  MODULE_NAME: {
    HOME: 'HOME',
    PRODUCT_LISTING_PAGE: 'PRODUCT_LISTING_PAGE',
    DASHBOARD: 'DASHBOARD',
    CART: 'CART',
    QUICKORDER:'QUICKORDER',
    ORDER_FAILURE: 'ORDER_FAILURE',
    ORDER_CONFIRMATION: 'ORDER_CONFIRMATION',
    PRODUCT: 'PRODUCT'
  },
  SEARCH_WIDGET_KEYS: [
    'Shoes For Men',
    'Solar Panel',
    'Welding Machine',
    'Office Chair',
    'Fan'
  ],
  whatsAppBannerUrl:'https://api.whatsapp.com/send?phone=+919999049135&text=Hi&utm_source=moglixhomepage&utm_medium=pwaclicks&utm_campaign=homepagebanner',
  PAYMENT_MODE: [
    {
      id: 3,
      code: "DC",
      name: "creditDebitCard",
      mode: "DC",
      type: "creditDebitCard",
    },
    {
      id: 1,
      code: "CC",
      name: "creditDebitCard",
      mode: "CC",
      type: "creditDebitCard",
    },
    {
      id: 43,
      code: "162B",
      name: "Kotak Bank",
      mode: "NB",
      type: "netBanking",
    },
    {
      id: 50,
      code: "INGB",
      name: "ING Vysya Bank",
      mode: "NB",
      type: "netBanking",
    },
    {
      id: 44,
      code: "CSBN",
      name: "Catholic Syrian Bank",
      mode: "NB",
      type: "netBanking",
    },
    {
      id: 42,
      code: "DSHB",
      name: "Deutsche Bank",
      mode: "NB",
      type: "netBanking",
    },
    {
      id: 47,
      code: "SRSWT",
      name: "Saraswat Bank",
      mode: "NB",
      type: "netBanking",
    },
    {
      id: 3,
      code: "AXIB",
      name: "AXIS Bank NetBanking",
      mode: "NB",
      type: "netBanking",
    },
    {
      id: 12,
      code: "SBIB",
      name: "State Bank of India",
      mode: "NB",
      type: "netBanking",
    },
    {
      id: 41,
      code: "CITNB",
      name: "Citi Bank NetBanking",
      mode: "NB",
      type: "netBanking",
    },
    {
      id: 11,
      code: "ICIB",
      name: "ICICI Netbanking",
      mode: "NB",
      type: "netBanking",
    },
    {
      id: 48,
      code: "UBIBC",
      name: "Union Bank - Corporate Netbanking",
      mode: "NB",
      type: "netBanking",
    },
    {
      id: 45,
      code: "DCBCORP",
      name: "DCB Bank - Corporate Netbanking",
      mode: "NB",
      type: "netBanking",
    },
    {
      id: 5,
      code: "HDFB",
      name: "HDFC Bank",
      mode: "NB",
      type: "netBanking",
    },
    {
      id: 15,
      code: "BOIB",
      name: "Bank of India",
      mode: "NB",
      type: "netBanking",
    },
    {
      id: 46,
      code: "PNBB",
      name: "Punjab National Bank - Retail Banking",
      mode: "NB",
      type: "netBanking",
    },
    {
      id: 27,
      code: "KRKB",
      name: "Karnataka Bank",
      mode: "NB",
      type: "netBanking",
    },
    {
      id: 49,
      code: "CPNB",
      name: "Punjab National Bank-Corporate",
      mode: "NB",
      type: "netBanking",
    },
    {
      id: 61,
      code: "HDFCPAYZAPP",
      name: "hdfcpayzapp",
      mode: "HDFCPAYZAPP",
      type: "wallet",
    },
    {
      id: 60,
      code: "YESPAY",
      name: "yespay",
      mode: "YESPAY",
      type: "wallet",
    },
    {
      id: 53,
      code: "PAYTM",
      name: "paytm",
      mode: "PAYTM",
      type: "wallet",
    },
    {
      id: 56,
      code: "AIRTEL",
      name: "airtel",
      mode: "AIRTEL",
      type: "wallet",
    },
    {
      id: 57,
      code: "OXIGEN",
      name: "oxigen",
      mode: "OXIGEN",
      type: "wallet",
    },
    {
      id: 59,
      code: "FREECHARGE",
      name: "freecharge",
      mode: "FREECHARGE",
      type: "wallet",
    },
    {
      id: 58,
      code: "OLAMONEY",
      name: "olamoney",
      mode: "OLAMONEY",
      type: "wallet",
    },
    {
      id: 13,
      code: "COD",
      name: "cash on delivery",
      mode: "COD",
      type: "cashOnDelivery",
    },
    {
      id: 62,
      code: "TEZ",
      name: "Google Tez",
      mode: "TEZ",
      type: "upi",
    },
    {
      id: 62,
      code: "TEZ",
      name: "Google Tez",
      mode: "TEZ",
      type: "upi",
    },
    {
      id: 62,
      code: "TEZ",
      name: "Google Tez",
      mode: "TEZ",
      type: "upi",
    },
    {
      id: 14,
      code: "EMI",
      name: "EMI",
      mode: "EMI",
      type: "emi",
    },
  ],
  PDP_POPUP_FRAGMENT:{
    PRODUCT_EMIS:'product-emis',
    PRODUCT_OFFERS:'product-offers',
    PRODUCT_SPECIFICATION: 'product-specifications',
    PRODUCT_FEATURES: 'product-features',
    PRODUCT_DETAILS: 'product-details',
    PRODUCT_ALL_REVIEWS: 'product-review-all',
    PRODUCT_ALL_FAQ: 'product-faq-all',
    PRODUCT_QA_FORM: 'product-ask-now',
    PRODUCT_REVIEW_FORM: 'product-write-review',
  },
  enableGenericPrepaid: false,

  bulkRfqConstant:'BULK_RFQ_CONSTANT',
  PDP_IMAGE_HASH:"pdpImageHash",
  PDP_QNA_HASH:"qna",
  PDP_REVIEW_HASH:"review",
  PDP_WRITE_REVIEW_HASH:"write-review",
  APP_OPEN_LINK:"https://moglix.page.link/appinstall",
  HOME_CATEGORY_COLOR1:'#e6ebc7',
  HOME_CATEGORY_COLOR2:'#ffedcb',
  HOME_CATEGORY_COLOR3:'#ffe5d8',
  HOME_CATEGORY_COLOR4:'#dbedff',
  // HOME_CATEGORY_COLOR5:'#EBD8EA',
  // HOME_CATEGORY_COLOR6:'#E4D8D5',
  // HOME_CATEGORY_COLOR7:'#D2DDDF',
  POC_MSN : 'msn2vvrozzffc9',
  TRUECALLER_PARAMS : {
    type: "btmsheet",
    requestNonce: "",
    partnerKey: "",
    partnerName: "moglix.com",
    lang: "en",
    privacyUrl: "",
    termsUrl: "",
    loginPrefix: "continue",
    loginSuffix: "signin",
    ctaPrefix: "continuewith",
    ctaColor: "#d9232d",
    ctaTextColor: "%23f75d34",
    btnShape: "rect",
    skipOption: "",
    ttl: 8000,
}
};

export default CONSTANTS;
