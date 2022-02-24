import { FormGroup } from '@angular/forms';
import { Component, EventEmitter, AfterViewInit, OnInit, ElementRef } from '@angular/core';
import { PaymentService } from './payment.service';
import CONSTANTS from '../../config/constants';
import { CommonService } from '../../utils/services/common.service';
import { LocalAuthService } from '../../utils/services/auth.service';
import { DataService } from '../../utils/services/data.service';
import { CartService } from '../../utils/services/cart.service';
import { GlobalLoaderService } from '../../utils/services/global-loader.service';
import { GlobalAnalyticsService } from '@app/utils/services/global-analytics.service';

// TODO: 
/**
 * remove isSavedCardExist, savedCardsData, paymentForm
 */
@Component({
    selector: 'checkout-payment',
    templateUrl: './payment.html',
    styleUrls: ['./payment.scss' ],
})
export class PaymentComponent implements OnInit {

    paymentBlock: number;
    globalConstants: any;
    isSavedCardExist: boolean;
    savedCardsData: any;
    updateTabIndex: EventEmitter<number> = new EventEmitter();
    spp: boolean; // spp: Show Payment Popup
    invoiceType: string;
    totalAmount: number;
    messageEmi: string;
    messageCod: string;
    messageNeft: string;
    disableCod: boolean;
    showPopup: boolean = false;
    unAvailableMsnList: Array<any> = [];
    paymentForm: FormGroup;
    isPaymentSelected: boolean = false;
    canNEFT_RTGS = true;
    successPercentageRawData = null;


    
    constructor(
        public _dataService: DataService,
        private _loaderService: GlobalLoaderService,
        public _cartService: CartService,
        private _paymentService: PaymentService,
        private _localAuthService: LocalAuthService,
        public _commonService: CommonService,
        private _analytics: GlobalAnalyticsService,
        private _elementRef: ElementRef) {

        this.globalConstants = CONSTANTS.GLOBAL;
        this.isSavedCardExist = false;
        this.isShowLoader = true;
    }

    ngOnInit() {
       
        this.intialize();

        // TODO: confirm how this works if used in current app then move this to card payment method
        // this.getSavedCardData();

    }

    private intialize() {
        if (this._commonService.isBrowser) {

            const cartData = this._cartService.getCartSession();

            this.canNEFT_RTGS = cartData['cart']['agentId'];
            this.totalAmount = (cartData['cart']['totalAmount']) + +(cartData['cart']['shippingCharges']) - +(cartData['cart']['totalOffer']); // intialize total amount

            // TODO  -- change this and use it from cart service 
            let invoiceType = 'retail' // this.checkOutService.getInvoiceType();
            this.invoiceType = invoiceType;

            if (invoiceType == 'tax') {
                this.paymentBlock = this.globalConstants["razorPay"];
                this.isShowLoader = false;
            }

            // TODO - check feasibilty of this section 
            // if (!this._commonService.cashOnDeliveryStatus.isEnable) {
            //     this.disableCod = true;
            // }

            // TODO - this should used in case there are some COD not avalible
            this.unAvailableMsnList = this._cartService.codNotAvailableObj['itemsArray'];

            // TODO - check with pritam how this used
            this.getPaymentSuccessAssistData();

            this.analyticVisit(cartData);
        }
    }

    private getSavedCardData() {
        const userSession = this._localAuthService.getUserSession();
        const data = {
            userEmail: (userSession && userSession['email']) ? userSession['email'] : userSession['phone']
        };

        if (this.invoiceType == 'tax') {
            data['userId'] = userSession['userId'];
            data['userEmail'] = '';
        }

        this._paymentService.getSavedCards(data, this.invoiceType)
            .subscribe((res) => {
                if (res['status'] === true && res['data']['user_cards'] !== undefined && res['data']['user_cards'] != null) {
                    this.savedCardsData = res['data']['user_cards'];
                    this.isSavedCardExist = true;
                    this.paymentBlock = this.globalConstants['savedCard'];
                }
                this.isShowLoader = false;
            });
    }

    private analyticVisit(cartData: any) {
        if (cartData['itemsList'] !== null && cartData['itemsList']) {
            var trackData = {
                event_type: "page_load",
                page_type: "payment",
                label: "view",
                channel: "Checkout",
                price: cartData["cart"]["totalPayableAmount"].toString(),
                quantity: cartData["noOfItems"],
                shipping: parseFloat(cartData["shippingCharges"]),
                invoiceType: this.invoiceType,
                itemList: cartData["itemsList"].map(item => {
                    return {
                        category_l1: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[0] : null,
                        category_l2: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[1] : null,
                        category_l3: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[2] : null,
                        price: item["totalPayableAmount"].toString(),
                        quantity: item["productQuantity"]
                    };
                })
            };
            this._analytics.sendToClicstreamViaSocket(trackData);
        }
    }

