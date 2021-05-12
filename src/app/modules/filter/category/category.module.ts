import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CategoryComponent } from './category.component';
import { ApplyRemoveClassOnParentModule} from '@app/utils/directives/apply-remove-class-on-parent.directive';
import { RouterModule } from '@angular/router';

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
})
export class CategoryModule {}

