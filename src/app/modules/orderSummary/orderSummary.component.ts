import { Component, Input, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { OrderSummaryService } from './orderSummary.service';
import { Subject } from 'rxjs/Subject';
import { ToastMessageService } from '../toastMessage/toast-message.service';
import { Router } from '@angular/router';
import { LocalStorageService } from 'ngx-webstorage';
import { DataService } from '../../utils/services/data.service';
import { CartService } from '../../utils/services/cart.service';
import { GlobalLoaderService } from '../../utils/services/global-loader.service';
declare let dataLayer: any;


@Component({
    templateUrl: 'orderSummary.html',
    selector: 'order-summary',
    styleUrls: ['./orderSummary.scss'],
})
export class OrderSummaryComponent implements OnInit, AfterViewInit, OnDestroy {

    // isOrderSummaryVisible:boolean=false
    totalAmountPayable: number;
    totalAmount: number;
    itemsList: Array<{}>;
    data: any;
    cartSession: any;
    // promoCodeGroup: FormGroup;
    shippingCharges: number;
    errorMeesage: string;
    @Input() cartSessionUpdated$: Subject<any>;
    netAmount: number;
    noOfCart: number;
    appliedPromoCode = { promoCode: null, promoDescription: null };
    isServer: boolean = typeof window !== 'undefined' ? false : true;
    vof: boolean;
    pad: { type?: string, text?: string }; // pad: promo apply data
    set isShowLoader(value) {
        this.loaderService.setLoaderState(value);
    }

    constructor(
        public router: Router,
        public _dataService: DataService,
        public orderSummaryService: OrderSummaryService,
        public _cartService: CartService,
        private _tms: ToastMessageService,
        private localStorageService: LocalStorageService,
        private loaderService: GlobalLoaderService) {

        this.shippingCharges = 0;
        this.errorMeesage = '';
        this.vof = false;
        this.itemsList = [];
        this.totalAmountPayable = 0;
        this.totalAmount = 0;
        this.shippingCharges = 0;
        this.netAmount = 0;
        this.errorMeesage = '';
        this.isShowLoader = false;
    }


    ngOnInit() {
        if (!this.isServer) {
            // console.log('Order summary');
            // this.getAllPromoCodesByUserId();
            this.cartSession = this._cartService.getCartSession();
            this.shippingCharges = this.cartSession['cart']['shippingCharges'];

            const items: Array<any> = this.cartSession['itemsList'];
            this.noOfCart = items.length;
            this.getAppliedPromocode();

            if (this.cartSession['itemsList'] !== null && this.cartSession['itemsList']) {

                this.getGTMData(this.cartSession);
                var trackData = {
                    event_type: "page_load",
                    page_type: this.router.url == "/quickorder" ? "Cart" : "Checkout",
                    label: "view",
                    channel: this.router.url == "/quickorder" ? "Cart" : "Checkout",
                    price: this.cartSession["cart"]["totalPayableAmount"] ? this.cartSession["cart"]["totalPayableAmount"].toString() : "0",
                    quantity: this.cartSession["noOfItems"],
                    shipping: parseFloat(this.cartSession["shippingCharges"]),
                    itemList: this.cartSession.itemsList.map(item => {
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
            // alert(JSON.stringify(this.cartSession));

            // this.getShippingCharge(this.cartSession['cart'].totalPayableAmount);
            // if (this.cartSession['offersList'] !== null && this.cartSession['offersList'] !== null) {
            //     let offerList = this.cartSession['offersList'];
            //     if (offerList.length > 0) {
            //         this.getPromoCodeDetail(offerList[0].offerId);
            //     }
            // }
            // let offerList = this.cartSession['offersList'];
            // alert(JSON.stringify(this.cartSession['offersList']));
            // alert(JSON.stringify(offerList));
            // if (offerList.length > 0) {
            //     this.getPromoCodeDetail(offerList[0].offerId);
            // }

            /*this.cartSessionUpdated$.subscribe((cartSession)=>{
                // alert();
                // console.log(cartSession, 'updateCartSession$updateCartSession$updateCartSession$');
                // this.cart = this.cartSession['cart'];
                this.itemsList = (this.cartSession['itemsList'] != undefined && this.cartSession['itemsList'] != null) ? this.cartSession['itemsList'] : [];
                this.cd.markForCheck();
            });*/

            this._cartService.extra.subscribe((data) => {
                if (data && data.errorMessage) {
                    this.errorMeesage = data.errorMessage;
                } else {
                    this.errorMeesage = '';
                }
            });

            this._cartService.orderSummary.subscribe(

                (data: { cartSession?: {}, extra?: { errorMessage: string } }) => {

                    this.cartSession = this._cartService.getCartSession();
                    //    console.log(this.cartSession, ' order summary cart ');
                    // this.getAllPromoCodesByUserId();
                    if (this.cartSession['itemsList'] !== null && this.cartSession['itemsList']) {
                        let items: Array<any> = this.cartSession['itemsList'];
                        this.noOfCart = items.length;
                        this.getGTMData(this.cartSession);
                    }

                    if (this.cartSession['offersList']) {
                        if (this.cartSession['offersList'].length === 0) {
                            this.appliedPromoCode.promoCode = null;
                            this.appliedPromoCode.promoDescription = null;

                        }
                    }

                    this.getAppliedPromocode();
                    this.shippingCharges = this.cartSession['cart'].shippingCharges;
                }
            );

        }
        /*this._commonService.getSession().subscribe((response)=>{
         });*/
        if (!this.isServer) {
            // if ($(window).width() > 768) {
            // $(window).scroll(function (event) {
            //     let scroll:number = $(this).scrollTop();
            //     if (scroll > 100) {
            //         let new_pos:number = scroll - 105;
            //         $('.order-block').css('transform', 'translateY(' + <number>new_pos + 'px)');
            //     }
            // });
            // }
            document.body.addEventListener('click', function (e) {
                if (e.target && (<Element>e.target).matches('order-summary .mobile-promo small')) {
                    if (!document.querySelector('.mobile-promo-box').classList.contains('block')) {
                        document.querySelector('.mobile-promo-box').classList.add('block');
                    }
                }
            });

            document.body.addEventListener('click', function (e) {
                if (e.target && (<Element>e.target).matches('.input-close input')) {
                    document.querySelector('.mobile-promo-box').classList.remove('block');
                }
            });

            document.body.addEventListener('click', function (e) {
                // alert(123);
                // console.log(e.target);
                if (e.target && (<Element>e.target).matches('.close-promo .icon-delete_filter')) {
                    document.querySelector('.mobile-promo-box').classList.remove('block');
                }
            });
        }
    }
    getGTMData(cartSession) {
        const obj = [];
        const ecomm_prodid = [];
        cartSession.itemsList.forEach(element => {
            obj.push({
                'id': element.productId,
                'name': element.productName,	// Required
                'price': element.productUnitPrice,
                'variant': this.appliedPromoCode.promoCode,
                'quantity': element.productQuantity
            });
            ecomm_prodid.push(element.productId)
        });
        const google_tag_params = {
            ecomm_prodid: ecomm_prodid,
            ecomm_pagetype: 'cart',
            ecomm_totalvalue: parseFloat(cartSession.cart.totalAmount)
        };

        setTimeout(() => {
            dataLayer.push({
                'event': 'dyn_remk',
                'ecomm_prodid': google_tag_params.ecomm_prodid,
                'ecomm_pagetype': google_tag_params.ecomm_pagetype,
                'ecomm_totalvalue': google_tag_params.ecomm_totalvalue,
                'google_tag_params': google_tag_params
            });
        }, 3000);
    }

    getPromoCodeDetail(offerId) {
        this.orderSummaryService.getPromoCodeDetailById(offerId).subscribe(res => {
            if (res['status']) {
                this.appliedPromoCode.promoCode = res['data']['promoAttributes']['promoCode'];
                this.appliedPromoCode.promoDescription = res['data']['promoAttributes']['promoDescription'];
                // alert(JSON.stringify(res));
                this.outData({
                    pcd: {
                        isApplied: true,
                        text: this.appliedPromoCode.promoCode
                    }
                });
            }


        });
    }

    getAppliedPromocode() {
        if (this.cartSession['offersList']) {
            const appiedCode: Array<any> = this.cartSession['offersList'];
            if (appiedCode) {
                if (appiedCode.length > 0) {
                    this.getPromoCodeDetail(appiedCode[0].offerId);
                }
            }
        }
    }

    /* getShippingCharge(orderValue) {
        this.isShowLoader=true;
        this.orderSummaryService.getShippingCharges(orderValue).subscribe(
            res => {
                if (res.statusCode == 200) {
                    this.cartSession = this._cartService.getCartSession();

                    this.cartSession['cart']['shippingCharges'] = res.data;
                    this.shippingCharges = res.data;
                    this._cartService.updateCartSession(this.cartSession).subscribe(
                        data => {
                            this.isShowLoader=false;
                        }
                    );

                    // this.shippingCharges = this.calCulateTotalAmount(this.cartSession['cart'].totalPayableAmount, this.shippingCharges, this.cartSession['cart'].totalPayableAmount)
                }
            }

        );
    } */

    deletePromoCode() {
        this.isShowLoader = true;
        if (!this.isServer) {
            // (<HTMLElement>document.querySelector('#page-loader')).style.display = 'block';//.show();            $('#page-loader').show();
            this.cartSession['offersList'] = [];
            this.cartSession['extraOffer'] = null;
            this.cartSession['cart']['totalOffer'] = 0;

            this.itemsList = this.cartSession['itemsList'];
            this.itemsList.forEach((element, index) => {
                this.cartSession['itemsList'][index]['offer'] = null;
            });
            this._cartService.updateCartSession(this.cartSession).subscribe(
                data => {
                    this.isShowLoader = false;
                    this._cartService.setCartSession(data);
                    // (<HTMLElement>document.querySelector('#page-loader')).style.display = 'none';//.hide();
                    this.appliedPromoCode.promoCode = null;
                    this.appliedPromoCode.promoDescription = null;
                    this._cartService.validateCartSession.next(this.cartSession);
                    this._cartService.prepaidDiscountSubject.next();
                    setTimeout(() => {
                        this._tms.show({ type: 'success', text: "Promo Code Removed" });
                    }, 1000);
                    // this.promoCodeGroup.reset();
                    // (<HTMLInputElement>document.querySelector('label.radio_list input[name="promo-code"]')).checked = false;
                }
            );
        }
    }


    ngAfterViewInit() {
        if (window.outerWidth > 1025) {
            window.addEventListener('scroll', (event) => {
                // $(window).scroll(function (event) {
                const scrollEl = document.scrollingElement || document.documentElement;
                const scroll = scrollEl.scrollTop; // $(window).scrollTop();
                const translate = scroll - 101;
                if (scroll > 90 && document.querySelector('.order-block')) {
                    (<HTMLElement>document.querySelector('.order-block')).style.transform = 'translateY(' + translate + 'px)';
                }
            }, { passive: true });
        }
    }

    ngOnChange(changes) {

    }

    calCulateTotalAmount(totalAmount, shippingCharge, totalOffer): number {
        return Number(totalAmount) + Number(shippingCharge) - Number(totalOffer);
    }

    ngOnDestroy() {
        if (!this.isServer && document.querySelector('#page-loader')) {
            (<HTMLElement>document.querySelector('#page-loader')).style.display = 'none'; // .hide();
        }
    }

    closePopup() {
        this.vof = false;
    }

    openOfferPopUp() {
        const user = this.localStorageService.retrieve('user');
        if (user && user.authenticated == "true") {
            this.vof = true;
        } else {
            // this._gState.notifyDataChanged('loginPopup.open',{redirectUrl:'/quickorder'});
            this.router.navigateByUrl('/login');
        }
    }

    updateCartSession(data: { cartSession?: {} }) {
        if (data && data.cartSession) {
            this.cartSession = data.cartSession;
            this.itemsList = data.cartSession['itemsList'];
        }
        // console.log(data.cartSession);
    }

    outData(data: {}) {
        debugger;
        if (data && data['pcd']) {
            this.pad = Object.assign({}, this.pad, data['pcd']);
            // console.log(data['pcd'], this.pad, "outData", "orderSummary");
        }

        // rpc: remove promocode
        if (data && data['rpc']) {
            this.deletePromoCode();
        }
    }
}
