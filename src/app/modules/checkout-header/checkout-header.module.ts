import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutHeaderComponent } from './checkout-header.component';



@NgModule({
  declarations: [CheckoutHeaderComponent],
  imports: [
    CommonModule
  ],
  exports: [
    CheckoutHeaderComponent
  ]
})
export class CheckoutHeaderModule { }
