import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { IsAuthenticatedCheckoutLogin } from '@app/utils/guards/checkout-login.guard';
import { CheckoutV2Component } from './checkout-v2.component';

const routes: Routes = [
  {
    path: '',
    component: CheckoutV2Component,
    children: [
      {
        path: 'login',
        loadChildren: () => import('./checkout-login/checkout-login.module').then((m) => m.CheckoutLoginModule),
        data: {
          hideHeader: true,
        },
      },
      {
        path: 'otp',
        loadChildren: () => import('./checkout-login/checkout-login.module').then((m) => m.CheckoutLoginModule),
        data: {
          hideHeader: true,
        },
      },
      {
        path: 'forgot-password',
        loadChildren: () => import('./checkout-login/checkout-login.module').then((m) => m.CheckoutLoginModule),
        data: {
          hideHeader: true,
        },
      },
      {
        path: 'sign-up',
        loadChildren: () => import('./checkout-login/checkout-login.module').then((m) => m.CheckoutLoginModule),
        data: {
          hideHeader: true,
        },
      },
      {
        path: 'address',
        loadChildren: () => import('./checkout-address/checkout-address.module').then((m) => m.CheckoutAddressModule),
        canActivate: [IsAuthenticatedCheckoutLogin]
      },
      {
        path: 'payment',
        loadChildren: () => import('./checkout-login/checkout-login.module').then((m) => m.CheckoutLoginModule),
        canActivate: [IsAuthenticatedCheckoutLogin]
      },
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CheckoutV2RoutingModule { }
