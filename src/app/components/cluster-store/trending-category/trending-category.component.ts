import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'app-trending-category',
  templateUrl: './trending-category.component.html',
  styleUrls: ['./trending-category.component.scss']
})
export class TrendingCategoryComponent implements OnInit {
  @Input('data') data;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL + CONSTANTS.ASSET_IMG;

  ngOnInit() {
    console.log('data', this.data);
  }

}

@NgModule({
  declarations: [
    TrendingCategoryComponent
  ],
  imports: [
      CommonModule,
      RouterModule
  ],
})
export class TrendingCategoryModule { }
