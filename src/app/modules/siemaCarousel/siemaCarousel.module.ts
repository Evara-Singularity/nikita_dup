import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxSiemaModule } from 'ngx-siema';
import { SiemaCarouselComponent } from './siemaCarousel.component';
import { RouterModule } from '@angular/router';
import { SiemaSlideComponent } from './siemaSlide.component';
import { YTThumnailPipeModule } from '../../utils/pipes/ytthumbnail.pipe';
import { MathFloorPipeModule } from '../../utils/pipes/math-floor';
import { MathCeilPipeModule } from '@app/utils/pipes/math-ceil';

@NgModule({
    imports: [
        MathCeilPipeModule,
        MathFloorPipeModule,
        RouterModule,
        CommonModule, 
        NgxSiemaModule.forRoot(), 
        //LazyLoadImageModule,
        YTThumnailPipeModule
    ],
    exports: [SiemaCarouselComponent],
    entryComponents: [SiemaSlideComponent],
    declarations: [SiemaCarouselComponent, SiemaSlideComponent],
})

export class SiemaCarouselModule{}
