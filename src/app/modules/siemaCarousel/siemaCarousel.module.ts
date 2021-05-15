import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { NgxSiemaModule } from 'ngx-siema';
import { SiemaCarouselComponent } from './siemaCarousel.component';
import { RouterModule } from '@angular/router';
import { SiemaSlideComponent } from './siemaSlide.component';
import { YTThumnailPipeModule } from '../../utils/pipes/ytthumbnail.pipe';
import { MathFloorPipeModule } from '../../utils/pipes/math-floor';
import { MathCeilPipeModule } from '@app/utils/pipes/math-ceil';
import { ModalService } from '../modal/modal.service';

@NgModule({
    imports: [
        MathCeilPipeModule,
        MathFloorPipeModule,
        RouterModule,
        CommonModule,
        NgxSiemaModule.forRoot(),
        YTThumnailPipeModule
    ],
    exports: [SiemaCarouselComponent],
    entryComponents: [SiemaSlideComponent],
    declarations: [SiemaCarouselComponent, SiemaSlideComponent],
    providers: [ModalService]
})
export class SiemaCarouselModule { }
