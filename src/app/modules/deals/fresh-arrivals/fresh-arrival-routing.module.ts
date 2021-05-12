import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutResolver } from 'src/app/utils/resolvers/layout.resolver';
import { FreshComponent } from './fresh.component';

const routes: Routes = [
  {
    path: '',
    component: FreshComponent,
    resolve: {
      data: LayoutResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FreshArrivalRoutingModule { }