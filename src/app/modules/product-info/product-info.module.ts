import { MathFloorPipeModule } from './../../utils/pipes/math-floor';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProductInfoComponent } from './product-info.component';
import { KeyFeaturesComponent } from './key-features/key-features.component';
import { SpecificationsComponent } from './specifications/specifications.component';
import { VideosComponent } from './videos/videos.component';
import { DetailsComponent } from './details/details.component';
import { ImagesComponent } from './images/images.component';
import { PopUpModule } from '../popUp/pop-up.module';
import { YTThumnailPipeModule } from '@app/utils/pipes/ytthumbnail.pipe';
import { ObjectToArrayPipeModule } from '@app/utils/pipes/object-to-array.pipe';
import { NgxSiemaModule } from 'ngx-siema';
import { LoginPopupModule } from '../login-popup/login-popup.module';
import { ObserveVisibilityDirectiveModule } from '../../utils/directives/observe-visibility.directive';
import { PopUpVariant2Module } from '../pop-up-variant2/pop-up-variant2.module';



@NgModule({
    declarations: [ProductInfoComponent, KeyFeaturesComponent, SpecificationsComponent, VideosComponent, DetailsComponent, ImagesComponent],
    imports: [
        CommonModule,
        RouterModule,
        PopUpModule,
        YTThumnailPipeModule,
        ObjectToArrayPipeModule,
        MathFloorPipeModule,
        NgxSiemaModule,
        LoginPopupModule,
        ObserveVisibilityDirectiveModule,
        PopUpVariant2Module
    ],
    exports: [ProductInfoComponent, KeyFeaturesComponent, SpecificationsComponent, VideosComponent, DetailsComponent, ImagesComponent]
})
export class ProductInfoModule { }
