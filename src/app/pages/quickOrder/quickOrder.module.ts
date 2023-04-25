import { CartNoItemModule } from '../../modules/shared-checkout-quick-order-components/cart-no-item/cart-no-item.module';
import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { routing } from "./quickOrder.routing";
import { QuickOrderComponent } from "./quickOrder.component";
import { ObjectToArrayPipeModule } from '@utils/pipes/object-to-array.pipe';
import { MathFloorPipeModule } from '@utils/pipes/math-floor';

// Newly created Modules
import { CartNotificationsModule } from '@app/modules/shared-checkout-quick-order-components/cart-notifications/cart-notifications.module';
import { OrderSummaryModule } from '@app/modules/shared-checkout-quick-order-components/orderSummary/orderSummary.module';
import { SharedCheckoutUnavailableItemsModule } from '@app/modules/shared-checkout-unavailable-items/shared-checkout-unavailable-items.module';
import { CartModule } from '@app/modules/shared-checkout-quick-order-components/cart/cart.module';
import { GenericOffersModule } from '@app/modules/ui/generic-offers/generic-offers.component';
import { PrepaidOfferModule } from '@app/modules/prepaid-offer/prepaid-offer.component';
import { YTThumnailPipeModule } from '@app/utils/pipes/ytthumbnail.pipe';
import { SharedCheckoutAddressModule } from '@app/modules/shared-checkout-address/shared-checkout-address.module';
import { PromoCodeModule } from "../../modules/shared-checkout-quick-order-components/promoCode/promoCode.module";
import { AllPromocodeV1Module } from '@app/modules/shared-checkout-quick-order-components/all-promocode-v1/all-promocode-v1.module';
import { HomePageSkeletonsModule } from "../../components/home-page-skeletons/home-page-skeletons.component";
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { MathRoundPipeModule } from "../../utils/pipes/math-round";

@NgModule({
    declarations: [
        QuickOrderComponent,
    ],
    imports: [
        routing,
        CommonModule,
        // Usable UI modules
        CartModule,
        CartNoItemModule,
        GenericOffersModule,
        CartNotificationsModule,
        OrderSummaryModule,
        // Custom utils modules added
        ObjectToArrayPipeModule,
        MathFloorPipeModule,
        SharedCheckoutUnavailableItemsModule,
        PrepaidOfferModule,
        YTThumnailPipeModule,
        SharedCheckoutAddressModule,
        PromoCodeModule,
        AllPromocodeV1Module,
        HomePageSkeletonsModule,
        ObserveVisibilityDirectiveModule,
        MathRoundPipeModule
    ]
})

export class QuickOrderModule { }