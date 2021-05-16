import { Component, Input, ViewChild } from '@angular/core';
import { CONSTANTS } from '@config/constants';
import { PopUpComponent } from '@modules/popUp/pop-up.component';




@Component({
  selector: 'slp-sub-category',
  templateUrl: './slp-sub-category.component.html',
  styleUrls: ['./slp-sub-category.component.scss']
})
export class SlpSubCategoryComponent {
  @Input('sub_category_Data') sub_category_Data;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL + 'assets/img/home_card.webp';
  baseURL = CONSTANTS.PROD;
  openPopup: boolean;
  @ViewChild(PopUpComponent) _popupComponent: PopUpComponent;

  constructor() {
    this.openPopup = false;
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
