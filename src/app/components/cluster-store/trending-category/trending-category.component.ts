import { Component, OnInit, Input } from '@angular/core';
import CONSTANTS from 'src/app/config/constants';

@Component({
  selector: 'app-trending-category',
  templateUrl: './trending-category.component.html',
  styleUrls: ['./trending-category.component.scss']
})
export class TrendingCategoryComponent implements OnInit {
  @Input('data') data;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL+'assets/img/home_card.webp';
  constructor() { }

  ngOnInit() {
  }

}
