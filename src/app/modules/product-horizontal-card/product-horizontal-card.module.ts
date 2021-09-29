import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductHorizontalCardComponent } from './product-horizontal-card.component';
import { RatingPipeModule } from '@app/utils/pipes/rating.pipe';
import { YTThumnailPipeModule } from '@app/utils/pipes/ytthumbnail.pipe';
import { MathFloorPipeModule } from '@app/utils/pipes/math-floor';
import { EnhanceImgByNetworkDirectiveModule } from '@app/utils/directives/enhanceImgByNetwork.directive';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { EnhanceImgByNetworkPipeModule } from '@app/utils/pipes/enhanceImgByNetwork.pipe';

@NgModule({
  declarations: [ProductHorizontalCardComponent],
  imports: [
    CommonModule,
    RatingPipeModule,
    YTThumnailPipeModule,
    MathFloorPipeModule,
    EnhanceImgByNetworkDirectiveModule,
    LazyLoadImageModule,
    EnhanceImgByNetworkPipeModule
  ],
  exports: [
    ProductHorizontalCardComponent
  ]
})
export class ProductHorizontalCardModule { }
