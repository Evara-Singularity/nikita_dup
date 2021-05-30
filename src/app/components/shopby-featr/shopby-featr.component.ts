import { CommonModule } from '@angular/common';
import { Component, Input, NgModule} from '@angular/core';
import { CONSTANTS } from '@config/constants';
import { LazyLoadImageModule } from 'ng-lazyload-image';



@Component({
  selector: 'shopby-featr',
  templateUrl: './shopby-featr.component.html',
  styleUrls: ['./shopby-featr.component.scss']
})
export class ShopbyFeatrComponent {

  @Input('shopBy_Data') shopBy_Data;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL + CONSTANTS.ASSET_IMG;
  
}

@NgModule({
  declarations: [
    ShopbyFeatrComponent
  ],
  imports: [
    CommonModule,
    LazyLoadImageModule,
  ]
})
export class ShopbyFeatrModule { }
export class CategoryModule extends ShopbyFeatrModule { }