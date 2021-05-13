import { NgModule } from '@angular/core';
import { CommonModule } from "@angular/common";
import { routing } from "./search.routing";
import { SearchComponent } from "./search.component";
import { SearchService } from "./search.service";
import { ProductListModule } from "@app/modules/productList/productList.module";
import { ObjectToArrayPipeModule } from "@app/utils/pipes/object-to-array.pipe";
import { LoaderModule } from "@app/modules/loader/loader.module";
import { ObserveVisibilityDirectiveModule } from '@app/utils/directives/observe-visibility.directive';
import { NgxPaginationModule } from 'ngx-pagination';

@NgModule({
    imports: [
        CommonModule,
        routing,
        NgxPaginationModule,
        ObjectToArrayPipeModule,
        ProductListModule,
        ObserveVisibilityDirectiveModule,
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