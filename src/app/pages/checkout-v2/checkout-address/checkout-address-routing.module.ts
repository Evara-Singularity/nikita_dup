import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CheckoutAddressComponent } from './checkout-address.component';

const routes: Routes = [
  {
    path: '',
    component: CheckoutAddressComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CheckoutAddressRoutingModule { }
