import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { AddressListComponent } from './address-list/address-list.component';
import { AllAddressesComponent } from './all-addresses/all-addresses.component';
import { CartListComponent } from './cart-list/cart-list.component';
import { CouponsComponent } from './coupons/coupons.component';
import { NotificationsComponent } from './notifications/notifications.component';
import { OffersComponent } from './offers/offers.component';
import { PaymentSummaryComponent } from './payment-summary/payment-summary.component';
import { CreateEditDeliveryAddressComponent } from './create-edit-delivery-address/create-edit-delivery-address.component';
import { CreateEditBillingAddressComponent } from './create-edit-billing-address/create-edit-billing-address.component';

@NgModule({
    declarations: [
        CartListComponent,
        PaymentSummaryComponent,
        CouponsComponent,
        OffersComponent,
        NotificationsComponent,
        AddressListComponent,
        AllAddressesComponent,
        CreateEditDeliveryAddressComponent,
        CreateEditBillingAddressComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule
    ],
    exports: [
        CartListComponent,
        PaymentSummaryComponent,
        CouponsComponent,
        OffersComponent,
        NotificationsComponent,
        AddressListComponent,
        AllAddressesComponent,
    ]
})
export class SharedCheckoutModule { }
