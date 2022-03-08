import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnInit, EventEmitter, Output, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl, NgForm } from '@angular/forms';
import { LocalStorageService } from 'ngx-webstorage';
import { PromoApplyService } from './promo-apply.service';
import { Subject } from 'rxjs';
import { ToastMessageService } from '../../toastMessage/toast-message.service';
import { CartService } from '../../../utils/services/cart.service';
import { mergeMap } from 'rxjs/operators';

declare let dataLayer: any;

@Component({
    selector: 'app-promo-apply',
    templateUrl: './promo-apply.component.html',
    styleUrls: ['./promo-apply.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush
})
export class PromoApplyComponent implements OnInit {
    customPromoCode  = '';
    @Output('applyCustomPromoCode') applyCustomPromoCode = new EventEmitter();
    @Output('removeCustomPromoCode') removeCustomPromoCode = new EventEmitter();

    constructor() {
    }

    ngOnInit(): void {
    }

    emitCustomPromoCode() {
        if (this.customPromoCode.trim() !== '') {
            this.applyCustomPromoCode.emit(this.customPromoCode.trim());
        }
    }

    removeAppliedCustomPromoCode() {
        this.customPromoCode = '';
        this.removeCustomPromoCode.emit(this.customPromoCode.trim());
    }
}