    updatePaymentBlock(block, mode?, elementId?) {
        let cart = this._cartService.getCartSession();
        this.totalAmount = cart['cart']['totalAmount'] + cart['cart']['shippingCharges'] - cart['cart']['totalOffer'];
        this.messageEmi = "";
        this.messageCod = "";
        this.messageNeft = "";
        // console.log('totalAmount',this.totalAmount);
        if (block == 4 && this.totalAmount < 3000) {
            this.messageEmi = "Not available below Rs. 3000";
            this.paymentBlock == null;
            return;
        }
        else if (block == 5 && this.totalAmount > CONSTANTS.GLOBAL.codMax) {
            this.messageCod = "Not available above Rs. " + CONSTANTS.GLOBAL.codMax;
            this.paymentBlock == null;
            return;
        }
        else if (block == 5 && this.totalAmount < 300) {
            this.messageCod = "Not available below Rs. 300";
            this.paymentBlock == null;
            return;
        }
        else if (block == 6 && this.totalAmount < 2000) {
            this.messageNeft = "Not available below Rs. 2000";
            this.paymentBlock == null;
            return;
        }
        else {
            this.paymentBlock = block;
            this.spp = true;
        }

        this.isPaymentSelected = true;

        if (cart['itemsList'] !== null && cart['itemsList']) {
            var trackData = {
                event_type: "click",
                page_type: "payment",
                label: "payment_select",
                channel: "Checkout",
                price: cart["cart"]["totalPayableAmount"].toString(),
                quantity: cart["noOfItems"],
                shipping: parseFloat(cart["shippingCharges"]),
                invoiceType: this.invoiceType,
                paymentMode: mode,
                itemList: cart["itemsList"].map(item => {
                    return {
                        category_l1: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[0] : null,
                        category_l2: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[1] : null,
                        category_l3: item["taxonomyCode"] ? item["taxonomyCode"].split("/")[2] : null,
                        price: item["totalPayableAmount"].toString(),
                        quantity: item["productQuantity"]
                    }
                })
            }
            this._dataService.sendMessage(trackData);
        }

        if (elementId) {
            this.scollToSection(elementId);
        }

    }

    scollToSection(elementId) {
        setTimeout(() => {
            this._elementRef.nativeElement.ownerDocument.getElementById(elementId).scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 300);
    }

    outData(data) {
        this[data.selector] = !this[data.selector];
    }

    removeTab(tabId) {
        this.isSavedCardExist = false;
    }

    tabIndexUpdated(index) {
        this.updateTabIndex.emit(index);
    }

    getPaymentSuccessAssistData() {
        this._paymentService.getPaymentsMethodData(this.invoiceType).subscribe(result => {
            if (result['status']) {
                this.successPercentageRawData = result['data'] || null;
            }
        })
    }

    get neftSuccessPercentageData() {
        return (this.successPercentageRawData && this.successPercentageRawData['NB']) ? this.successPercentageRawData['NB'] : null
    }

    get walletSuccessPercentageData() {
        return (this.successPercentageRawData && this.successPercentageRawData['WALLET']) ? this.successPercentageRawData['WALLET'] : null
    }

    get upiSuccessPercentageData() {
        return (this.successPercentageRawData && this.successPercentageRawData['UPI']) ? this.successPercentageRawData['UPI'] : null
    }

    learnMore(e) {
        if (e !== undefined) {
            e.stopPropagation();
        }
        this.showPopup = true;
    }
    
    set isShowLoader(value) {
        this._loaderService.setLoaderState(value);
    }

    // getPopupHeading(): string {
    //     if (this.paymentBlock === this.globalConstants['creditDebitCard']) {
    //         return 'Credit/Debit Card';
    //     } else if (this.paymentBlock === this.globalConstants['netBanking']) {
    //         return 'Net Banking';
    //     } else if (this.paymentBlock === this.globalConstants['wallet']) {
    //         return 'Wallet';
    //     } else if (this.paymentBlock === this.globalConstants['emi']) {
    //         return 'EMI';
    //     } else if (this.paymentBlock === this.globalConstants['cashOnDelivery']) {
    //         return 'Cash on Delivery';
    //     } else if (this.paymentBlock === this.globalConstants['neftRtgs']) {
    //         return 'NEFT/RTGS';
    //     } else if (this.paymentBlock === this.globalConstants['upi']) {
    //         return 'UPI';
    //     } else if (this.paymentBlock === this.globalConstants['paytmUpi']) {
    //         return 'Paytm UPI';
    //     }
    //     return null;
    // }

}