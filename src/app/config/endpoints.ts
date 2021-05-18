export const ENDPOINTS = {
    PRODUCT_INFO: '/product/getProductGroup',
    PRODUCT_REVIEW: '/reviews/getReviews',
    PRODUCT_FBT: '/product/getProductFbtDetails',
    BREADCRUMB: '/homepage/getbreadcrumb',
    Q_AND_A: '/quest/getQuest',
    PRODUCT_STATUS_COUNT: '/cmsApi/productStatusCount',
    LOGIN_URL: '/login/sendOTP',
    LOGIN_OTP: '/login/validateotp',
    LOGIN_AUTHENTICATE: '/login/authenticate',
    FORGOT_PASSWORD: '/login/forgetpassword',
    VERIFY_CUSTOMER: '/validation/verifycustomer',
    SIGN_UP: '/login/signup',
    CART: {
        validatePromoCode: '/promoCode/validatePromoCode',
        getShippingValue: '/shipping/getShippingValue',
        getAllActivePromoCodes: '/promoCode/getAllActivePromoCodes',
        getPromoCodeDetails: '/promoCode/getPromoCodeDetails'
    },
    GET_LAYOUT: '/homepage/layoutbycode',
    GET_LAYOUT_HOME: '/homepage/layoutbyjson?requestType=mobile',
    GET_FDK_HOME: '/homepage/flyout?type=m'
}