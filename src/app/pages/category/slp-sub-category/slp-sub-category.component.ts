import { Component, OnInit, Input, ViewChild } from '@angular/core';
import { CONSTANTS } from '@app/config/constants';
import { PopUpComponent } from '@app/modules/popUp/pop-up.component';

@Component({
  selector: 'slp-sub-category',
  templateUrl: './slp-sub-category.component.html',
  styleUrls: ['./slp-sub-category.component.scss']
})
export class SlpSubCategoryComponent implements OnInit {

  @Input('sub_category_Data') sub_category_Data;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL + 'assets/img/home_card.webp';
  baseURL = CONSTANTS.PROD;
  openPopup: boolean;
  @ViewChild(PopUpComponent) _popupComponent: PopUpComponent;

  constructor() {
    this.openPopup = false;
  }

  ngOnInit() {

  }

  outData(data) {
    if (Object.keys(data).indexOf('hide') !== -1) {
      this.openPopup = !data.hide;
    }
  }

  customClose() {
    this._popupComponent.closePopup();
  }

}
