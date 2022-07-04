import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import CONSTANTS from '@app/config/constants';
import { CartService } from '@app/utils/services/cart.service';
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
    appliedPromocodeSubscription: Subscription = null;
    selectedPromocode = null;
    readonly assetImgPath: string = CONSTANTS.IMAGE_ASSET_URL;

    constructor(public _cartService: CartService) { }

    ngOnInit()
    {
        this.selectedPromocode = this._cartService.appliedPromoCode;
        this.appliedPromocodeSubscription = this._cartService.appliedPromocodeSubject.subscribe((promocode: string) =>
        {
            this.selectedPromocode = promocode;
            if (promocode) {
                this.closePromoOfferPopup.emit(false);
            }
        })
    }

    closePromoListPopup(flag) { this.closePromoOfferPopup.emit(false); }

    submitPromocode(promocode)
    {
        if (this.selectedPromocode === promocode) { return }
        this._cartService.genericApplyPromoCode(promocode);
    }

    // updateCustomPromoCodeInput(e, item)
    // {
    //     e.preventDefault();
    //     e.stopPropagation();
    //     this.selectedPromocode = item.promoCode;
    //     this.nextPromocode.next(item.promoCode);
    // }

    ngOnDestroy(): void
    {
        this.appliedPromocodeSubscription.unsubscribe();
    }
}
