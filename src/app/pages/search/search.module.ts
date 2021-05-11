import {NgModule} from '@angular/core';
import {CommonModule} from "@angular/common";
import {routing} from "./search.routing";
import {SearchComponent} from "./search.component";
import {SearchService} from "./search.service";
import {ProductListModule} from "@app/modules/productList/productList.module";
import { ObjectToArrayPipeModule } from "@app/utils/pipes/object-to-array.pipe";
// import { PageSizeModule } from "@app/modules/pageSize/pageSize.module";
import { SortByModule } from "@app/modules/sortBy/sortBy.module";
import { FilterModule } from "@app/modules/filter/filter.module";
import { PaginationModule } from "@app/modules/pagination/pagination.module";
import { LoaderModule } from "@app/modules/loader/loader.module";

@NgModule({
    imports: [
        CommonModule,
        routing,
        ObjectToArrayPipeModule,
        FilterModule,
        ProductListModule,
        PaginationModule,
        // PageSizeModule,
        SortByModule,
        LoaderModule
    ],
    declarations: [
        SearchComponent,
    ],
    providers: [
        SearchService,
    ]
})

export class SearchModule{}