import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CheckoutV1Component } from './checkout-v1.component';

const routes: Routes = [
  {
    path: '',
    component: CheckoutV1Component
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CheckoutV1RoutingModule { }
