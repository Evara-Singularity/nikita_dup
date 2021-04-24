import { Component, OnInit, Input, Inject } from '@angular/core';
import { PageScrollService } from 'ngx-page-scroll-core';
import { DOCUMENT } from "@angular/common";
import CONSTANTS from 'src/app/config/constants';

@Component({
  selector: 'cat-static',
  templateUrl: './cat-static.component.html',
  styleUrls: ['./cat-static.component.scss']
})
export class CatStaticComponent implements OnInit {

  @Input('static_data') static_data;
  @Input('page_title') page_title;
  imagePath = CONSTANTS.IMAGE_BASE_URL;

  constructor(@Inject(DOCUMENT) private _document, private _pageScrollService: PageScrollService) { }

  ngOnInit() {
  }

  scrollToResults() {
    this._pageScrollService.scroll({
      document: this._document,
      scrollTarget: '#category-cards-section',
      scrollOffset: (<HTMLElement>document.querySelector("#category-cards-section")).offsetTop - 3770
    });
  }
}
