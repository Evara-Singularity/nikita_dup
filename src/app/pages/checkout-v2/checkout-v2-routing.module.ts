import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CheckoutV2Component } from './checkout-v2.component';

const routes: Routes = [
  {
    path: '',
    component: CheckoutV2Component,
    children: [
      {
        path: 'login',
        loadChildren: () => import('./checkout-login/checkout-login.module').then((m) => m.CheckoutLoginModule),
      },
      {
        path: 'address',
        loadChildren: () => import('./checkout-address/checkout-address.module').then((m) => m.CheckoutAddressModule),
      },
      {
        path: 'payment',
        loadChildren: () => import('./checkout-login/checkout-login.module').then((m) => m.CheckoutLoginModule),
      },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CheckoutV2RoutingModule { }
