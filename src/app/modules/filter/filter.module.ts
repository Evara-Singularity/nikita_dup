import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router'
import { FilterComponent } from './filter.component';
import { ObjectToArrayPipeModule  } from '@app/utils/pipes/object-to-array.pipe';
import { FilterSearchBoxDirectiveModule } from '@app/utils/directives/filterSearchBox.directive';
import { CategoryModule } from '@app/modules/filter/category/category.module';
import { AddRupaySymbolPipeModule } from "./pipes/add-rupay-symbol";

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        CategoryModule,
        ObjectToArrayPipeModule,
        AddRupaySymbolPipeModule,
        FilterSearchBoxDirectiveModule,
    ],
    exports: [
        FilterComponent
    ],
    declarations: [
        FilterComponent
    ],
})
export class FilterModule { }
