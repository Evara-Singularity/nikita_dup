import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { DeliveryAddressComponent } from './deliveryAddress.component';
import { DeliveryAddressService } from './deliveryAddress.service';
import { ContinueModule } from '../continue/continue.module';
import { InvoiceTypeModule } from '../invoiceType/invoiceType.module';
import { ShowActivePipeModule } from '../../utils/pipes/show-active.pipe';
import { ShippingAddressModule } from '../shippingAddress/shippingAddress.module';
import { BillingAddressModule } from '../billingAddress/billingAddress.module';
import { AddressListModule } from '../addressList/address-list.module';
import { ShippingBillingAddressModule } from '../shippingBillingAddress/shippingBillingAddress.module';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { ClickOutsideDirectiveModule } from '../../utils/directives/clickOutside.directive';
import { PopUpModule } from '../popUp/pop-up.module';
import { PopUpVariant2Module } from '../pop-up-variant2/pop-up-variant2.module';
import { LoaderModule } from '../loader/loader.module';


@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ShowActivePipeModule,
        ReactiveFormsModule,
        RouterModule,
        ShippingAddressModule,
        BillingAddressModule,
        AddressListModule,
        ShippingBillingAddressModule,
        ContinueModule,
        LoaderModule,
        MathCeilPipeModule,
        ClickOutsideDirectiveModule,
        InvoiceTypeModule,
        PopUpModule,
        PopUpVariant2Module
    ],
    exports: [DeliveryAddressComponent],
    declarations: [DeliveryAddressComponent],
    providers: [ DeliveryAddressService],
})
export class DeliveryAddressModule { }
