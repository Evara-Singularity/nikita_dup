import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CategoryV1Resolver } from '@app/utils/resolvers/category-v1.resolver';
import { CategoryV1Component } from "./category-v1.component";

const routes: Routes = [
    {
        path: '',
        component: CategoryV1Component,
        runGuardsAndResolvers: 'always',
        resolve: {
            category: CategoryV1Resolver
        },

    }
];
@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class CategoryV1RoutingModule { }
