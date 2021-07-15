import { Component, Input, PLATFORM_ID, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { WalletService } from "./wallet.service";
import { isPlatformServer, isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import CONSTANTS from '../../config/constants';
import { CheckoutService } from '../../utils/services/checkout.service';
import { CommonService } from '../../utils/services/common.service';
import { LocalAuthService } from '../../utils/services/auth.service';
import { CartService } from '../../utils/services/cart.service';
import { ObjectToArray } from '@app/utils/pipes/object-to-array.pipe';
import { GlobalLoaderService } from '../../utils/services/global-loader.service';
import { LowSuccessMessagePipe } from '@app/utils/pipes/low-success-rate.pipe';

declare let dataLayer: any;

@Component({
    selector: 'wallet',
    templateUrl: './wallet.html',
    styleUrls:['./wallet.scss']
})

export class WalletComponent {
    isValid: boolean;
    wType:any;
    @Input() type:any;
    walletForm: FormGroup;
    walletData: {};
    walletMapKeys=[];
    walletMap:any;
    //isShowLoader: boolean = false;
    isServer: boolean;
    isBrowser: boolean;

    cartSesssion: any;
    prepaidDiscount: number = 0;
    totalPayableAmount: number = 0;
    prepaidsubscription: Subscription;
    imagePath = CONSTANTS.CDN_IMAGE_PATH;
    imageFolder = CONSTANTS.pwaImages.imgFolder;
    @Input() successPercentageData: any = null;
    set isShowLoader(value)
    {
        this.loaderService.setLoaderState(value);
    }
    lsrMessage = [];
     
    constructor(
        private _localStorageService: LocalStorageService,
        @Inject(PLATFORM_ID) platformId,
        private _checkoutService: CheckoutService,
        private _commonService: CommonService,
        private _localAuthService: LocalAuthService,
        private _cartService: CartService,
        private _walletService: WalletService,
        private _objectToArray: ObjectToArray,
        private loaderService: GlobalLoaderService,
        private _formBuilder: FormBuilder,
        private lsr: LowSuccessMessagePipe) {
        this.isServer = isPlatformServer(platformId);
        this.isBrowser = isPlatformBrowser(platformId);
        this.walletData = {};
        this.isValid = false;
    }

    ngOnInit() {

        this.getPrePaidDiscount();
        this.walletMap = CONSTANTS.GLOBAL.walletMap[this.type];
        this.walletMapKeys = Object.keys(this.walletMap);
        this.wType = this.walletMapKeys[0];
        console.log("this.walletMap", this.walletMap, this.walletMapKeys, this.wType);
        this.walletForm = this._formBuilder.group({
            "wType": [this.wType, [Validators.required]],
        });
        this.cartSesssion = Object.assign({}, this._cartService.getCartSession());
        this.prepaidsubscription = this._cartService.prepaidDiscountSubject.subscribe((data) => {
            this.getPrePaidDiscount();
        })

        this.lowSuccessBanks();

    }

    ngAfterViewInit() {
        //console.log("ngAfterViewInit Called")
    }



    pay(data, valid) {

        this.isShowLoader = true;
        if (!valid)
            return;

        this.wType = data.wType;

        let newdata: {};
        let walletName:string;
        let paymentId = this.walletMap[this.wType].paymentId;
        let mode = this.walletMap[this.wType].mode;
        let bankcode = this.walletMap[this.wType].bankcode;
        let type = this.walletMap[this.wType].type;

        newdata = this.createWalletData(paymentId, mode , bankcode, type);
        if(type)
            newdata["validatorRequest"]["shoppingCartDto"]["payment"]["type"] = type;
        
        if (this.wType == "walletPaytm") {
            var requestParams =  new Object(newdata["requestParams"]);
            newdata["requestParams"] = {
                "phone": requestParams["phone"],
                "email":requestParams["email"],
                "paymentChannel": "WEB"                
            }
            walletName = "Paytm"
        } else if (this.wType == "walletMobikwik") {
            walletName = "Mobikwik"
            var requestParams =  new Object(newdata["requestParams"]);
            newdata["requestParams"] = {
                "phone": requestParams["phone"],
                "email":requestParams["email"],
                "productinfo": "MSNghihjbc"
            } 
        } else if (this.wType == "walletAirtel") {
            walletName = "Airtel"
        } else if (this.wType == "walletOxigen") {
            walletName = "Oxigen"
        } else if (this.wType=="walletOlamoney") {
            walletName = "Olamoney"
        } else if (this.wType == "walletFreecharge") {
            walletName = "Freecharge"
        }else if (this.wType=="walletJio") {
        }
        else if (this.wType == "walletMpesa") {
        }
        else if (this.wType=="walletPayZap") {
        }  
        else if (this.wType=="walletHdfcpay") {
            walletName = "Hdfcpay"
        } else {
            alert("No Wallet selected");
            return;
        }

        if(this.isBrowser) {
            let userSession = this._localAuthService.getUserSession();
            let t = {'event': "paymentButtonClick", 'payment': walletName};
            dataLayer.push(t);
        }
        
        if(this.type == "tax"){
            newdata["paymentGateway"]="razorpay";
            newdata["mode"] = "WALLET";
        }
        if (this.wType == "walletPaytm"){
            newdata["mode"] = "PAYTM";            
        }
        this._commonService.pay(newdata).subscribe((res): void => {

            if (res.status != true) {
                this.isValid = false;
                this.isShowLoader = false;
                return;
            }

            let data = res.data;

            let walletData: {};
            if(this.type == "retail" || this.wType =="walletPaytm"){
                if (this.wType =="walletPaytm") {
                    walletData = data["payTMWalletRequest"];
                    let todayDate: any = new Date();
                    let dd: any = todayDate.getDate();
                    let mm: any = todayDate.getMonth() + 1; //January is 0!
                    const yyyy = todayDate.getFullYear();
                    if (dd < 10) {
                        dd = '0' + dd;
                    }
                    if (mm < 10) {
                        mm = '0' + mm;
                    }
                    todayDate = yyyy + '-' + mm + '-' + dd;
                    walletData["todayDate"] = todayDate;
                } else if (this.wType!= "walletPaytm" &&this.wType!="walletMobikwik" && this.walletMapKeys.indexOf(this.wType)!=-1) {
                    walletData = data["payUWalletRequest"];
                } else if (this.wType =="walletMobikwik") {
                    walletData = data["mobikwikWalletRequest"];
                }
                this.walletData = walletData;
            }else{
                this.walletData = data;
            }

            this.updateBuyNowToLocalStorage();
            this.isValid = true;
            setTimeout(() => {
                this.isShowLoader = false;
                //     $("#page-loader").hide();
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

    getPrePaidDiscount() {
        let cartSession = this._cartService.getCartSession();

        let userSession = this._localAuthService.getUserSession();

        let addressList = this._checkoutService.getCheckoutAddress();

        let extra = {
            mode: "WALLET",
            paymentId: 51,
            addressList: addressList
        };
        cartSession["extraOffer"] = null;

        let validatorRequest = this._commonService.createValidatorRequest(cartSession, userSession, extra);

        let body = validatorRequest.shoppingCartDto;
        this.isShowLoader = true;
        this._checkoutService.getPrepaidDiscountUpdate(body).subscribe((res) => {

            if (res['status']) {
                cartSession['extraOffer'] = res['data']['extraOffer'];
                let cart = res['data']['cart'];
                if (res['data']['extraOffer'] && res['data']['extraOffer']['prepaid']) {
                    this.prepaidDiscount = res['data']['extraOffer']['prepaid']
                }
                if (cart) {
                    let shipping = cart.shippingCharges ? cart.shippingCharges : 0;
                    let totalAmount = cart.totalAmount ? cart.totalAmount : 0;
                    let totalOffer = cart.totalOffer ? cart.totalOffer : 0;
                    this.totalPayableAmount = totalAmount + shipping - totalOffer - this.prepaidDiscount;
                }
                this._cartService.setCartSession(cartSession);
                this._cartService.orderSummary.next(cartSession);
                this.isShowLoader = false;
            }
        });
    }

    createWalletData(paymentId, mode , bankcode, type) {
        let cartSession = this._cartService.getCartSession();
        let cart = cartSession["cart"];
        let cartItems = cartSession["itemsList"];

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
            'paymentMode': 'PAYTM'
        });
        
        let extra = {
            mode: mode,
            paymentId:paymentId,
            addressList: addressList
        };

        let freechargeData = {
            "platformCode": "online",
            "mode": mode,
            "paymentId": paymentId,
            "requestParams": {
                "firstname": addressList["addressCustomerName"].split(' ').slice(0, -1).join(' '),
                "phone": addressList["phone"] != null ? addressList["phone"] : userSession["phone"],
                "email": addressList["email"] != null ? addressList["email"] : userSession["email"],
                "productinfo": "MSNghihjbc",
                "bankcode": bankcode,
            },
            "validatorRequest": this._commonService.createValidatorRequest(cartSession, userSession, extra)
        };

        return freechargeData;
    }

    
    lowSuccessBanks()
    {
        this.lsrMessage = [];
        if (this.type == 'retail') {
            const banksArr: [] = this._objectToArray.transform(this.successPercentageData);
            const lowSuccessBanks = banksArr.filter(item => item['up_status'] == 0)
            if (lowSuccessBanks.length){
                // this.lsrMessage = true;
            }
        }
    }

    ngOnDestroy() {
        this.prepaidsubscription.unsubscribe();
        this._cartService.setCartSession(this.cartSesssion);
        this._cartService.orderSummary.next(this.cartSesssion);
    }
}
