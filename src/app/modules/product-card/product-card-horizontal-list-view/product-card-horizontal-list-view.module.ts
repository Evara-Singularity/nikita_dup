import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductCardHorizontalListViewComponent } from './product-card-horizontal-list-view.component';
import { ProductCardCoreModule } from '../product-card.core.module';
import { YTThumnailPipeModule, YTThumbnailPipe } from '@app/utils/pipes/ytthumbnail.pipe';

@NgModule({
  declarations: [ProductCardHorizontalListViewComponent],
  imports: [
    CommonModule,
    ProductCardCoreModule,
    YTThumnailPipeModule,
  ],
  exports: [
    ProductCardHorizontalListViewComponent
  ],
  providers:[
    YTThumbnailPipe,
  ]
})
export class ProductCardHorizontalListViewModule { }
