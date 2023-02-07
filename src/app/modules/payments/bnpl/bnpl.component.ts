import { Component, Input ,OnInit} from '@angular/core';
import { Validators, FormBuilder, FormGroup, FormControl } from "@angular/forms";
import { LocalStorageService } from 'ngx-webstorage';
import CONSTANTS from '../../../config/constants';
import { CheckoutService } from '../../../utils/services/checkout.service';
import { CartService } from '../../../utils/services/cart.service';
import { LocalAuthService } from '../../../utils/services/auth.service';
import { ObjectToArray } from '../../../utils/pipes/object-to-array.pipe';
import { CommonService } from '../../../utils/services/common.service';
import { GlobalLoaderService } from '../../../utils/services/global-loader.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { catchError } from 'rxjs/operators';
import { ENDPOINTS } from '@app/config/endpoints';
import { HttpErrorResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { DataService } from '@app/utils/services/data.service';


@Component({
  selector: 'bnpl',
  templateUrl: './bnpl.component.html',
  styleUrls: ['./bnpl.scss']
})
export class BnplComponent implements OnInit {

  constructor(
    private _localStorageService: LocalStorageService, 
    private _commonService: CommonService, 
    private _localAuthService: LocalAuthService, 
    public _cartService: CartService, 
    private _formBuilder: FormBuilder, 
    private _objectToArray: ObjectToArray,
    private _loaderService: GlobalLoaderService,
    private _analytics: GlobalAnalyticsService,
    private _dataService: DataService,
) {
    this.initForm(); 
    
}

set isShowLoader(value) {
    this._loaderService.setLoaderState(value);
}

readonly imagePath = CONSTANTS.IMAGE_ASSET_URL;
@Input() type: any;
API: any = CONSTANTS;
bnplResponse: {};
dataBnpl: Array<any>;
isValid: boolean = false;
isBnplEnable: boolean = true;
eligibleUser: boolean;
prepaidDiscount: number = 0;
totalPayableAmount: number = 0;
userNum;
message: string = "You are not eligible for BNPL";
bankArray =["LAZYPAY" ];
showBanks: any[] = [];
bnplType: any;
bnplForm: FormGroup;
payuData: any = {};
bnplMap : any;
bnplMapKeys =[];
cartSesssion: any;
    

ngOnInit() {

    this.cartSesssion = Object.assign({}, this._cartService.getCartSession());
  
        this.totalPayableAmount = this._cartService.totalDisplayPayableAmountWithPrepaid;
      
    let userSession = this._localAuthService.getUserSession();
    let addressList = this._cartService.shippingAddress;
    let phone = addressList["phone"] != null ? addressList["phone"] : userSession["phone"];

    this.getBNPEligibility(phone);
}

getBNPEligibility(phone) {

   
    this.bnplMap = CONSTANTS.GLOBAL.bnplMap[this.type];
    this.bnplMapKeys = Object.keys(this.bnplMap);
   
        this.getBNPEligibilityCall({ phone: phone }).subscribe((res): void => {
            if (res["status"] != true) {
                this.isBnplEnable = false;
                return;
            }

            let data = res["data"];
            
            this.bnplResponse = data.bnplResponse;

            this.dataBnpl = this._objectToArray.transform(data.bnplResponse, "associative");
            this.dataBnpl.forEach((element, index) => {
              if(this.bnplMapKeys.includes(element.key) )
              {
                 this.bnplMap[element.key].active = true;
                 this.showBanks.push(this.bnplMap[element.key]);
                 
              }
              
            });

            this.selectDefaultBNPL(); 
        
        
            })

            
           
        };

        selectDefaultBNPL(){
            
            this.bnplType = this.showBanks[0]['bankcode'];
            this.bnplForm.get("bnplType").setValue(this.bnplType);
        };

    
        private initForm() {
            this.bnplForm = this._formBuilder.group({
                "bnplType": ['', [Validators.required]],
            });

        }

getBNPEligibilityCall(phone){
    return this._dataService.callRestful('GET', "http://paymentqa.moglilabs.com/payment/payment/getBNPLEligibility?phone=9506353593&price=1000").pipe(
        catchError((res: HttpErrorResponse) => {
            return of({status: false, statusCode: res.status});
        })
    );
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



pay(data, valid) {
    this.isShowLoader = true;
    if (!valid) return;

   
    this.bnplType = data.bnplType;

        let newdata: {};
        let paymentId = this.bnplMap[this.bnplType].paymentId;
        let mode = this.bnplMap[this.bnplType].mode;
        let bankcode = this.bnplMap[this.bnplType].bankcode;
        let type = this.bnplMap[this.bnplType].type;

        newdata = this.createBnplData(paymentId, mode, bankcode);
        newdata["validatorRequest"]["shoppingCartDto"]["payment"]["gateway"] = "BNPL";
        if (type)
            newdata["validatorRequest"]["shoppingCartDto"]["payment"]["type"] = type;

      this._commonService.isBrowser && this._analytics.sendAdobeOrderRequestTracking(newdata,`pay-initiated:bnpl`);
      this._cartService.pay(newdata).subscribe((res): void => {
        // console.log('PAY ==> pay API customer type', this.type);
        // console.log('PAY ==> pay API response', newdata);
        if (res.status != true) {
            this.isValid = false;
            this.isShowLoader = false;
            return;
        }

        let data = res.data;

        let payuData;
       
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
                user_credentials: data.user_credentials
            };

            this.payuData = payuData;
        
        this._commonService.isBrowser && this.updateBuyNowToLocalStorage();                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       
        this.isValid = true;
        // console.log('PAY ==> pay API upiData', this.upiData);
        setTimeout(() => {
            this.isShowLoader = false;
        }, 1000)
    });

}

createBnplData(paymentId, mode, bankcode) {
    let cartSession = this._cartService.getCartSession();
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
        'paymentMode': 'BNPL'
    });

    let extra = {
        mode: mode,
        paymentId: paymentId,
        addressList: addressList
    };
    let bnplData = {
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
        "validatorRequest": this._cartService.createValidatorRequest(extra)
    };
    return bnplData;
}

}
