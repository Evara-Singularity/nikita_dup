import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { UpiService } from "./upi.service";
import { Subscription } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import CONSTANTS from '../../config/constants';
import { CheckoutService } from '../../utils/services/checkout.service';
import { CartService } from '../../utils/services/cart.service';
import { LocalAuthService } from '../../utils/services/auth.service';
import { CommonService } from '../../utils/services/common.service';
import { GlobalLoaderService } from '../../utils/services/global-loader.service';
import { ObjectToArray } from '@app/utils/pipes/object-to-array.pipe';
import { LowSuccessMessagePipe } from '@app/utils/pipes/low-success-rate.pipe';
import { TrackingService } from '@app/utils/services/tracking.service';

declare var dataLayer;

@Component({
    selector: 'upi',
    templateUrl: './upi.html',
    styleUrls:['./upi.scss']
})
export class UpiComponent {
    isValid: boolean;
    uType: number;
    upi: String;
    upiTez: number;
    upiForm: FormGroup;
    upiData: {};
    upiChecked: boolean;
    @Input() type:any;
    cartSesssion: any;
    prepaidDiscount: number = 0;
    totalPayableAmount: number = 0;
    prepaidsubscription: Subscription;
    imagePath = CONSTANTS.IMAGE_BASE_URL;
    imageFolder = CONSTANTS.pwaImages.imgFolder;
    set isShowLoader(value) {
        this.loaderService.setLoaderState(value);
    }
    @Input() successPercentageData: any = null;
    lsrMessage = null;
    
    constructor(private _localStorageService: LocalStorageService,private loaderService: GlobalLoaderService, private _checkoutService: CheckoutService, private _commonService: CommonService, private _localAuthService: LocalAuthService, private _cartService: CartService, private _upiService: UpiService, private _formBuilder: FormBuilder, private _objectToArray: ObjectToArray,
        private lsr: LowSuccessMessagePipe, private _trackingService: TrackingService) {
        this.upiData = {};
        this.isValid = false;
        this.uType = CONSTANTS.GLOBAL.upiTez;
        this.upiChecked = true;

        this.upiForm = this._formBuilder.group({
            "upi": ["", [Validators.required]]
        });
    }

    ngOnInit() {
        this.getPrePaidDiscount();
        this.cartSesssion = Object.assign({}, this._cartService.getCartSession());
        this.prepaidsubscription = this._cartService.prepaidDiscountSubject.subscribe((data) => {
            this.getPrePaidDiscount();
        })
        this.lowSuccessBanks();
        // console.log(this.type , 'testing')
    }

    ngAfterViewInit() {
    }

    pay(data, valid) {

        this.isShowLoader = true;
        if (!valid)
            return;

        this.upi   = data.upi;
        let newdata: {};

        if (this.uType == CONSTANTS.GLOBAL.upiTez) {
            newdata = this.createTezData(data);
        } else {
            // alert("No UPI selected");
            console.log('Error: No UPI selected');
        }

        let userSession = this._localAuthService.getUserSession();
        this._trackingService.sendAdobeOrderRequestTracking(newdata, "pay-initiated", `pay-initiated:upi`);
        this._commonService.pay(newdata).subscribe((res): void => {
            if (res.status != true) {
                this.isValid = false;
                this.isShowLoader = false;
                // alert(res.description);
                return;
            }

            let data = res.data;

            let upiData: {};
            if(this.type == "retail"){
                if (this.uType == CONSTANTS.GLOBAL.upiTez) {
                    upiData = data["payUWalletRequest"];
                }
    
                this.upiData = upiData;
            }else{
                this.upiData = data;
            }
            this.updateBuyNowToLocalStorage();
            this.upiData["vpa"] = this.upi;             

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

    createTezData(data) {
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
            'paymentMode': 'TEZ'
        });

        let extra = {
            mode: "TEZ",
            paymentId: 62,
            addressList: addressList
        };

        let upiData = {
            "platformCode": "online",
            "mode": "TEZ",
            "paymentId": 62,
            "requestParams": {
                "firstname": addressList["addressCustomerName"].split(' ').slice(0, -1).join(' '),
                "phone": addressList["phone"] != null ? addressList["phone"] : userSession["phone"],
                "email": addressList["email"] != null ? addressList["email"] : userSession["email"],
                "productinfo": "MSNghihjbc",
                "bankcode": "TEZ",
            },
            "validatorRequest": this._commonService.createValidatorRequest(cartSession, userSession, extra)
        };
        if(this.type == "tax"){
            upiData["mode"]="UPI";
            upiData["requestParams"]["vpa"] = this.upi;
            upiData["requestParams"]["bankcode"]="upi";
            upiData["paymentGateway"]="razorpay";
            upiData["paymentId"]=132;
            upiData["validatorRequest"]["shoppingCartDto"]["payment"]["paymentMethodId"]=132;

        }
        return upiData;
    }

    getPrePaidDiscount() {
        let cartSession = this._cartService.getCartSession();

        let userSession = this._localAuthService.getUserSession();

        let addressList = this._checkoutService.getCheckoutAddress();

        let extra = {
            mode: "TEZ",
            paymentId: 62,
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
                //console.log(this.cartSesssion);
                this._cartService.orderSummary.next(cartSession);
                this.isShowLoader = false;
            }
        });
    }

    
    lowSuccessBanks(){
        this.lsrMessage = null;
        if (this.type == 'retail'){
            const banksArr: [] = this._objectToArray.transform(this.successPercentageData);
            const TOP = banksArr.filter(item => item['is_top'] == 1);
            const OTHERS = banksArr.filter(item => item['is_top'] == 0);
            const LSRTOP = TOP.filter(item => item['up_status'] == 0);
            const LSROTHERS = OTHERS.filter(item => item['up_status'] == 0);
            if (LSRTOP.length || LSROTHERS.length) {
                this.lsrMessage = this.lsr.transform(LSRTOP, LSROTHERS, "upis");
            }
        }
    }

    ngOnDestroy() {
        this.prepaidsubscription.unsubscribe();
        this._cartService.setCartSession(this.cartSesssion);
        this._cartService.orderSummary.next(this.cartSesssion);
    }
}
