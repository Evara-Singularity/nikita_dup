import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductResolver } from '@app/utils/resolvers/product.resolver';
import { ProductV1Component } from './product-v1.component';

const routes: Routes = [
  {
    path: '',
    component: ProductV1Component,
    runGuardsAndResolvers: 'always',
    resolve: {
      product: ProductResolver
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductV1RoutingModule { }
