import { Component, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { LocalStorageService } from 'ngx-webstorage';
import { CartService } from '../../../utils/services/cart.service';
import { LocalAuthService } from '../../../utils/services/auth.service';
import { CommonService } from '../../../utils/services/common.service';
import { ToastMessageService } from '../../toastMessage/toast-message.service';
import CONSTANTS from '../../../config/constants';
import { GlobalLoaderService } from '../../../utils/services/global-loader.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';
import { DataService } from '@app/utils/services/data.service';
import { ENDPOINTS } from '@app/config/endpoints';
import { HttpErrorResponse } from '@angular/common/http';
@Component({
    selector: 'cash-on-delivery',
    templateUrl: './cashOnDelivery.html',
    styleUrls: [ './cashOnDelivery.component.scss' ],
})
export class CashOnDeliveryComponent {
    
    updateTabIndex: EventEmitter<number> = new EventEmitter<number>();
    currUser;
    isCODEnable: boolean = true;
    message: string = '';
    globalConstants: any = CONSTANTS.GLOBAL;;
    verifyOtp: boolean = false;
    userEmail: string;
    totalPayableAmount: number = 0;
    submittedOnce = false;
    transactionId: string;
    userNum;
    showPopup = false;
    otpError: String = '';
    otpErrorFlag: Boolean = true;
    localVal;

    set isShowLoader(status: boolean) {
        this._loaderService.setLoaderState(status)
    }

    constructor(
        private _localStorageService: LocalStorageService,
        private _tms: ToastMessageService,
        private _commonService: CommonService,
        private _router: Router,
        private _localAuthService: LocalAuthService,
        private _cartService: CartService,
        private _loaderService: GlobalLoaderService,
        private _dataService: DataService,
        private _analytics: GlobalAnalyticsService) {
        this.transactionId = null;
        this.isShowLoader = false;
    }

    ngOnInit() {
        this.currUser = this._localAuthService.getUserSession();
        this.userNum = (this._cartService.shippingAddress && this._cartService.shippingAddress['phone']) || null;
        this.userEmail = (this._cartService.shippingAddress && this._cartService.shippingAddress['email']) || null;
        let cartSession: any = this._cartService.getCartSession();        

        if (cartSession['cart']['totalPayableAmount'] < this.globalConstants['codMin']) {
            this.message = 'COD not applicable on orders below Rs. ' + this.globalConstants['codMin'];
            this.isCODEnable = false;
        } else if (cartSession['cart']['totalPayableAmount'] > this.globalConstants['codMax']) {
            this.message = ' COD not applicable on orders above Rs. ' + this.globalConstants['codMax'];
            this.isCODEnable = false;
        } else if (!this._commonService.cashOnDeliveryStatus.isEnable) {
            this.message = 'COD is not available on your address';
            this.isCODEnable = false;
        }
        this.totalPayableAmount = cartSession['cart']['totalAmount'] + cartSession['cart']['shippingCharges'] - cartSession['cart']['totalOffer'];
    }

    updateShippingAddress(){
        let addressList = this._cartService.shippingAddress as any;       
        addressList = {
            'idAddress': addressList['idAddress'],
            'addressCustomerName': addressList['addressCustomerName'],
            'phone': this.userNum,
            'postCode': addressList['postCode'],
            'landmark': addressList['landmark'],
            'addressLine': addressList['addressLine'],
            'city': addressList['city'],
            'idCountry': addressList['country']['idCountry'],
            'idState': addressList['state']['idState'],
            'email': addressList['email'],
            'gstin': addressList['gstin'],
            'idCustomer': addressList['idCustomer'],
            'idAddressType': addressList['addressType']['idAddressType'],
            'active': true,
            'invoiceType': this._cartService.invoiceType,
            'isGstInvoice': addressList['isGstInvoice'],
          }        

        this.isShowLoader = true;
        this.postAddress(addressList).subscribe((rd)=>{
            if (rd['statusCode'] == 200) {
                this._cartService.shippingAddress = addressList;               
                this.pay();
            } else {
                this.isShowLoader = false;                        
            }
        })
    }

    pay() {
        this.isShowLoader = true;
        let invoiceType = this._cartService.invoiceType; 
        let cartSession = this._cartService.getCartSession();
        let addressList = this._cartService.shippingAddress as any;
        let newdata = {};

        let shippingInformation = {
            'shippingCost': cartSession['cart']['shippingCharges'],
            'couponUsed': cartSession['cart']['totalOffer'],
            'GST': addressList["isGstInvoice"] != null ? 'Yes' : 'No',
        };
        
        this._analytics.sendGTMCall({
            'event': 'checkoutStarted',
            'shipping_Information': shippingInformation,
            'city': addressList["city"],
            'paymentMode': 'COD'
        });

        let extra = {
            'mode': 'COD',
            'paymentId': 13,
            addressList: addressList
        };

        if(invoiceType === 'retail'){
            newdata = {
                'transactionId': this.transactionId,
                'platformCode': 'online',
                'mode': extra.mode,
                'paymentId': extra.paymentId,
                'requestParams': null,
                'validatorRequest': this._cartService.createValidatorRequest(extra)
            };
        } else {
            newdata = {
                'transactionId': this.transactionId,
                'platformCode': 'online',
                'mode': extra.mode,
                'paymentId': extra.paymentId,
                'paymentGateway': 'razorpay',
                'requestParams': null,
                'validatorRequest': this._cartService.createValidatorRequest(extra)
            }; 
        }   
        this._commonService.isBrowser && this._analytics.sendAdobeOrderRequestTracking(newdata, "pay-initiated:cash on delivery");
        this._cartService.pay(newdata).subscribe((res): void => {
            if (res.status != true) {
                this.submittedOnce = false;
                this.isShowLoader = false;
                return;
            }
            let data = res.data;
            let extras = {
                queryParams: {
                    mode: 'COD',
                    orderId: data.orderId,
                    transactionAmount: data.orderAmount
                },
                replaceUrl: true
            };
            this._commonService.isBrowser && this.updateBuyNowToLocalStorage();
            this._router.navigate(['order-confirmation'], extras);
            this.isShowLoader=false;
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
        //console.log('get Item List', cartItems);
        let itemsList = [];
        if (cartItems != undefined && cartItems != null && cartItems.length > 0) {
            for (let i = 0; i < cartItems.length; i++) {
                let item = {
                    'productId': cartItems[i]['productId'],
                    'productName': cartItems[i]['productName'],
                    'productImg': cartItems[i]['productImg'],
                    'amount': cartItems[i]['amount'],
                    'offer': cartItems[i]['offer'],
                    'amountWithOffer': cartItems[i]['amountWithOffer'],
                    'taxes': cartItems[i]['taxes'],
                    'amountWithTaxes': cartItems[i]['amountWithTaxes'],
                    'totalPayableAmount': cartItems[i]['totalPayableAmount'],
                    'isPersistant': true,
                    'productQuantity': cartItems[i]['productQuantity'],
                    'productUnitPrice': cartItems[i]['productUnitPrice'],
                    'expireAt': cartItems[i]['expireAt']
                };
                itemsList.push(item);
            }
        }
        return itemsList;
    }

    removePopup(){
        this.showPopup = false;
    }

    confirmOrder(){
        this.isShowLoader = true;
        this.showPopup = false;
          this.getPaymentId({userId: this.currUser['userId']}).subscribe(res => {
            if(res && res['status']) {
                this.transactionId = res['data']['transactionId'];
                this.doPay();
            }
            else{
                this._tms.show({type: 'error', text: 'Something went wrong, Please try again.'});
            }
        });
       
    }

    checkNum(val){
        if(this.userNum != parseInt(val.mobile_num)){
            this.localVal = val;
            // this.showPopup = true;
        }else{
            // this.sendOtp(val);
        }
    }

    sendOtp(val) {
        let body = {};
        this.userNum = val.mobile_num;
        this.otpError = 'An OTP has been sent to ' + val.mobile_num + '/ ' +this.userEmail;
        body['phone'] = val.mobile_num;
        body['paymentType'] = 'cod';
        body['userId'] = this.currUser['userId'];
        body['email'] = val.cust_email;
        this.sendOtpCall(body)
        .pipe(
            catchError((err) => {
                return of({bypassotp: true});
            })
        )
        .subscribe(res => {
            this.submittedOnce = false;
            // below is used to bypass otp, if otp functionality doesn't seem to work.
            if(res && res['bypassotp']){
                if(this.transactionId) {
                    this.doPay();
                } else {
                    this._tms.show({type: 'error', text: 'Something went wrong, Please try again.'});
                }
            }else if(res && res['status']) {
                this.verifyOtp = !this.verifyOtp;
                setTimeout(() => {
                    this.showResendOtp = true;
                }, 120000);
            }
        });
    }

    doPay(){
        if (this.userNum !== parseInt(this._cartService.shippingAddress as any['phone'])) {
            this.updateShippingAddress();
        }
        this.pay();
    }
    
    showResendOtp: boolean = false;
    resendOtp() {
        let body = {};
        body['phone'] = this.userNum;
        body['paymentType'] = 'cod';
        body['userId'] = this.currUser['userId'];
        if(this.userEmail){
            body['email'] = this.userEmail;
        }
        this.sendOtpCall(body).subscribe(data => {
            if (data['status']) {
                this.submittedOnce = false;
                this.showResendOtp = false;
                this._tms.show({type: 'success', text: 'An OTP has been sent again.'});
                setTimeout(() => {
                    this.showResendOtp = true;
                }, 120000);
            } else {
                this._tms.show({type: 'error', text: 'Something went wrong'});
                // this.otpError = 'Something went wrong';
                this.otpErrorFlag = false;
            }
        });
    }

    verifyMyOtp(val) {
        if (!this.submittedOnce) {
            let body = {};
            body['phone'] = this.userNum;
            body['otp'] = val.otp;
            body['userId'] = this.currUser['userId'];
            this.submittedOnce = true;
            this.isShowLoader = true;
            this.verifyOtpCall(body).subscribe(data => {
                this.isShowLoader = false;
                if (data['status']) {
                    if (this.transactionId) {
                        if (this.userNum !== parseInt(this._cartService.shippingAddress as any['phone'])) {
                            this.updateShippingAddress();
                        }
                        this.pay();
                    } else {
                        this.verifyOtp = false;
                        this.isShowLoader = false;
                        this._tms.show({type: 'error', text: 'Please fill your details again to proceed ahead.'});
                    }

                } else {
                    this.submittedOnce = false;
                    // this.otpError = 'You have entered wrong OTP';
                    this._tms.show({type: 'error', text: 'You have entered wrong OTP'});
                    this.otpErrorFlag = false;
                }
            });
        }
    }


    sendOtpCall(data){
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API+"/checkout/sendPaymentOtp", {body:data});
    }

    verifyOtpCall(data){
        return this._dataService.callRestful('POST', CONSTANTS.NEW_MOGLIX_API+"/checkout/verifypaymentotp", {body:data});
    }

    getPaymentId(data) {
        return this._dataService.callRestful('GET', CONSTANTS.NEW_MOGLIX_API + '/payment/getPaymentId', {params: data}).pipe(
            catchError((e) => of({'status': false, 'data': {'transactionId': null}, 'description': null}))
        );
    }

    postAddress(address) {
        //address['onlineab'] = "y";
        return this._dataService.callRestful("POST", CONSTANTS.NEW_MOGLIX_API + ENDPOINTS.POST_ADD + '?onlineab=y', { body: address }).pipe(
            catchError((res: HttpErrorResponse) => {
                return of({status: false, statusCode: res.status});
            })
        );
    }

}
