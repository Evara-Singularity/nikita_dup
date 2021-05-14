import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AmazingDealsComponent } from './amazingDeals.component';
import { LayoutResolver } from 'src/app/utils/resolvers/layout.resolver';

const routes: Routes = [
  {
    path: '',
    component: AmazingDealsComponent,
    resolve: {
      data: LayoutResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AmazingDealsRoutingModule { }