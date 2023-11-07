import { CommonModule, DatePipe } from "@angular/common";
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from "@angular/core";
import AppInstallWidgetModule from "@app/components/appInstallWidget/appInstallWidget.component";
import { FloatingCouponWidgetModule } from "@app/components/floating-coupon-widget/floating-coupon-widget.module";
import { MoglixInsightPdpModule } from "@app/components/moglix-insight-pdp/moglix-insight-pdp.component";
import { OosSimilarSectionModule } from "@app/components/oos-similar-section/oos-similar-section.module";
import ProductAccordiansModule from "@app/components/product-accordians/product-accordians.component";
import ProductDescriptionModule from "@app/components/product-description/product-description.component";
import { ProductFeatureDetailsModule } from "@app/components/product-feature-details/product-feature-details.component";
import { ProductGetQuoteModule } from "@app/components/product-get-quote/product-get-quote.component";
import { ProductGroupingAttributesModule } from "@app/components/product-grouping-attributes/product-grouping-attributes.component";
import { ProductMoreWidgetModule } from "@app/components/product-more-widget/product-more-widget.component";
import { ProductDealsModule } from "@app/components/product-popular-deals/product-popular-deals.component";
import { ProductQaModule } from "@app/components/product-qa/product-qa.component";
import { ProductReviewModule } from "@app/components/product-review/product-review.component";
import { ProductRfqThanksPopupModule } from "@app/components/product-rfq-thanks-popup/product-rfq-thanks-popup.component";
import { ProductSkeletonsModule } from "@app/components/product-skeletons/product-skeletons.component";
import { BreadcrumbNavModule } from "@app/modules/breadcrumb-nav/breadcrumb-nav.module";
import { EmiPlansModule } from "@app/modules/emi-plans/emi-plans.module";
import { NotFoundModule } from "@app/modules/not-found/not-found.module";
import { ProductOosSimilarModule } from "@app/modules/product-oos-similar/product-oos-similar.module";
import { SharedProductCarouselModule } from "@app/modules/shared-product-carousel/shared-product-carousel.module";
import { FloatingButtonContainerModule } from "@app/modules/ui/floating-button-container/floating-button-container.module";
import { ObserveVisibilityDirectiveModule } from "@app/utils/directives/observe-visibility.directive";
import { NgxSiemaService } from "ngx-siema";
import { ProductV1Component } from "./product-v1.component";
import { ProductV1RoutingModule } from "./product-v1.routing.module";
import { AdsenseService } from "@app/utils/services/adsense.service";
import { ProductInfoModule } from "@app/modules/product-info/product-info.module";


@NgModule({
    declarations: [ProductV1Component],
    imports: [
        CommonModule,
        ProductV1RoutingModule,
        ObserveVisibilityDirectiveModule,
        NotFoundModule,
        SharedProductCarouselModule,
        ProductDescriptionModule,
        ProductSkeletonsModule,
        MoglixInsightPdpModule,
        ProductFeatureDetailsModule,
        ProductReviewModule,
        ProductQaModule,
        ProductGetQuoteModule,
        ProductMoreWidgetModule,
        ProductDealsModule, // lazy load
        ProductAccordiansModule,
        BreadcrumbNavModule,
        ProductRfqThanksPopupModule, // lazy load
        AppInstallWidgetModule, // lazy load 
        FloatingButtonContainerModule,
        ProductGroupingAttributesModule,
        OosSimilarSectionModule,
        EmiPlansModule, // lazy load
        ProductOosSimilarModule,
        ProductInfoModule, // lazy load
        FloatingCouponWidgetModule,
    ],
    exports: [],
    providers: [NgxSiemaService, DatePipe,AdsenseService],
    schemas:[CUSTOM_ELEMENTS_SCHEMA]
})
export class ProductV1Module { }