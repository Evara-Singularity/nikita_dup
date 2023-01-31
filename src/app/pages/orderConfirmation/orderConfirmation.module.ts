import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { routing } from './orderConfirmation';
import {OrderConfirmationComponent} from './orderConfirmation.component';
import {OrderConfirmationService} from './orderConfirmation.service';
import { SafeUrlPipeModule } from '@app/utils/pipes/safe-url.pipe';
import { AppPromoModule } from '@app/modules/app-promo/app-promo.module';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { AppBannerModule } from '../../components/app-banner/app-banner.module';

@NgModule({
    imports: [
        CommonModule,
        routing,
        SafeUrlPipeModule,
        AppPromoModule,
        ObserveVisibilityDirectiveModule,
        AppBannerModule
    ],
    declarations: [
        OrderConfirmationComponent,
    ],
    providers: [
        OrderConfirmationService
    ]
})

export class OrderConfirmationModule{}
