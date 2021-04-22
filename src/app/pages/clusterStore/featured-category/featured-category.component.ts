import { Component, OnInit, Input } from '@angular/core';
import CONSTANTS from 'src/app/config/constants';

@Component({
  selector: 'app-featured-category',
  templateUrl: './featured-category.component.html',
  styleUrls: ['./featured-category.component.scss']
})
export class FeaturedCategoryComponent implements OnInit {
  @Input() data;
  imagePath = CONSTANTS.IMAGE_BASE_URL;
  defaultImage = CONSTANTS.IMAGE_BASE_URL+'assets/img/home_card.webp';
  constructor() { }

  ngOnInit() {
  }

}
