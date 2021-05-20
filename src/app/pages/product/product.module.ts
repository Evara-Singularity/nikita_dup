import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductComponent } from './product.component';
import { ProductRoutingModule } from './product-routing.module';
import { BreadcrumbNavModule } from '../../modules/breadcrumb-nav/breadcrumb-nav.module';
import { SiemaCarouselModule } from '@modules/siemaCarousel/siemaCarousel.module';
import { ObjectToArrayPipeModule } from '../../utils/pipes/object-to-array.pipe';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { MathFloorPipeModule } from '../../utils/pipes/math-floor';
import { YTThumnailPipeModule } from '../../utils/pipes/ytthumbnail.pipe';
import { ArrayFilterPipeModule } from '../../utils/pipes/k-array-filter.pipe';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { NgxPageScrollCoreModule } from 'ngx-page-scroll-core';

@NgModule({
  declarations: [
    ProductComponent,
  ],
  imports: [
    ObserveVisibilityDirectiveModule,
    CommonModule,
    ProductRoutingModule,
    // Directives
    BreadcrumbNavModule,
    SiemaCarouselModule,
    ObjectToArrayPipeModule,
    MathFloorPipeModule,
    MathCeilPipeModule,
    ReactiveFormsModule,
    ArrayFilterPipeModule,
    YTThumnailPipeModule,
    ObserveVisibilityDirectiveModule,
    NgxPageScrollCoreModule
  ],
  exports: [],
  providers: [
  ]
})
export class ProductModule { }
