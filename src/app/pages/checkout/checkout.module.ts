import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { routing } from "./checkout.routing";
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SocialLoginModule } from '../../modules/socialLogin/socialLogin.module';
import { CartModule } from '../../modules/cart/cart.module';
import { OrderSummaryModule } from '../../modules/orderSummary/orderSummary.module';
import { PaymentModule } from '../../modules/payments/payment.module';
import { DeliveryAddressModule } from '../../modules/deliveryAddress/deliveryAddress.module';
import { ContinueModule } from '../../modules/continue/continue.module';
import { LoginModule } from '../login/login.module';
import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';
import { RouterModule } from '@angular/router';
import { LoaderModule } from '../../modules/loader/loader.module';
import { InvoiceTypeModule } from '../../modules/invoiceType/invoiceType.module';
import { CartUpdatesModule } from '../../modules/cartUpdates/cartUpdates.module';
import { UnAvailableItemsModule } from '../../modules/unAvailableItems/unAvailableItems.module';
import { SharedAuthModule } from '../../modules/shared-auth/shared-auth.module';
import { CheckoutComponent } from './checkout.component';
import { Angular2SocialLoginModule } from 'angular2-social-login';
import CONSTANTS from '../../config/constants';
import { CheckoutHeaderModule } from '../../modules/checkout-header/checkout-header.module';
import { CheckoutLoginModule } from '../../modules/checkout-login/checkout-login.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        SocialLoginModule,
        CartModule,
        OrderSummaryModule,
        PaymentModule,
        routing,
        DeliveryAddressModule,
        ContinueModule,
        LoginModule,
        NgxPageScrollCoreModule,
        RouterModule,
        LoaderModule,
        InvoiceTypeModule,
        CartUpdatesModule,
        UnAvailableItemsModule,
        SharedAuthModule,
        CheckoutHeaderModule,
        CheckoutLoginModule
    ],
    declarations: [
        CheckoutComponent,
    ],
    providers: [
    ]
})
export class CheckoutModule { }

// if (typeof window != 'undefined') {
//     Angular2SocialLoginModule.loadProvidersScripts(CONSTANTS.SOCIAL_LOGIN);
// }
