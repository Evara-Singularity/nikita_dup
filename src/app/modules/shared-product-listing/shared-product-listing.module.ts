import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedProductListingComponent } from './shared-product-listing.component';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { NgxPaginationModule } from 'ngx-pagination';
import { FilterMidPlpModule } from '@app/components/filter-mid-plp/filter-mid-plp.component';
import { AddFilterSymbolPipeModule } from '@app/utils/pipes/addSymbol.pipe';
import { NotFoundModule } from "@app/modules/not-found/not-found.module";
import { ProductCardHorizontalListViewModule } from '../product-card/product-card-horizontal-list-view/product-card-horizontal-list-view.module';
import { ProductCardSkeletonModule } from '../ui/skeletons/product-card-skeleton/product-card-skeleton.module';
import { AnalyticsWidgetWrapperModule } from '@app/components/analytics-widget-wrapper/analytics-widget-wrapper.module';
import { Informative_videoModule } from '@app/components/informative_video/informative_video.component';
import { BulkRquestFormPopupLazyModule } from '../bulk-rquest-form-popup-lazy/bulk-rquest-form-popup-lazy.module';
import { AdsenseLeaderboardBannerModule } from '../adsense/adsense-leaderboard-banner.module';
import { AdsenseRectangleBannerModule } from '../adsense/adsense-inline-rectangle-banner.module';
import { AdsenseMainBannerModule } from "../adsense/adsense-main-banner.module";

@NgModule({
    declarations: [SharedProductListingComponent],
    exports: [
        SharedProductListingComponent
    ],
    imports: [
        CommonModule,
        ProductCardHorizontalListViewModule,
        ProductCardSkeletonModule,
        FilterMidPlpModule,
        AddFilterSymbolPipeModule,
        NgxPaginationModule,
        ObserveVisibilityDirectiveModule,
        NotFoundModule,
        AnalyticsWidgetWrapperModule,
        Informative_videoModule,
        BulkRquestFormPopupLazyModule,
        AdsenseLeaderboardBannerModule,
        AdsenseRectangleBannerModule,
        AdsenseMainBannerModule
    ]
})

export class SharedProductListingModule { }
