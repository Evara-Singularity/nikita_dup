import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, NgForm } from '@angular/forms';
import { LocalStorageService } from 'ngx-webstorage';
import { PromoCodeService } from './../promo-code.service';
import { Subject } from 'rxjs';
import { ToastMessageService } from '@modules/toastMessage/toast-message.service';
import { CartService } from '@utils/services/cart.service';
import { mergeMap } from 'rxjs/operators';

declare let dataLayer: any;

@Component({
    selector: 'custom-promo-code',
    templateUrl: './custom-promo-code.component.html',
    styleUrls: ['./custom-promo-code.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class CustomPromoCodeComponent implements OnInit {
    @Input('appliedPromoCode') appliedPromoCode;
    constructor(
        public _promoCodeService: PromoCodeService
    ) {
    }

    ngOnInit(): void {
    }

    emitCustomPromoCode() {
        this._promoCodeService.genericApplyPromoCode();
    }

    removeAppliedCustomPromoCode() {
        this._promoCodeService.appliedPromoCode = '';
        alert('removePromocode')
    }
}
