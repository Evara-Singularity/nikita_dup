import { CommonModule } from '@angular/common';
import { Component, OnInit ,Input, NgModule, ChangeDetectionStrategy} from '@angular/core';
import { RouterModule } from '@angular/router';
import { CONSTANTS } from '@config/constants';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@Component({
  selector: 'shopby-brand',
  templateUrl: './shopby-brand.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ShopbyBrandComponent {
  defaultImage;
  @Input('brand_Data') brand_Data;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
}


@NgModule({
  declarations: [
    ShopbyBrandComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    LazyLoadImageModule,
  ]
})
export class ShopbyBrandModule { }
export class CategoryModule extends ShopbyBrandModule { }