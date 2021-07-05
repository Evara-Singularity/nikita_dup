export const GLOBAL_CONSTANT = {
    loginByEmail: 1,
    loginByPhone: 2,
    newAddress: 9999,
    created: 1,
    updated: 2,
    creditDebitCard: 1,
    brandStoreCmsId: 'CM1000031',
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
        pageSize: 20
    },
    inlineFilter: ['category', 'price', 'discount'],
    codMin: 300,
    codMax: 25000,
    userType: {
        business: 'business',
        online: 'online'
    },
    // auos: avoid url on server
    auos: [
        '/dashboard',
        '/login',
        '/order-confirmation',
        '/search'
    ]
}