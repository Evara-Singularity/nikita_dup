import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutResolver } from '@app/utils/resolvers/layout.resolver';
import { SpecialComponent } from './special.component';

const routes: Routes = [
  {
    path: '',
    component: SpecialComponent,
    resolve: {
      data: LayoutResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SpecialOfferRoutingModule { }