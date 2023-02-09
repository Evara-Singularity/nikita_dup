import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductV1Resolver } from '@app/utils/resolvers/product-v1.resolver';
import { ProductComponent } from './product.component';

const routes: Routes = [
  {
    path: '',
    component: ProductComponent,
    runGuardsAndResolvers: 'always',
    resolve: {
      product: ProductV1Resolver
    },
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }
