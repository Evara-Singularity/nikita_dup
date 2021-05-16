import { Component, OnInit ,Input} from '@angular/core';
import { CONSTANTS } from '@config/constants';

@Component({
  selector: 'shopby-brand',
  templateUrl: './shopby-brand.component.html',
  styleUrls: ['./shopby-brand.component.scss']
})
export class ShopbyBrandComponent {
  defaultImage;
  @Input('brand_Data') brand_Data;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
}
