import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CheckoutAddressPipeModule } from '@app/utils/pipes/checkout-address.pipe';
import { AllAddressesComponent } from './all-addresses/all-addresses.component';
import { CartListComponent } from './cart-list/cart-list.component';
import { CouponsComponent } from './coupons/coupons.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { OffersComponent } from './offers/offers.component';
import { PaymentSummaryComponent } from './payment-summary/payment-summary.component';

@NgModule({
    declarations: [
        CartListComponent,
        PaymentSummaryComponent,
        CouponsComponent,
        OffersComponent,
        NotificationsComponent,
        AllAddressesComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        CheckoutAddressPipeModule,
    ],
    exports: [
        CartListComponent,
        PaymentSummaryComponent,
        CouponsComponent,
        OffersComponent,
        NotificationsComponent,
        AllAddressesComponent,
    ]
})
export class SharedCheckoutModule { }
