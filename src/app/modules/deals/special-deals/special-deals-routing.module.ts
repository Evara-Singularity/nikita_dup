import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutResolver } from 'src/app/utils/resolvers/layout.resolver';
import { SpecialDealsComponent } from './specialDeals.component';

const routes: Routes = [{
  path: '',
  component: SpecialDealsComponent,
  resolve: {
    data: LayoutResolver
  }
}];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpecialDealsRoutingModule { }