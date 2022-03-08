import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { Subject } from 'rxjs';

import { PromoOfferService } from './promo-offer.service';
import { cartSession } from '../../../utils/models/cart.initial';
import { CommonService } from '@app/utils/services/common.service';

declare let dataLayer: any;

@Component({
    selector: 'app-promo-offer',
    templateUrl: './promo-offer.component.html',
    styleUrls: ['./promo-offer.component.scss']
})
export class PromoOfferComponent implements OnInit {
    allPromoCodes: Array<any> = [];
    selectedPromoCode;
    @Output('closePromoOfferPopup') closePromoOfferPopup = new EventEmitter();

    constructor(
        private _commonService: CommonService,
        private _loaderService: GlobalLoaderService,
        private _promoOfferService: PromoOfferService
    ){}

    ngOnInit() {
        this.getAllPromoCodesByUserId(this._commonService.userSession.userId);
    }

    getAllPromoCodesByUserId(userId) {
        this._loaderService.setLoaderState(true);
        if (this._commonService.userSession.authenticated === 'true') {
            this._promoOfferService.getAllPromoCodesByUserId(userId).subscribe(res => {
                if (res['statusCode'] === 200) {
                    this.allPromoCodes = res['data'];
                }
                this._loaderService.setLoaderState(false);
            });
        } else {
            // this.getAllPromoCodes();
        }
    }

    setPromoCode(item) {
        this.selectedPromoCode = item.promoCode;
        alert(this.selectedPromoCode);
    }

    handleApplyCustomPromoCode(promoCode) {
        alert(promoCode);
    }

    handleRemoveCustomPromoCode(promoCode) {
        alert(promoCode);
    }
}
