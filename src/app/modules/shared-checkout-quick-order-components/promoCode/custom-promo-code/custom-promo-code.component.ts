import { Subscription, Subject } from 'rxjs';
import { CartService } from '@app/utils/services/cart.service';
import { Component, OnInit, OnDestroy, Input } from '@angular/core';
@Component({
    selector: 'custom-promo-code',
    templateUrl: './custom-promo-code.component.html',
    styleUrls: ['./custom-promo-code.component.scss'],
})
export class CustomPromoCodeComponent implements OnInit, OnDestroy
{
    appliedPromocode: string = "";
    @Input("nextPromocode") nextPromocode: Subject<string> = null;
    nextPromocodeSubscription: Subscription = null;
    appliedPromocodeSubscription: Subscription = null;

    constructor(public _cartService: CartService) { }

    ngOnInit(): void
    {
        if (this._cartService.appliedPromoCode) { this.appliedPromocode = this._cartService.appliedPromoCode; }
        this.appliedPromocodeSubscription = this._cartService.appliedPromocodeSubject.subscribe((promocode: string) => { this.appliedPromocode = promocode; })
        if (this.nextPromocode) { this.nextPromocode.subscribe((promocode: string) => { this.appliedPromocode = promocode; }) }
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

    ngOnDestroy(): void
    {
        this.appliedPromocodeSubscription.unsubscribe();
        if (this.nextPromocodeSubscription) { this.nextPromocodeSubscription.unsubscribe();}
    }

}
