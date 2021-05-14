import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutResolver } from 'src/app/utils/resolvers/layout.resolver';
import { MonsoonSaleComponent } from './monsoonSale.component';

const routes: Routes = [
  {
    path: '',
    component: MonsoonSaleComponent,
    resolve: {
      data: LayoutResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MonsoonSaleRoutingModule { }