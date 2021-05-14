import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { routing as SearchRouting } from "./search.routing";
import { SearchComponent } from "./search.component";
import { SearchService } from "./search.service";
import { ProductListModule } from "@app/modules/productList/productList.module";
import { ObjectToArrayPipeModule } from "@app/utils/pipes/object-to-array.pipe";
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
    imports: [
        CommonModule,
        SearchRouting,
        NgxPaginationModule,
        ObjectToArrayPipeModule,
        ProductListModule,
        ObserveVisibilityDirectiveModule,
    ],
    declarations: [
        SearchComponent,
    ],
    providers: [
        SearchService,
    ]
})

export class SearchModule{}