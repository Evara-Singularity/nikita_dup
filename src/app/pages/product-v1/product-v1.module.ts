import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import FbtComponentModule from "@app/components/fbt/fbt.component";
import { MoglixInsightPdpModule } from "@app/components/moglix-insight-pdp/moglix-insight-pdp.component";
import { ProductBenefitsModule } from "@app/components/product-benefits/product-benefits.component";
import ProductDescriptionModule from "@app/components/product-description/product-description.component";
import { ProductFeatureDetailsModule } from "@app/components/product-feature-details/product-feature-details.component";
import { ProductOffersModule } from "@app/components/product-offers/product-offers.component";
import { ProductQaModule } from "@app/components/product-qa/product-qa.component";
import { ProductReviewModule } from "@app/components/product-review/product-review.component";
import { ProductSkeletonsModule } from "@app/components/product-skeletons/product-skeletons.component";
import { NotFoundModule } from "@app/modules/not-found/not-found.module";
import { SharedProductCarouselModule } from "@app/modules/shared-product-carousel/shared-product-carousel.module";
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
        ProductQaModule
    ],
    exports: [],
    providers: [NgxSiemaService]
})
export class ProductV1Module { }