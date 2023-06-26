import { SharedProductCarouselModule } from './../../modules/shared-product-carousel/shared-product-carousel.module';
import { EmiPlansModule } from './../../modules/emi-plans/emi-plans.module';
import { CommonModule, DatePipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { WhatsAppToastModule } from '@app/components/whatsapp-toast/whatsapp-toast.component';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { NgxSiemaService } from 'ngx-siema';
import { BreadcrumbNavModule } from '../../modules/breadcrumb-nav/breadcrumb-nav.module';
import { ArrayFilterPipeModule } from '../../utils/pipes/k-array-filter.pipe';
import { ProductRoutingModule } from './product-routing.module';
import { ProductComponent } from './product.component';
import { PastOrdersModule } from '@app/components/past-orders/past-orders.component';
import { NotFoundModule } from "@app/modules/not-found/not-found.module";
import ProductDescriptionModule from '@app/components/product-description/product-description.component';
import {ProductFeatureDetailsModule} from '@app/components/product-feature-details/product-feature-details.component';
import { ProductRfqThanksPopupModule } from '@app/components/product-rfq-thanks-popup/product-rfq-thanks-popup.component';
import { ProductMoreWidgetModule } from '@app/components/product-more-widget/product-more-widget.component';
import { ProductBulkQuantityModule } from '@app/components/product-bulk-quantity/product-bulk-quantity.component';
import { ProductReviewModule } from '@app/components/product-review/product-review.component';
import { ProductQaModule } from '@app/components/product-qa/product-qa.component';
import { FloatingButtonContainerModule } from '@app/modules/ui/floating-button-container/floating-button-container.module';
import { ProductBenefitsModule } from '@app/components/product-benefits/product-benefits.component';
import { ProductGetQuoteModule } from '@app/components/product-get-quote/product-get-quote.component';
import { ProductGroupingAttributesModule } from '@app/components/product-grouping-attributes/product-grouping-attributes.component';
import { OosSimilarSectionModule } from '@app/components/oos-similar-section/oos-similar-section.module';
import { ProductSkeletonsModule } from '@app/components/product-skeletons/product-skeletons.component';
import ProductAccordiansModule from '@app/components/product-accordians/product-accordians.component';
import AppInstallWidgetModule from '@app/components/appInstallWidget/appInstallWidget.component';
import { MoglixInsightPdpModule } from '@app/components/moglix-insight-pdp/moglix-insight-pdp.component';
import { ProductOffersModule } from '@app/components/product-offers/product-offers.component';
import FbtComponentModule from '@app/components/fbt/fbt.component';
import { ProductDealsModule } from '@app/components/product-popular-deals/product-popular-deals.component';
import { ProductOosSimilarModule } from '@app/modules/product-oos-similar/product-oos-similar.module';
import { ProductInfoModule } from '@app/modules/product-info/product-info.module';
import { YTThumnailPipeModule } from '../../utils/pipes/ytthumbnail.pipe';
import { AdsensePromotedBrandsUnitModule } from '@app/modules/adsense/adsense-promoted-brands-unit.module';
import { AdsenseFeatureProductsUnitModule } from '@app/modules/adsense/adsense-feature-products-unit.module';
import { AdsenseLeaderboardBannerModule } from '@app/modules/adsense/adsense-leaderboard-banner.module';
import { AdsenseRectangleBannerModule } from '@app/modules/adsense/adsense-inline-rectangle-banner.module';
import { AdsenseService } from '@app/utils/services/adsense.service';


@NgModule({
  declarations: [ProductComponent],
  imports: [
    ObserveVisibilityDirectiveModule,
    CommonModule,
    // BottomMenuModule,
    ProductRoutingModule,
    ProductOosSimilarModule,
    BreadcrumbNavModule,
    // pipes
    // ObjectToArrayPipeModule,
    // MathFloorPipeModule,
    // MathCeilPipeModule,
    ReactiveFormsModule,
    // LazyLoadImageModule,
    ArrayFilterPipeModule,
    // YTThumnailPipeModule,
    WhatsAppToastModule,
    ProductInfoModule,
    EmiPlansModule,
    // SliceArrayPipeModule,
    // NumberDirectiveModule,
    // Directives
    //ProductCardHorizontalGridViewModule,
    // SwipeDirectiveModule,
    // IdleUserSearchNudgeModule,
    PastOrdersModule,
    NotFoundModule,
    ProductDescriptionModule,
    ProductRfqThanksPopupModule,
    ProductMoreWidgetModule,
    ProductBulkQuantityModule,
    ProductReviewModule,
    ProductQaModule,
    ProductFeatureDetailsModule,
    ProductMoreWidgetModule,
    FloatingButtonContainerModule,
    ProductBenefitsModule,
    ProductGetQuoteModule,
    ProductGroupingAttributesModule,
    OosSimilarSectionModule,
    SharedProductCarouselModule,
    ProductSkeletonsModule,
    ProductAccordiansModule,
    AppInstallWidgetModule,
    MoglixInsightPdpModule,
    ProductOffersModule,
    FbtComponentModule,
    ProductDealsModule,
    YTThumnailPipeModule,
    AdsensePromotedBrandsUnitModule,
    AdsenseFeatureProductsUnitModule,
    AdsenseLeaderboardBannerModule,
    AdsenseRectangleBannerModule
  ],
  exports: [],
  providers: [NgxSiemaService, DatePipe, AdsenseService]
})
export class ProductModule { }
