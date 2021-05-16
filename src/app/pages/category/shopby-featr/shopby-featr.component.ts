import { Component, OnInit, Input} from '@angular/core';
import { CONSTANTS } from '@config/constants';


@Component({
  selector: 'shopby-featr',
  templateUrl: './shopby-featr.component.html',
  styleUrls: ['./shopby-featr.component.scss']
})
export class ShopbyFeatrComponent {

  @Input('shopBy_Data') shopBy_Data;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL+'assets/img/home_card.webp';
  
}
