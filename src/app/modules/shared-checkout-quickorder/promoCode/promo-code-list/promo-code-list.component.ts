import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { LocalStorageService } from 'ngx-webstorage';
import { Subject } from 'rxjs';

import { PromoCodeService } from './../promo-code.service';
import { cartSession } from '@utils/models/cart.initial';
import { CommonService } from '@app/utils/services/common.service';

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
        private _promoCodeService: PromoCodeService
    ){}

    ngOnInit() {
        this.getAllPromoCodesByUserId(this._commonService.userSession.userId);
    }

    getAllPromoCodesByUserId(userId) {
        this._loaderService.setLoaderState(true);
        if (this._commonService.userSession.authenticated === 'true') {
            this._promoCodeService.getAllPromoCodesByUserId(userId).subscribe(res => {
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
        this._promoCodeService.appliedPromoCode = item.promoCode;
        console.trace('sss' + this._promoCodeService.appliedPromoCode);
        alert(this._promoCodeService.appliedPromoCode);
    }

    handleApplyCustomPromoCode(promoCode) {
        alert(promoCode);
    }

    handleRemoveCustomPromoCode(promoCode) {
        alert(promoCode);
    }
}
