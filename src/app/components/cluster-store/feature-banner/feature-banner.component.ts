import { CommonModule } from '@angular/common';
import { Component, OnInit, Input, NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import CONSTANTS from '@app/config/constants';
import { LazyLoadImageModule } from 'ng-lazyload-image';


@Component({
  selector: 'app-feature-banner',
  templateUrl: './feature-banner.component.html',
  styleUrls: ['./feature-banner.component.scss']
})
export class FeatureBannerComponent implements OnInit {
  @Input('data') data;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL+'assets/img/home_card.webp';
  constructor() { }

  ngOnInit() {
  }

}

@NgModule({
  declarations: [
    FeatureBannerComponent
  ],
  imports: [
      CommonModule,
      RouterModule,
      LazyLoadImageModule
  ],
})
export class FeatureBannerModule { }
