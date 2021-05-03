import { Component, OnInit, Input } from '@angular/core';
import CONSTANTS from 'src/app/config/constants';

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
