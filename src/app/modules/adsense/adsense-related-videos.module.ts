import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RelatedVideosComponent } from "./related-videos/related-videos.component";
import { YTThumnailPipeModule } from "../../utils/pipes/ytthumbnail.pipe";

@NgModule({
  declarations: [RelatedVideosComponent],
  exports: [RelatedVideosComponent],
  imports: [CommonModule, YTThumnailPipeModule],
})
export class AdsenseRelatedVideosModule {}
