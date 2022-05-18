import { Component, ViewEncapsulation, Input, ElementRef, Pipe, PipeTransform } from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { CreditCardValidator } from "ng2-cc-library";
import { LocalStorageService } from 'ngx-webstorage';
import CONSTANTS from '../../../config/constants';
import { CheckoutService } from '../../../utils/services/checkout.service';
import { CartService } from '../../../utils/services/cart.service';
import { LocalAuthService } from '../../../utils/services/auth.service';
import { ObjectToArray } from '../../../utils/pipes/object-to-array.pipe';
import { CommonService } from '../../../utils/services/common.service';
import { Bajaj_CCNumValidator } from '../../../utils/bajajCCNum';
import { GlobalLoaderService } from '../../../utils/services/global-loader.service';
import { BankNamePipe } from '@app/utils/pipes/bank.pipe';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { catchError } from 'rxjs/operators';
import { ENDPOINTS } from '@app/config/endpoints';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { DataService } from '@app/utils/services/data.service';
import { SortByEMIMonthsPipe } from '@app/utils/pipes/emiSort.pipe';

@Component({
    selector: 'emi',
    templateUrl: './emi.html',
    styleUrls: [
        './emi.scss'
    ],
    encapsulation: ViewEncapsulation.None
})
export class EmiComponent {

    readonly CARD_TYPES = {
        debitCard: 'debit_card',
        creditCard: 'credit_card'
    }

    @Input() type: any;

    isMob: boolean;
    API: any = CONSTANTS;
    dataEmi: Array<any>; //Array Data
    selectedBankCode: string;
    selectedBank: string;
    emiForm: FormGroup;
    emiResponse: {};//Object Data
    emiRawDebitCardResponse = null;
    emiRawCreditCardResponse = null;
    expYrs: Array<any> = [];
    expMons: Array<{ key: string, value: string }> = CONSTANTS.GLOBAL.expMons;
    isValid: boolean = false;
    payuData: any = {};
    message: string;
    duration: any = 0;
    isEmiEnable: boolean = true;
    blockIndex: number = 1;
    totalPayableAmount: number = 0;
    nocostEmiDiscount: number = 0;
    step: number = 0;
    disableInterest;
    bajajFinservField
    bankMap = { 7: "AXIS", 15: "HDFC", 21: "ICICI" };
    paymentMethod = this.CARD_TYPES.creditCard;
    bankSelectPopUp: boolean;
    selectedBankName: any;
    noCostEmiCount = {};
    monthSelectPopupStatus: boolean = false;
    selectedMonth: string = null;
    yearSelectPopupStatus: boolean = false;
    selectedYear: string = null;
    selectedEMIKey = null;

    set isShowLoader(value) {
        this.loaderService.setLoaderState(value);
    }


    constructor(
        private _localStorageService: LocalStorageService, 
        private _commonService: CommonService, 
        private _localAuthService: LocalAuthService, 
        private _cartService: CartService, 
        private _formBuilder: FormBuilder, 
        private _objectToArray: ObjectToArray,
        private _sortByEMIMonths: SortByEMIMonthsPipe,
        private elementRef: ElementRef, 
        private loaderService: GlobalLoaderService, 
        private _bankNamePipe: BankNamePipe, 
        private _analytics: GlobalAnalyticsService,
        private _dataService: DataService,
    ) {
        this.initForm();
        this.fetchIntialEmiData();
        this.createYrsOptions();
    }

    private createYrsOptions() {
        let todayDate = new Date();
        let currentYear = todayDate.getFullYear();
        for (let i = 0; i < 20; i++) {
            this.expYrs.push({ key: currentYear, value: currentYear });
            currentYear = currentYear + 1;
        }
    }

