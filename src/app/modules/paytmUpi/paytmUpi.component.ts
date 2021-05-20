import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { PaytmUpiService } from "./paytmUpi.service";
import { Subscription } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import { CheckoutService } from '@services/checkout.service';
import { CartService } from '@services/cart.service';
import { LocalAuthService } from '@services/auth.service';
import { CommonService } from '@services/common.service';
import CONSTANTS from '@config/constants';
import { GlobalLoaderService } from '@services/global-loader.service';

declare var dataLayer;

@Component({
    selector: 'paytm-upi',
    templateUrl: './paytmUpi.html',
    styleUrls:['./paytmUpi.scss']
})

export class PaytmUpiComponent {
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
    upiError:any;
    validUpi:boolean;
    set isShowLoader(value) {
        this.loaderService.setLoaderState(value);
    }
    
    constructor(private _localStorageService: LocalStorageService, private loaderService: GlobalLoaderService, private _checkoutService: CheckoutService, private _commonService: CommonService, private _localAuthService: LocalAuthService, private _cartService: CartService, private _upiService: PaytmUpiService, private _formBuilder: FormBuilder, private _paytmUpiService: PaytmUpiService) {
        this.upiData = {};
        this.isValid = false;
        this.uType = CONSTANTS.GLOBAL.paytmUpi;
        this.upiChecked = true;

        this.upiForm = this._formBuilder.group({
            "upi": ["", [Validators.required, Validators.pattern('^[a-zA-Z0-9_.]+@[0-9a-zA-Z]+$')]] //(?!\.)(?!.*\.$)(?!.*?\.\.)
        });
    }

    ngOnInit() {
        this.getPrePaidDiscount();
        this.cartSesssion = Object.assign({}, this._cartService.getCartSession());
        this.prepaidsubscription = this._cartService.prepaidDiscountSubject.subscribe((data) => {
            this.getPrePaidDiscount();
        })
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

        if (this.uType == CONSTANTS.GLOBAL.paytmUpi) {
            newdata = this.createData(data);
        } else {
            alert("No UPI selected");
        }

        let userSession = this._localAuthService.getUserSession();

        this._commonService.pay(newdata).subscribe((res): void => {
            if (res.status != true) {
                this.isValid = false;
                this.isShowLoader = false;
                alert(res.description);
                return;
            }

            this.upiData = res['data'];
            // this.upiData["formUrl"] = "https://securegw-stage.paytm.in/theia/api/v1/processTransaction?mid="+res['data']['mid']+"&orderId="+res['data']['orderId'];
            this.updateBuyNowToLocalStorage();
            this.upiData["payerAccount"] = this.upi;
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

    createData(data) {
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
            'paymentMode': 'PAYTMUPI'
        });

        let extra = {
            mode: "PAYTM",
            paymentId: 53,
            addressList: addressList
        };

        let upiData = {
            "platformCode": "online",
            "mode": "UPI",
            "paymentGateway": "paytm",
            "paymentId": 134,
            "requestParams": {
                "phone": addressList["phone"] != null ? addressList["phone"] : userSession["phone"],
                "email": addressList["email"] != null ? addressList["email"] : userSession["email"],
                "paymentChannel": "WEB",
            },
            "validatorRequest": this._commonService.createValidatorRequest(cartSession, userSession, extra)
        };
        
        return upiData;
    }

    getPrePaidDiscount() {
        let cartSession = this._cartService.getCartSession();

        let userSession = this._localAuthService.getUserSession();

        let addressList = this._checkoutService.getCheckoutAddress();

        let extra = {
            mode: "UPI",
            paymentId: 134,
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
    paytmApicall(upiValue){
        this.upiError =""
            this._paytmUpiService.paytmNewApicall(upiValue.upi).subscribe((res) => {
                if (res['status'] == true && res['data']['isValid'] == true) {
                  this.upiError =""
                  this.validUpi = true;
                  this.pay(this.upiForm.value, this.upiForm.valid);
                }
                else {
                   this.upiError = {message:res['data']['message']};
                   this.validUpi = false;
                    
                } 
          });
        }

    ngOnDestroy() {
        this.prepaidsubscription.unsubscribe();
        this._cartService.setCartSession(this.cartSesssion);
        this._cartService.orderSummary.next(this.cartSesssion);
    }
    resetLoginError(event){
        this.upiError ="";
    }
}
