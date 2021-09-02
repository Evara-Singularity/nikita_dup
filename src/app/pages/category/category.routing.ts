import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CategoryResolver } from '@app/utils/resolvers/category.resolver';
import { CategoryComponent } from "./category.component";

const routes: Routes = [
    {
        path: '',
        component: CategoryComponent,
        runGuardsAndResolvers: 'always',
        resolve: {
            category: CategoryResolver
        },

    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CategoryRoutingModule { }
