let siemaOptionsObject: {
    outerWrapperClass: ['product_block_container'],
    innerWrapperClass: ['product_block']
};
const CONSTANTS = {
    PROD: "https://www.moglix.com",
    NEW_MOGLIX: 'https://beta.moglix.com',
    //NEW_MOGLIX_API: 'https://apinew.moglix.com/nodeApi/v1',
    NEW_MOGLIX_API: 'https://nodeapiqa.moglilabs.com/nodeApi/v1',
    MOGLIX_API: 'https://apiqa.moglilabs.com',
    SOCKET_URL_: "https://socketqa.moglilabs.com",
    IMAGE_BASE_URL: 'https://cdn.moglix.com/',
    IMG_URL: 'https://img.moglimg.com/',
    DOCUMENT_URL: 'https://document.moglix.com/',
    URLS:{
		HOMEPAGE : '/homepage/layoutbyjson?requestType=mobile',
		SUGGESTIONS : '/homepage/getsuggestion'
	},
	pwaImages:{
		imgFolder:'b/I/P/B/d'
	},
    DEVICE: {
        device: 'mobile'
    },
    SOCIAL_LOGIN: {
        "google": {
            "clientId": "122641287206-9abv091pefhcp1dukt0qnjnncsckdt07.apps.googleusercontent.com"
        },
        "facebook": {
            "clientId": "775243655917959",
            "apiVersion": "v2.4"
        }
    },
    META: {
        ROBOT: 'index,follow',
        ROBOT1: 'noindex,follow',
        ROBOT2: 'noindex,nofollow'
    },
    CONST_VAR: {
		shippingcharge: '99',
		FreeShippingMinAmount: '999',
	},
    GLOBAL: {
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
                walletFreecharge: {
                    mode: "WALLET",
                    type: "freecharge",
                    bankcode: "FREC",
                    paymentId: 66,
                    imgUrl: "freecharge-wallet.png"
                },
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
                walletOlamoney: {
                    mode: "WALLET",
                    type: "olamoney",
                    bankcode: "OLAM",
                    paymentId: 65,
                    imgUrl: "ola-wallet.png"
                },
                walletJio: {
                    mode: "WALLET",
                    type: 'jiomoney',
                    bankcode: "FREC",
                    paymentId: 69,
                    imgUrl: "jio-money-wallet.png"
                },
                walletMpesa: {
                    mode: "WALLET",
                    type: 'mpesa',
                    bankcode: "FREC",
                    paymentId: 70,
                    imgUrl: "voda-pesa-wallet.png"
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
                walletFreecharge: {
                    mode: "FREECHARGE",
                    type: 'FREECHARGE',
                    bankcode: "FREC",
                    paymentId: 59,
                    imgUrl: "freecharge-wallet.png"
                },
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
                walletOxigen: {
                    mode: "OXIGEN",
                    type: "OXIGEN",
                    bankcode: "OXICASH",
                    paymentId: 57,
                    imgUrl: "oxigen-wallet.png"
                },
                walletOlamoney: {
                    mode: "OLAMONEY",
                    type: "OLAMONEY",
                    bankcode: "OLAM",
                    paymentId: 58,
                    imgUrl: "ola-wallet.png"
                },
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
            "default": 1,
            "assist": 2
        },
        expMons: [{ key: '01', value: 'JAN' }, { key: '02', value: 'FEB' }, { key: '03', value: 'MAR' }, { key: '04', value: 'APR' }, { key: '05', value: 'MAY' }, { key: '06', value: 'JUN' }, { key: '07', value: 'JUL' }, { key: '08', value: 'AUG' }, { key: '09', value: 'SEP' }, { key: '10', value: 'OCT' }, { key: '11', value: 'NOV' }, { key: '12', value: 'DEC' }],
        default: {
            pageSize: 10
        },
        codMin: 300,
        codMax: 20000,
        userType: {
            business: 'business',
            online: 'online'
        },
        auos: [
            '/dashboard',
            '/login',
            '/order-confirmation',
            '/search'
        ]
    },
    IDS_MAP:{
        //new ids for mobile
        
        'cm136360':'BEST_SELLER',
        'cm915657':'BANNER',
        //'CM881267':'FANS_BLOWER',
        'cm325516':'SAFETY',
        'cm889618':'FLY_OUT',
        'cm814985':'CAT_B',
        'cm196070':'CAT_C',
        'cm454649':'CAT_D',
        'cm358138':'CAT_E', 
        'cm933249':'CAT_F',
        'cm416640':'CAT_G',
        'cm973381':'MIDDLE_BANNER_ADS',
        'cm334468':'FEATURE_BRANDS',
        'cm977811':'FEATURE_ARRIVAL'

    },
    CMS_IDS:{
		// new layout ids for mobile
		BEST_SELLER : 'id=cm136360',
        BANNER: 'id=cm915657',
        //FANS_BLOWER :'id=cm881267',
        SAFETY: 'id=cm325516',
        FLY_OUT : 'id=cm889618',
        CAT_A : 'id=cm325516',
        CAT_B : 'id=cm814985',
        CAT_C : 'id=cm196070',
        CAT_D : 'id=cm454649',
        CAT_E : 'id=cm358138', 
        CAT_F : 'id=cm933249',
        CAT_G : 'id=cm416640',
		CAT_H : 'id=cm814985',
		MIDDLE_BANNER_ADS :'cm973381',
		CATEGORY_EXTRAS: 'cm867481',
		FEATURE_BRANDS:'cm334468',
		FEATURE_ARRIVAL:'cm977811',
		MANUFACTURER_STORE:'macizo_m',
		MANUFACTURER_STORE_BRAND:'macizo'
	},
    clusterCategories: [
        {
            "idCategory":"116000000",
            "CategoryName":"Safety & PPE Supplies",
            "category_image":"safety.png",
            "category_url":"store/safety-ppe-supplies"
        },
        {
            "idCategory":"116000000",
            "CategoryName":"Office Stationery & Supplies",
            "category_image":"3 (1).png",
            "category_url":"store/office-stationery-supplies"
        },
        {
            "idCategory":"116000000",
            "CategoryName":"Electrical Tools & Equipment",
            "category_image":"electricals-1@2x.png",
            "category_url":"store/electrical-tools-equipment"
        },
        {
            "idCategory":"116000000",
            "CategoryName":"Industrial Tools & Equipment",
            "category_image":"power_tool.png",
            "category_url":"store/industrial-tools-equipment"
        },
        {
            "idCategory":"116000000",
            "CategoryName":"Lab & Scientific Equipment",
            "category_image":"electricals-2.png",
            "category_url":"store/lab-scientific-equipment"
        },
        {
            "idCategory":"116000000",
            "CategoryName":"Medical Care & Hospital Supplies",
            "category_image":"medical.png",
            "category_url":"store/medical-equipment-hospital-supplies"
        },
        {
            "idCategory":"116000000",
            "CategoryName":"Hardware & Plumbing Supplies",
            "category_image":"plumbing-materials.png",
            "category_url":"store/hardware-plumbing-supplies"
        },
    ],
    siemaCategories: [
        {
            label: 'Bestsellers',
            dataKey: 'bestSellerData',
            options: { selector: '.best-seller-siema', ...siemaOptionsObject }
        },
        {
            label: 'SAFETY',
            dataKey: 'safetyData',
            options: { selector: '.safety-siema', ...siemaOptionsObject },
            viewAllLink: ['/medical-supplies/215000000'],
        },
        {
            label: 'Power Tools',
            dataKey: 'powerData',
            options: { selector: '.power-siema', ...siemaOptionsObject },
            viewAllLink: ['/medical-supplies/diagnostic-instruments/thermometers/115251300'],
        },
        {
            label: 'Pumps & motors',
            dataKey: 'pumpData',
            options: { selector: '.pump-siema', ...siemaOptionsObject },
            viewAllLink: ['/medical-supplies/diagnostic-instruments/respiratory-care-products/115251700'],
        },
        {
            label: 'ELECTRICALS',
            dataKey: 'electricalData',
            options: { selector: '.electrical-siema', ...siemaOptionsObject },
            viewAllLink: ['/safety-and-security/respiratory-masks/116111600'],
        },
        {
            label: 'OFFICE STATIONERY & SUPPLIES',
            dataKey: 'officeData',
            options: { selector: '.office-siema', ...siemaOptionsObject },
            viewAllLink: ['/office-supplies/214000000'],
        },
        {
            label: 'Medical Supplies',
            dataKey: 'medicalData',
            options: { selector: '.medical-siema', ...siemaOptionsObject },
            viewAllLink: ['/medical-supplies/215000000'],
        },
        {
            label: 'LED & LIGHTING',
            dataKey: 'lightData',
            options: { selector: '.light-siema', ...siemaOptionsObject },
            viewAllLink: ['/lighting-luminaries/212000000'],
        }
    ]
}
export default CONSTANTS;
