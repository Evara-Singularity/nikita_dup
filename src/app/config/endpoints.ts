export const ENDPOINTS = {
  PRODUCT_INFO: "/product/getProductGroup",
  PRODUCT_REVIEW: "/reviews/getReviews",
  PRODUCT_FBT: "/product/getProductFbtDetails",
  BREADCRUMB: "/homepage/getbreadcrumb",
  Q_AND_A: "/quest/getQuest",
  PRODUCT_STATUS_COUNT: "/cmsApi/productStatusCount",
  LOGIN_URL: "/login/sendOTP",
  LOGIN_OTP: "/login/validateotp",
  LOGIN_AUTHENTICATE: "/login/authenticate",
  FORGOT_PASSWORD: "/login/forgetpassword",
  VERIFY_CUSTOMER: "/validation/verifycustomer",
  SIGN_UP: "/login/signup",
  CART: {
    validatePromoCode: "/promoCode/validatePromoCode",
    getShippingValue: "/shipping/getShippingValue",
    getAllActivePromoCodes: "/promoCode/getAllActivePromoCodes",
    getPromoCodeDetails: "/promoCode/getPromoCodeDetails",
  },
  GET_CIMS_ATTRIBUTE: '/cmsApi/getAttributesListingPage',
  GET_LAYOUT: "/homepage/layoutbycode",
  GET_LAYOUT_HOME: "/homepage/layoutbyjson?requestType=mobile",
  GET_FDK_HOME: '/homepage/flyout?type=m',
  GET_CATEGORY_BY_ID: '/category/getcategorybyid',
  GET_CATEGORY_SCHEMA: '/quest/getCategorySchema',
  GET_CMS_CONTROLLED: '/cmsapi/getCmsControlledPage',
  RECENTLY_VIEWED: "/recentlyviewed/getRecentlyViewd?customerId=",
  POST_ADD: "/address/postAddress",
  CITY_BY_PIN: "/address/getcitystatebyPincode?pin=",
  TAXPAYER_BY_TIN: "/address/getTaxpayerByGstin?gstin=",
  CBD: "/customer/getCustomerBusinessDetails",
  GET_ADD_LIST: "/address/getAddressList",
  UPD_CUS: "/customer/addUpdateCustomer",
  GET_BREAD: "/homepage/getbreadcrumb?source=",
  GET_ORDER: "/checkout/getorderbyuserid",
  ORD_DET: "/order/orderDetails",
  CR: "/order/cancelReasons",
  PRC_LIST: "/purchase/getPurchaseList",
  RM_PCR_LIST: "/purchase/removePurchaseList",
  UPL_IMG: "/payment/uploadImageS",
  RET_REFUND: "/payment/returnRefund",
  RET_TRANSAC: "/payment/getReturnTransactionId?userId=",
  UPD_PASS: "/login/updatepassword",
  BD: "/businessdetails/getbyid?id=",
  CANCEL_ODR: "/order/cancelOrder",
  ODR_TRACK: "/order/orderTracking?shipmentId=",
  UC: "/customer/updatecustomer",
  RFQ_LIST: "/rfq/listRFQ",
  GET_ODR: "/checkout/getorderbyuserid?userId=",
  GET_CUS: "/customer/getcustomer?customerId=",
  BST_OFFER: "/deals/best-offers",
  EXCLU_OFF: "/deals/exclusive-offers",
  SPL_DEALS: "/deals/special-deals",
  SPL_OFFR: "/deals/special-offer",
  GET_EMI_VAL: "/payment/getEMIValues",
  GET_CLUSTER_EMI_VAL: "/payment/getClusterEmiValues",
  PAYMENT: "/payment/pay",
  GET_ALL_PAYMENT: "/payment/getAll",
  VALIDATE_VPA: "/payment/validateVPA?vpa=",
  CARD: {
    IMAGE: "img/others/Card.jpg",
    GET_SAVED_CARD: "/payment/getSavedCards",
    PD_SAVED_CARD: "/payment/postdeleteSavedCards",
  },
  UPD_CART: "/cart/updateCart",
  BRAND_STORE: "/brand-store",
  GET_MANUFACTURE_PAGE: "/category/getManufacturePage?requestType=",
  GET_ALL_CAT: "/search/getAllCategories",
  GET_BRAND_NAME: "/brand/getBrandByName",
  GET_ALL_BRANDS: "/search/getAllBrands",
  GET_GetCartValidationMessages: "/cart/getCartValidationMessages",
  SET_SetCartValidationMessages: "/cart/setCartValidationMessages",
  VALIDATE_CART: "/cart/validateCart",
  GET_CartByUser: "/cart/getCartByUser",
  GET_ShippingValue: "/shipping/getShippingValue",
  GET_CategoryExtras: "/category/getcategoryExtras?requestType=",
  GET_CategorySchema: "/quest/getCategorySchema?categoryCode=",
  GET_RELATED_ARTICLES: "/cmsApi/getArticlesListByCategory?categoryCode=",
  GET_PrepaidDiscount: "/payment/getPrepaidDiscount",
  VALIDATE_PRODUCT_SER: "/logistics/validateProductsService",
  GET_CATEGORY: "/category/getcategory",
  GET_BRANDS: "/brand/getbrand",
  GET_CMS_CONTROLLED_PAGES: "/cmsapi/getCmsControlledPage?requestParam=article-1",
  GET_CMS_LAYOUT: "/cmsapi/getLayoutJsonByCode?layoutCode=",
  GET_SESSION: "/session/getSession",
  GET_TOKKEN: "/token/getToken",
  LOGOUT: "/login/logout",
  GET_StateList: "/address/getStateList",
  GET_CountryList: "/address/getCountryList",
  LOGIN_SUBSCRIPTION: "/login/subscription",
  EPAY_LATER: "/rfq/addEpayLater",
  VALIDATE_BD: "/validation/validate",
  HOMEPAGE_FOOTER: "/homepage/footercode",
  TRENDING_CATEGORY: "/category/trendingCategory",
  TRENDING_CATEGORY_CMS: "/category/getparentcategoryjsonbody?requestType=",
  ADD_PURCHASE_LIST: "/purchase/addPurchaseList",
  SIMILAR_PRODUCTS: "/search/similarproducts",
  SET_REVIEWS: "/reviews/setReviews",
  IS_REVIEW_HELPFUL: "/reviews/isReviewHelpful",
  SET_QUEST: "/quest/setQuest",
  GET_CartBySession: "/cart/getCartBySession",
  IS_BRAND_CATEGORY: "/search/isBrandCategory"
};
