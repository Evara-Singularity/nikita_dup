import { Component, Input, OnInit } from '@angular/core';
import { CheckoutHeaderModel } from '@app/utils/models/shared-checkout.models';

@Component({
  selector: 'shared-checkout-stepper',
  templateUrl: './shared-checkout-stepper.component.html',
  styleUrls: ['./shared-checkout-stepper.component.scss']
})
export class SharedCheckoutStepperComponent implements OnInit {

    @Input("headers") headers: CheckoutHeaderModel[] = [];
    constructor() { }
    ngOnInit() { }
    get displayHeaders() { return this.headers.length > 0 }
    get width() { return (100 / this.headers.length); }
}
