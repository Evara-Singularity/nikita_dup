import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductInfoComponent } from './product-info.component';
import { KeyFeaturesComponent } from './key-features/key-features.component';
import { SpecificationsComponent } from './specifications/specifications.component';
import { VideosComponent } from './videos/videos.component';
import { DetailsComponent } from './details/details.component';
import { ImagesComponent } from './images/images.component';
import { PopUpVariant2Module } from '../pop-up-variant2/pop-up-variant2.module';



@NgModule({
    declarations: [ProductInfoComponent, KeyFeaturesComponent, SpecificationsComponent, VideosComponent, DetailsComponent, ImagesComponent],
    imports: [
        CommonModule,
        PopUpVariant2Module,
    ],
    exports: [ProductInfoComponent, KeyFeaturesComponent, SpecificationsComponent, VideosComponent, DetailsComponent, ImagesComponent]
})
export class ProductInfoModule { }
