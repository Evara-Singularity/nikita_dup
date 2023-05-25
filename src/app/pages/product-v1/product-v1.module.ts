import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import ProductDescriptionModule from "@app/components/product-description/product-description.component";
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
        ProductDescriptionModule
    ],
    exports: [],
    providers: [NgxSiemaService]
})
export class ProductV1Module { }