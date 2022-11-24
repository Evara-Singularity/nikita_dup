import { CommonModule } from '@angular/common';
import { Component, Input, NgModule, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { PopUpModule } from '@app/modules/popUp/pop-up.module';
import { ProductCardVerticalContainerModule } from '@app/modules/ui/product-card-vertical-container/product-card-vertical-container.module';
import { MathCeilPipeModule } from '@app/utils/pipes/math-ceil';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { HomePopupComponet } from '../home-popup/home.popup.component';

@Component({
  selector: 'informative_video',
  templateUrl: './informative_video.component.html',
  styleUrls: ['./informative_video.component.scss']
})
export class Informative_videoComponent implements OnInit {

  @Input() informativeVideosData:any;
  numberOfInformativeVideos:number=0

  constructor() { }

  ngOnInit() {
    this.numberOfInformativeVideos=5;
    }

}




@NgModule({
  imports: [
    CommonModule,   
    ProductCardVerticalContainerModule,
  ],
  declarations: [
    Informative_videoComponent
   ],
  exports: [
    Informative_videoComponent
  ],
  providers: []
})

export class Informative_videoModule { }