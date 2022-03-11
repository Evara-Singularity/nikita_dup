import { GlobalLoaderService } from '@app/utils/services/global-loader.service';
import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { PromoCodeService } from './../promo-code.service';
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
        public _promoCodeService: PromoCodeService
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

    setPromoCode(e, item) {
        e.preventDefault();
        e.stopPropagation();
        this._promoCodeService.appliedPromoCode = item.promoCode;
        this._promoCodeService.genericApplyPromoCode()
    }
}