    private fetchIntialEmiData() {
        const cartSession = this._cartService.getCartSession();
        const cart = cartSession["cart"];
        cartSession['nocostEmi'] = 0;
        this.type = this._cartService.invoiceType;
        if (cartSession["cart"]["totalPayableAmount"] < CONSTANTS.EMI_MINIMUM_AMOUNT) {
            this.message = `EMI not available below Rs. ${CONSTANTS.EMI_MINIMUM_AMOUNT}`;
            this.isEmiEnable = false;
        } else {
            const payableAmount = (cart['totalAmount'] + cart['shippingCharges']) -cart['totalOffer'];
            let apiData = { price: (payableAmount) };
            if (this._cartService.invoiceType == "retail") {
                apiData["gateWay"] = "payu";
            } else {
                apiData["gateWay"] = "razorpay";
            }
            this.totalPayableAmount = payableAmount;
            this.getEmiValuesCall(apiData).subscribe((res): void => {
                if (res["status"] != true) {
                    return;
                }
                let data = res["data"];
                this.emiRawDebitCardResponse = data.emiResponse[this.CARD_TYPES.debitCard];
                this.emiRawCreditCardResponse = data.emiResponse[this.CARD_TYPES.creditCard];
                this.processRawResponse(
                    (this.paymentMethod == this.CARD_TYPES.debitCard) ? this.emiRawDebitCardResponse : this.emiRawCreditCardResponse,
                    cart
                );
                this.selectDefaultEMI();
            });
        }
    }

    private initForm() {
        this.emiForm = this._formBuilder.group({
            "store_card": [false],
            "mode": ['EMI', []],
            "requestParams": this._formBuilder.group({
                "ccexpyr": ['', [Validators.required]],
                "ccnum": [null, [<any>CreditCardValidator.validateCCNumber]],
                "ccexpmon": ['', [Validators.required]],
                "ccname": [null, [Validators.required, Validators.pattern('[a-zA-Z ]+')]],
                "bankcode": [null, [Validators.required]],
                "ccvv": [null, [<any>Validators.required, <any>Validators.minLength(3), <any>Validators.maxLength(4)]]
            }),
        });
    }

    selectDefaultEMI() {
        if (this.dataEmi && this.dataEmi.length > 0) {
            const data = this.dataEmi[0];
            const emiArr: [] = this._objectToArray.transform(this.dataEmi[0]['value'], "associative");
            // // console.log('data ==>', data, emiFirst);
            this.selectedBank = data.key;
            this.selectedBankName = data.bankname;
            const noCostEMI = emiArr.filter(item => item['value']['emi_interest_paid'] === 0)
            const withCostEMI = emiArr.filter(item => item['value']['emi_interest_paid'] !== 0)
            // console.log('noCostEMI ==>', noCostEMI, withCostEMI);
            if (noCostEMI.length > 0) {
                this._sortByEMIMonths.transform(noCostEMI);
                this.selectedEMIKey = noCostEMI[0]['key'];
                this.selectEmI(this.getEmiMonths(data.key), noCostEMI[0]['value']['emiBankInterest'], noCostEMI[0]['value']['transactionAmount'])
            } else {
                this._sortByEMIMonths.transform(withCostEMI);
                this.selectedEMIKey = withCostEMI[0]['key'];
                this.selectEmI(this.getEmiMonths(data.key), withCostEMI[0]['value']['emiBankInterest'], withCostEMI[0]['value']['transactionAmount'])
            }
            // console.log("selectedEMIKey ==>", this.selectedEMIKey);
            this.emiForm.get('requestParams.bankcode').setValue(this.selectedEMIKey);
            // console.log("selectedEMIKey ==>", this.emiForm.get('requestParams.bankcode').value);
        }
    }

