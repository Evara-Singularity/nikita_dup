import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, NgModule, ViewChild } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PopUpModule } from '@app/modules/popUp/pop-up.module';
import { CONSTANTS } from '@config/constants';
import { PopUpComponent } from '@modules/popUp/pop-up.component';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@Component({
  selector: 'slp-sub-category',
  templateUrl: './slp-sub-category.component.html',
  styleUrls: ['./slp-sub-category.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
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

@NgModule({
  declarations: [
    SlpSubCategoryComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    PopUpModule,
    LazyLoadImageModule,
  ]
})
export class SlpSubCategoryModule { }
export class CategoryModule extends SlpSubCategoryModule { }