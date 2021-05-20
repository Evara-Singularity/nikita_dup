import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import CONSTANTS from '@app/config/constants';

@Component({
  selector: 'app-featured-category',
  templateUrl: './featured-category.component.html',
  styleUrls: ['./featured-category.component.scss']
})
export class FeaturedCategoryComponent implements OnInit {
  @Input('data') data;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL + CONSTANTS.ASSET_IMG ;
  constructor() { }

  ngOnInit() {
  }

}

@NgModule({
  declarations: [
    FeaturedCategoryComponent
  ],
  imports: [
      CommonModule,
      RouterModule,
  ],
})
export class FeaturedCategoryModule { }
