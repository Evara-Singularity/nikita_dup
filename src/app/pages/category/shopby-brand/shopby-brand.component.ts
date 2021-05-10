import { Component, OnInit ,Input} from '@angular/core';
import { CONSTANTS } from '@app/config/constants';


@Component({
  selector: 'shopby-brand',
  templateUrl: './shopby-brand.component.html',
  styleUrls: []
})
export class ShopbyBrandComponent implements OnInit {

  @Input('brand_Data') brand_Data;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage;
  constructor() { }

  ngOnInit() {
    
  }

}
