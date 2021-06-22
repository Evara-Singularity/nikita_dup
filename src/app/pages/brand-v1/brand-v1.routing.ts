import { Routes, RouterModule } from '@angular/router';
import { BrandV1Component } from "./brand-v1.component";
import { BrandV1Resolver } from '@app/utils/resolvers/brand-v1.resolver';
import { NgModule } from '@angular/core';

const routes: Routes = [
    {
        path: '',
        component: BrandV1Component,
        runGuardsAndResolvers: 'always',
        resolve: {
            brand: BrandV1Resolver
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
  })
  export class BrandV1RoutingModule { }
  