import { Subscription, Subject } from 'rxjs';
import { CartService } from '@app/utils/services/cart.service';
import { Component, Input } from '@angular/core';
@Component({
    selector: 'custom-promo-code',
    templateUrl: './custom-promo-code.component.html',
    styleUrls: ['./custom-promo-code.component.scss'],
})
export class CustomPromoCodeComponent
{
    appliedPromocode: string = "";
    @Input("nextPromocode") nextPromocode: Subject<string> = null;
    nextPromocodeSubscription: Subscription = null;
    appliedPromocodeSubscription: Subscription = null;

    constructor(public _cartService: CartService) { }

    ngOnInit(): void
    {
        if (this._cartService.appliedPromoCode) { this.appliedPromocode = this._cartService.appliedPromoCode; }
        this.appliedPromocodeSubscription = this._cartService.promoCodeSubject.subscribe(
            ({ promocode, isNewPromocode }) => { this.appliedPromocode = promocode; }
        );
        if (this.nextPromocode) { this.nextPromocodeSubscription = this.nextPromocode.subscribe((promocode: string) => { this.appliedPromocode = promocode; }) }
    }

    submitPromocode()
    {
        if (!this.appliedPromocode || this.appliedPromocode.length < 3) { return }
        this._cartService.genericApplyPromoCode(this.appliedPromocode);
    }

    get isPromcodeValid()
    {
        return this._cartService.appliedPromoCode && (this.appliedPromocode === this._cartService.appliedPromoCode)
    }

    get canApplyCode()
    {
        return this.appliedPromocode ? true : false;
    }

    ngOnDestroy(): void
    {
        this.appliedPromocodeSubscription.unsubscribe();
        if (this.nextPromocodeSubscription) { this.nextPromocodeSubscription.unsubscribe(); }
    }
}
