import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { RecentlyViewedCarouselComponent } from './recentlyViewedCarousel.component';
import { RecentlyViewedCarouselService } from './recentlyViewedCarousel.service';
import { MathFloorPipeModule } from 'src/app/utils/pipes/math-floor';
import { PopUpModule } from 'src/app/modules/popUp/pop-up.module';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SiemaCarouselModule } from 'src/app/modules/siemaCarousel/siemaCarousel.module';
import { MathCeilPipeModule } from 'src/app/utils/pipes/math-ceil';
import { CharacterremovePipeModule } from 'src/app/utils/pipes/characterRemove.pipe';

@NgModule({
    imports: [MathFloorPipeModule,PopUpModule, CommonModule,RouterModule,CharacterremovePipeModule, LazyLoadImageModule, SiemaCarouselModule, MathCeilPipeModule],
    exports: [ RecentlyViewedCarouselComponent ],
    declarations: [ RecentlyViewedCarouselComponent ],
    providers: [ RecentlyViewedCarouselService ],
})
export class RecentlyViewedCarouselModule { }
