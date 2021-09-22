import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ProductComponent } from './product.component';
import { ProductRoutingModule } from './product-routing.module';
import { BreadcrumbNavModule } from '../../modules/breadcrumb-nav/breadcrumb-nav.module';
import { ObjectToArrayPipeModule } from '../../utils/pipes/object-to-array.pipe';
import { MathCeilPipeModule } from '../../utils/pipes/math-ceil';
import { MathFloorPipeModule } from '../../utils/pipes/math-floor';
import { YTThumnailPipeModule } from '../../utils/pipes/ytthumbnail.pipe';
import { ArrayFilterPipeModule } from '../../utils/pipes/k-array-filter.pipe';
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { SwipeDirectiveModule } from '@app/utils/directives/swipe.directive';
import { NgxSiemaService } from 'ngx-siema';
import { EnhanceImgByNetworkDirectiveModule } from '@app/utils/directives/enhanceImgByNetwork.directive';
import { WebpImageSupportCheckPipeModule } from '@app/utils/pipes/webpImageSupportCheck.pipe';
import { WhatsAppToastModule } from '@app/components/whatsapp-toast/whatsapp-toast.component';
@NgModule({
  declarations: [
    ProductComponent,
  ],
  imports: [
    ObserveVisibilityDirectiveModule,
    CommonModule,
    ProductRoutingModule,
    BreadcrumbNavModule,
    // pipes
    ObjectToArrayPipeModule,
    MathFloorPipeModule,
    MathCeilPipeModule,
    ReactiveFormsModule,
    ArrayFilterPipeModule,
    YTThumnailPipeModule,
    WhatsAppToastModule,
    // Directives
    EnhanceImgByNetworkDirectiveModule,
    WebpImageSupportCheckPipeModule,
    SwipeDirectiveModule
  ],
  exports: [],
  providers: [
    NgxSiemaService
  ]
})
export class ProductModule { }
