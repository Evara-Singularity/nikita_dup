import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

import { FilterComponent } from './filter.component';
import { FilterService } from './filter.service';
import { CategoryModule } from './category/category.module';
import { FilterSearchBoxDirectiveModule } from 'src/app/utils/directives/filterSearchBox.directive';

@NgModule({
    imports: [CommonModule,
        RouterModule,
        CategoryModule,
        FilterSearchBoxDirectiveModule,
    ],
    exports: [FilterComponent],
    declarations: [FilterComponent],
    providers: [FilterService],
})
export class FilterModule { }