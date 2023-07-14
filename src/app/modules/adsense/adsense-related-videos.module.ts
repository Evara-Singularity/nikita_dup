import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RelatedVideosComponent } from "./related-videos/related-videos.component";
import { YTThumnailPipeModule } from "../../utils/pipes/ytthumbnail.pipe";
import { ObserveVisibilityDirectiveModule } from "@app/utils/directives/observe-visibility.directive";

@NgModule({
  declarations: [RelatedVideosComponent],
  exports: [RelatedVideosComponent],
  imports: [
    CommonModule,
    YTThumnailPipeModule,
    ObserveVisibilityDirectiveModule,
  ],
})
export class AdsenseRelatedVideosModule {}
