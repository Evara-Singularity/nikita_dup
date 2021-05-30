import { CONSTANTS } from '@config/constants';
import { Component,Input,Inject, NgModule } from '@angular/core';
import { CommonModule, DOCUMENT } from "@angular/common";
import { RouterModule } from '@angular/router';
import { ClientUtility } from '@app/utils/client.utility';

@Component({
  selector: 'cat-static',
  templateUrl: './cat-static.component.html',
  styleUrls: ['./cat-static.component.scss']
})
export class CatStaticComponent {

  @Input('static_data') static_data;
  @Input('page_title') page_title ;
  imagePath = CONSTANTS.IMAGE_BASE_URL;

  constructor(@Inject(DOCUMENT) private _document) { }
  scrollToResults(){
    // this._pageScrollService.scroll({
    //   document: this._document,
    //   scrollTarget: '#category-cards-section',
    //   scrollOffset: (<HTMLElement>document.querySelector("#category-cards-section")).offsetTop - 3770
    // });
    let footerOffset = document.getElementById('#category-cards-section').offsetTop;
        ClientUtility.scrollToTop(1000,footerOffset - 30);
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