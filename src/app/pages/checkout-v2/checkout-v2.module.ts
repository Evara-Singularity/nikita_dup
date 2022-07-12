import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IsNotAuthenticatedCheckoutLogin } from '@app/utils/guards/checkout-auth.guard';
import { IsCartWithItemsGuard } from '@app/utils/guards/checkout-items.guard';
import { IsAuthenticatedCheckoutLogin } from '@app/utils/guards/checkout-login.guard';
import { CheckoutV2RoutingModule } from './checkout-v2-routing.module';
import { CheckoutV2Component } from './checkout-v2.component';
@NgModule({
    declarations: [CheckoutV2Component],
    imports: [
        CommonModule,
        CheckoutV2RoutingModule,
    ],
    providers: [
        IsAuthenticatedCheckoutLogin,
        IsNotAuthenticatedCheckoutLogin,
        IsCartWithItemsGuard
    ]
})
export class CheckoutV2Module { }
