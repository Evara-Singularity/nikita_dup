import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { SharedCheckoutStepperModule } from '@app/modules/shared-checkout-stepper/shared-checkout-stepper.module';
import { IsAuthenticatedCheckoutLogin } from '@app/utils/guards/checkout-login.guard';
import { CheckoutV2RoutingModule } from './checkout-v2-routing.module';
import { CheckoutV2Component } from './checkout-v2.component';
@NgModule({
    declarations: [CheckoutV2Component],
    imports: [
        CommonModule,
        SharedCheckoutStepperModule,
        CheckoutV2RoutingModule,
    ],
    providers: [
        IsAuthenticatedCheckoutLogin
    ]
})
export class CheckoutV2Module { }
