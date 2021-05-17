import { CONSTANTS } from '@config/constants';
import { Component,Input,Inject, NgModule, ChangeDetectionStrategy } from '@angular/core';
import { PageScrollService } from 'ngx-page-scroll-core';
import { CommonModule, DOCUMENT } from "@angular/common";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'cat-static',
  templateUrl: './cat-static.component.html',
  styleUrls: ['./cat-static.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class CatStaticComponent {

  @Input('static_data') static_data;
  @Input('page_title') page_title ;
  imagePath = CONSTANTS.IMAGE_BASE_URL;

  constructor(@Inject(DOCUMENT) private _document,private _pageScrollService: PageScrollService) { }
  scrollToResults(){
    this._pageScrollService.scroll({
      document: this._document,
      scrollTarget: '#category-cards-section',
      scrollOffset: (<HTMLElement>document.querySelector("#category-cards-section")).offsetTop - 3770
    });
  }

}
@NgModule({
  declarations: [
    CatStaticComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
  ]
})
export class CatStaticModule { }
export class CategoryModule extends CatStaticModule { }