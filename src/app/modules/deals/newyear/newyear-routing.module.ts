import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutResolver } from 'src/app/utils/resolvers/layout.resolver';
import { NewYearComponent } from './newyear.component';

const routes: Routes = [
  {
    path: '',
    component: NewYearComponent,
    resolve: {
      data: LayoutResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewyearRoutingModule { }