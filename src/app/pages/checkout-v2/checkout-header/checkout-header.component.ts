import { Component, Input, OnInit } from '@angular/core';
import { CheckoutHeaderModel } from '@app/utils/models/shared-checkout.models';

@Component({
    selector: 'checkout-header',
    templateUrl: './checkout-header.component.html',
    styleUrls: ['./checkout-header.component.scss']
})
export class CheckoutHeaderComponent implements OnInit
{
    @Input("headers") headers: CheckoutHeaderModel[] = [];
    constructor() { }
    ngOnInit() { }
    get displayHeaders() { return this.headers.length > 0 }
    get width() { return (100 / this.headers.length); }
}