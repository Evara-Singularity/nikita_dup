import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { CategoryRoutingModule } from "./category.routing";
import { CategoryComponent } from "./category.component";
import { SharedProductListingModule } from '@app/modules/shared-product-listing/shared-product-listing.module';
import { BreadcrumbNavModule } from '@app/modules/breadcrumb-nav/breadcrumb-nav.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { RecentArticlesModule } from '@app/components/recent-articles/recent-articles.component';
import { CategoryFooterModule } from '@app/components/category-footer/category-footer.component';
import { KpToggleDirectiveModule } from '@app/utils/directives/kp-toggle.directive';
import { WhatsAppToastModule } from '@app/components/whatsapp-toast/whatsapp-toast.component';
import { ProductListingAppPromoModule } from '@app/modules/product-listing-app-promo/product-listing-app-promo.module';
import { AccordianModule } from "@app/modules/accordian/accordian.module";
import { AppPromoModule } from '@app/modules/app-promo/app-promo.module';
import { CatStaticModule } from '@app/components/cat-static/cat-static.component';
import { SlpSubCategoryModule } from '@app/components/slp-sub-category/slp-sub-category.component';
import { ShopbyBrandModule } from '@app/components/shopby-brand/shopby-brand.component';
import { CategoryBestSellerModule } from '@app/components/cat-bestseller/cat-bestseller.component';
import { ShopbyFeatrModule } from '@app/components/shopby-featr/shopby-featr.component';
import { CmsModule } from '@app/modules/cms/cms.module';
import { SubCategoryModule } from '@app/components/subCategory/subCategory.component';
import RecentViewedProductsWrapperModule from '@app/components/recent-viewed-products-wrapper/recent-viewed-products-wrapper.component';
import { AdsenseService } from '@app/utils/services/adsense.service';
import { AdsenseMainBannerModule } from '@app/modules/adsense/adsense-main-banner.module';
import { AdsensePromotedBrandsUnitModule } from '@app/modules/adsense/adsense-promoted-brands-unit.module';
import { AdsenseRelatedVideosModule } from '@app/modules/adsense/adsense-related-videos.module';
import { AdsenseFeatureProductsUnitModule } from '@app/modules/adsense/adsense-feature-products-unit.module';

@NgModule({
    imports: [
        CommonModule,
        BreadcrumbNavModule,
        LazyLoadImageModule,
        CategoryFooterModule,
        RecentArticlesModule,
        WhatsAppToastModule,
        CategoryRoutingModule,
        KpToggleDirectiveModule,
        SharedProductListingModule,
        ProductListingAppPromoModule,
        AccordianModule,
        AppPromoModule,
        CatStaticModule,
        SlpSubCategoryModule,
        ShopbyBrandModule,
        CategoryBestSellerModule,
        ShopbyFeatrModule,
        CmsModule,
        SubCategoryModule,
        RecentViewedProductsWrapperModule,
        AdsenseMainBannerModule,
        AdsensePromotedBrandsUnitModule,
        AdsenseRelatedVideosModule,
        AdsenseFeatureProductsUnitModule
    ],
    declarations: [
        CategoryComponent,
    ],
    providers: [
        AdsenseService
    ]
})

export class CategoryModule { }