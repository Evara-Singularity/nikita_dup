import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CartService } from '@app/utils/services/cart.service';
import { Subject } from 'rxjs';

@Component({
    selector: 'shared-checkout-unavailable-items',
    templateUrl: './shared-checkout-unavailable-items.component.html',
    styleUrls: ['./shared-checkout-unavailable-items.component.scss']
})
export class SharedCheckoutUnavailableItemsComponent implements OnInit
{
    @Output() closePopup$: EventEmitter<any> = new EventEmitter<any>();
    @Input() data: any;
    @Input() user: {};
    @Input() showLink = true;
    private cDistroyed = new Subject();
    itemsList: [] = [];

    constructor(public _cartService: CartService) { }

    ngOnInit() { this.itemsList = this.data['items']; }

    closeModal() { this.closePopup$.emit(); }

    removeUnavailableItems(callback)
    {
        this.closeModal();
        callback(this.itemsList);
    }

    ngOnDestroy()
    {
        this.cDistroyed.next();
        this.cDistroyed.unsubscribe();
    }
}
