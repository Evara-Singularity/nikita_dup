import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PopUpModule } from '@app/modules/popUp/pop-up.module';
import { CONSTANTS } from '@config/constants';
import { PopUpComponent } from '@modules/popUp/pop-up.component';
import { LazyLoadImageModule } from 'ng-lazyload-image';




@Component({
  selector: 'slp-sub-category',
  templateUrl: './slp-sub-category.component.html',
  styleUrls: ['./slp-sub-category.component.scss']
})
export class SlpSubCategoryComponent {
  @Input('sub_category_Data') sub_category_Data;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL + CONSTANTS.ASSET_IMG;
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

@NgModule({
  declarations: [
    SlpSubCategoryComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    PopUpModule,
    LazyLoadImageModule,
  ],
  exports:[
    SlpSubCategoryComponent
  ]
})
export class SlpSubCategoryModule { }
export class CategoryModule extends SlpSubCategoryModule { }