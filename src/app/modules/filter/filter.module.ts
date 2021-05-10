import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FilterComponent } from './filter.component';
import { FilterService } from './filter.service';
import { ObjectToArrayPipeModule  } from '@app/utils/pipes/object-to-array.pipe';
import { FilterSearchBoxDirectiveModule } from '@app/utils/directives/filterSearchBox.directive';
import {AddRupaySymbolPipeModule} from "./pipes/add-rupay-symbol";
import {SortByModule} from "../sortBy/sortBy.module";
import { CategoryModule } from './category/category.module';

@NgModule({
    imports: [CommonModule,
        RouterModule,
        CategoryModule,
        ObjectToArrayPipeModule,
        FilterSearchBoxDirectiveModule,
        AddRupaySymbolPipeModule,
        SortByModule
    ],
    exports: [FilterComponent],
    declarations: [FilterComponent],
    providers: [FilterService],
})
export class FilterModule { }
