import { Component, EventEmitter, Input, OnDestroy, OnInit, Output } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { CartService } from '@app/utils/services/cart.service';
import { CommonService } from '@app/utils/services/common.service';
import { Subject, Subscription, timer } from 'rxjs';
@Component({
    selector: 'promo-code-list',
    templateUrl: './promo-code-list.component.html',
    styleUrls: ['./promo-code-list.component.scss']
})
export class PromoCodeListComponent implements OnInit, OnDestroy
{

    public nextPromocode: Subject<string> = new Subject<string>();
    @Output('closePromoOfferPopup') closePromoOfferPopup = new EventEmitter();
    @Input("isQuickCheckoutPopup") isQuickCheckoutPopup :boolean = false;
    appliedPromocodeSubscription: Subscription = null;
    selectedPromocode = null;
    readonly assetImgPath: string = CONSTANTS.IMAGE_ASSET_URL;

    constructor(public _cartService: CartService, private _commonService: CommonService) { }

    ngOnInit()
    {
        this.selectedPromocode = this._cartService.appliedPromoCode;
        this.appliedPromocodeSubscription = this._cartService.promoCodeSubject.subscribe(({ promocode, isNewPromocode }) =>
        {
            this.selectedPromocode = promocode;
            if (promocode) {
                this.closePromoOfferPopup.emit(false);
            }
        })
    }

    closePromoListPopup(flag) { this.closePromoOfferPopup.emit(false); }

    submitPromocode(e, promocode) {
        if (this.selectedPromocode === promocode) { return }
        this._cartService.genericApplyPromoCode(promocode);
        this.isQuickCheckoutPopup ? this._commonService.setBodyScroll(e, false) : this._commonService.setBodyScroll(e, true);
        document.querySelector('app-pop-up').classList.remove('open');
    }

    ngOnDestroy(): void
    {
        this.appliedPromocodeSubscription.unsubscribe();
    }
}
