import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutResolver } from '@app/utils/resolvers/layout.resolver';
import { BestOfferComponent } from './bestOffer.component';

const routes: Routes = [
  {
    path: '',
    component: BestOfferComponent,
    resolve: {
      data: LayoutResolver
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BestOfferRoutingModule { }