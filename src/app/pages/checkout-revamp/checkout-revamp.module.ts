import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutRevampComponent } from './checkout-revamp.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedCheckoutAddressModule } from '@app/modules/shared-checkout-address/shared-checkout-address.module';

const routes: Routes = [
    {
        path: '',
        component: CheckoutRevampComponent
    }
];


@NgModule({
  declarations: [CheckoutRevampComponent],
  imports: [
    CommonModule,
    RouterModule,
    RouterModule.forChild(routes),
    SharedCheckoutAddressModule
  ]
})
export class CheckoutRevampModule { }
