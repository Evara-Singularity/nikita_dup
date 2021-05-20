import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryComponent } from './category.component';
import { RouterModule } from '@angular/router';
import { ApplyRemoveClassOnParentModule } from 'src/app/utils/directives/apply-remove-class-on-parent.directive';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        ApplyRemoveClassOnParentModule
    ],
    exports: [
        CategoryComponent
    ],
    declarations: [
        CategoryComponent
    ],
    providers: [
    ]
})
export class CategoryModule { }