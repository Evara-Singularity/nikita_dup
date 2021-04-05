import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrendingSearchComponent } from './trending-search.component';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        RouterModule
    ],
    exports: [
        TrendingSearchComponent
    ],
    declarations: [
        TrendingSearchComponent
    ],
    providers: []
})
export class TrendingSearchModule {}
