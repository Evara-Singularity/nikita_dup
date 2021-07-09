import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { CmsWrapperComponent } from "./cms.component";
import { TextComponent } from "./components/text/text.component";
import { SmallImageComponent } from "./components/small-image/small-image.component";
import { ProductsDetailsComponent } from "./components/products-details/products-details.component";
import { MainBannerComponent } from "./components/main-banner/main-banner.component";
import { ImageTextComponent } from "./components/image-text/image-text.component";
import { FullImageComponent } from "./components/full-image/full-image.component";
import { DynamicImageComponent } from "./components/dynamic-image-component/dynamic-image.component";
import { NgxSiemaModule } from 'ngx-siema';
import { SiemaCarouselModule } from "../siemaCarousel/siemaCarousel.module";
import { CmsCarauselComponent } from "./components/cms-carausel/cms-carausel.component";

@NgModule({
    imports:[
        CommonModule,
        SiemaCarouselModule,
        NgxSiemaModule.forRoot()
    ],
    exports: [
        TextComponent,
        SmallImageComponent,
        CmsCarauselComponent,
        DynamicImageComponent,
        ProductsDetailsComponent,
        MainBannerComponent,
        FullImageComponent,
        ImageTextComponent,
        CmsWrapperComponent
    ],
    declarations: [
        TextComponent,
        SmallImageComponent,
        DynamicImageComponent,
        ProductsDetailsComponent,
        MainBannerComponent,
        CmsCarauselComponent,
        FullImageComponent,
        ImageTextComponent,
        CmsWrapperComponent
    ]
})

export class CmsModule {}
export class CategoryModule extends CmsModule {}