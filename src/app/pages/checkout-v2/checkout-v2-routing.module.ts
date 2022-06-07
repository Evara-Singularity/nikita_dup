import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { IsNotAuthenticatedCheckoutLogin } from '@app/utils/guards/checkout-auth.guard';
import { IsAuthenticatedCheckoutLogin } from '@app/utils/guards/checkout-login.guard';
import { CheckoutV2Component } from './checkout-v2.component';

const routes: Routes = [
  {
    path: '',
    component: CheckoutV2Component,
    children: [
      { path: '', redirectTo: '/checkout/address', pathMatch: 'full' },
      {
        path: 'login',
        loadChildren: () => import('./checkout-login/checkout-login.module').then((m) => m.CheckoutLoginModule),
        canActivate: [IsNotAuthenticatedCheckoutLogin],
        data: {
          hideHeader: true,
        },
      },
      {
        path: 'otp',
        loadChildren: () => import('./checkout-login/checkout-login.module').then((m) => m.CheckoutLoginModule),
        canActivate: [IsNotAuthenticatedCheckoutLogin],
        data: {
          hideHeader: true,
        },
      },
      {
        path: 'forgot-password',
        loadChildren: () => import('./checkout-login/checkout-login.module').then((m) => m.CheckoutLoginModule),
        canActivate: [IsNotAuthenticatedCheckoutLogin],
        data: {
          hideHeader: true,
        },
      },
      {
        path: 'sign-up',
        loadChildren: () => import('./checkout-login/checkout-login.module').then((m) => m.CheckoutLoginModule),
        canActivate: [IsNotAuthenticatedCheckoutLogin],
        data: {
          hideHeader: true,
        },
      },
      {
        path: 'address',
        loadChildren: () => import('./checkout-address/checkout-address.module').then((m) => m.CheckoutAddressModule),
        canActivate: [IsAuthenticatedCheckoutLogin],
        data: {
					footer: false,
					title: 'Checkout',
          moduleName: CONSTANTS.MODULE_NAME.CART
				},
      },
      {
        path: 'payment',
        loadChildren: () => import('./checkout-payment/checkout-payment.module').then((m) => m.CheckoutPaymentModule),
        canActivate: [IsAuthenticatedCheckoutLogin],
        data: {
					footer: false,
					title: 'Payment',
          moduleName: CONSTANTS.MODULE_NAME.CART
				},
      },
      
    ]
  }
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CheckoutV2RoutingModule { }
