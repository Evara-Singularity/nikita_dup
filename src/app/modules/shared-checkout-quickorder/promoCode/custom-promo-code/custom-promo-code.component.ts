import { Component } from '@angular/core';
import { PromoCodeService } from './../promo-code.service';

declare let dataLayer: any;

@Component({
    selector: 'custom-promo-code',
    templateUrl: './custom-promo-code.component.html',
    styleUrls: ['./custom-promo-code.component.scss'],
})
export class CustomPromoCodeComponent {
    constructor(
        public _promoCodeService: PromoCodeService
    ) {}
}
