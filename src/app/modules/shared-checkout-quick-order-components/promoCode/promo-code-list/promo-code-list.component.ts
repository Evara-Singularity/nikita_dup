import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { CommonService } from '@app/utils/services/common.service';
import { CartService } from '@app/utils/services/cart.service';

declare let dataLayer: any;

@Component({
    selector: 'promo-code-list',
    templateUrl: './promo-code-list.component.html',
    styleUrls: ['./promo-code-list.component.scss']
})
export class PromoCodeListComponent implements OnInit {
    allPromoCodes: Array<any> = [];
    @Output('closePromoOfferPopup') closePromoOfferPopup = new EventEmitter();

    constructor(
        private _commonService: CommonService,
        private _loaderService: GlobalLoaderService,
        public _cartService: CartService
    ){}

    ngOnInit() {
        this.getAllPromoCodesByUserId(this._commonService.userSession.userId);
    }

    getAllPromoCodesByUserId(userId) {
        this._loaderService.setLoaderState(true);
        if (this._commonService.userSession.authenticated === 'true') {
            this._cartService.getAllPromoCodesByUserId(userId).subscribe(res => {
                if (res['statusCode'] === 200) {
                    this.allPromoCodes = res['data'];
                    this.pushDataLayer();
                }
                this._loaderService.setLoaderState(false);
            });
        }
    }

    updateCustomPromoCodeInput (e, item) {
        e.preventDefault();
        e.stopPropagation();
        if (item.promoCode === this._cartService.appliedPromoCode) return;
        this._cartService.appliedPromoCode = item.promoCode;
    }

    //analytics
    pushDataLayer()
    {
        setTimeout(() =>
        {
            const dlp = [];
            for (let p = 0; p < this.allPromoCodes.length; p++) {
                const promo = {
                    id: this.allPromoCodes[p]['promoId'],
                    name: this.allPromoCodes[p]['promoCode'],
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
}
