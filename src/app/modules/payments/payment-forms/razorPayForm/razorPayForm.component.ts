import { Component, Input } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import CONSTANTS from '../../../../config/constants';
import { CheckoutService } from '../../../../utils/services/checkout.service';
import { CommonService } from '../../../../utils/services/common.service';
import { LocalAuthService } from '../../../../utils/services/auth.service';
import { CartService } from '../../../../utils/services/cart.service';
import { GlobalLoaderService } from '../../../../utils/services/global-loader.service';

declare let Razorpay: any;

@Component({
  selector: 'razor-pay',
  templateUrl: './razorPayForm.html',
  styleUrls: ['./razorPayForm.scss']
})

export class RazorPayFormComponent {
  isValid: boolean;
  razorPayData: {};
  pType: number;
  razorPayForm: FormGroup;
  razorPay: number;
  API: any;
  @Input() type: any;
  cartSesssion: any;
  totalPayableAmount: number = 0;
  prepaidDiscount: number = 0;
  prepaidsubscription: Subscription;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  set isShowLoader(value) {
    this.loaderService.setLoaderState(value);
  }

  @Input() data: {} = {};
  isServer: boolean;
  isBrowser: boolean;
  constructor(
    private _checkoutService: CheckoutService,
    private _commonService: CommonService,
    private _localAuthService: LocalAuthService,
    private _cartService: CartService,
    private loaderService: GlobalLoaderService,
    private _formBuilder: FormBuilder) {
    this.API = CONSTANTS;
    this.isServer = _commonService.isServer;
    this.isBrowser = _commonService.isBrowser;
    this.razorPay = CONSTANTS.GLOBAL.razorPay;
    this.razorPayForm = this._formBuilder.group({
      "pType": [11, [Validators.required]],
    });
  }

  ngOnInit() {
    //this.createForm();
    if (this.isBrowser) {
      let script = document.createElement('script');
      script.src = CONSTANTS.RAZORPAY.CHECKOUT;
      script.type = "text/javascript";
      const that = this;
      script.onload = function () {
        that.razorpay = new Razorpay({
          key: that.data['razorpay_key'],
          // logo, we'll display it in payment processing popup
          image: CONSTANTS.RAZORPAY.IMAGE,
          callback_url: CONSTANTS.NEW_MOGLIX_API + CONSTANTS.RAZORPAY.SUCCESS,
          redirect: true
        });
        that.razorpay.once('ready', function (response) {
          //    console.log(response);
          setTimeout(function () {
            that.pay();
          }, 0);
          // response.methods.netbanking contains list of all banks
        })

      }
      script.onerror = function () {
        // console.log("error on loading script!!")
      };
      document.documentElement.firstElementChild.appendChild(script);

    }
  }
  razorpay
  pay() {
    const razorData = {
      email: this.data['email'],
      order_id: this.data['order_id'],
      method: this.data['method'],
      amount: this.data['amount'],
      contact: this.data['contact']
    };

    if (this.data['ccname']) {
      razorData['card[name]'] = this.data['ccname'];
    }
    if (this.data["emi_duration"]) {
      razorData["emi_duration"] = this.data["emi_duration"];
    }
    if (this.data['ccvv']) {
      razorData['card[cvv]'] = this.data['ccvv'];
    }
    if (this.data['ccexpyr']) {
      razorData['card[expiry_year]'] = this.data['ccexpyr'];
    }
    if (this.data['ccexpmon']) {
      razorData['card[expiry_month]'] = this.data['ccexpmon'];
    }
    if (this.data['ccnum']) {
      razorData['card[number]'] = this.data['ccnum'];
    }
    if (this.data['contact']) {
      razorData['contact'] = this.data['contact'];
    }
    if (this.data['save']) {
      razorData['save'] = this.data['save'];
    }
    if (this.data['customer_id']) {
      razorData['customer_id'] = this.data['customer_id'];
    }
    if (this.data['bank']) {
      razorData['bank'] = this.data['bank'];
    }
    if (this.data['wallet']) {
      razorData['wallet'] = this.data['wallet'];
    }
    if (this.data['vpa']) {
      razorData['vpa'] = this.data['vpa'];
    }
    if (this.data['token']) {
      razorData['token'] = this.data['token'];
    }


    this.razorpay.createPayment(razorData);
    const that = this;
    this.razorpay.on('payment.success', function (resp) {
    })
    this.razorpay.on('payment.error', function (resp) {
      // alert(resp.error.description)
    });
  }

  ngAfterViewInit() {
  }

  getPrePaidDiscount() {
    let cartSession = this._cartService.getGenericCartSession;

    let userSession = this._localAuthService.getUserSession();

    let addressList = this._checkoutService.getCheckoutAddress();

    let extra = {
      mode: "RAZOR",
      paymentId: 63,
      addressList: addressList
    };
    cartSession["extraOffer"] = null;

    let validatorRequest = this._commonService.createValidatorRequest(cartSession, userSession, extra);

    let body = validatorRequest.shoppingCartDto;
    this.isShowLoader = true;
    this._checkoutService.getPrepaidDiscountUpdate(body).subscribe((res: any) => {

      if (res.status) {
        cartSession['extraOffer'] = res.data.extraOffer;
        let cart = res.data.cart;
        if (res.data.extraOffer && res.data.extraOffer.prepaid) {
          this.prepaidDiscount = res.data.extraOffer.prepaid
        }
        if (cart) {
          let shipping = cart.shippingCharges ? cart.shippingCharges : 0;
          let totalAmount = cart.totalAmount ? cart.totalAmount : 0;
          let totalOffer = cart.totalOffer ? cart.totalOffer : 0;
          this.totalPayableAmount = totalAmount + shipping - totalOffer - this.prepaidDiscount;
        }
        this._cartService.setGenericCartSession(cartSession);
        this._cartService.orderSummary.next(cartSession);
        this.isShowLoader = false;
      }
    });
  }

  ngOnDestroy() {
    this.prepaidsubscription.unsubscribe();
    this._cartService.setGenericCartSession(this.cartSesssion);
    this._cartService.orderSummary.next(this.cartSesssion);
  }
}