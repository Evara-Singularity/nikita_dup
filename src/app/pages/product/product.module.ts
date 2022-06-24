import { EmiPlansModule } from './../../modules/emi-plans/emi-plans.module';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { WhatsAppToastModule } from '@app/components/whatsapp-toast/whatsapp-toast.component';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { SwipeDirectiveModule } from '@app/utils/directives/swipe.directive';
import { NgxSiemaService } from 'ngx-siema';
import { BreadcrumbNavModule } from '../../modules/breadcrumb-nav/breadcrumb-nav.module';
import { ArrayFilterPipeModule } from '../../utils/pipes/k-array-filter.pipe';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { MathFloorPipeModule } from '../../utils/pipes/math-floor';
import { ObjectToArrayPipeModule } from '../../utils/pipes/object-to-array.pipe';
import { YTThumnailPipeModule } from '../../utils/pipes/ytthumbnail.pipe';
import { ProductInfoModule } from './../../modules/product-info/product-info.module';
import { ProductRoutingModule } from './product-routing.module';
import { ProductComponent } from './product.component';
import { SliceArrayPipeModule } from '@app/utils/pipes/slice-array.pipe';
import { ProductOosSimilarModule } from '@app/modules/product-oos-similar/product-oos-similar.module';
import { NumberDirectiveModule } from '@app/utils/directives/numeric-only.directive';
import { PastOrdersModule } from '@app/components/past-orders/past-orders.component';
import { NotFoundModule } from "@app/modules/not-found/not-found.module";
import ProductAccordiansModule from '@app/components/product-accordians/product-accordians.component';
import { ProductCardSkeletonModule } from '@app/modules/product-card/product-card-skeleton/product-card-skeleton.module';
import { ProductCardHorizontalGridViewModule } from '@app/modules/product-card/product-card-horizontal-grid-view/product-card-horizontal-grid-view.module';
import ProductDescriptionModule from '@app/components/product-description/product-description.component';
import {ProductFeatureDetailsModule} from '@app/components/product-feature-details/product-feature-details.component';
import { ProductRfqThanksPopupModule } from '@app/components/product-rfq-thanks-popup/product-rfq-thanks-popup.component';
import { ProductMoreWidgetModule } from '@app/components/product-more-widget/product-more-widget.component';
import { ProductBulkQuantityModule } from '@app/components/product-bulk-quantity/product-bulk-quantity.component';
import { ProductReviewModule } from '@app/components/product-review/product-review.component';
import { ProductQaModule } from '@app/components/product-qa/product-qa.component';
import { FloatingButtonContainerModule } from '@app/modules/ui/floating-button-container/floating-button-container.module';
import { ProductBenefitsModule } from '@app/components/product-benefits/product-benefits.component';
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';
import { ProductGetQuoteModule } from '@app/components/product-get-quote/product-get-quote.component';
import { ProductRfqUpdatePopupModule } from '@app/components/product-rfq-update-popup/product-rfq-update-popup.component';
import { ProductGroupingAttributesComponent, ProductGroupingAttributesModule } from '@app/components/product-grouping-attributes/product-grouping-attributes.component';
@NgModule({
  declarations: [ProductComponent],
  imports: [
    ObserveVisibilityDirectiveModule,
    CommonModule,
    BottomMenuModule,
    ProductRoutingModule,
    ProductOosSimilarModule,
    BreadcrumbNavModule,
    // pipes
    ObjectToArrayPipeModule,
    MathFloorPipeModule,
    MathCeilPipeModule,
    ReactiveFormsModule,
    // LazyLoadImageModule,
    ArrayFilterPipeModule,
    YTThumnailPipeModule,
    WhatsAppToastModule,
    ProductInfoModule,
    EmiPlansModule,
    SliceArrayPipeModule,
    NumberDirectiveModule,
    // Directives
    ProductCardHorizontalGridViewModule,
    ProductCardSkeletonModule,
    SwipeDirectiveModule,
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
    ProductRfqUpdatePopupModule,
    ProductGroupingAttributesModule
  ],
  exports: [],
  providers: [NgxSiemaService],
})
export class ProductModule { }
