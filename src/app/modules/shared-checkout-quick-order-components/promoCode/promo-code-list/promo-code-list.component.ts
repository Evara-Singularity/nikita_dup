import { OnDestroy } from '@angular/core';
import { AfterViewInit } from '@angular/core';
import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';
import { CartService } from '@app/utils/services/cart.service';
import { Subject, Subscription } from 'rxjs';

declare let dataLayer: any;

@Component({
    selector: 'promo-code-list',
    templateUrl: './promo-code-list.component.html',
    styleUrls: ['./promo-code-list.component.scss']
})
export class PromoCodeListComponent implements OnInit, OnDestroy
{
    public nextPromocode: Subject<string> = new Subject<string>();
    @Output('closePromoOfferPopup') closePromoOfferPopup = new EventEmitter();
    appliedPromocodeSubscription: Subscription = null;
    selectedPromocode = null;

    constructor(
        private _commonService: CommonService,
        private _loaderService: GlobalLoaderService,
        public _cartService: CartService
    ) { }


    ngOnInit()
    {
        if (this._cartService.appliedPromoCode) {
            this.selectedPromocode = this._cartService.appliedPromoCode;
        }
        this.appliedPromocodeSubscription = this._cartService.appliedPromocodeSubject.subscribe((promocode: string) =>
        {
            if (promocode) { this.closePromoOfferPopup.emit(false) }
        })
        //this.getAllPromoCodesByUserId(this._commonService.userSession.userId);
    }

    // getAllPromoCodesByUserId(userId) {
    //     this._loaderService.setLoaderState(true);
    //     if (this._commonService.userSession.authenticated === 'true') {
    //         this._cartService.getAllPromoCodesByUserId(userId).subscribe(res => {
    //             if (res['statusCode'] === 200) {
    //                 this._cartService.allPromoCodes = res['data'];
    //                 this.pushDataLayer();
    //             }
    //             this._loaderService.setLoaderState(false);
    //         });
    //     }
    // }

    updateCustomPromoCodeInput(e, item)
    {
        e.preventDefault();
        e.stopPropagation();
        this.selectedPromocode = item.promoCode;
        this.nextPromocode.next(item.promoCode);
    }

    //analytics
    pushDataLayer()
    {
        setTimeout(() =>
        {
            const dlp = [];
            for (let p = 0; p < this._cartService.allPromoCodes.length; p++) {
                const promo = {
                    id: this._cartService.allPromoCodes[p]['promoId'],
                    name: this._cartService.allPromoCodes[p]['promoCode'],
                    'creative': 'banner1',
                    'position': 'slot1'
                };
                dlp.push(promo);
            }

            dataLayer.push({
                'event': 'promo- impressions',
                'ecommerce': {
                    'promoView': {
                        'promotions': dlp
                    }
                }
            });
        }, 3000);
    }

    ngOnDestroy(): void
    {
        this.appliedPromocodeSubscription.unsubscribe();
    }
}
