import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProductResolver } from '../../utils/resolvers/product/product-main.resolver';
import { ProductSectionResolver } from '../../utils/resolvers/product/product-section.resolver';
import { ProductComponent } from './product.component';

const routes: Routes = [
  {
    path: '',
    component: ProductComponent,
    resolve: {
      product: ProductResolver,
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductRoutingModule { }
