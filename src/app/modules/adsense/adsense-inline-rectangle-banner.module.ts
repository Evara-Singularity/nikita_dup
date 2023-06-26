import { NgModule } from "@angular/core";
import { RectangleBannerComponent } from "./inline-rectangle-banner/rectangle-banner.component";
import { CommonModule } from "@angular/common";

@NgModule({
    declarations: [
        RectangleBannerComponent,
    ],
    imports: [
        CommonModule
    ],
    exports: [
        RectangleBannerComponent,
    ]
})
export class AdsenseRectangleBannerModule { }