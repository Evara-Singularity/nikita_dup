import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home.routing';
import { AdBlockDirective } from './common/ad-block.directive';
import { LazyLoadImageModule } from 'ng-lazyload-image';
import { SiemaCarouselModule } from '../../modules/siemaCarousel/siemaCarousel.module';
import { ModalService } from '../../modules/modal/modal.service';
import { ObserveVisibilityDirectiveModule } from '../../utils/directives/observe-visibility.directive';
import { RecentlyViewedCarouselService } from '../../components/recentlyViewedCarousel/recentlyViewedCarousel.service';


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
        ModalService,
        RecentlyViewedCarouselService
    ]
})

export class HomeModule { }