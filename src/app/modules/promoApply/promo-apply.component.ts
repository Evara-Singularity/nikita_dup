import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { LocalStorageService } from 'ngx-webstorage';
import { PromoApplyService } from './promo-apply.service';
import { Subject } from 'rxjs';
import { ToastMessageService } from '../toastMessage/toast-message.service';
import { CartService } from '../../utils/services/cart.service';
import { mergeMap } from 'rxjs/operators';

declare let dataLayer: any;

@Component({
    selector: 'app-promo-apply',
    templateUrl: './promo-apply.component.html',
    styleUrls: ['./promo-apply.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromoApplyComponent implements OnInit, OnChanges {

    promoCodeGroup: FormGroup;
    promoCodeResponse: any;
    appliedPromoCode = { promoCode: null, promoDescription: null };
    errorMeesage: string;
    isShowLoader: boolean;
    itemsList: Array<{}>;
    private cartSession: any;
    @Input() updatePromo$: Subject<string>;
    @Input() iData: { type?: string, text?: string, isApplied?: boolean };
    @Output() outData$: EventEmitter<{}>;
    @Output() updateCartSession$: EventEmitter<{}>;

    constructor(private _tms: ToastMessageService, private _cdr: ChangeDetectorRef, private _pas: PromoApplyService,
        private _fb: FormBuilder, private _cs: CartService, private _lss: LocalStorageService) {

        this.iData = { type: null, text: null, isApplied: false };
        this.updateCartSession$ = new EventEmitter();
        this.itemsList = [];
        this.isShowLoader = false;
        this.outData$ = new EventEmitter();
        this.promoCodeGroup = this._fb.group(
            {
                promoCode: [this.iData && this.iData.text ? this.iData.text : null, [Validators.required]]
            }
        );

    }

    ngOnChanges(changes: SimpleChanges): void {
        // console.log("ngonchange called");
        const cv = changes['iData']['currentValue'];
        // console.log(cv);
        if (cv && cv['text']) {
            this.promoCodeGroup['controls']['promoCode'].setValue(cv['text']);
            // console.log(this.promoCodeGroup['controls']['promoCode'].value);
        } else {
            this.promoCodeGroup['controls']['promoCode'].setValue(null);
            this.iData = { type: null, text: null, isApplied: false };
        }
    }

    ngOnInit() {
        // console.log(this.iData, "asdfadfasfasdf");
        if (this.updatePromo$) {
            this.updatePromo$.subscribe((pc) => {
                // console.log('asdfadfaf');
                if (this.promoCodeGroup.controls['promoCode'].value !== pc)
                    this.iData = { type: null, text: null, isApplied: false };
                this.promoCodeGroup.controls['promoCode'].setValue(pc);
                this._cdr.markForCheck();
            });
        }
    }

    applyPromoCode(promocode?: any) {
        this.updateCartSession$.next({});
        this.isShowLoader = true;
        this.promoCodeResponse = null;
        if (this._lss.retrieve('user')) {
            const cartSession = this._cs.getCartSession();
            cartSession['extraOffer'] = null;
            const userData = this._lss.retrieve('user');
            if (userData.authenticated === 'true') {
                let obj: Array<any>;
                if (promocode) {
                    obj = promocode;
                } else {
                    this._pas.getPromoCodeDetailByName(this.promoCodeGroup.controls['promoCode'].value).subscribe(res => {
                        this.promoCodeResponse = res;
                        if (res['status']) {
                            obj = [{
                                offerId: res['data']['promoAttributes']['promoId'],
                                type: '15'
                            }];

                            cartSession['offersList'] = obj;

                            const reqobj = {
                                'shoppingCartDto': cartSession
                            };

                            this._pas.applyPromoCode(reqobj).subscribe(
                                resp => {
                                    if (resp['status']) {
                                        dataLayer.push({
                                            'event': 'promotionClick',
                                            'ecommerce': {
                                                'promoClick': {
                                                    'promotions': [
                                                        {
                                                            'id': cartSession['offersList'][0]['offerId'], // Name or ID is required.
                                                            'name': this.promoCodeGroup.controls['promoCode'].value,
                                                            'creative': 'creative',
                                                            'position': 'slot/position'
                                                        }]
                                                }
                                            },
                                        });
                                        if (resp['data']['discount'] <= cartSession['cart']['totalAmount']) {
                                            //  ;
                                            this.iData.isApplied = true;
                                            // this.iData.text =
                                            // pcd : promo code detail
                                            this.outData$.emit({
                                                pcd: {
                                                    text: this.promoCodeGroup.controls['promoCode'].value,
                                                    // type: this.iData.type,
                                                    isApplied: true
                                                }
                                            });
                                            cartSession['cart']['totalOffer'] = resp['data']['discount'];
                                            cartSession['extraOffer'] = null;
                                            const productDiscount = resp['data']['productDis'];
                                            const productIds = Object.keys(resp['data']['productDis'] ? resp['data']['productDis'] : {});
                                            const itemsList: Array<{}> = cartSession['itemsList'];

                                            itemsList.map((item) => {
                                                if (productIds.indexOf(item['productId']) !== -1) {
                                                    return item['offer'] = productDiscount[item['productId']];
                                                } else {
                                                    return item['offer'] = null;
                                                }
                                            });

                                            this.itemsList = itemsList;
                                            cartSession['itemsList'] = itemsList;

                                            this._cs.updateCartSession(cartSession).pipe(
                                                mergeMap(cartSession => {
                                                    return this._cs.getShippingAndUpdateCartSession(cartSession)
                                                })
                                            ).subscribe(
                                                data => {
                                                    this.updateCartSession$.next({ cartSession: data });
                                                    // this.cartSession = data;
                                                    this._cs.setCartSession(data);
                                                    this.appliedPromoCode.promoCode = this.promoCodeResponse.data.promoAttributes.promoCode;
                                                    this.appliedPromoCode.promoDescription = this.promoCodeResponse.data.promoAttributes.promoDescription;
                                                    this._cs.validateCartSession.next(data);
                                                    this._cs.prepaidDiscountSubject.next();
                                                    this.isShowLoader = false;
                                                    setTimeout(() => {
                                                        this._tms.show({ type: 'success', text: 'Promo Code Applied' });
                                                    }, 500);
                                                }
                                            );
                                            
                                        } else {

                                            cartSession['cart']['totalOffer'] = 0;
                                            cartSession['offersList'] = [];

                                            const itemLists: Array<{}> = cartSession['itemsList'];
                                            itemLists.map((item) => item['offer'] = null);
                                            this.itemsList = itemLists;
                                            cartSession['itemsList'] = itemLists;


                                            this.appliedPromoCode.promoCode = null;
                                            this.appliedPromoCode.promoDescription = null;
                                            this._cs.updateCartSession(cartSession).pipe(
                                                mergeMap(cartSession => {
                                                    return this._cs.getShippingAndUpdateCartSession(cartSession)
                                                })
                                            ).subscribe(
                                                data => {
                                                    this.updateCartSession$.next({ cartSession: data });
                                                    this.cartSession = data;
                                                    this._cs.setCartSession(data);
                                                    this._cs.validateCartSession.next(this.cartSession);
                                                    this._cs.prepaidDiscountSubject.next();
                                                    this.isShowLoader = false;
                                                    setTimeout(() => {
                                                        this._tms.show({ type: 'error', text: 'Your cart amount is less than ' + resp['data']['discount'] });
                                                    }, 500);
                                                }
                                            );

                                        }
                                    } else {
                                        this.appliedPromoCode.promoCode = null;
                                        this.appliedPromoCode.promoDescription = null;
                                        cartSession['cart']['totalOffer'] = 0;
                                        cartSession['offersList'] = [];
                                        const itemLists: Array<{}> = cartSession['itemsList'];
                                        itemLists.map((item) => item['offer'] = 0);
                                        this.itemsList = itemLists;
                                        cartSession['itemsList'] = itemLists;

                                        this._cs.updateCartSession(cartSession).pipe(
                                            mergeMap(cartSession => {
                                                return this._cs.getShippingAndUpdateCartSession(cartSession)
                                            })
                                        ).subscribe(
                                            data => {
                                                this.updateCartSession$.next({ cartSession: data });
                                                this.cartSession = data;
                                                this._cs.setCartSession(data);
                                                this._cs.validateCartSession.next(this.cartSession);
                                                this._cs.prepaidDiscountSubject.next();
                                                this.isShowLoader = false;
                                                setTimeout(() => {
                                                    this._tms.show({ type: 'error', text: resp['statusDescription'] });
                                                }, 500);
                                            }
                                        );
                                    }
                                }
                            );
                        } else {
                            this.isShowLoader = false;
                            this._tms.show({ type: 'error', text: this.promoCodeResponse.statusDescription });
                        }
                    });
                }
            } else {
                this.isShowLoader = false;
                this._tms.show({ type: 'error', text: "To Avail Offer Please Login" });
            }
        } else {
            this.isShowLoader = false;
            // this.errorMeesage = 'To avail offer,';
            this._tms.show({ type: 'error', text: "To Avail Offer Please Login" });
        }
    }

    removePromoCode() {
        this.outData$.emit({
            pcd: {
                text: null,
                // type: this.iData.type,
                isApplied: null
            },
            rpc: true
        });
    }
}
