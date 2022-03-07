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

    constructor(
        private _commonService: CommonService,
        private _promoOfferService: PromoOfferService
    ){}

    ngOnInit() {
        this._commonService.userSession
        console.clear();
        console.log(this._commonService.userSession);
        this.getAllPromoCodesByUserId();
    }

    getAllPromoCodesByUserId() {
        if (this._commonService.userSession.authenticated === 'true') {
            this._promoOfferService.getAllPromoCodesByUserId(this._commonService.userSession.userId).subscribe(res => {
                if (res['statusCode'] === 200) {
                    this.allPromoCodes = res['data'];
                    console.log(this.allPromoCodes);
                }
            });
        } else {
            // this.getAllPromoCodes();
        }
    }
}
