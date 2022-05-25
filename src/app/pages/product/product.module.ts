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
import { BottomMenuModule } from '@app/modules/bottomMenu/bottom-menu.module';
import { SliceArrayPipeModule } from '@app/utils/pipes/slice-array.pipe';
import { ProductOosSimilarModule } from '@app/modules/product-oos-similar/product-oos-similar.module';
import { NumberDirectiveModule } from '@app/utils/directives/numeric-only.directive';
import { PastOrdersModule } from '@app/components/past-orders/past-orders.component';
import { NotFoundModule } from "@app/modules/not-found/not-found.module";
import { ProductCardSkeletonModule } from '@app/modules/product-card/product-card-skeleton/product-card-skeleton.module';
import { ProductCardHorizontalGridViewModule } from '@app/modules/product-card/product-card-horizontal-grid-view/product-card-horizontal-grid-view.module';
@NgModule({
  declarations: [ProductComponent],
  imports: [
    ObserveVisibilityDirectiveModule,
    CommonModule,
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
    BottomMenuModule,
    NotFoundModule
  ],
  exports: [],
  providers: [NgxSiemaService],
})
export class ProductModule { }