    private processRawResponse(data: any, cart: any) {
        const cardTypeResponse = data;
        this.emiResponse = cardTypeResponse;
        this.dataEmi = this._objectToArray.transform(cardTypeResponse, "associative");


        this.dataEmi.forEach((element, index) => {
            if (this.bankMap.hasOwnProperty(element.key)) {
                element.key = this.bankMap[element.key];
            }
            element['bankname'] = this._bankNamePipe.transform(element.key);
            let elementData = this._objectToArray.transform(element.value, "associative");
            elementData.forEach((ele, index) => {
                if (ele.value['tenure'] == "03 months" || ele.value['tenure'] == "3") {
                    ele.value['emi_value'] = (cart.totalPayableAmount) / 3;
                    ele.value['emi_interest_paid'] = 0;
                } else if (ele.value['tenure'] == "06 months" || ele.value['tenure'] == "6") {
                    ele.value['emi_value'] = (cart.totalPayableAmount) / 6;
                    ele.value['emi_interest_paid'] = 0;
                } else {
                    ele.value['transactionAmount'] = ele.value['transactionAmount'] + ele.value['emi_interest_paid'];
                }
            });
        });

        this.dataEmi.map(d => {
            if (d.key === 'BAJAJ') {
                d.bankname = 'Bajaj Finserv No Cost Emi';
            }
            return d;
        })

        const noCostEmiCount = {};
        for (const key in this.emiResponse) {
            if (Object.prototype.hasOwnProperty.call(this.emiResponse, key)) {
                const emiObjs = this.emiResponse[key];
                let noCost = 0;
                let withCost = 0;
                for (const emiKey in emiObjs) {
                    if (Object.prototype.hasOwnProperty.call(emiObjs, emiKey)) {
                        const element = emiObjs[emiKey];
                        if (element.emi_interest_paid === 0) {
                            noCost = noCost + 1
                        } else {
                            withCost = withCost + 1
                        }
                    }
                }
                if (this.bankMap.hasOwnProperty(key)) {
                    noCostEmiCount[this.bankMap[key]] = { noCost, withCost }
                } else {
                    noCostEmiCount[key] = { noCost, withCost }
                }
            }
        }
        this.noCostEmiCount = noCostEmiCount;

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
        });

        this.selectedBankCode = this.dataEmi[0]["key"];
        this.selectedBank = "0";
        this.parseResponse();
    }

    getEmiValues(amount) {
        if (amount < CONSTANTS.EMI_MINIMUM_AMOUNT) {
            this.message = `Emi not available below Rs. ${CONSTANTS.EMI_MINIMUM_AMOUNT}`;
            this.isEmiEnable = false;
        } else {
            this.getEmiValuesCall({ price: amount }).subscribe((res): void => {
                if (res["status"] != true) {
                    return;
                }

                let data = res["data"];
                this.emiResponse = data.emiResponse;

                this.dataEmi = this._objectToArray.transform(data.emiResponse, "associative");
                this.dataEmi.forEach((element, index) => {
                    if (this.bankMap.hasOwnProperty(element.key)) {
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

                let amount = data['cart']['totalPayableAmount'];
                this.getEmiValues(amount);
            }
        )
    }


    parseResponse() {
        let obj = {};
        for (let i = 0; i < this.dataEmi.length; i++) {
            obj[this.dataEmi[i].key] = this.dataEmi[i].value;
        }
        this.emiResponse = obj;
    }

    getEmiMonths(emiKey) {
        if (isNaN(parseInt(emiKey.replace(/^\D+/g, ''), 10))) {
            return 3;
        }
        return parseInt(emiKey.replace(/^\D+/g, ''), 10);
    }

    selectEmI(month, rate, amount, emiObj?) {
        if (emiObj) {
            this.selectedEMIKey = emiObj['key']
        }
        this.getEmiDiscount(
            month,
            (rate) ? (parseInt(rate) / 1200) : null,
            amount
        );
        this.step = 2;
        // this.scollToSection("emiCardSection");
    }

    scollToSection(elementId) {
        setTimeout(() => {
            this.elementRef.nativeElement.ownerDocument.getElementById(elementId).scrollIntoView({ behavior: 'smooth' });
        }, 300);

    }

    pay(data, valid) {

        if (!valid) {
            return;
        }
        //// console.log(data);
        let emitenureFlag = 0;
        if (this.getEmiMonths(data.requestParams.bankcode) == 3 || this.getEmiMonths(data.requestParams.bankcode) == 6)
            emitenureFlag = 1;
        else
            emitenureFlag = 0;

        let cartSession = this._cartService.getCartSession();

        let ccnum = data.requestParams.ccnum.replace(/ /g, '');

        let userSession = this._localAuthService.getUserSession();

        let addressList = this._cartService.shippingAddress;

        let shippingInformation = {
            'shippingCost': cartSession['cart']['shippingCharges'],
            'couponUsed': cartSession['cart']['totalOffer'],
            'GST': addressList["isGstInvoice"] != null ? 'Yes' : 'No',
        };

        this._analytics.sendGTMCall({
            'event': 'checkoutStarted',
            'shipping_Information': shippingInformation,
            'city': addressList["city"],
            'paymentMode': data.mode
        });

        let extra = {
            "mode": data.mode,
            "paymentId": 14,
            addressList: addressList,
            "bankname": this.selectedBank,
            "bankcode": data.requestParams.bankcode,
            "emitenure": emitenureFlag,
            "emiFlag": 1,
            "noCostEmiDiscount": Math.round(this.nocostEmiDiscount * 100) / 100,
            "gateway": this.type == "tax" ? "razorpay" : ""
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
                "ccexpyr": data.requestParams.ccexpyr ? data.requestParams.ccexpyr : '',
                "ccnum": ccnum,
                "ccexpmon": data.requestParams.ccexpmon ? data.requestParams.ccexpmon : '',
                "productinfo": "msninrq7qv4",
                "ccname": data.requestParams.ccname,
                // "email": userSession["email"],
                "bankcode": data.requestParams.bankcode,
                "ccvv": data.requestParams.ccvv ? data.requestParams.ccvv : '',
                //Below user_id is sent only for reference to store card in backend.
                "user_id": userSession["userId"],
                "store_card": data.store_card == true ? "true" : "false"
            },
            "validatorRequest": this._cartService.createValidatorRequest(extra)
        };

        if (this.type == "tax") {
            newdata["paymentGateway"] = "razorpay";
            newdata["paymentId"] = 133;
            newdata["requestParams"]["duration"] = this.duration;
            newdata["requestParams"]["user_id"] = userSession["userId"];
            newdata["validatorRequest"]["shoppingCartDto"]["payment"]["paymentMethodId"] = 133;
            newdata['validatorRequest']["shoppingCartDto"]['cart']['noCostEmiDiscount'] = this.nocostEmiDiscount
        }

        this._commonService.isBrowser && this. _analytics.sendAdobeOrderRequestTracking(newdata,`pay-initiated:emi`);
        this.isShowLoader = true;
        this._cartService.pay(newdata).subscribe((res): void => {
            if (res.status != true) {
                this.isValid = false;
                this.isShowLoader = false;
                return;
            }

            let data = res.data;
            let payuData;
            if (this.type == "retail") {
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
                this.payuData['emi_duration'] = parseInt(this.selectedEMIKey);
                console.log('retail ==>', this.payuData);
            } else {
                this.payuData = data;
                this.payuData['emi_duration'] = parseInt(this.selectedEMIKey);
                console.log('payu ==>', this.payuData);
            }
            this._commonService.isBrowser && this.updateBuyNowToLocalStorage();
            this.isValid = true;
            setTimeout(() => {
                this.isShowLoader = false;
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
        //// console.log("get Item List", cartItems);
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
        //// console.log(itemsList);

        return itemsList;
    }

    getEmiDiscount(month, rate, amount) {
        this.isShowLoader = true;
        let cartSession = this._cartService.getGenericCartSession;
        let cart = cartSession["cart"];
        this.nocostEmiDiscount = 0;
        if (month == 3 || month == 6) {
            // ODP-359
            if (rate != null) {
                this.nocostEmiDiscount = amount - amount * (Math.pow((1 + rate), month) - 1) / (month * Math.pow((1 + rate), month) * rate);
            } else {
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

    onBankChange(value, emiValues) {
        //console.log("value ==>", value, emiValues);
        if (value == "0") {
            this.step = 0;
        } else {
            this.step = 1;
            this._sortByEMIMonths.transform(emiValues);
            const emiKey = emiValues[0]['key']; // select first key by default
            this.selectedEMIKey = emiKey;
            if (value == 'BAJFIN' || value == 'BAJAJ') {
                // this.disableInterest = true;
                this.bajajFinservField = true;
                this.emiForm.removeControl('requestParams');
                // console.log(this.emiForm.controls);
                // // console.log("in this3")
                this.emiForm.setControl('requestParams',
                    this._formBuilder.group({
                        //"ccnum": [null, [<any>CreditCardValidator.validateCCNumber]],
                        "ccnum": [null, [Validators.required, Bajaj_CCNumValidator.validateCCNumber]],
                        "ccname": [null, [Validators.required, Validators.pattern('[a-zA-Z ]+')]],
                        "bankcode": [emiKey, [Validators.required]],
                    }))
            }
            else {
                this.bajajFinservField = false;
                this.emiForm.setControl('requestParams',
                    this._formBuilder.group({
                        "ccexpyr": ['', [Validators.required]],
                        "ccnum": [null, [<any>CreditCardValidator.validateCCNumber]],
                        "ccexpmon": ['', [Validators.required]],
                        "ccname": [null, [Validators.required, Validators.pattern('[a-zA-Z ]+')]],
                        "bankcode": [emiKey, [Validators.required]],
                        "ccvv": [null, [<any>Validators.required, <any>Validators.minLength(3), <any>Validators.maxLength(4)]]
                    }),
                )
            }
        }
        let cartSession = this._cartService.getGenericCartSession;
        cartSession["nocostEmi"] = 0;
        this._cartService.orderSummary.next(cartSession);
    }

    showBanks() {
        this.bankSelectPopUp = true;
    }

    selectedBankChange(data) {
        // console.log('selectedBankChange data ==>', data);
        if (data) {
            this.selectedBank = data.key;
            this.selectedBankName = data.bankname;
            this.onBankChange(this.selectedBank, this._objectToArray.transform(data.value, "associative"));
            this.selectedMonth = null;
            this.selectedYear = null;
            const emiResponseData = this._objectToArray.transform(this.emiResponse[this.selectedBank]);
            const tenure = parseInt(emiResponseData[0].tenure.replace('months', ''));
            this.selectEmI(tenure, emiResponseData[0].emiBankInterest, emiResponseData[0].transactionAmount)
        }
        this.bankSelectPopUp = false;
    }

    changeCardType(card) {
        let cartSession = this._cartService.getGenericCartSession;
        cartSession['nocostEmi'] = 0;
        let cart = cartSession["cart"];
        this.selectedBank = null;
        this.selectedBankName = null;
        this.selectedMonth = null;
        this.selectedYear = null;
        this.processRawResponse(
            (card == this.CARD_TYPES.debitCard) ? this.emiRawDebitCardResponse : this.emiRawCreditCardResponse,
            cart
        );
        this.paymentMethod = card;
        this.selectDefaultEMI();
        this.emiForm.get("requestParams").reset();
        this.emiForm.get('requestParams.bankcode').setValue(this.selectedEMIKey);
    }

    selectMonth(data) {
        // console.log('selectMonth ==>', data);
        if (data) {
            this.selectedMonth = data['key'];
            (this.emiForm.get('requestParams.ccexpmon') as FormControl).setValue(data.key);
        }
        this.monthSelectPopupStatus = false;
    }

    openMonthPopUp() {
        this.monthSelectPopupStatus = true;
    }

    selectYear(data) {
        // console.log('selectYear ==>', data);
        if (data) {
            this.selectedYear = data['value'];
            (this.emiForm.get('requestParams.ccexpyr') as FormControl).setValue(data.key);
        }
        this.yearSelectPopupStatus = false;
    }

    openYearPopUp() {
        this.yearSelectPopupStatus = true;
    }

    get selectedEmiOption() {
        return this.emiForm.get('requestParams.bankcode').value;
    }

    ngOnDestroy() {
        let cartSession = this._cartService.getGenericCartSession;
        cartSession["nocostEmi"] = 0;
        this._cartService.orderSummary.next(cartSession);
    }

    getEmiValuesCall(data){
        return this._dataService.callRestful('GET', CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.GET_CLUSTER_EMI_VAL, {params:data}).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({status: false, statusCode: res.status});
            })
        );
    }
}


@Pipe({
    name: 'bankNameChange'
})
export class BankNameChangePipe implements PipeTransform {
    transform(val: any, args) {
        if (val) {
            console.log(val);
        }
        return val;
    }
}
