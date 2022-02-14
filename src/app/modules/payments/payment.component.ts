import { GlobalSessionStorageService } from './../../utils/services/global-session-storage.service';
import { FormGroup } from '@angular/forms';
import { Component, EventEmitter, AfterViewInit, OnInit, ElementRef } from '@angular/core';
import { PaymentService } from './payment.service';
import CONSTANTS from '../../config/constants';
import { CommonService } from '../../utils/services/common.service';
import { CheckoutService } from '../../utils/services/checkout.service';
import { LocalAuthService } from '../../utils/services/auth.service';
import { DataService } from '../../utils/services/data.service';
import { CartService } from '../../utils/services/cart.service';
import { GlobalLoaderService } from '../../utils/services/global-loader.service';

@Component({
    selector: 'payment',
    templateUrl: './payment.html',
    styleUrls: [
        './payment.scss'
    ],
})

export class PaymentComponent implements OnInit, AfterViewInit {
    paymentBlock: number;
    globalConstants: {};
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
    set isShowLoader(value) {
        this.loaderService.setLoaderState(value);
    }
    successPercentageRawData = null; 

    constructor(public _dataService: DataService, private loaderService: GlobalLoaderService, public cartService: CartService, private _paymentService: PaymentService, private _localAuthService: LocalAuthService, public checkOutService: CheckoutService, public commonService: CommonService, private elementRef: ElementRef
        ,private _globalSessionService:GlobalSessionStorageService) {
        this.globalConstants = CONSTANTS.GLOBAL;
        this.isSavedCardExist = false;
        this.isShowLoader = true;
    }

    ngOnInit() {
        const _cartItems = this.cartService.getCartSession()['itemsList'];
        const _cartMSNs = (_cartItems as any[]).map(item => item['productId']);
        this._globalSessionService.updatePaymentMsns(_cartMSNs);
        let invoiceType = this.checkOutService.getInvoiceType();
        this.invoiceType = invoiceType;

        const userSession = this._localAuthService.getUserSession();
        const data = {
            userEmail: (userSession && userSession['email']) ? userSession['email'] : userSession['phone']
        };

        if (invoiceType == 'tax') {
            data['userId'] = userSession['userId'];
            data['userEmail'] = '';
        }

        this._paymentService.getSavedCards(data, invoiceType)
            .subscribe((res) => {
                if (res['status'] === true && res['data']['user_cards'] !== undefined && res['data']['user_cards'] != null) {
                    this.savedCardsData = res['data']['user_cards'];
                    this.isSavedCardExist = true;
                    this.paymentBlock = this.globalConstants['savedCard'];
                }

                // New requirement (Checkout flow): Do not auto select any payment meth
                // else {
                //     this.paymentBlock = this.globalConstants['creditDebitCard'];
                // }

                this.isShowLoader = false;
            });

        if (invoiceType == 'tax') {

            this.paymentBlock = this.globalConstants["razorPay"];
            this.isShowLoader = false;
        }

        if (!this.commonService.cashOnDeliveryStatus.isEnable) {
            this.disableCod = true;
        }

        this.unAvailableMsnList = this.cartService.codNotAvailableObj['itemsArray'];

        var cartData = this.cartService.getCartSession();
        this.canNEFT_RTGS = cartData['cart']['agentId'];
        this.totalAmount = cartData['cart']['totalAmount'] + cartData['cart']['shippingCharges'] - cartData['cart']['totalOffer']; // intialize total amount

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
                    }
                })
            }
            this._dataService.sendMessage(trackData);
        }

        this.getPaymentSuccessAssistData();
    }


    getPaymentSuccessAssistData() {
        this._paymentService.getPaymentsMethodData(this.invoiceType).subscribe(result => {
            if (result['status']) {
                this.successPercentageRawData = result['data'] || null;
            }
        })
    }

    ngAfterViewInit() {
    }

    checkEmiAmount() {
        // let cart=this.cartService.getCartSession();
        // this.totalAmount=cart['cart']['totalAmount'] + cart['cart']['shippingCharges'] - cart['cart']['totalOffer'];
        // // console.log('totalAmount',this.totalAmount);
        // if (this.totalAmount < 3000) {
        //     this.message = "Emi not available below Rs. 3000";
        //     //this.isEmiEnable = false;
        //     console.log("message", this.message);
        // }
    }


    updatePaymentBlock(block, mode?, elementId?) {
        let cart = this.cartService.getCartSession();
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
            // ClientUtility.scrollToTop(1000, (<HTMLElement>document.querySelector('.tab-content')).offsetTop);
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
            this.elementRef.nativeElement.ownerDocument.getElementById(elementId).scrollIntoView({ behavior: 'smooth',block: 'center'});
        }, 300);
    }

    outData(data) {
        this[data.selector] = !this[data.selector];
        // this.openPinCodePopup = !data.hide;
    }

    getPopupHeading(): string {
        if (this.paymentBlock === this.globalConstants['creditDebitCard']) {
            return 'Credit/Debit Card';
        } else if (this.paymentBlock === this.globalConstants['netBanking']) {
            return 'Net Banking';
        } else if (this.paymentBlock === this.globalConstants['wallet']) {
            return 'Wallet';
        } else if (this.paymentBlock === this.globalConstants['emi']) {
            return 'EMI';
        } else if (this.paymentBlock === this.globalConstants['cashOnDelivery']) {
            return 'Cash on Delivery';
        } else if (this.paymentBlock === this.globalConstants['neftRtgs']) {
            return 'NEFT/RTGS';
        } else if (this.paymentBlock === this.globalConstants['upi']) {
            return 'UPI';
        } else if (this.paymentBlock === this.globalConstants['paytmUpi']) {
            return 'Paytm UPI';
        }
        return null;
    }

    removeTab(tabId) {
        this.isSavedCardExist = false;
        // this.paymentBlock = this.globalConstants['creditDebitCard'];
    }

    tabIndexUpdated(index) {
        // console.log("Payment Component", index);

        this.updateTabIndex.emit(index);
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
}