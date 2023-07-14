import { NgModule } from "@angular/core";
import { RectangleBannerComponent } from "./inline-rectangle-banner/rectangle-banner.component";
import { CommonModule } from "@angular/common";
import { ObserveVisibilityDirectiveModule } from "@app/utils/directives/observe-visibility.directive";

@NgModule({
  declarations: [RectangleBannerComponent],
  imports: [CommonModule, ObserveVisibilityDirectiveModule],
  exports: [RectangleBannerComponent],
})
export class AdsenseRectangleBannerModule {}
