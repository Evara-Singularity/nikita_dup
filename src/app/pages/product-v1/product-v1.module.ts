import { CommonModule, DatePipe } from "@angular/common";
import { NgModule } from "@angular/core";
import AppInstallWidgetModule from "@app/components/appInstallWidget/appInstallWidget.component";
import FbtComponentModule from "@app/components/fbt/fbt.component";
import { FloatingCouponWidgetModule } from "@app/components/floating-coupon-widget/floating-coupon-widget.module";
import { MoglixInsightPdpModule } from "@app/components/moglix-insight-pdp/moglix-insight-pdp.component";
import { OosSimilarSectionModule } from "@app/components/oos-similar-section/oos-similar-section.module";
import { PastOrdersModule } from "@app/components/past-orders/past-orders.component";
import ProductAccordiansModule from "@app/components/product-accordians/product-accordians.component";
import { ProductBenefitsModule } from "@app/components/product-benefits/product-benefits.component";
import { ProductBulkQuantityModule } from "@app/components/product-bulk-quantity/product-bulk-quantity.component";
import ProductDescriptionModule from "@app/components/product-description/product-description.component";
import { ProductFeatureDetailsModule } from "@app/components/product-feature-details/product-feature-details.component";
import { ProductGetQuoteModule } from "@app/components/product-get-quote/product-get-quote.component";
import { ProductGroupingAttributesModule } from "@app/components/product-grouping-attributes/product-grouping-attributes.component";
import { ProductMoreWidgetModule } from "@app/components/product-more-widget/product-more-widget.component";
import { ProductOffersModule } from "@app/components/product-offers/product-offers.component";
import { ProductDealsModule } from "@app/components/product-popular-deals/product-popular-deals.component";
import { ProductQaModule } from "@app/components/product-qa/product-qa.component";
import { ProductReviewModule } from "@app/components/product-review/product-review.component";
import { ProductRfqThanksPopupModule } from "@app/components/product-rfq-thanks-popup/product-rfq-thanks-popup.component";
import { ProductSkeletonsModule } from "@app/components/product-skeletons/product-skeletons.component";
import { WhatsAppToastModule } from "@app/components/whatsapp-toast/whatsapp-toast.component";
import { BreadcrumbNavModule } from "@app/modules/breadcrumb-nav/breadcrumb-nav.module";
import { EmiPlansModule } from "@app/modules/emi-plans/emi-plans.module";
import { NotFoundModule } from "@app/modules/not-found/not-found.module";
import { ProductInfoModule } from "@app/modules/product-info/product-info.module";
import { ProductOosSimilarModule } from "@app/modules/product-oos-similar/product-oos-similar.module";
import { SharedProductCarouselModule } from "@app/modules/shared-product-carousel/shared-product-carousel.module";
import { FloatingButtonContainerModule } from "@app/modules/ui/floating-button-container/floating-button-container.module";
import { ObserveVisibilityDirectiveModule } from "@app/utils/directives/observe-visibility.directive";
import { ObjectToArrayPipeModule } from "@app/utils/pipes/object-to-array.pipe";
import { NgxSiemaService } from "ngx-siema";
import { ProductV1Component } from "./product-v1.component";
import { ProductV1RoutingModule } from "./product-v1.routing.module";


@NgModule({
    declarations: [ProductV1Component],
    imports: [
        CommonModule,
        ProductV1RoutingModule,
        ObserveVisibilityDirectiveModule,
        NotFoundModule,
        SharedProductCarouselModule,
        ProductDescriptionModule,
        ProductOffersModule,
        ProductSkeletonsModule,
        MoglixInsightPdpModule,
        ProductBenefitsModule,
        ProductFeatureDetailsModule,
        ProductReviewModule,
        FbtComponentModule,
        ProductQaModule,
        ProductGetQuoteModule,
        ProductMoreWidgetModule,
        ProductDealsModule,
        ProductAccordiansModule,
        BreadcrumbNavModule,
        PastOrdersModule,
        ProductRfqThanksPopupModule,
        WhatsAppToastModule,
        AppInstallWidgetModule,
        FloatingButtonContainerModule,
        ProductGroupingAttributesModule,
        ProductBulkQuantityModule,
        OosSimilarSectionModule,
        EmiPlansModule,
        ProductOosSimilarModule,
        ProductInfoModule,
        FloatingCouponWidgetModule,
    ],
    exports: [],
    providers: [NgxSiemaService, DatePipe]
})
export class ProductV1Module { }