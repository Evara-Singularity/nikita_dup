import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { CartService } from '@app/utils/services/cart.service';
import { Subject, Subscription, timer } from 'rxjs';
@Component({
    selector: 'promo-code-list',
    templateUrl: './promo-code-list.component.html',
    styleUrls: ['./promo-code-list.component.scss']
})
export class PromoCodeListComponent implements OnInit, OnDestroy {

    public nextPromocode: Subject<string> = new Subject<string>();
    @Output('closePromoOfferPopup') closePromoOfferPopup = new EventEmitter();
    appliedPromocodeSubscription: Subscription = null;
    selectedPromocode = null;

    constructor(public _cartService: CartService) { }

    ngOnInit()
    {
        if (this._cartService.appliedPromoCode) {
            this.selectedPromocode = this._cartService.appliedPromoCode;
        }
        this.appliedPromocodeSubscription = this._cartService.appliedPromocodeSubject.subscribe((promocode: string) =>
        {
            if (promocode) 
            { 
                this.closePromoOfferPopup.emit(false);
            }
        })
    }

    updateCustomPromoCodeInput(e, item)
    {
        e.preventDefault();
        e.stopPropagation();
        this.selectedPromocode = item.promoCode;
        this.nextPromocode.next(item.promoCode);
    }

    ngOnDestroy(): void
    {
        this.appliedPromocodeSubscription.unsubscribe();
    }
}
