import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductComponent } from './product.component';
import { ProductRoutingModule } from './product-routing.module';
import { BreadcrumbNavModule } from '../../modules/breadcrumb-nav/breadcrumb-nav.module';
import { SiemaCarouselModule } from '@modules/siemaCarousel/siemaCarousel.module';
import { ObjectToArrayPipeModule } from '@utils/pipes/object-to-array.pipe';
import { MathCeilPipeModule } from '@utils/pipes/math-ceil';
import { MathFloorPipeModule } from '@utils/pipes/math-floor';
import { YTThumnailPipeModule } from '@utils/pipes/ytthumbnail.pipe';
import { ArrayFilterPipeModule } from '@utils/pipes/k-array-filter.pipe';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { WhatsAppToastModule } from '@app/components/whatsapp-toast/whatsapp-toast.component';
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
    WhatsAppToastModule,
    ObjectToArrayPipeModule,
    MathFloorPipeModule,
    MathCeilPipeModule,
    ReactiveFormsModule,
    ArrayFilterPipeModule,
    YTThumnailPipeModule,
    ObserveVisibilityDirectiveModule,  ],
  exports: [],
  providers: [
  ]
})
export class ProductModule { }
