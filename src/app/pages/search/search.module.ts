import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { SortByModule } from "@components/sortBy/sortBy.module";
import { SearchComponent } from "@pages/search/search.component";
import { ObjectToArrayPipeModule } from "@pipes/object-to-array.pipe";
import { routing as SearchRouting } from "@pages/search/search.routing";
import { ProductListModule } from "@modules/productList/productList.module";
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
    imports: [
        CommonModule,
        SearchRouting,
        ObjectToArrayPipeModule,
        ProductListModule,
        NgxPaginationModule,
        SortByModule,
        ObserveVisibilityDirectiveModule,
    ],
    declarations: [
        SearchComponent,
    ],
})

export class SearchModule { }