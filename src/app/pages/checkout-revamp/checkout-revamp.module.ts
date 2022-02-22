import { SharedCheckoutModule } from './../../modules/shared-checkout-v1/shared-checkout.module';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CheckoutRevampComponent } from './checkout-revamp.component';
import { RouterModule, Routes } from '@angular/router';

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
    SharedCheckoutModule
  ]
})
export class CheckoutRevampModule { }
