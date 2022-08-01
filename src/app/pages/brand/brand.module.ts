import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CmsModule } from '@app/modules/cms/cms.module';
import { BrandComponent } from "./brand.component";
import { BrandRoutingModule } from './brand.routing';
import { SharedProductListingModule } from '@app/modules/shared-product-listing/shared-product-listing.module';
import { ReplacePipeModule } from '@app/utils/pipes/remove-html-from-string.pipe.';
import { BrandFooterModule } from '@app/components/brand-details-footer/brand-details-footer.component';
import { KpToggleDirectiveModule } from '@app/utils/directives/kp-toggle.directive';
import { ProductListingAppPromoModule } from '@app/modules/product-listing-app-promo/product-listing-app-promo.module';
import { AccordianModule } from "@app/modules/accordian/accordian.module";
import { AppPromoModule } from '@app/modules/app-promo/app-promo.module';

@NgModule({
    imports: [
        CmsModule,
        CommonModule,
        BrandFooterModule,
        ReplacePipeModule,
        BrandRoutingModule,
        KpToggleDirectiveModule,
        SharedProductListingModule,
        ProductListingAppPromoModule,
        AccordianModule,
        AppPromoModule
    ],
    declarations: [
        BrandComponent,
    ],
})

export class BrandModule {}