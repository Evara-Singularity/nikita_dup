import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchHistoryComponent } from './search-history.component';
import { RouterModule } from '@angular/router';

@NgModule({
    imports: [
        CommonModule,
        RouterModule
    ],
    exports: [
        SearchHistoryComponent
    ],
    declarations: [
        SearchHistoryComponent
    ],
    providers: []
})
export class SearchHistoryModule {}
