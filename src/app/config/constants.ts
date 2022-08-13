import { InjectionToken } from "@angular/core";
import { environment } from "environments/environment";

let siemaOptionsObject: {
  outerWrapperClass: ['product_block_container'],
  innerWrapperClass: ['product_block']
};

export const CONSTANTS = {
  PROD: environment.PROD_NAME,
  NEW_MOGLIX_API: environment.BASE_URL,
  IMAGE_ASSET_URL: environment.IMAGE_ASSET_URL,
  SOCKET_URL: environment.SOCKET_URL,
  IMAGE_BASE_URL: environment.IMAGE_BASE_URL,
  DOCUMENT_URL: environment.DOCUMENT_URL,
  SECRET_KEY: 'moglix@4241',
  SOCIAL_LOGIN: environment.SOCIAL_LOGIN,
  AB_TESTING: environment.AB_TESTING,
  IDS_MAP: environment.IDS_MAP,
  CMS_IDS: environment.CMS_IDS,
  CDN_IMAGE_PATH: environment.CDN_IMAGE_URL,
  BROWSER_AGENT_TOKEN: new InjectionToken<string>('browserName'),
  SPEED_TEST_IMAGE: 'https://cdn.moglix.com/cms/flyout/Images_2021-09-15_15-45-36_Images_2020-06-03_16-42-50_SafetyImage-min.png', // ~500 KB image
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
    cashOnDelivery: 5,
    neftRtgs: 6,
    savedCard: 7,
    upi: 8,
    paytmUpi: 9,
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
        walletMobikwik: {
          mode: "WALLET",
          type: "mobikwik",
          bankcode: null,
          paymentId: 67,
          imgUrl: "mobikwik-wallet.png"
        },
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
        walletMobikwik: {
          mode: "MOBIKWIK",
          type: "MOBIKWIK",
          bankcode: null,
          paymentId: 52,
          imgUrl: "mobikwik-wallet.png"
        },
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
    },
    codMin: 300,
    codMax: 30000,
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
    'call_timing_text': 'Call Timings: 9:00 AM - 8:00 PM (Monday to Saturday)'
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
  }
};
export default CONSTANTS;
