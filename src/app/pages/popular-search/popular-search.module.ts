import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { PopularSearchRoutingModule } from './popular-search-routing.module';
import { PopularSearchComponent } from './popular-search/popular-search.component';

@NgModule({
    declarations: [PopularSearchComponent],
    imports: [
        CommonModule,
        PopularSearchRoutingModule
    ]
})
export class PopularSearchModule { }
