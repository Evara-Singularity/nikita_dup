export const DATA_CC     = {
    "amex debit card": {
        "id": 9,
        "name": "amex debit card",
        "code": "AMEX",
        "enable": true,
        "platformCode": null,
        "mode": "CC",
        "attributeNames": {
            "country": false,
            "firstname": true,
            "address2": false,
            "city": false,
            "address1": false,
            "ccnum": true,
            "ccexpmon": true,
            "ccvv": true,
            "lastname": false,
            "zipcode": false,
            "phone": true,
            "additional_charges": false,
            "ccexpyr": true,
            "state": false,
            "productinfo": true,
            "ccname": true,
            "email": true,
            "bankcode": true
        },
        "attributeValueMap": {}
    },
    "dinersclub debit card": {
        "id": 10,
        "name": "dinersclub debit card",
        "code": "DINR",
        "enable": true,
        "platformCode": null,
        "mode": "CC",
        "attributeNames": {
            "country": false,
            "firstname": true,
            "address2": false,
            "city": false,
            "address1": false,
            "ccnum": true,
            "ccexpmon": true,
            "ccvv": true,
            "lastname": false,
            "zipcode": false,
            "phone": true,
            "additional_charges": false,
            "ccexpyr": true,
            "state": false,
            "productinfo": true,
            "ccname": true,
            "email": true,
            "bankcode": true
        },
        "attributeValueMap": {}
    }
};

let Request=
    {
        "platformCode": "online",
        "mode": "DC",
        "paymentId": 2,
        "requestParams": {
            "firstname": "Kuldeep",
            "phone": "8860716273",
            "ccexpyr": "2020",
            "ccnum": "5126520221491058",
            "ccexpmon": "02",
            "productinfo": "MSNghihjbc",
            "ccname": "Kuldeep",
            "email": "kuldeep.panchal669@moglix.com",
            "bankcode": "MAST",
            "ccvv": "123"
        },
        "orderRequest": {
            "sessionId": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.e30.THTmNTRiv4CvhLiVpAB_guT7L2a5al_QwH_Q7XzUpS0",
            "userId": 20,
            "cartId": 127,
            "totalAmount": 1040,
            "totalOffer": 0,
            "totalAmountWithOffer": 0,
            "taxes": 0,
            "shippingCharges": 0,
            "currency": "INR",
            "gift": false,
            "giftMessage": null,
            "giftPackingCharges": 0,
            "totalPayable": 5.12,
            "addressTypeMap": {
                "shipping": 1,
                "billing": 1
            },
            "cartItems": [
                {
                    "productId": "MSNjdbvvchsc",
                    "amount": 1040,
                    "taxes": 7,
                    "amountWithTaxes": 7,
                    "offer": 7,
                    "amountWithOffer": 79,
                    "payableAmount": 694,
                    "quantity": 1
                }
            ],
            "offersApplied": [
                1
            ],
            "deliveryModeId": 1
        }
    };
let Response:
    {
        "status":true,
        "data":{
            "key":"gtKFFx",
            "txnid":"60",
            "amount":"5.12",
            "additional_charges":null,
            "productinfo":"MSNghihjbc",
            "firstname":"Kuldeep",
            "lastname":null,
            "email":"kuldeep.panchal669@moglix.com",
            "phone":"8860716273",
            "address1":null,
            "address2":null,
            "state":null,
            "city":null,
            "country":null,
            "zipcode":null,
            "udf1":"",
            "udf2":"",
            "udf3":"",
            "udf4":"",
            "udf5":"",
            "surl":"http://api.moglix.com/payu/success.php",
            "curl":"http://api.moglix.com/payu/cancel.php",
            "furl":"http://api.moglix.com/payu/failure.php",
            "hash":"1a91cf833ff704d4034f5f2bc8fb186f571c32f0c69520f43ddaffe18efff410377fca09c3f55f915927d90174fb86b4efccc3c86c5bc379dee1f5deb36a939e",
            "pg":"DC",
            "bankcode":"MAST",
            "codUrl":null,
            "offer_key":null,
            "ccnum":"5126520221491058",
            "ccname":"Kuldeep",
            "ccvv":"123",
            "ccexpmon":"02",
            "ccexpyr":"2020"
        }
    };

let cartItems = {
    "platformCode": "online",
    "mode": "DC",
    "paymentId": 2,
    "requestParams": {
        "firstname": "Kuldeep",
        "phone": "8860716273",
        "ccexpyr": "2020",
        "ccnum": "5126520221491058",
        "ccexpmon": "05",
        "productinfo": "MSNghihjbc",
        "ccname": "Kuldeep",
        "email": "kuldeep.panchal669@moglix.com",
        "bankcode": "MAST",
        "ccvv": "123"
    },
    "orderRequest": {
        "sessionId": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.e30.FJG8ITmDlknLGcvYAjaNq74rrtBLWid68zU8MPCjPOU",
        "userId": null,
        "cartId": 103,
        "totalAmount": 0,
        "totalOffer": 0,
        "totalAmountWithOffer": 0,
        "taxes": 0,
        "shippingCharges": 0,
        "currency": "INR",
        "gift": false,
        "giftMessage": null,
        "giftPackingCharges": 0,
        "totalPayable": 0,
        "addressTypeMap": {
            "shipping": 1,
            "billing": 1
        },
        "cartItems": [],
        "offersApplied": [
            1
        ],
        "deliveryModeId": 1
    }
}




//sha512(SALT|status||||||udf5|udf4|udf3|udf2|udf1|email|firstname|productinfo|amount|txnid|key)
//gtKFFx|1682|1.01|MSNghihjbc|Kuldeep|kuldeep.panchal@moglix.com|||||||||||eCwWELxi