import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home.routing';
import { AdBlockDirective } from './common/ad-block.directive';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SiemaCarouselModule } from 'src/app/modules/siemaCarousel/siemaCarousel.module';
import { ModalService } from 'src/app/modules/modal/modal.service';
import { ObserveVisibilityDirectiveModule } from 'src/app/utils/directives/observe-visibility.directive';


@NgModule({
    imports: [
        CommonModule,
        HomeRoutingModule,
        SiemaCarouselModule,
        LazyLoadImageModule,
        ObserveVisibilityDirectiveModule
    ],
    declarations: [
        HomeComponent,
        AdBlockDirective,
    ],
    providers: [
        ModalService
    ]
})

export class HomeModule { }