import { Component } from '@angular/core';
import { CheckoutHeaderModel } from '@app/utils/models/shared-checkout.models';

@Component({
  selector: 'app-checkout-payment',
  templateUrl: './checkout-payment.component.html',
  styleUrls: ['./checkout-payment.component.scss']
})
export class CheckoutPaymentComponent 
{

  readonly STEPPER: CheckoutHeaderModel[] = [{ label: "ADDRESS & SUMMARY", status: true }, { label: "PAYMENT", status: true }];
  constructor() { }
}
