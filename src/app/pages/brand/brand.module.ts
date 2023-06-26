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
import { MathCeilPipeModule } from '@pipes/math-ceil';
import RecentViewedProductsWrapperModule from '@app/components/recent-viewed-products-wrapper/recent-viewed-products-wrapper.component';
import { AdsenseService } from '@app/utils/services/adsense.service';
import { AdsenseMainBannerModule } from '@app/modules/adsense/adsense-main-banner.module';
import { AdsensePromotedBrandsUnitModule } from '@app/modules/adsense/adsense-promoted-brands-unit.module';
import { AdsenseRelatedVideosModule } from '@app/modules/adsense/adsense-related-videos.module';


@NgModule({
    declarations: [
        BrandComponent,
    ],
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
        AppPromoModule,
        MathCeilPipeModule,
        RecentViewedProductsWrapperModule,
        AdsenseMainBannerModule,
        AdsensePromotedBrandsUnitModule,
        AdsenseRelatedVideosModule,
    ],
    providers: [AdsenseService]
})

export class BrandModule { }