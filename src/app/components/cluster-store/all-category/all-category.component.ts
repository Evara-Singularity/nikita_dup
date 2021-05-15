import { CommonModule } from '@angular/common';
import { Input, NgModule } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { PopUpModule } from '@app/modules/popUp/pop-up.module';

@Component({
  selector: 'app-all-category',
  templateUrl: './all-category.component.html',
  styleUrls: ['./all-category.component.scss']
})
export class AllCategoryComponent implements OnInit {
  openPopup: boolean;
  @Input('data') data;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL+'assets/img/home_card.webp';
  constructor() { 
    this.openPopup = false;
  }

  ngOnInit() {
  }
  outData(data) {
    // console.log(data);
      if (Object.keys(data).indexOf('hide') !== -1) {
          this.openPopup = !data.hide;
      }
  }

}

@NgModule({
  declarations: [
    AllCategoryComponent
  ],
  imports: [
      CommonModule,
      RouterModule,
      PopUpModule
  ],
})
export class AllCategoryModule { }

