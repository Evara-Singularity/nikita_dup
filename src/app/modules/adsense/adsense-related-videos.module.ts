import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RelatedVideosComponent } from './related-videos/related-videos.component';


@NgModule({
  declarations: [
    RelatedVideosComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    RelatedVideosComponent
  ]
})
export class AdsenseRelatedVideosModule { }
