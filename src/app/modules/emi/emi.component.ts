import { Component, ViewEncapsulation, Input, ElementRef } from '@angular/core';
import { EmiService } from "./emi.service";
import { Validators, FormBuilder, FormGroup } from "@angular/forms";
import { CreditCardValidator } from "ng2-cc-library";
import { LocalStorageService } from 'ngx-webstorage';
import CONSTANTS from '../../config/constants';
import { CheckoutService } from '../../utils/services/checkout.service';
import { CartService } from '../../utils/services/cart.service';
import { LocalAuthService } from '../../utils/services/auth.service';
import { ObjectToArray } from '../../utils/pipes/object-to-array.pipe';
import { CommonService } from '../../utils/services/common.service';
import { Bajaj_CCNumValidator } from 'src/app/utils/bajajCCNum';

declare var dataLayer;

@Component({
    selector: 'emi',
    templateUrl: './emi.html',
    styleUrls: [
        './emi.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class EmiComponent {
    isMob:boolean;
    API:{};
    dataEmi: Array<any>; //Array Data
    selectedBankCode: string;
    selectedBank: string;
    @Input() type:any;
    emiForm: FormGroup;
    emiResponse: {};//Object Data
    expYrs: Array<number>;
    expMons: Array<{ key: string, value: string }>;
    isValid: boolean;
    payuData: {};
    message: string;
    duration:any=0;
    isEmiEnable: boolean = true;
    blockIndex: number = 1;
    isShowLoader:boolean=false;
    totalPayableAmount: number = 0;
    nocostEmiDiscount: number = 0;
    step: number;
    disableInterest;
    bajajFinservField
    bankMap = {7:"AXIS",15:"HDFC",21:"ICICI"};


    constructor(private _localStorageService: LocalStorageService, private _checkoutService: CheckoutService, private _commonService: CommonService, private _localAuthService: LocalAuthService, private _cartService: CartService, private _formBuilder: FormBuilder, private _objectToArray: ObjectToArray, private _emiService: EmiService, private elementRef: ElementRef) {
        this.step=0;
        this.payuData = {};
        this.API = CONSTANTS;

        let cartSession = this._cartService.getCartSession();
        cartSession['nocostEmi'] = 0;
        let cart = cartSession["cart"];
        this.type =  this._checkoutService.getInvoiceType();

        if (cartSession["cart"]["totalPayableAmount"] < 3000) {
            this.message = "EMI not available below Rs. 3000";
            this.isEmiEnable = false;
        } else {
            let apiData = { price: (cart.totalPayableAmount) };

            if(this._checkoutService.getInvoiceType() == "retail"){
                apiData["gateWay"] = "payu";
            }else{
                apiData["gateWay"] = "razorpay";     
            }

            this.totalPayableAmount = cart.totalPayableAmount;

            this._emiService.getEmiValues(apiData).subscribe((res): void => {
                if (res["status"] != true) {
                    alert("Error in placing order, see console");
                    return;
                }
                let data = res["data"];
                this.emiResponse = data.emiResponse;
                this.dataEmi = this._objectToArray.transform(data.emiResponse, "associative");

                this.dataEmi.forEach((element, index) => {
                    if(this.bankMap.hasOwnProperty(element.key)){
                        element.key = this.bankMap[element.key];
                    }
                    let elementData = this._objectToArray.transform(element.value, "associative");
                    elementData.forEach((ele, index) => {
                        if(ele.value['tenure'] == "03 months" || ele.value['tenure'] == "3") {
                            ele.value['emi_value'] = (cart.totalPayableAmount)/3;
                            ele.value['emi_interest_paid'] = "No Cost EMI";
                        } else if(ele.value['tenure'] == "06 months" || ele.value['tenure'] == "6") {
                            ele.value['emi_value'] = (cart.totalPayableAmount)/6;
                            ele.value['emi_interest_paid'] = "No Cost EMI";
                        } else {
                            ele.value['transactionAmount'] = ele.value['transactionAmount'] + ele.value['emi_interest_paid'];
                        }
                    });
                });
                let checkNumberRegex = /^\d+$/;

                let dataEmiIndex = this.dataEmi.length;
                while (dataEmiIndex--) {
                    let isnum = checkNumberRegex.test(this.dataEmi[dataEmiIndex]["key"]);
                    if (isnum)
                        this.dataEmi.splice(dataEmiIndex, 1);
                }

                this.dataEmi.sort((a, b) => {
                    let nameA = a.key.toUpperCase(); // ignore upper and lowercase
                    let nameB = b.key.toUpperCase(); // ignore upper and lowercase
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }
                     nameA = a.key.toUpperCase(); // ignore upper and lowercase
                     nameB = b.key.toUpperCase(); // ignore upper and lowercase
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }
                    return 0;
                })

                this.selectedBankCode = this.dataEmi[0]["key"];
                this.selectedBank = "0";
                this.parseResponse();
            });
        }

        this.expYrs = [];
        this.expMons = CONSTANTS.GLOBAL.expMons;
        let todayDate = new Date();
        ////console.log(todayDate);
        let currentYear = todayDate.getFullYear();
        for (let i = 0; i < 20; i++) {
            this.expYrs.push(currentYear);
            currentYear = currentYear + 1;
        }
        this.isValid = false;
        this.emiForm = this._formBuilder.group({
            "store_card": [false],
            "mode": ['EMI', [Validators.required]],
            "requestParams": this._formBuilder.group({
                "ccexpyr": ['', [Validators.required]],
                "ccnum": [null, [<any>CreditCardValidator.validateCCNumber]],
                "ccexpmon": ['', [Validators.required]],
                "ccname": [null, [Validators.required, Validators.pattern('[a-zA-Z ]+')]],
                "bankcode": [null, [Validators.required]],
                "ccvv": [null, [<any>Validators.required, <any>Validators.minLength(3), <any>Validators.maxLength(4)]]
            }),
        })
    }

    getEmiValues(amount) {
        if (amount < 3000) {
            this.message = "Emi not available below Rs. 3000";
            this.isEmiEnable = false;
        } else {
            this._emiService.getEmiValues({ price: amount }).subscribe((res): void => {
                if (res["status"] != true) {
                    alert("Error in placing order, see console");
                    return;
                }

                let data = res["data"];

                this.emiResponse = data.emiResponse;
                this.dataEmi = this._objectToArray.transform(data.emiResponse, "associative");
                this.dataEmi.forEach((element, index) => {
                    if(this.bankMap.hasOwnProperty(element.key)){
                        element.key = this.bankMap[element.key];
                    }
                });
                let checkNumberRegex = /^\d+$/;

                let dataEmiIndex = this.dataEmi.length;
                while (dataEmiIndex--) {
                    let isnum = checkNumberRegex.test(this.dataEmi[dataEmiIndex]["key"]);
                    if (isnum)
                        this.dataEmi.splice(dataEmiIndex, 1);
                }
                this.dataEmi.sort((a, b) => {
                    let nameA = a.key.toUpperCase(); // ignore upper and lowercase
                    let nameB = b.key.toUpperCase(); // ignore upper and lowercase
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }
                     nameA = a.key.toUpperCase(); // ignore upper and lowercase
                     nameB = b.key.toUpperCase(); // ignore upper and lowercase
                    if (nameA < nameB) {
                        return -1;
                    }
                    if (nameA > nameB) {
                        return 1;
                    }

                    // names must be equal
                    return 0;

                    // names must be equal
                })
                this.parseResponse();                
            });
        }
    }


    ngOnInit() {
        this._cartService.validateCartSession.subscribe(
            (data) => {
               
               let amount=data['cart']['totalPayableAmount'];
                this.getEmiValues(amount);
            }
        )
        //console.log("ngOnInit Called");
    }

    ngAfterViewInit() {
        //console.log("ngAfterViewInit Called")
    }
    parseResponse(){
        let obj = {};
        for(let i=0;i<this.dataEmi.length;i++){
            obj[this.dataEmi[i].key] = this.dataEmi[i].value;
        }
        this.emiResponse = obj;
    }
    getEmiMonths(emiKey) {
        if(isNaN(parseInt(emiKey.replace(/^\D+/g, ''), 10))){
            return 3;
        }
        return parseInt(emiKey.replace(/^\D+/g, ''), 10);
    }

    selectEmI(month, rate, amount) {
        this.getEmiDiscount(
            month,
            (rate) ? (parseInt(rate) / 1200) : null,
            amount
        );
        this.step = 2;
        this.scollToSection("emiCardSection");
    }

    scollToSection(elementId) {
        setTimeout(() => {
            this.elementRef.nativeElement.ownerDocument.getElementById(elementId).scrollIntoView({behavior: 'smooth'});
        }, 300);
        
    }

    pay(data, valid) {
        // console.log('data :: ', data);
        // console.log('valid :: ', valid);

        if (!valid){
            return;
        }
        //console.log(data);
        let emitenureFlag = 0;
        if(this.getEmiMonths(data.requestParams.bankcode) == 3 || this.getEmiMonths(data.requestParams.bankcode) == 6)
            emitenureFlag = 1;
        else 
            emitenureFlag = 0;

        let cartSession = this._cartService.getCartSession();
        let cart = cartSession["cart"];
        let cartItems = cartSession["itemsList"];

        let ccnum = data.requestParams.ccnum.replace(/ /g, '');

        let userSession = this._localAuthService.getUserSession();
        
        let addressList = this._checkoutService.getCheckoutAddress();

        let shippingInformation = {
            'shippingCost': cartSession['cart']['shippingCharges'],
            'couponUsed': cartSession['cart']['totalOffer'],
            'GST': addressList["isGstInvoice"] != null ? 'Yes' : 'No',
        };

        dataLayer.push({
            'event': 'checkoutStarted',
            'shipping_Information': shippingInformation,
            'city': addressList["city"],
            'paymentMode': data.mode
        });
        
        let extra = {
            "mode": data.mode,
            "paymentId": 14,
            addressList: addressList,
            "bankname":this.selectedBank,
            "bankcode":data.requestParams.bankcode,
            "emitenure":emitenureFlag,
            "emiFlag": 1,
            "noCostEmiDiscount": Math.round(this.nocostEmiDiscount * 100)/100,
            "gateway": this.type == "tax" ? "razorpay": ""
        };

        let newdata = {
            "platformCode": "online",
            "mode": extra.mode,
            "paymentId": extra.paymentId,
            "requestParams": {
                // "firstname": userSession["userName"].split(' ').slice(0, -1).join(' '),
                "firstname": addressList["addressCustomerName"].split(' ').slice(0, -1).join(' '),
                // "phone": userSession["phone"] != undefined ? userSession["phone"] : "",
                "phone": addressList["phone"] != null ? addressList["phone"] : userSession["phone"],
                "email": addressList["email"] != null ? addressList["email"] : userSession["email"],
                "ccexpyr": data.requestParams.ccexpyr?data.requestParams.ccexpyr:'',
                "ccnum": ccnum,
                "ccexpmon": data.requestParams.ccexpmon?data.requestParams.ccexpmon:'',
                "productinfo": "msninrq7qv4",
                "ccname": data.requestParams.ccname,
                // "email": userSession["email"],
                "bankcode": data.requestParams.bankcode,
                "ccvv": data.requestParams.ccvv ? data.requestParams.ccvv:'',
                //Below user_id is sent only for reference to store card in backend.
                "user_id": userSession["userId"],
                "store_card": data.store_card==true? "true":"false"
            },
            "validatorRequest": this._commonService.createValidatorRequest(cartSession, userSession, extra)
        };

        if(this.type == "tax"){
            newdata["paymentGateway"]="razorpay";
            newdata["paymentId"] = 133;
            newdata["requestParams"]["duration"] = this.duration;
            newdata["requestParams"]["user_id"] = userSession["userId"];
            newdata["validatorRequest"]["shoppingCartDto"]["payment"]["paymentMethodId"]=133;
            newdata['validatorRequest']["shoppingCartDto"]['cart']['noCostEmiDiscount']=this.nocostEmiDiscount

        }

        this.isShowLoader=true;
        /*//console.log("New Data for pay", newdata);*/
        this._commonService.pay(newdata).subscribe((res): void => {
            if (res.status != true) {
                this.isValid = false;
                this.isShowLoader=false;
                alert(res.description);
                return;
            }

            let data = res.data;

            let payuData;
            if(this.type == "retail"){
                payuData = {
                    formUrl: data.formUrl,
                    key: (data.key != undefined && data.key != null) ? data.key : "",
                    txnid: (data.txnid != undefined && data.txnid != null) ? data.txnid : "",
                    amount: (data.amount != undefined && data.amount != null) ? data.amount : "",
                    productinfo: data.productinfo,
                    firstname: data.firstname,
                    email: data.email,
                    phone: data.phone,
                    surl: data.surl,
                    furl: data.furl,
                    curl: data.curl,
                    hash: data.hash,
                    pg: data.pg,
                    bankcode: data.bankcode,
                    ccnum: data.ccnum,
                    ccname: data.ccname,
                    ccvv: data.ccvv,
                    ccexpmon: data.ccexpmon,
                    ccexpyr: data.ccexpyr,
                    store_card: data.store_card,
                    user_credentials: data.user_credentials
                };
    
                this.payuData = payuData;
            }else{
                this.payuData = data;
            }
            this.updateBuyNowToLocalStorage();
            this.isValid = true;
            setTimeout(() => {
                this.isShowLoader=false;
            }, 1000)
        });
        
    }

    /**
     * Set buyNow state to localstorage for removing buyNow 
     * item from cart after successfull/failure of payment.
     * also remove existing buynow flag, if user tries to place order without buynow.
     */
    updateBuyNowToLocalStorage() {
        const buyNow = this._cartService.buyNow;
        if (buyNow) {
            this._localStorageService.store('flashData', { buyNow: true });
        } else {
            this._localStorageService.clear('flashData');
        }
    }

    getItemsList(cartItems) {
        //console.log("get Item List", cartItems);
        let itemsList = [];
        if (cartItems != undefined && cartItems != null && cartItems.length > 0) {
            for (let i = 0; i < cartItems.length; i++) {
                let item = {
                    "productId": cartItems[i]["productId"],
                    "productName": cartItems[i]["productName"],
                    "productImg": cartItems[i]["productImg"],
                    "amount": cartItems[i]["amount"],
                    "offer": cartItems[i]["offer"],
                    "amountWithOffer": cartItems[i]["amountWithOffer"],
                    "taxes": cartItems[i]["taxes"],
                    "amountWithTaxes": cartItems[i]["amountWithTaxes"],
                    "totalPayableAmount": cartItems[i]["totalPayableAmount"],
                    "isPersistant": true,
                    "productQuantity": cartItems[i]["productQuantity"],
                    "productUnitPrice": cartItems[i]["productUnitPrice"],
                    "expireAt": cartItems[i]["expireAt"]
                };
                itemsList.push(item);
            }
        }
        //console.log(itemsList);

        return itemsList;
    }

    getEmiDiscount(month, rate, amount) {
        this.isShowLoader = true;
        let cartSession = this._cartService.getCartSession();
        let cart = cartSession["cart"];
        this.nocostEmiDiscount = 0;
        if(month == 3 || month == 6) {
            // ODP-359
            if(rate != null){
                this.nocostEmiDiscount = amount - amount * (Math.pow((1+rate), month) - 1)/(month * Math.pow((1+rate), month) * rate);
            }else{
                this.nocostEmiDiscount = 0;
            }
            //cartSession["nocostEmi"] = 0;
            cartSession['nocostEmi'] = this.nocostEmiDiscount;
            this.totalPayableAmount = cart.totalPayableAmount - this.nocostEmiDiscount;
        } else {
            cartSession["nocostEmi"] = 0;
            this.totalPayableAmount = cart.totalPayableAmount;
        }
        this._cartService.orderSummary.next(cartSession);
        this.isShowLoader = false;
    }

    onBankChange(value){
        if(value == "0") {
            this.step = 0;
        } else {
            this.step=1;

            if(value == 'BAJFIN'){
                // this.disableInterest = true;
                this.bajajFinservField = true;
                this.emiForm.removeControl('requestParams');
                   console.log(this.emiForm.controls);
                      // console.log("in this3")
                      this.emiForm.setControl('requestParams',
                        this._formBuilder.group({
                            //"ccnum": [null, [<any>CreditCardValidator.validateCCNumber]],
                            "ccnum": [null, [Validators.required, Bajaj_CCNumValidator.validateCCNumber]],
                          "ccname": [null, [Validators.required, Validators.pattern('[a-zA-Z ]+')]],
                          "bankcode": [null, [Validators.required]],
                      }))
                  }
                else{
                    this.bajajFinservField = false;
                    this.emiForm.setControl('requestParams',
                     this._formBuilder.group({
                            "ccexpyr": ['', [Validators.required]],
                            "ccnum": [null, [<any>CreditCardValidator.validateCCNumber]],
                            "ccexpmon": ['', [Validators.required]],
                            "ccname": [null, [Validators.required, Validators.pattern('[a-zA-Z ]+')]],
                            "bankcode": [null, [Validators.required]],
                            "ccvv": [null, [<any>Validators.required, <any>Validators.minLength(3), <any>Validators.maxLength(4)]]
                        }),
                    )
               }     
        }
        let cartSession = this._cartService.getCartSession();
        cartSession["nocostEmi"] = 0;
        this._cartService.orderSummary.next(cartSession);
    }

    ngOnDestroy () {
        let cartSession = this._cartService.getCartSession();
        cartSession["nocostEmi"] = 0;
        this._cartService.orderSummary.next(cartSession);
    }
}
