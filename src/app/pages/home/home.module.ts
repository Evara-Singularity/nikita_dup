import { NgModule } from '@angular/core';
import { HomeComponent } from './home.component';
import { CommonModule } from '@angular/common';
import { HomeRoutingModule } from './home.routing';
import { SiemaCarouselModule } from '@modules/siemaCarousel/siemaCarousel.module';
import { ObserveVisibilityDirectiveModule } from '../../utils/directives/observe-visibility.directive';
import { LazyLoadImageModule } from 'ng-lazyload-image';

@NgModule({
    imports: [
        CommonModule,
        HomeRoutingModule,
        SiemaCarouselModule,
        ObserveVisibilityDirectiveModule,
        LazyLoadImageModule,
    ],
    declarations: [
        HomeComponent,
    ],
    providers: []
})

export class HomeModule { }